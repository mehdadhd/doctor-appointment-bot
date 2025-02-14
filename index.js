require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const doctors = require("./src/doctors");
const User = require("./src/models/User");

const bot = new Telegraf(process.env.BOT_TOKEN);
const userSelections = {};

// اتصال به پایگاه داده MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ اتصال به پایگاه داده برقرار شد!"))
  .catch((err) => console.error("❌ خطا در اتصال به MongoDB:", err));

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

bot.hears("👥 لیست کاربران", async (ctx) => {
  try {
    const userList = await User.find({});
    if (userList.length === 0) return ctx.reply("❌ هیچ کاربری ثبت نشده است.");

    let message = "👥 لیست کاربران ثبت‌شده:\n\n";
    userList.forEach((user, index) => {
      message += `${index + 1}. 🏷️ نام: ${user.name} 📞 شماره: ${user.phone}\n`;
    });
    ctx.reply(message);
  } catch (err) {
    console.error("❌ خطا در دریافت لیست کاربران:", err);
    ctx.reply("❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.");
  }
});

bot.hears("➕ افزودن کاربر", (ctx) => {
  ctx.reply("📌 لطفاً نام و نام خانوادگی خود را وارد کنید:");
  userSelections[ctx.from.id] = { step: "waiting_for_name" };
});

bot.on("text", async (ctx) => {
  const userStep = userSelections[ctx.from.id]?.step;

  if (userStep === "waiting_for_name") {
    userSelections[ctx.from.id].name = ctx.message.text;
    userSelections[ctx.from.id].step = "waiting_for_phone";
    ctx.reply("📞 لطفاً شماره تلفن خود را ارسال کنید:");
  } else if (userStep === "waiting_for_phone") {
    userSelections[ctx.from.id].phone = ctx.message.text;
    try {
      const existingUser = await User.findOne({ telegramId: ctx.from.id });
      if (existingUser) return ctx.reply("❌ این کاربر قبلاً ثبت شده است.");

      const newUser = new User({
        telegramId: ctx.from.id,
        name: userSelections[ctx.from.id].name,
        phone: userSelections[ctx.from.id].phone,
      });

      await newUser.save();
      ctx.reply(`✅ کاربر *${newUser.name}* با شماره *${newUser.phone}* ثبت شد.`, {
        parse_mode: "Markdown",
        ...usersKeyboard,
      });
    } catch (err) {
      console.error("❌ خطا در ذخیره کاربر:", err);
      ctx.reply("❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    }
    delete userSelections[ctx.from.id];
  }
});

bot.hears("🔙 بازگشت به منو اصلی", (ctx) => {
  ctx.reply("🏠 بازگشت به منو اصلی:", mainKeyboard);
});

bot.launch();
console.log("🤖 ربات فعال شد!");
