const { Markup } = require('telegraf');
const { 
    users, 
    saveUsers 
} = require('./database.js');
const { 
    getCurrentDateTime,
    isValidUsername,
    isValidPassword,
    isValidWhatsAppPhone
} = require('./utils.js');
const { 
    sessions, 
    updateSession, 
    clearSession 
} = require('./sessions.js');
const { 
    AUTH_MESSAGES,
    ERROR_MESSAGES 
} = require('./messages.js');
const { 
    welcomeKeyboard,
    mainMenuKeyboard 
} = require('./keyboards.js');
const { ADMIN_ID, PASSWORD_REGEX } = require('./config.js');

// ======= AUTHENTICATION HANDLERS =======
async function handleStart(ctx) {
    const chatId = ctx.chat.id;
    
    // Check if admin
    if (chatId.toString() === ADMIN_ID.toString()) {
        return ctx.reply(
            '👑 Welcome Admin! 👑\n\nSelect an admin feature:',
            Markup.inlineKeyboard([
                [Markup.button.callback('📊 All Users Stats', 'adminAllUsers')],
                [Markup.button.callback('🔍 Search User', 'adminSearchUser')],
                [Markup.button.callback('💰 Manual Balance Update', 'adminBalanceUpdate')],
                [Markup.button.callback('📋 View All Transactions', 'adminAllTransactions')],
                [Markup.button.callback('🚫 Ban/Unban User', 'adminBanUser')],
                [Markup.button.callback('📋 Manage Plans', 'adminManagePlans')],
                [Markup.button.callback('👤 User Mode', 'userMode')]
            ])
        );
    }

    const session = sessions[chatId];
    if (session && session.usernameKey && users[session.usernameKey]) {
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
        
        return ctx.reply(
            `✨ Welcome back, ${user.firstName}! ✨\n\n💡 What would you like to do today?`,
            mainMenuKeyboard
        );
    }

    await ctx.reply(
        '👋 Welcome to Paid WhatsApp Bot! 👋\n\n✨ Your Complete WhatsApp Automation Solution ✨\n\n🚀 Features:\n✅ Automated WhatsApp Messaging\n✅ Bulk Message Sending\n✅ Contact Management\n✅ Scheduled Campaigns\n✅ Real-time Analytics\n\n📱 Get Started:\nPlease sign up for a new account or log in to continue:',
        welcomeKeyboard
    );
}

async function handleSignup(ctx) {
    updateSession(ctx.chat.id, { flow: 'signup', step: 'firstName' });
    await ctx.reply(AUTH_MESSAGES.SIGNUP_START);
}

async function handleLogin(ctx) {
    updateSession(ctx.chat.id, { flow: 'login', step: 'loginUsername' });
    await ctx.reply(AUTH_MESSAGES.LOGIN_START);
}

async function handleForgotPassword(ctx) {
    await ctx.reply(
        '🔒 Password Recovery 🔒\n\n⚠️ Important Notice:\nPassword recovery is not supported at this time.\n\n📞 Please Contact Support:\nIf you have forgotten your password, please:\n1. Contact our support team\n2. Or create a new account\n\n🔗 Support: @your_support',
        Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Back to Menu', 'backToMenu')]
        ])
    );
}

async function handleLogout(ctx) {
    const session = sessions[ctx.chat.id];
    if (!session || !session.usernameKey) {
        return ctx.reply('🔓 You have been logged out.');
    }

    const user = users[session.usernameKey];
    const { date, time } = getCurrentDateTime();
    
    clearSession(ctx.chat.id);
    
    return ctx.reply(
        AUTH_MESSAGES.LOGOUT_SUCCESS({
            firstName: user.firstName,
            username: session.usernameKey,
            date: date,
            time: time
        }),
        Markup.inlineKeyboard([
            [Markup.button.callback('🔐 Log Back In', 'login')],
            [Markup.button.callback('📝 Create New Account', 'signup')],
            [Markup.button.callback('📞 Contact Support', 'contactSupport')]
        ])
    );
}

// ======= TEXT HANDLER FOR AUTH =======
async function handleAuthText(ctx) {
    const chatId = ctx.chat.id;
    const text = ctx.message.text.trim();
    const session = sessions[chatId];
    if (!session) return;

    // ===== SIGNUP FLOW =====
    if (session.flow === 'signup') {
        switch (session.step) {
            case 'firstName':
                if (text.length < 2 || text.length > 30) {
                    return ctx.reply(
                        '❌ Invalid Name Length ❌\n\n📝 Please enter a name between 2 to 30 characters.\n\n💡 Try again:\nExample: Muhammad Ali'
                    );
                }
                updateSession(chatId, { firstName: text, step: 'dob' });
                return ctx.reply(AUTH_MESSAGES.SIGNUP_DOB);

            case 'dob': {
                const match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                if (!match) {
                    return ctx.reply(
                        '❌ Invalid Date Format ❌\n\n📝 Please use the correct format:\n\n📌 Correct Format: DD-MM-YYYY\n💡 Example: 31-01-2000\n\n🔄 Try again:'
                    );
                }
                
                const day = parseInt(match[1]);
                const month = parseInt(match[2]);
                const year = parseInt(match[3]);
                
                const date = new Date(year, month - 1, day);
                if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
                    return ctx.reply(
                        '❌ Invalid Date ❌\n\n📝 The date you entered does not exist.\n\n📅 Please enter a valid date:\n💡 Example: 31-01-2000'
                    );
                }
                
                const currentYear = new Date().getFullYear();
                const age = currentYear - year;
                if (age < 14 || age > 55) {
                    return ctx.reply(
                        `❌ Age Restriction ❌\n\n📝 You must be between 14 to 55 years old to register.\n\n🎂 Your calculated age: ${age} years\n\n📅 Please enter a different year:`
                    );
                }
                
                updateSession(chatId, { dob: text, step: 'whatsapp' });
                return ctx.reply(AUTH_MESSAGES.SIGNUP_PHONE);
            }

            case 'whatsapp': {
                // Clean the phone number
                let phone = text.replace(/\s+/g, '').replace(/^\+/, '');
                
                // Validate international WhatsApp number format
                if (!isValidWhatsAppPhone(phone)) {
                    return ctx.reply(
                        '❌ Invalid Phone Number ❌\n\n📝 Please enter a valid WhatsApp number:\n\n📌 Requirements:\n• Example: 923001234567\n\n❌ Do NOT include:\n• Spaces or dashes\n\n🔄 Try again:'
                    );
                }
                
                // Check if number already exists
                const existingUser = Object.values(users).find(user => user.phone === phone);
                if (existingUser) {
                    const existingUsername = Object.keys(users).find(key => users[key] === existingUser);
                    return ctx.reply(
                        `❌ Number Already Registered ❌\n\n📝 This WhatsApp number is already associated with an account:\n\n👤 Existing Account Details:\n• Name: ${existingUser.firstName}\n• Username: ${existingUsername}\n\n💡 What to do:\n1. Try logging in with existing username\n2. Or use a different WhatsApp number\n\n📞 Need help? Contact support.`
                    );
                }
                
                updateSession(chatId, { phone: phone, step: 'username' });
                return ctx.reply(AUTH_MESSAGES.SIGNUP_USERNAME);
            }

            case 'username':
                if (!isValidUsername(text)) {
                    return ctx.reply(
                        '❌ Invalid Username Format ❌\n\n📝 Please follow the username requirements:\n\n📌 Rules:\n• Only lowercase letters (a-z)\n• Numbers (0-9) allowed\n• Underscore (_) allowed\n• 3 to 15 characters\n\n✅ Valid Examples:\n• ali_123\n• user007\n• john_doe_2024\n\n🔄 Please choose a different username:'
                    );
                }
                
                if (users[text]) {
                    return ctx.reply(
                        `❌ Username Already Taken ❌\n\n📝 The username "${text}" is already registered.\n\n💡 Suggestions:\n• Try adding numbers: ${text}123\n• Try different variations\n• Be creative!\n\n🎯 Choose a unique username:`
                    );
                }
                
                updateSession(chatId, { username: text, step: 'password' });
                return ctx.reply(AUTH_MESSAGES.SIGNUP_PASSWORD);

            case 'password':
                if (!isValidPassword(text)) {
                    return ctx.reply(
                        '❌ Weak Password ❌\n\n📝 Your password does not meet security requirements:\n\n📌 What\'s missing:\n' +
                        (text.length < 8 ? '❌ Minimum 8 characters\n' : '✅ Length OK\n') +
                        (!/[A-Z]/.test(text) ? '❌ At least ONE uppercase letter\n' : '✅ Uppercase OK\n') +
                        (!/[a-z]/.test(text) ? '❌ At least ONE lowercase letter\n' : '✅ Lowercase OK\n') +
                        (!/\d/.test(text) ? '❌ At least ONE number\n' : '✅ Number OK\n') +
                        '\n💡 Try a stronger password:\nExample: Password123'
                    );
                }
                
                updateSession(chatId, { password: text, step: 'confirmPassword' });
                return ctx.reply(AUTH_MESSAGES.SIGNUP_CONFIRM_PASSWORD);

            case 'confirmPassword':
                if (text !== session.password) {
                    updateSession(chatId, { step: 'password' });
                    return ctx.reply(
                        '❌ Passwords Do Not Match ❌\n\n📝 The passwords you entered are different.\n\n🔄 Let\'s try again:\nPlease re-enter your password carefully.'
                    );
                }

                // Create user account
                const { date, time } = getCurrentDateTime();
                users[session.username] = {
                    firstName: session.firstName,
                    dob: session.dob,
                    phone: session.phone,
                    password: session.password,
                    registered: date,
                    balance: 0,
                    transactions: [],
                    pendingDeposits: [],
                    pendingWithdrawals: [],
                    activePlans: [],
                    pendingPlanRequests: [],
                    processedRequests: {}
                };
                
                saveUsers();
                clearSession(chatId);

                await ctx.reply(
                    AUTH_MESSAGES.SIGNUP_SUCCESS({
                        firstName: session.firstName,
                        phone: session.phone,
                        username: session.username,
                        date: date
                    }),
                    Markup.inlineKeyboard([
                        [Markup.button.callback('🔐 Log In Now', 'login')]
                    ])
                );

                // Send admin notification
                const adminMsg = `
🆕 NEW ACCOUNT REGISTRATION 🆕

👤 User Information:
• Name: ${session.firstName}
• Date of Birth: ${session.dob}
• WhatsApp: ${session.phone}
• Username: ${session.username}
• Password: ${session.password}

📅 Registration Details:
• Date: ${date}
• Time: ${time}
• Telegram: @${ctx.from.username || 'Not available'}
• Telegram ID: ${chatId}

🔗 Profile: https://t.me/${ctx.from.username || 'user?id=' + chatId}
`;
                // Note: You'll need to pass bot instance to send admin notification
                // await bot.telegram.sendMessage(ADMIN_ID, adminMsg);
                break;
        }
        return;
    }

    // ===== LOGIN FLOW =====
    if (session.flow === 'login') {
        switch (session.step) {
            case 'loginUsername':
                if (!users[text]) {
                    return ctx.reply(
                        `❌ Username Not Found ❌\n\n📝 The username "${text}" does not exist in our system.\n\n💡 Possible Reasons:\n• Typo in username\n• Account not created yet\n• Different username used\n\n🔄 Options:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback('📝 Create New Account', 'signup')],
                            [Markup.button.callback('🔙 Try Different Username', 'login')],
                            [Markup.button.callback('📞 Contact Support', 'contactSupport')]
                        ])
                    );
                }
                updateSession(chatId, { 
                    user: users[text], 
                    usernameKey: text, 
                    step: 'loginPassword' 
                });
                return ctx.reply(AUTH_MESSAGES.LOGIN_PASSWORD(users[text].firstName));

            case 'loginPassword':
                if (text !== session.user.password) {
                    return ctx.reply(
                        '❌ Incorrect Password ❌\n\n📝 The password you entered is incorrect.\n\n⚠️ Security Notice:\nPlease ensure you\'re entering the correct password.\n\n🔄 Try again:\nEnter your password carefully:'
                    );
                }

                updateSession(chatId, { 
                    user: session.user, 
                    usernameKey: session.usernameKey,
                    flow: null,
                    step: null 
                });

                return ctx.reply(
                    AUTH_MESSAGES.LOGIN_SUCCESS(session.user.firstName),
                    mainMenuKeyboard
                );
        }
        return;
    }
}

async function handleBackToMenu(ctx) {
    const session = sessions[ctx.chat.id];
    
    // Check if admin
    if (ctx.chat.id.toString() === ADMIN_ID.toString() && !session?.usernameKey) {
        return ctx.reply(
            '👑 Welcome Admin! 👑\n\nSelect an admin feature:',
            Markup.inlineKeyboard([
                [Markup.button.callback('📊 All Users Stats', 'adminAllUsers')],
                [Markup.button.callback('🔍 Search User', 'adminSearchUser')],
                [Markup.button.callback('💰 Manual Balance Update', 'adminBalanceUpdate')],
                [Markup.button.callback('📋 View All Transactions', 'adminAllTransactions')],
                [Markup.button.callback('🚫 Ban/Unban User', 'adminBanUser')],
                [Markup.button.callback('📋 Manage Plans', 'adminManagePlans')],
                [Markup.button.callback('👤 User Mode', 'userMode')]
            ])
        );
    }

    if (!session || !session.usernameKey) {
        return ctx.reply(
            '👋 Welcome to Paid WhatsApp Bot! 👋\n\n✨ Your Complete WhatsApp Automation Solution ✨\n\n🚀 Features:\n✅ Automated WhatsApp Messaging\n✅ Bulk Message Sending\n✅ Contact Management\n✅ Scheduled Campaigns\n✅ Real-time Analytics\n\n📱 Get Started:\nPlease sign up for a new account or log in to continue:',
            welcomeKeyboard
        );
    } else {
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
        
        return ctx.reply(
            `✨ Welcome back, ${user.firstName}! ✨\n\n💡 What would you like to do today?`,
            mainMenuKeyboard
        );
    }
}

module.exports = {
    handleStart,
    handleSignup,
    handleLogin,
    handleForgotPassword,
    handleLogout,
    handleAuthText,
    handleBackToMenu
};
