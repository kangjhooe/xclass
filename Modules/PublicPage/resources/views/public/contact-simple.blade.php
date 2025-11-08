<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ tenant('name') ?? 'Sekolah' }} - Kontak</title>
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
                        <a class="nav-link active" href="{{ tenant_route('tenant.public.contact') }}">Kontak</a>
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
                <h1 class="mb-4">Hubungi Kami</h1>
                
                <div class="row">
                    <div class="col-lg-8">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h3 class="card-title">Kirim Pesan</h3>
                                <form>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="name" class="form-label">Nama Lengkap</label>
                                            <input type="text" class="form-control" id="name" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="email" class="form-label">Email</label>
                                            <input type="email" class="form-control" id="email" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="subject" class="form-label">Subjek</label>
                                        <input type="text" class="form-control" id="subject" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="message" class="form-label">Pesan</label>
                                        <textarea class="form-control" id="message" rows="5" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-paper-plane me-2"></i>Kirim Pesan
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Informasi Kontak</h5>
                                <ul class="list-unstyled">
                                    <li class="mb-3">
                                        <i class="fas fa-map-marker-alt text-primary me-2"></i>
                                        <strong>Alamat:</strong><br>
                                        Jl. Pendidikan No. 123<br>
                                        Jakarta 12345
                                    </li>
                                    <li class="mb-3">
                                        <i class="fas fa-phone text-primary me-2"></i>
                                        <strong>Telepon:</strong><br>
                                        (021) 12345678
                                    </li>
                                    <li class="mb-3">
                                        <i class="fas fa-envelope text-primary me-2"></i>
                                        <strong>Email:</strong><br>
                                        info@sekolah.com
                                    </li>
                                    <li class="mb-3">
                                        <i class="fas fa-clock text-primary me-2"></i>
                                        <strong>Jam Operasional:</strong><br>
                                        Senin - Jumat: 07:00 - 16:00<br>
                                        Sabtu: 07:00 - 12:00
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="card border-0 shadow-sm mt-3">
                            <div class="card-body">
                                <h5 class="card-title">Sosial Media</h5>
                                <div class="d-flex gap-3">
                                    <a href="#" class="btn btn-outline-primary btn-sm">
                                        <i class="fab fa-facebook-f"></i>
                                    </a>
                                    <a href="#" class="btn btn-outline-info btn-sm">
                                        <i class="fab fa-twitter"></i>
                                    </a>
                                    <a href="#" class="btn btn-outline-danger btn-sm">
                                        <i class="fab fa-instagram"></i>
                                    </a>
                                    <a href="#" class="btn btn-outline-success btn-sm">
                                        <i class="fab fa-whatsapp"></i>
                                    </a>
                                </div>
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
