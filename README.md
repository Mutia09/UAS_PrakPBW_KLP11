# StuntCheck - Aplikasi Deteksi Dini Stunting pada Anak

## Deskripsi Singkat

StuntCheck adalah aplikasi web untuk membantu orang tua dan tenaga kesehatan dalam **mendeteksi dini risiko stunting** pada anak balita. Pengguna dapat mendaftarkan data anak, mencatat riwayat pengukuran tinggi dan berat badan secara berkala, serta mendapatkan analisis status pertumbuhan berdasarkan standar WHO (z-score HAZ). Aplikasi ini hadir sebagai solusi nyata terhadap permasalahan stunting yang masih menjadi isu kesehatan utama di Indonesia.

## Teknologi yang Digunakan

| Layer       | Teknologi                         |
| ----------- | --------------------------------- |
| Front-End   | HTML / CSS / JavaScript           |
| Back-End    | Node.js + Express.js              |
| Database    | MySQL                             |
| Autentikasi | JSON Web Token (JWT) + bcryptjs   |
| Email OTP   | Nodemailer (SMTP Gmail)           |
| Lainnya     | express-rate-limit, dotenv        |

## Fitur Utama

- **Autentikasi**: Registrasi, Login, Lupa Kata Sandi (via OTP Email), Ganti Kata Sandi
- **CRUD Data Anak**: Tambah, lihat, edit, dan hapus profil anak
- **CRUD Pengukuran**: Catat, lihat, perbarui, dan hapus riwayat pemeriksaan (tinggi, berat, BMI, z-score HAZ)
- **CRUD Profil Pengguna**: Lihat dan perbarui data profil akun
- **Dashboard**: Grafik pertumbuhan anak, status stunting, riwayat pemeriksaan
- **Responsif**: Tampilan optimal di desktop dan mobile


## Struktur Proyek

```
uas/
├── backend/
│   ├── server.js              # Entry point, konfigurasi Express
│   ├── schema.sql             # Skema database + data dummy
│   ├── package.json
│   ├── .env                   # (buat sendiri, lihat .env.example)
│   ├── .env.example
│   └── src/
│       ├── db.js              # Pool koneksi MySQL
│       ├── middleware/
│       │   └── auth.js        # Verifikasi JWT
│       └── routes/
│           ├── auth.js        # POST /register, POST /login
│           ├── children.js    # CRUD data anak
│           ├── measurements.js # CRUD riwayat pemeriksaan
│           └── user.js        # Profil, ganti password, hapus akun
└── frontend/
    ├── index.html             # Entry point SPA
    ├── html/                  # Partial HTML tiap halaman
    │   ├── auth.html
    │   ├── cek.html           # Form pemeriksaan 3 langkah
    │   ├── child.html
    │   ├── dashboard.html
    │   ├── modals.html
    │   └── profil.html
    ├── css/
    │   ├── base.css
    │   ├── responsive.css
    │   └── pages/
    ├── js/
    │   ├── app.js             # Router SPA
    │   └── core/
    │       ├── api.js         # HTTP client + token storage
    │       ├── calc.js        # Kalkulasi HAZ, BMI, MPH, klasifikasi
    │       ├── data.js
    │       ├── helpers.js
    │       └── state.js
    └── js/pages/              # Logic tiap halaman
        ├── auth.js
        ├── cek.js
        ├── child.js
        ├── dashboard.js
        └── profil.js
```

---

## Prasyarat

- **Node.js** ≥ 18
- **MySQL** 8+
- **Git**
- (Opsional) **Live Server** atau extension VS Code untuk menjalankan frontend

---

## Instalasi & Menjalankan

### 1. Clone / ekstrak proyek

```bash
# Jika dari zip
unzip uas.zip
cd uas
```

### 2. Setup Database

```bash
mysql -u root -p < backend/schema.sql
```

Perintah ini akan membuat database `stuntcheck_db`, semua tabel, dan memasukkan data dummy (8 akun orang tua + 12 anak + 15 data pengukuran).

### 3. Install dependensi backend

```bash
cd backend
npm install
```

### 4. Buat file `.env`

```bash
cp .env.example .env
```

Lalu edit `.env` — isi minimal:
```
DB_PASSWORD=kata_sandi_mysql_kamu
JWT_SECRET=string_acak_minimal_32_karakter
```

Lihat bagian [Konfigurasi Environment](#konfigurasi-environment) untuk detail lengkap.

### 5. Jalankan backend

```bash
# Mode produksi
npm start

# Mode development (auto-restart saat file berubah, Node.js ≥ 18)
npm run dev
```

Server berjalan di `http://localhost:3000`  
Health check: `http://localhost:3000/api/health`

### 6. Jalankan frontend

Buka folder `frontend/` dengan **Live Server** (VS Code) atau server statis apapun pada port 5500.

```bash
# Contoh pakai npx serve
npx serve frontend -p 5500
```

Akses di `http://localhost:5500`

---

## Konfigurasi Environment

Buat file `backend/.env` berdasarkan `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stuntcheck_db
DB_USER=root
DB_PASSWORD=kata_sandi_mysql_kamu

# JWT (ganti dengan string acak panjang, minimal 32 karakter)
JWT_SECRET=ganti_dengan_secret_panjang_dan_acak
JWT_EXPIRES_IN=7d

# Email — untuk fitur lupa kata sandi (OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailkamu@gmail.com
SMTP_PASS=app_password_gmail_kamu
SMTP_FROM="StuntCheck <emailkamu@gmail.com>"

# CORS — URL frontend yang diizinkan
FRONTEND_URL=http://localhost:5500
```

> **Catatan Gmail:** Gunakan **App Password** (bukan password biasa). Aktifkan 2FA di akun Google, lalu buat App Password di Pengaturan Akun → Keamanan → App Passwords.

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Auth — `/api/auth`
> Rate limit: 20 request per 15 menit

| Method | Path | Body | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | `first_name, last_name, email, password` | Daftar akun baru |
| POST | `/auth/login` | `email, password` | Login, mengembalikan JWT token |

**Response login/register:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com" }
}
```

---

### Data Anak — `/api/children`
> 🔒 Semua endpoint butuh header `Authorization: Bearer <token>`

| Method | Path | Keterangan |
|---|---|---|
| GET | `/children` | Daftar semua anak milik user login |
| GET | `/children/:id` | Detail satu anak |
| POST | `/children` | Tambah anak (atau update jika nama sudah ada) |
| PUT | `/children/:id` | Edit data anak |
| DELETE | `/children/:id` | Hapus anak (dan seluruh riwayatnya) |

**Body POST/PUT:**
```json
{
  "name": "Aldi",
  "gender": "L",
  "dob": "2022-03-10",
  "father_height": 170.0,
  "father_weight": 68.0,
  "mother_height": 157.0,
  "mother_weight": 52.0
}
```

---

### Riwayat Pemeriksaan — `/api/measurements`
> 🔒 Semua endpoint butuh header `Authorization: Bearer <token>`

| Method | Path | Keterangan |
|---|---|---|
| GET | `/measurements` | Semua riwayat pemeriksaan user |
| GET | `/measurements/child/:childId` | Riwayat pemeriksaan satu anak |
| GET | `/measurements/:id` | Detail satu pengukuran |
| POST | `/measurements` | Simpan pengukuran (atau update jika tanggal sama) |
| PUT | `/measurements/:id` | Edit pengukuran |
| DELETE | `/measurements/:id` | Hapus pengukuran |

---

### Profil User — `/api/user`
> 🔒 Semua endpoint butuh header `Authorization: Bearer <token>`

| Method | Path | Keterangan |
|---|---|---|
| GET | `/user/me` | Data profil user |
| PUT | `/user/profile` | Update nama & email |
| PUT | `/user/change-password` | Ganti kata sandi |
| DELETE | `/user/account` | Hapus akun dan semua data |

---

## Database

Skema terdiri dari 4 tabel:

```
users          → akun orang tua
  └── children → profil anak (FK → users)
        └── measurements → riwayat pemeriksaan (FK → children + users)

otp_tokens     → token reset password (FK → users)
```

### Kolom penting di `measurements`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `haz` | DECIMAL(6,3) | Height-for-Age Z-score |
| `mph` | DECIMAL(5,1) | Mid-Parental Height (potensi genetik) |
| `who_median` | DECIMAL(5,1) | Nilai median WHO untuk usia & gender |
| `who_minus2sd` | DECIMAL(5,1) | Nilai -2SD WHO |
| `status` | ENUM | `normal`, `risk`, `genetic`, `stunting` |

---

## Klasifikasi Status Stunting

Klasifikasi dilakukan di sisi klien (`js/core/calc.js`):

| Status | Kondisi HAZ | Kondisi MPH | Label |
|---|---|---|---|
| `normal` | ≥ −1 | — | Pertumbuhan Normal ✅ |
| `risk` | −2 s/d −1 | — | Risiko Stunting ⚠️ |
| `genetic` | < −2 | Tinggi ≥ MPH − 8.5 cm | Stunting Genetik 🧬 |
| `stunting` | < −2 | Tinggi < MPH − 8.5 cm | Stunting Patologis 🚨 |

**Formula:**
```
BMI   = berat_kg / (tinggi_m)²
MPH   = (tinggi_ayah + tinggi_ibu + 13) / 2   → anak laki-laki
MPH   = (tinggi_ayah + tinggi_ibu − 13) / 2   → anak perempuan
HAZ   = (tinggi_anak − WHO_median) / WHO_SD
```

---

## Data Dummy

Setelah menjalankan `schema.sql`, tersedia **8 akun orang tua** untuk testing:

| Email | Password |
|---|---|
| `budi@example.com` | `Test@1234` |
| `siti@example.com` | `Test@1234` |
| `ahmad@example.com` | `Test@1234` |
| `dewi@example.com` | `Test@1234` |
| `rudi@example.com` | `Test@1234` |
| `rina@example.com` | `Test@1234` |
| `hasan@example.com` | `Test@1234` |
| `nurul@example.com` | `Test@1234` |

Akun Budi (`budi@example.com`) memiliki 3 anak dengan total 6 data pengukuran dan mencakup semua variasi status (normal, risk, genetic, stunting).

---

## Scripts

```bash
npm start        # Jalankan server (produksi)
npm run dev      # Jalankan dengan auto-restart (Node.js --watch)
npm run db:init  # Inisialisasi database dari schema.sql
```

---

*StuntCheck — dibuat untuk membantu orang tua memantau tumbuh kembang anak secara mandiri.*
