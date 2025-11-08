<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ tenant('name') ?? 'Sekolah' }} - Galeri</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="{{ tenant_route('tenant.public.home') }}">
                <i class="fas fa-school me-2"></i>
                {{ tenant('name') ?? 'Sekolah' }}
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('tenant.public.home') }}">Beranda</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('tenant.public.news.index') }}">Berita</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('tenant.public.about') }}">Tentang</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('tenant.public.contact') }}">Kontak</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="{{ tenant_route('tenant.public.gallery.index') }}">Galeri</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container my-5">
        <div class="row">
            <div class="col-12">
                <h1 class="mb-4">Galeri Foto</h1>
                
                <!-- Filter Buttons -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-primary active">Semua</button>
                            <button type="button" class="btn btn-outline-primary">Kegiatan</button>
                            <button type="button" class="btn btn-outline-primary">Acara</button>
                            <button type="button" class="btn btn-outline-primary">Fasilitas</button>
                        </div>
                    </div>
                </div>

                <!-- Gallery Grid -->
                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info text-center">
                            <i class="fas fa-images me-2"></i>
                            Galeri foto akan segera hadir. Silakan kembali lagi nanti.
                        </div>
                    </div>
                </div>

                <!-- Sample Gallery Items (commented out for now) -->
                <!--
                <div class="row">
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card border-0 shadow-sm">
                            <img src="https://via.placeholder.com/400x300" class="card-img-top" alt="Gallery Image">
                            <div class="card-body">
                                <h5 class="card-title">Kegiatan Sekolah</h5>
                                <p class="card-text text-muted">Deskripsi kegiatan sekolah</p>
                            </div>
                        </div>
                    </div>
                </div>
                -->
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>{{ tenant('name') ?? 'Sekolah' }}</h5>
                    <p class="mb-0">Membangun generasi yang cerdas dan berkarakter.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">&copy; {{ date('Y') }} {{ tenant('name') ?? 'Sekolah' }}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
