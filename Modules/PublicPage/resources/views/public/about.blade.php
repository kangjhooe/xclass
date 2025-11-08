@extends('publicpage::layouts.master')

@section('title', 'Tentang Kami')
@section('meta_description', 'Tentang ' . (tenant('name') ?? 'Sistem Informasi') . ' - Profil lengkap dan informasi institusi')

@section('content')
<div class="row">
    <div class="col-12">
        <!-- Hero Section -->
        <div class="card border-0 shadow-sm mb-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="card-body text-white p-5">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h1 class="display-4 fw-bold mb-3">Tentang {{ tenant('name') ?? 'Kami' }}</h1>
                        <p class="lead mb-4">
                            {{ tenant('description') ?? 'Kami berkomitmen untuk memberikan layanan terbaik dan informasi terkini kepada masyarakat.' }}
                        </p>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <i class="fas fa-info-circle" style="font-size: 8rem; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- About Content -->
        <div class="row">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body">
                        <h2 class="h3 mb-4">
                            <i class="fas fa-building text-primary me-2"></i>
                            Profil Institusi
                        </h2>
                        
                        <div class="content">
                            <p class="lead">
                                {{ tenant('name') ?? 'Sistem Informasi' }} adalah institusi yang berdedikasi untuk memberikan 
                                layanan terbaik dan informasi terkini kepada masyarakat.
                            </p>
                            
                            <p>
                                Kami berkomitmen untuk terus berkembang dan berinovasi dalam memberikan 
                                layanan yang berkualitas tinggi. Dengan tim yang profesional dan berpengalaman, 
                                kami siap melayani kebutuhan Anda dengan sebaik-baiknya.
                            </p>
                            
                            <h4 class="mt-4 mb-3">Visi</h4>
                            <p>
                                Menjadi institusi terdepan dalam memberikan layanan informasi dan 
                                pelayanan publik yang berkualitas tinggi.
                            </p>
                            
                            <h4 class="mt-4 mb-3">Misi</h4>
                            <ul>
                                <li>Menyediakan layanan informasi yang akurat dan terkini</li>
                                <li>Memberikan pelayanan publik yang profesional dan responsif</li>
                                <li>Mengembangkan sistem informasi yang efisien dan user-friendly</li>
                                <li>Membangun kemitraan yang kuat dengan berbagai pihak</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Team Section -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body">
                        <h2 class="h3 mb-4">
                            <i class="fas fa-users text-primary me-2"></i>
                            Tim Kami
                        </h2>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style="width: 60px; height: 60px;">
                                        <i class="fas fa-user text-white fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-1">Tim Manajemen</h5>
                                        <p class="text-muted mb-0">Pimpinan dan manajemen institusi</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style="width: 60px; height: 60px;">
                                        <i class="fas fa-chalkboard-teacher text-white fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-1">Tim Akademik</h5>
                                        <p class="text-muted mb-0">Guru dan tenaga pendidik</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-info rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style="width: 60px; height: 60px;">
                                        <i class="fas fa-cogs text-white fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-1">Tim Teknis</h5>
                                        <p class="text-muted mb-0">Teknisi dan support system</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style="width: 60px; height: 60px;">
                                        <i class="fas fa-headset text-white fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 class="mb-1">Tim Layanan</h5>
                                        <p class="text-muted mb-0">Customer service dan support</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <!-- Contact Info -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-phone me-2"></i>
                            Informasi Kontak
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6 class="text-muted">Alamat</h6>
                            <p class="mb-0">
                                <i class="fas fa-map-marker-alt text-primary me-2"></i>
                                {{ tenant('address') ?? 'Jl. Contoh No. 123, Kota, Provinsi 12345' }}
                            </p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-muted">Telepon</h6>
                            <p class="mb-0">
                                <i class="fas fa-phone text-primary me-2"></i>
                                {{ tenant('phone') ?? '+62 123 456 7890' }}
                            </p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-muted">Email</h6>
                            <p class="mb-0">
                                <i class="fas fa-envelope text-primary me-2"></i>
                                {{ tenant('email') ?? 'info@example.com' }}
                            </p>
                        </div>
                        
                        <div class="mb-3">
                            <h6 class="text-muted">Website</h6>
                            <p class="mb-0">
                                <i class="fas fa-globe text-primary me-2"></i>
                                {{ tenant('website') ?? 'www.example.com' }}
                            </p>
                        </div>
                        
                        <div class="d-grid">
                            <a href="{{ tenant_route('tenant.public.contact') }}" class="btn btn-primary">
                                <i class="fas fa-envelope me-1"></i>
                                Hubungi Kami
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar me-2"></i>
                            Statistik
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-6 mb-3">
                                <div class="text-primary">
                                    <i class="fas fa-users fa-2x"></i>
                                </div>
                                <div class="fw-bold fs-4">500+</div>
                                <small class="text-muted">Siswa Aktif</small>
                            </div>
                            <div class="col-6 mb-3">
                                <div class="text-success">
                                    <i class="fas fa-chalkboard-teacher fa-2x"></i>
                                </div>
                                <div class="fw-bold fs-4">50+</div>
                                <small class="text-muted">Guru & Staff</small>
                            </div>
                            <div class="col-6">
                                <div class="text-info">
                                    <i class="fas fa-calendar fa-2x"></i>
                                </div>
                                <div class="fw-bold fs-4">10+</div>
                                <small class="text-muted">Tahun Berpengalaman</small>
                            </div>
                            <div class="col-6">
                                <div class="text-warning">
                                    <i class="fas fa-graduation-cap fa-2x"></i>
                                </div>
                                <div class="fw-bold fs-4">1000+</div>
                                <small class="text-muted">Alumni</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-link me-2"></i>
                            Tautan Cepat
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            <a href="{{ tenant_route('tenant.public.news.index') }}" class="list-group-item list-group-item-action border-0 px-0">
                                <i class="fas fa-newspaper me-2 text-primary"></i>
                                Berita & Informasi
                            </a>
                            <a href="{{ tenant_route('tenant.public.gallery.index') }}" class="list-group-item list-group-item-action border-0 px-0">
                                <i class="fas fa-images me-2 text-primary"></i>
                                Galeri Foto
                            </a>
                            <a href="{{ tenant_route('tenant.public.contact') }}" class="list-group-item list-group-item-action border-0 px-0">
                                <i class="fas fa-envelope me-2 text-primary"></i>
                                Hubungi Kami
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection