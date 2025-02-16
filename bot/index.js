const { Telegraf } = require('telegraf');
const { WizardScene } = require('telegraf/scenes');
const { mainMenu } = require('./commands/menu');
const { createUserFlow, handleInput } = require('./commands/createUser');

module.exports.startBot = (bot) => {
    // فرمان /start
    bot.start((ctx) => {
        ctx.reply('به ربات ثبت وقت پزشکی خوش آمدید!', mainMenu());
    });

    // Scene برای ثبت کاربر
    const createUserScene = new WizardScene(
        'create_user_scene',
        createUserFlow,
        handleInput
    );

    bot.use(createUserScene.middleware());

    // مدیریت منوها
    bot.action('list_users', async (ctx) => {
        const users = await require('../db/models/user').listUsers();
        if (users.length === 0) {
            ctx.reply('هیچ کاربری وجود ندارد.', mainMenu());
        } else {
            const userList = users.map(u => `${u._id} - ${u.name} ${u.family}`).join('\n');
            ctx.reply(`لیست کاربران:\n${userList}`, mainMenu());
        }
    });

    bot.action('create_user', (ctx) => {
        ctx.scene.enter('create_user_scene');
    });
};