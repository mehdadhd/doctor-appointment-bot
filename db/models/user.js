const mongoose = require('../index');

// تعریف ساختار کاربر
const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // نام
    family: { type: String, required: true }, // نام خانوادگی
    nationalCode: { type: Number, required: true, unique: true }, // کد ملی
    phoneNumber: { type: Number, required: true }, // شماره تلفن
}, { timestamps: true });

// تعریف مدل
const User = mongoose.model('User', userSchema);

// لیست کاربران
exports.listUsers = async () => {
    return await User.find();
};

// ایجاد کاربر جدید
exports.createNewUser = async (userData) => {
    const newUser = new User(userData);
    return await newUser.save();
};