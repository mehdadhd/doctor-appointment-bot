require("dotenv").config();
const { Telegraf } = require("telegraf");
const doctors = require("./src/doctors"); // اضافه کردن لیست پزشکان

const bot = new Telegraf(process.env.BOT_TOKEN);

// دکمه کیبوردی برای نمایش لیست پزشکان
const doctorKeyboard = () => {
  return [[{ text: "نمایش لیست پزشکان", callback_data: "show_doctors" }]];
};

bot.start((ctx) => {
  ctx.reply(
    "سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️\nبرای دریافت لیست پزشکان از دکمه پایین استفاده کنید.",
    {
      reply_markup: {
        inline_keyboard: doctorKeyboard(), // دکمه‌ها را به کاربر نمایش می‌دهد
      },
    }
  );
});

bot.action("show_doctors", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان موجود:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

bot.launch();

console.log("🤖 ربات فعال شد!");
