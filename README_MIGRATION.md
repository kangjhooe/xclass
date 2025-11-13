# 🚀 Migration Academic Tracking - READY TO RUN

## ✅ Status: SIAP DIJALANKAN

Migration untuk **Data Siswa Lifetime** sudah siap. File-file sudah dibuat dan siap digunakan.

## 📋 File Migration

1. **`database/sql/add_student_academic_tracking_simple.sql`** ⭐ RECOMMENDED
   - Versi sederhana, mudah dijalankan
   - Cocok untuk phpMyAdmin atau MySQL CLI

2. **`database/sql/add_student_academic_tracking.sql`**
   - Versi lengkap dengan error handling
   - Untuk penggunaan advanced

3. **`run-migration.ps1`**
   - Script PowerShell otomatis
   - **BUTUH MySQL service berjalan**

## 🎯 Cara Menjalankan Migration

### ⚡ METODE TERCEPAT: Via phpMyAdmin (Recommended)

**Langkah-langkah:**

1. **Start MySQL Service**
   - Buka **XAMPP Control Panel**
   - Klik **"Start"** pada **MySQL** service
   - Tunggu sampai status menjadi **"Running"** (hijau)

2. **Buka phpMyAdmin**
   - Buka browser
   - Akses: **http://localhost/phpmyadmin**
   - Login:
     - Username: `root`
     - Password: (kosong jika default XAMPP)

3. **Pilih Database**
   - Di sidebar kiri, klik database **`xclass`**
   - Jika belum ada, buat dulu:
     ```bash
     node create-xclass-database.js
     ```

4. **Jalankan Migration**
   - Klik tab **"SQL"** di bagian atas
   - Buka file: **`database/sql/add_student_academic_tracking_simple.sql`**
   - **Copy-paste SEMUA isi file** ke textarea SQL
   - Klik tombol **"Go"** atau tekan **Ctrl+Enter**

5. **Selesai!** ✅
   - Jika ada error "column already exists" → **NORMAL**, lanjutkan saja
   - Scroll ke bawah untuk melihat hasil verifikasi

### 🔧 METODE 2: Via MySQL Command Line

```bash
# 1. Start MySQL service di XAMPP Control Panel dulu!

# 2. Masuk ke MySQL
C:\xampp\mysql\bin\mysql.exe -u root

# 3. Pilih database
USE xclass;

# 4. Jalankan migration
SOURCE database/sql/add_student_academic_tracking_simple.sql;

# 5. Verifikasi
DESCRIBE students;
```

### 🤖 METODE 3: Via PowerShell Script (Otomatis)

```powershell
# 1. Start MySQL service di XAMPP Control Panel dulu!

# 2. Jalankan script
powershell -ExecutionPolicy Bypass -File run-migration.ps1
```

## ✅ Verifikasi Migration Berhasil

Setelah migration berjalan, jalankan query ini untuk verifikasi:

```sql
-- Cek kolom baru
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'xclass'
AND TABLE_NAME = 'students'
AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');
```

**Hasil yang diharapkan:**
- ✅ `academic_level` - VARCHAR(20) - NULL
- ✅ `current_grade` - VARCHAR(10) - NULL  
- ✅ `academic_year` - VARCHAR(10) - NULL

**Atau query sederhana:**
```sql
DESCRIBE students;
```

Pastikan ada 3 kolom baru:
- `academic_level`
- `current_grade`
- `academic_year`

## 🎯 Yang Paling Penting

Yang **PALING PENTING** adalah memastikan 3 kolom ini sudah ditambahkan ke tabel `students`:
- ✅ `academic_level`
- ✅ `current_grade`
- ✅ `academic_year`

Jika 3 kolom ini sudah ada, migration **BERHASIL**! 🎉

## ⚠️ Troubleshooting

### Error: "Can't connect to MySQL server"
**Solusi:** 
- Buka XAMPP Control Panel
- Start MySQL service
- Tunggu sampai status "Running"

### Error: "Table 'xclass.students' doesn't exist"
**Solusi:** 
- Pastikan database `xclass` sudah dibuat
- Jalankan: `node create-xclass-database.js`
- Atau start aplikasi NestJS agar TypeORM membuat tabel-tabelnya

### Error: "Duplicate column name 'academic_level'"
**Solusi:** 
- Ini **NORMAL** - berarti kolom sudah ada
- Migration sudah pernah dijalankan sebelumnya
- Lanjutkan saja atau skip bagian yang error

### Error: "Duplicate key name 'idx_students_nisn'"
**Solusi:** 
- Ini **NORMAL** - berarti index sudah ada
- Lanjutkan saja

## 📝 Setelah Migration Berhasil

1. ✅ **Restart aplikasi NestJS** (jika sedang berjalan)
   ```bash
   # Stop aplikasi (Ctrl+C)
   # Start lagi
   npm run start:dev
   ```

2. ✅ **Test endpoint API:**
   ```bash
   GET /students/nisn/{nisn}/lifetime
   ```

3. ✅ **Update data existing siswa** dengan academic level jika perlu:
   ```sql
   UPDATE students 
   SET academic_level = 'SD', 
       current_grade = '1', 
       academic_year = '2024/2025'
   WHERE academic_level IS NULL;
   ```

## 📚 Dokumentasi Lengkap

- **Panduan Migration Manual**: `JALANKAN_MIGRATION_MANUAL.md`
- **Arsitektur Lengkap**: `REKOMENDASI_DATA_SISWA_LIFETIME.md`
- **Ringkasan Implementasi**: `IMPLEMENTASI_SELESAI.md`
- **Migration Ready**: `MIGRATION_READY.md`

## 🎉 Summary

**Status**: ✅ **SIAP DIJALANKAN**

**Yang Perlu Dilakukan**:
1. Start MySQL service di XAMPP
2. Buka phpMyAdmin
3. Jalankan file: `database/sql/add_student_academic_tracking_simple.sql`
4. Verifikasi kolom sudah ditambahkan
5. Selesai! ✅

---

**File Migration**: `database/sql/add_student_academic_tracking_simple.sql`  
**Metode Tercepat**: Via phpMyAdmin  
**Waktu Estimasi**: 2-5 menit

