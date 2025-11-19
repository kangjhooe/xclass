# Modul Kantin (Cafeteria)

Modul ini mengelola seluruh operasional kantin/sekolah yang dapat memiliki lebih dari satu outlet. Backend dibangun di atas NestJS + TypeORM dengan dukungan multi-tenant (`instansiId`).

## Fitur Utama

- **Manajemen Outlet Kantin**
  - CRUD outlet (`/cafeteria/canteens`) dengan profil: nama, lokasi, kontak, jam operasional, status aktif.
  - Setiap outlet terhubung ke tenant sekolah.

- **Manajemen Menu**
  - Menu terkait outlet tertentu dan kategori (`food`, `drink`, `snack`).
  - Dukungan stok, status ketersediaan, gambar.
  - Filter menu berdasarkan outlet/kategori/ketersediaan/pencarian.

- **Pemesanan**
  - Pesanan siswa diikat ke outlet tertentu dan memuat beberapa item menu.
  - Validasi stok, ketersediaan menu, dan konsistensi outlet.
  - Update status pesanan (`pending`, `preparing`, `ready`, `completed`, `cancelled`).

- **Pembayaran**
  - Mendukung metode `cash`, `card`, `transfer`, `qris`.
  - Validasi nominal, perhitungan kembalian, pencatatan referensi pembayaran.

- **Statistik**
  - Ringkasan jumlah outlet dan metrik per outlet (total/tersedia menu, total/today order).

## Struktur Data

- `CafeteriaOutlet` (`cafeteria_outlets`)
  - `instansiId`, `name`, `location`, `contactPerson`, `openingHours`, `isActive`, dsb.

- `CafeteriaMenu` (`cafeteria_menus`)
  - Menyimpan `canteenId` (outlet) + detail menu/stok.

- `CafeteriaOrder` (`cafeteria_orders`)
  - Menyimpan `canteenId`, relasi siswa, total, status.

- `CafeteriaOrderItem` dan `CafeteriaPayment`
  - Item pesanan dan catatan pembayaran.

## Endpoint Ringkas

- `POST /cafeteria/canteens` – tambah outlet.
- `GET /cafeteria/canteens` – daftar outlet tenant.
- `PATCH/DELETE /cafeteria/canteens/:id` – ubah/hapus outlet.
- `POST /cafeteria/menu` – tambah menu (wajib `canteenId`).
- `GET /cafeteria/menu` – filter `canteenId`, `category`, `isAvailable`, `search`.
- `POST /cafeteria/orders` – buat pesanan (wajib `canteenId`, `studentId`, daftar menu).
- `GET /cafeteria/orders` – filter `canteenId`, `studentId`, `status`, `paymentStatus`, `date`.
- `POST /cafeteria/orders/:id/payment` – proses pembayaran.
- `GET /cafeteria/statistics` – ringkasan per outlet.

Seluruh endpoint diproteksi `JwtAuthGuard` + `TenantGuard`.

## Migrasi Database

File: `src/migrations/1740000000000-AddCafeteriaOutlets.ts`

Perintah (contoh):

```bash
npm run typeorm migration:run -- -d dist/migration-data-source.js
```

Migrasi ini membuat tabel `cafeteria_outlets` dan menambahkan kolom `canteen_id` pada `cafeteria_menus` dan `cafeteria_orders`. Kolom baru dibuat nullable agar data lama tetap aman; aplikasi mewajibkan `canteenId` untuk data baru.


