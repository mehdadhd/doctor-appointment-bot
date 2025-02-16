const { createNewUser } = require('../../db/models/user');

module.exports.createUserFlow = async (ctx) => {
    // گام 1: جمع‌آوری نام
    ctx.session = ctx.session || {};
    ctx.session.step = 'name';
    ctx.reply('لطفاً نام خود را وارد کنید.');

    ctx.wizard.next();
};

// پردازش ورودی‌ها
module.exports.handleInput = async (ctx) => {
    if (!ctx.session) ctx.session = {};

    switch (ctx.session.step) {
        case 'name':
            ctx.session.name = ctx.message.text;
            ctx.session.step = 'family';
            ctx.reply('لطفاً نام خانوادگی خود را وارد کنید.');
            break;

        case 'family':
            ctx.session.family = ctx.message.text;
            ctx.session.step = 'nationalCode';
            ctx.reply('لطفاً کد ملی خود را وارد کنید.');
            break;

        case 'nationalCode':
            ctx.session.nationalCode = parseInt(ctx.message.text);
            ctx.session.step = 'phoneNumber';
            ctx.reply('لطفاً شماره تلفن خود را وارد کنید.');
            break;

        case 'phoneNumber':
            ctx.session.phoneNumber = parseInt(ctx.message.text);

            // ذخیره کاربر در دیتابیس
            const user = {
                name: ctx.session.name,
                family: ctx.session.family,
                nationalCode: ctx.session.nationalCode,
                phoneNumber: ctx.session.phoneNumber,
            };

            try {
                await createNewUser(user);
                ctx.reply('کاربر با موفقیت ثبت شد.', mainMenu());
            } catch (error) {
                ctx.reply('خطایی رخ داد. لطفاً مجدداً تلاش کنید.');
            }

            delete ctx.session.step;
            break;

        default:
            ctx.reply('خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
};