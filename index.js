require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const User = require("./models/User");
const Appointment = require("./models/Appointment");

const bot = new Telegraf(process.env.BOT_TOKEN);
const userSelections = {};
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

// اتصال به MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("اتصال به MongoDB برقرار شد"))
  .catch((err) => console.error("خطا در اتصال به MongoDB:", err));

// کیبورد اصلی
const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان"],
  ["📅 رزرو نوبت"],
  ["👥 لیست کاربران"],
]).resize();

const usersKeyboard = Markup.keyboard([
  ["➕ افزودن کاربر"],
  ["🔙 بازگشت به منو اصلی"],
]).resize();

// پیام خوش‌آمدگویی
bot.start((ctx) => {
  ctx.reply("سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️", mainKeyboard);
});

// نمایش لیست پزشکان
bot.hears("📋 لیست پزشکان", async (ctx) => {
  try {
    const doctors = await Doctor.find();
    let message = "👨‍⚕️ لیست پزشکان:\n\n";
    doctors.forEach((doc) => {
      message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
    });
    ctx.reply(message);
  } catch (err) {
    console.error(err);
    ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
  }
});

// شروع فرآیند رزرو نوبت
bot.hears("📅 رزرو نوبت", async (ctx) => {
  try {
    const doctors = await Doctor.find();
    ctx.reply(
      "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
      Markup.keyboard([
        ...doctors.map((doc) => [doc.name]),
        ["🔙 بازگشت به منو اصلی"],
      ]).resize()
    );
  } catch (err) {
    console.error(err);
    ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
  }
});

// انتخاب پزشک
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const userStep = userSelections[ctx.from.id]?.step;

  // مدیریت افزودن کاربر
  if (userStep === "waiting_for_name") {
    userSelections[ctx.from.id].name = text;
    userSelections[ctx.from.id].step = "waiting_for_phone";
    ctx.reply("📞 لطفاً شماره تلفن خود را ارسال کنید:");
    return;
  } else if (userStep === "waiting_for_phone") {
    const phone = text;
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return ctx.reply("❌ شماره تلفن معتبر نیست. لطفاً شماره‌ای با فرمت 09xxxxxxxxx وارد کنید.");
    }
    try {
      await new User({
        telegramId: ctx.from.id,
        name: userSelections[ctx.from.id].name,
        phone: phone,
      }).save();
      ctx.reply(
        `✅ کاربر *${userSelections[ctx.from.id].name}* با شماره *${phone}* ثبت شد.`,
        { parse_mode: "Markdown", ...usersKeyboard }
      );
      delete userSelections[ctx.from.id];
    } catch (err) {
      console.error(err);
      ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
    }
    return;
  }

  // بررسی انتخاب پزشک
  const doctor = await Doctor.findOne({ name: text });
  if (doctor) {
    userSelections[ctx.from.id] = { doctor };
    ctx.reply(
      `✅ پزشک انتخابی: *${doctor.name}*\n📅 لطفاً روز موردنظر را انتخاب کنید:`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ...availableDays.map((day) => [day]),
          ["🔙 بازگشت به انتخاب پزشک"],
        ]).resize(),
      }
    );
    return;
  }

  // بررسی انتخاب روز
  if (availableDays.includes(text) && userSelections[ctx.from.id]?.doctor) {
    userSelections[ctx.from.id].day = text;
    ctx.reply(`📅 روز انتخابی: *${text}*\n⏳ لطفاً یک ساعت انتخاب کنید:`, {
      parse_mode: "Markdown",
      ...Markup.keyboard([
        ...availableTimes.map((time) => [time]),
        ["🔙 بازگشت به انتخاب روز"],
      ]).resize(),
    });
    return;
  }

  // بررسی انتخاب زمان
  if (availableTimes.includes(text) && userSelections[ctx.from.id]?.day) {
    const { doctor, day } = userSelections[ctx.from.id];
    try {
      await new Appointment({
        userId: ctx.from.id,
        doctorId: doctor._id,
        day: day,
        time: text,
      }).save();
      ctx.reply(
        `✅ **نوبت شما با موفقیت ثبت شد!**\n\n👨‍⚕️ *دکتر:* ${doctor.name}\n📅 *روز:* ${day}\n⏳ *زمان:* ${text}\n\n📌 لطفاً رأس ساعت مراجعه کنید.`,
        { parse_mode: "Markdown", ...mainKeyboard }
      );
      delete userSelections[ctx.from.id];
    } catch (err) {
      console.error(err);
      ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
    }
    return;
  }
});

// بازگشت به انتخاب پزشک
bot.hears("🔙 بازگشت به انتخاب پزشک", async (ctx) => {
  try {
    const doctors = await Doctor.find();
    ctx.reply(
      "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
      Markup.keyboard([
        ...doctors.map((doc) => [doc.name]),
        ["🔙 بازگشت به منو اصلی"],
      ]).resize()
    );
  } catch (err) {
    console.error(err);
    ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
  }
});

// بازگشت به انتخاب روز
bot.hears("🔙 بازگشت به انتخاب روز", async (ctx) => {
  if (!userSelections[ctx.from.id]?.doctor) {
    return ctx.reply("❌ لطفاً ابتدا پزشک خود را انتخاب کنید.");
  }
  ctx.reply(
    `✅ پزشک انتخابی: *${userSelections[ctx.from.id].doctor.name}*\n📅 لطفاً روز موردنظر را انتخاب کنید:`,
    {
      parse_mode: "Markdown",
      ...Markup.keyboard([
        ...availableDays.map((day) => [day]),
        ["🔙 بازگشت به انتخاب پزشک"],
      ]).resize(),
    }
  );
});

// بازگشت به منو اصلی
bot.hears("🔙 بازگشت به منو اصلی", (ctx) => {
  ctx.reply("🏠 بازگشت به منو اصلی:", mainKeyboard);
});

// مدیریت کاربران
bot.hears("👥 لیست کاربران", (ctx) => {
  ctx.reply("👥 مدیریت کاربران:", usersKeyboard);
});

bot.hears("➕ افزودن کاربر", (ctx) => {
  ctx.reply("📌 لطفاً نام و نام خانوادگی خود را وارد کنید:");
  userSelections[ctx.from.id] = { step: "waiting_for_name" };
});

// مدیریت خطاها
bot.catch((err, ctx) => {
  console.error(`خطا برای ${ctx.from.id}:`, err);
  ctx.reply("❌ مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.");
});

bot.launch();
console.log("🤖 ربات فعال شد!");