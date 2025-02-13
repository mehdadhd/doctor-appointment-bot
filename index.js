require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const doctors = require("./src/doctors");

const bot = new Telegraf(process.env.BOT_TOKEN);

// 📌 کیبورد اصلی
const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان", "📅 رزرو نوبت"],
]).resize();

// 📌 لیست روزها و ساعت‌ها
const availableDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
const availableTimes = ["10:00", "11:00", "14:00", "16:00"];

// 📌 ذخیره وضعیت انتخابی کاربر
const userSelections = {};

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

// 📌 شروع فرآیند رزرو نوبت
bot.hears("📅 رزرو نوبت", (ctx) => {
  ctx.reply(
    "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت به منو اصلی"],
    ]).resize()
  );
});

// 📌 انتخاب پزشک و نمایش روزهای موجود
doctors.forEach((doc) => {
  bot.hears(doc.name, (ctx) => {
    userSelections[ctx.from.id] = { doctor: doc };

    ctx.reply(
      `✅ پزشک انتخابی: *${doc.name}*\n📅 لطفاً روز موردنظر را انتخاب کنید:`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ...availableDays.map((day) => [day]),
          ["🔙 بازگشت به انتخاب پزشک"],
        ]).resize(),
      }
    );
  });
});

// 📌 انتخاب روز و نمایش ساعات موجود
availableDays.forEach((day) => {
  bot.hears(day, (ctx) => {
    if (!userSelections[ctx.from.id]?.doctor) {
      return ctx.reply("❌ لطفاً ابتدا پزشک خود را انتخاب کنید.");
    }

    userSelections[ctx.from.id].day = day;

    ctx.reply(`📅 روز انتخابی: *${day}*\n⏳ لطفاً یک ساعت انتخاب کنید:`, {
      parse_mode: "Markdown",
      ...Markup.keyboard([
        ...availableTimes.map((time) => [time]),
        ["🔙 بازگشت به انتخاب روز"],
      ]).resize(),
    });
  });
});

// 📌 انتخاب ساعت و تأیید نهایی رزرو
availableTimes.forEach((time) => {
  bot.hears(time, (ctx) => {
    if (
      !userSelections[ctx.from.id]?.doctor ||
      !userSelections[ctx.from.id]?.day
    ) {
      return ctx.reply("❌ لطفاً ابتدا پزشک و روز موردنظر را انتخاب کنید.");
    }

    userSelections[ctx.from.id].time = time;
    const { doctor, day } = userSelections[ctx.from.id];

    ctx.reply(
      `✅ **نوبت شما با موفقیت ثبت شد!**\n\n👨‍⚕️ *دکتر:* ${doctor.name}\n📅 *روز:* ${day}\n⏳ *زمان:* ${time}\n\n📌 لطفاً رأس ساعت مراجعه کنید.`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard,
      }
    );

    // حذف اطلاعات انتخاب شده برای رزرو بعدی
    delete userSelections[ctx.from.id];
  });
});

// 📌 دکمه بازگشت به منو اصلی
bot.hears("🔙 بازگشت به منو اصلی", (ctx) => {
  ctx.reply("🏠 بازگشت به منو اصلی:", mainKeyboard);
});

// 📌 دکمه بازگشت به انتخاب پزشک
bot.hears("🔙 بازگشت به انتخاب پزشک", (ctx) => {
  ctx.reply(
    "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت به منو اصلی"],
    ]).resize()
  );
});

// 📌 دکمه بازگشت به انتخاب روز
bot.hears("🔙 بازگشت به انتخاب روز", (ctx) => {
  if (!userSelections[ctx.from.id]?.doctor) {
    return ctx.reply("❌ لطفاً ابتدا پزشک خود را انتخاب کنید.");
  }

  ctx.reply(
    `✅ پزشک انتخابی: *${
      userSelections[ctx.from.id].doctor.name
    }*\n📅 لطفاً روز موردنظر را انتخاب کنید:`,
    {
      parse_mode: "Markdown",
      ...Markup.keyboard([
        ...availableDays.map((day) => [day]),
        ["🔙 بازگشت به انتخاب پزشک"],
      ]).resize(),
    }
  );
});

// 🚀 اجرای ربات
bot.launch();
console.log("🤖 ربات فعال شد!");
