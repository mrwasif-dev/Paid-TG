const { Markup } = require('telegraf');

// ===== DATE & TIME (Pakistan Time) =====
function getCurrentDateTime() {
    const d = new Date();
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const pakistanTime = new Date(utc + 5 * 60 * 60 * 1000);

    const date = `${String(pakistanTime.getDate()).padStart(2,'0')}-${String(pakistanTime.getMonth()+1).padStart(2,'0')}-${pakistanTime.getFullYear()}`;
    const time = `${String(pakistanTime.getHours()).padStart(2,'0')}:${String(pakistanTime.getMinutes()).padStart(2,'0')}:${String(pakistanTime.getSeconds()).padStart(2,'0')}`;

    return { date, time };
}

// ======= Generate Unique IDs =======
function generateDepositId() {
    return 'dep_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function generateWithdrawId() {
    return 'wd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function generatePlanRequestId() {
    return 'plan_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function generateUpgradeRequestId() {
    return 'upgrade_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// ======= Back Button Helper =======
function withBackButton(buttons = []) {
    return Markup.inlineKeyboard([
        ...buttons,
        [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
    ]);
}

function withBackToAdminButton(buttons = []) {
    return Markup.inlineKeyboard([
        ...buttons,
        [Markup.button.callback('🔙 Back to Admin Menu', 'backToAdminMenu')]
    ]);
}

// ======= Validation Helpers =======
function isValidAmount(amount, type = 'deposit') {
    const { LIMITS } = require('./config.js');
    const limits = LIMITS[type.toUpperCase()];
    
    if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: '❌ Invalid Amount ❌\n\n📝 Please enter a valid positive number.' };
    }
    
    if (amount < limits.MIN) {
        return { valid: false, error: `❌ Minimum ${type} is ${limits.MIN} PKR.` };
    }
    
    if (amount > limits.MAX) {
        return { valid: false, error: `❌ Maximum ${type} per transaction is ${limits.MAX} PKR.` };
    }
    
    return { valid: true };
}

function isValidPakistanPhone(phone) {
    const { PAKISTAN_PHONE_REGEX } = require('./config.js');
    return PAKISTAN_PHONE_REGEX.test(phone);
}

function isValidWhatsAppPhone(phone) {
    const { PHONE_REGEX } = require('./config.js');
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    return PHONE_REGEX.test(cleanPhone);
}

function isValidUsername(username) {
    return /^[a-z0-9_]{3,15}$/.test(username);
}

function isValidPassword(password) {
    const { PASSWORD_REGEX } = require('./config.js');
    return PASSWORD_REGEX.test(password);
}

// ======= Formatting Helpers =======
function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' PKR';
}

function formatDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function formatPlanDetails(plan) {
    return `📦 ${plan.name}\n💰 ${formatCurrency(plan.price)}\n📅 ${plan.duration} days\n📱 ${plan.whatsappCount} WhatsApp Link${plan.whatsappCount > 1 ? 's' : ''}`;
}

// ======= Daily Limits Check =======
function checkDailyDepositLimit(user, amount) {
    const { LIMITS } = require('./config.js');
    const { date } = getCurrentDateTime();
    
    if (!user.dailyDeposits) {
        user.dailyDeposits = { date, count: 0, amount: 0 };
    }
    
    if (user.dailyDeposits.date !== date) {
        user.dailyDeposits = { date, count: 0, amount: 0 };
    }
    
    if (user.dailyDeposits.count >= LIMITS.DEPOSIT.DAILY_MAX_TRANSACTIONS) {
        return { allowed: false, error: '⚠️ Daily deposit transaction limit reached (5 per day).' };
    }
    
    if (user.dailyDeposits.amount + amount > LIMITS.DEPOSIT.DAILY_MAX_AMOUNT) {
        return { 
            allowed: false, 
            error: `⚠️ Daily deposit amount limit exceeded. Remaining today: ${formatCurrency(LIMITS.DEPOSIT.DAILY_MAX_AMOUNT - user.dailyDeposits.amount)}` 
        };
    }
    
    return { allowed: true };
}

function checkDailyWithdrawalLimit(user, amount) {
    const { LIMITS } = require('./config.js');
    const { date } = getCurrentDateTime();
    
    if (!user.dailyWithdrawals) {
        user.dailyWithdrawals = { date, count: 0, amount: 0 };
    }
    
    if (user.dailyWithdrawals.date !== date) {
        user.dailyWithdrawals = { date, count: 0, amount: 0 };
    }
    
    if (user.dailyWithdrawals.count >= LIMITS.WITHDRAWAL.DAILY_MAX_TRANSACTIONS) {
        return { allowed: false, error: '⚠️ Daily withdrawal transaction limit reached (3 per day).' };
    }
    
    if (user.dailyWithdrawals.amount + amount > LIMITS.WITHDRAWAL.DAILY_MAX_AMOUNT) {
        return { 
            allowed: false, 
            error: `⚠️ Daily withdrawal amount limit exceeded. Remaining today: ${formatCurrency(LIMITS.WITHDRAWAL.DAILY_MAX_AMOUNT - user.dailyWithdrawals.amount)}` 
        };
    }
    
    return { allowed: true };
}

// ======= Update Daily Limits =======
function updateDailyDeposit(user, amount) {
    const { date } = getCurrentDateTime();
    
    if (!user.dailyDeposits || user.dailyDeposits.date !== date) {
        user.dailyDeposits = { date, count: 0, amount: 0 };
    }
    
    user.dailyDeposits.count += 1;
    user.dailyDeposits.amount += amount;
}

function updateDailyWithdrawal(user, amount) {
    const { date } = getCurrentDateTime();
    
    if (!user.dailyWithdrawals || user.dailyWithdrawals.date !== date) {
        user.dailyWithdrawals = { date, count: 0, amount: 0 };
    }
    
    user.dailyWithdrawals.count += 1;
    user.dailyWithdrawals.amount += amount;
}

module.exports = {
    getCurrentDateTime,
    generateDepositId,
    generateWithdrawId,
    generatePlanRequestId,
    generateUpgradeRequestId,
    withBackButton,
    withBackToAdminButton,
    isValidAmount,
    isValidPakistanPhone,
    isValidWhatsAppPhone,
    isValidUsername,
    isValidPassword,
    formatCurrency,
    formatDate,
    formatPlanDetails,
    checkDailyDepositLimit,
    checkDailyWithdrawalLimit,
    updateDailyDeposit,
    updateDailyWithdrawal
};
