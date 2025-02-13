require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const doctors = require("./src/doctors");

const bot = new Telegraf(process.env.BOT_TOKEN);

// 📌 کیبورد اصلی ربات
const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان", "📅 رزرو نوبت"],
]).resize();

// 📌 پیام خوشامدگویی و نمایش کیبورد اصلی
bot.start((ctx) => {
  ctx.reply(
    "سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️\nاز منوی زیر گزینه موردنظر را انتخاب کنید:",
    mainKeyboard
  );
});

// 📌 نمایش لیست پزشکان
bot.hears("📋 لیست پزشکان", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

// 📌 نمایش لیست پزشکان (دکمه‌های شیشه‌ای)
bot.hears("📅 رزرو نوبت", (ctx) => {
  let doctorButtons = doctors.map((doc) => [
    Markup.button.callback(
      `${doc.name} (${doc.specialty})`,
      `select_doctor_${doc.id}`
    ),
  ]);

  ctx.reply("👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:", {
    reply_markup: Markup.inlineKeyboard(doctorButtons),
  });
});

// 📅 لیست روزهای قابل انتخاب
const availableDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

// ⏳ انتخاب روز بعد از انتخاب پزشک
bot.action(/^select_doctor_\d+$/, (ctx) => {
  const doctorId = ctx.match[0].split("_")[2];
  const doctor = doctors.find((d) => d.id == doctorId);

  let dayButtons = availableDays.map((day) =>
    Markup.button.callback(day, `select_day_${doctorId}_${day}`)
  );

  ctx.reply(
    `✅ پزشک انتخابی: *${doctor.name}*\n📅 لطفاً روز موردنظر را انتخاب کنید:`,
    {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard(dayButtons, { columns: 2 }),
    }
  );
});

// ⏳ لیست ساعت‌های در دسترس
const availableTimes = ["10:00", "11:00", "14:00", "16:00"];

// ⏳ انتخاب ساعت بعد از انتخاب روز
bot.action(/^select_day_\d+_.+$/, (ctx) => {
  const [_, doctorId, day] = ctx.match[0].split("_");
  const doctor = doctors.find((d) => d.id == doctorId);

  let timeButtons = availableTimes.map((time) =>
    Markup.button.callback(time, `select_time_${doctorId}_${day}_${time}`)
  );

  ctx.reply(`📅 روز انتخابی: *${day}*\n⏳ لطفاً یک ساعت انتخاب کنید:`, {
    parse_mode: "Markdown",
    reply_markup: Markup.inlineKeyboard(timeButtons, { columns: 2 }),
  });
});

// ✅ ثبت نهایی نوبت و پیام تأیید
bot.action(/^select_time_\d+_.+_\d+:\d+$/, (ctx) => {
  const [_, doctorId, day, time] = ctx.match[0].split("_");
  const doctor = doctors.find((d) => d.id == doctorId);

  ctx.reply(
    `✅ **نوبت شما با موفقیت ثبت شد!**\n\n👨‍⚕️ *دکتر:* ${doctor.name}\n📅 *روز:* ${day}\n⏳ *زمان:* ${time}\n\n📌 لطفاً رأس ساعت مراجعه کنید.`,
    { parse_mode: "Markdown" }
  );
});

// 🚀 اجرای ربات
bot.launch();
console.log("🤖 ربات فعال شد!");
