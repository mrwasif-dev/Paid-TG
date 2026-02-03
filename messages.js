const { formatCurrency } = require('./utils.js');

// ===== WELCOME MESSAGES =====
const WELCOME_MESSAGES = {
    USER: `👋 Welcome to Paid WhatsApp Bot! 👋\n\n✨ Your Complete WhatsApp Automation Solution ✨\n\n🚀 Features:\n✅ Automated WhatsApp Messaging\n✅ Bulk Message Sending\n✅ Contact Management\n✅ Scheduled Campaigns\n✅ Real-time Analytics\n\n📱 Get Started:\nPlease sign up for a new account or log in to continue:`,
    
    ADMIN: `👑 Welcome Admin! 👑\n\nSelect an admin feature:`,
    
    USER_WELCOME_BACK: (name) => `✨ Welcome back, ${name}! ✨\n\n💡 What would you like to do today?`,
    
    BANNED: `🚫 Account Suspended 🚫\n\nYour account has been suspended by admin.\n\n📞 Please contact support for assistance:\n@help_paid_whatsapp_bot`
};

// ===== AUTH MESSAGES =====
const AUTH_MESSAGES = {
    SIGNUP_START: `✨ Account Registration Process ✨\n\n📝 Step 1: Personal Information 📝\n\nPlease enter your first name:\n\n💡 Example: Muhammad Ali\n\n📌 Requirements:\n• 2-30 characters\n• No special symbols`,
    
    SIGNUP_DOB: `📅 Date of Birth 📅\n\nPlease enter your date of birth in the following format:\n\n📌 Format: DD-MM-YYYY\n💡 Example: 31-01-2000\n\n⚠️ Note:\nYou must be between 14-55 years old to register.`,
    
    SIGNUP_PHONE: `📱 WhatsApp Number 📱\n\nPlease enter your WhatsApp number in international format:\n\n📌 Format: 923001234567\n💡 Example: 923001234567\n\n⚠️ Important Notes:\n• You may add + prefix\n• Must be a valid number\n• This number will be used for verification\n\n🔒 Privacy: Your number is kept confidential.`,
    
    SIGNUP_USERNAME: `👤 Choose Your Username 👤\n\nPlease choose a unique username:\n\n📌 Requirements:\n• 3-15 characters\n• Lowercase letters only\n• Numbers and underscore allowed\n\n✅ Allowed: ali_123, user007, john_doe\n❌ Not allowed: Ali123, User@123, John-Doe\n\n💡 Example: ali_123\n\n🔒 This will be your login ID.`,
    
    SIGNUP_PASSWORD: `🔐 Create Secure Password 🔐\n\nCreate a strong password for your account:\n\n📌 Password Requirements:\n✅ Minimum 8 characters\n✅ At least ONE uppercase letter (A-Z)\n✅ At least ONE lowercase letter (a-z)\n✅ At least ONE number (0-9)\n\n💡 Strong Examples:\n• Password123\n• SecurePass2024\n• MyBot@123\n\n⚠️ Keep your password safe!\nDo not share it with anyone.`,
    
    SIGNUP_CONFIRM_PASSWORD: `🔏 Confirm Your Password 🔏\n\nPlease re-enter your password to confirm:\n\n📌 This ensures you typed it correctly.\n\n💡 Enter the same password again:`,
    
    SIGNUP_SUCCESS: (userData) => `🎉 Account Created Successfully! 🎉\n\n✨ Welcome ${userData.firstName}! ✨\n\n✅ Registration Complete ✅\n\n📋 Your Account Details:\n👤 Name: ${userData.firstName}\n📱 WhatsApp: ${userData.phone}\n👤 Username: ${userData.username}\n📅 Registered: ${userData.date}\n\n🔒 Account Security:\nYour account is now secure and ready to use.\n\n🚀 Next Step:\nPlease log in to access your account dashboard.`,
    
    LOGIN_START: `🔐 Account Login 🔐\n\n👤 Please enter your username to continue:\n\n📌 Your username is the one you chose during registration.\n\n💡 Example: ali_123\n\n❓ Forgot username?\nContact our support team for assistance.`,
    
    LOGIN_PASSWORD: (name) => `🔐 Password Verification 🔐\n\n👋 Welcome back, ${name}! 👋\n\nPlease enter your password to continue:\n\n📌 Note: Password is case-sensitive.\n\n🔒 Enter your password:`,
    
    LOGIN_SUCCESS: (name) => `🎉 Welcome Back, ${name}! 🎉\n\n✅ Login Successful! ✅\n\n💡 What would you like to do today?`,
    
    LOGOUT_SUCCESS: (userData) => `👋 Logged Out Successfully 👋\n\n✨ Thank you for using our services, ${userData.firstName}!\n\n📋 Session Summary:\n• Account: ${userData.username}\n• Logout Time: ${userData.time}\n• Logout Date: ${userData.date}\n\n🔒 Security Notice:\nYour session has been securely ended.\n\n💡 Come back soon!\nWe look forward to serving you again.`
};

// ===== PLAN MESSAGES =====
const PLAN_MESSAGES = {
    PLAN_MAIN_MENU: `🤖 WhatsApp Bot Plans 🤖\n\n✨ Choose an option to continue:\n\n📊 Plan Management:\n• Active Plan - Purchase new WhatsApp bot plan\n• Upgrade Plan - Upgrade your existing plan\n• Your Running Plan - View your active plans\n\n💡 Need help choosing? Contact support!`,
    
    ACTIVE_PLAN_MENU: `✅ Active Plan Menu ✅\n\n📋 Available WhatsApp Bot Plans:\n\nChoose a plan to view details and purchase:`,
    
    PLAN_DETAILS: (plan) => {
        let details = `📦 ${plan.name} 📦\n\n`;
        details += `💰 Price: ${formatCurrency(plan.price)}\n`;
        details += `📅 Duration: ${plan.duration} days\n`;
        details += `📱 WhatsApp Links: ${plan.whatsappCount}\n\n`;
        details += `✨ Features:\n`;
        plan.features.forEach(feature => {
            details += `✅ ${feature}\n`;
        });
        details += `\n💡 This plan includes full WhatsApp bot automation.`;
        return details;
    },
    
    PLAN_CONFIRMATION: (plan, userBalance) => {
        const afterPurchase = userBalance - plan.price;
        return `🛒 Confirm Plan Purchase 🛒\n\n📋 Plan Details:\n📦 Name: ${plan.name}\n💰 Price: ${formatCurrency(plan.price)}\n📅 Duration: ${plan.duration} days\n📱 WhatsApp Links: ${plan.whatsappCount}\n\n💰 Account Balance: ${formatCurrency(userBalance)}\n💵 After Purchase: ${formatCurrency(afterPurchase)}\n\n✅ Are you sure you want to purchase this plan?`;
    },
    
    PLAN_INSUFFICIENT_BALANCE: (plan, userBalance) => {
        const needed = plan.price - userBalance;
        return `❌ Insufficient Balance ❌\n\n🤖 Plan: ${plan.name}\n💰 Required: ${formatCurrency(plan.price)}\n💳 Your Balance: ${formatCurrency(userBalance)}\n\n💡 You need ${formatCurrency(needed)} more to purchase this plan.\n\n📥 Please deposit funds first:`;
    },
    
    PLAN_PURCHASE_SUCCESS: (request) => `⏳ Plan Purchase Request Submitted! ⏳\n\n✅ Request Details:\n📦 Plan: ${request.planName}\n💰 Amount: ${formatCurrency(request.price)}\n📅 Duration: ${request.duration} days\n📱 WhatsApp Links: ${request.whatsappCount}\n\n📊 Status: Pending Admin Approval 🔄\n\n🔑 Request ID: ${request.id}\n\n💰 Balance Update:\n• Previous Balance: ${formatCurrency(request.oldBalance)}\n• New Balance: ${formatCurrency(request.newBalance)}\n• Amount Deducted: ${formatCurrency(request.price)} ⏳\n\n⏰ Processing Time:\n• Usually within 1-2 hours\n• You will be notified upon approval\n\n💡 Note:\nYour payment is held until approval. If rejected, amount will be refunded.\n\n📞 Support Available 24/7`,
    
    PLAN_APPROVED: (plan, request) => `🎉 Plan Approved Successfully! 🎉\n\n✅ Your plan has been approved by admin.\n\n📋 Plan Details:\n📦 Plan: ${plan.name}\n💰 Price: ${formatCurrency(request.price)}\n📅 Duration: ${request.duration} days\n📱 WhatsApp Links: ${plan.whatsappCount}\n\n🔄 Status: Waiting for WhatsApp Link ⏳\n\n⏰ Next Step:\nAdmin will provide WhatsApp link shortly.\nYou will receive another notification with the link.\n\n📞 Support Available 24/7`,
    
    PLAN_LINK_PROVIDED: (plan, link, date, time) => `🎉 WhatsApp Link Provided! 🎉\n\n✅ Your WhatsApp bot plan is now fully activated!\n\n📋 Plan Details:\n📦 Plan: ${plan.name}\n💰 Price: ${formatCurrency(plan.price)}\n📅 Duration: ${plan.duration} days\n📱 WhatsApp Links: ${plan.whatsappCount}\n\n🔗 Your WhatsApp Link:\n${link}\n\n📅 Activation Date: ${date}\n⏰ Activation Time: ${time}\n\n🚀 How to Use:\n1. Click the link above\n2. Start using your WhatsApp bot\n3. Contact support if needed\n\n✨ Enjoy your WhatsApp automation!`,
    
    PLAN_REJECTED: (request, reason) => `❌ Plan Request Rejected ❌\n\n📋 Request Details:\n📦 Plan: ${request.planName}\n💰 Price: ${formatCurrency(request.price)}\n📅 Date: ${request.date}\n⏰ Time: ${request.time}\n\n📝 Rejection Reason:\n${reason}\n\n💰 Balance Update:\n✅ Your balance has been refunded.\n• New Balance: ${formatCurrency(request.newBalance)}\n• Amount Refunded: ${formatCurrency(request.price)}\n\n💡 What to do next:\n1. Check the reason above\n2. Contact support if needed\n3. Submit a new request if applicable`,
    
    YOUR_RUNNING_PLAN: (user) => {
        let message = '📋 Your Running Plans 📋\n\n';
        
        if (user.activePlans && user.activePlans.length > 0) {
            user.activePlans.forEach((plan, index) => {
                const expiryDate = new Date(plan.activatedDate);
                expiryDate.setDate(expiryDate.getDate() + plan.duration);
                const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                
                message += `${index + 1}. ${plan.planName}\n`;
                message += `   📅 Activated: ${plan.activatedDate}\n`;
                message += `   ⏳ Expires: ${expiryDate.toLocaleDateString()}\n`;
                message += `   📆 Days Left: ${daysLeft > 0 ? daysLeft : 'EXPIRED'} days\n`;
                if (plan.whatsappLink) {
                    message += `   🔗 Link: ${plan.whatsappLink}\n`;
                }
                message += '\n';
            });
        } else {
            message += '📭 No active plans found.\n\n';
        }
        
        if (user.pendingPlanRequests && user.pendingPlanRequests.length > 0) {
            message += '⏳ Pending Requests:\n';
            user.pendingPlanRequests.forEach((request, index) => {
                message += `${index + 1}. ${request.planName}\n`;
                message += `   💰 Price: ${formatCurrency(request.price)}\n`;
                message += `   📅 Date: ${request.date}\n`;
                message += `   ⏰ Time: ${request.time}\n`;
                message += `   📊 Status: ${request.status || 'Pending'}\n\n`;
            });
        }
        
        message += '💡 Manage your plans:';
        return message;
    },
    
    UPGRADE_PLAN_MENU: (user) => {
        let message = '🔄 Upgrade Your Plan 🔄\n\n';
        
        if (user.activePlans && user.activePlans.length > 0) {
            const currentPlan = user.activePlans[0];
            message += `📊 Current Plan: ${currentPlan.planName}\n`;
            message += `💰 Current Price: ${formatCurrency(currentPlan.price)}\n\n`;
            message += '📈 Available Upgrade Plans:\n\n';
            return message;
        } else {
            message += '📊 You don\'t have an active plan.\n';
            message += '💡 Please purchase a plan first.\n\n';
            return message;
        }
    },
    
    UPGRADE_PLAN_DETAILS: (currentPlan, newPlan, upgradePrice, remainingDays) => {
        let message = `🔄 Upgrade Plan Details 🔄\n\n`;
        message += `📊 Current Plan: ${currentPlan.name}\n`;
        message += `📦 New Plan: ${newPlan.name}\n\n`;
        message += `💰 Price Comparison:\n`;
        message += `• Current: ${formatCurrency(currentPlan.price)}\n`;
        message += `• New: ${formatCurrency(newPlan.price)}\n`;
        message += `• Upgrade Cost: ${formatCurrency(upgradePrice)}\n\n`;
        message += `📅 Duration Benefit:\n`;
        message += `• Remaining Days from Current Plan: ${remainingDays} days\n`;
        message += `• New Plan Duration: ${newPlan.duration} days\n`;
        message += `• Total Duration: ${remainingDays + newPlan.duration} days\n\n`;
        message += `✨ New Features:\n`;
        newPlan.features.forEach(feature => {
            message += `✅ ${feature}\n`;
        });
        return message;
    }
};

// ===== DEPOSIT MESSAGES =====
const DEPOSIT_MESSAGES = {
    MAIN_MENU: (balance) => `📥 Deposit Funds 📥\n\n💰 Current Balance: ${formatCurrency(balance)}\n\n🏦 Select Deposit Method:\n\nChoose your preferred payment method:\n\n💡 All methods support instant processing\n\n📊 Daily Limits:\n• Max 5 transactions\n• Max 20,000 PKR per day`,
    
    METHOD_SELECTED: (method, accountType, balance) => `🏦 ${accountType} Deposit Method Selected 🏦\n\n✅ Payment Instructions:\n\n📤 Send Payment To:\n\n👤 Account Title: M Hadi\n🔢 Account Number: 03000382844\n🏦 Account Type: ${accountType}\n\n💵 Amount Requirements:\n• Minimum: 100 PKR\n• Maximum: 5,000 PKR per transaction\n• Daily Limit: 20,000 PKR\n\n🎁 Special Bonus:\n• Get 2% bonus on every deposit!\n\n💰 Your Current Balance: ${formatCurrency(balance)}\n\n🔢 Enter Deposit Amount (PKR):`,
    
    ENTER_PROOF: (amount, method) => `✅ Amount Verified! ✅\n\n💵 Amount to Deposit: ${formatCurrency(amount)}\n\n📤 Transaction Proof Required 📤\n\nPlease enter your Transaction ID/Proof:\n\n📌 Accepted Formats:\n✅ Transaction ID\n✅ TiD\n✅ TrX ID\n✅ Reference Number\n\n❌ Not Accepted:\n❌ Screenshots\n❌ Images\n❌ PDF files\n\n💡 Example: TXN1234567890\n\n🔢 Enter your Transaction ID:`,
    
    CONFIRMATION: (session) => {
        const bonus = Math.floor(session.depositAmount * 0.02);
        const totalAmount = session.depositAmount + bonus;
        return `📋 Deposit Request Summary 📋\n\n✅ Please review your details:\n\n💵 Transaction Details:\n• Amount: ${formatCurrency(session.depositAmount)}\n• Bonus (2%): ${formatCurrency(bonus)} 🎁\n• Total to Add: ${formatCurrency(totalAmount)} 💰\n\n🏦 Payment Method:\n• ${session.depositMethod}\n\n📝 Transaction ID:\n• ${session.depositProof}\n\n⏰ Processing Time:\n• Usually within 15-30 minutes\n• 24/7 support available\n\n⚠️ Important:\n• Double-check all details\n• Ensure payment is completed\n\n✅ Ready to submit?`;
    },
    
    SUCCESS: (request) => `⏳ Deposit Request Submitted Successfully! ⏳\n\n✅ Request Details:\n💵 Amount: ${formatCurrency(request.amount)}\n🎁 Bonus: ${formatCurrency(request.bonus)}\n💰 Total to Add: ${formatCurrency(request.totalAmount)}\n🏦 Method: ${request.method}\n📝 Transaction ID: ${request.proof}\n\n📊 Status: Pending Admin Approval 🔄\n\n🔑 Request ID: ${request.id}\n\n⏰ Processing Time:\n• Usually within 15-30 minutes\n• You will be notified upon approval\n\n💡 Note:\nKeep your transaction proof safe for verification.\n\n📞 Support Available 24/7`,
    
    APPROVED: (deposit) => `🎉 Deposit Approved Successfully! 🎉\n\n✅ Transaction Details:\n💰 Amount: ${formatCurrency(deposit.amount)}\n🎁 Bonus (2%): ${formatCurrency(deposit.bonus)} PKR\n💵 Total Added: ${formatCurrency(deposit.totalAmount)}\n🏦 Method: ${deposit.method}\n📝 Transaction ID: ${deposit.proof}\n📅 Date: ${deposit.date}\n⏰ Time: ${deposit.time}\n\n💰 Balance Update:\n• Previous Balance: ${formatCurrency(deposit.oldBalance)}\n• New Balance: ${formatCurrency(deposit.newBalance)}\n• Amount Added: ${formatCurrency(deposit.totalAmount)}\n\n✨ Thank you for your deposit!\nYour funds are now available for use.\n\n🚀 Ready for your next transaction?`,
    
    REJECTED: (deposit, reason) => `❌ Deposit Request Rejected ❌\n\n⚠️ Transaction Details:\n💰 Amount: ${formatCurrency(deposit.amount)}\n🏦 Method: ${deposit.method}\n📝 Transaction ID: ${deposit.proof}\n📅 Date: ${deposit.date}\n⏰ Time: ${deposit.time}\n\n📝 Rejection Reason:\n${reason}\n\n💡 What to do next:\n1. Check the reason above\n2. Contact support if needed\n3. Submit a new request if applicable\n\n📞 Support Available 24/7\nWe're here to help!`
};

// ===== WITHDRAWAL MESSAGES =====
const WITHDRAWAL_MESSAGES = {
    MAIN_MENU: (balance) => `📤 Withdraw Funds 📤\n\n💰 Available Balance: ${formatCurrency(balance)}\n\n💵 Withdrawal Requirements:\n• Minimum: 200 PKR\n• Maximum: 5,000 PKR per transaction\n• Daily Limit: 3 withdrawals (15,000 PKR)\n\n📉 Processing Fee:\n• 2% fee applies (minimum 10 PKR)\n\n🏦 Supported Methods:\n• JazzCash\n• EasyPaisa\n• U-Paisa\n\n🔢 Enter withdrawal amount (PKR):`,
    
    METHOD_SELECTED: (method, accountType) => `🏦 ${accountType} Withdrawal Selected 🏦\n\n✅ Account Information Required\n\n📱 Please enter your ${accountType} account number:\n\n📌 Format Requirements:\n• 11 digits starting with 03\n• No spaces or dashes\n• Must be your registered number\n\n💡 Example: 03001234567\n\n⚠️ Important:\n• Ensure account is active\n• Double-check number\n• Funds will be sent to this number\n\n🔢 Enter your account number:`,
    
    CONFIRMATION: (session) => {
        const processingFee = Math.max(10, Math.floor(session.withdrawAmount * 0.02));
        const netAmount = session.withdrawAmount - processingFee;
        return `📋 Withdrawal Request Summary 📋\n\n✅ Please review your details:\n\n💵 Transaction Details:\n• Amount: ${formatCurrency(session.withdrawAmount)}\n• Processing Fee (2%): ${formatCurrency(processingFee)} 📉\n• Net Amount: ${formatCurrency(netAmount)} 💰\n\n🏦 Payment Method:\n• ${session.withdrawMethod}\n\n📱 Account Details:\n• ${session.withdrawAccount}\n\n⏰ Processing Time:\n• Usually within 1-2 hours\n• 24/7 processing available\n\n⚠️ Important:\n• Double-check account number\n• Ensure account is active\n\n✅ Ready to submit?`;
    },
    
    SUCCESS: (request) => `⏳ Withdrawal Request Submitted Successfully! ⏳\n\n✅ Request Details:\n💵 Amount: ${formatCurrency(request.amount)}\n📉 Fee: ${formatCurrency(request.fee)}\n💰 Net Amount: ${formatCurrency(request.netAmount)}\n🏦 Method: ${request.method}\n📱 Account: ${request.account}\n\n📊 Status: Pending Admin Approval 🔄\n\n🔑 Request ID: ${request.id}\n\n💰 Account Update:\n• Old Balance: ${formatCurrency(request.oldBalance)}\n• New Balance: ${formatCurrency(request.newBalance)}\n• Amount Held: ${formatCurrency(request.amount)} ⏳\n\n⏰ Processing Time:\n• Usually within 1-2 hours\n• You will be notified upon completion\n\n💡 Note:\nFunds will be temporarily held until approval.\n\n📞 Support Available 24/7`,
    
    APPROVED: (withdraw) => `✅ Withdrawal Request Approved! ✅\n\n🎉 Great news! Your withdrawal has been approved.\n\n📋 Transaction Details:\n💰 Amount: ${formatCurrency(withdraw.amount)}\n📉 Processing Fee: ${formatCurrency(withdraw.fee)}\n💵 Net Amount: ${formatCurrency(withdraw.netAmount)}\n🏦 Method: ${withdraw.method}\n📱 Account: ${withdraw.account}\n📅 Date: ${withdraw.date}\n⏰ Time: ${withdraw.time}\n\n🔄 Current Status: Funds Transfer in Progress ⏳\n\n💡 What happens next:\n1. Funds are being transferred to your account\n2. Usually takes 1-2 hours\n3. You'll get another notification upon completion\n\n📞 Need help? Contact support 24/7.`,
    
    COMPLETED: (withdraw) => `🎉 Funds Transfer Successful! 🎉\n\n✅ Transaction Completed Successfully\n\n📋 Transaction Summary:\n💰 Amount: ${formatCurrency(withdraw.amount)}\n📉 Processing Fee: ${formatCurrency(withdraw.fee)}\n💵 Net Amount Sent: ${formatCurrency(withdraw.netAmount)}\n🏦 Payment Method: ${withdraw.method}\n📱 Account Number: ${withdraw.account}\n📅 Transfer Date: ${withdraw.date}\n⏰ Transfer Time: ${withdraw.time}\n\n✅ Status: Successfully Transferred ✅\n\n💡 Next Steps:\n1. Check your ${withdraw.method} account\n2. Confirm receipt of funds\n3. Contact us if any issues\n\n✨ Thank you for using our service!\nWe look forward to serving you again.\n\n📞 24/7 Support Available`,
    
    REJECTED: (withdraw, reason) => `❌ Withdrawal Request Rejected ❌\n\n⚠️ Transaction Details:\n💰 Amount: ${formatCurrency(withdraw.amount)}\n🏦 Method: ${withdraw.method}\n📱 Account: ${withdraw.account}\n📅 Date: ${withdraw.date}\n⏰ Time: ${withdraw.time}\n\n📝 Rejection Reason:\n${reason}\n\n💰 Balance Update:\n✅ Your balance has been restored.\n• Previous Balance: ${formatCurrency(withdraw.oldBalance)}\n• New Balance: ${formatCurrency(withdraw.newBalance)}\n• Amount Returned: ${formatCurrency(withdraw.amount)}\n\n💡 What to do next:\n1. Check the reason above\n2. Contact support if needed\n3. Submit a new request if applicable\n\n📞 Support Available 24/7\nWe're here to help!`
};

// ===== BALANCE MESSAGES =====
const BALANCE_MESSAGES = {
    SUMMARY: (user) => {
        const { date, time } = require('./utils.js').getCurrentDateTime();
        let message = '💰 Account Balance Summary 💰\n\n';
        message += '👤 Account Holder: ' + user.firstName + '\n';
        message += '💳 Current Balance: ' + formatCurrency(user.balance) + '\n';
        message += '📅 Date: ' + date + '\n';
        message += '⏰ Time: ' + time + '\n\n';
        
        const today = date;
        if (user.dailyDeposits && user.dailyDeposits.date === today) {
            message += '📥 Today\'s Deposit Activity:\n';
            message += '   • Amount: ' + formatCurrency(user.dailyDeposits.amount) + '/20,000 PKR\n';
            message += '   • Transactions: ' + user.dailyDeposits.count + '/5\n\n';
        } else {
            message += '📥 Today\'s Deposit Activity:\n';
            message += '   • No deposits today\n\n';
        }
        
        if (user.dailyWithdrawals && user.dailyWithdrawals.date === today) {
            message += '📤 Today\'s Withdrawal Activity:\n';
            message += '   • Amount: ' + formatCurrency(user.dailyWithdrawals.amount) + '/15,000 PKR\n';
            message += '   • Transactions: ' + user.dailyWithdrawals.count + '/3\n\n';
        } else {
            message += '📤 Today\'s Withdrawal Activity:\n';
            message += '   • No withdrawals today\n\n';
        }

        message += '💡 Quick Actions:';
        return message;
    },
    
    INSUFFICIENT_FOR_WITHDRAWAL: (balance, minAmount) => {
        const needed = minAmount - balance;
        return `❌ Minimum Balance Required ❌\n\n📝 Minimum balance for withdrawal is ${formatCurrency(minAmount)}.\n\n💰 Your Current Balance: ${formatCurrency(balance)}\n\n💡 Suggestions:\n1. Deposit more funds\n2. Wait for pending deposits\n3. Check transaction history\n\n📥 Ready to deposit?`;
    }
};

// ===== TRANSACTION MESSAGES =====
const TRANSACTION_MESSAGES = {
    NO_TRANSACTIONS: `📊 Transaction History 📊\n\n📭 No transactions found.\n\n💡 Start your journey:\nMake your first deposit or purchase!\n\n🚀 Get started with:`,
    
    HISTORY: (user) => {
        const recentTransactions = user.transactions.slice(-10).reverse();
        
        let historyMsg = '📜 Transaction History 📜\n\n';
        historyMsg += '📊 Total Transactions: ' + user.transactions.length + '\n\n';
        historyMsg += '🔄 Recent Activity (Last 10):\n\n';

        recentTransactions.forEach((t, i) => {
            const emoji = t.type.includes('Deposit') ? '📥' : 
                         t.type.includes('Withdrawal') ? '📤' : 
                         t.type.includes('Bot') ? '🤖' : 
                         t.type.includes('Plan') ? '📦' : '💳';
            
            const statusEmoji = t.status === 'approved' ? '✅' : 
                              t.status === 'rejected' ? '❌' : 
                              t.status === 'completed' ? '✅' : '🔄';
            
            historyMsg += emoji + ' ' + t.type + '\n';
            historyMsg += '   💰 Amount: ' + formatCurrency(t.amount) + '\n';
            historyMsg += '   📅 Date: ' + t.date + ' at ' + t.time + '\n';
            
            if (t.bonus) historyMsg += '   🎁 Bonus: +' + formatCurrency(t.bonus) + '\n';
            if (t.fee) historyMsg += '   📉 Fee: -' + formatCurrency(t.fee) + '\n';
            if (t.netAmount) historyMsg += '   💵 Net: ' + formatCurrency(t.netAmount) + '\n';
            if (t.status) historyMsg += '   📊 Status: ' + statusEmoji + ' ' + t.status + '\n';
            if (t.rejectionReason) historyMsg += '   📝 Reason: ' + t.rejectionReason + '\n';
            
            historyMsg += '\n';
        });

        if (user.transactions.length > 10) {
            historyMsg += '📖 Showing last 10 of ' + user.transactions.length + ' transactions\n\n';
        }

        historyMsg += '💡 Export Options:\nContact support for full transaction history.';
        return historyMsg;
    }
};

// ===== SUPPORT MESSAGES =====
const SUPPORT_MESSAGES = {
    CONTACT: `📞 24/7 Customer Support 📞\n\n🔗 Click the link below to contact our support team:\n\n👉 @help_paid_whatsapp_bot\n\n⏰ Support Hours: 24/7\n⚡ Response Time: Usually within minutes\n\n💡 How we can help:\n• Account issues\n• Deposit/Withdrawal problems\n• Bot setup assistance\n• Technical support\n• General inquiries`
};

// ===== ADMIN MESSAGES =====
const ADMIN_MESSAGES = {
    ALL_USERS_STATS: (stats) => {
        const { date, time } = require('./utils.js').getCurrentDateTime();
        return `📊 All Users Statistics 📊\n\n` +
               `📅 Date: ${date}\n` +
               `⏰ Time: ${time}\n\n` +
               `👥 Total Users: ${stats.userCount}\n` +
               `✅ Active Users: ${stats.activeUsers}\n` +
               `🚫 Banned Users: ${stats.bannedUsers}\n\n` +
               `💰 Total System Balance: ${formatCurrency(stats.totalBalance)}\n` +
               `📥 Total Deposits: ${formatCurrency(stats.totalDeposits)}\n` +
               `📤 Total Withdrawals: ${formatCurrency(stats.totalWithdrawals)}\n\n` +
               `💳 Average Balance per User: ${stats.userCount > 0 ? formatCurrency(Math.round(stats.totalBalance / stats.userCount)) : formatCurrency(0)}`;
    },
    
    USER_LIST: (userList) => {
        let message = '📋 First 10 Users 📋\n\n';
        userList.forEach(([username, user], index) => {
            const status = user.isBanned ? '🚫 BANNED' : '✅ ACTIVE';
            message += `${index + 1}. ${user.firstName} (@${username})\n`;
            message += `   📱 Phone: ${user.phone}\n`;
            message += `   💰 Balance: ${formatCurrency(user.balance)}\n`;
            message += `   📅 Registered: ${user.registered}\n`;
            message += `   📊 Status: ${status}\n\n`;
        });

        if (Object.keys(userList).length > 10) {
            message += `📖 Showing 10 of ${Object.keys(userList).length} users\n`;
        }
        return message;
    },
    
    USER_DETAILS: (username, user) => {
        const status = user.isBanned ? '🚫 BANNED' : '✅ ACTIVE';
        let message = `👤 User Details: @${username} 👤\n\n`;
        message += `📛 Name: ${user.firstName}\n`;
        message += `📱 Phone: ${user.phone}\n`;
        message += `🎂 Date of Birth: ${user.dob}\n`;
        message += `📅 Registered: ${user.registered}\n`;
        message += `💰 Current Balance: ${formatCurrency(user.balance)}\n`;
        message += `📊 Account Status: ${status}\n\n`;

        const today = require('./utils.js').getCurrentDateTime().date;
        if (user.dailyDeposits && user.dailyDeposits.date === today) {
            message += `📥 Today's Deposits:\n`;
            message += `   • Amount: ${formatCurrency(user.dailyDeposits.amount)}/20,000 PKR\n`;
            message += `   • Transactions: ${user.dailyDeposits.count}/5\n\n`;
        }
        
        if (user.dailyWithdrawals && user.dailyWithdrawals.date === today) {
            message += `📤 Today's Withdrawals:\n`;
            message += `   • Amount: ${formatCurrency(user.dailyWithdrawals.amount)}/15,000 PKR\n`;
            message += `   • Transactions: ${user.dailyWithdrawals.count}/3\n\n`;
        }

        if (user.pendingDeposits && user.pendingDeposits.length > 0) {
            message += `📥 Pending Deposits: ${user.pendingDeposits.length}\n`;
        }
        
        if (user.pendingWithdrawals && user.pendingWithdrawals.length > 0) {
            message += `📤 Pending Withdrawals: ${user.pendingWithdrawals.length}\n`;
        }

        const totalTransactions = user.transactions ? user.transactions.length : 0;
        message += `\n📊 Total Transactions: ${totalTransactions}`;
        return message;
    }
};

// ===== ERROR MESSAGES =====
const ERROR_MESSAGES = {
    SESSION_EXPIRED: '📝 Session expired. Please login again.',
    USER_NOT_FOUND: '❌ User not found.',
    NOT_LOGGED_IN: '📝 Please login first.',
    ADMIN_ONLY: '⚠️ Admin access only!',
    INVALID_INPUT: '❌ Invalid input. Please try again.',
    SERVER_ERROR: '⚠️ Server error. Please try again later.'
};

module.exports = {
    WELCOME_MESSAGES,
    AUTH_MESSAGES,
    PLAN_MESSAGES,
    DEPOSIT_MESSAGES,
    WITHDRAWAL_MESSAGES,
    BALANCE_MESSAGES,
    TRANSACTION_MESSAGES,
    SUPPORT_MESSAGES,
    ADMIN_MESSAGES,
    ERROR_MESSAGES
};
