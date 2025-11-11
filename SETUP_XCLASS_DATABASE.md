# Setup Database xclass

## Langkah-langkah Setup Database xclass

### 1. Pastikan MySQL/XAMPP Berjalan

Pastikan MySQL service di XAMPP sudah berjalan:
- Buka XAMPP Control Panel
- Start MySQL service

### 2. Buat File .env

Buat file `.env` di root directory project dengan isi berikut:

```env
# Database Configuration
DB_HOST=localhost
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

**Catatan:** 
- Jika MySQL password tidak kosong, isi `DB_PASSWORD` dengan password MySQL Anda
- Jika MySQL berjalan di port lain, sesuaikan `DB_PORT`

### 3. Jalankan Script untuk Membuat Database

Setelah MySQL berjalan dan file `.env` dibuat, jalankan:

```bash
node create-xclass-database.js
```

Script ini akan:
- Membuat database `xclass` jika belum ada
- Menggunakan charset `utf8mb4` dan collation `utf8mb4_unicode_ci`

### 4. Verifikasi Database

Setelah script berhasil dijalankan, Anda bisa verifikasi dengan:

```bash
# Masuk ke MySQL
mysql -u root -p

# Atau jika tanpa password
mysql -u root

# Cek database
SHOW DATABASES;

# Gunakan database xclass
USE xclass;

# Cek tabel (jika sudah ada)
SHOW TABLES;
```

### 5. Jalankan Aplikasi

Setelah database dibuat, jalankan aplikasi:

```bash
npm run dev
```

TypeORM akan otomatis membuat tabel-tabel yang diperlukan berdasarkan entities jika `synchronize: true` diaktifkan (untuk development).

**Peringatan:** Untuk production, gunakan migration, jangan `synchronize: true`.

