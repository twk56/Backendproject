// ใน routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// ตั้งค่าการจัดการการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // เส้นทางที่เก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // ชื่อไฟล์ที่ไม่ซ้ำกัน
  }
});

const upload = multer({ storage });

// เส้นทางสำหรับอัปโหลดไฟล์
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "กรุณาเลือกไฟล์" });
  }
  // ส่ง URL ของภาพที่อัปโหลดกลับ
  const imageUrl = `http://localhost:4999/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
