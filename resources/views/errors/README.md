# Error Pages

Direktori ini berisi semua halaman error untuk aplikasi CLASS.

## Struktur File

```
errors/
├── layout.blade.php          # Layout utama untuk semua error pages
├── 401.blade.php            # Unauthorized
├── 403.blade.php            # Forbidden  
├── 404.blade.php            # Not Found
├── 404-search.blade.php     # Search Not Found
├── 419.blade.php            # CSRF Token Mismatch
├── 429.blade.php            # Too Many Requests
├── 500.blade.php            # Internal Server Error
├── 502.blade.php            # Bad Gateway
├── 503.blade.php            # Service Unavailable
├── 503-maintenance.blade.php # Maintenance Mode
└── error.blade.php          # Default Error Page
```

## Penggunaan

Semua error pages menggunakan layout `errors.layout` yang menyediakan:

- Desain responsif dengan Bootstrap 5
- Font Awesome icons
- Gradient background
- Floating animations
- Konsistensi dengan tema aplikasi

## Kustomisasi

### Mengubah Tampilan
Edit file view yang sesuai dengan kebutuhan. Pastikan untuk:
- Menggunakan `@extends('errors.layout')`
- Mengatur `@section('title')` dengan judul yang sesuai
- Mengisi `@section('content')` dengan konten error page

### Menambah Error Page Baru
1. Buat file view baru di direktori ini
2. Ikuti struktur yang sama dengan file yang ada
3. Update konfigurasi di `config/error-pages.php`
4. Update `app/Exceptions/Handler.php` jika diperlukan

## Testing

Gunakan routes testing di development mode:
- `/test-errors/404` - Test 404 page
- `/test-errors/500` - Test 500 page
- `/test-errors/search-404` - Test search 404 page

## Dependencies

- Bootstrap 5.3.0
- Font Awesome 6.0.0
- Laravel Blade Templates
