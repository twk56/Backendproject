const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  room: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;