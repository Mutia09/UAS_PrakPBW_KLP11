// src/routes/measurements.js - CRUD riwayat pemeriksaan
const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

function pickMeasurement(body) {
  return {
    child_id: body.child_id,
    measure_date: body.measure_date,
    age_months: body.age_months,
    height_cm: body.height_cm,
    weight_kg: body.weight_kg,
    bmi: body.bmi,
    haz: body.haz,
    mph: body.mph,
    who_median: body.who_median ?? 0,
    who_minus2sd: body.who_minus2sd ?? 0,
    status: body.status,
    status_label: body.status_label || body.status,
    father_height: body.father_height || null,
    father_weight: body.father_weight || null,
    mother_height: body.mother_height || null,
    mother_weight: body.mother_weight || null,
    father_bmi: body.father_bmi || null,
    mother_bmi: body.mother_bmi || null,
    notes: body.notes || null,
  };
}

function validateRequired(data) {
  const required = [
    "child_id",
    "measure_date",
    "age_months",
    "height_cm",
    "weight_kg",
    "bmi",
    "haz",
    "mph",
    "status",
  ];
  const missing = required.filter(
    (key) => data[key] === undefined || data[key] === null || data[key] === "",
  );
  return missing;
}

async function ownsChild(userId, childId) {
  const [rows] = await db.query(
    "SELECT id FROM children WHERE id = ? AND user_id = ?",
    [childId, userId],
  );
  return rows.length > 0;
}

// GET /api/measurements/child/:childId - harus sebelum /:id
router.get("/child/:childId", async (req, res) => {
  try {
    if (!(await ownsChild(req.user.id, req.params.childId))) {
      return res
        .status(404)
        .json({ success: false, message: "Anak tidak ditemukan." });
    }

    const [rows] = await db.query(
      `SELECT m.*, c.name AS child_name, c.gender, c.dob
       FROM measurements m
       JOIN children c ON c.id = m.child_id
       WHERE m.child_id = ? AND m.user_id = ?
       ORDER BY m.measure_date DESC`,
      [req.params.childId, req.user.id],
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data pemeriksaan." });
  }
});

// GET /api/measurements
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, c.name AS child_name, c.gender, c.dob
       FROM measurements m
       JOIN children c ON c.id = m.child_id
       WHERE m.user_id = ?
       ORDER BY m.measure_date DESC, m.created_at DESC`,
      [req.user.id],
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data pemeriksaan." });
  }
});

// GET /api/measurements/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, c.name AS child_name, c.gender
       FROM measurements m
       JOIN children c ON c.id = m.child_id
       WHERE m.id = ? AND m.user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pemeriksaan tidak ditemukan." });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data pemeriksaan." });
  }
});

// POST /api/measurements
router.post("/", async (req, res) => {
  try {
    const data = pickMeasurement(req.body);
    const missing = validateRequired(data);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib: ${missing.join(", ")}`,
      });
    }

    if (!(await ownsChild(req.user.id, data.child_id))) {
      return res.status(403).json({
        success: false,
        message: "Anak tidak ditemukan atau bukan milik Anda.",
      });
    }

    // Langsung INSERT tanpa cek duplikat,
    // agar setiap pengukuran selalu tersimpan sebagai riwayat baru
    const [result] = await db.query(
      `INSERT INTO measurements
         (child_id, user_id, measure_date, age_months, height_cm, weight_kg,
          bmi, haz, mph, who_median, who_minus2sd, status, status_label,
          father_height, father_weight, mother_height, mother_weight,
          father_bmi, mother_bmi, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.child_id,
        req.user.id,
        data.measure_date,
        data.age_months,
        data.height_cm,
        data.weight_kg,
        data.bmi,
        data.haz,
        data.mph,
        data.who_median,
        data.who_minus2sd,
        data.status,
        data.status_label,
        data.father_height,
        data.father_weight,
        data.mother_height,
        data.mother_weight,
        data.father_bmi,
        data.mother_bmi,
        data.notes,
      ],
    );

    return res
      .status(201)
      .json({ success: true, data: { id: result.insertId }, updated: false });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan pemeriksaan." });
  }
});

// PUT /api/measurements/:id
router.put("/:id", async (req, res) => {
  try {
    const data = pickMeasurement(req.body);
    const missing = validateRequired(data).filter((k) => k !== "child_id");
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib: ${missing.join(", ")}`,
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM measurements WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengukuran tidak ditemukan." });
    }

    await db.query(
      `UPDATE measurements SET
         measure_date=?, age_months=?, height_cm=?, weight_kg=?, bmi=?, haz=?, mph=?,
         who_median=?, who_minus2sd=?, status=?, status_label=?,
         father_height=?, father_weight=?, mother_height=?, mother_weight=?,
         father_bmi=?, mother_bmi=?, notes=?
       WHERE id=? AND user_id=?`,
      [
        data.measure_date,
        data.age_months,
        data.height_cm,
        data.weight_kg,
        data.bmi,
        data.haz,
        data.mph,
        data.who_median,
        data.who_minus2sd,
        data.status,
        data.status_label,
        data.father_height,
        data.father_weight,
        data.mother_height,
        data.mother_weight,
        data.father_bmi,
        data.mother_bmi,
        data.notes,
        req.params.id,
        req.user.id,
      ],
    );

    return res.json({
      success: true,
      message: "Data pengukuran berhasil diperbarui.",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data pengukuran." });
  }
});

// DELETE /api/measurements/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM measurements WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pemeriksaan tidak ditemukan." });
    }
    return res.json({ success: true, message: "Pemeriksaan dihapus." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus pemeriksaan." });
  }
});

module.exports = router;
