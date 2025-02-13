require("dotenv").config();
const { Telegraf } = require("telegraf");
const doctors = require("./src/doctors"); // اضافه کردن لیست پزشکان

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("doctors", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان موجود:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

bot.start((ctx) => {
  ctx.reply(
    "سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️\nبرای دریافت لیست پزشکان از دستور /doctors استفاده کنید."
  );
});

bot.launch();

console.log("🤖 ربات فعال شد!");
