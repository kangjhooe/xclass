<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Dashboard') - {{ tenant_name() }}</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Favicon -->
    @if(tenant_favicon())
        <link rel="icon" type="image/x-icon" href="{{ tenant_favicon() }}">
    @else
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    @endif
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Quill.js CSS -->
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    
    <style>
        * {
            --sidebar-width: 270px;
            --sidebar-collapsed-width: 80px;
        }
        
        body {
            overflow-x: hidden;
        }
        
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: var(--sidebar-width);
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .sidebar::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
            pointer-events: none;
        }
        
        .sidebar::-webkit-scrollbar {
            width: 8px;
        }
        
        .sidebar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            transition: background 0.2s ease;
        }
        
        .sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.35);
        }
        
        /* Sidebar Header */
        .sidebar-header {
            position: relative;
            padding: 1.5rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            margin-bottom: 1rem;
            z-index: 1;
        }
        
        .sidebar-header .logo-wrapper {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.3s ease;
        }
        
        .sidebar-header .logo-wrapper img {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            object-fit: contain;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%);
            padding: 4px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            flex-shrink: 0;
        }
        
        .sidebar-header .logo-wrapper i {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            flex-shrink: 0;
        }
        
        .sidebar-header .tenant-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        /* Search Box */
        .sidebar-search {
            padding: 0 1rem 1rem;
            position: relative;
        }
        
        .sidebar-search input {
            width: 100%;
            padding: 0.6rem 0.75rem 0.6rem 2.5rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #ffffff;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .sidebar-search input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .sidebar-search input:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .sidebar-search i {
            position: absolute;
            left: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 1;
        }
        
        /* Navigation Menu */
        .sidebar .nav {
            padding: 0 0.75rem;
        }
        
        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.75);
            padding: 0.75rem 1rem;
            border-radius: 12px;
            margin: 0.15rem 0;
            white-space: nowrap;
            display: flex;
            align-items: center;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            font-size: 0.9rem;
            font-weight: 500;
            text-decoration: none;
        }
        
        .sidebar .nav-link i {
            width: 20px;
            text-align: center;
            margin-right: 0.75rem;
            font-size: 1.1rem;
            transition: transform 0.25s ease;
        }
        
        .sidebar .nav-link:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
            padding-left: 1.25rem;
        }
        
        .sidebar .nav-link:hover i {
            transform: scale(1.1);
            color: #60a5fa;
        }
        
        .sidebar .nav-link.active {
            color: #ffffff;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(147, 51, 234, 0.25) 100%);
            border-left: 3px solid #60a5fa;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            font-weight: 600;
        }
        
        .sidebar .nav-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(180deg, #60a5fa 0%, #a78bfa 100%);
            border-radius: 0 3px 3px 0;
        }
        
        .sidebar .nav-link.active i {
            color: #60a5fa;
        }
        
        /* Menu Section Headers */
        .sidebar .menu-section {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 1rem 1rem 0.5rem;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .sidebar .menu-section::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
        }
        
        /* Dropdown menu styling for sidebar */
        .sidebar .dropdown-menu {
            background: rgba(15, 23, 42, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            margin-top: 0.5rem;
            padding: 0.5rem;
            backdrop-filter: blur(10px);
        }
        
        .sidebar .dropdown-item {
            color: rgba(255, 255, 255, 0.75);
            padding: 0.65rem 1rem;
            border-radius: 8px;
            margin: 0.1rem 0;
            transition: all 0.2s ease;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
        }
        
        .sidebar .dropdown-item i {
            width: 18px;
            margin-right: 0.75rem;
            font-size: 1rem;
        }
        
        .sidebar .dropdown-item:hover {
            color: #ffffff;
            background: rgba(59, 130, 246, 0.2);
            transform: translateX(4px);
        }
        
        .sidebar .dropdown-divider {
            border-color: rgba(255, 255, 255, 0.1);
            margin: 0.5rem 0;
        }
        
        .sidebar .dropdown-toggle::after {
            margin-left: auto;
            transition: transform 0.3s ease;
        }
        
        .sidebar .dropdown-toggle[aria-expanded="true"]::after {
            transform: rotate(180deg);
        }
        
        /* Badge/Notification Support */
        .sidebar .nav-link .badge {
            margin-left: auto;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
        
        /* Collapse Toggle Button */
        .sidebar-toggle {
            position: absolute;
            top: 1rem;
            right: -12px;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
            z-index: 1001;
        }
        
        .sidebar-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }
        
        /* Collapsed Sidebar State */
        .sidebar.collapsed {
            width: var(--sidebar-collapsed-width);
        }
        
        .sidebar.collapsed .sidebar-header .tenant-name,
        .sidebar.collapsed .nav-link span:not(.badge),
        .sidebar.collapsed .menu-section,
        .sidebar.collapsed .sidebar-search {
            opacity: 0;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
        }
        
        .sidebar.collapsed .nav-link {
            justify-content: center;
            padding: 0.75rem;
        }
        
        .sidebar.collapsed .nav-link i {
            margin-right: 0;
        }
        
        .sidebar.collapsed .dropdown-toggle::after {
            display: none;
        }
        
        .main-content {
            margin-left: var(--sidebar-width);
            background-color: #f8f9fa;
            min-height: 100vh;
            overflow-y: auto;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar.collapsed ~ .main-content {
            margin-left: var(--sidebar-collapsed-width);
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
            
            .sidebar-toggle {
                display: none;
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
        
        .mobile-menu-btn {
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
            border: none;
            color: white;
            padding: 12px;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
        }
        
        .mobile-menu-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }
        
        /* Menu Item Text Wrapper */
        .sidebar .nav-link > span:not(.badge) {
            transition: opacity 0.3s ease;
        }
        
        /* Quill Editor Styling */
        .ql-editor {
            min-height: 120px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .ql-toolbar {
            border-top: 1px solid #ccc;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            border-bottom: none;
            border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .ql-container {
            border-bottom: 1px solid #ccc;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            border-top: none;
            border-radius: 0 0 0.375rem 0.375rem;
        }
        
        .ql-editor.ql-blank::before {
            font-style: normal;
            color: #6c757d;
        }
        
        /* Custom styling for different editor contexts */
        #template-editor .ql-editor {
            min-height: 300px;
        }
        
        #content-editor .ql-editor {
            min-height: 400px;
        }
        
        #question-editor .ql-editor {
            min-height: 200px;
        }
        
        #explanation-editor .ql-editor {
            min-height: 150px;
        }
        
        #symptoms-editor .ql-editor,
        #diagnosis-editor .ql-editor,
        #treatment-editor .ql-editor,
        #medication-editor .ql-editor {
            min-height: 120px;
        }
        
        .essay-editor .ql-editor {
            min-height: 200px;
        }
        
        /* News Editor Styling */
        #news-content-editor .ql-editor {
            min-height: 400px;
        }
        
        #news-excerpt-editor .ql-editor {
            min-height: 150px;
        }
    </style>
    
    @stack('styles')
</head>
<body>
    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" onclick="toggleSidebar()">
        <i class="fas fa-bars"></i>
    </button>
    
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <button class="sidebar-toggle" onclick="toggleSidebarCollapse()" title="Collapse/Expand Sidebar">
            <i class="fas fa-angle-left"></i>
        </button>
        
        <div class="sidebar-header">
            <div class="logo-wrapper">
                @if(tenant_logo())
                    <img src="{{ tenant_logo() }}" 
                         alt="Logo" 
                         style="object-fit: contain;">
                @else
                    <i class="fas fa-school text-white"></i>
                @endif
                <div class="tenant-name">
                    {{ tenant_name() }}
                </div>
            </div>
        </div>
        
        <div class="sidebar-search">
            <i class="fas fa-search"></i>
            <input type="text" id="sidebarSearch" placeholder="Cari menu..." onkeyup="filterSidebarMenu(this.value)" autocomplete="off">
        </div>
                    
        <nav class="nav flex-column" id="sidebarNav">
            {{-- ======================================== --}}
            {{-- DASHBOARD --}}
            {{-- ======================================== --}}
            <a href="{{ tenant_route('tenant.dashboard') }}" class="nav-link {{ request()->routeIs('tenant.dashboard') ? 'active' : '' }}">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            
            {{-- ======================================== --}}
            {{-- DATA POKOK --}}
            {{-- Manajemen data dasar sekolah --}}
            {{-- ======================================== --}}
            <div class="menu-section">Data Pokok</div>
            
            <a href="{{ tenant_route('tenant.data-pokok.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.*') ? 'active' : '' }}">
                <i class="fas fa-database"></i>
                <span>Data Pokok</span>
            </a>
            
            <a href="{{ tenant_route('tenant.students.index') }}" class="nav-link {{ request()->routeIs('tenant.students.*') ? 'active' : '' }}">
                <i class="fas fa-user-graduate"></i>
                <span>Siswa</span>
            </a>
            
            <a href="{{ tenant_route('tenant.teachers.index') }}" class="nav-link {{ request()->routeIs('tenant.teachers.*') ? 'active' : '' }}">
                <i class="fas fa-chalkboard-teacher"></i>
                <span>Guru</span>
            </a>
            
            <a href="{{ tenant_route('tenant.classes.index') }}" class="nav-link {{ request()->routeIs('tenant.classes.*') ? 'active' : '' }}">
                <i class="fas fa-door-open"></i>
                <span>Kelas</span>
            </a>
            
            <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.non-teaching-staff.*') ? 'active' : '' }}">
                <i class="fas fa-users"></i>
                <span>Staf Non-Guru</span>
            </a>
            
            <a href="{{ tenant_route('tenant.cards.index') }}" class="nav-link {{ request()->routeIs('tenant.cards.*') ? 'active' : '' }}">
                <i class="fas fa-id-card"></i>
                <span>Kartu Tanda</span>
            </a>
            
            <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="nav-link {{ request()->routeIs('tenant.teacher-supervisions.*') ? 'active' : '' }}">
                <i class="fas fa-clipboard-check"></i>
                <span>Supervisi Guru</span>
            </a>
            
            <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="nav-link {{ request()->routeIs('tenant.additional-duties.*') ? 'active' : '' }}">
                <i class="fas fa-briefcase"></i>
                <span>Tugas Tambahan</span>
            </a>
            
            @if(\App\Helpers\RbacHelper::canManageMutasi(auth()->user()))
            <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.mutasi-siswa.*') ? 'active' : '' }}">
                <i class="fas fa-exchange-alt"></i>
                <span>Mutasi Siswa</span>
            </a>
            @endif
            
            {{-- ======================================== --}}
            {{-- AKADEMIK --}}
            {{-- Manajemen kegiatan akademik dan pembelajaran --}}
            {{-- ======================================== --}}
            <div class="menu-section">Akademik</div>
            
            <a href="{{ tenant_route('tenant.academic-years.index') }}" class="nav-link {{ request()->routeIs('tenant.academic-years.*') ? 'active' : '' }}">
                <i class="fas fa-calendar-alt"></i>
                <span>Tahun Pelajaran</span>
            </a>
            
            <a href="{{ tenant_route('tenant.subjects.index') }}" class="nav-link {{ request()->routeIs('tenant.subjects.*') ? 'active' : '' }}">
                <i class="fas fa-book-open"></i>
                <span>Mata Pelajaran</span>
            </a>
            
            <a href="{{ tenant_route('tenant.schedules.index') }}" class="nav-link {{ request()->routeIs('tenant.schedules.*') ? 'active' : '' }}">
                <i class="fas fa-calendar-week"></i>
                <span>Jadwal Pelajaran</span>
            </a>
            
            <a href="{{ tenant_route('tenant.student-grades.index') }}" class="nav-link {{ request()->routeIs('tenant.student-grades.*') ? 'active' : '' }}">
                <i class="fas fa-chart-line"></i>
                <span>Nilai Siswa</span>
            </a>
            
            <a href="{{ tenant_route('tenant.grade-weights.index') }}" class="nav-link {{ request()->routeIs('tenant.grade-weights.*') ? 'active' : '' }}">
                <i class="fas fa-balance-scale"></i>
                <span>Bobot Nilai</span>
            </a>
            
            <a href="{{ tenant_route('tenant.promotions.index') }}" class="nav-link {{ request()->routeIs('tenant.promotions.*') ? 'active' : '' }}">
                <i class="fas fa-arrow-up"></i>
                <span>Kenaikan Kelas</span>
            </a>
            
            {{-- Ujian Online --}}
            @if(auth()->user()->role === 'student')
                <a href="{{ tenant_route('tenant.exam.index') }}" class="nav-link {{ request()->routeIs('tenant.exam.*') ? 'active' : '' }}">
                    <i class="fas fa-clipboard-list"></i>
                    <span>Ujian Online</span>
                </a>
            @else
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.exam.*') ? 'active' : '' }}" 
                       href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Ujian Online</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.exams.index') }}">
                            <i class="fas fa-list me-2"></i>Daftar Ujian
                        </a></li>
                        <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.questions') }}">
                            <i class="fas fa-question-circle me-2"></i>Bank Soal
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.attempts.index') }}">
                            <i class="fas fa-chart-line me-2"></i>Hasil Ujian
                        </a></li>
                        <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.exams.create') }}">
                            <i class="fas fa-plus-circle me-2"></i>Buat Ujian Baru
                        </a></li>
                    </ul>
                </div>
            @endif
            
            <a href="{{ tenant_route('tenant.academic-reports.dashboard') }}" class="nav-link {{ request()->routeIs('tenant.academic-reports.*') ? 'active' : '' }}">
                <i class="fas fa-chart-bar"></i>
                <span>Laporan Akademik</span>
            </a>
            
            {{-- ======================================== --}}
            {{-- BIDANG KHUSUS --}}
            {{-- Program khusus di luar kurikulum inti --}}
            {{-- ======================================== --}}
            <div class="menu-section">Bidang Khusus</div>
            
            @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('counseling')))
            <a href="{{ tenant_route('tenant.counseling.index') }}" class="nav-link {{ request()->routeIs('tenant.counseling.*') ? 'active' : '' }}">
                <i class="fas fa-comments"></i>
                <span>Bimbingan Konseling</span>
            </a>
            @endif
            
            @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('discipline')))
            <a href="{{ tenant_route('tenant.discipline.index') }}" class="nav-link {{ request()->routeIs('tenant.discipline.*') ? 'active' : '' }}">
                <i class="fas fa-gavel"></i>
                <span>Kedisiplinan</span>
            </a>
            @endif
            
            <a href="{{ tenant_route('tenant.extracurricular.index') }}" class="nav-link {{ request()->routeIs('tenant.extracurricular.*') ? 'active' : '' }}">
                <i class="fas fa-running"></i>
                <span>Ekstrakurikuler</span>
            </a>
            
            <a href="{{ tenant_route('tenant.health.index') }}" class="nav-link {{ request()->routeIs('tenant.health.*') ? 'active' : '' }}">
                <i class="fas fa-heartbeat"></i>
                <span>Kesehatan</span>
            </a>
            
            {{-- ======================================== --}}
            {{-- SUMBER DAYA & FASILITAS --}}
            {{-- Manajemen sumber daya dan infrastruktur sekolah --}}
            {{-- ======================================== --}}
            <div class="menu-section">Sumber Daya & Fasilitas</div>
            
            <a href="{{ tenant_route('tenant.library.index') }}" class="nav-link {{ request()->routeIs('tenant.library.*') ? 'active' : '' }}">
                <i class="fas fa-book"></i>
                <span>Perpustakaan</span>
            </a>
            
            <a href="{{ tenant_route('tenant.spp.index') }}" class="nav-link {{ request()->routeIs('tenant.spp.*') ? 'active' : '' }}">
                <i class="fas fa-money-bill-wave"></i>
                <span>SPP & Keuangan</span>
            </a>
            
            {{-- SDM & HR --}}
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.hr.*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-users-cog"></i>
                    <span>SDM & HR</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.hr.employees') }}">
                        <i class="fas fa-user-tie me-2"></i>Karyawan
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.hr.payroll') }}">
                        <i class="fas fa-money-check-alt me-2"></i>Penggajian
                    </a></li>
                </ul>
            </div>
            
            @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('inventory')))
            <a href="{{ tenant_route('tenant.inventory.index') }}" class="nav-link {{ request()->routeIs('tenant.inventory.*') ? 'active' : '' }}">
                <i class="fas fa-boxes"></i>
                <span>Inventori & Aset</span>
            </a>
            @endif
            
            @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('facility')))
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('facility.*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-building"></i>
                    <span>Sarana Prasarana</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('facility.lands') }}">
                        <i class="fas fa-map me-2"></i>Lahan
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('facility.buildings') }}">
                        <i class="fas fa-building me-2"></i>Gedung
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('facility.rooms') }}">
                        <i class="fas fa-door-open me-2"></i>Ruangan
                    </a></li>
                </ul>
            </div>
            @endif
            
            <a href="{{ tenant_route('tenant.transportation.index') }}" class="nav-link {{ request()->routeIs('tenant.transportation.*') ? 'active' : '' }}">
                <i class="fas fa-bus"></i>
                <span>Transportasi</span>
            </a>
            
            <a href="{{ tenant_route('tenant.cafeteria.index') }}" class="nav-link {{ request()->routeIs('tenant.cafeteria.*') ? 'active' : '' }}">
                <i class="fas fa-utensils"></i>
                <span>Kafetaria</span>
            </a>
            
            @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('correspondence')))
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.letters.*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-envelope-open-text"></i>
                    <span>Persuratan</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.incoming.index') }}">
                        <i class="fas fa-inbox me-2"></i>Surat Masuk
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.outgoing.index') }}">
                        <i class="fas fa-paper-plane me-2"></i>Surat Keluar
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.templates.index') }}">
                        <i class="fas fa-file-alt me-2"></i>Template Surat
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.settings.number-settings.index') }}">
                        <i class="fas fa-cog me-2"></i>Pengaturan Nomor
                    </a></li>
                </ul>
            </div>
            @endif
            
            {{-- ======================================== --}}
            {{-- KEGIATAN & ADMINISTRASI --}}
            {{-- Manajemen kegiatan sekolah dan administrasi --}}
            {{-- ======================================== --}}
            <div class="menu-section">Kegiatan & Administrasi</div>
            
            <a href="{{ tenant_route('tenant.events.index') }}" class="nav-link {{ request()->routeIs('tenant.events.*') ? 'active' : '' }}">
                <i class="fas fa-calendar-check"></i>
                <span>Event & Agenda</span>
            </a>
            
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.guest-book.*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-book-reader"></i>
                    <span>Buku Tamu</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.guest-book.index') }}">
                        <i class="fas fa-list me-2"></i>Daftar Tamu
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.guest-book.create') }}">
                        <i class="fas fa-user-plus me-2"></i>Tambah Tamu
                    </a></li>
                </ul>
            </div>
            
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.ppdb.*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-graduate"></i>
                    <span>PPDB / SPMB</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.ppdb.index') }}">
                        <i class="fas fa-users me-2"></i>Data Pendaftar
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.ppdb.configuration') }}">
                        <i class="fas fa-cogs me-2"></i>Konfigurasi
                    </a></li>
                </ul>
            </div>
            
            <a href="{{ tenant_route('tenant.alumni.index') }}" class="nav-link {{ request()->routeIs('tenant.alumni.*') ? 'active' : '' }}">
                <i class="fas fa-graduation-cap"></i>
                <span>Alumni</span>
            </a>
            
            <a href="{{ tenant_route('tenant.graduation.index') }}" class="nav-link {{ request()->routeIs('tenant.graduation.*') ? 'active' : '' }}">
                <i class="fas fa-certificate"></i>
                <span>Pengumuman Kelulusan</span>
            </a>
            
            {{-- ======================================== --}}
            {{-- PENGATURAN & LAPORAN --}}
            {{-- Konfigurasi sistem dan laporan --}}
            {{-- ======================================== --}}
            <div class="menu-section">Pengaturan & Laporan</div>
            
            <a href="{{ tenant_route('tenant.attendances.index') }}" class="nav-link {{ request()->routeIs('tenant.attendances.*') ? 'active' : '' }}">
                <i class="fas fa-clipboard-check"></i>
                <span>Absensi</span>
            </a>
            
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.reports*') ? 'active' : '' }}" 
                   href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-chart-bar"></i>
                    <span>Laporan</span>
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.academic-performance') }}">
                        <i class="fas fa-graduation-cap me-2"></i>Prestasi Akademik
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.attendance') }}">
                        <i class="fas fa-calendar-check me-2"></i>Kehadiran
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.student-performance') }}">
                        <i class="fas fa-user-graduate me-2"></i>Prestasi Siswa
                    </a></li>
                    <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.teacher-workload') }}">
                        <i class="fas fa-chalkboard-teacher me-2"></i>Beban Kerja Guru
                    </a></li>
                </ul>
            </div>
            
            <a href="{{ tenant_route('settings.index') }}" class="nav-link {{ request()->routeIs('tenant.settings.*') || request()->routeIs('tenant.profile*') ? 'active' : '' }}">
                <i class="fas fa-school"></i>
                <span>Profil Instansi</span>
            </a>
            
            @if(auth()->user()->role === 'school_admin')
            <a href="{{ tenant_route('npsn-change-requests.index') }}" class="nav-link {{ request()->routeIs('tenant.npsn-change-requests.*') ? 'active' : '' }}">
                <i class="fas fa-id-card"></i>
                <span>Pengajuan Perubahan NPSN</span>
            </a>
            @endif
            
            <a href="{{ tenant_route('tenant.parent-portal.index') }}" class="nav-link {{ request()->routeIs('tenant.parent-portal.*') ? 'active' : '' }}">
                <i class="fas fa-user-friends"></i>
                <span>Portal Orang Tua</span>
            </a>
            
            {{-- ======================================== --}}
            {{-- HALAMAN PUBLIK --}}
            {{-- Manajemen konten website publik --}}
            {{-- ======================================== --}}
            <div class="menu-section">Halaman Publik</div>
            
            <a href="{{ tenant_route('tenant.public-page.profile.show') }}" class="nav-link {{ request()->routeIs('tenant.public-page.profile.*') ? 'active' : '' }}">
                <i class="fas fa-globe"></i>
                <span>Website Publik</span>
            </a>
            
            <a href="{{ tenant_route('admin.news.index') }}" class="nav-link {{ request()->routeIs('admin.news.*') || request()->routeIs('tenant.public-page.news.*') ? 'active' : '' }}">
                <i class="fas fa-newspaper"></i>
                <span>Berita</span>
            </a>
            
            <a href="{{ tenant_route('tenant.public-page.gallery.index') }}" class="nav-link {{ request()->routeIs('tenant.public-page.gallery.*') ? 'active' : '' }}">
                <i class="fas fa-images"></i>
                <span>Galeri</span>
            </a>
            
            <a href="{{ route('tenant.public.about', ['tenant' => request()->route('tenant')]) }}" class="nav-link {{ request()->routeIs('tenant.public.about') ? 'active' : '' }}">
                <i class="fas fa-info-circle"></i>
                <span>Tentang Kami</span>
            </a>
            
            <a href="{{ route('tenant.public.contact', ['tenant' => request()->route('tenant')]) }}" class="nav-link {{ request()->routeIs('tenant.public.contact') ? 'active' : '' }}">
                <i class="fas fa-envelope"></i>
                <span>Kontak</span>
            </a>
        </nav>
                </div>
        </div>
    </div>
    
    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    
    <!-- Main Content -->
    <div class="main-content">
                <!-- Top Navigation -->
                <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                    <div class="container-fluid">
                        <span class="navbar-brand mb-0 h1">@yield('page-title', 'Dashboard')</span>
                        
                        <div class="navbar-nav ms-auto">
                            <div class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-user me-1"></i>
                                    {{ Auth::user()->name }}
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <form action="{{ tenant_route('tenant.logout') }}" method="POST" class="d-inline">
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
                </nav>
                
                <!-- Page Content -->
                <div class="container-fluid p-4">
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
    <!-- Quill.js JS -->
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <!-- Quill Editor Custom JS -->
    <script src="{{ asset('js/quill-editor.js') }}"></script>
    
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
        
        function toggleSidebarCollapse() {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.querySelector('.sidebar-toggle i');
            
            sidebar.classList.toggle('collapsed');
            
            if (sidebar.classList.contains('collapsed')) {
                toggleBtn.classList.remove('fa-angle-left');
                toggleBtn.classList.add('fa-angle-right');
                localStorage.setItem('sidebarCollapsed', 'true');
            } else {
                toggleBtn.classList.remove('fa-angle-right');
                toggleBtn.classList.add('fa-angle-left');
                localStorage.setItem('sidebarCollapsed', 'false');
            }
        }
        
        function filterSidebarMenu(searchText) {
            const navLinks = document.querySelectorAll('#sidebarNav .nav-link, #sidebarNav .menu-section');
            const searchLower = searchText.toLowerCase();
            
            navLinks.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (item.classList.contains('menu-section')) {
                    // For section headers, show if any child matches
                    const parent = item;
                    const hasMatch = Array.from(parent.nextElementSibling ? 
                        parent.parentElement.querySelectorAll('.nav-link') : []).some(link => {
                        if (link.closest('.menu-section')?.nextElementSibling === parent) {
                            return link.textContent.toLowerCase().includes(searchLower);
                        }
                        return false;
                    });
                    item.style.display = (searchText === '' || hasMatch) ? '' : 'none';
                } else {
                    if (text.includes(searchLower) || searchText === '') {
                        item.style.display = '';
                        // Show parent sections
                        let prev = item.previousElementSibling;
                        while (prev && prev.classList.contains('menu-section')) {
                            prev.style.display = '';
                            prev = prev.previousElementSibling;
                        }
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }
        
        // Restore collapsed state from localStorage
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.querySelector('.sidebar-toggle i');
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            
            if (isCollapsed && window.innerWidth > 768) {
                sidebar.classList.add('collapsed');
                toggleBtn.classList.remove('fa-angle-left');
                toggleBtn.classList.add('fa-angle-right');
            }
        });
        
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
    
    @stack('scripts')
</body>
</html>
