const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true, enum: ['available', 'unavailable'] },
  image: { type: String, default: 'default.png' },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;

