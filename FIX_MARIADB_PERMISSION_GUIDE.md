# 🔧 Panduan Lengkap Fix MariaDB Permission Error

## ❌ Error yang Terjadi

```
ERROR 1130 (HY000): Host 'localhost' is not allowed to connect to this MariaDB server
```

Error ini terjadi karena user `root@localhost` tidak memiliki permission yang tepat di MariaDB/XAMPP.

## ✅ Solusi Cepat (Paling Mudah)

### Metode 1: Menggunakan Script Batch (RECOMMENDED)

1. **Buka Command Prompt sebagai Administrator**
   - Tekan `Win + X`
   - Pilih "Windows PowerShell (Admin)" atau "Command Prompt (Admin)"

2. **Jalankan script:**
   ```batch
   cd C:\xampp\htdocs\xclass\xclass
   fix-mariadb-simple.bat
   ```

3. **Restart MySQL dari XAMPP Control Panel**
   - Buka XAMPP Control Panel
   - Klik "Stop" pada MySQL (jika masih running)
   - Klik "Start" pada MySQL

4. **Test koneksi:**
   ```bash
   node test-db-connection.js
   ```

### Metode 2: Menggunakan PowerShell Script

1. **Buka PowerShell sebagai Administrator**

2. **Jalankan script:**
   ```powershell
   cd C:\xampp\htdocs\xclass\xclass
   .\fix-mariadb-permission-safe.ps1
   ```

3. **Restart MySQL dari XAMPP Control Panel**

4. **Test koneksi:**
   ```bash
   node test-db-connection.js
   ```

## 🔧 Solusi Manual (Jika Script Tidak Bekerja)

### Langkah 1: Stop MySQL

1. Buka **XAMPP Control Panel**
2. Klik **"Stop"** pada MySQL service

### Langkah 2: Start MySQL dengan Skip Grant Tables

1. Buka **Command Prompt sebagai Administrator**

2. Jalankan:
   ```batch
   cd C:\xampp\mysql\bin
   mysqld.exe --skip-grant-tables --datadir="C:\xampp\mysql\data"
   ```

3. Biarkan window ini terbuka (jangan tutup)

### Langkah 3: Fix Permission (Terminal Baru)

1. Buka **Command Prompt baru** (bukan yang tadi)

2. Masuk ke MySQL:
   ```batch
   C:\xampp\mysql\bin\mysql.exe -u root
   ```

3. Jalankan query berikut:
   ```sql
   USE mysql;
   
   -- Update existing root user
   UPDATE user SET host='%' WHERE user='root' AND host='localhost';
   
   -- Create root@localhost if not exists
   CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
   
   -- Create root@127.0.0.1 if not exists
   CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
   
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Langkah 4: Stop MySQL dan Restart Normal

1. Di terminal pertama (yang menjalankan mysqld), tekan `Ctrl + C` untuk stop

2. Atau tutup terminal tersebut

3. Buka **XAMPP Control Panel**

4. Klik **"Start"** pada MySQL service

### Langkah 5: Test Koneksi

```bash
node test-db-connection.js
```

## 🎯 Alternatif: Buat User Baru

Jika fix root tidak bekerja, buat user baru khusus untuk aplikasi:

### Via Command Line (dengan skip-grant-tables)

1. Start MySQL dengan skip-grant-tables (seperti di atas)

2. Masuk ke MySQL:
   ```batch
   C:\xampp\mysql\bin\mysql.exe -u root
   ```

3. Buat user baru:
   ```sql
   USE mysql;
   
   CREATE USER 'xclass'@'localhost' IDENTIFIED BY '';
   CREATE USER 'xclass'@'127.0.0.1' IDENTIFIED BY '';
   
   GRANT ALL PRIVILEGES ON *.* TO 'xclass'@'localhost';
   GRANT ALL PRIVILEGES ON *.* TO 'xclass'@'127.0.0.1';
   
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. Update file `.env`:
   ```env
   DB_USERNAME=xclass
   DB_PASSWORD=
   ```

5. Restart MySQL normal dan test

## ✅ Verifikasi

Setelah fix, test dengan:

1. **Test koneksi database:**
   ```bash
   node test-db-connection.js
   ```

2. **Test phpMyAdmin:**
   - Buka: http://localhost/phpmyadmin
   - Username: `root`
   - Password: (kosong)

3. **Test backend:**
   ```bash
   npm run start:dev
   ```

## 📝 Catatan Penting

- ⚠️ **Jangan tutup terminal** saat MySQL berjalan dengan `--skip-grant-tables`
- ✅ Setelah fix, **selalu restart MySQL normal** dari XAMPP Control Panel
- 🔒 Untuk production, **jangan gunakan password kosong**
- 💡 Jika masih error, coba **restart komputer** setelah fix

## 🆘 Masih Error?

Jika semua metode di atas tidak bekerja:

1. **Cek apakah MySQL benar-benar running:**
   ```batch
   tasklist | findstr mysqld
   ```

2. **Cek port 3306:**
   ```batch
   netstat -an | findstr 3306
   ```

3. **Coba uninstall dan reinstall XAMPP** (backup data dulu!)

4. **Atau gunakan MySQL Server resmi** dari Oracle (bukan MariaDB)

