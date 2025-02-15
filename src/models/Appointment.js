const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "confirmed", "canceled"], default: "pending" },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
