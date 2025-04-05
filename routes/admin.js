const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const loginCount = await User.countDocuments({ lastLogin: { $exists: true, $ne: null } });
    return res.json({ totalUsers, loginCount });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" });
  }
});

router.patch("/rooms/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: "ไม่พบห้องที่ต้องการอัพเดต" });
    }

    return res.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room status:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัพเดตสถานะห้อง" });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลห้องได้" });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user");
    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});

router.post("/rooms", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, image, status } = req.body;
    if (!name) {
      return res.status(400).json({ message: "กรุณาระบุชื่อห้อง" });
    }
    const newRoom = new Room({ name, image: image || "", status: status || "available" });
    const savedRoom = await newRoom.save();
    return res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error adding room:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มห้อง" });
  }
});

router.delete("/rooms/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "ไม่พบห้องที่ต้องการลบ" });
    }

    if (room.image && room.image !== "default.png") {
      const imagePath = path.join(__dirname, "..", "uploads", room.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("ลบไฟล์ไม่สำเร็จ:", err.message);
        } else {
          console.log("ลบรูปภาพสำเร็จ:", room.image);
        }
      });
    }

    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    return res.json({ message: "ลบห้องสำเร็จ", room: deletedRoom });

  } catch (error) {
    console.error("Error deleting room:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบห้อง" });
  }
});

router.patch("/approve-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    }

    res.json({ message: "อนุมัติผู้ใช้งานแล้ว", user: updatedUser });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอนุมัติผู้ใช้งาน" });
  }
});

router.get("/unapproved-users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false });
    res.json(users);
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ที่รออนุมัติได้" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
  }
});

module.exports = router;
