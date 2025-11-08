<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>@yield('title', config('app.name', 'Laravel'))</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    
    <!-- Custom CSS -->
    <style>
        body {
            font-family: 'Figtree', sans-serif;
        }
        .navbar-brand {
            font-weight: 600;
        }
        .hero-section {
            background-attachment: fixed;
        }
        .card {
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
    </style>
    
    @yield('meta')
    @stack('styles')
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="{{ route('tenant.public.home', ['tenant' => tenant('npsn')]) }}">
                @if(system_logo())
                    <img src="{{ system_logo() }}" alt="{{ system_name() }}" class="brand-logo me-2" style="height: 30px;">
                @elseif($profile->logo)
                    <img src="{{ $profile->logo_url }}" alt="{{ $profile->institution_name }}" height="30" class="me-2">
                @else
                    <i class="fas fa-graduation-cap me-2"></i>
                @endif
                {{ system_name() }}
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('tenant.public.home', ['tenant' => tenant('npsn')]) }}">Beranda</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('tenant.public.about', ['tenant' => tenant('npsn')]) }}">Tentang</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('tenant.public.news.index', ['tenant' => tenant('npsn')]) }}">Berita</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('tenant.public.gallery.index', ['tenant' => tenant('npsn')]) }}">Galeri</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('tenant.public.contact', ['tenant' => tenant('npsn')]) }}">Kontak</a>
                    </li>
                </ul>
                
                <ul class="navbar-nav">
                    @if($profile->phone)
                    <li class="nav-item">
                        <a class="nav-link" href="tel:{{ $profile->phone }}">
                            <i class="fas fa-phone me-1"></i> {{ $profile->phone }}
                        </a>
                    </li>
                    @endif
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main style="margin-top: 76px;">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="text-white py-5" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%); position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 50%, rgba(30, 64, 175, 0.1) 100%); pointer-events: none;"></div>
        <div class="container" style="position: relative; z-index: 1;">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <h5 style="color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">{{ $profile->institution_name }}</h5>
                    <p style="color: #e2e8f0;">{{ $profile->description }}</p>
                    @if($profile->slogan)
                    <p style="color: #60a5fa; font-style: italic;">"{{ $profile->slogan }}"</p>
                    @endif
                </div>
                
                <div class="col-lg-4 mb-4">
                    <h5 style="color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Kontak</h5>
                    <div class="contact-info">
                        @if($profile->address)
                        <p style="color: #e2e8f0;"><i class="fas fa-map-marker-alt me-2"></i> {{ $profile->full_address }}</p>
                        @endif
                        @if($profile->phone)
                        <p style="color: #e2e8f0;"><i class="fas fa-phone me-2"></i> {{ $profile->phone }}</p>
                        @endif
                        @if($profile->email)
                        <p style="color: #e2e8f0;"><i class="fas fa-envelope me-2"></i> {{ $profile->email }}</p>
                        @endif
                        @if($profile->website)
                        <p style="color: #e2e8f0;"><i class="fas fa-globe me-2"></i> <a href="{{ $profile->website }}" style="color: #ffffff; text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.textShadow='none'">{{ $profile->website }}</a></p>
                        @endif
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4">
                    <h5 style="color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Menu Cepat</h5>
                    <ul class="list-unstyled">
                        <li><a href="{{ route('tenant.public.home', ['tenant' => tenant('npsn')]) }}" style="color: #e2e8f0; text-decoration: none; transition: all 0.3s ease; display: inline-block; padding: 0.25rem 0;" onmouseover="this.style.color='#ffffff'; this.style.transform='translateX(5px)'; this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.color='#e2e8f0'; this.style.transform='translateX(0)'; this.style.textShadow='none'">Beranda</a></li>
                        <li><a href="{{ route('tenant.public.about', ['tenant' => tenant('npsn')]) }}" style="color: #e2e8f0; text-decoration: none; transition: all 0.3s ease; display: inline-block; padding: 0.25rem 0;" onmouseover="this.style.color='#ffffff'; this.style.transform='translateX(5px)'; this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.color='#e2e8f0'; this.style.transform='translateX(0)'; this.style.textShadow='none'">Tentang Kami</a></li>
                        <li><a href="{{ route('tenant.public.news.index', ['tenant' => tenant('npsn')]) }}" style="color: #e2e8f0; text-decoration: none; transition: all 0.3s ease; display: inline-block; padding: 0.25rem 0;" onmouseover="this.style.color='#ffffff'; this.style.transform='translateX(5px)'; this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.color='#e2e8f0'; this.style.transform='translateX(0)'; this.style.textShadow='none'">Berita</a></li>
                        <li><a href="{{ route('tenant.public.gallery.index', ['tenant' => tenant('npsn')]) }}" style="color: #e2e8f0; text-decoration: none; transition: all 0.3s ease; display: inline-block; padding: 0.25rem 0;" onmouseover="this.style.color='#ffffff'; this.style.transform='translateX(5px)'; this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.color='#e2e8f0'; this.style.transform='translateX(0)'; this.style.textShadow='none'">Galeri</a></li>
                        <li><a href="{{ route('tenant.public.contact', ['tenant' => tenant('npsn')]) }}" style="color: #e2e8f0; text-decoration: none; transition: all 0.3s ease; display: inline-block; padding: 0.25rem 0;" onmouseover="this.style.color='#ffffff'; this.style.transform='translateX(5px)'; this.style.textShadow='0 2px 8px rgba(255, 255, 255, 0.3)'" onmouseout="this.style.color='#e2e8f0'; this.style.transform='translateX(0)'; this.style.textShadow='none'">Kontak</a></li>
                    </ul>
                </div>
            </div>
            
            <hr class="my-4" style="border: none; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);">
            
            <div class="row align-items-center">
                <div class="col-12 text-center">
                    <p class="mb-0" style="color: #e2e8f0; font-size: 0.95rem;">
                        &copy; {{ date('Y') }} {{ $profile->institution_name }}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    @stack('scripts')
</body>
</html>
