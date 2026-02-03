const { Markup } = require('telegraf');
const { 
    users, 
    plans,
    saveUsers,
    getUser,
    updateUser,
    addTransaction
} = require('./database.js');
const { 
    getCurrentDateTime,
    formatCurrency
} = require('./utils.js');
const { 
    sessions,
    updateSession,
    clearSession 
} = require('./sessions.js');
const { 
    ADMIN_MESSAGES,
    ERROR_MESSAGES 
} = require('./messages.js');
const { 
    adminMenuKeyboard,
    backToAdminButton 
} = require('./keyboards.js');
const { ADMIN_ID } = require('./config.js');

// ======= ADMIN HANDLERS =======
async function handleAdminAllUsers(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    const userCount = Object.keys(users).length;
    let totalBalance = 0;
    let activeUsers = 0;
    let bannedUsers = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalPlanPurchases = 0;

    Object.values(users).forEach(user => {
        totalBalance += user.balance || 0;
        if (user.isBanned) {
            bannedUsers++;
        } else {
            activeUsers++;
        }
        
        // Calculate totals from transactions
        if (user.transactions) {
            user.transactions.forEach(transaction => {
                if (transaction.type.includes('Deposit')) {
                    totalDeposits += transaction.amount || 0;
                } else if (transaction.type.includes('Withdrawal')) {
                    totalWithdrawals += transaction.amount || 0;
                } else if (transaction.type.includes('Plan')) {
                    totalPlanPurchases += transaction.amount || 0;
                }
            });
        }
    });

    const stats = {
        userCount,
        activeUsers,
        bannedUsers,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        totalPlanPurchases
    };

    await ctx.reply(
        ADMIN_MESSAGES.ALL_USERS_STATS(stats),
        Markup.inlineKeyboard([
            [Markup.button.callback('📋 User List (First 10)', 'adminUserList')],
            [Markup.button.callback('🔄 Refresh Stats', 'adminAllUsers')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
}

async function handleAdminUserList(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    const userList = Object.entries(users).slice(0, 10);
    
    await ctx.reply(
        ADMIN_MESSAGES.USER_LIST(userList),
        Markup.inlineKeyboard([
            [Markup.button.callback('🔍 Search Specific User', 'adminSearchUser')],
            [Markup.button.callback('📊 Full Stats', 'adminAllUsers')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
}

async function handleAdminSearchUser(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    updateSession(ctx.chat.id, { flow: 'admin_search', step: 'enter_username' });
    
    await ctx.reply(
        '🔍 Search User 🔍\n\nEnter username to search:\n\n💡 You can search by:\n• Username\n• Phone number\n• First name\n\nEnter search term:'
    );
}

async function handleAdminBalanceUpdate(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    updateSession(ctx.chat.id, { flow: 'admin_balance_update', step: 'enter_username' });
    
    await ctx.reply(
        '💰 Manual Balance Update 💰\n\nEnter username of the user whose balance you want to update:\n\nEnter username:'
    );
}

async function handleAdminAllTransactions(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    let allTransactions = [];
    Object.entries(users).forEach(([username, user]) => {
        if (user.transactions && user.transactions.length > 0) {
            user.transactions.forEach(transaction => {
                allTransactions.push({
                    username: username,
                    name: user.firstName,
                    ...transaction
                });
            });
        }
    });

    // Sort by date (newest first)
    allTransactions.sort((a, b) => {
        const dateA = new Date(a.date.split('-').reverse().join('-'));
        const dateB = new Date(b.date.split('-').reverse().join('-'));
        return dateB - dateA;
    });

    const recentTransactions = allTransactions.slice(0, 10);
    
    let message = '📋 Recent All Transactions 📋\n\n';
    
    if (recentTransactions.length === 0) {
        message += 'No transactions found in the system.\n';
    } else {
        recentTransactions.forEach((t, i) => {
            const emoji = t.type.includes('Deposit') ? '📥' : 
                         t.type.includes('Withdrawal') ? '📤' : 
                         t.type.includes('Bot') || t.type.includes('Plan') ? '🤖' : '💳';
            
            message += `${emoji} ${t.type}\n`;
            message += `   👤 User: ${t.name} (@${t.username})\n`;
            message += `   💰 Amount: ${formatCurrency(t.amount)}\n`;
            message += `   📅 Date: ${t.date} at ${t.time}\n`;
            
            if (t.bonus) message += `   🎁 Bonus: +${formatCurrency(t.bonus)}\n`;
            if (t.fee) message += `   📉 Fee: -${formatCurrency(t.fee)}\n`;
            if (t.netAmount) message += `   💵 Net: ${formatCurrency(t.netAmount)}\n`;
            if (t.status) message += `   📊 Status: ${t.status}\n`;
            
            message += '\n';
        });
        
        if (allTransactions.length > 10) {
            message += `📖 Showing 10 of ${allTransactions.length} total transactions\n\n`;
        }
    }

    message += '💡 Use search to find specific user transactions.';

    await ctx.reply(
        message,
        Markup.inlineKeyboard([
            [Markup.button.callback('🔍 Search User Transactions', 'adminSearchUser')],
            [Markup.button.callback('📊 All Users Stats', 'adminAllUsers')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
}

async function handleAdminBanUser(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    updateSession(ctx.chat.id, { flow: 'admin_ban_user', step: 'enter_username' });
    
    await ctx.reply(
        '🚫 Ban/Unban User 🚫\n\nEnter username of the user:\n\nEnter username:'
    );
}

async function handleAdminUserMode(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    // Clear any admin session
    clearSession(ctx.chat.id);
    
    await ctx.reply(
        '👋 Welcome to Paid WhatsApp Bot! 👋\n\n✨ Your Complete WhatsApp Automation Solution ✨\n\n🚀 Features:\n✅ Automated WhatsApp Messaging\n✅ Bulk Message Sending\n✅ Contact Management\n✅ Scheduled Campaigns\n✅ Real-time Analytics\n\n📱 Get Started:\nPlease sign up for a new account or log in to continue:',
        Markup.inlineKeyboard([
            [Markup.button.callback('📝 Sign Up - Create New Account', 'signup')],
            [Markup.button.callback('🔐 Log In - Existing Account', 'login')],
            [Markup.button.callback('📞 Contact Support', 'contactSupport')],
            [Markup.button.callback('👑 Back to Admin', 'backToAdminMenu')]
        ])
    );
}

async function handleAdminBackToMenu(ctx) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    await ctx.reply(
        '👑 Welcome Admin! 👑\n\nSelect an admin feature:',
        adminMenuKeyboard
    );
}

// ======= ADMIN TEXT HANDLERS =======
async function handleAdminText(ctx) {
    const chatId = ctx.chat.id;
    const text = ctx.message.text.trim();
    const session = sessions[chatId];
    if (!session) return;

    // ===== ADMIN SEARCH USER =====
    if (session.flow === 'admin_search') {
        if (session.step === 'enter_username') {
            const searchTerm = text.toLowerCase();
            
            // Search in users
            let foundUsers = [];
            
            Object.entries(users).forEach(([username, user]) => {
                if (username.toLowerCase().includes(searchTerm) ||
                    user.phone.includes(searchTerm) ||
                    user.firstName.toLowerCase().includes(searchTerm)) {
                    foundUsers.push({ username, user });
                }
            });

            if (foundUsers.length === 0) {
                await ctx.reply(
                    '❌ No users found ❌\n\nNo users match your search term.\n\n🔄 Try again with different search term:',
                    Markup.inlineKeyboard([
                        [Markup.button.callback('🔍 Search Again', 'adminSearchUser')],
                        [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
                    ])
                );
                clearSessionFlow(chatId);
                return;
            }

            let message = '🔍 Search Results 🔍\n\n';
            
            foundUsers.forEach(({ username, user }, index) => {
                const status = user.isBanned ? '🚫 BANNED' : '✅ ACTIVE';
                message += `${index + 1}. ${user.firstName} (@${username})\n`;
                message += `   📱 Phone: ${user.phone}\n`;
                message += `   💰 Balance: ${formatCurrency(user.balance || 0)}\n`;
                message += `   📅 Registered: ${user.registered}\n`;
                message += `   📊 Status: ${status}\n\n`;
            });

            if (foundUsers.length > 5) {
                message += `📖 Found ${foundUsers.length} users\n`;
            }

            const buttons = [];
            foundUsers.slice(0, 5).forEach(({ username }) => {
                buttons.push([Markup.button.callback(`👤 View ${username}`, `admin_view_user_${username}`)]);
            });

            buttons.push(
                [Markup.button.callback('🔍 Search Again', 'adminSearchUser')],
                [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
            );

            await ctx.reply(
                message,
                Markup.inlineKeyboard(buttons)
            );
            
            clearSessionFlow(chatId);
        }
        return;
    }

    // ===== ADMIN BALANCE UPDATE =====
    if (session.flow === 'admin_balance_update') {
        if (session.step === 'enter_username') {
            if (!users[text]) {
                await ctx.reply(
                    '❌ User not found ❌\n\nUsername does not exist.\n\n🔄 Enter correct username:',
                    Markup.inlineKeyboard([
                        [Markup.button.callback('🔍 Search User', 'adminSearchUser')],
                        [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
                    ])
                );
                return;
            }

            updateSession(chatId, {
                targetUsername: text,
                step: 'enter_amount'
            });
            
            await ctx.reply(
                `💰 Update Balance for @${text} 💰\n\nCurrent Balance: ${formatCurrency(users[text].balance || 0)}\n\nEnter new balance amount (PKR):\n\n💡 Note: This will REPLACE the current balance.`
            );
        }

        if (session.step === 'enter_amount') {
            const amount = parseInt(text);
            
            if (isNaN(amount) || amount < 0) {
                return ctx.reply('❌ Invalid amount ❌\n\nPlease enter a valid number (0 or greater):');
            }

            const user = users[session.targetUsername];
            const oldBalance = user.balance || 0;
            user.balance = amount;
            
            // Add to transaction history
            addTransaction(session.targetUsername, {
                type: '💰 Admin Balance Update',
                amount: amount - oldBalance,
                date: getCurrentDateTime().date,
                time: getCurrentDateTime().time,
                status: 'admin_updated',
                note: `Admin updated balance from ${oldBalance} to ${amount} PKR`
            });

            saveUsers();

            await ctx.reply(
                `✅ Balance Updated Successfully! ✅\n\n👤 User: @${session.targetUsername}\n👤 Name: ${user.firstName}\n📱 Phone: ${user.phone}\n\n💰 Old Balance: ${formatCurrency(oldBalance)}\n💰 New Balance: ${formatCurrency(amount)}\n📈 Change: ${formatCurrency(amount - oldBalance)}\n\n📅 Date: ${getCurrentDateTime().date}\n⏰ Time: ${getCurrentDateTime().time}`,
                Markup.inlineKeyboard([
                    [Markup.button.callback(`👤 View ${session.targetUsername}`, `admin_view_user_${session.targetUsername}`)],
                    [Markup.button.callback('💰 Update Another User', 'adminBalanceUpdate')],
                    [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
                ])
            );
            
            clearSessionFlow(chatId);
        }
        return;
    }

    // ===== ADMIN BAN USER =====
    if (session.flow === 'admin_ban_user') {
        if (session.step === 'enter_username') {
            if (!users[text]) {
                await ctx.reply(
                    '❌ User not found ❌\n\nUsername does not exist.\n\n🔄 Enter correct username:',
                    Markup.inlineKeyboard([
                        [Markup.button.callback('🔍 Search User', 'adminSearchUser')],
                        [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
                    ])
                );
                return;
            }

            updateSession(chatId, { targetUsername: text, step: 'confirm_action' });
            
            const user = users[text];
            const isCurrentlyBanned = user.isBanned || false;
            
            await ctx.reply(
                `🚫 Ban/Unban User: @${text} 🚫\n\n👤 Name: ${user.firstName}\n📱 Phone: ${user.phone}\n💰 Balance: ${formatCurrency(user.balance || 0)}\n📅 Registered: ${user.registered}\n\n📊 Current Status: ${isCurrentlyBanned ? '🚫 BANNED' : '✅ ACTIVE'}\n\nSelect action:`,
                Markup.inlineKeyboard([
                    [Markup.button.callback(isCurrentlyBanned ? '✅ Unban User' : '🚫 Ban User', `admin_confirm_${isCurrentlyBanned ? 'unban' : 'ban'}_${text}`)],
                    [Markup.button.callback('🔙 Cancel', 'backToAdminMenu')]
                ])
            );
        }
        return;
    }
}

// ======= ADMIN VIEW USER =======
async function handleAdminViewUser(ctx, username) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    const user = getUser(username);
    
    if (!user) {
        return ctx.answerCbQuery('User not found!', { show_alert: true });
    }

    await ctx.reply(
        ADMIN_MESSAGES.USER_DETAILS(username, user),
        Markup.inlineKeyboard([
            [Markup.button.callback(
                user.isBanned ? '✅ Unban User' : '🚫 Ban User', 
                `admin_confirm_${user.isBanned ? 'unban' : 'ban'}_${username}`
            )],
            [Markup.button.callback('💰 Update Balance', `admin_balance_update_${username}`)],
            [Markup.button.callback('📜 View Transactions', `admin_user_transactions_${username}`)],
            [Markup.button.callback('🔍 Search Another User', 'adminSearchUser')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
}

// ======= ADMIN CONFIRM BAN/UNBAN =======
async function handleAdminConfirmBan(ctx, username, action) {
    if (ctx.chat.id.toString() !== ADMIN_ID.toString()) {
        return ctx.answerCbQuery(ERROR_MESSAGES.ADMIN_ONLY, { show_alert: true });
    }

    const user = getUser(username);
    
    if (!user) {
        return ctx.answerCbQuery('User not found!', { show_alert: true });
    }

    user.isBanned = (action === 'ban');
    saveUsers();

    const { date, time } = getCurrentDateTime();

    await ctx.editMessageText(
        `✅ User ${action === 'ban' ? 'Banned' : 'Unbanned'} Successfully! ✅\n\n👤 User: @${username}\n👤 Name: ${user.firstName}\n📱 Phone: ${user.phone}\n\n📊 Status: ${action === 'ban' ? '🚫 BANNED' : '✅ ACTIVE'}\n\n📅 Date: ${date}\n⏰ Time: ${time}\n\n${action === 'ban' ? '⚠️ User can no longer:\n• Login to account\n• Deposit funds\n• Withdraw funds\n• Buy bots\n\nUser will see suspension message on login.' : '✅ User can now:\n• Login to account\n• Deposit funds\n• Withdraw funds\n• Buy bots\n\nAll features restored.'}`,
        Markup.inlineKeyboard([
            [Markup.button.callback(`👤 View ${username}`, `admin_view_user_${username}`)],
            [Markup.button.callback('🚫 Ban Another User', 'adminBanUser')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
}

module.exports = {
    handleAdminAllUsers,
    handleAdminUserList,
    handleAdminSearchUser,
    handleAdminBalanceUpdate,
    handleAdminAllTransactions,
    handleAdminBanUser,
    handleAdminUserMode,
    handleAdminBackToMenu,
    handleAdminText,
    handleAdminViewUser,
    handleAdminConfirmBan
};
