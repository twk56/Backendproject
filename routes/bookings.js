const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const BookingLog = require('../models/BookingLog');
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');

router.post('/bookings', verifyToken, async (req, res) => {
  try {
    console.log("req.user:", req.user);
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
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    });
    if (overlappingBooking) {
      return res.status(400).json({ 
        message: `ห้อง ${room} ถูกจองแล้วในช่วงเวลา ${dayjs(overlappingBooking.startTime).tz('Asia/Bangkok').format('HH:mm')} - ${dayjs(overlappingBooking.endTime).tz('Asia/Bangkok').format('HH:mm')}` 
      });
    }

    const booking = new Booking({
      room,
      startTime: start,
      endTime: end,
      user: new mongoose.Types.ObjectId(req.user.userId),
    });
    await booking.save();

    const log = new BookingLog({
      bookingId: booking._id,
      userId: req.user.userId,
      action: "create",
      details: { room, startTime: start, endTime: end },
    });
    await log.save();

    return res.status(201).json({ message: 'จองห้องสำเร็จ', booking });
  } catch (error) {
    console.error('Error in POST /bookings:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.get('/bookings', verifyToken, async (req, res) => { 
  try {
    const { showAll } = req.query;
    const filter = showAll === 'true' ? {} : { endTime: { $gte: new Date() } };
    const bookings = await Booking.find(filter)
      .populate('user', 'fullName studentId')
      .sort({ startTime: 1 });

    console.log('Bookings fetched:', bookings);
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

    const log = new BookingLog({
      bookingId: req.params.id,
      userId: req.user.userId,
      action: "delete",
      details: { room: booking.room, startTime: booking.startTime, endTime: booking.endTime },
    });
    await log.save();

    console.log(`Booking ${req.params.id} deleted by user ${req.user.userId}`);
    res.json({ message: "ยกเลิกการจองสำเร็จ" });
  } catch (error) {
    console.error("Error in DELETE /bookings/:id:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
  }
});

router.get('/bookings/:id', verifyToken, async (req, res) => { 
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'fullName studentId');
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบการจองนี้' });
    }

    const log = new BookingLog({
      bookingId: booking._id,
      userId: req.user.userId,
      action: "fetch",
      details: { room: booking.room },
    });
    await log.save();

    res.json(booking)
  } catch (error) {
    console.error('Error in GET /bookings/:id:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

router.get('/booking_logs', verifyToken, async (req, res) => {
  try {
    const logs = await BookingLog.find()
      .populate('userId', 'fullName studentId')
      .populate('bookingId', 'room startTime endTime')
      .sort({ timestamp: -1 });
      console.log('Booking logs fetched:', logs);
    res.json(logs);
  } catch (error) {
    console.error('Error in GET /booking_logs:', error.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
});

module.exports = router;