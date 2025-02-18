require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(helmet());

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/uploads", express.static("uploads"));

app.use("/api", authRoutes);
app.use("/api", profileRoutes);

const PORT = process.env.PORT || 4999;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

