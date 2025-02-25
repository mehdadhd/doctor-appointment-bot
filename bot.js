const bot = require("./botInstance");
const { getUserMembershipStatus } = require("./membership");
const { getJoinMessage } = require("./messages");

// ⚡️ منوی اصلی
const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "📝 لیست کاربران" }, { text: "🔒 تغییرات امنیتی" }],
      [{ text: "👋 خروج" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

// ⚡️ رویداد /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "سلام، به ربات خوش آمدید. لطفاً گزینه‌ای را انتخاب کنید:",
    mainMenu
  );
});

// ⚡️ رویداد کلیک روی دکمه لیست کاربران
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // اگر کاربر دکمه "لیست کاربران" را زده باشد
  if (userMessage === "📝 لیست کاربران") {
    const usersMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ افزودن کاربر جدید", callback_data: "add_user" }],
          [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "back_to_main" }],
        ],
      },
    };
    bot.sendMessage(chatId, "لطفاً یکی از گزینه‌ها را انتخاب کنید:", usersMenu);
  }

  // اگر کاربر دکمه "بازگشت به منوی اصلی" را زده باشد
  if (userMessage === "🔙 بازگشت به منوی اصلی") {
    bot.sendMessage(chatId, "شما به منوی اصلی برگشتید:", mainMenu);
  }
});

// ⚡️ رویداد کلیک روی دکمه‌های داخلی (inline buttons)
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  // دکمه افزودن کاربر جدید
  if (query.data === "add_user") {
    // اینجا باید منطق افزودن کاربر جدید را پیاده‌سازی کنید.
    bot.sendMessage(chatId, "لطفاً اطلاعات کاربر جدید را وارد کنید.");
  }

  // دکمه بازگشت به منوی اصلی
  if (query.data === "back_to_main") {
    bot.sendMessage(chatId, "شما به منوی اصلی برگشتید:", mainMenu);
  }
});
