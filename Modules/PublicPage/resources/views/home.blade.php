@extends('publicpage::layouts.app')

@section('title', $profile->seo_title ?? $profile->institution_name)

@section('meta')
<meta name="description" content="{{ $profile->seo_description ?? $profile->description }}">
<meta name="keywords" content="{{ $profile->seo_keywords }}">
@endsection

@section('content')
<!-- Hero Section -->
<section class="hero-section" style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('{{ $profile->hero_image_url }}'); background-size: cover; background-position: center; min-height: 60vh; display: flex; align-items: center;">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <h1 class="text-white display-4 fw-bold mb-4">
                    {{ $profile->hero_title ?? $profile->institution_name }}
                </h1>
                <p class="text-white lead mb-4">
                    {{ $profile->hero_subtitle ?? $profile->description }}
                </p>
                <div class="hero-buttons">
                    <a href="{{ tenant_route('public.about') }}" class="btn btn-primary btn-lg me-3">Tentang Kami</a>
                    <a href="{{ tenant_route('public.contact') }}" class="btn btn-outline-light btn-lg">Hubungi Kami</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- About Section -->
@if($profile->about_title || $profile->about_content)
<section class="about-section py-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                @if($profile->about_image)
                <img src="{{ $profile->about_image_url }}" alt="{{ $profile->about_title }}" class="img-fluid rounded shadow">
                @endif
            </div>
            <div class="col-lg-6">
                <h2 class="h3 mb-4">{{ $profile->about_title ?? 'Tentang Kami' }}</h2>
                <div class="about-content">
                    {!! $profile->about_content !!}
                </div>
            </div>
        </div>
    </div>
</section>
@endif

<!-- News Section -->
@if($news->count() > 0)
<section class="news-section py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h2 class="text-center mb-5">Berita Terbaru</h2>
            </div>
        </div>
        <div class="row">
            @foreach($news as $item)
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                    @if($item->featured_image)
                    <img src="{{ $item->featured_image_url }}" class="card-img-top" alt="{{ $item->title }}" style="height: 200px; object-fit: cover;">
                    @endif
                    <div class="card-body">
                        <h5 class="card-title">{{ $item->title }}</h5>
                        <p class="card-text">{{ $item->excerpt }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">{{ $item->formatted_published_date }}</small>
                            <a href="{{ tenant_route('public.news.show', $item->slug) }}" class="btn btn-sm btn-outline-primary">Baca Selengkapnya</a>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        <div class="row">
            <div class="col-12 text-center">
                <a href="{{ tenant_route('public.news.index') }}" class="btn btn-primary">Lihat Semua Berita</a>
            </div>
        </div>
    </div>
</section>
@endif

<!-- Gallery Section -->
@if($galleries->count() > 0)
<section class="gallery-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h2 class="text-center mb-5">Galeri</h2>
            </div>
        </div>
        <div class="row">
            @foreach($galleries as $gallery)
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="gallery-item">
                    <img src="{{ $gallery->image_url }}" alt="{{ $gallery->title }}" class="img-fluid rounded shadow" style="height: 250px; width: 100%; object-fit: cover;">
                    <div class="gallery-overlay">
                        <h5 class="text-white">{{ $gallery->title }}</h5>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        <div class="row">
            <div class="col-12 text-center">
                <a href="{{ tenant_route('public.gallery.index') }}" class="btn btn-primary">Lihat Semua Galeri</a>
            </div>
        </div>
    </div>
</section>
@endif

<!-- Contact Section -->
<section class="contact-section py-5 bg-primary text-white">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
                <h2 class="h3 mb-4">Hubungi Kami</h2>
                <p class="lead">{{ $profile->contact_info['description'] ?? 'Silakan hubungi kami untuk informasi lebih lanjut.' }}</p>
                <div class="contact-info">
                    @if($profile->phone)
                    <p><i class="fas fa-phone me-2"></i> {{ $profile->phone }}</p>
                    @endif
                    @if($profile->email)
                    <p><i class="fas fa-envelope me-2"></i> {{ $profile->email }}</p>
                    @endif
                    @if($profile->address)
                    <p><i class="fas fa-map-marker-alt me-2"></i> {{ $profile->full_address }}</p>
                    @endif
                </div>
            </div>
            <div class="col-lg-4 text-center">
                <a href="{{ tenant_route('public.contact') }}" class="btn btn-light btn-lg">Kontak Kami</a>
            </div>
        </div>
    </div>
</section>
@endsection

@push('styles')
<style>
.hero-section {
    position: relative;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
}

.gallery-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    padding: 20px;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
    transform: translateY(0);
}

.about-content {
    line-height: 1.8;
}

.contact-info p {
    margin-bottom: 10px;
}
</style>
@endpush
