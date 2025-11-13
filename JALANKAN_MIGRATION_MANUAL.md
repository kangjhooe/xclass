# 🚀 Cara Menjalankan Migration - Manual

Karena script otomatis memerlukan koneksi database yang aktif, berikut adalah cara manual untuk menjalankan migration.

## 📋 Metode 1: Via phpMyAdmin (Paling Mudah)

### Langkah-langkah:

1. **Buka phpMyAdmin**
   - Buka browser
   - Akses: http://localhost/phpmyadmin
   - Login dengan username: `root` (password kosong jika default XAMPP)

2. **Pilih Database**
   - Di sidebar kiri, klik database `xclass`
   - Jika belum ada, buat dulu dengan menjalankan: `node create-xclass-database.js`

3. **Jalankan Migration**
   - Klik tab **"SQL"** di bagian atas
   - Buka file: `database/sql/add_student_academic_tracking_simple.sql`
   - Copy-paste **SEMUA** isi file tersebut ke textarea SQL
   - Klik tombol **"Go"** atau tekan **Ctrl+Enter**

4. **Verifikasi**
   - Jika berhasil, akan muncul pesan sukses
   - Jika ada error "column already exists" atau "index already exists", itu **NORMAL** - berarti kolom/index sudah ada sebelumnya
   - Scroll ke bawah untuk melihat hasil query verifikasi

## 📋 Metode 2: Via MySQL Command Line

### Langkah-langkah:

1. **Buka Command Prompt atau PowerShell**
   ```bash
   # Masuk ke direktori project
   cd C:\xampp\htdocs\xclass\xclass
   ```

2. **Masuk ke MySQL**
   ```bash
   # Jika password kosong (default XAMPP)
   mysql -u root
   
   # Jika ada password
   mysql -u root -p
   ```

3. **Pilih Database**
   ```sql
   USE xclass;
   ```

4. **Jalankan Migration**
   ```sql
   -- Copy-paste isi file: database/sql/add_student_academic_tracking_simple.sql
   -- Atau gunakan source command:
   SOURCE database/sql/add_student_academic_tracking_simple.sql;
   ```

5. **Verifikasi**
   ```sql
   -- Cek kolom
   DESCRIBE students;
   
   -- Cek index
   SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';
   
   -- Test view
   SELECT * FROM v_student_lifetime_summary LIMIT 5;
   ```

## 📋 Metode 3: Via MySQL Workbench (Jika Terinstall)

1. Buka MySQL Workbench
2. Connect ke localhost (root, password kosong)
3. Pilih database `xclass`
4. Buka file `database/sql/add_student_academic_tracking_simple.sql`
5. Jalankan script (Ctrl+Shift+Enter)

## ✅ Verifikasi Migration Berhasil

Setelah migration berjalan, verifikasi dengan query berikut:

```sql
-- 1. Cek kolom baru
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
- `academic_level` - VARCHAR(20) - NULL
- `current_grade` - VARCHAR(10) - NULL  
- `academic_year` - VARCHAR(10) - NULL

```sql
-- 2. Cek index
SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';
```

**Index yang harus ada:**
- `idx_students_nisn`
- `idx_students_academic_level`
- `idx_students_academic_year`
- `idx_students_level_grade_year`

```sql
-- 3. Test view
SELECT * FROM v_student_lifetime_summary LIMIT 5;
```

Jika query ini berhasil mengembalikan data, berarti view sudah dibuat dengan benar.

## ⚠️ Troubleshooting

### Error: "Table 'xclass.students' doesn't exist"
**Solusi:** Pastikan database `xclass` sudah dibuat dan tabel `students` sudah ada. Jika belum, jalankan aplikasi NestJS terlebih dahulu agar TypeORM membuat tabel-tabelnya.

### Error: "Duplicate column name 'academic_level'"
**Solusi:** Ini berarti kolom sudah ada. **Ini NORMAL** - lanjutkan saja ke langkah berikutnya atau skip bagian yang error.

### Error: "Duplicate key name 'idx_students_nisn'"
**Solusi:** Ini berarti index sudah ada. **Ini NORMAL** - lanjutkan saja.

### Error: "Table 'xclass.health_records' doesn't exist"
**Solusi:** Beberapa tabel mungkin belum dibuat. **Ini NORMAL** - script akan skip bagian yang error dan melanjutkan. Yang penting adalah kolom di tabel `students` sudah ditambahkan.

## 🎯 Yang Paling Penting

Yang **PALING PENTING** adalah memastikan 3 kolom ini sudah ditambahkan ke tabel `students`:
- ✅ `academic_level`
- ✅ `current_grade`
- ✅ `academic_year`

Jika 3 kolom ini sudah ada, migration sudah **BERHASIL**!

## 📝 Setelah Migration Berhasil

1. ✅ Restart aplikasi NestJS (jika sedang berjalan)
2. ✅ Test endpoint: `GET /students/nisn/{nisn}/lifetime`
3. ✅ Update data existing siswa dengan academic level jika perlu

---

**File Migration Sederhana:** `database/sql/add_student_academic_tracking_simple.sql`  
**File Migration Lengkap:** `database/sql/add_student_academic_tracking.sql`

