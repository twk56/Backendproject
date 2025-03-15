const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");
const dayjs = require('dayjs');

router.post('/bookings', verifyToken, async (req, res) => {
  try {
    console.log("🔍 req.user:", req.user);

    if (!req.user || !req.user.userId) {
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

    if (start >= end) {
      return res.status(400).json({ message: 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด' });
    }

    const overlappingBooking = await Booking.findOne({
      room,
      $or: [
        { 
          startTime: { $lt: end }, 
          endTime: { $gt: start } 
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        message: `ห้อง ${room} ถูกจองแล้วในช่วงเวลา ${dayjs(overlappingBooking.startTime).format('HH:mm')} - ${dayjs(overlappingBooking.endTime).format('HH:mm')}` 
      });
    }

    console.log("Creating new booking with user ID:", req.user.userId);

    const booking = new Booking({
      room,
      startTime: start,
      endTime: end,
      user: new mongoose.Types.ObjectId(req.user.userId),
    });

    await booking.save();
    return res.status(201).json({ message: 'จองห้องสำเร็จ', booking });
  } catch (error) {
    console.error('Error in POST /bookings:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'fullName studentId')
      .sort({ startTime: 1 });
    console.log(bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error in GET /bookings:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.delete("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    console.log("กำลังลบการจอง ID:", req.params.id);
    console.log("ข้อมูลผู้ใช้ที่ร้องขอ:", req.user);

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจองนี้" });
    }

    if (booking.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์ยกเลิกการจองนี้" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (error) {
    console.error("Error in DELETE /bookings/:id:", error.message);
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