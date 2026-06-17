// src/routes/user.js - profil & hapus akun
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/user/me
router.get("/me", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }
    const u = rows[0];
    return res.json({
      success: true,
      data: {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        name: `${u.first_name} ${u.last_name}`.trim(),
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data profil." });
  }
});

// PUT /api/user/profile
router.put("/profile", async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Nama dan email wajib diisi." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [dup] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [normalizedEmail, req.user.id],
    );
    if (dup.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email sudah dipakai akun lain." });
    }

    await db.query(
      "UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?",
      [
        first_name.trim(),
        (last_name || "").trim(),
        normalizedEmail,
        req.user.id,
      ],
    );

    return res.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: {
        name: `${first_name} ${last_name || ""}`.trim(),
        email: normalizedEmail,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui profil." });
  }
});

// PUT /api/user/change-password
router.put("/change-password", async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Kata sandi lama dan baru wajib diisi.",
        });
    }
    if (new_password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Kata sandi baru minimal 8 karakter.",
        });
    }

    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Kata sandi lama salah." });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);

    return res.json({ success: true, message: "Kata sandi berhasil diubah." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengubah kata sandi." });
  }
});

// DELETE /api/user/account
router.delete("/account", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.user.id]);
    return res.json({
      success: true,
      message: "Akun dan semua data berhasil dihapus.",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus akun." });
  }
});

module.exports = router;
