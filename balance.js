const { Markup } = require('telegraf');
const { users } = require('./database.js');
const { 
    getCurrentDateTime,
    formatCurrency 
} = require('./utils.js');
const { sessions } = require('./sessions.js');
const { 
    BALANCE_MESSAGES,
    ERROR_MESSAGES 
} = require('./messages.js');
const { 
    transactionHistoryKeyboard,
    pendingRequestsKeyboard,
    backToMenuButton 
} = require('./keyboards.js');

// ======= BALANCE HANDLERS =======
async function handleCheckBalance(ctx) {
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

    const balanceMessage = BALANCE_MESSAGES.SUMMARY(user);
    
    return ctx.reply(
        balanceMessage,
        Markup.inlineKeyboard([
            [Markup.button.callback('📜 View Full Transaction History', 'viewTransactions')],
            [Markup.button.callback('📋 Check Pending Requests', 'viewPendingRequests')],
            [Markup.button.callback('📥 Deposit Funds', 'depositBalance')],
            [Markup.button.callback('📤 Withdraw Funds', 'withdrawBalance')],
            [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
        ])
    );
}

async function handleViewPendingRequests(ctx) {
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

    let message = '⏳ Pending Requests Overview ⏳\n\n';
    
    let hasPending = false;
    
    if (user.pendingDeposits && user.pendingDeposits.length > 0) {
        hasPending = true;
        message += '📥 Pending Deposits:\n';
        user.pendingDeposits.forEach((d, i) => {
            message += `${i + 1}. ${formatCurrency(d.amount)} via ${d.method}\n`;
            message += `   📅 Date: ${d.date}\n`;
            message += `   ⏰ Time: ${d.time}\n`;
            message += `   🔑 ID: ${d.id}\n`;
            message += `   📊 Status: ${d.status || '🔄 Pending'}\n\n`;
        });
    } else {
        message += '📥 Pending Deposits:\n';
        message += '   ✅ No pending deposits\n\n';
    }
    
    if (user.pendingWithdrawals && user.pendingWithdrawals.length > 0) {
        hasPending = true;
        message += '📤 Pending Withdrawals:\n';
        user.pendingWithdrawals.forEach((w, i) => {
            message += `${i + 1}. ${formatCurrency(w.amount)} to ${w.account}\n`;
            message += `   📅 Date: ${w.date}\n`;
            message += `   ⏰ Time: ${w.time}\n`;
            message += `   🔑 ID: ${w.id}\n`;
            message += `   📊 Status: ${w.status || '🔄 Pending'}\n\n`;
        });
    } else {
        message += '📤 Pending Withdrawals:\n';
        message += '   ✅ No pending withdrawals\n\n';
    }
    
    if (user.pendingPlanRequests && user.pendingPlanRequests.length > 0) {
        hasPending = true;
        message += '📦 Pending Plan Requests:\n';
        user.pendingPlanRequests.forEach((p, i) => {
            message += `${i + 1}. ${p.planName}\n`;
            message += `   💰 Price: ${formatCurrency(p.price)}\n`;
            message += `   📅 Date: ${p.date}\n`;
            message += `   ⏰ Time: ${p.time}\n`;
            message += `   🔑 ID: ${p.id}\n`;
            message += `   📊 Status: ${p.status || '🔄 Pending'}\n\n`;
        });
    } else {
        message += '📦 Pending Plan Requests:\n';
        message += '   ✅ No pending plan requests\n\n';
    }
    
    if (!hasPending) {
        message = '✅ All Clear! ✅\n\n🎉 You have no pending requests.\n📊 All your transactions are processed.\n\n💡 Ready for your next transaction?';
    }

    return ctx.reply(
        message,
        pendingRequestsKeyboard
    );
}

async function handleViewTransactions(ctx) {
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

    if (!user.transactions || user.transactions.length === 0) {
        return ctx.reply(
            '📊 Transaction History 📊\n\n📭 No transactions found.\n\n💡 Start your journey:\nMake your first deposit or purchase!\n\n🚀 Get started with:',
            Markup.inlineKeyboard([
                [Markup.button.callback('📥 First Deposit', 'depositBalance')],
                [Markup.button.callback('🤖 Buy Bot', 'buyBot')],
                [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
            ])
        );
    }

    const transactionMessage = BALANCE_MESSAGES.HISTORY(user);

    return ctx.reply(
        transactionMessage,
        transactionHistoryKeyboard
    );
}

module.exports = {
    handleCheckBalance,
    handleViewPendingRequests,
    handleViewTransactions
};
