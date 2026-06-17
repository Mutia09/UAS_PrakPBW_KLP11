// src/db.js - MySQL connection pool
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_NAME || "stuntcheck_db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+07:00", // WIB
});

// Test koneksi saat startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅  MySQL terhubung:", process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌  MySQL gagal terhubung:", err.message);
    process.exit(1);
  });

module.exports = pool;
