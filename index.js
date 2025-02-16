require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const mongoose = require("mongoose");

// اتصال به دیتابیس MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// مدل‌های پایگاه داده
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    telegramId: { type: Number, unique: true },
    name: String,
    phone: String,
  })
);

const Appointment = mongoose.model(
  "Appointment",
  new mongoose.Schema({
    userId: Number,
    doctor: String,
    day: String,
    time: String,
  })
);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

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

const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان"],
  ["📅 رزرو نوبت"],
  ["👥 لیست کاربران"],
]).resize();

bot.start((ctx) => {
  ctx.reply("سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️", mainKeyboard);
});

// لیست پزشکان (بهتر است از دیتابیس خوانده شود)
const doctors = [
  { name: "دکتر رضایی", specialty: "قلب و عروق" },
  { name: "دکتر احمدی", specialty: "داخلی" },
];

bot.hears("📋 لیست پزشکان", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

// ثبت نوبت
bot.hears("📅 رزرو نوبت", (ctx) => {
  ctx.session.userSelections = {};
  ctx.reply(
    "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت"],
    ]).resize()
  );
});

doctors.forEach((doc) => {
  bot.hears(doc.name, (ctx) => {
    ctx.session.userSelections = { doctor: doc.name };
    ctx.reply(
      "📅 لطفاً روز موردنظر را انتخاب کنید:",
      Markup.keyboard([
        ...availableDays.map((day) => [day]),
        ["🔙 بازگشت"],
      ]).resize()
    );
  });
});

availableDays.forEach((day) => {
  bot.hears(day, (ctx) => {
    if (!ctx.session.userSelections?.doctor)
      return ctx.reply("❌ لطفاً ابتدا پزشک را انتخاب کنید.");
    ctx.session.userSelections.day = day;
    ctx.reply(
      "⏳ لطفاً ساعت موردنظر را انتخاب کنید:",
      Markup.keyboard([
        ...availableTimes.map((time) => [time]),
        ["🔙 بازگشت"],
      ]).resize()
    );
  });
});

availableTimes.forEach((time) => {
  bot.hears(time, async (ctx) => {
    if (
      !ctx.session.userSelections?.doctor ||
      !ctx.session.userSelections?.day
    ) {
      return ctx.reply("❌ لطفاً ابتدا پزشک و روز را انتخاب کنید.");
    }

    const { doctor, day } = ctx.session.userSelections;
    await Appointment.create({
      userId: ctx.from.id,
      doctor,
      day,
      time,
    });

    ctx.reply(
      `✅ نوبت شما ثبت شد!\n\n👨‍⚕️ دکتر: ${doctor}\n📅 روز: ${day}\n⏳ زمان: ${time}`
    );
    ctx.session.userSelections = null;
  });
});

// ثبت کاربران
bot.hears("👥 لیست کاربران", (ctx) => {
  ctx.reply("📌 لطفاً نام خود را وارد کنید:");
  ctx.session.registrationStep = "waiting_for_name";
});

bot.on("text", async (ctx) => {
  if (ctx.session.registrationStep === "waiting_for_name") {
    ctx.session.newUser = { name: ctx.message.text };
    ctx.session.registrationStep = "waiting_for_phone";
    return ctx.reply("📞 لطفاً شماره تلفن خود را ارسال کنید:");
  }

  if (ctx.session.registrationStep === "waiting_for_phone") {
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(ctx.message.text)) {
      return ctx.reply("❌ شماره تلفن نامعتبر است. لطفاً مجدداً وارد کنید.");
    }

    ctx.session.newUser.phone = ctx.message.text;
    await User.create({
      telegramId: ctx.from.id,
      name: ctx.session.newUser.name,
      phone: ctx.session.newUser.phone,
    });

    ctx.reply(
      `✅ ثبت شد!\nنام: ${ctx.session.newUser.name}\n📞 تلفن: ${ctx.session.newUser.phone}`
    );
    ctx.session.registrationStep = null;
  }
});

bot.launch();
console.log("🤖 ربات فعال شد!");
