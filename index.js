require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const doctors = require("./src/doctors");
const users = require("./src/users");

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
  ["➕ افزودن کاربر"],
  ["🔙 بازگشت به منو اصلی"],
]).resize();

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

bot.hears("➕ افزودن کاربر", (ctx) => {
  ctx.reply("📌 لطفاً نام و نام خانوادگی خود را وارد کنید:");
  userSelections[ctx.from.id] = { step: "waiting_for_name" };
});

bot.on("text", (ctx) => {
  const userStep = userSelections[ctx.from.id]?.step;
  if (userStep === "waiting_for_name") {
    userSelections[ctx.from.id].name = ctx.message.text;
    userSelections[ctx.from.id].step = "waiting_for_phone";
    ctx.reply("📞 لطفاً شماره تلفن خود را ارسال کنید:");
  } else if (userStep === "waiting_for_phone") {
    userSelections[ctx.from.id].phone = ctx.message.text;
    users.push({
      id: ctx.from.id,
      name: userSelections[ctx.from.id].name,
      phone: userSelections[ctx.from.id].phone,
    });
    ctx.reply(
      `✅ کاربر *${userSelections[ctx.from.id].name}* با شماره *${
        userSelections[ctx.from.id].phone
      }* ثبت شد.`,
      {
        parse_mode: "Markdown",
        ...usersKeyboard,
      }
    );
    delete userSelections[ctx.from.id];
  }
});

bot.launch();
console.log("🤖 ربات فعال شد!");
