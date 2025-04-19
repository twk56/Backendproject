const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    console.log("Upload directory:", uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); 
      console.log("Created uploads directory:", uploadDir);
    }
    cb(null, "uploadDir");
  },
  filename: (req, file, cb) => {
    try {
      const userId = req.user.userId;
      const filename = `${userId}${path.extname(file.originalname)}`;
      console.log("Generated filename:", filename);
      cb(null, filename);
    } catch (error) {
      console.error("Error in filename generation:", error.message);
      cb(new Error("Token ไม่ถูกต้อง"), false);
    }
  },
});

const upload = multer({ storage });

router.put("/profile", verifyToken, upload.single("profileImage"), async (req, res) => {
  try {
    console.log("PUT /profile received:", { body: req.body, file: req.file });
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    if (user.profileImage && user.profileImage !== "/uploads/default.png") {
      const oldImagePath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Deleted old profile image:", oldImagePath);
      } else {
        console.log("Old image not found:", oldImagePath);
      }
    }

    if (req.body.fullName) user.fullName = req.body.fullName.trim();
    if (req.body.email) user.email = req.body.email.trim();

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    console.log("Updated user:", user);

    res.json({
      message: "อัปเดตโปรไฟล์สำเร็จ",
      fullName: user.fullName,
      email: user.email,
      studentId: user.studentId,
      profileImage: user.profileImage,
      role: user.role
    });
  } catch (error) {
    console.error("PUT /profile error:", error.message);
    res.status(400).json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    console.log("GET /profile with userId:", req.user.userId);
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    console.log("Sending profile data:", user);
    res.json({
      fullName: user.fullName,
      email: user.email,
      studentId: user.studentId,
      profileImage: user.profileImage || "",
      role: user.role
      
    });
  } catch (error) {
    console.error("GET /profile error:", error.message);
    res.status(401).json({ error: "Token ไม่ถูกต้องหรือเกิดข้อผิดพลาด" });
  }
});

module.exports = router;