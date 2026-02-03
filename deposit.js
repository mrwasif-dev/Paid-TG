const { Markup } = require('telegraf');
const { 
    users, 
    saveUsers 
} = require('./database.js');
const { 
    getCurrentDateTime,
    generateDepositId,
    isValidAmount,
    checkDailyDepositLimit,
    updateDailyDeposit,
    formatCurrency
} = require('./utils.js');
const { 
    sessions, 
    updateSession,
    clearSessionFlow 
} = require('./sessions.js');
const { 
    DEPOSIT_MESSAGES,
    ERROR_MESSAGES 
} = require('./messages.js');
const { 
    depositMethodKeyboard,
    depositConfirmationKeyboard,
    backToMenuButton 
} = require('./keyboards.js');
const { ADMIN_ID, LIMITS } = require('./config.js');

// ======= DEPOSIT HANDLERS =======
async function handleDepositBalance(ctx) {
    const session = sessions[ctx.chat.id];
    if (!session || !session.usernameKey) {
        return ctx.reply(ERROR_MESSAGES.NOT_LOGGED_IN);
    }

    const user = users[session.usernameKey];
    
    // Check if user is banned
    if (user.isBanned) {
        return ctx.reply(
            '🚫 Account Suspended 🚫\n\nYour account has been suspended by admin.\n\n📞 Please contact support for assistance:\n@help_paid_whatsapp_bot',
            Markup.inlineKeyboard([
                [Markup.button.callback('📞 Contact Support', 'contactSupport')]
            ])
        );
    }

    // Check for existing pending deposit
    if (user.pendingDeposits && user.pendingDeposits.length > 0) {
        const pending = user.pendingDeposits[0];
        return ctx.reply(
            `⚠️ Pending Deposit Exists ⚠️\n\n📝 You already have a pending deposit request.\n\n💡 Please wait for your current request to be processed:\n\n📥 Pending Deposit:\n• Amount: ${formatCurrency(pending.amount)}\n• Method: ${pending.method}\n• Status: ${pending.status || 'Pending'}\n\n⏰ Processing Time:\n• Usually within 15-30 minutes\n• You will be notified once processed\n\n📞 Need help? Contact support.`,
            Markup.inlineKeyboard([
                [Markup.button.callback('📋 Check Pending Requests', 'viewPendingRequests')],
                [Markup.button.callback('💰 Check Balance', 'checkBalance')],
                [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
            ])
        );
    }

    updateSession(ctx.chat.id, { flow: 'deposit', step: null });

    await ctx.reply(
        DEPOSIT_MESSAGES.MAIN_MENU(user.balance || 0),
        depositMethodKeyboard
    );
}

async function handleDepositMethod(ctx, method) {
    const session = sessions[ctx.chat.id];
    if (!session || !session.usernameKey) {
        return ctx.reply(ERROR_MESSAGES.NOT_LOGGED_IN);
    }

    const user = users[session.usernameKey];
    
    // Check if user is banned
    if (user.isBanned) {
        return ctx.reply(
            '🚫 Account Suspended 🚫\n\nYour account has been suspended by admin.\n\n📞 Please contact support for assistance:\n@help_paid_whatsapp_bot',
            Markup.inlineKeyboard([
                [Markup.button.callback('📞 Contact Support', 'contactSupport')]
            ])
        );
    }

    const accountType = method === 'UPaisa' ? 'U-Paisa' : method;
    updateSession(ctx.chat.id, { 
        depositMethod: method, 
        flow: 'deposit', 
        step: 'enterAmount' 
    });

    await ctx.reply(
        DEPOSIT_MESSAGES.METHOD_SELECTED(method, accountType, user.balance || 0),
        backToMenuButton
    );
}

async function handleDepositText(ctx) {
    const chatId = ctx.chat.id;
    const text = ctx.message.text.trim();
    const session = sessions[chatId];
    if (!session || session.flow !== 'deposit') return;

    const user = users[session.usernameKey];
    
    if (session.step === 'enterAmount') {
        const amount = parseInt(text);
        const validation = isValidAmount(amount, 'deposit');
        
        if (!validation.valid) {
            return ctx.reply(validation.error);
        }

        // Check daily limits
        const limitCheck = checkDailyDepositLimit(user, amount);
        if (!limitCheck.allowed) {
            return ctx.reply(limitCheck.error);
        }

        updateSession(chatId, { 
            depositAmount: amount,
            step: 'enterProof' 
        });
        
        return ctx.reply(DEPOSIT_MESSAGES.ENTER_PROOF(amount, session.depositMethod));
    }

    if (session.step === 'enterProof') {
        const proofText = text.trim();
        
        if (!proofText || proofText.length < 5) {
            return ctx.reply('❌ Invalid Transaction ID ❌\n\n📝 Transaction ID must be at least 5 characters.\n\n📌 Please enter a valid Transaction ID:\n\n💡 Example: TXN1234567890\n\n🔄 Try again:');
        }

        if (proofText.length > 100) {
            return ctx.reply('❌ Transaction ID Too Long ❌\n\n📝 Transaction ID must be 100 characters or less.\n\n📝 Please shorten your Transaction ID:\n\n🔄 Enter again:');
        }

        updateSession(chatId, { depositProof: proofText });
        
        return ctx.reply(
            DEPOSIT_MESSAGES.CONFIRMATION(session),
            depositConfirmationKeyboard
        );
    }
}

async function handleConfirmDeposit(ctx) {
    const chatId = ctx.chat.id;
    const session = sessions[chatId];
    if (!session || !session.usernameKey) {
        return ctx.answerCbQuery(ERROR_MESSAGES.SESSION_EXPIRED);
    }

    const user = users[session.usernameKey];
    
    // Check if user is banned
    if (user.isBanned) {
        return ctx.answerCbQuery('🚫 Account suspended by admin.', { show_alert: true });
    }
    
    // Verify no pending deposit exists
    if (user.pendingDeposits && user.pendingDeposits.length > 0) {
        return ctx.answerCbQuery('⚠️ You already have a pending deposit request. Please wait for it to be processed.', { show_alert: true });
    }
    
    const requestKey = `deposit_${session.depositAmount}_${session.depositProof}`;
    if (user.processedRequests && user.processedRequests[requestKey]) {
        return ctx.answerCbQuery('📝 This request has already been submitted.', { show_alert: true });
    }

    try {
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch (e) {
        console.log('Could not update message:', e.message);
    }

    const { date, time } = getCurrentDateTime();
    
    const bonus = Math.floor(session.depositAmount * 0.02);
    const totalAmount = session.depositAmount + bonus;
    
    const depositId = generateDepositId();
    
    // Update daily limits
    updateDailyDeposit(user, session.depositAmount);
    
    // Add to pending deposits
    if (!user.pendingDeposits) user.pendingDeposits = [];
    user.pendingDeposits.push({
        id: depositId,
        amount: session.depositAmount,
        bonus: bonus,
        totalAmount: totalAmount,
        method: session.depositMethod,
        proof: session.depositProof,
        date: date,
        time: time,
        status: 'pending'
    });

    if (!user.processedRequests) user.processedRequests = {};
    user.processedRequests[requestKey] = true;
    
    saveUsers();
    
    // Send notification to admin (you'll need bot instance)
    const adminMsg = `
💰 NEW DEPOSIT REQUEST 💰

👤 User Information:
• Name: ${user.firstName}
• Username: ${session.usernameKey}
• Phone: ${user.phone}

💵 Transaction Details:
• Amount: ${session.depositAmount} PKR
• Bonus (2%): ${bonus} PKR 🎁
• Total: ${totalAmount} PKR 💰
• Method: ${session.depositMethod}
• Transaction ID: ${session.depositProof}

📅 Request Details:
• Date: ${date}
• Time: ${time}
• Request ID: ${depositId}

📊 Daily Statistics:
• Today's Deposits: ${user.dailyDeposits.count}/5
• Today's Amount: ${user.dailyDeposits.amount}/20,000 PKR
    `;
    
    // await bot.telegram.sendMessage(
    //     ADMIN_ID,
    //     adminMsg,
    //     Markup.inlineKeyboard([
    //         [Markup.button.callback('✅ Approve Deposit', `admin_approve_deposit_${chatId}_${depositId}`)],
    //         [Markup.button.callback('❌ Reject Request', `admin_reject_deposit_${chatId}_${depositId}`)]
    //     ])
    // );
    
    await ctx.reply(
        DEPOSIT_MESSAGES.SUCCESS({
            amount: session.depositAmount,
            bonus: bonus,
            totalAmount: totalAmount,
            method: session.depositMethod,
            proof: session.depositProof,
            id: depositId
        })
    );
    
    clearSessionFlow(chatId);
    delete session.depositAmount;
    delete session.depositMethod;
    delete session.depositProof;
}

// ======= ADMIN DEPOSIT APPROVAL =======
async function handleApproveDeposit(bot, chatId, depositId) {
    const session = sessions[chatId];
    if (!session || !session.usernameKey) {
        return { success: false, message: '👤 User not found.' };
    }

    const user = users[session.usernameKey];
    if (!user.pendingDeposits) {
        return { success: false, message: '📥 No pending deposits.' };
    }

    const depositIndex = user.pendingDeposits.findIndex(d => d.id === depositId);
    if (depositIndex === -1) {
        return { success: false, message: '✅ Deposit already processed.' };
    }

    const deposit = user.pendingDeposits[depositIndex];
    const { date, time } = getCurrentDateTime();

    const oldBalance = user.balance || 0;
    user.balance += deposit.totalAmount;
    
    if (!user.transactions) user.transactions = [];
    user.transactions.push({
        type: `📥 Deposit ✅ (${deposit.method})`,
        amount: deposit.amount,
        bonus: deposit.bonus,
        totalAmount: deposit.totalAmount,
        date: date,
        time: time,
        proof: deposit.proof,
        status: 'approved'
    });

    saveUsers();

    // Notify user
    await bot.telegram.sendMessage(
        chatId,
        DEPOSIT_MESSAGES.APPROVED({
            amount: deposit.amount,
            bonus: deposit.bonus,
            totalAmount: deposit.totalAmount,
            method: deposit.method,
            proof: deposit.proof,
            date: date,
            time: time,
            oldBalance: oldBalance,
            newBalance: user.balance
        })
    );

    // Remove from pending
    user.pendingDeposits.splice(depositIndex, 1);
    saveUsers();

    return {
        success: true,
        message: `✅ Deposit Approved Successfully ✅\n\n👤 User: ${user.firstName}\n💰 Amount: ${deposit.amount} PKR\n🎁 Bonus: ${deposit.bonus} PKR\n💵 Total: ${deposit.totalAmount} PKR\n🏦 Method: ${deposit.method}\n\n📊 User Balance Updated: ${user.balance} PKR`
    };
}

async function handleRejectDeposit(bot, chatId, depositId, reason) {
    const session = sessions[chatId];
    if (!session || !session.usernameKey) {
        return { success: false, message: '👤 User not found.' };
    }

    const user = users[session.usernameKey];
    if (!user.pendingDeposits) {
        return { success: false, message: '📥 No pending deposits.' };
    }

    const depositIndex = user.pendingDeposits.findIndex(d => d.id === depositId);
    if (depositIndex === -1) {
        return { success: false, message: '✅ Deposit already processed.' };
    }

    const deposit = user.pendingDeposits[depositIndex];
    const { date, time } = getCurrentDateTime();

    // Update daily deposits count
    if (user.dailyDeposits) {
        user.dailyDeposits.count = Math.max(0, user.dailyDeposits.count - 1);
        user.dailyDeposits.amount = Math.max(0, user.dailyDeposits.amount - deposit.amount);
    }

    if (!user.transactions) user.transactions = [];
    user.transactions.push({
        type: `📥 Deposit Request ❌ (Rejected)`,
        amount: deposit.amount,
        date: date,
        time: time,
        proof: deposit.proof,
        status: 'rejected',
        rejectionReason: reason
    });

    // Notify user
    await bot.telegram.sendMessage(
        chatId,
        DEPOSIT_MESSAGES.REJECTED({
            amount: deposit.amount,
            method: deposit.method,
            proof: deposit.proof,
            date: date,
            time: time
        }, reason)
    );

    // Remove from pending
    user.pendingDeposits.splice(depositIndex, 1);
    saveUsers();

    return {
        success: true,
        message: `❌ Deposit Request Rejected ❌\n\n👤 User: ${user.firstName}\n💰 Amount: ${deposit.amount} PKR\n🏦 Method: ${deposit.method}\n📝 Transaction ID: ${deposit.proof}\n\n📋 Rejection Reason:\n${reason}`
    };
}

module.exports = {
    handleDepositBalance,
    handleDepositMethod,
    handleDepositText,
    handleConfirmDeposit,
    handleApproveDeposit,
    handleRejectDeposit
};
