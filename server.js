require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const uploadRoutes = require("./routes/upload");
const adminRoutes = require("./routes/admin");
const path = require("path");
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json());
app.use(helmet());

// เส้นทางสำหรับอัพโหลด
app.use("/api", uploadRoutes);

// เส้นทางสำหรับ admin
app.use("/api/admin", adminRoutes);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// เส้นทางสำหรับการเข้าถึงไฟล์ในโฟลเดอร์ uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// เส้นทางสำหรับ authentication และ profile
app.use("/api", authRoutes);
app.use("/api", profileRoutes);




const PORT = process.env.PORT || 4999;
app.listen(4999, () => console.log(`🚀 Server running on port ${PORT}`));
