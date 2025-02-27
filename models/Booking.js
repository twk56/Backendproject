const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  room: { type: String, required: true },
  name: { type: String, required: true },
  roomCode: { type: String, required: true },
  bookingTime: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;

