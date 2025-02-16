require('dotenv').config();
const { Telegraf } = require('telegraf');
const { startBot } = require('./bot/index');

// ایجاد ربات
const bot = new Telegraf(process.env.BOT_TOKEN);

// شروع ربات
startBot(bot);

// شروع لیستنر
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');