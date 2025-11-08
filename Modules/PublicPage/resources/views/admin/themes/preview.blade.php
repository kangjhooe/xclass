<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Tema: {{ $theme->name ?? 'Tema' }}</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary-color: {{ ($theme->theme_config['primary_color'] ?? '#007bff') }};
            --secondary-color: {{ ($theme->theme_config['secondary_color'] ?? '#6c757d') }};
            --success-color: {{ ($theme->theme_config['success_color'] ?? '#28a745') }};
            --info-color: {{ ($theme->theme_config['info_color'] ?? '#17a2b8') }};
            --warning-color: {{ ($theme->theme_config['warning_color'] ?? '#ffc107') }};
            --danger-color: {{ ($theme->theme_config['danger_color'] ?? '#dc3545') }};
            --light-color: {{ ($theme->theme_config['light_color'] ?? '#f8f9fa') }};
            --dark-color: {{ ($theme->theme_config['dark_color'] ?? '#343a40') }};
            --sidebar-bg: {{ ($theme->theme_config['sidebar_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }};
            --card-header-bg: {{ ($theme->theme_config['card_header_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }};
            --footer-bg: {{ ($theme->theme_config['footer_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }};
            --button-bg: {{ ($theme->theme_config['button_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }};
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
        }

        .sidebar {
            min-height: calc(100vh - 56px);
            background: var(--sidebar-bg);
            padding: 0;
        }

        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            padding: 12px 20px;
            border-radius: 0;
            transition: all 0.3s ease;
        }

        .sidebar .nav-link:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
        }

        .sidebar .nav-link.active {
            color: white;
            background-color: rgba(255, 255, 255, 0.2);
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
            border: none;
            border-radius: 25px;
            padding: 8px 20px;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            opacity: 0.9;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .footer {
            background: var(--footer-bg);
            color: white;
            padding: 20px 0;
            margin-top: 50px;
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

        @if($theme->custom_css)
        {!! $theme->custom_css !!}
        @endif

        .preview-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="preview-banner">
        <i class="fas fa-eye mr-2"></i>
        <strong>PREVIEW MODE</strong> - Tema: {{ $theme->name ?? 'Tema' }}
        <a href="javascript:window.close()" class="btn btn-sm btn-light ms-3">
            <i class="fas fa-times mr-1"></i>Tutup
        </a>
    </div>

    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: var(--sidebar-bg);">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <i class="fas fa-graduation-cap me-2"></i>
                {{ $currentTenant->name ?? 'Sistem Informasi' }}
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="fas fa-home me-1"></i>Beranda
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">
                            <i class="fas fa-newspaper me-1"></i>Berita
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">
                            <i class="fas fa-info-circle me-1"></i>Tentang
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">
                            <i class="fas fa-envelope me-1"></i>Kontak
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container-fluid layout-{{ $theme->layout_type ?? 'sidebar-left' }}">
        <div class="row">
            @if(($theme->layout_type ?? 'sidebar-left') !== 'full-width')
            <!-- Sidebar -->
            <div class="col-md-3 col-lg-2 px-0">
                <div class="sidebar">
                    <div class="p-3">
                        <h6 class="text-white-50 text-uppercase fw-bold mb-3">
                            <i class="fas fa-bars me-2"></i>Menu
                        </h6>
                    </div>
                    
                    <nav class="nav flex-column">
                        <a href="#" class="nav-link active">
                            <i class="fas fa-home"></i>Beranda
                        </a>
                        <a href="#" class="nav-link">
                            <i class="fas fa-newspaper"></i>Berita
                        </a>
                        <a href="#" class="nav-link">
                            <i class="fas fa-images"></i>Galeri
                        </a>
                        <a href="#" class="nav-link">
                            <i class="fas fa-info-circle"></i>Tentang Kami
                        </a>
                        <a href="#" class="nav-link">
                            <i class="fas fa-envelope"></i>Kontak
                        </a>
                    </nav>
                </div>
            </div>
            @endif

            <!-- Main Content -->
            <div class="{{ ($theme->layout_type ?? 'sidebar-left') === 'full-width' ? 'col-12' : 'col-md-9 col-lg-10' }}">
                <div class="main-content p-4">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-newspaper me-2"></i>
                                Contoh Konten Berita
                            </h5>
                        </div>
                        <div class="card-body">
                            <h4>Selamat Datang di Preview Tema</h4>
                            <p>Ini adalah preview dari tema <strong>{{ $theme->name ?? 'Tema' }}</strong>. Anda dapat melihat bagaimana tema ini akan terlihat di halaman publik.</p>
                            
                            <div class="mt-4">
                                <button class="btn btn-primary me-2">
                                    <i class="fas fa-check me-1"></i>Tombol Primary
                                </button>
                                <button class="btn btn-success me-2">
                                    <i class="fas fa-check me-1"></i>Tombol Success
                                </button>
                                <button class="btn btn-danger">
                                    <i class="fas fa-times me-1"></i>Tombol Danger
                                </button>
                            </div>

                            <div class="row mt-4">
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Card 1</h6>
                                            <p class="text-muted">Contoh card dengan tema ini</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Card 2</h6>
                                            <p class="text-muted">Contoh card dengan tema ini</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Card 3</h6>
                                            <p class="text-muted">Contoh card dengan tema ini</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Info:</strong> Ini adalah preview. Perubahan yang Anda lihat di sini akan diterapkan setelah Anda mengklik "Terapkan Tema" di halaman kelola tema.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>{{ $currentTenant->name ?? 'Sistem Informasi' }}</h5>
                    <p class="mb-0">Preview tema untuk halaman publik</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">
                        <i class="fas fa-copyright me-1"></i>
                        {{ date('Y') }} {{ $currentTenant->name ?? 'Sistem Informasi' }}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    @if($theme->custom_js)
    <script>
        {!! $theme->custom_js !!}
    </script>
    @endif
</body>
</html>

