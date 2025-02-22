const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

// เพิ่ม import โมเดล Room และ User
const Room = require("../models/Room"); // โมเดลห้อง
const User = require("../models/User"); // โมเดลผู้ใช้

// สร้าง admin
router.post("/create", verifyToken, verifyAdmin, (req, res) => {
  // โค้ดสร้าง admin
  res.send("สร้าง admin ใหม่สำเร็จ!");
});

// สถิติ
router.get("/stats", async (req, res) => {
  try {
    // นับจำนวนผู้ใช้ทั้งหมด
    const totalUsers = await User.countDocuments();
    // นับจำนวนผู้ที่เคยเข้าระบบ
    const loginCount = await User.countDocuments({
      lastLogin: { $exists: true, $ne: null },
    });
    return res.json({ totalUsers, loginCount });
  } catch (error) {
    console.error(error); // ดูข้อความแสดงข้อผิดพลาดใน log ของเซิร์ฟเวอร์
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" });
  }
});

// API สำหรับอัพเดตสถานะห้อง
router.patch("/rooms/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body; // รับสถานะใหม่ ('available' หรือ 'unavailable')
    const roomId = req.params.id;

    // ค้นหาและอัพเดตสถานะห้อง
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true } // คืนค่าห้องที่ถูกอัพเดต
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "ไม่พบห้องที่ต้องการอัพเดต" });
    }

    return res.json(updatedRoom); // ส่งห้องที่อัพเดตแล้ว
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัพเดตสถานะห้อง" });
  }
});

// API สำหรับดึงข้อมูลห้องทั้งหมด
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.json(rooms);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลห้องได้' });
  }
});

// API สำหรับดึงข้อมูล Booking ทั้งหมด
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});


module.exports = router;
