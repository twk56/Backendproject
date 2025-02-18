// routes/admin.js
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

// เพิ่ม import โมเดล User
const User = require("../models/User");

router.post("/create", verifyToken, verifyAdmin, (req, res) => {
  // โค้ดสร้าง admin
  res.send("สร้าง admin ใหม่สำเร็จ!");
});

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const loginCount = await User.countDocuments({
      lastLogin: { $exists: true, $ne: null },
    });
    return res.json({ totalUsers, loginCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" });
  }
});

module.exports = router;
