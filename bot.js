const bot = require("./botInstance");
const { getUserMembershipStatus } = require("./membership");
const { getJoinMessage } = require("./messages");

// ⚡️ منوهای کیبوردی
const mainMenu = {
  reply_markup: {
    keyboard: [[{ text: "📝 لیست کاربران" }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

const userListMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "➕ افزودن کاربر جدید" }],
      [{ text: "🔙 بازگشت به منوی اصلی" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

// ⚡️ بررسی عضویت و نمایش منو مناسب
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  let status = await getUserMembershipStatus(userId);
  if (status[0] && status[1]) {
    bot.sendMessage(
      chatId,
      `🎉 خوش آمدید ${msg.from.first_name}! شما اکنون می‌توانید از خدمات ربات استفاده کنید.`,
      mainMenu
    );
  } else {
    let joinMessage = getJoinMessage(status);
    bot.sendMessage(chatId, joinMessage.text, joinMessage.options);
  }
});

// ⚡️ بررسی عضویت در کانال‌ها هنگام کلیک روی دکمه بررسی عضویت
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check_membership") {
    let status = await getUserMembershipStatus(userId);

    if (status[0] && status[1]) {
      bot.sendMessage(
        chatId,
        `🎉 تبریک! شما عضو کانال‌ها هستید و می‌توانید از خدمات ربات استفاده کنید.`,
        mainMenu
      );
    } else {
      let joinMessage = getJoinMessage(status);
      bot.editMessageText(joinMessage.text, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: joinMessage.options.reply_markup,
      });
    }
  }
});

// ⚡️ مدیریت دکمه‌های منو (فقط برای کاربران عضو فعال است)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  let status = await getUserMembershipStatus(userId);
  if (!status[0] || !status[1]) {
    let joinMessage = getJoinMessage(status);
    return bot.sendMessage(
      chatId,
      "⚠ برای استفاده از دکمه‌ها ابتدا باید در کانال‌ها عضو شوید.",
      joinMessage.options
    );
  }

  if (userMessage === "📝 لیست کاربران") {
    bot.sendMessage(
      chatId,
      "لطفاً یکی از گزینه‌ها را انتخاب کنید:",
      userListMenu
    );
  } else if (userMessage === "🔙 بازگشت به منوی اصلی") {
    bot.sendMessage(chatId, "شما به منوی اصلی برگشتید:", mainMenu);
  } else if (userMessage === "➕ افزودن کاربر جدید") {
    bot.sendMessage(chatId, "لطفاً اطلاعات کاربر جدید را وارد کنید.");
  }
});
