const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  image: { type: String, default: '/uploads/default-room.png' },
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);