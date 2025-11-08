<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLASS - Comprehensive Learning and School System</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- AOS Animation -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <!-- Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
    
    <style>
        /* Cache bust: 2025-01-27 */
        :root {
            --primary-color: #3b82f6;
            --secondary-color: #1d4ed8;
            --accent-color: #60a5fa;
            --text-dark: #2d3748;
            --text-light: #718096;
            --bg-light: #f7fafc;
            --shadow: 0 10px 25px rgba(0,0,0,0.1);
            --shadow-lg: 0 20px 40px rgba(0,0,0,0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            overflow-x: hidden;
        }

        /* Navigation */
        .navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: var(--shadow);
        }

        .navbar-brand {
            font-weight: 800;
            font-size: 1.5rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .navbar-logo {
            display: flex;
            align-items: center;
            margin-left: auto;
        }

        .brand-logo {
            height: 30px;
            width: auto;
            object-fit: contain;
        }

        .logo-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 60px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px dashed rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .logo-placeholder:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: var(--primary-color);
            transform: scale(1.05);
        }

        .logo-placeholder i {
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
        }

        .system-logo {
            max-height: 50px;
            max-width: 120px;
            width: auto;
            height: auto;
            object-fit: contain;
            transition: all 0.3s ease;
        }

        .system-logo:hover {
            transform: scale(1.05);
        }

        .footer-logo {
            height: 25px;
            width: auto;
            object-fit: contain;
        }

        /* Hero Section */
        .hero-section {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 0%, transparent 50%);
            opacity: 0.8;
        }

        .hero-content {
            position: relative;
            z-index: 2;
        }

        .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            color: white;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            color: rgba(255, 255, 255, 0.9);
        }

        .btn-hero {
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
            color: var(--primary-color);
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }

        .btn-hero:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.2);
            color: var(--primary-color);
        }

        .btn-outline-hero {
            background: transparent;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.8);
            padding: 0.8rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }

        .btn-outline-hero:hover {
            background: white;
            color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Navbar-specific button colors */
        .navbar .btn-hero {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: #ffffff;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
        }

        .navbar .btn-hero:hover {
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(59, 130, 246, 0.35);
        }

        .navbar .btn-outline-hero {
            background: transparent;
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }

        .navbar .btn-outline-hero:hover {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
        }

        /* Floating Elements */
        .floating-element {
            position: absolute;
            animation: float 6s ease-in-out infinite;
        }

        .floating-element:nth-child(2) {
            animation-delay: -2s;
        }

        .floating-element:nth-child(3) {
            animation-delay: -4s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        /* Stats Section */
        .stats-section {
            background: var(--bg-light);
            padding: 5rem 0;
        }

        .stat-item {
            text-align: center;
            padding: 2rem;
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: var(--text-light);
            font-weight: 500;
        }

        /* Features Section */
        .features-section {
            padding: 6rem 0;
        }

        .feature-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border: 1px solid rgba(0,0,0,0.05);
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }

        .feature-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 1.8rem;
            color: white;
            transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
            transform: scale(1.1);
        }

        .feature-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-dark);
        }

        .feature-description {
            color: var(--text-light);
            line-height: 1.6;
        }

        /* Testimonials */
        .testimonials-section {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            padding: 6rem 0;
            color: white;
            position: relative;
        }

        .testimonials-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .testimonial-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 2.5rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
        }

        .testimonial-card:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-5px);
        }

        .testimonial-text {
            font-size: 1.25rem;
            font-style: italic;
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .testimonial-author {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .testimonial-role {
            opacity: 0.8;
        }

        /* FAQ Section */
        .faq-section {
            padding: 6rem 0;
            background: var(--bg-light);
        }

        .faq-item {
            background: white;
            border-radius: 15px;
            margin-bottom: 1rem;
            box-shadow: var(--shadow);
            overflow: hidden;
        }

        .faq-question {
            padding: 1.5rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        .faq-question:hover {
            background: var(--bg-light);
        }

        .faq-answer {
            padding: 0 1.5rem 1.5rem;
            color: var(--text-light);
            display: none;
        }

        .faq-answer.active {
            display: block;
        }

        /* Newsletter */
        .newsletter-section {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            padding: 4rem 0;
            color: white;
        }

        .newsletter-form {
            max-width: 500px;
            margin: 0 auto;
        }

        .newsletter-input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50px;
            padding: 1rem 1.5rem;
            color: white;
            width: 100%;
        }

        .newsletter-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .newsletter-btn {
            background: white;
            color: var(--primary-color);
            border: none;
            border-radius: 50px;
            padding: 1rem 2rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .newsletter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%) !important;
            color: white !important;
            padding: 4rem 0 2rem !important;
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

        .footer-section h5 {
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .footer-link {
            color: #e2e8f0;
            text-decoration: none;
            transition: all 0.3s ease;
            padding: 0.25rem 0;
            display: inline-block;
            position: relative;
        }

        .footer-link:hover {
            color: #ffffff;
            transform: translateX(5px);
            text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
        }

        .footer-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 0;
            background: linear-gradient(90deg, #60a5fa, #3b82f6);
            transition: width 0.3s ease;
        }

        .footer-link:hover::after {
            width: 100%;
        }

        .social-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            color: white;
            text-decoration: none;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-right: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .social-link:hover {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        /* Animations */
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }

        .fade-in-up.visible {
            opacity: 1;
            transform: translateY(0);
        }

        @keyframes heartbeat {
            0% { transform: scale(1); }
            25% { transform: scale(1.1); }
            50% { transform: scale(1); }
            75% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }


        /* Smooth transitions */
        * {
            transition: all 0.3s ease;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #1d4ed8, #3b82f6);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }
            
            .hero-subtitle {
                font-size: 1.1rem;
            }
            
            .stat-number {
                font-size: 2rem;
            }

            .hero-illustration {
                height: 300px !important;
            }

            .floating-element {
                display: none;
            }

            .logo-placeholder {
                width: 60px;
                height: 45px;
            }

            .logo-placeholder i {
                font-size: 1.2rem;
            }

            .system-logo {
                max-height: 40px;
                max-width: 100px;
            }

            .brand-logo {
                height: 25px;
            }

            .footer-logo {
                height: 20px;
            }
        }

        @media (max-width: 576px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .btn-hero, .btn-outline-hero {
                padding: 0.7rem 1.5rem;
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light fixed-top">
        <div class="container">
            <a class="navbar-brand" href="{{ route('home') }}">
                @if(system_logo())
                    <img src="{{ system_logo() }}" alt="{{ system_name() }}" class="brand-logo me-2">
                @else
                    <i class="fas fa-graduation-cap me-2"></i>
                @endif
                {{ system_name() }}
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">

                <ul class="navbar-nav me-auto align-items-lg-center">
                    <li class="nav-item">
                        <a class="nav-link" href="#features">Fitur</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#testimonials">Testimoni</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#faq">FAQ</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#contact">Kontak</a>
                    </li>
                </ul>

                <div class="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 ms-lg-3">
                @auth
                    <a href="{{ route('dashboard') }}" class="btn btn-hero">
                        <i class="fas fa-tachometer-alt me-1"></i>
                        Dashboard
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn btn-outline-hero me-lg-2">
                        <i class="fas fa-sign-in-alt me-1"></i>
                        Login
                    </a>
                    <a href="{{ route('register') }}" class="btn btn-hero">
                        <i class="fas fa-user-plus me-1"></i>
                        Register
                    </a>
                @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <!-- Floating Elements -->
        <div class="floating-element" style="top: 20%; left: 10%;">
            <i class="fas fa-book-open" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
        </div>
        <div class="floating-element" style="top: 60%; right: 15%;">
            <i class="fas fa-users" style="font-size: 2.5rem; color: rgba(255,255,255,0.3);"></i>
        </div>
        <div class="floating-element" style="top: 30%; right: 20%;">
            <i class="fas fa-chart-line" style="font-size: 2rem; color: rgba(255,255,255,0.3);"></i>
        </div>
        
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 hero-content" data-aos="fade-right">
                    <h1 class="hero-title">
                        Sistem Manajemen Sekolah
                        <span class="d-block">Terintegrasi & Modern</span>
                    </h1>
                    <p class="hero-subtitle">
                        Kelola semua aspek pendidikan dengan mudah menggunakan platform 
                        multi-tenant yang komprehensif dan user-friendly.
                    </p>
                    <div class="d-flex flex-wrap gap-3">
                        @auth
                            <a href="{{ route('dashboard') }}" class="btn btn-hero">
                                <i class="fas fa-tachometer-alt me-2"></i>
                                Masuk Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}" class="btn btn-hero">
                                <i class="fas fa-sign-in-alt me-2"></i>
                                Login
                            </a>
                            <a href="{{ route('register') }}" class="btn btn-outline-hero">
                                <i class="fas fa-user-plus me-2"></i>
                                Daftar Gratis
                            </a>
                        @endauth
                    </div>
                </div>
                <div class="col-lg-6 text-center" data-aos="fade-left">
                    <div class="position-relative">
                        <div class="hero-illustration">
                            <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
                                <div class="position-relative">
                                    <i class="fas fa-school" style="font-size: 15rem; color: rgba(255,255,255,0.3);"></i>
                                    <div class="position-absolute top-50 start-50 translate-middle">
                                        <i class="fas fa-graduation-cap" style="font-size: 4rem; color: rgba(255,255,255,0.8);"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Stats Cards -->
                        <div class="position-absolute" style="top: 15%; left: -5%;">
                            <div class="bg-white rounded-3 p-3 shadow-lg" style="width: 100px; animation: float 3s ease-in-out infinite;">
                                <div class="text-primary fw-bold fs-5">500+</div>
                                <div class="text-muted small">Sekolah</div>
                            </div>
                        </div>
                        <div class="position-absolute" style="top: 50%; right: -5%;">
                            <div class="bg-white rounded-3 p-3 shadow-lg" style="width: 100px; animation: float 3s ease-in-out infinite 1.5s;">
                                <div class="text-primary fw-bold fs-5">50K+</div>
                                <div class="text-muted small">Siswa</div>
                            </div>
                        </div>
                        <div class="position-absolute" style="top: 80%; left: 10%;">
                            <div class="bg-white rounded-3 p-3 shadow-lg" style="width: 100px; animation: float 3s ease-in-out infinite 3s;">
                                <div class="text-primary fw-bold fs-5">99%</div>
                                <div class="text-muted small">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
                    <div class="stat-item">
                        <div class="stat-number" data-count="500">0</div>
                        <div class="stat-label">Sekolah Terdaftar</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
                    <div class="stat-item">
                        <div class="stat-number" data-count="50000">0</div>
                        <div class="stat-label">Siswa Aktif</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
                    <div class="stat-item">
                        <div class="stat-number" data-count="10000">0</div>
                        <div class="stat-label">Guru & Staff</div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
                    <div class="stat-item">
                        <div class="stat-number" data-count="99">0</div>
                        <div class="stat-label">% Uptime</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
        <div class="container">
            <div class="row text-center mb-5" data-aos="fade-up">
                <div class="col-lg-8 mx-auto">
                    <h2 class="fw-bold mb-3">Fitur Unggulan</h2>
                    <p class="lead text-muted">
                        Solusi lengkap untuk manajemen sekolah modern dengan teknologi terdepan
                    </p>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3 class="feature-title">Manajemen Siswa</h3>
                        <p class="feature-description">
                            Kelola data siswa, absensi, dan nilai dengan sistem yang terintegrasi dan mudah digunakan
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <h3 class="feature-title">Manajemen Guru</h3>
                        <p class="feature-description">
                            Kelola data guru, jadwal mengajar, dan penilaian kinerja dengan fitur yang komprehensif
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <h3 class="feature-title">Jadwal Pelajaran</h3>
                        <p class="feature-description">
                            Buat dan kelola jadwal pelajaran dengan mudah dan fleksibel sesuai kebutuhan
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="400">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3 class="feature-title">Laporan & Analisis</h3>
                        <p class="feature-description">
                            Generate laporan komprehensif dan analisis data pendidikan yang detail
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="500">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <h3 class="feature-title">Multi-Tenant</h3>
                        <p class="feature-description">
                            Kelola multiple sekolah dalam satu platform terpadu dengan isolasi data yang aman
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="600">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h3 class="feature-title">Responsive Design</h3>
                        <p class="feature-description">
                            Akses dari berbagai perangkat dengan tampilan yang optimal dan user-friendly
                        </p>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="700">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <h3 class="feature-title">PPDB Online</h3>
                        <p class="feature-description">
                            Sistem pendaftaran siswa baru yang terintegrasi dengan verifikasi dan pengumuman online
                        </p>
                        <div class="mt-3 d-flex gap-2 justify-content-center">
                            <a href="{{ route('ppdb.register') }}" class="btn btn-primary btn-sm">
                                <i class="fas fa-user-plus me-1"></i>Daftar Akun PPDB
                            </a>
                            <a href="{{ route('login') }}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-sign-in-alt me-1"></i>Masuk PPDB
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="testimonials-section">
        <div class="container">
            <div class="row text-center mb-5" data-aos="fade-up">
                <div class="col-lg-8 mx-auto">
                    <h2 class="fw-bold mb-3">Apa Kata Mereka?</h2>
                    <p class="lead">
                        Testimoni dari sekolah yang telah menggunakan platform CLASS
                    </p>
                </div>
            </div>
            
            <div class="swiper testimonial-swiper" data-aos="fade-up">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                        <div class="testimonial-card">
                            <p class="testimonial-text">
                                "Platform CLASS sangat membantu dalam mengelola sekolah kami. 
                                Fitur-fiturnya lengkap dan mudah digunakan."
                            </p>
                            <div class="testimonial-author">Dr. Ahmad Wijaya</div>
                            <div class="testimonial-role">Kepala Sekolah SMA Negeri 1 Jakarta</div>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="testimonial-card">
                            <p class="testimonial-text">
                                "Dengan CLASS, kami bisa mengelola data siswa dan guru dengan lebih efisien. 
                                Laporan yang dihasilkan juga sangat detail dan akurat."
                            </p>
                            <div class="testimonial-author">Siti Nurhaliza</div>
                            <div class="testimonial-role">Wakil Kepala Sekolah SMP Islam Terpadu</div>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="testimonial-card">
                            <p class="testimonial-text">
                                "Sistem multi-tenant CLASS memungkinkan kami mengelola beberapa sekolah 
                                dalam satu platform. Sangat praktis dan hemat biaya."
                            </p>
                            <div class="testimonial-author">Prof. Dr. Budi Santoso</div>
                            <div class="testimonial-role">Direktur Yayasan Pendidikan ABC</div>
                        </div>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="faq-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <div class="text-center mb-5" data-aos="fade-up">
                        <h2 class="fw-bold mb-3">Pertanyaan yang Sering Diajukan</h2>
                        <p class="lead text-muted">
                            Temukan jawaban untuk pertanyaan umum tentang platform CLASS
                        </p>
                    </div>
                    
                    <div class="faq-container">
                        <div class="faq-item" data-aos="fade-up" data-aos-delay="100">
                            <div class="faq-question" onclick="toggleFAQ(this)">
                                <span>Apa itu sistem multi-tenant?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Sistem multi-tenant memungkinkan Anda mengelola beberapa sekolah dalam satu platform dengan data yang terisolasi dan aman. Setiap sekolah memiliki akses terpisah namun menggunakan infrastruktur yang sama.</p>
                            </div>
                        </div>
                        
                        <div class="faq-item" data-aos="fade-up" data-aos-delay="200">
                            <div class="faq-question" onclick="toggleFAQ(this)">
                                <span>Bagaimana cara migrasi data dari sistem lama?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Tim support kami akan membantu proses migrasi data dari sistem lama ke CLASS. Kami menyediakan tools dan panduan lengkap untuk memastikan data Anda aman dan terintegrasi dengan baik.</p>
                            </div>
                        </div>
                        
                        <div class="faq-item" data-aos="fade-up" data-aos-delay="300">
                            <div class="faq-question" onclick="toggleFAQ(this)">
                                <span>Apakah ada training untuk pengguna?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Ya, kami menyediakan training lengkap untuk semua pengguna, termasuk video tutorial, dokumentasi, dan sesi training langsung dengan tim support kami.</p>
                            </div>
                        </div>
                        
                        <div class="faq-item" data-aos="fade-up" data-aos-delay="400">
                            <div class="faq-question" onclick="toggleFAQ(this)">
                                <span>Bagaimana keamanan data sekolah?</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Data sekolah dilindungi dengan enkripsi tingkat enterprise, backup otomatis, dan akses kontrol yang ketat. Kami mematuhi standar keamanan internasional dan regulasi perlindungan data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section">
        <div class="container">
            <div class="row text-center" data-aos="fade-up">
                <div class="col-lg-8 mx-auto">
                    <h2 class="fw-bold mb-3">Dapatkan Update Terbaru</h2>
                    <p class="lead mb-4">
                        Berlangganan newsletter kami untuk mendapatkan tips, update fitur, dan informasi terbaru
                    </p>
                    <form class="newsletter-form">
                        <div class="input-group">
                            <input type="email" class="form-control newsletter-input" placeholder="Masukkan email Anda">
                            <button class="btn newsletter-btn" type="submit">
                                <i class="fas fa-paper-plane me-2"></i>
                                Berlangganan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="footer" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%) !important; color: white !important; padding: 4rem 0 2rem !important; position: relative !important; overflow: hidden !important;">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="footer-section">
                        <h5 class="d-flex align-items-center">
                            @if(system_logo())
                                <img src="{{ system_logo() }}" alt="{{ system_name() }}" class="footer-logo me-2">
                            @else
                                <i class="fas fa-graduation-cap me-2"></i>
                            @endif
                            {{ system_name() }}
                        </h5>
                        <p class="text-muted mb-3">
                            Platform manajemen sekolah terintegrasi yang memudahkan pengelolaan 
                            semua aspek pendidikan dalam satu sistem.
                        </p>
                        <div class="social-links">
                            <a href="#" class="social-link">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="#" class="social-link">
                                <i class="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <div class="footer-section">
                        <h5>Produk</h5>
                        <ul class="list-unstyled">
                            <li><a href="#" class="footer-link">Fitur Utama</a></li>
                            <li><a href="#" class="footer-link">Pricing</a></li>
                            <li><a href="#" class="footer-link">Demo</a></li>
                            <li><a href="#" class="footer-link">API</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <div class="footer-section">
                        <h5>Dukungan</h5>
                        <ul class="list-unstyled">
                            <li><a href="#" class="footer-link">Dokumentasi</a></li>
                            <li><a href="#" class="footer-link">Help Center</a></li>
                            <li><a href="#" class="footer-link">Training</a></li>
                            <li><a href="#" class="footer-link">Kontak</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <div class="footer-section">
                        <h5>Perusahaan</h5>
                        <ul class="list-unstyled">
                            <li><a href="#" class="footer-link">Tentang Kami</a></li>
                            <li><a href="#" class="footer-link">Karir</a></li>
                            <li><a href="#" class="footer-link">Blog</a></li>
                            <li><a href="#" class="footer-link">Press</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <div class="footer-section">
                        <h5>Legal</h5>
                        <ul class="list-unstyled">
                            <li><a href="#" class="footer-link">Privacy Policy</a></li>
                            <li><a href="#" class="footer-link">Terms of Service</a></li>
                            <li><a href="#" class="footer-link">Cookie Policy</a></li>
                            <li><a href="#" class="footer-link">GDPR</a></li>
                        </ul>
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

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    
    <script>
        // Initialize AOS
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true
                });
            }
        });

        // Initialize Swiper
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Swiper !== 'undefined') {
                const testimonialSwiper = new Swiper('.testimonial-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    loop: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        }
                    }
                });
            }
        });

        // Smooth scrolling for anchor links
        document.addEventListener('DOMContentLoaded', function() {
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
        });

        // FAQ Toggle
        function toggleFAQ(element) {
            const answer = element.nextElementSibling;
            const icon = element.querySelector('i');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(item => {
                if (item !== answer) {
                    item.classList.remove('active');
                }
            });
            
            document.querySelectorAll('.faq-question i').forEach(item => {
                if (item !== icon) {
                    item.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            answer.classList.toggle('active');
            icon.style.transform = answer.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
        }

        // Counter animation
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current).toLocaleString();
                }, 16);
            });
        }

        // Trigger counter animation when stats section is visible
        const statsSection = document.querySelector('.stats-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(statsSection);

        // Newsletter form
        document.addEventListener('DOMContentLoaded', function() {
            const newsletterForm = document.querySelector('.newsletter-form');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    if (email) {
                        alert('Terima kasih! Anda telah berlangganan newsletter kami.');
                        this.reset();
                    }
                });
            }
        });


        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Parallax effect for floating elements
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelectorAll('.floating-element');
            const speed = 0.3;

            parallax.forEach(element => {
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });

        // Add smooth reveal animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in-up').forEach(el => {
            fadeObserver.observe(el);
        });
    </script>
</body>
</html>

