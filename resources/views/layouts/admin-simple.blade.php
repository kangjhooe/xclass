<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Dashboard') - {{ system_name() }}</title>
    
    <!-- Favicon -->
    @if(system_favicon())
        <link rel="icon" type="image/x-icon" href="{{ system_favicon() }}">
    @else
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    @endif
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    
    <style>
        body {
            overflow-x: hidden;
        }
        
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 250px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 1000;
            transition: transform 0.3s ease;
        }
        
        .sidebar::-webkit-scrollbar {
            width: 6px;
        }
        
        .sidebar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
        
        .sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        .sidebar .nav-link {
            color: white !important;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin: 0.25rem 0;
            white-space: nowrap;
        }
        .sidebar .nav-link:hover {
            color: white !important;
            background: rgba(255, 255, 255, 0.1);
        }
        .sidebar .nav-link.active {
            color: white !important;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .main-content {
            margin-left: 250px;
            background-color: #f8f9fa;
            min-height: 100vh;
            overflow-y: auto;
        }
        
        .main-content-wrapper {
            overflow-y: auto;
            height: 100vh;
        }
        
        .card {
            border: none;
            border-radius: 1rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .stats-card {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 991.98px) {
            .sidebar {
                transform: translateX(-100%);
                width: 280px;
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            }
            
            .sidebar.show {
                transform: translateX(0);
            }
            
            .main-content {
                margin-left: 0 !important;
            }
            
            .mobile-menu-btn {
                display: block;
            }
            
            .navbar {
                padding: 0.5rem 1rem;
            }
            
            .navbar-brand {
                font-size: 1.1rem;
            }
        }
        
        @media (min-width: 992px) {
            .mobile-menu-btn {
                display: none;
            }
        }
        
        .mobile-menu-btn {
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: rgba(30, 58, 138, 0.9);
            border: none;
            color: white;
            padding: 12px 14px;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }
        
        .mobile-menu-btn:hover {
            background: rgba(30, 58, 138, 1);
            transform: scale(1.05);
        }
        
        .mobile-menu-btn:active {
            transform: scale(0.95);
        }
        
        /* Sidebar overlay untuk mobile */
        @media (max-width: 991.98px) {
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .sidebar.show ~ .sidebar-overlay {
                opacity: 1;
                visibility: visible;
            }
        }
        
        /* Tablet responsiveness */
        @media (min-width: 768px) and (max-width: 991.98px) {
            .sidebar {
                width: 260px;
            }
            
            .main-content {
                margin-left: 0;
            }
        }
        
        /* Blue theme enhancements */
        .btn-primary {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            border: none;
            border-radius: 0.5rem;
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(30, 58, 138, 0.3);
        }
        
        .navbar-brand {
            color: #1e3a8a !important;
            font-weight: 600;
        }
        
        .dropdown-toggle::after {
            color: #1e3a8a;
        }
        
        /* Main content nav links */
        .main-content .nav-link {
            color: #1e3a8a !important;
        }
        
        .main-content .nav-link:hover {
            color: #3b82f6 !important;
        }
        
        /* Sidebar specific styles - more specific selectors */
        .sidebar .nav-link,
        .sidebar .nav-link:hover,
        .sidebar .nav-link.active {
            color: white !important;
        }
        
        .sidebar .nav-link i,
        .sidebar .nav-link:hover i,
        .sidebar .nav-link.active i {
            color: white !important;
        }
        
        /* Force white color for all sidebar text */
        #sidebar .nav-link {
            color: #ffffff !important;
        }
        
        #sidebar .nav-link:hover {
            color: #ffffff !important;
        }
        
        #sidebar .nav-link.active {
            color: #ffffff !important;
        }
        
        #sidebar .nav-link i {
            color: #ffffff !important;
        }
        
        #sidebar .nav-link:hover i {
            color: #ffffff !important;
        }
        
        #sidebar .nav-link.active i {
            color: #ffffff !important;
        }
    </style>
</head>
<body>
    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" onclick="toggleSidebar()">
        <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar -->
    <div id="sidebar" class="sidebar">
        <div class="p-3">
            <div class="d-flex align-items-center mb-4">
                @if(system_logo())
                    <img src="{{ system_logo() }}" 
                         alt="Logo" 
                         style="max-height: 40px; max-width: 40px; margin-right: 10px;">
                @else
                    <i class="fas fa-graduation-cap me-2" style="font-size: 1.5rem;"></i>
                @endif
                <h4 class="text-white mb-0" style="color: white !important;">
                    {{ system_name() }} Admin
                </h4>
            </div>
            
            <nav class="nav flex-column">
                <a href="{{ route('admin.dashboard') }}" class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                </a>
                <a href="{{ route('admin.tenants.index') }}" class="nav-link {{ request()->routeIs('admin.tenants.*') ? 'active' : '' }}">
                    <i class="fas fa-building me-2"></i>
                    Tenants
                </a>
                <a href="{{ route('admin.users.index') }}" class="nav-link {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                    <i class="fas fa-users me-2"></i>
                    Users
                </a>
                <a href="{{ route('admin.statistics.index') }}" class="nav-link {{ request()->routeIs('admin.statistics.*') ? 'active' : '' }}">
                    <i class="fas fa-chart-bar me-2"></i>
                    Statistik & Laporan
                </a>
                <a href="{{ route('admin.settings') }}" class="nav-link {{ request()->routeIs('admin.settings') ? 'active' : '' }}">
                    <i class="fas fa-cog me-2"></i>
                    Settings
                </a>
            </nav>
        </div>
    </div>
    
    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Top Navigation -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1 d-flex align-items-center">
                    <span class="d-mobile-none">@yield('page-title', 'Dashboard')</span>
                    <span class="d-mobile-only" style="font-size: 1.1rem;">@yield('page-title', 'Dashboard')</span>
                </span>
                
                <button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarUserMenu" aria-controls="navbarUserMenu" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-user"></i>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarUserMenu">
                    <div class="navbar-nav ms-auto">
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                                <i class="fas fa-user me-1"></i>
                                <span class="d-mobile-none">{{ Auth::user()->name }}</span>
                                <span class="d-mobile-only">Menu</span>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <form action="{{ route('admin.logout') }}" method="POST" class="d-inline">
                                        @csrf
                                        <button type="submit" class="dropdown-item">
                                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Page Content -->
        <div class="container-fluid p-4 p-md-4">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif
            
            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif
            
            @yield('content')
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('show');
            
            if (window.innerWidth <= 991.98) {
                if (sidebar.classList.contains('show')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (window.innerWidth <= 991.98) {
                if (!sidebar.contains(event.target) && 
                    !mobileMenuBtn.contains(event.target) && 
                    !overlay.contains(event.target)) {
                    sidebar.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth > 991.98) {
                sidebar.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    </script>
    
    @yield('scripts')
</body>
</html>
