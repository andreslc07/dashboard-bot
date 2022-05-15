const mongoose = require("mongoose");

const users = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: null },
  lastLogin: { type: String, default: null },
  current: { type: Number, default: null },
  owner: { type: String, required: true },
});

module.exports = mongoose.model("users", users);
