const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ error: "Token ไม่ถูกต้อง: ไม่มีข้อมูลผู้ใช้" });
    }

    req.user = { id: decoded.userId, role: decoded.role }; 
    next();
  } catch (error) {
    console.error("🔴 Error in verifyToken:", error.message);
    return res.status(401).json({ error: "Token ไม่ถูกต้อง" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: คุณไม่ใช่แอดมิน" });
  }
  next();
};
