require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { connectDB } = require("./config/db");
const User = require("./models/User");
const doctors = require("./doctors");

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

const mainKeyboard = Markup.keyboard([
  ["📋 لیست پزشکان"],
  ["📅 رزرو نوبت"],
  ["👥 لیست کاربران"],
]).resize();

const usersKeyboard = Markup.keyboard([
  ["👥 لیست کاربران"],
  ["➕ افزودن کاربر جدید"],
  ["🔙 بازگشت به منو اصلی"],
]).resize();

connectDB();

bot.start((ctx) => {
  ctx.reply("سلام! به ربات ثبت نوبت پزشکی خوش آمدید. 👨‍⚕️", mainKeyboard);
});

bot.hears("📋 لیست پزشکان", (ctx) => {
  let message = "👨‍⚕️ لیست پزشکان:\n\n";
  doctors.forEach((doc) => {
    message += `🩺 ${doc.name} - تخصص: ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

bot.hears("📅 رزرو نوبت", (ctx) => {
  ctx.reply(
    "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت به منو اصلی"],
    ]).resize()
  );
});

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

bot.hears("🔙 بازگشت به انتخاب پزشک", (ctx) => {
  ctx.reply(
    "👨‍⚕️ لطفاً پزشک موردنظر را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت به منو اصلی"],
    ]).resize()
  );
});

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
    delete userSelections[ctx.from.id];
  });
});

bot.hears("🔙 بازگشت به منو اصلی", (ctx) => {
  ctx.reply("🏠 بازگشت به منو اصلی:", mainKeyboard);
});

bot.hears("👥 لیست کاربران", (ctx) => {
  ctx.reply("👥 مدیریت کاربران:", usersKeyboard);
});

bot.hears("👥 لیست کاربران", (ctx) => {
  User.find({}, (err, users) => {
    if (err) {
      ctx.reply("خطا در دریافت لیست کاربران");
      return console.error(err);
    }
    let message = "👥 لیست کاربران:\n\n";
    users.forEach((user, index) => {
      message += `${index + 1}. ${user.name} - کد ملی: ${
        user.nationalId
      } - تلفن: ${user.phone}\n`;
    });
    ctx.reply(message);
  });
});

bot.hears("➕ افزودن کاربر جدید", (ctx) => {
  ctx.reply("📌 لطفاً نام و نام خانوادگی خود را وارد کنید:");
  userSelections[ctx.from.id] = { step: "waiting_for_name" };
});

bot.on("text", (ctx) => {
  const userStep = userSelections[ctx.from.id]?.step;
  if (userStep === "waiting_for_name") {
    userSelections[ctx.from.id].name = ctx.message.text;
    userSelections[ctx.from.id].step = "waiting_for_nationalId";
    ctx.reply("📌 لطفاً کد ملی خود را وارد کنید (فقط عدد):");
  } else if (userStep === "waiting_for_nationalId") {
    const nationalId = parseInt(ctx.message.text);
    if (isNaN(nationalId)) {
      ctx.reply("لطفاً فقط عدد وارد کنید.");
      return;
    }
    userSelections[ctx.from.id].nationalId = nationalId;
    userSelections[ctx.from.id].step = "waiting_for_phone";
    ctx.reply("📞 لطفاً شماره تلفن خود را وارد کنید (فقط عدد):");
  } else if (userStep === "waiting_for_phone") {
    const phone = parseInt(ctx.message.text);
    if (isNaN(phone)) {
      ctx.reply("لطفاً فقط عدد وارد کنید.");
      return;
    }
    const newUser = new User({
      name: userSelections[ctx.from.id].name,
      nationalId: userSelections[ctx.from.id].nationalId,
      phone: phone,
    });

    newUser.save((err, user) => {
      if (err) {
        ctx.reply("خطا در ثبت کاربر جدید.");
        return console.error(err);
      }
      ctx.reply(`✅ کاربر *${user.name}* با موفقیت ثبت شد!`, {
        parse_mode: "Markdown",
      });
      delete userSelections[ctx.from.id];
      ctx.reply("👥 مدیریت کاربران:", usersKeyboard);
    });
  }
});

bot.launch();
console.log("🤖 ربات فعال شد!");
