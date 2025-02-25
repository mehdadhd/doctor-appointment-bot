require("dotenv").config();

module.exports = {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN, // توکن ربات از .env
    CHANNELS: ["@visitell", "@ahngmhdd"], // آیدی کانال‌های موردنظر
};
