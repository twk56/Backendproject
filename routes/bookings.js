const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");

router.post('/bookings', verifyToken, async (req, res) => {
  try {
    console.log("🔍 req.user:", req.user); // ✅ Debug ดูค่าของ req.user

    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่" });
    }

    const { room, startTime, endTime } = req.body;
    if (!room || !startTime || !endTime) {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง' });
    }

    console.log("📝 Creating new booking with user ID:", req.user.id);

    const booking = new Booking({
      room,
      startTime: start,
      endTime: end,
      user: new mongoose.Types.ObjectId(req.user.id), // ✅ แปลง id เป็น ObjectId
    });

    await booking.save();
    return res.status(201).json({ message: 'จองห้องสำเร็จ', booking });
  } catch (error) {
    console.error('🔴 Error in POST /bookings:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ startTime: 1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error in GET /bookings:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.delete("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจองนี้" });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ยกเลิกการจองนี้" });
    }

    await booking.remove();
    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (error) {
    console.error("🔴 Error in DELETE /bookings/:id:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

router.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบการจองนี้' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error in GET /bookings/:id:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

module.exports = router;
