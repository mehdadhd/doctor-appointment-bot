require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const connectDB = require("./src/database");
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Appointment = require("./src/models/Appointment");

const bot = new Telegraf(process.env.BOT_TOKEN);
connectDB();

(async function initializeDoctors() {
  const existingDoctors = await Doctor.find();
  if (existingDoctors.length === 0) {
    await Doctor.insertMany([
      { name: "دکتر احمدی", specialty: "قلب و عروق" },
      { name: "دکتر رضایی", specialty: "داخلی" },
      { name: "دکتر محمدی", specialty: "گوارش" },
    ]);
    console.log("✅ پزشکان پیش‌فرض اضافه شدند");
  }
})();

bot.start(async (ctx) => {
  ctx.reply(
    "👋 خوش آمدید! لطفاً یکی از گزینه‌ها را انتخاب کنید:",
    Markup.keyboard([["📋 لیست پزشکان"], ["📅 نوبت‌های من"]]).resize()
  );
});

bot.hears("📅 نوبت‌های من", async (ctx) => {
  const appointments = await Appointment.find({
    user: await User.findOne({ telegramId: ctx.from.id.toString() }),
  }).populate("doctor");
  if (appointments.length === 0) {
    return ctx.reply("❌ شما هیچ نوبتی ندارید!");
  }

  let message = "📅 نوبت‌های شما:\n";
  appointments.forEach((app, index) => {
    message += `${index + 1}. 👨‍⚕️ دکتر ${app.doctor.name} - 📅 ${
      app.date.toISOString().split("T")[0]
    } - ⏰ ${app.time}\n`;
  });
  ctx.reply(message);
});

bot.hears("📅 رزرو نوبت", async (ctx) => {
  const doctors = await Doctor.find();
  ctx.reply(
    "👨‍⚕️ لطفاً یک پزشک را انتخاب کنید:",
    Markup.keyboard([
      ...doctors.map((doc) => [doc.name]),
      ["🔙 بازگشت"],
    ]).resize()
  );
  bot.on("text", async (ctx) => {
    const doctor = await Doctor.findOne({ name: ctx.message.text });
    if (!doctor) return;

    ctx.reply(
      "📅 لطفاً یک روز را انتخاب کنید:",
      Markup.keyboard([
        ["شنبه", "یکشنبه", "دوشنبه"],
        ["سه‌شنبه", "چهارشنبه", "پنج‌شنبه"],
        ["جمعه", "🔙 بازگشت"],
      ]).resize()
    );
    bot.on("text", async (ctx) => {
      const day = ctx.message.text;

      ctx.reply(
        "⏰ لطفاً ساعت مورد نظر را انتخاب کنید:",
        Markup.keyboard([
          ["08:00", "09:00", "10:00"],
          ["11:00", "12:00", "13:00"],
          ["14:00", "15:00", "16:00"],
          ["🔙 بازگشت"],
        ]).resize()
      );
      bot.on("text", async (ctx) => {
        const time = ctx.message.text;

        const newAppointment = new Appointment({
          user: await User.findOne({ telegramId: ctx.from.id.toString() }),
          doctor: doctor,
          date: new Date(),
          time: time,
          status: "pending",
        });
        await newAppointment.save();

        ctx.reply(
          `✅ نوبت شما ثبت شد!\n\n👨‍⚕️ پزشک: ${doctor.name}\n📅 روز: ${day}\n⏰ ساعت: ${time}`
        );
      });
    });
  });
});

bot.launch();
console.log("🤖 ربات فعال شد!");
