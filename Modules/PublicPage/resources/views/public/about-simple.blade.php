<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ tenant('name') ?? 'Sekolah' }} - Tentang Kami</title>
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
                        <a class="nav-link active" href="{{ tenant_route('tenant.public.about') }}">Tentang</a>
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

    <!-- Main Content -->
    <div class="container my-5">
        <div class="row">
            <div class="col-12">
                <h1 class="mb-4">Tentang {{ tenant('name') ?? 'Sekolah Kami' }}</h1>
                
                <div class="row">
                    <div class="col-lg-8">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h3 class="card-title">Visi</h3>
                                <p class="card-text">Menjadi lembaga pendidikan yang unggul dalam membentuk generasi yang cerdas, berkarakter, dan berprestasi.</p>
                                
                                <h3 class="card-title mt-4">Misi</h3>
                                <ul>
                                    <li>Menyelenggarakan pendidikan berkualitas tinggi</li>
                                    <li>Mengembangkan karakter dan moral siswa</li>
                                    <li>Mendorong kreativitas dan inovasi</li>
                                    <li>Membangun kemitraan dengan masyarakat</li>
                                </ul>
                                
                                <h3 class="card-title mt-4">Sejarah</h3>
                                <p class="card-text">{{ tenant('name') ?? 'Sekolah kami' }} didirikan dengan tujuan untuk memberikan pendidikan terbaik bagi generasi muda. Sejak berdiri, kami telah berkomitmen untuk memberikan layanan pendidikan yang berkualitas dan mengembangkan potensi setiap siswa.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Informasi Sekolah</h5>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-map-marker-alt text-primary me-2"></i>Alamat: Jl. Pendidikan No. 123</li>
                                    <li><i class="fas fa-phone text-primary me-2"></i>Telepon: (021) 12345678</li>
                                    <li><i class="fas fa-envelope text-primary me-2"></i>Email: info@sekolah.com</li>
                                    <li><i class="fas fa-globe text-primary me-2"></i>Website: www.sekolah.com</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="card border-0 shadow-sm mt-3">
                            <div class="card-body">
                                <h5 class="card-title">Prestasi</h5>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-trophy text-warning me-2"></i>Sekolah Terbaik 2023</li>
                                    <li><i class="fas fa-medal text-warning me-2"></i>Akreditasi A</li>
                                    <li><i class="fas fa-star text-warning me-2"></i>ISO 9001:2015</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
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
