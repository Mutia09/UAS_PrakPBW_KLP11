-- ============================================================
-- StuntCheck Database Schema
-- Jalankan: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS stuntcheck
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stuntcheck;

-- ============================================================
-- Tabel users (semua pengguna = orang tua)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100)        NOT NULL,
  last_name   VARCHAR(100)        NOT NULL DEFAULT '',
  email       VARCHAR(255)        NOT NULL UNIQUE,
  password    VARCHAR(255)        NOT NULL,
  created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- Tabel otp_tokens (lupa kata sandi)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED        NOT NULL,
  token      VARCHAR(6)          NOT NULL,
  expires_at DATETIME            NOT NULL,
  used       TINYINT(1)          NOT NULL DEFAULT 0,
  created_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Tabel children (data per anak)
-- ============================================================
CREATE TABLE IF NOT EXISTS children (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED        NOT NULL,
  name        VARCHAR(150)        NOT NULL,
  gender      ENUM('L','P')       NOT NULL,
  dob         DATE                    NULL,
  father_height DECIMAL(5,1)         NULL,
  father_weight DECIMAL(5,1)         NULL,
  mother_height DECIMAL(5,1)         NULL,
  mother_weight DECIMAL(5,1)         NULL,
  created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_child (user_id, name),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- Tabel measurements (riwayat pemeriksaan)
-- ============================================================
CREATE TABLE IF NOT EXISTS measurements (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  child_id        INT UNSIGNED    NOT NULL,
  user_id         INT UNSIGNED    NOT NULL,
  measure_date    DATE            NOT NULL,
  age_months      DECIMAL(5,1)    NOT NULL,
  height_cm       DECIMAL(5,1)    NOT NULL,
  weight_kg       DECIMAL(5,1)    NOT NULL,
  bmi             DECIMAL(5,2)    NOT NULL,
  haz             DECIMAL(6,3)    NOT NULL,
  mph             DECIMAL(5,1)    NOT NULL,
  who_median      DECIMAL(5,1)    NOT NULL,
  who_minus2sd    DECIMAL(5,1)    NOT NULL,
  status          ENUM('normal','risk','genetic','stunting') NOT NULL,
  status_label    VARCHAR(100)    NOT NULL,
  father_height   DECIMAL(5,1)       NULL COMMENT 'Snapshot saat pengukuran',
  father_weight   DECIMAL(5,1)       NULL,
  mother_height   DECIMAL(5,1)       NULL,
  mother_weight   DECIMAL(5,1)       NULL,
  father_bmi      DECIMAL(5,2)       NULL,
  mother_bmi      DECIMAL(5,2)       NULL,
  notes           TEXT               NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)    ON DELETE CASCADE,
  UNIQUE KEY uq_child_date (child_id, measure_date),
  INDEX idx_child (child_id),
  INDEX idx_user  (user_id),
  INDEX idx_date  (measure_date)
) ENGINE=InnoDB;

-- ============================================================
-- DATA DUMMY (8 akun orang tua, password = Test@1234)
-- Hash bcrypt dari "Test@1234" (cost 12)
-- ============================================================
INSERT IGNORE INTO users (first_name, last_name, email, password) VALUES
('Budi',    'Santoso',   'budi@example.com',    '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Siti',    'Rahayu',    'siti@example.com',    '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Ahmad',   'Fauzi',     'ahmad@example.com',   '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Dewi',    'Lestari',   'dewi@example.com',    '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Rudi',    'Hartono',   'rudi@example.com',    '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Rina',    'Wulandari', 'rina@example.com',    '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Hasan',   'Basri',     'hasan@example.com',   '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6'),
('Nurul',   'Hidayah',   'nurul@example.com',   '$2b$12$ZNEEvNvi2tCiGcnnKMzpN.KOFdPZwcUegEJ/BTCJAXRv0UEDT58q6');

-- user_id 1 = Budi, 2 = Siti, 3 = Ahmad, dst.
INSERT IGNORE INTO children (user_id, name, gender, dob, father_height, father_weight, mother_height, mother_weight) VALUES
(1, 'Aldi Santoso',    'L', '2022-03-10', 170.0, 68.0, 157.0, 52.0),
(1, 'Putri Santoso',   'P', '2023-07-22', 170.0, 68.0, 157.0, 52.0),
(2, 'Reza Rahayu',     'L', '2021-11-05', 168.0, 72.0, 155.0, 50.0),
(2, 'Nayla Rahayu',    'P', '2023-01-18', 168.0, 72.0, 155.0, 50.0),
(3, 'Fajar Fauzi',     'L', '2022-08-30', 172.0, 75.0, 160.0, 55.0),
(4, 'Zahra Lestari',   'P', '2021-05-14', 165.0, 63.0, 153.0, 48.0),
(5, 'Rizky Hartono',   'L', '2022-12-01', 175.0, 80.0, 162.0, 58.0),
(6, 'Salsa Wulandari', 'P', '2023-04-09', 167.0, 65.0, 156.0, 51.0),
(7, 'Dimas Basri',     'L', '2021-09-20', 169.0, 70.0, 158.0, 54.0),
(8, 'Kinanti Hidayah', 'P', '2022-06-15', 164.0, 60.0, 152.0, 47.0),
(1, 'Bagas Santoso',   'L', '2020-02-28', 170.0, 68.0, 157.0, 52.0),
(2, 'Adinda Rahayu',   'P', '2020-10-03', 168.0, 72.0, 155.0, 50.0);

INSERT IGNORE INTO measurements
  (child_id, user_id, measure_date, age_months, height_cm, weight_kg, bmi, haz, mph, who_median, who_minus2sd, status, status_label,
   father_height, father_weight, mother_height, mother_weight, father_bmi, mother_bmi, notes)
VALUES
(1, 1, '2024-03-10', 24.0, 87.5, 12.8, 16.70, -0.52, 91.8, 87.8, 80.0, 'normal',  'Pertumbuhan Normal',  170.0, 68.0, 157.0, 52.0, 23.53, 21.10, 'Tumbuh baik'),
(1, 1, '2024-06-10', 27.0, 90.2, 13.3, 16.35, -0.38, 92.5, 90.9, 82.8, 'normal',  'Pertumbuhan Normal',  170.0, 68.0, 157.0, 52.0, 23.53, 21.10, 'Lanjut pantau'),
(1, 1, '2024-09-10', 30.0, 93.0, 14.0, 16.19, -0.22, 93.3, 93.9, 85.6, 'normal',  'Pertumbuhan Normal',  170.0, 68.0, 157.0, 52.0, 23.53, 21.10, NULL),
(3, 2, '2024-02-05', 27.0, 83.5, 11.5, 16.48, -2.15, 88.1, 90.9, 82.8, 'risk',    'Risiko Stunting',     168.0, 72.0, 155.0, 50.0, 25.51, 20.81, 'Perlu perhatian gizi'),
(3, 2, '2024-05-05', 30.0, 86.0, 12.0, 16.22, -2.01, 89.0, 93.9, 85.6, 'risk',    'Risiko Stunting',     168.0, 72.0, 155.0, 50.0, 25.51, 20.81, 'Konsultasi dokter'),
(3, 2, '2024-08-05', 33.0, 88.5, 12.6, 16.08, -1.87, 89.8, 96.1, 87.8, 'risk',    'Risiko Stunting',     168.0, 72.0, 155.0, 50.0, 25.51, 20.81, 'Ada perbaikan'),
(5, 3, '2024-01-30', 17.0, 74.5, 9.8,  17.65, -2.58, 89.2, 81.7, 74.8, 'stunting','Stunting',            172.0, 75.0, 160.0, 55.0, 25.35, 21.48, 'Dirujuk ke puskesmas'),
(5, 3, '2024-04-30', 20.0, 77.0, 10.2, 17.21, -2.41, 89.9, 84.2, 77.1, 'stunting','Stunting',            172.0, 75.0, 160.0, 55.0, 25.35, 21.48, 'PMT diberikan'),
(6, 4, '2024-03-14', 34.0, 88.0, 12.2, 15.72, -1.95, 86.3, 97.8, 89.5, 'genetic', 'Pendek Faktor Genetik',165.0, 63.0, 153.0, 48.0, 23.14, 20.49, 'Orang tua juga pendek'),
(6, 4, '2024-07-14', 38.0, 91.5, 12.9, 15.40, -1.82, 87.0,101.2, 92.5, 'genetic', 'Pendek Faktor Genetik',165.0, 63.0, 153.0, 48.0, 23.14, 20.49, NULL),
(2, 1, '2024-09-22', 14.0, 74.0, 9.5,  17.30, -0.65, 90.5, 77.5, 70.3, 'normal',  'Pertumbuhan Normal',  170.0, 68.0, 157.0, 52.0, 23.53, 21.10, NULL),
(7, 5, '2024-06-01', 18.0, 80.5, 11.0, 16.97, -0.30, 91.0, 82.3, 75.2, 'normal',  'Pertumbuhan Normal',  175.0, 80.0, 162.0, 58.0, 26.12, 22.11, 'Tumbuh sesuai kurva'),
(9, 7, '2024-04-20', 31.0, 87.0, 11.8, 15.58, -2.20, 88.5, 95.0, 86.8, 'risk',    'Risiko Stunting',     169.0, 70.0, 158.0, 54.0, 24.51, 21.63, 'Pola makan perlu diperbaiki'),
(9, 7, '2024-07-20', 34.0, 89.5, 12.3, 15.36, -2.05, 89.1, 97.8, 89.5, 'risk',    'Risiko Stunting',     169.0, 70.0, 158.0, 54.0, 24.51, 21.63, 'Ada peningkatan'),
(11, 1, '2024-05-28', 51.0, 103.0, 16.5, 15.55, -0.45, 93.6,106.7, 98.0, 'normal', 'Pertumbuhan Normal',  170.0, 68.0, 157.0, 52.0, 23.53, 21.10, NULL);
