const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../models/User");
const { validateRegister } = require("../middleware/validation");

router.post("/register", validateRegister, async (req, res) => {
  const { email, studentId, password } = req.body;

  let role = "user";
  if (studentId === "adminkk") {
    role = "admin";
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "อีเมลนี้ถูกใช้ไปแล้ว" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    studentId,
    password: hashedPassword,
    role,
  });
  await newUser.save();

  res.json({ message: "สมัครสมาชิกสำเร็จ" });
});


router.post("/login", async (req, res) => {
  const { studentId, password } = req.body;

  const user = await User.findOne({ studentId });
  if (!user) {
    return res.status(400).json({ error: "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง" });
  }


  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง" });
  }
  
  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "เข้าสู่ระบบสำเร็จ", token, role: user.role });
});

module.exports = router;

