const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth");
const Booking = require("../models/Booking");

const Room = require("../models/Room");
const User = require("../models/User"); 


router.post("/create", verifyToken, verifyAdmin, (req, res) => {
  
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


router.patch("/rooms/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body; 
    const roomId = req.params.id;


    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true } 
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "ไม่พบห้องที่ต้องการอัพเดต" });
    }

    return res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัพเดตสถานะห้อง" });
  }
});


router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.json(rooms);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลห้องได้' });
  }
});

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
