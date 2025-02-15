require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const connectDB = require("./src/database");
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Appointment = require("./src/models/Appointment");

const bot = new Telegraf(process.env.BOT_TOKEN);
connectDB();

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  let user = await User.findOne({ telegramId });

  if (!user) {
    user = new User({ telegramId, name: ctx.from.first_name });
    await user.save();
  }

  ctx.reply(
    "👋 خوش آمدید! لطفاً یکی از گزینه‌ها را انتخاب کنید:",
    Markup.keyboard([
      ["📋 لیست پزشکان"],
      ["📅 رزرو نوبت"],
      ["📅 نوبت‌های من"],
      ["❌ لغو نوبت"],
      ["👥 لیست کاربران"],
    ]).resize()
  );
});

bot.hears("📋 لیست پزشکان", async (ctx) => {
  const doctors = await Doctor.find();
  if (doctors.length === 0) {
    return ctx.reply("❌ هیچ پزشکی ثبت نشده است!");
  }

  let message = "🩺 لیست پزشکان:\n";
  doctors.forEach((doc, index) => {
    message += `${index + 1}. ${doc.name} - ${doc.specialty}\n`;
  });
  ctx.reply(message);
});

bot.hears("📅 رزرو نوبت", async (ctx) => {
  ctx.reply("لطفاً نام پزشک مورد نظر را ارسال کنید:");
  bot.on("text", async (ctx) => {
    const doctor = await Doctor.findOne({ name: ctx.message.text });
    if (!doctor) {
      return ctx.reply("❌ پزشک مورد نظر یافت نشد!");
    }

    ctx.reply("لطفاً تاریخ نوبت را به فرمت YYYY-MM-DD ارسال کنید:");
    bot.on("text", async (ctx) => {
      const date = new Date(ctx.message.text);
      if (isNaN(date.getTime())) {
        return ctx.reply("❌ فرمت تاریخ اشتباه است!");
      }

      const newAppointment = new Appointment({
        user: await User.findOne({ telegramId: ctx.from.id.toString() }),
        doctor: doctor,
        date: date,
        status: "pending",
      });
      await newAppointment.save();
      ctx.reply("✅ نوبت شما با موفقیت ثبت شد!");
    });
  });
});

bot.hears("📅 نوبت‌های من", async (ctx) => {
  const user = await User.findOne({
    telegramId: ctx.from.id.toString(),
  }).populate("appointments");

  if (!user || user.appointments.length === 0) {
    return ctx.reply("❌ شما هیچ نوبتی ندارید!");
  }

  let message = "📅 نوبت‌های شما:\n";
  for (const [index, appointment] of user.appointments.entries()) {
    const doctor = await Doctor.findById(appointment.doctor);
    message += `${index + 1}. دکتر ${doctor.name} - تاریخ: ${
      appointment.date.toISOString().split("T")[0]
    } - وضعیت: ${appointment.status}\n`;
  }

  ctx.reply(message);
});

bot.hears("❌ لغو نوبت", async (ctx) => {
  ctx.reply("🔢 لطفاً شماره نوبتی که می‌خواهید لغو کنید را وارد کنید:");

  bot.on("text", async (ctx) => {
    const user = await User.findOne({
      telegramId: ctx.from.id.toString(),
    }).populate("appointments");
    const appointmentIndex = parseInt(ctx.message.text) - 1;

    if (
      isNaN(appointmentIndex) ||
      appointmentIndex < 0 ||
      appointmentIndex >= user.appointments.length
    ) {
      return ctx.reply("❌ شماره نوبت نامعتبر است!");
    }

    const appointment = user.appointments[appointmentIndex];
    appointment.status = "canceled";
    await appointment.save();

    ctx.reply(
      `✅ نوبت شما با دکتر ${appointment.doctor.name} در تاریخ ${
        appointment.date.toISOString().split("T")[0]
      } لغو شد!`
    );
  });
});

bot.hears("👥 لیست کاربران", async (ctx) => {
  const users = await User.find();
  if (users.length === 0) {
    return ctx.reply("❌ هیچ کاربری ثبت نشده است!");
  }

  let message = "👥 لیست کاربران:\n";
  users.forEach((user, index) => {
    message += `${index + 1}. ${user.name} (ID: ${user.telegramId})\n`;
  });
  ctx.reply(message);
});

bot.launch();
console.log("🤖 ربات فعال شد!");
