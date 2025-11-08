<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ tenant('name') ?? 'Sekolah' }} - Beranda</title>
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
                        <a class="nav-link" href="{{ tenant_route('tenant.public.gallery.index') }}">Galeri</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-light py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold text-primary">Selamat Datang di {{ tenant('name') ?? 'Sekolah Kami' }}</h1>
                    <p class="lead">Membangun generasi yang cerdas, berkarakter, dan berprestasi untuk masa depan yang lebih baik.</p>
                    <div class="mt-4">
                        <a href="{{ tenant_route('tenant.public.news.index') }}" class="btn btn-primary btn-lg me-3">
                            <i class="fas fa-newspaper me-2"></i>Lihat Berita
                        </a>
                        <a href="{{ tenant_route('tenant.public.about') }}" class="btn btn-outline-primary btn-lg">
                            <i class="fas fa-info-circle me-2"></i>Tentang Kami
                        </a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="text-center">
                        <i class="fas fa-graduation-cap text-primary" style="font-size: 8rem;"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-5">
        <div class="container">
            <div class="row text-center">
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <i class="fas fa-users fa-3x text-success mb-3"></i>
                            <h3 class="fw-bold">{{ $studentCount ?? 0 }}</h3>
                            <p class="text-muted mb-0">Siswa Aktif</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <i class="fas fa-chalkboard-teacher fa-3x text-info mb-3"></i>
                            <h3 class="fw-bold">{{ $teacherCount ?? 0 }}</h3>
                            <p class="text-muted mb-0">Guru & Staff</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <i class="fas fa-calendar-alt fa-3x text-warning mb-3"></i>
                            <h3 class="fw-bold">{{ $yearCount ?? 0 }}</h3>
                            <p class="text-muted mb-0">Tahun Pengalaman</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <i class="fas fa-newspaper fa-3x text-primary mb-3"></i>
                            <h3 class="fw-bold">{{ $newsCount ?? 0 }}</h3>
                            <p class="text-muted mb-0">Berita Terbaru</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- News Section -->
    @if(isset($latestNews) && $latestNews->count() > 0)
    <section class="py-5 bg-light">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h2 class="text-center mb-5">Berita Terbaru</h2>
                </div>
            </div>
            <div class="row">
                @foreach($latestNews->take(3) as $news)
                <div class="col-md-4 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        @if($news->featured_image)
                        <img src="{{ $news->featured_image_url }}" class="card-img-top" alt="{{ $news->title }}" style="height: 200px; object-fit: cover;">
                        @endif
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ $news->title }}</h5>
                            <p class="card-text text-muted flex-grow-1">{{ $news->excerpt }}</p>
                            <div class="mt-auto">
                                <a href="{{ tenant_route('tenant.public.news.show', $news->slug) }}" class="btn btn-primary">
                                    <i class="fas fa-eye me-1"></i>Baca Selengkapnya
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
            <div class="row mt-4">
                <div class="col-12 text-center">
                    <a href="{{ tenant_route('tenant.public.news.index') }}" class="btn btn-outline-primary">
                        <i class="fas fa-list me-2"></i>Lihat Semua Berita
                    </a>
                </div>
            </div>
        </div>
    </section>
    @endif

    <!-- Quick Links Section -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h2 class="text-center mb-5">Akses Cepat</h2>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-newspaper fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Berita</h5>
                            <p class="card-text text-muted">Informasi terbaru dari sekolah</p>
                            <a href="{{ tenant_route('tenant.public.news.index') }}" class="btn btn-primary">Lihat Berita</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-images fa-3x text-success mb-3"></i>
                            <h5 class="card-title">Galeri</h5>
                            <p class="card-text text-muted">Foto-foto kegiatan sekolah</p>
                            <a href="{{ tenant_route('tenant.public.gallery.index') }}" class="btn btn-success">Lihat Galeri</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-info-circle fa-3x text-info mb-3"></i>
                            <h5 class="card-title">Tentang</h5>
                            <p class="card-text text-muted">Profil dan sejarah sekolah</p>
                            <a href="{{ tenant_route('tenant.public.about') }}" class="btn btn-info">Tentang Kami</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card border-0 shadow-sm h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-envelope fa-3x text-warning mb-3"></i>
                            <h5 class="card-title">Kontak</h5>
                            <p class="card-text text-muted">Hubungi kami</p>
                            <a href="{{ tenant_route('tenant.public.contact') }}" class="btn btn-warning">Hubungi</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4">
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