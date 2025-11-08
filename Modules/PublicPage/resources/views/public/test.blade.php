<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-12">
                <h1>Test Page - Halaman Publik</h1>
                <p>Halaman ini berfungsi dengan baik!</p>
                <p>Tenant: {{ tenant('name') ?? 'Tidak ada tenant' }}</p>
                <p>NPSN: {{ tenant('npsn') ?? 'Tidak ada NPSN' }}</p>
                
                <div class="mt-4">
                    <h3>Menu Navigasi:</h3>
                    <ul>
                        <li><a href="{{ tenant_route('tenant.public.home') }}">Beranda</a></li>
                        <li><a href="{{ tenant_route('tenant.public.news.index') }}">Berita</a></li>
                        <li><a href="{{ tenant_route('tenant.public.about') }}">Tentang</a></li>
                        <li><a href="{{ tenant_route('tenant.public.contact') }}">Kontak</a></li>
                        <li><a href="{{ tenant_route('tenant.public.gallery.index') }}">Galeri</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
