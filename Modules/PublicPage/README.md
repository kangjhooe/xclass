# Modul Halaman Publik

Modul ini menyediakan fitur halaman publik yang lengkap untuk sistem informasi, termasuk manajemen berita, menu sidebar, dan halaman-halaman publik lainnya.

## Fitur Utama

### 1. Manajemen Berita
- **CRUD Berita**: Buat, baca, update, dan hapus berita
- **Status Publikasi**: Draft dan Published
- **Berita Unggulan**: Fitur untuk menandai berita penting
- **Gambar Unggulan**: Upload dan kelola gambar untuk berita
- **SEO Friendly**: Meta title, description, dan keywords
- **View Counter**: Hitung jumlah pembaca berita
- **Reading Time**: Estimasi waktu baca otomatis
- **Pencarian**: Fitur pencarian berita
- **Pagination**: Halaman berita dengan pagination

### 2. Manajemen Menu Sidebar
- **Menu Hierarki**: Menu utama dan submenu
- **Icon Support**: Menggunakan Font Awesome
- **URL Management**: URL relatif dan eksternal
- **Order Management**: Urutan menu yang dapat diatur
- **Status Toggle**: Aktif/nonaktif menu
- **Target Control**: Buka di tab yang sama atau tab baru

### 3. Halaman Publik
- **Beranda**: Halaman utama dengan statistik dan berita terbaru
- **Berita**: Daftar dan detail berita
- **Tentang**: Halaman profil institusi
- **Kontak**: Form kontak dan informasi kontak
- **Galeri**: Galeri foto dengan lightbox

### 4. Layout dan Desain
- **Responsive Design**: Mobile-friendly
- **Modern UI**: Menggunakan Bootstrap 5
- **Sidebar Navigation**: Menu sidebar yang dapat dikustomisasi
- **Search Box**: Pencarian di sidebar
- **Breadcrumb**: Navigasi breadcrumb
- **Loading States**: Indikator loading untuk UX yang baik

## Instalasi

1. **Jalankan Migration**
```bash
php artisan migrate
```

2. **Jalankan Seeder**
```bash
php artisan db:seed --class=Modules\\PublicPage\\Database\\Seeders\\PublicPageSeeder
```

3. **Publish Assets** (jika diperlukan)
```bash
php artisan vendor:publish --tag=publicpage-assets
```

## Struktur File

```
Modules/PublicPage/
├── app/
│   └── Http/Controllers/
│       ├── NewsController.php
│       ├── MenuController.php
│       └── PublicPageController.php
├── Models/
│   ├── News.php
│   └── Menu.php
├── database/
│   ├── migrations/
│   │   ├── create_news_table.php
│   │   └── create_menus_table.php
│   └── seeders/
│       └── PublicPageSeeder.php
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── master.blade.php
│       ├── public/
│       │   ├── home.blade.php
│       │   ├── news/
│       │   │   ├── index.blade.php
│       │   │   └── show.blade.php
│       │   ├── about.blade.php
│       │   ├── contact.blade.php
│       │   └── gallery/
│       │       └── index.blade.php
│       └── admin/
│           ├── news/
│           │   ├── index.blade.php
│           │   ├── create.blade.php
│           │   └── edit.blade.php
│           └── menu/
│               ├── index.blade.php
│               ├── create.blade.php
│               └── edit.blade.php
└── routes/
    └── web.php
```

## Penggunaan

### Menambah Berita Baru
1. Akses halaman admin: `/admin/news`
2. Klik "Tambah Berita"
3. Isi form dengan informasi berita
4. Upload gambar unggulan (opsional)
5. Set status publikasi
6. Simpan berita

### Mengelola Menu
1. Akses halaman admin: `/admin/menu`
2. Klik "Tambah Menu" untuk menu baru
3. Atur nama, URL, icon, dan parent menu
4. Set urutan dan status menu
5. Simpan menu

### Mengakses Halaman Publik
- **Beranda**: `/public/`
- **Berita**: `/public/berita`
- **Tentang**: `/public/tentang`
- **Kontak**: `/public/kontak`
- **Galeri**: `/public/galeri`

## Kustomisasi

### Mengubah Tema
Edit file `resources/views/layouts/master.blade.php` untuk mengubah:
- Warna tema
- Font
- Layout
- Komponen UI

### Menambah Halaman Baru
1. Buat method di `PublicPageController`
2. Tambah route di `routes/web.php`
3. Buat view di `resources/views/public/`
4. Tambah menu di admin panel

### Mengintegrasikan dengan Modul Lain
- Gunakan `tenant('id')` untuk mendapatkan ID tenant
- Akses data dari modul lain menggunakan model yang sesuai
- Update statistik di halaman beranda

## API Endpoints

### Berita
- `GET /public/berita` - Daftar berita
- `GET /public/berita/{slug}` - Detail berita
- `POST /admin/news` - Buat berita baru
- `PUT /admin/news/{id}` - Update berita
- `DELETE /admin/news/{id}` - Hapus berita

### Menu
- `GET /admin/menu` - Daftar menu
- `POST /admin/menu` - Buat menu baru
- `PUT /admin/menu/{id}` - Update menu
- `DELETE /admin/menu/{id}` - Hapus menu
- `POST /admin/menu/{id}/toggle-status` - Toggle status menu

## Troubleshooting

### Masalah Umum

1. **Menu tidak muncul di sidebar**
   - Pastikan menu memiliki status aktif
   - Periksa urutan menu
   - Pastikan parent menu juga aktif

2. **Gambar berita tidak muncul**
   - Pastikan file gambar di-upload ke storage
   - Periksa konfigurasi storage link
   - Pastikan path gambar benar

3. **Route tidak ditemukan**
   - Pastikan route sudah didaftar
   - Periksa namespace controller
   - Pastikan middleware sudah benar

### Debug Mode
Aktifkan debug mode di `.env`:
```
APP_DEBUG=true
LOG_LEVEL=debug
```

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## Lisensi

Modul ini menggunakan lisensi yang sama dengan proyek utama.

## Support

Untuk bantuan dan pertanyaan, silakan hubungi tim pengembang atau buat issue di repository.
