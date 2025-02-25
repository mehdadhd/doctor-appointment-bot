require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// دریافت توکن از متغیر محیطی
const token = process.env.TELEGRAM_BOT_TOKEN;

// ایجاد نمونه‌ای از ربات
const bot = new TelegramBot(token, { polling: true });

// پاسخ به دستورات مختلف
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `سلام ${msg.from.first_name}! خوش اومدی 😊`);
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "دستورات موجود:\n/start - شروع ربات\n/help - راهنما"
  );
});

bot.on("message", (msg) => {
  if (msg.text.toLowerCase() === "سلام") {
    bot.sendMessage(msg.chat.id, "سلام! چطوری؟ 😊");
  }
});

console.log("ربات فعال شد...");
