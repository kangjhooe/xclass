# Cara Menjalankan Migration Academic Tracking

## 📋 Ringkasan

Migration ini menambahkan field untuk tracking level akademik siswa (`academic_level`, `current_grade`, `academic_year`) dan index untuk optimasi query.

## 🚀 Metode 1: Menggunakan Script Node.js (Recommended)

### Prerequisites
- Node.js terinstall
- MySQL/XAMPP berjalan
- File `.env` sudah dikonfigurasi dengan database credentials

### Langkah-langkah:

1. **Pastikan MySQL/XAMPP berjalan**
   ```bash
   # Buka XAMPP Control Panel
   # Start MySQL service
   ```

2. **Cek file `.env`**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_DATABASE=xclass
   ```

3. **Jalankan script migration**
   ```bash
   node run-academic-tracking-migration.js
   ```

4. **Verifikasi hasil**
   Script akan menampilkan:
   - ✅ Kolom yang berhasil ditambahkan
   - ✅ Index yang berhasil dibuat
   - ✅ View yang berhasil dibuat

## 🗄️ Metode 2: Manual via MySQL Client

Jika script tidak bisa dijalankan, Anda bisa menjalankan SQL secara manual:

### Langkah-langkah:

1. **Buka MySQL Client**
   ```bash
   # Via command line
   mysql -u root -p
   
   # Atau via XAMPP phpMyAdmin
   # Buka http://localhost/phpmyadmin
   ```

2. **Pilih database**
   ```sql
   USE xclass;
   ```

3. **Jalankan migration SQL**
   ```sql
   -- Baca dan jalankan file:
   -- database/sql/add_student_academic_tracking.sql
   
   -- Atau copy-paste isi file SQL tersebut
   ```

4. **Verifikasi**
   ```sql
   -- Cek kolom yang ditambahkan
   DESCRIBE students;
   
   -- Atau
   SHOW COLUMNS FROM students LIKE 'academic%';
   SHOW COLUMNS FROM students LIKE 'current_grade';
   SHOW COLUMNS FROM students LIKE 'academic_year';
   
   -- Cek index
   SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';
   ```

## 🔧 Metode 3: Via phpMyAdmin

1. Buka http://localhost/phpmyadmin
2. Pilih database `xclass`
3. Klik tab "SQL"
4. Copy-paste isi file `database/sql/add_student_academic_tracking.sql`
5. Klik "Go" untuk menjalankan

## ✅ Verifikasi Migration Berhasil

### 1. Cek Kolom Baru

```sql
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

### 2. Cek Index

```sql
SHOW INDEX FROM students WHERE Key_name LIKE 'idx_students%';
```

**Index yang harus ada:**
- `idx_students_nisn`
- `idx_students_academic_level`
- `idx_students_academic_year`
- `idx_students_level_grade_year`

### 3. Cek View

```sql
SELECT * FROM v_student_lifetime_summary LIMIT 5;
```

Jika view berhasil dibuat, query ini akan mengembalikan data summary siswa.

## 🐛 Troubleshooting

### Error: "Column already exists"
**Solusi:** Kolom sudah ada, migration sebagian sudah berjalan. Lanjutkan ke langkah berikutnya.

### Error: "Table doesn't exist"
**Solusi:** Pastikan database `xclass` sudah dibuat dan tabel `students` sudah ada.

### Error: "Access denied"
**Solusi:** 
- Cek credentials di file `.env`
- Pastikan user MySQL memiliki privilege untuk ALTER TABLE dan CREATE INDEX

### Error: "Connection refused"
**Solusi:**
- Pastikan MySQL/XAMPP sudah berjalan
- Cek port MySQL (default: 3306)
- Cek firewall settings

## 📝 Catatan Penting

1. **Backup Database**: Sebelum menjalankan migration, disarankan untuk backup database terlebih dahulu
   ```bash
   mysqldump -u root -p xclass > backup_before_migration.sql
   ```

2. **Rollback**: Jika perlu rollback, jalankan:
   ```sql
   ALTER TABLE students DROP COLUMN academic_level;
   ALTER TABLE students DROP COLUMN current_grade;
   ALTER TABLE students DROP COLUMN academic_year;
   DROP INDEX idx_students_nisn ON students;
   DROP INDEX idx_students_academic_level ON students;
   DROP INDEX idx_students_academic_year ON students;
   DROP INDEX idx_students_level_grade_year ON students;
   DROP VIEW IF EXISTS v_student_lifetime_summary;
   ```

3. **TypeORM Sync**: Jika menggunakan `synchronize: true`, TypeORM akan otomatis menambahkan kolom berdasarkan entity. Tapi untuk production, gunakan migration.

## 🎯 Setelah Migration

Setelah migration berhasil:

1. ✅ Kolom baru sudah ditambahkan ke tabel `students`
2. ✅ Index sudah dibuat untuk optimasi query
3. ✅ View `v_student_lifetime_summary` sudah dibuat
4. ✅ Relasi di Student entity sudah lengkap

**Langkah selanjutnya:**
- Update data existing siswa dengan `academic_level`, `current_grade`, dan `academic_year`
- Test query untuk lifetime data siswa
- Update frontend untuk menampilkan data akademik

---

**File Migration:** `database/sql/add_student_academic_tracking.sql`  
**Script Runner:** `run-academic-tracking-migration.js`  
**Dokumentasi Lengkap:** `REKOMENDASI_DATA_SISWA_LIFETIME.md`

