// server.js - Entry point StuntCheck Backend
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/auth");
const childrenRoutes = require("./src/routes/children");
const measurementsRoutes = require("./src/routes/measurements");
const userRoutes = require("./src/routes/user");

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ────────────────────────────────────────────────────
const staticOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Postman / server-to-server (no Origin header)
      if (!origin) return callback(null, true);
      if (staticOrigins.includes(origin)) return callback(null, true);
      // Dev: izinkan semua port localhost / 127.0.0.1
      if (
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parser ──────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiter global ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi dalam 15 menit.",
  },
});
app.use(globalLimiter);

// Rate limiter ketat untuk endpoint auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/measurements", measurementsRoutes);
app.use("/api/user", userRoutes);

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StuntCheck API berjalan",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server yang tidak terduga.",
  });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  StuntCheck API berjalan di http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/api/health\n`);
});
