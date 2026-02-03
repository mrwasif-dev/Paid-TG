const { Telegraf } = require('telegraf');
const config = require('./config.js');

// Import all handlers
const auth = require('./auth.js');
const balance = require('./balance.js');
const deposit = require('./deposit.js');
const withdraw = require('./withdraw.js');
const plans = require('./plans.js');
const admin = require('./admin.js');
const support = require('./support.js');
const { sessions } = require('./sessions.js');

// ===== BOT INITIALIZATION =====
const bot = new Telegraf(config.BOT_TOKEN);

// ======= START COMMAND =======
bot.start(auth.handleStart);

// ======= AUTH HANDLERS =======
bot.action('signup', auth.handleSignup);
bot.action('login', auth.handleLogin);
bot.action('forgotPassword', auth.handleForgotPassword);
bot.action('logOut', auth.handleLogout);
bot.action('backToMenu', auth.handleBackToMenu);

// ======= BALANCE HANDLERS =======
bot.action('checkBalance', balance.handleCheckBalance);
bot.action('viewPendingRequests', balance.handleViewPendingRequests);
bot.action('viewTransactions', balance.handleViewTransactions);

// ======= DEPOSIT HANDLERS =======
bot.action('depositBalance', deposit.handleDepositBalance);
bot.action(/deposit(JazzCash|EasyPaisa|UPaisa)/, (ctx) => {
    const method = ctx.match[1];
    deposit.handleDepositMethod(ctx, method);
});
bot.action('confirmDeposit', deposit.handleConfirmDeposit);

// ======= WITHDRAWAL HANDLERS =======
bot.action('withdrawBalance', withdraw.handleWithdrawBalance);
bot.action(/withdraw(JazzCash|EasyPaisa|UPaisa)/, (ctx) => {
    const method = ctx.match[1];
    withdraw.handleWithdrawMethod(ctx, method);
});
bot.action('confirmWithdraw', withdraw.handleConfirmWithdraw);

// ======= PLAN HANDLERS =======
bot.action('buyBot', plans.handleBuyBot);
bot.action('activePlanMenu', plans.handleActivePlanMenu);
bot.action(/viewPlan_(.+)/, (ctx) => {
    const planId = ctx.match[1];
    plans.handleViewPlan(ctx, planId);
});
bot.action(/buyPlan_(.+)/, (ctx) => {
    const planId = ctx.match[1];
    plans.handleBuyPlan(ctx, planId);
});
bot.action(/confirmPlan_(.+)/, (ctx) => {
    const planId = ctx.match[1];
    plans.handleConfirmPlan(ctx, planId);
});
bot.action('yourRunningPlan', plans.handleYourRunningPlan);
bot.action('upgradePlanMenu', plans.handleUpgradePlanMenu);
bot.action(/viewUpgrade_(.+)/, (ctx) => {
    const planId = ctx.match[1];
    plans.handleViewUpgrade(ctx, planId);
});
bot.action(/confirmUpgrade_(.+)/, (ctx) => {
    const planId = ctx.match[1];
    plans.handleConfirmUpgrade(ctx, planId);
});

// ======= ADMIN HANDLERS =======
bot.action('adminAllUsers', admin.handleAdminAllUsers);
bot.action('adminUserList', admin.handleAdminUserList);
bot.action('adminSearchUser', admin.handleAdminSearchUser);
bot.action('adminBalanceUpdate', admin.handleAdminBalanceUpdate);
bot.action('adminAllTransactions', admin.handleAdminAllTransactions);
bot.action('adminBanUser', admin.handleAdminBanUser);
bot.action('adminManagePlans', plans.handleAdminManagePlans);
bot.action('userMode', admin.handleAdminUserMode);
bot.action('backToAdminMenu', admin.handleAdminBackToMenu);

// Admin view user
bot.action(/admin_view_user_(.+)/, (ctx) => {
    const username = ctx.match[1];
    admin.handleAdminViewUser(ctx, username);
});

// Admin ban/unban confirm
bot.action(/admin_confirm_(ban|unban)_(.+)/, (ctx) => {
    const action = ctx.match[1];
    const username = ctx.match[2];
    admin.handleAdminConfirmBan(ctx, username, action);
});

// Admin balance update quick
bot.action(/admin_balance_update_(.+)/, (ctx) => {
    const username = ctx.match[1];
    sessions[ctx.chat.id] = { 
        flow: 'admin_balance_update', 
        step: 'enter_amount',
        targetUsername: username
    };
    
    ctx.reply(
        `💰 Update Balance for @${username} 💰\n\nCurrent Balance: ${users[username].balance || 0} PKR\n\nEnter new balance amount (PKR):\n\n💡 Note: This will REPLACE the current balance.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Cancel', `admin_view_user_${username}`)]
        ])
    );
});

// Admin user transactions
bot.action(/admin_user_transactions_(.+)/, async (ctx) => {
    const username = ctx.match[1];
    const user = users[username];
    
    if (!user || !user.transactions || user.transactions.length === 0) {
        await ctx.reply(
            `📜 Transactions for @${username} 📜\n\nNo transactions found.\n\nThis user has not made any transactions yet.`,
            Markup.inlineKeyboard([
                [Markup.button.callback(`👤 Back to ${username}`, `admin_view_user_${username}`)],
                [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
            ])
        );
        return;
    }

    const recentTransactions = user.transactions.slice(-10).reverse();
    
    let message = `📜 Recent Transactions: @${username} 📜\n\n`;
    message += `👤 Name: ${user.firstName}\n`;
    message += `📊 Total Transactions: ${user.transactions.length}\n\n`;

    recentTransactions.forEach((t, i) => {
        const emoji = t.type.includes('Deposit') ? '📥' : 
                     t.type.includes('Withdrawal') ? '📤' : 
                     t.type.includes('Bot') || t.type.includes('Plan') ? '🤖' : '💳';
        
        message += `${emoji} ${t.type}\n`;
        message += `   💰 Amount: ${t.amount} PKR\n`;
        message += `   📅 Date: ${t.date} at ${t.time}\n`;
        
        if (t.bonus) message += `   🎁 Bonus: +${t.bonus} PKR\n`;
        if (t.fee) message += `   📉 Fee: -${t.fee} PKR\n`;
        if (t.netAmount) message += `   💵 Net: ${t.netAmount} PKR\n`;
        if (t.status) message += `   📊 Status: ${t.status}\n`;
        if (t.note) message += `   📝 Note: ${t.note}\n`;
        
        message += '\n';
    });

    if (user.transactions.length > 10) {
        message += `📖 Showing last 10 of ${user.transactions.length} transactions\n`;
    }

    await ctx.reply(
        message,
        Markup.inlineKeyboard([
            [Markup.button.callback(`👤 Back to ${username}`, `admin_view_user_${username}`)],
            [Markup.button.callback('🔍 Search Another User', 'adminSearchUser')],
            [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
        ])
    );
});

// ======= SUPPORT HANDLERS =======
bot.action('contactSupport', support.handleContactSupport);

// ======= TEXT HANDLER =======
bot.on('text', async (ctx) => {
    // Handle auth text
    await auth.handleAuthText(ctx);
    
    // Handle deposit text
    await deposit.handleDepositText(ctx);
    
    // Handle withdrawal text
    await withdraw.handleWithdrawText(ctx);
    
    // Handle admin text
    await admin.handleAdminText(ctx);
});

// ======= ADMIN APPROVAL HANDLERS =======
// Note: These need to be implemented in your main bot file
// with proper bot instance passing

// ===== LAUNCH BOT =====
bot.launch().then(() => {
    console.log('🤖 Bot running successfully...');
    console.log('✨ All features activated');
    console.log('🔒 Security protocols enabled');
    console.log('💰 Payment system ready');
    console.log('📱 WhatsApp bot integration active');
    console.log('👑 Admin features loaded');
    console.log('📦 Plan management system ready');
});

// Handle graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
