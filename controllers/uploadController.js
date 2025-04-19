const fs = require("fs");
const Image = require("../models/Image");

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "กรุณาเลือกไฟล์" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  
  try {
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
};
