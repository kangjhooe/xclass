# Data Login Aplikasi CLASS

## Login Super Admin
**Link**: `http://localhost:3001/login`
- **Email**: `admin@class.app`
- **Password**: `password`
- **Role**: `super_admin`
- **Redirect**: `/admin/dashboard`

## Login Tenant 10816663 (MTs Sample School)

### Admin Tenant
**Link**: `http://localhost:3001/login` (akan redirect ke `http://localhost:3001/10816663/dashboard`)
- **Email**: `admin@mts-sample.sch.id`
- **Password**: `password`
- **Role**: `admin_tenant`
- **Tenant ID**: 10816663
- **NPSN**: 10816663

### Cara Membuat Admin untuk Tenant 10816663
Jika admin belum ada, jalankan script berikut:
```bash
node create-tenant-admin.js
```

## Login Tenant Lainnya

### SMA Negeri 1 Jakarta
**Link**: `http://localhost:3001/12345678/login`
- **NPSN**: 12345678
- **Admin**: `admin@sman1jakarta.sch.id` / `password`
- **Guru**: `guru@sman1jakarta.sch.id` / `password`

### SMA Al Falah Krui
**Link**: `http://localhost:3001/12345678/login`
- **NPSN**: 12345678
- **Admin**: `admin@alfalahkrui.com` / `password`

### SMA Negeri 2 Jakarta
**Link**: `http://localhost:3001/87654321/login`
- **NPSN**: 87654321
- **Admin**: `admin.test@sman2jakarta.sch.id` / `password`
- **Guru 1**: `guru1.test@sman2jakarta.sch.id` / `password`
- **Guru 2**: `guru2.test@sman2jakarta.sch.id` / `password`
- **Siswa 1**: `siswa1.test@sman2jakarta.sch.id` / `password`
- **Siswa 2**: `siswa2.test@sman2jakarta.sch.id` / `password`
- **Orang Tua**: `ortu.test@sman2jakarta.sch.id` / `password`

## Struktur Data Login Response

Setelah login berhasil, response akan berisi:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin MTs Sample School",
    "email": "admin@mts-sample.sch.id",
    "role": "admin_tenant",
    "instansiId": 10816663,
    "tenant_id": 10816663,
    "isActive": true,
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Peran Pengguna (Roles)

1. **super_admin** - Administrator sistem utama (tidak punya instansiId)
2. **admin_tenant** - Administrator sekolah/tenant
3. **teacher** - Guru
4. **student** - Siswa
5. **staff** - Staf sekolah

## Catatan Penting

- **Semua password default**: `password`
- **Format tanggal**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Timezone**: UTC (akan dikonversi ke Asia/Jakarta di frontend)
- **Redirect setelah login**:
  - Super admin → `/admin/dashboard`
  - Tenant admin/user → `/{npsn}/dashboard` atau `/{tenantId}/dashboard`
- **Tenant ID vs NPSN**: 
  - Sistem akan mencoba menggunakan NPSN terlebih dahulu
  - Jika NPSN tidak ditemukan, akan menggunakan Tenant ID sebagai fallback

## Troubleshooting Login

### Masalah: Tidak bisa login admin tenant
**Solusi**: Jalankan script untuk memeriksa dan memperbaiki:
```bash
node check-tenant-admin.js
```

Script ini akan:
- Memeriksa apakah user admin ada
- Memastikan password sudah di-hash dengan benar
- Memastikan user aktif (`isActive = 1`)
- Memperbaiki `instansiId` dan `instansi_id` jika tidak sinkron

### Masalah: Redirect ke `/1/dashboard` setelah login
**Solusi**: Sudah diperbaiki di `frontend/app/login/page.tsx`. Sistem sekarang akan:
1. Mencoba mendapatkan NPSN dari tenant
2. Jika NPSN tidak ditemukan, akan menggunakan Tenant ID yang benar (bukan hardcoded `1`)

### Masalah: User tidak ditemukan
**Solusi**: 
1. Pastikan user sudah dibuat di database
2. Pastikan `instansiId` user sesuai dengan tenant ID
3. Pastikan `isActive = 1`
4. Jalankan: `node create-tenant-admin.js` untuk membuat user baru

### Masalah: Password salah
**Solusi**:
1. Password di database harus di-hash dengan bcrypt
2. Default password: `password`
3. Jalankan: `node check-tenant-admin.js` untuk memperbaiki password
4. Untuk membuat user baru, gunakan script `create-tenant-admin.js`

### Masalah: "Email atau password salah" padahal sudah benar
**Solusi**:
1. Pastikan password sudah di-hash dengan bcrypt (bukan plain text)
2. Pastikan kolom `instansiId` dan `instansi_id` terisi dengan benar
3. Pastikan `isActive = 1`
4. Jalankan: `node check-tenant-admin.js` untuk memperbaiki semua masalah

## Menjalankan Seeder (jika menggunakan Laravel/PHP)

```bash
php artisan db:seed
php artisan db:seed --class=TenantSeeder
php artisan db:seed --class=SystemTestSeeder
php artisan db:seed --class=PublicPageSeeder
```

## Query Database untuk Cek User

```sql
-- Cek semua user untuk tenant 10816663
SELECT id, name, email, role, instansi_id, is_active 
FROM users 
WHERE instansi_id = (SELECT id FROM tenants WHERE npsn = '10816663');

-- Cek super admin
SELECT id, name, email, role, instansi_id, is_active 
FROM users 
WHERE role = 'super_admin' AND (instansi_id IS NULL OR instansi_id = 0);

-- Cek tenant 10816663
SELECT id, npsn, name, is_active 
FROM tenants 
WHERE npsn = '10816663';
```
