<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'CLASS') - Comprehensive Learning and School System</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    <!-- Vue.js -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    
    <style>
        /* Cache bust: 2025-01-27 */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
        }
        
        .navbar {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .navbar-brand {
            font-weight: 700;
            color: white !important;
        }
        
        .nav-link {
            color: rgba(255, 255, 255, 0.9) !important;
            font-weight: 500;
        }
        
        .nav-link:hover {
            color: white !important;
        }
        
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .form-control {
            border-radius: 10px;
            border: 2px solid #e9ecef;
            padding: 0.75rem 1rem;
        }
        
        .form-control:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }
        
        .footer {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%) !important;
            color: white !important;
            padding: 3rem 0 2rem !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 50%, rgba(30, 64, 175, 0.1) 100%);
            pointer-events: none;
        }
        
        .footer .container {
            position: relative;
            z-index: 1;
        }
        
        .footer a {
            color: #e2e8f0;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .footer a:hover {
            color: white;
            text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="{{ route('home') }}">
                <i class="fas fa-graduation-cap me-2"></i>
                CLASS
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('home') }}">
                            <i class="fas fa-home me-1"></i>Beranda
                        </a>
                    </li>
                    @auth
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('dashboard') }}">
                                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                            </a>
                        </li>
                    @else
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('login') }}">
                                <i class="fas fa-sign-in-alt me-1"></i>Login
                            </a>
                        </li>
                    @endauth
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main>
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="footer" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%) !important; color: white !important; padding: 3rem 0 2rem !important; position: relative !important; overflow: hidden !important;">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5 class="mb-3">
                        <i class="fas fa-graduation-cap me-2"></i>CLASS
                    </h5>
                    <p class="text-muted">
                        Platform manajemen sekolah terintegrasi yang memudahkan pengelolaan 
                        semua aspek pendidikan dalam satu sistem.
                    </p>
                </div>
                <div class="col-md-6 text-md-end">
                    <h6 class="mb-3">Link Cepat</h6>
                    <div class="d-flex flex-column">
                        <a href="{{ route('home') }}">Beranda</a>
                    </div>
                </div>
            </div>
            <hr class="my-4" style="border: none; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);">
            <div class="row align-items-center">
                <div class="col-12 text-center">
                    <p class="mb-0" style="color: #e2e8f0; font-size: 0.95rem;">
                        &copy; {{ date('Y') }} CLASS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    @yield('scripts')
</body>
</html>
