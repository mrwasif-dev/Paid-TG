// ===== SESSION MANAGEMENT =====
const sessions = {};
const pendingAdminRejections = {};

// Initialize session for user
function initSession(chatId) {
    sessions[chatId] = {};
    return sessions[chatId];
}

// Get session for user
function getSession(chatId) {
    return sessions[chatId];
}

// Update session
function updateSession(chatId, updates) {
    if (sessions[chatId]) {
        sessions[chatId] = { ...sessions[chatId], ...updates };
    } else {
        sessions[chatId] = updates;
    }
    return sessions[chatId];
}

// Clear session
function clearSession(chatId) {
    if (sessions[chatId]) {
        sessions[chatId] = null;
        delete sessions[chatId];
    }
    return true;
}

// Clear specific flow from session
function clearSessionFlow(chatId) {
    if (sessions[chatId]) {
        delete sessions[chatId].flow;
        delete sessions[chatId].step;
    }
}

// Set pending admin rejection
function setPendingAdminRejection(chatId, data) {
    pendingAdminRejections[chatId] = data;
}

// Get pending admin rejection
function getPendingAdminRejection(chatId) {
    return pendingAdminRejections[chatId];
}

// Clear pending admin rejection
function clearPendingAdminRejection(chatId) {
    if (pendingAdminRejections[chatId]) {
        delete pendingAdminRejections[chatId];
    }
}

// Check if user is logged in
function isLoggedIn(chatId) {
    return sessions[chatId] && sessions[chatId].usernameKey;
}

// Check if user is admin
function isAdmin(chatId) {
    const { ADMIN_ID } = require('./config.js');
    return chatId.toString() === ADMIN_ID.toString();
}

// Check if user is banned
function isUserBanned(chatId, users) {
    const session = sessions[chatId];
    if (session && session.usernameKey) {
        const user = users[session.usernameKey];
        return user && user.isBanned;
    }
    return false;
}

module.exports = {
    sessions,
    pendingAdminRejections,
    initSession,
    getSession,
    updateSession,
    clearSession,
    clearSessionFlow,
    setPendingAdminRejection,
    getPendingAdminRejection,
    clearPendingAdminRejection,
    isLoggedIn,
    isAdmin,
    isUserBanned
};
