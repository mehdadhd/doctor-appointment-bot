const { Markup } = require('telegraf');

module.exports.mainMenu = () => {
    return Markup.keyboard([
        ['لیست کاربران'],
        ['ایجاد کاربر جدید']
    ])
    .resize()
    .extra();
};