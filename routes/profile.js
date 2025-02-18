const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { verifyToken } = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

// ตั้งค่า storage สำหรับ multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    // ใช้ userId จาก token มาเป็นชื่อไฟล์
    try {
      const userId = req.user.userId; // มาจาก verifyToken
      cb(null, userId + path.extname(file.originalname));
    } catch (error) {
      cb(new Error("Token ไม่ถูกต้อง"), false);
    }
  },
});

const upload = multer({ storage });

// PUT /api/profile (อัปเดตรูปโปรไฟล์)
router.put("/profile", verifyToken, (req, res) => {
  upload.single("profileImage")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "อัปโหลดไฟล์ผิดพลาด" });
    }

    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "ไม่พบผู้ใช้" });
      }

      // ลบรูปเก่า (ถ้าไม่ใช่ default)
      if (user.profileImage && user.profileImage !== "/uploads/default.png") {
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // อัปเดตโปรไฟล์
      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }
      await user.save();

      res.json({ message: "✅ เปลี่ยนรูปโปรไฟล์สำเร็จ!", profileImage: user.profileImage });
    } catch (error) {
      res.status(400).json({ error: "❌ ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้" });
    }
  });
});

// GET /api/profile (ดึงข้อมูลโปรไฟล์)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Token ไม่ถูกต้อง" });
  }
});

module.exports = router;
