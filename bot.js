const bot = require("./botInstance");
const { getUserMembershipStatus } = require("./membership");
const { getJoinMessage } = require("./messages");
// ⚡️ منوی اصلی که فقط دکمه "لیست کاربران" را دارد
const mainMenu = {
  reply_markup: {
    keyboard: [[{ text: "📝 لیست کاربران" }]],
    resize_keyboard: true, // اندازه کیبورد به طور خودکار
    one_time_keyboard: true, // بعد از انتخاب دکمه، کیبورد بسته می‌شود
  },
};

// ⚡️ منوی دوم که وقتی دکمه "لیست کاربران" زده می‌شود نمایش داده می‌شود
const userListMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "➕ افزودن کاربر جدید" }],
      [{ text: "🔙 بازگشت به منوی اصلی" }],
    ],
    resize_keyboard: true, // اندازه کیبورد به طور خودکار
    one_time_keyboard: true, // بعد از انتخاب دکمه، کیبورد بسته می‌شود
  },
};

// ⚡️ رویداد /start که منوی اصلی را به کاربر نمایش می‌دهد
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "سلام، به ربات خوش آمدید. لطفاً گزینه‌ای را انتخاب کنید:",
    mainMenu
  );
});

// ⚡️ رویداد کلیک روی دکمه "لیست کاربران"
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // اگر کاربر دکمه "لیست کاربران" را زده باشد
  if (userMessage === "📝 لیست کاربران") {
    bot.sendMessage(
      chatId,
      "لطفاً یکی از گزینه‌ها را انتخاب کنید:",
      userListMenu
    );
  }

  // اگر کاربر دکمه "بازگشت به منوی اصلی" را زده باشد
  if (userMessage === "🔙 بازگشت به منوی اصلی") {
    bot.sendMessage(chatId, "شما به منوی اصلی برگشتید:", mainMenu);
  }
});

// ⚡️ رویداد کلیک روی دکمه‌های "افزودن کاربر جدید" و "بازگشت"
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // دکمه افزودن کاربر جدید
  if (userMessage === "➕ افزودن کاربر جدید") {
    bot.sendMessage(chatId, "لطفاً اطلاعات کاربر جدید را وارد کنید.");
  }
});
