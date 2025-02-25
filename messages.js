const { CHANNELS } = require("./config");

// 🎯 ارسال پیام عضویت اجباری
function getJoinMessage() {
    return {
        text: "📢 برای استفاده از ربات، باید در کانال‌های زیر عضو شوید:\n\n" +
              `1️⃣ [کانال اول](https://t.me/${CHANNELS[0].substring(1)})\n` +
              `2️⃣ [کانال دوم](https://t.me/${CHANNELS[1].substring(1)})\n\n` +
              "✅ بعد از عضویت، دکمه «بررسی عضویت» را بزنید.",
        options: {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📢 عضویت در کانال 1", url: `https://t.me/${CHANNELS[0].substring(1)}` },
                        { text: "📢 عضویت در کانال 2", url: `https://t.me/${CHANNELS[1].substring(1)}` }
                    ],
                    [{ text: "✅ بررسی عضویت", callback_data: "check_membership" }]
                ]
            }
        }
    };
}

module.exports = {
    getJoinMessage,
};
