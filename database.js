const fs = require('fs');
const { DATA_FILE, PLANS_FILE, BOT_PLANS } = require('./config.js');

// ===== DATABASE =====
let users = {};
let plans = {};

// Load users database
function loadUsers() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        users = data;
        
        // Initialize missing fields
        Object.values(users).forEach(user => {
            if (!user.transactions) user.transactions = [];
            if (!user.pendingDeposits) user.pendingDeposits = [];
            if (!user.pendingWithdrawals) user.pendingWithdrawals = [];
            if (!user.activePlans) user.activePlans = [];
            if (!user.pendingPlanRequests) user.pendingPlanRequests = [];
            if (!user.processedRequests) user.processedRequests = {};
            if (!user.balance) user.balance = 0;
        });
    }
    return users;
}

// Save users database
function saveUsers() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    return true;
}

// Load plans database
function loadPlans() {
    if (fs.existsSync(PLANS_FILE)) {
        plans = JSON.parse(fs.readFileSync(PLANS_FILE));
    } else {
        plans = { ...BOT_PLANS };
        savePlans();
    }
    return plans;
}

// Save plans database
function savePlans() {
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2));
    return true;
}

// Get user by username
function getUser(username) {
    return users[username];
}

// Get user by chat ID
function getUserByChatId(chatId, sessions) {
    const session = sessions[chatId];
    if (session && session.usernameKey) {
        return users[session.usernameKey];
    }
    return null;
}

// Update user
function updateUser(username, updates) {
    if (users[username]) {
        users[username] = { ...users[username], ...updates };
        saveUsers();
        return true;
    }
    return false;
}

// Add transaction to user
function addTransaction(username, transaction) {
    if (users[username]) {
        if (!users[username].transactions) {
            users[username].transactions = [];
        }
        users[username].transactions.push(transaction);
        saveUsers();
        return true;
    }
    return false;
}

// Get plan by ID
function getPlan(planId) {
    return plans[planId];
}

// Update plan
function updatePlan(planId, updates) {
    if (plans[planId]) {
        plans[planId] = { ...plans[planId], ...updates };
        savePlans();
        return true;
    }
    return false;
}

// Add new plan
function addPlan(newPlan) {
    const planId = `plan_${Date.now()}`;
    plans[planId] = { id: planId, ...newPlan };
    savePlans();
    return planId;
}

// Delete plan
function deletePlan(planId) {
    if (plans[planId]) {
        delete plans[planId];
        savePlans();
        return true;
    }
    return false;
}

// Initialize databases
loadUsers();
loadPlans();

module.exports = {
    users,
    plans,
    loadUsers,
    saveUsers,
    loadPlans,
    savePlans,
    getUser,
    getUserByChatId,
    updateUser,
    addTransaction,
    getPlan,
    updatePlan,
    addPlan,
    deletePlan
};
