const { CHANNELS } = require("./config");
const bot = require("./botInstance"); // دریافت نمونه ربات

// ✅ بررسی عضویت کاربر در هر کانال به‌صورت جداگانه
async function getUserMembershipStatus(userId) {
    let status = [false, false]; // وضعیت عضویت در دو کانال

    try {
        let member1 = await bot.getChatMember(CHANNELS[0], userId);
        let member2 = await bot.getChatMember(CHANNELS[1], userId);

        status[0] = (member1.status === "member" || member1.status === "administrator" || member1.status === "creator");
        status[1] = (member2.status === "member" || member2.status === "administrator" || member2.status === "creator");
    } catch (error) {
        console.error("خطا در بررسی عضویت:", error);
    }

    return status;
}

module.exports = {
    getUserMembershipStatus,
};
