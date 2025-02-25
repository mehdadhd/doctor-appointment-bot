const bot = require("./botInstance");
const { getUserMembershipStatus } = require("./membership");
const { getJoinMessage } = require("./messages");

// ⚡️ رویداد /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  let status = await getUserMembershipStatus(userId);

  if (status[0] && status[1]) {
    bot.sendMessage(
      chatId,
      `🎉 خوش آمدید ${msg.from.first_name}! شما اکنون می‌توانید از خدمات ربات استفاده کنید.`
    );
  } else {
    let joinMessage = getJoinMessage(status);
    bot.sendMessage(chatId, joinMessage.text, joinMessage.options);
  }
});

// ⚡️ رویداد کلیک روی دکمه بررسی عضویت
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check_membership") {
    let status = await getUserMembershipStatus(userId);

    if (status[0] && status[1]) {
      bot.sendMessage(
        chatId,
        `🎉 تبریک! شما عضو کانال‌ها هستید و می‌توانید از خدمات ربات استفاده کنید.`
      );
    } else {
      let joinMessage = getJoinMessage(status);
      bot.sendMessage(
        chatId,
        "⚠ هنوز در برخی از کانال‌ها عضو نشده‌اید. لطفاً عضویت خود را کامل کنید:",
        joinMessage.options
      );
    }
  }
});

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
