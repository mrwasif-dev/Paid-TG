const { Markup } = require('telegraf');
const { SUPPORT_MESSAGES } = require('./messages.js');
const { supportKeyboard } = require('./keyboards.js');

// ======= SUPPORT HANDLERS =======
async function handleContactSupport(ctx) {
    await ctx.reply(
        SUPPORT_MESSAGES.CONTACT,
        supportKeyboard
    );
}

module.exports = {
    handleContactSupport
};
