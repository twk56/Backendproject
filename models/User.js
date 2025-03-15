const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "/uploads/default.png" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);