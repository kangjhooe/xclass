<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title', 'Halaman Publik') - {{ tenant('name') ?? 'Sistem Informasi' }}</title>
    
    <!-- Meta Tags -->
    <meta name="description" content="@yield('meta_description', 'Halaman publik ' . (tenant('name') ?? 'Sistem Informasi'))">
    <meta name="keywords" content="@yield('meta_keywords', 'berita, informasi, publik')">
    <meta name="author" content="{{ tenant('name') ?? 'Sistem Informasi' }}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="@yield('title', 'Halaman Publik') - {{ tenant('name') ?? 'Sistem Informasi' }}">
    <meta property="og:description" content="@yield('meta_description', 'Halaman publik ' . (tenant('name') ?? 'Sistem Informasi'))">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    @if(isset($news) && is_object($news))
        @if(method_exists($news, 'featured_image') && $news->featured_image)
            <meta property="og:image" content="{{ asset('storage/' . $news->featured_image) }}">
        @elseif(method_exists($news, 'count') && $news->count() > 0 && $news->first() && $news->first()->featured_image)
            <meta property="og:image" content="{{ asset('storage/' . $news->first()->featured_image) }}">
        @endif
    @endif

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    
    <!-- Custom CSS with Theme Support -->
    @php
        use Modules\PublicPage\Models\TenantProfile;
        use Modules\PublicPage\Services\ThemeService;
        
        $tenant = tenant();
        $profile = $tenant ? TenantProfile::where('instansi_id', $tenant->id)->first() : null;
        $theme = $profile ? $profile->getActiveTheme() : (new ThemeService(app(\App\Core\Services\TenantService::class)))->getDefaultTheme();
        $layoutType = $profile ? ($profile->layout_type ?? 'sidebar-left') : 'sidebar-left';
        $themeConfig = is_object($theme) ? ($theme->theme_config ?? []) : [];
        // Get menu config with backward compatibility
        if (is_object($theme) && method_exists($theme, 'getMenuConfig')) {
            $menuConfig = $theme->getMenuConfig();
        } else {
            $menuConfig = is_object($theme) ? ($theme->menu_config ?? []) : [];
        }
        
        // Default menu config
        $menuStyle = $menuConfig['menu_style'] ?? 'sidebar';
        $menuPosition = $menuConfig['menu_position'] ?? 'left';
        $showMenuIcons = $menuConfig['show_menu_icons'] ?? true;
        $showMenuSearch = $menuConfig['show_menu_search'] ?? true;
        $menuFontSize = $menuConfig['menu_font_size'] ?? '14px';
        $menuFontWeight = $menuConfig['menu_font_weight'] ?? '500';
        $menuItemPadding = $menuConfig['menu_item_padding'] ?? '12px 20px';
        $menuBorderRadius = $menuConfig['menu_border_radius'] ?? '0px';
        $menuHoverEffect = $menuConfig['menu_hover_effect'] ?? 'background';
    @endphp
    
    <style>
        :root {
            --primary-color: {{ $themeConfig['primary_color'] ?? '#007bff' }};
            --secondary-color: {{ $themeConfig['secondary_color'] ?? '#6c757d' }};
            --success-color: {{ $themeConfig['success_color'] ?? '#28a745' }};
            --info-color: {{ $themeConfig['info_color'] ?? '#17a2b8' }};
            --warning-color: {{ $themeConfig['warning_color'] ?? '#ffc107' }};
            --danger-color: {{ $themeConfig['danger_color'] ?? '#dc3545' }};
            --light-color: {{ $themeConfig['light_color'] ?? '#f8f9fa' }};
            --dark-color: {{ $themeConfig['dark_color'] ?? '#343a40' }};
            --sidebar-bg: {{ $themeConfig['sidebar_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }};
            --card-header-bg: {{ $themeConfig['card_header_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }};
            --footer-bg: {{ $themeConfig['footer_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }};
            --button-bg: {{ $themeConfig['button_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }};
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .navbar-brand:hover {
            transform: scale(1.05);
            filter: brightness(1.2);
        }
        
        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
            background-size: 200% 200%;
            animation: gradientShift 10s ease infinite;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }
        
        .navbar-nav .nav-link {
            position: relative;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin: 0 5px;
        }
        
        .navbar-nav .nav-link::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.5));
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        .navbar-nav .nav-link:hover::before {
            width: 80%;
        }
        
        .navbar-nav .nav-link:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
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

        .sidebar {
            min-height: calc(100vh - 56px);
            background: var(--sidebar-bg);
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
            padding: 0;
            position: relative;
            overflow: hidden;
        }
        
        .sidebar::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
            pointer-events: none;
        }

        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: {{ $menuItemPadding }};
            border-radius: {{ $menuBorderRadius }};
            transition: all 0.3s ease;
            font-size: {{ $menuFontSize }};
            font-weight: {{ $menuFontWeight }};
        }

        .sidebar .nav-link {
            position: relative;
            overflow: hidden;
        }
        
        .sidebar .nav-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .sidebar .nav-link:hover::before {
            left: 100%;
        }
        
        .sidebar .nav-link:hover {
            color: white;
            transform: translateX(5px);
            @if($menuHoverEffect == 'background')
                background-color: rgba(255, 255, 255, 0.15);
                box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
            @elseif($menuHoverEffect == 'underline')
                text-decoration: underline;
            @elseif($menuHoverEffect == 'border-left')
                border-left: 3px solid white;
                padding-left: calc({{ $menuItemPadding }} - 3px);
            @endif
        }

        .sidebar .nav-link.active {
            color: white;
            @if($menuHoverEffect == 'border-left')
                border-left: 3px solid white;
                background-color: rgba(255, 255, 255, 0.15);
            @else
                background-color: rgba(255, 255, 255, 0.2);
            @endif
        }

        .sidebar .nav-link i {
            width: 20px;
            margin-right: 10px;
            @if(!$showMenuIcons)
                display: none !important;
            @endif
        }

        /* Menu Style: Top Bar */
        .menu-style-topbar .navbar-nav {
            flex-direction: row;
        }

        .menu-style-topbar .navbar-nav .nav-link {
            color: rgba(255, 255, 255, 0.9);
            padding: {{ $menuItemPadding }};
            font-size: {{ $menuFontSize }};
            font-weight: {{ $menuFontWeight }};
            border-radius: {{ $menuBorderRadius }};
            margin: 0 5px;
            transition: all 0.3s ease;
        }

        .menu-style-topbar .navbar-nav .nav-link:hover {
            @if($menuHoverEffect == 'background')
                background-color: rgba(255, 255, 255, 0.2);
            @elseif($menuHoverEffect == 'underline')
                text-decoration: underline;
            @elseif($menuHoverEffect == 'border-left')
                border-bottom: 3px solid white;
            @endif
        }

        .menu-style-topbar .navbar-nav .nav-link i {
            @if(!$showMenuIcons)
                display: none !important;
            @endif
        }

        /* Menu Style: Accordion */
        .menu-style-accordion .nav-link {
            position: relative;
        }

        .menu-style-accordion .nav-link[data-toggle="collapse"]::after {
            content: '\f107';
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            position: absolute;
            right: 20px;
        }

        .menu-style-accordion .nav-link[data-toggle="collapse"].collapsed::after {
            content: '\f105';
        }

        .main-content {
            background-color: var(--light-color);
            min-height: calc(100vh - 56px);
        }

        .card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            background: var(--card-header-bg);
            color: white;
            border-radius: 10px 10px 0 0 !important;
            border: none;
        }

        .btn-primary {
            background: var(--button-bg);
            background-size: 200% 200%;
            border: none;
            border-radius: 25px;
            padding: 8px 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
            left: 100%;
        }

        .btn-primary:hover {
            transform: translateY(-2px) scale(1.05);
            opacity: 0.9;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            animation: gradientShift 3s ease infinite;
        }

        .news-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .news-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .news-card .card-img-top {
            height: 200px;
            object-fit: cover;
        }

        .footer {
            background: var(--footer-bg);
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
            color: white;
            padding: 20px 0;
            margin-top: 50px;
            position: relative;
            overflow: hidden;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
            pointer-events: none;
        }
        
        .footer > * {
            position: relative;
            z-index: 1;
        }

        .search-box {
            position: relative;
        }

        .search-box .form-control {
            border-radius: 25px;
            padding-left: 40px;
        }

        .search-box .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
        }

        /* Layout Types */
        .layout-boxed .container-fluid {
            max-width: 1200px;
            margin: 0 auto;
        }

        .layout-full-width .sidebar {
            display: none;
        }

        .layout-full-width .main-content {
            width: 100% !important;
        }

        @media (max-width: 768px) {
            .sidebar {
                min-height: auto;
            }
            
            .main-content {
                min-height: auto;
            }

            .layout-full-width .sidebar {
                display: block;
            }
        }

        /* Custom CSS from theme */
        @if(is_object($theme) && $theme->custom_css)
        {!! $theme->custom_css !!}
        @endif

        @if($profile && $profile->custom_css)
        {!! $profile->custom_css !!}
        @endif
    </style>

    @yield('styles')
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="{{ route('public.home', ['tenant' => tenant('npsn') ?? tenant('id')]) }}">
                @if(system_logo())
                    <img src="{{ system_logo() }}" alt="{{ system_name() }}" class="brand-logo me-2" style="height: 30px;">
                @else
                    <i class="fas fa-graduation-cap me-2"></i>
                @endif
                {{ system_name() }}
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('public.home', ['tenant' => tenant('npsn') ?? tenant('id')]) }}">
                            <i class="fas fa-home me-1"></i>Beranda
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('public.news.index') }}">
                            <i class="fas fa-newspaper me-1"></i>Berita
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('public.library.index') }}">
                            <i class="fas fa-book me-1"></i>Perpustakaan
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('public.ppdb.index') }}">
                            <i class="fas fa-user-graduate me-1"></i>PPDB
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('public.about') }}">
                            <i class="fas fa-info-circle me-1"></i>Tentang
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ tenant_route('public.contact') }}">
                            <i class="fas fa-envelope me-1"></i>Kontak
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container-fluid layout-{{ $layoutType }}">
        <div class="row">
            @if($layoutType !== 'full-width')
            <!-- Sidebar -->
            <div class="col-md-3 col-lg-2 px-0">
                <div class="sidebar">
                    <div class="p-3">
                        <h6 class="text-white-50 text-uppercase fw-bold mb-3">
                            <i class="fas fa-bars me-2"></i>Menu
                        </h6>
                        
                        <!-- Search Box -->
                        @if($showMenuSearch)
                        <div class="search-box mb-3">
                            <i class="fas fa-search search-icon"></i>
                            @php
                                $currentRoute = request()->route()->getName();
                                $searchRoute = 'public.news.index';
                                $searchPlaceholder = 'Cari berita...';
                                
                                if (str_contains($currentRoute, 'gallery')) {
                                    $searchRoute = 'public.gallery.index';
                                    $searchPlaceholder = 'Cari galeri...';
                                } elseif (str_contains($currentRoute, 'news')) {
                                    $searchRoute = 'public.news.index';
                                    $searchPlaceholder = 'Cari berita...';
                                } elseif (str_contains($currentRoute, 'library')) {
                                    $searchRoute = 'public.library.index';
                                    $searchPlaceholder = 'Cari buku...';
                                }
                            @endphp
                            <form action="{{ tenant_route($searchRoute) }}" method="GET">
                                <input type="text" class="form-control" name="search" placeholder="{{ $searchPlaceholder }}" value="{{ request('search') }}">
                            </form>
                        </div>
                        @endif
                    </div>
                    
                    <nav class="nav flex-column menu-style-{{ $menuStyle }}">
                        @php
                            $menus = \Modules\PublicPage\Models\Menu::where('instansi_id', tenant('id'))
                                ->active()
                                ->root()
                                ->orderBy('order')
                                ->get();
                        @endphp
                        
                        @foreach($menus as $menu)
                            <a href="{{ $menu->formatted_url }}" 
                               class="nav-link {{ request()->is(trim($menu->url, '/')) ? 'active' : '' }}"
                               target="{{ $menu->target }}">
                                @if($showMenuIcons && $menu->icon)
                                    <i class="{{ $menu->icon }}"></i>
                                @endif
                                {{ $menu->name }}
                            </a>
                            
                            @if($menu->children->count() > 0)
                                @foreach($menu->children as $child)
                                    <a href="{{ $child->formatted_url }}" 
                                       class="nav-link ps-4 {{ request()->is(trim($child->url, '/')) ? 'active' : '' }}"
                                       target="{{ $child->target }}">
                                        @if($showMenuIcons && $child->icon)
                                            <i class="{{ $child->icon }}"></i>
                                        @endif
                                        {{ $child->name }}
                                    </a>
                                @endforeach
                            @endif
                        @endforeach
                        
                        <!-- Default Menu Items -->
                        <a href="{{ route('public.home', ['tenant' => tenant('npsn') ?? tenant('id')]) }}" 
                           class="nav-link {{ request()->routeIs('tenant.public.home') || request()->routeIs('public.home') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-home"></i>
                            @endif
                            Beranda
                        </a>
                        <a href="{{ tenant_route('public.news.index') }}" 
                           class="nav-link {{ request()->routeIs('public.news.*') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-newspaper"></i>
                            @endif
                            Berita
                        </a>
                        <a href="{{ tenant_route('public.gallery.index') }}" 
                           class="nav-link {{ request()->routeIs('public.gallery.*') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-images"></i>
                            @endif
                            Galeri
                        </a>
                        <a href="{{ tenant_route('public.library.index') }}" 
                           class="nav-link {{ request()->routeIs('public.library.*') || request()->routeIs('tenant.public.library.*') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-book"></i>
                            @endif
                            Perpustakaan
                        </a>
                        <a href="{{ route('public.ppdb.index') }}" 
                           class="nav-link {{ request()->routeIs('public.ppdb.*') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-user-graduate"></i>
                            @endif
                            PPDB
                        </a>
                        <a href="{{ tenant_route('public.about') }}" 
                           class="nav-link {{ request()->routeIs('public.about') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-info-circle"></i>
                            @endif
                            Tentang Kami
                        </a>
                        <a href="{{ tenant_route('public.contact') }}" 
                           class="nav-link {{ request()->routeIs('public.contact') ? 'active' : '' }}">
                            @if($showMenuIcons)
                                <i class="fas fa-envelope"></i>
                            @endif
                            Kontak
                        </a>
                    </nav>
                </div>
            </div>
            @endif

            <!-- Main Content -->
            <div class="{{ $layoutType === 'full-width' ? 'col-12' : 'col-md-9 col-lg-10' }}">
                <div class="main-content p-4">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <i class="fas fa-check-circle me-2"></i>
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @yield('content')
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>{{ tenant('name') ?? 'Sistem Informasi' }}</h5>
                    <p class="mb-0">{{ tenant('description') ?? 'Sistem informasi terintegrasi untuk manajemen data dan layanan publik.' }}</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">
                        <i class="fas fa-copyright me-1"></i>
                        {{ date('Y') }} {{ tenant('name') ?? 'Sistem Informasi' }}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    <script>
        // Auto-hide alerts
        setTimeout(function() {
            var alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                var bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }, 5000);

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>

    @if(is_object($theme) && $theme->custom_js)
    <script>
        {!! $theme->custom_js !!}
    </script>
    @endif

    @if($profile && $profile->custom_js)
    <script>
        {!! $profile->custom_js !!}
    </script>
    @endif

    @yield('scripts')
</body>
</html>
