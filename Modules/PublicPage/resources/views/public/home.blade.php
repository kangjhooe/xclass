@extends('publicpage::layouts.master')

@section('title', 'Beranda')
@section('meta_description', 'Halaman beranda ' . (tenant('name') ?? 'Sistem Informasi') . ' - Informasi terkini dan layanan terbaik')

@push('styles')
<style>
    /* Keyframe Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    @keyframes gradientShift {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }
    
    /* Hero Section - Enhanced dengan Gradasi Animasi */
    .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
        position: relative;
        animation: gradientShift 15s ease infinite, fadeInDown 1s ease-out;
    }
    
    .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        z-index: 1;
    }
    
    .hero-content {
        position: relative;
        z-index: 2;
        animation: fadeInUp 1s ease-out 0.3s both;
    }
    
    .hero-content h1 {
        color: #ffffff !important;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
        animation: fadeInDown 1s ease-out 0.5s both;
    }
    
    .hero-content p {
        color: #f0f0f0 !important;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
        animation: fadeInUp 1s ease-out 0.7s both;
    }
    
    .hero-section .btn {
        animation: fadeInUp 1s ease-out 0.9s both, pulse 2s ease-in-out infinite 2s;
        transition: all 0.3s ease;
    }
    
    .hero-section .btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
    }
    
    /* Stats Cards - Enhanced dengan Gradasi */
    .stats-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-radius: 15px;
        border: 2px solid transparent;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        animation: fadeInUp 0.8s ease-out both;
        position: relative;
        overflow: hidden;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s;
    }
    
    .stats-card:hover::before {
        left: 100%;
    }
    
    .stats-card:nth-child(1) { animation-delay: 0.1s; }
    .stats-card:nth-child(2) { animation-delay: 0.2s; }
    .stats-card:nth-child(3) { animation-delay: 0.3s; }
    .stats-card:nth-child(4) { animation-delay: 0.4s; }
    
    .stats-card:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 15px 35px rgba(0, 123, 255, 0.3);
        border-color: #007bff;
        background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
    }
    
    .stats-card .card-body {
        padding: 2rem 1.5rem;
        position: relative;
        z-index: 1;
    }
    
    .stats-card h3 {
        color: #212529 !important;
        font-weight: 700;
        transition: all 0.3s ease;
    }
    
    .stats-card:hover h3 {
        color: #007bff !important;
        transform: scale(1.1);
    }
    
    .stats-card p {
        color: #6c757d !important;
        font-weight: 500;
    }
    
    .stats-icon {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        animation: float 3s ease-in-out infinite;
    }
    
    .stats-card:hover .stats-icon {
        transform: scale(1.2) rotate(5deg);
        animation: pulse 1s ease-in-out infinite;
    }
    
    /* News Cards - Enhanced dengan Gradasi */
    .news-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 2px solid transparent;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        animation: fadeInUp 0.8s ease-out both;
        position: relative;
        overflow: hidden;
    }
    
    .news-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe);
        background-size: 200% 100%;
        animation: shimmer 3s linear infinite;
        transform: scaleX(0);
        transition: transform 0.4s ease;
    }
    
    .news-card:hover::after {
        transform: scaleX(1);
    }
    
    .news-card:nth-child(1) { animation-delay: 0.1s; }
    .news-card:nth-child(2) { animation-delay: 0.2s; }
    .news-card:nth-child(3) { animation-delay: 0.3s; }
    .news-card:nth-child(4) { animation-delay: 0.4s; }
    .news-card:nth-child(5) { animation-delay: 0.5s; }
    .news-card:nth-child(6) { animation-delay: 0.6s; }
    
    .news-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 15px 40px rgba(0, 123, 255, 0.25);
        border-color: #007bff;
        background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
    }
    
    .news-card .card-img-top {
        transition: all 0.4s ease;
    }
    
    .news-card:hover .card-img-top {
        transform: scale(1.1);
    }
    
    .news-card .card-title {
        color: #212529 !important;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .news-card:hover .card-title {
        color: #007bff !important;
    }
    
    .news-card .card-text {
        color: #495057 !important;
    }
    
    /* Quick Link Cards - Enhanced dengan Gradasi Berbeda */
    .quick-link-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-radius: 15px;
        border: 2px solid transparent;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.6s ease-out both;
        position: relative;
        overflow: hidden;
    }
    
    .quick-link-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(0, 123, 255, 0.1) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    .quick-link-card:hover::before {
        opacity: 1;
    }
    
    .quick-link-card:nth-child(1) { 
        animation-delay: 0.1s;
        border-top: 4px solid;
        border-image: linear-gradient(90deg, #007bff, #0056b3) 1;
    }
    .quick-link-card:nth-child(2) { 
        animation-delay: 0.2s;
        border-top: 4px solid;
        border-image: linear-gradient(90deg, #28a745, #1e7e34) 1;
    }
    .quick-link-card:nth-child(3) { 
        animation-delay: 0.3s;
        border-top: 4px solid;
        border-image: linear-gradient(90deg, #17a2b8, #117a8b) 1;
    }
    .quick-link-card:nth-child(4) { 
        animation-delay: 0.4s;
        border-top: 4px solid;
        border-image: linear-gradient(90deg, #ffc107, #e0a800) 1;
    }
    .quick-link-card:nth-child(5) { 
        animation-delay: 0.5s;
        border-top: 4px solid;
        border-image: linear-gradient(90deg, #28a745, #1e7e34) 1;
    }
    
    .quick-link-card:hover {
        transform: translateY(-8px) rotate(1deg) scale(1.03);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        border-color: #007bff;
        background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
    }
    
    .quick-link-card .card-body {
        position: relative;
        z-index: 1;
    }
    
    .quick-link-card .card-title {
        color: #212529 !important;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .quick-link-card:hover .card-title {
        color: #007bff !important;
        transform: translateX(5px);
    }
    
    .quick-link-card .card-text {
        color: #6c757d !important;
    }
    
    .quick-link-card i {
        transition: all 0.4s ease;
    }
    
    .quick-link-card:hover i {
        transform: scale(1.2) rotate(10deg);
    }
    
    /* Section Title - Enhanced */
    .section-title {
        color: #212529 !important;
        font-weight: 700;
        position: relative;
        padding-bottom: 15px;
        margin-bottom: 30px;
        animation: fadeInLeft 0.8s ease-out;
    }
    
    .section-title::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe);
        background-size: 200% 100%;
        border-radius: 2px;
        animation: slideIn 1s ease-out 0.5s forwards, shimmer 3s linear infinite;
    }
    
    .section-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
    }
    
    /* Contact Section - Enhanced */
    .contact-section {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 2px solid transparent;
        border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        animation: fadeInUp 1s ease-out;
        transition: all 0.3s ease;
    }
    
    .contact-section:hover {
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.2);
        transform: translateY(-5px);
    }
    
    .contact-section h3 {
        color: #212529 !important;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .contact-section p {
        color: #495057 !important;
    }
    
    .contact-section strong {
        color: #212529 !important;
    }
    
    .contact-section .text-muted {
        color: #6c757d !important;
    }
    
    .contact-section .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;
        animation: pulse 2s ease-in-out infinite;
    }
    
    .contact-section .btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
    
    /* Button Improvements - Enhanced */
    .btn-light {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 2px solid #ffffff;
        color: #007bff;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .btn-light:hover {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        border-color: #007bff;
        color: #ffffff;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
    }
    
    .btn-outline-light {
        transition: all 0.3s ease;
    }
    
    .btn-outline-light:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
    }
    
    /* Animasi Scroll */
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
    }
    
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Badge Animasi */
    .badge {
        transition: all 0.3s ease;
        animation: scaleIn 0.5s ease-out;
    }
    
    .badge:hover {
        transform: scale(1.1);
    }
    
    @media (max-width: 768px) {
        .hero-section .display-4 {
            font-size: 2rem;
        }
        
        .hero-section .lead {
            font-size: 1rem;
        }
        
        .stats-card .card-body {
            padding: 1.5rem 1rem;
        }
        
        .hero-section {
            animation-duration: 10s;
        }
    }
</style>
@endpush

@section('content')
<!-- Hero Section -->
<div class="row mb-5">
    <div class="col-12">
        <div class="hero-section">
            <div class="row g-0">
                <div class="col-lg-8">
                    <div class="card-body text-white p-5 hero-content">
                        <h1 class="display-4 fw-bold mb-3">
                            Selamat Datang di {{ tenant('name') ?? 'Sistem Informasi' }}
                        </h1>
                        <p class="lead mb-4" style="font-size: 1.2rem;">
                            {{ tenant('description') ?? 'Sistem informasi terintegrasi untuk memberikan layanan terbaik dan informasi terkini kepada masyarakat.' }}
                        </p>
                        <div class="d-flex flex-wrap gap-3">
                            <a href="{{ tenant_route('public.news.index') }}" class="btn btn-light btn-lg">
                                <i class="fas fa-newspaper me-2"></i>
                                Lihat Berita
                            </a>
                            <a href="{{ tenant_route('public.about') }}" class="btn btn-outline-light btn-lg" style="border-color: #ffffff; color: #ffffff;">
                                <i class="fas fa-info-circle me-2"></i>
                                Tentang Kami
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 d-none d-lg-block">
                    <div class="h-100 d-flex align-items-center justify-content-center hero-content">
                        <i class="fas fa-graduation-cap" style="font-size: 8rem; opacity: 0.3; color: #ffffff;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Stats Section -->
<div class="row mb-5">
    <div class="col-12">
        <div class="row g-4">
            <div class="col-md-3 col-sm-6">
                <div class="card stats-card text-center h-100">
                    <div class="card-body">
                        <div class="text-primary mb-3">
                            <i class="fas fa-newspaper fa-3x stats-icon"></i>
                        </div>
                        <h3 class="fw-bold mb-2" data-count="{{ $newsCount ?? 0 }}">{{ $newsCount ?? 0 }}</h3>
                        <p class="mb-0">Berita Terbaru</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stats-card text-center h-100">
                    <div class="card-body">
                        <div class="text-success mb-3">
                            <i class="fas fa-users fa-3x stats-icon"></i>
                        </div>
                        <h3 class="fw-bold mb-2" data-count="{{ $studentCount ?? 0 }}">{{ $studentCount ?? 0 }}</h3>
                        <p class="mb-0">Siswa Aktif</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stats-card text-center h-100">
                    <div class="card-body">
                        <div class="text-info mb-3">
                            <i class="fas fa-chalkboard-teacher fa-3x stats-icon"></i>
                        </div>
                        <h3 class="fw-bold mb-2" data-count="{{ $teacherCount ?? 0 }}">{{ $teacherCount ?? 0 }}</h3>
                        <p class="mb-0">Guru & Staff</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="card stats-card text-center h-100">
                    <div class="card-body">
                        <div class="text-warning mb-3">
                            <i class="fas fa-calendar-alt fa-3x stats-icon"></i>
                        </div>
                        <h3 class="fw-bold mb-2" data-count="{{ $yearCount ?? 0 }}">{{ $yearCount ?? 0 }}</h3>
                        <p class="mb-0">Tahun Berpengalaman</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Featured News Section -->
@if($featuredNews->count() > 0)
<div class="row mb-5">
    <div class="col-12">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 class="h3 mb-3 mb-md-0 section-title">
                <i class="fas fa-star text-warning me-2"></i>
                Berita Unggulan
            </h2>
            <a href="{{ tenant_route('public.news.index') }}" class="btn btn-outline-primary">
                Lihat Semua <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
        
        <div class="row">
            @foreach($featuredNews->take(3) as $news)
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card news-card h-100">
                    @if($news->featured_image)
                        <img src="{{ asset('storage/' . $news->featured_image) }}" 
                             class="card-img-top" 
                             alt="{{ $news->title }}" 
                             style="height: 200px; object-fit: cover;">
                    @else
                        <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                             style="height: 200px;">
                            <i class="fas fa-image fa-3x text-muted"></i>
                        </div>
                    @endif
                    
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-warning text-dark">
                                <i class="fas fa-star me-1"></i>Unggulan
                            </span>
                        </div>
                        
                        <h5 class="card-title">{{ $news->title }}</h5>
                        
                        <div class="text-muted small mb-2">
                            <i class="fas fa-calendar me-1"></i>
                            {{ $news->formatted_published_date }}
                            <span class="ms-2">
                                <i class="fas fa-user me-1"></i>
                                {{ $news->author }}
                            </span>
                        </div>
                        
                        <p class="card-text text-muted flex-grow-1">{{ $news->excerpt }}</p>
                        
                        <div class="mt-auto">
                            @if(!empty($news->slug))
                            <a href="{{ tenant_route('public.news.show', $news->slug) }}" 
                               class="btn btn-primary">
                                <i class="fas fa-eye me-1"></i>
                                Baca Selengkapnya
                            </a>
                            @else
                            <span class="btn btn-secondary disabled">
                                <i class="fas fa-eye me-1"></i>
                                Tidak Tersedia
                            </span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endif

<!-- Latest News Section -->
@if($latestNews->count() > 0)
<div class="row mb-5">
    <div class="col-12">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 class="h3 mb-3 mb-md-0 section-title">
                <i class="fas fa-newspaper text-primary me-2"></i>
                Berita Terbaru
            </h2>
            <a href="{{ tenant_route('public.news.index') }}" class="btn btn-outline-primary">
                Lihat Semua <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
        
        <div class="row">
            @foreach($latestNews->take(6) as $news)
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card news-card h-100">
                    @if($news->featured_image)
                        <img src="{{ asset('storage/' . $news->featured_image) }}" 
                             class="card-img-top" 
                             alt="{{ $news->title }}" 
                             style="height: 200px; object-fit: cover;">
                    @else
                        <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                             style="height: 200px;">
                            <i class="fas fa-image fa-3x text-muted"></i>
                        </div>
                    @endif
                    
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">{{ $news->title }}</h5>
                        
                        <div class="text-muted small mb-2">
                            <i class="fas fa-calendar me-1"></i>
                            {{ $news->formatted_published_date }}
                            <span class="ms-2">
                                <i class="fas fa-user me-1"></i>
                                {{ $news->author }}
                            </span>
                        </div>
                        
                        <p class="card-text text-muted flex-grow-1">{{ $news->excerpt }}</p>
                        
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            @if(!empty($news->slug))
                            <a href="{{ tenant_route('public.news.show', $news->slug) }}" 
                               class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye me-1"></i>
                                Baca
                            </a>
                            @else
                            <span class="btn btn-outline-secondary btn-sm disabled">
                                <i class="fas fa-eye me-1"></i>
                                Tidak Tersedia
                            </span>
                            @endif
                            <small class="text-muted">
                                <i class="fas fa-eye me-1"></i>
                                {{ $news->view_count ?? 0 }} views
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endif

<!-- Quick Links Section -->
<div class="row mb-5">
    <div class="col-12">
        <h2 class="h3 mb-4 section-title">
            <i class="fas fa-link text-secondary me-2"></i>
            Tautan Cepat
        </h2>
        
        <div class="row g-4">
            <div class="col-lg-3 col-md-6">
                <div class="card quick-link-card text-center h-100">
                    <div class="card-body p-4">
                        <div class="text-primary mb-3">
                            <i class="fas fa-newspaper fa-3x"></i>
                        </div>
                        <h5 class="card-title mb-2">Berita & Informasi</h5>
                        <p class="card-text mb-3" style="font-size: 0.9rem;">Informasi terkini dan berita terbaru</p>
                        <a href="{{ tenant_route('public.news.index') }}" class="btn btn-primary btn-sm">
                            Lihat Berita
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6">
                <div class="card quick-link-card text-center h-100">
                    <div class="card-body p-4">
                        <div class="text-success mb-3">
                            <i class="fas fa-images fa-3x"></i>
                        </div>
                        <h5 class="card-title mb-2">Galeri Foto</h5>
                        <p class="card-text mb-3" style="font-size: 0.9rem;">Koleksi foto kegiatan dan acara</p>
                        <a href="{{ tenant_route('public.gallery.index') }}" class="btn btn-success btn-sm">
                            Lihat Galeri
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6">
                <div class="card quick-link-card text-center h-100">
                    <div class="card-body p-4">
                        <div class="text-info mb-3">
                            <i class="fas fa-info-circle fa-3x"></i>
                        </div>
                        <h5 class="card-title mb-2">Tentang Kami</h5>
                        <p class="card-text mb-3" style="font-size: 0.9rem;">Profil dan informasi lengkap</p>
                        <a href="{{ tenant_route('public.about') }}" class="btn btn-info btn-sm">
                            Pelajari Lebih
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6">
                <div class="card quick-link-card text-center h-100">
                    <div class="card-body p-4">
                        <div class="text-warning mb-3">
                            <i class="fas fa-envelope fa-3x"></i>
                        </div>
                        <h5 class="card-title mb-2">Kontak</h5>
                        <p class="card-text mb-3" style="font-size: 0.9rem;">Hubungi kami untuk informasi</p>
                        <a href="{{ tenant_route('public.contact') }}" class="btn btn-warning btn-sm">
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6">
                <div class="card quick-link-card text-center h-100" style="border: 2px solid #28a745;">
                    <div class="card-body p-4">
                        <div class="text-success mb-3">
                            <i class="fas fa-book-open fa-3x"></i>
                        </div>
                        <h5 class="card-title mb-2">Buku Tamu</h5>
                        <p class="card-text mb-3" style="font-size: 0.9rem;">Isi buku tamu untuk kunjungan Anda</p>
                        <a href="{{ tenant_route('public.guest-book.create') }}" class="btn btn-success btn-sm">
                            <i class="fas fa-pen me-1"></i>
                            Isi Buku Tamu
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Contact Info Section -->
<div class="row">
    <div class="col-12">
        <div class="card contact-section">
            <div class="card-body p-5">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h3 class="mb-3 fw-bold">Butuh Informasi Lebih Lanjut?</h3>
                        <p class="lead mb-4">
                            Tim kami siap membantu Anda dengan informasi yang Anda butuhkan. 
                            Jangan ragu untuk menghubungi kami.
                        </p>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-white rounded-circle p-3 border me-3">
                                        <i class="fas fa-phone text-primary fa-lg"></i>
                                    </div>
                                    <div>
                                        <strong class="d-block">Telepon</strong>
                                        <span>{{ tenant('phone') ?? '+62 123 456 7890' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-white rounded-circle p-3 border me-3">
                                        <i class="fas fa-envelope text-primary fa-lg"></i>
                                    </div>
                                    <div>
                                        <strong class="d-block">Email</strong>
                                        <span>{{ tenant('email') ?? 'info@example.com' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
                        <a href="{{ tenant_route('public.contact') }}" class="btn btn-primary btn-lg">
                            <i class="fas fa-envelope me-2"></i>
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Smooth scroll behavior dan animasi scroll
    document.addEventListener('DOMContentLoaded', function() {
        // Intersection Observer untuk animasi scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Tambahkan class animate-on-scroll ke elemen yang ingin dianimasikan
        const animateElements = document.querySelectorAll('.stats-card, .news-card, .quick-link-card, .section-title, .contact-section');
        animateElements.forEach((el, index) => {
            el.classList.add('animate-on-scroll');
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
        
        // Counter animation untuk stats
        const counters = document.querySelectorAll('.stats-card h3[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Start counter when element is visible
            const counterObserver = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            counterObserver.observe(counter);
        });
    });
</script>
@endpush