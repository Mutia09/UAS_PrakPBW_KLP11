// src/routes/children.js - CRUD data anak
const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/children
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.gender, c.dob,
              c.father_height, c.father_weight,
              c.mother_height, c.mother_weight,
              c.created_at,
              (SELECT COUNT(*) FROM measurements m WHERE m.child_id = c.id) AS total_checks,
              (SELECT MAX(m.measure_date) FROM measurements m WHERE m.child_id = c.id) AS last_check,
              (SELECT m2.status FROM measurements m2
               WHERE m2.child_id = c.id
               ORDER BY m2.measure_date DESC LIMIT 1) AS last_status
       FROM children c
       WHERE c.user_id = ?
       ORDER BY c.name`,
      [req.user.id],
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data anak." });
  }
});

// GET /api/children/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM children WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Anak tidak ditemukan." });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data anak." });
  }
});

// POST /api/children
router.post("/", async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      father_height,
      father_weight,
      mother_height,
      mother_weight,
    } = req.body;

    if (!name || !gender) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Nama dan jenis kelamin wajib diisi.",
        });
    }

    const [existing] = await db.query(
      "SELECT id FROM children WHERE user_id = ? AND name = ?",
      [req.user.id, name.trim()],
    );

    const values = [
      gender,
      dob || null,
      father_height || null,
      father_weight || null,
      mother_height || null,
      mother_weight || null,
    ];

    if (existing.length > 0) {
      await db.query(
        `UPDATE children SET gender=?, dob=?, father_height=?, father_weight=?,
         mother_height=?, mother_weight=? WHERE id=?`,
        [...values, existing[0].id],
      );
      return res.json({
        success: true,
        data: { id: existing[0].id, name, gender },
        updated: true,
      });
    }

    const [result] = await db.query(
      `INSERT INTO children (user_id, name, gender, dob, father_height, father_weight, mother_height, mother_weight)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.id, name.trim(), gender, ...values],
    );

    return res
      .status(201)
      .json({
        success: true,
        data: { id: result.insertId, name, gender },
        updated: false,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan data anak." });
  }
});

// PUT /api/children/:id
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      father_height,
      father_weight,
      mother_height,
      mother_weight,
    } = req.body;
    if (!name || !gender) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Nama dan jenis kelamin wajib diisi.",
        });
    }

    const [result] = await db.query(
      `UPDATE children SET name=?, gender=?, dob=?, father_height=?, father_weight=?,
       mother_height=?, mother_weight=? WHERE id=? AND user_id=?`,
      [
        name.trim(),
        gender,
        dob || null,
        father_height || null,
        father_weight || null,
        mother_height || null,
        mother_weight || null,
        req.params.id,
        req.user.id,
      ],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Anak tidak ditemukan." });
    }
    return res.json({ success: true, message: "Data anak diperbarui." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data anak." });
  }
});

// DELETE /api/children/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM children WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Anak tidak ditemukan." });
    }
    return res.json({ success: true, message: "Data anak dihapus." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus data anak." });
  }
});

module.exports = router;
