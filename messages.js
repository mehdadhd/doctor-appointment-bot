const { CHANNELS } = require("./config");

// 🎯 ارسال پیام عضویت اجباری بدون لینک مستقیم کانال
function getJoinMessage() {
  return {
    text: "📢 برای استفاده از ربات، ابتدا در کانال‌های زیر عضو شوید، سپس دکمه «بررسی عضویت» را بزنید:",
    options: {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📢 عضویت در کانال 1",
              url: `https://t.me/${CHANNELS[0].substring(1)}`,
            },
            {
              text: "📢 عضویت در کانال 2",
              url: `https://t.me/${CHANNELS[1].substring(1)}`,
            },
          ],
          [{ text: "✅ بررسی عضویت", callback_data: "check_membership" }],
        ],
      },
    },
  };
}

module.exports = {
  getJoinMessage,
};
