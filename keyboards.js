const { Markup } = require('telegraf');

// ===== MAIN MENUS =====
const mainMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💰 Check Balance', 'checkBalance')],
    [Markup.button.callback('🤖 Buy WhatsApp Bot', 'buyBot')],
    [Markup.button.callback('📥 Deposit Funds', 'depositBalance')],
    [Markup.button.callback('📤 Withdraw Funds', 'withdrawBalance')],
    [Markup.button.callback('📞 Contact Support', 'contactSupport')],
    [Markup.button.callback('🚪 Log Out', 'logOut')]
]);

const adminMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📊 All Users Stats', 'adminAllUsers')],
    [Markup.button.callback('🔍 Search User', 'adminSearchUser')],
    [Markup.button.callback('💰 Manual Balance Update', 'adminBalanceUpdate')],
    [Markup.button.callback('📋 View All Transactions', 'adminAllTransactions')],
    [Markup.button.callback('🚫 Ban/Unban User', 'adminBanUser')],
    [Markup.button.callback('📋 Manage Plans', 'adminManagePlans')],
    [Markup.button.callback('👤 User Mode', 'userMode')]
]);

const welcomeKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📝 Sign Up - Create New Account', 'signup')],
    [Markup.button.callback('🔐 Log In - Existing Account', 'login')],
    [Markup.button.callback('📞 Contact Support', 'contactSupport')]
]);

const supportKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('💬 Chat with Support', 'https://t.me/help_paid_whatsapp_bot')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

// ===== PLAN MENUS =====
const planMainMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Active Plan', 'activePlanMenu')],
    [Markup.button.callback('🔄 Upgrade Plan', 'upgradePlanMenu')],
    [Markup.button.callback('📋 Your Running Plan', 'yourRunningPlan')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

function planListKeyboard(plans) {
    const buttons = [];
    Object.values(plans).forEach(plan => {
        buttons.push([Markup.button.callback(
            `📦 ${plan.name} - ${plan.price} PKR`, 
            `viewPlan_${plan.id}`
        )]);
    });
    buttons.push([Markup.button.callback('🔙 Back to Plans Menu', 'buyBot')]);
    return Markup.inlineKeyboard(buttons);
}

function planDetailsKeyboard(planId) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🛒 Buy This Plan', `buyPlan_${planId}`)],
        [Markup.button.callback('📋 View Other Plans', 'activePlanMenu')],
        [Markup.button.callback('🔙 Back to Plans Menu', 'buyBot')]
    ]);
}

function planConfirmationKeyboard(planId) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('✅ Confirm Purchase', `confirmPlan_${planId}`)],
        [Markup.button.callback('❌ Cancel', 'activePlanMenu')]
    ]);
}

// ===== DEPOSIT MENUS =====
const depositMethodKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✈️ JazzCash - Fast & Secure', 'depositJazzCash')],
    [Markup.button.callback('🏦 EasyPaisa - Most Popular', 'depositEasyPaisa')],
    [Markup.button.callback('💳 U-Paisa - Reliable Service', 'depositUPaisa')],
    [Markup.button.callback('💰 Check Balance', 'checkBalance')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

const depositConfirmationKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Confirm & Submit Deposit Request', 'confirmDeposit')],
    [Markup.button.callback('🔙 Cancel & Start Over', 'depositBalance')]
]);

// ===== WITHDRAWAL MENUS =====
const withdrawalMethodKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✈️ JazzCash', 'withdrawJazzCash')],
    [Markup.button.callback('🏦 EasyPaisa', 'withdrawEasyPaisa')],
    [Markup.button.callback('💳 U-Paisa', 'withdrawUPaisa')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

const withdrawalConfirmationKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Confirm & Submit Withdrawal Request', 'confirmWithdraw')],
    [Markup.button.callback('🔙 Cancel & Start Over', 'withdrawBalance')]
]);

// ===== ADMIN PLAN MANAGEMENT =====
const adminPlanManagementKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add New Plan', 'adminAddPlan')],
    [Markup.button.callback('✏️ Edit Existing Plan', 'adminEditPlan')],
    [Markup.button.callback('🗑️ Delete Plan', 'adminDeletePlan')],
    [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
]);

// ===== TRANSACTION MENUS =====
const transactionHistoryKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📥 New Deposit', 'depositBalance')],
    [Markup.button.callback('📤 New Withdrawal', 'withdrawBalance')],
    [Markup.button.callback('💰 Check Balance', 'checkBalance')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

const pendingRequestsKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📥 New Deposit', 'depositBalance')],
    [Markup.button.callback('📤 New Withdrawal', 'withdrawBalance')],
    [Markup.button.callback('💰 Check Balance', 'checkBalance')],
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

// ===== BACK BUTTONS =====
const backToMenuButton = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
]);

const backToAdminButton = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
]);

module.exports = {
    mainMenuKeyboard,
    adminMenuKeyboard,
    welcomeKeyboard,
    supportKeyboard,
    planMainMenuKeyboard,
    planListKeyboard,
    planDetailsKeyboard,
    planConfirmationKeyboard,
    depositMethodKeyboard,
    depositConfirmationKeyboard,
    withdrawalMethodKeyboard,
    withdrawalConfirmationKeyboard,
    adminPlanManagementKeyboard,
    transactionHistoryKeyboard,
    pendingRequestsKeyboard,
    backToMenuButton,
    backToAdminButton
};
