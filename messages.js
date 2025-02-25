const { CHANNELS } = require("./config");

// 🎯 پیام عضویت اجباری بر اساس وضعیت عضویت
function getJoinMessage(status) {
  let text =
    "📢 برای استفاده از ربات، ابتدا در کانال‌های زیر عضو شوید و سپس دکمه «بررسی عضویت» را بزنید:";
  let buttons = [];

  if (!status[0]) {
    buttons.push([
      {
        text: "📢 عضویت در کانال 1",
        url: `https://t.me/${CHANNELS[0].substring(1)}`,
      },
    ]);
  }
  if (!status[1]) {
    buttons.push([
      {
        text: "📢 عضویت در کانال 2",
        url: `https://t.me/${CHANNELS[1].substring(1)}`,
      },
    ]);
  }

  buttons.push([
    { text: "✅ بررسی مجدد عضویت", callback_data: "check_membership" },
  ]);

  return {
    text,
    options: {
      reply_markup: {
        inline_keyboard: buttons,
      },
    },
  };
}

module.exports = {
  getJoinMessage,
};
