# 🚀 Cara Menjalankan Migration Pricing

## Opsi 1: Via Node.js Script (Recommended)

### 1. Pastikan MySQL Service Berjalan

**Windows (XAMPP):**
1. Buka **XAMPP Control Panel**
2. Klik **"Start"** pada **MySQL** service
3. Tunggu sampai status menjadi **"Running"** (hijau)

**Linux/Mac:**
```bash
sudo systemctl start mysql
# atau
sudo service mysql start
```

### 2. Jalankan Migration Script

```bash
node run-pricing-migration.js
```

Script akan:
- ✅ Menghubungkan ke database
- ✅ Menambahkan field `locked_price_per_student`
- ✅ Update subscription plans dengan pricing baru
- ✅ Update existing subscriptions
- ✅ Verifikasi hasil migration

---

## Opsi 2: Via MySQL Command Line

### 1. Masuk ke MySQL

```bash
# Windows (XAMPP)
C:\xampp\mysql\bin\mysql.exe -u root

# Linux/Mac
mysql -u root -p
```

### 2. Pilih Database

```sql
USE xclass;
-- atau
USE class;
```

### 3. Jalankan Migration File

```sql
SOURCE database/sql/pricing_update_migration.sql;
```

**Atau copy-paste isi file SQL langsung ke MySQL console**

---

## Opsi 3: Via phpMyAdmin (Paling Mudah)

### 1. Buka phpMyAdmin

```
http://localhost/phpmyadmin
```

### 2. Pilih Database

- Pilih database **xclass** atau **class** (sesuai yang digunakan)

### 3. Import SQL File

1. Klik tab **"SQL"**
2. Klik **"Choose File"** atau **"Pilih File"**
3. Pilih file: `database/sql/pricing_update_migration.sql`
4. Klik **"Go"** atau **"Jalankan"**

---

## ✅ Verifikasi Migration

Setelah migration berhasil, verifikasi dengan:

```sql
-- Check field baru
DESCRIBE tenant_subscriptions;

-- Check subscription plans
SELECT * FROM subscription_plans WHERE slug IN ('free-forever', 'standard', 'enterprise');

-- Check existing subscriptions
SELECT 
  id,
  tenant_id,
  current_student_count,
  locked_price_per_student,
  subscription_plan_id
FROM tenant_subscriptions
WHERE status = 'active'
LIMIT 5;
```

---

## 🔧 Troubleshooting

### Error: ECONNREFUSED
**Penyebab:** MySQL service tidak berjalan

**Solusi:**
- Start MySQL service di XAMPP Control Panel
- Atau gunakan Opsi 2/3 (MySQL CLI atau phpMyAdmin)

### Error: ER_ACCESS_DENIED_ERROR
**Penyebab:** Username/password salah

**Solusi:**
- Cek file `.env` untuk kredensial database
- Default XAMPP: `username=root`, `password=(kosong)`
- Jika ada password, update di `.env` atau gunakan Opsi 3 (phpMyAdmin)

### Error: ER_BAD_DB_ERROR
**Penyebab:** Database tidak ada

**Solusi:**
```bash
# Buat database jika belum ada
node create-xclass-database.js
```

### Error: Table doesn't exist
**Penyebab:** Tabel `tenant_subscriptions` belum ada

**Solusi:**
- Pastikan aplikasi sudah dijalankan minimal sekali untuk create tables
- Atau jalankan migration database lainnya terlebih dahulu

---

## 📋 Checklist

- [ ] MySQL service berjalan
- [ ] Database sudah ada (xclass atau class)
- [ ] Tabel `tenant_subscriptions` sudah ada
- [ ] Tabel `subscription_plans` sudah ada
- [ ] Migration berhasil dijalankan
- [ ] Field `locked_price_per_student` sudah ditambahkan
- [ ] Subscription plans sudah diupdate

---

**Setelah migration berhasil, restart aplikasi untuk load perubahan!**
