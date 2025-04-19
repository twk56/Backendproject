const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  filename: String,
  image: String,
  contentType: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", imageSchema);
