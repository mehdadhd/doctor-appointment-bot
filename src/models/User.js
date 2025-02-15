const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  name: String,
  phoneNumber: String,
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
});

module.exports = mongoose.model("User", userSchema);
