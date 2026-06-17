// src/middleware/auth.js - verifikasi JWT di setiap request terproteksi
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Token tidak ditemukan. Silakan login ulang.",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Sesi telah berakhir. Silakan login ulang."
        : "Token tidak valid.";
    return res.status(401).json({ success: false, message: msg });
  }
};
