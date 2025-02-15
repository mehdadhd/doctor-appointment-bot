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
  const telegramId = ctx.from.id.toString();
  let user = await User.findOne({ telegramId });

  if (!user) {
    user = new User({ telegramId, name: ctx.from.first_name });
    await user.save();
  }

  ctx.reply(
    "👋 خوش آمدید! لطفاً یکی از گزینه‌ها را انتخاب کنید:",
    Markup.keyboard([["📋 لیست پزشکان"], ["📅 نوبت‌های من"]]).resize()
  );
});

bot.hears("📅 نوبت‌های من", async (ctx) => {
  ctx.reply(
    "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:",
    Markup.keyboard([
      ["📅 رزرو نوبت", "❌ لغو نوبت"],
      ["🔙 بازگشت به منوی اصلی"],
    ]).resize()
  );
});

bot.hears("🔙 بازگشت به منوی اصلی", async (ctx) => {
  ctx.reply(
    "👋 خوش آمدید! لطفاً یکی از گزینه‌ها را انتخاب کنید:",
    Markup.keyboard([["📋 لیست پزشکان"], ["📅 نوبت‌های من"]]).resize()
  );
});

bot.hears("📅 رزرو نوبت", async (ctx) => {
  const doctors = await Doctor.find();
  if (doctors.length === 0) {
    return ctx.reply("❌ هیچ پزشکی ثبت نشده است!");
  }

  ctx.reply(
    "لطفاً یک پزشک را انتخاب کنید:",
    Markup.keyboard(doctors.map((doc) => [doc.name])).resize()
  );

  bot.on("text", async (ctx) => {
    const doctor = await Doctor.findOne({ name: ctx.message.text });
    if (!doctor) {
      return ctx.reply("❌ پزشک مورد نظر یافت نشد!");
    }

    ctx.reply("لطفاً روز مورد نظر خود را ارسال کنید (مثلاً 2025-02-20):");
    bot.on("text", async (ctx) => {
      const date = new Date(ctx.message.text);
      if (isNaN(date.getTime())) {
        return ctx.reply("❌ فرمت تاریخ اشتباه است!");
      }

      ctx.reply("لطفاً ساعت مورد نظر را ارسال کنید (مثلاً 14:30):");
      bot.on("text", async (ctx) => {
        const time = ctx.message.text;

        const newAppointment = new Appointment({
          user: await User.findOne({ telegramId: ctx.from.id.toString() }),
          doctor: doctor,
          date: date,
          time: time,
          status: "pending",
        });
        await newAppointment.save();

        ctx.reply(
          `✅ نوبت شما ثبت شد!\n\n👨‍⚕️ پزشک: ${doctor.name}\n📅 تاریخ: ${
            date.toISOString().split("T")[0]
          }\n⏰ ساعت: ${time}`
        );
      });
    });
  });
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

bot.launch();
console.log("🤖 ربات فعال شد!");
