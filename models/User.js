const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "/uploads/default.png" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  lastLogin: { type: Date, default: null }
});

module.exports = mongoose.model("User", UserSchema);


