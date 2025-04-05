const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const router = express.Router();

const imageSchema = new mongoose.Schema({
  filename: String,
  image: String,
  contentType: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model("Image", imageSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "กรุณาเลือกไฟล์" });
  }
  const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  
  try {
    const fs = require("fs");
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

    const newImage = new Image({
      filename: req.file.filename,
      image: base64Image,
      contentType: req.file.mimetype,
      name: req.body.name || "Unnamed",
    });
    await newImage.save();
    res.json({ 
      imageUrl, 
      message: "อัปโหลดและบันทึกสำเร็จ", 
      imageId: newImage._id 
    });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    res.status(500).json({ 
      imageUrl, 
      error: "อัปโหลดสำเร็จแต่บันทึกในฐานข้อมูลล้มเหลว" 
    });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "ไม่พบรูปภาพ" });
    }
    res.json({ 
      image: image.image,
      contentType: image.contentType,
      name: image.name
    });
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({ error: "ดึงรูปภาพล้มเหลว" });
  }
});

module.exports = router;