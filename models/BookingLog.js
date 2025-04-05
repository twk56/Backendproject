const mongoose = require("mongoose");

const bookingLogSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["create", "delete", "fetch"], required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

const BookingLog = mongoose.model("BookingLog", bookingLogSchema);
module.exports = BookingLog;