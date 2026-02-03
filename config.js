const fs = require('fs');

// ===== CONFIGURATION =====
const BOT_TOKEN = '8226474686:AAEmXiWRGoeaa5pZlF2MZlYViYmSkM70fbI';
const ADMIN_ID = 6012422087;
const DATA_FILE = './users.json';
const PLANS_FILE = './plans.json';
const LOGS_DIR = './logs/';

// ===== REGEX PATTERNS =====
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^92\d{10}$/;
const PAKISTAN_PHONE_REGEX = /^03\d{9}$/;

// ===== LIMITS =====
const LIMITS = {
    DEPOSIT: {
        MIN: 100,
        MAX: 5000,
        DAILY_MAX_AMOUNT: 20000,
        DAILY_MAX_TRANSACTIONS: 5
    },
    WITHDRAWAL: {
        MIN: 200,
        MAX: 5000,
        DAILY_MAX_AMOUNT: 15000,
        DAILY_MAX_TRANSACTIONS: 3
    }
};

// ===== BOT PLANS (DEFAULT) =====
const BOT_PLANS = {
    plan1: {
        id: 'plan1',
        name: 'Basic Plan',
        price: 350,
        duration: 15, // days
        features: ['1 WhatsApp Link'],
        whatsappCount: 1
    },
    plan2: {
        id: 'plan2',
        name: 'Standard Plan',
        price: 500,
        duration: 30, // days
        features: ['1 WhatsApp Link'],
        whatsappCount: 1
    },
    plan3: {
        id: 'plan3',
        name: 'Premium Plan',
        price: 1200,
        duration: 90, // days
        features: ['1 WhatsApp Link'],
        whatsappCount: 1
    },
    plan4: {
        id: 'plan4',
        name: 'Business Plan',
        price: 2000,
        duration: 90, // days
        features: ['2 WhatsApp Links'],
        whatsappCount: 2
    }
};

// ===== MESSAGES =====
const MESSAGES = {
    WELCOME: '👋 Welcome to Paid WhatsApp Bot! 👋\n\n✨ Your Complete WhatsApp Automation Solution ✨',
    ADMIN_WELCOME: '👑 Welcome Admin! 👑\n\nSelect an admin feature:',
    USER_WELCOME: '✨ Welcome back, {name}! ✨\n\n💡 What would you like to do today?',
    BANNED: '🚫 Account Suspended 🚫\n\nYour account has been suspended by admin.',
    SUPPORT: '📞 24/7 Customer Support 📞\n\n🔗 Click the link below to contact our support team:'
};

module.exports = {
    BOT_TOKEN,
    ADMIN_ID,
    DATA_FILE,
    PLANS_FILE,
    LOGS_DIR,
    PASSWORD_REGEX,
    PHONE_REGEX,
    PAKISTAN_PHONE_REGEX,
    LIMITS,
    BOT_PLANS,
    MESSAGES
};
