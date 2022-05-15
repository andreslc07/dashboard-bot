const mongoose = require("mongoose");

const blacklist = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String },
});

module.exports = mongoose.model("blacklist", blacklist);
