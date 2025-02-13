require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const doctors = require("./src/doctors");

const bot = new Telegraf(process.env.BOT_TOKEN);

// 📌 دکمه‌های کیبورد اصلی (Reply Keyboard)
const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان", "📅 رزرو نوبت"],
]).resize();

// 📌 پیام خوشامدگویی + نمایش منوی کیبوردی
bot.start((ctx) => {
  ctx.reply(
    "سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️\nاز منوی زیر گزینه موردنظر را انتخاب کنید:",
    mainKeyboard
  );
});

// 📌 نمایش لیست پزشکان (دکمه کیبوردی)
bot.hears("📋 لیست پزشکان", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

// 📌 نمایش لیست پزشکان هنگام انتخاب "📅 رزرو نوبت"
bot.hears("📅 رزرو نوبت", (ctx) => {
  let doctorButtons = doctors.map((doc) => [
    Markup.button.callback(doc.name, `select_doctor_${doc.id}`),
  ]);

  ctx.reply("لطفاً پزشک موردنظر را انتخاب کنید:", {
    reply_markup: Markup.inlineKeyboard(doctorButtons),
  });
});

// ⏳ نمایش لیست زمان‌های موجود پس از انتخاب پزشک
const availableTimes = ["10:00", "11:00", "14:00", "16:00"];

bot.action(/^select_doctor_\d+$/, (ctx) => {
  const doctorId = ctx.match[0].split("_")[2]; // گرفتن ID پزشک
  const doctor = doctors.find((d) => d.id == doctorId);

  let timeButtons = availableTimes.map((time) =>
    Markup.button.callback(time, `select_time_${doctorId}_${time}`)
  );

  ctx.reply(
    `✅ پزشک انتخابی: *${doctor.name}*\n⏳ لطفاً یک زمان انتخاب کنید:`,
    {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard(timeButtons, { columns: 2 }),
    }
  );
});

// ✅ ثبت نهایی نوبت
bot.action(/^select_time_\d+_\d+:\d+$/, (ctx) => {
  const [_, doctorId, time] = ctx.match[0].split("_");
  const doctor = doctors.find((d) => d.id == doctorId);

  ctx.reply(
    `📅 نوبت شما ثبت شد!\n\n👨‍⚕️ *دکتر:* ${doctor.name}\n⏳ *زمان:* ${time}\n✅ لطفاً رأس ساعت مراجعه کنید.`,
    { parse_mode: "Markdown" }
  );
});

// 🚀 اجرای ربات
bot.launch();
console.log("🤖 ربات فعال شد!");
