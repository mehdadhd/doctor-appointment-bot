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

console.log("✅ ربات فعال شد...");
