const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  nationalId: Number,
  phone: Number,
});

module.exports = mongoose.model("User", userSchema);
