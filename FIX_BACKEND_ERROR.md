# 🔧 Panduan Memperbaiki Backend Error

## 🚀 Langkah-langkah Perbaikan

### 1. Test Koneksi Database

Jalankan script untuk test koneksi database:

```bash
node test-db-connection.js
```

Script ini akan:
- ✅ Test koneksi ke MySQL/MariaDB server
- ✅ Cek apakah database `xclass` ada
- ✅ Test koneksi ke database
- ✅ Cek tabel yang ada
- ✅ Berikan solusi jika ada error

### 2. Pastikan File .env Ada dan Benar

Buat file `.env` di root directory dengan isi:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=xclass

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

**Catatan Penting:**
- Gunakan `127.0.0.1` bukan `localhost` untuk menghindari masalah koneksi MariaDB
- Jika MySQL password tidak kosong, isi `DB_PASSWORD`
- Database default adalah `xclass` (bukan `class`)

### 3. Pastikan Database Ada

Jika database belum ada, buat dengan:

```bash
node create-xclass-database.js
```

### 4. Pastikan MySQL/MariaDB Berjalan

1. Buka **XAMPP Control Panel**
2. Klik **"Start"** pada **MySQL** service
3. Tunggu sampai status menjadi **"Running"** (hijau)

### 5. Jalankan Backend

```bash
npm run start:dev
```

## 🔍 Troubleshooting

### Error: ECONNREFUSED
**Penyebab:** MySQL/MariaDB tidak berjalan

**Solusi:**
1. Buka XAMPP Control Panel
2. Start MySQL service
3. Test koneksi: `node test-db-connection.js`

### Error: ER_ACCESS_DENIED_ERROR
**Penyebab:** Username/password salah

**Solusi:**
1. Cek `.env` file
2. Default XAMPP: `username=root`, `password=(kosong)`
3. Jika ada password, update `DB_PASSWORD` di `.env`

### Error: ER_BAD_DB_ERROR
**Penyebab:** Database tidak ada

**Solusi:**
```bash
node create-xclass-database.js
```

### Error: Port 3000 already in use
**Penyebab:** Port 3000 sudah digunakan

**Solusi:**
1. Cek proses yang menggunakan port 3000
2. Kill proses tersebut atau ubah PORT di `.env`

### Error: Cannot find module
**Penyebab:** Dependencies belum diinstall

**Solusi:**
```bash
npm install
```

## ✅ Checklist

Sebelum menjalankan backend, pastikan:

- [ ] File `.env` ada dan dikonfigurasi dengan benar
- [ ] MySQL/MariaDB service berjalan di XAMPP
- [ ] Database `xclass` sudah dibuat
- [ ] Test koneksi berhasil: `node test-db-connection.js`
- [ ] Dependencies terinstall: `npm install`
- [ ] Port 3000 tidak digunakan oleh aplikasi lain

## 🎯 Quick Fix

Jika masih error, jalankan perintah ini secara berurutan:

```bash
# 1. Test koneksi database
node test-db-connection.js

# 2. Jika database belum ada, buat
node create-xclass-database.js

# 3. Install dependencies (jika belum)
npm install

# 4. Jalankan backend
npm run start:dev
```

## 📞 Masih Error?

Jika masih ada error setelah mengikuti langkah di atas:

1. **Cek error message** yang muncul saat `npm run start:dev`
2. **Jalankan test koneksi**: `node test-db-connection.js`
3. **Cek log** di console untuk detail error
4. **Pastikan** semua checklist di atas sudah dilakukan

