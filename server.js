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
const bookingRoutes = require("./routes/bookings");
const { startCronJobs } = require("./cron/crontime");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

connectDB();

startCronJobs();


app.use(cors({
  origin: 'https://cetwk.netlify.app/',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json());
app.use(helmet());

app.use("/api", bookingRoutes);
app.use("/api", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api", profileRoutes);

const PORT = process.env.PORT || 5001;
app.listen(5001, () => console.log(`มาแล้วไอ้ไก่ ${PORT}`));
