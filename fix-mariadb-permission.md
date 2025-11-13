# 🔧 Fix MariaDB Permission Error

## ❌ Error yang Terjadi

```
Error: Host 'localhost' is not allowed to connect to this MariaDB server
Code: ER_HOST_NOT_PRIVILEGED
```

## 🔍 Penyebab

MariaDB/MySQL membatasi koneksi berdasarkan host. User `root@localhost` mungkin tidak memiliki permission yang tepat.

## ✅ Solusi

### Metode 1: Via phpMyAdmin (Paling Mudah)

1. **Buka phpMyAdmin**
   ```
   http://localhost/phpmyadmin
   ```
   - Username: `root`
   - Password: (kosong)

2. **Klik tab "SQL"**

3. **Jalankan query berikut:**

```sql
-- Grant all privileges to root@localhost
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY '' WITH GRANT OPTION;

-- Grant all privileges to root@127.0.0.1
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' IDENTIFIED BY '' WITH GRANT OPTION;

-- Flush privileges
FLUSH PRIVILEGES;
```

4. **Klik "Go"**

5. **Test koneksi lagi:**
   ```bash
   node test-db-connection.js
   ```

### Metode 2: Via MySQL Command Line

1. **Buka Command Prompt atau PowerShell**

2. **Masuk ke MySQL:**
   ```bash
   C:\xampp\mysql\bin\mysql.exe -u root
   ```

3. **Jalankan query:**
   ```sql
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY '' WITH GRANT OPTION;
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' IDENTIFIED BY '' WITH GRANT OPTION;
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Test koneksi lagi:**
   ```bash
   node test-db-connection.js
   ```

### Metode 3: Alternative - Create New User

Jika metode di atas tidak bekerja, buat user baru:

1. **Via phpMyAdmin SQL tab:**

```sql
-- Create new user
CREATE USER 'xclass'@'127.0.0.1' IDENTIFIED BY '';
CREATE USER 'xclass'@'localhost' IDENTIFIED BY '';

-- Grant privileges
GRANT ALL PRIVILEGES ON xclass.* TO 'xclass'@'127.0.0.1';
GRANT ALL PRIVILEGES ON xclass.* TO 'xclass'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
```

2. **Update .env file:**
   ```env
   DB_USERNAME=xclass
   DB_PASSWORD=
   ```

3. **Test koneksi:**
   ```bash
   node test-db-connection.js
   ```

## 🎯 Quick Fix Script

Jalankan script ini untuk otomatis fix permission:

```bash
node fix-mariadb-permission.js
```

*(Script akan dibuat jika diperlukan)*

## ✅ Verifikasi

Setelah fix, test koneksi:

```bash
node test-db-connection.js
```

Jika berhasil, akan muncul:
```
✅✅✅ All tests passed! Database connection is working.
```

## 📝 Catatan

- Error ini biasanya terjadi setelah install XAMPP baru
- Permission perlu di-set sekali saja
- Setelah fix, backend seharusnya bisa berjalan normal

