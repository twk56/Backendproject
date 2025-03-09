const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {

    try {
      const userId = req.user.userId;
      cb(null, userId + path.extname(file.originalname));
    } catch (error) {
      cb(new Error("Token ไม่ถูกต้อง"), false);
    }
  },
});

const upload = multer({ storage });

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


router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Token ไม่ถูกต้อง" });
  }
});

module.exports = router;
