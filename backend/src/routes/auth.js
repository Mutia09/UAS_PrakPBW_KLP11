// src/routes/auth.js - Register, Login
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function formatUser(user) {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name || ""}`.trim(),
    email: user.email,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name = "", email, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama depan, email, dan kata sandi wajib diisi.",
      });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Kata sandi minimal 8 karakter." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
      normalizedEmail,
    ]);
    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar. Silakan login.",
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)",
      [first_name.trim(), last_name.trim(), normalizedEmail, hashed],
    );

    const user = {
      id: result.insertId,
      first_name,
      last_name,
      email: normalizedEmail,
    };
    return res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat.",
      token: signToken(user),
      user: formatUser(user),
    });
  } catch (err) {
    console.error("register error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email dan kata sandi wajib diisi." });
    }

    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, password FROM users WHERE email = ?",
      [email.toLowerCase().trim()],
    );
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau kata sandi salah." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau kata sandi salah." });
    }

    return res.json({
      success: true,
      token: signToken(user),
      user: formatUser(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
