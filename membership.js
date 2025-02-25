const { CHANNELS } = require("./config");
const bot = require("./botInstance"); // دریافت نمونه ربات

// ✅ بررسی عضویت کاربر در کانال‌ها
async function isUserMember(userId) {
    try {
        let isMember1 = await bot.getChatMember(CHANNELS[0], userId);
        let isMember2 = await bot.getChatMember(CHANNELS[1], userId);

        return (
            (isMember1.status === "member" || isMember1.status === "administrator" || isMember1.status === "creator") &&
            (isMember2.status === "member" || isMember2.status === "administrator" || isMember2.status === "creator")
        );
    } catch (error) {
        console.error("خطا در بررسی عضویت:", error);
        return false;
    }
}

module.exports = {
    isUserMember,
};
