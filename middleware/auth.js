const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    console.log("Token ที่ได้รับ:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ error: "Token ไม่ถูกต้อง: ไม่มีข้อมูลผู้ใช้" });
    }

    req.user = { userId: decoded.userId, role: decoded.role };
    console.log("Decoded Token:", decoded); 
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error.message);
    return res.status(401).json({ error: "Token ไม่ถูกต้อง" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: คุณไม่ใช่แอดมิน" });
  }
  next();
};
