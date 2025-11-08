@extends('layouts.admin')

@section('title', 'Detail Tenant - ' . $tenant->name)
@section('page-title', 'Detail Tenant')

@include('components.admin-modern-styles')

@push('styles')
<style>
    /* Tenant Detail Page Styles */
    .tenant-hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 1rem !important;
        padding: 2.5rem !important;
        color: white !important;
        margin-bottom: 2rem !important;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3) !important;
    }
    
    .tenant-logo {
        width: 120px;
        height: 120px;
        border-radius: 1rem;
        object-fit: cover;
        border: 4px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.5rem;
        color: white;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease;
    }
    
    .tenant-logo:hover {
        transform: scale(1.05);
    }
    
    .stat-card {
        background: white !important;
        border-radius: 1rem !important;
        padding: 1.75rem !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
        transition: all 0.3s ease !important;
        border-left: 4px solid !important;
        height: 100% !important;
        position: relative !important;
        overflow: hidden !important;
    }
    
    .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-8px) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
    }
    
    .stat-card:hover::before {
        opacity: 1 !important;
    }
    
    .stat-card.primary { border-left-color: #3b82f6; }
    .stat-card.success { border-left-color: #10b981; }
    .stat-card.warning { border-left-color: #f59e0b; }
    .stat-card.info { border-left-color: #06b6d4; }
    .stat-card.purple { border-left-color: #8b5cf6; }
    .stat-card.pink { border-left-color: #ec4899; }
    
    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1rem;
    }
    
    .stat-card.primary .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .stat-card.success .stat-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .stat-card.warning .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .stat-card.info .stat-icon { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }
    .stat-card.purple .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
    .stat-card.pink .stat-icon { background: linear-gradient(135deg, #ec4899, #db2777); color: white; }
    
    .info-card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }
    
    .info-card .card-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-bottom: 2px solid #dee2e6;
        padding: 1.25rem 1.5rem;
    }
    
    .info-item {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
    }
    
    .info-item:last-child {
        border-bottom: none;
    }
    
    .info-item-label {
        font-weight: 600;
        color: #495057;
        min-width: 150px;
        display: flex;
        align-items: center;
    }
    
    .info-item-label i {
        margin-right: 0.5rem;
        color: #6c757d;
        width: 20px;
    }
    
    .info-item-value {
        color: #212529;
        flex: 1;
    }
    
    .info-item-value a {
        color: #3b82f6;
        transition: color 0.2s ease;
    }
    
    .info-item-value a:hover {
        color: #2563eb;
    }
    
    .user-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        height: 100%;
    }
    
    .user-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
        background: #f8f9fa;
        transition: all 0.3s ease;
    }
    
    .user-item:hover {
        background: #e9ecef;
        transform: translateX(5px);
    }
    
    .user-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        margin-right: 1rem;
        font-size: 1.1rem;
    }
    
    .feature-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
        height: 100%;
        border: 2px solid transparent;
    }
    
    .feature-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        border-color: #3b82f6 !important;
        text-decoration: none !important;
        color: inherit !important;
    }
    
    .feature-icon {
        width: 60px;
        height: 60px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .badge-modern {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }
    
    .btn-modern {
        border-radius: 0.75rem;
        padding: 0.625rem 1.25rem;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
    }
    
    .btn-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .tab-content {
        padding: 1.5rem;
    }
    
    .nav-tabs .nav-link {
        border: none;
        border-bottom: 3px solid transparent;
        color: #6c757d;
        font-weight: 600;
        padding: 1rem 1.5rem;
        transition: all 0.3s ease;
    }
    
    .nav-tabs .nav-link:hover {
        border-bottom-color: #dee2e6;
        color: #495057;
    }
    
    .nav-tabs .nav-link.active {
        border-bottom-color: #3b82f6;
        color: #3b82f6;
        background: transparent;
    }
    
    /* Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .tenant-hero {
        animation: fadeInUp 0.6s ease-out !important;
    }
    
    .stat-card {
        animation: fadeInUp 0.6s ease-out !important;
        animation-fill-mode: both !important;
    }
    
    .stat-card:nth-child(1) { animation-delay: 0.1s !important; }
    .stat-card:nth-child(2) { animation-delay: 0.2s !important; }
    .stat-card:nth-child(3) { animation-delay: 0.3s !important; }
    .stat-card:nth-child(4) { animation-delay: 0.4s !important; }
    
    .info-card, .user-card {
        animation: fadeInUp 0.6s ease-out 0.5s both !important;
    }
    
    /* Improved info items */
    .info-item {
        transition: background-color 0.2s ease;
    }
    
    .info-item:hover {
        background-color: #f8f9fa;
    }
    
    /* Better feature cards */
    .feature-card {
        position: relative;
        overflow: hidden;
    }
    
    .feature-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s ease;
    }
    
    .feature-card:hover::after {
        left: 100%;
    }
    
    /* Responsive improvements */
    @media (max-width: 768px) {
        .tenant-hero {
            padding: 1.5rem;
        }
        
        .tenant-logo {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
        }
        
        .stat-card {
            margin-bottom: 1rem;
        }
        
        .info-item {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .info-item-label {
            min-width: auto;
            margin-bottom: 0.5rem;
        }
    }
</style>
@endpush

@section('content')
<!-- Hero Section -->
<div class="tenant-hero">
    <div class="row align-items-center">
        <div class="col-md-8">
            <div class="d-flex align-items-center mb-3">
                @if($tenant->logo)
                    <img src="{{ Storage::url($tenant->logo) }}" alt="{{ $tenant->name }}" class="tenant-logo me-4">
                @else
                    <div class="tenant-logo me-4">
                        <i class="fas fa-building"></i>
                    </div>
                @endif
                <div>
                    <h2 class="mb-1" style="font-weight: 700; font-size: 2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{ $tenant->name }}</h2>
                    <p class="mb-0" style="opacity: 0.95; font-size: 1.1rem; font-weight: 500;">
                        <i class="fas fa-fingerprint me-2"></i>
                        NPSN: <code style="background: rgba(255,255,255,0.25); padding: 0.35rem 0.65rem; border-radius: 0.35rem; font-weight: 600; font-size: 1rem;">{{ $tenant->npsn }}</code>
                    </p>
                </div>
            </div>
            <div class="d-flex align-items-center flex-wrap gap-3">
                @if($tenant->is_active)
                    <span class="badge-modern" style="background: rgba(16, 185, 129, 0.3); color: white;">
                        <i class="fas fa-check-circle me-1"></i> Aktif
                    </span>
                @else
                    <span class="badge-modern" style="background: rgba(239, 68, 68, 0.3); color: white;">
                        <i class="fas fa-times-circle me-1"></i> Tidak Aktif
                    </span>
                @endif
                @if($tenant->subscription_plan)
                    <span class="badge-modern" style="background: rgba(59, 130, 246, 0.3); color: white;">
                        <i class="fas fa-crown me-1"></i> {{ ucfirst($tenant->subscription_plan) }}
                    </span>
                @endif
                @if($tenant->type_tenant)
                    <span class="badge-modern" style="background: rgba(139, 92, 246, 0.3); color: white;">
                        <i class="fas fa-tag me-1"></i> {{ ucfirst($tenant->type_tenant) }}
                    </span>
                @endif
                @if($tenant->jenjang)
                    <span class="badge-modern" style="background: rgba(236, 72, 153, 0.3); color: white;">
                        <i class="fas fa-graduation-cap me-1"></i> {{ $tenant->jenjang }}
                    </span>
                @endif
            </div>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end">
                <a href="{{ route('admin.tenants.edit', $tenant) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Ubah
                </a>
                @if($tenant->is_active)
                    <form action="{{ route('admin.tenants.deactivate', $tenant) }}" method="POST" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-modern" style="background: rgba(239, 68, 68, 0.3); color: white; backdrop-filter: blur(10px);" onclick="return confirm('Yakin ingin menonaktifkan tenant ini?')">
                            <i class="fas fa-ban me-2"></i> Nonaktifkan
                        </button>
                    </form>
                @else
                    <form action="{{ route('admin.tenants.activate', $tenant) }}" method="POST" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-modern" style="background: rgba(16, 185, 129, 0.3); color: white; backdrop-filter: blur(10px);">
                            <i class="fas fa-check me-2"></i> Aktifkan
                        </button>
                    </form>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card primary">
            <div class="stat-icon">
                <i class="fas fa-users"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($tenant->users_count ?? 0) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total User</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card success">
            <div class="stat-icon">
                <i class="fas fa-user-graduate"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($tenant->students_count ?? 0) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Siswa</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card warning">
            <div class="stat-icon">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($tenant->teachers_count ?? 0) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Guru</p>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card info">
            <div class="stat-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 1.5rem;">
                @if($tenant->subscription_expires_at)
                    {{ \Carbon\Carbon::parse($tenant->subscription_expires_at)->diffForHumans() }}
                @else
                    <span style="font-size: 1.2rem;">-</span>
                @endif
            </h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Langganan Berakhir</p>
        </div>
    </div>
</div>

<div class="row">
    <!-- Main Information -->
    <div class="col-lg-8 mb-4">
        <div class="info-card">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Detail
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </div>
                    <div class="info-item-value">
                        @if($tenant->email)
                            <a href="mailto:{{ $tenant->email }}" class="text-decoration-none">{{ $tenant->email }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-phone"></i>
                        Telepon
                    </div>
                    <div class="info-item-value">
                        @if($tenant->phone)
                            <a href="tel:{{ $tenant->phone }}" class="text-decoration-none">{{ $tenant->phone }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-globe"></i>
                        Website
                    </div>
                    <div class="info-item-value">
                        @if($tenant->website)
                            <a href="{{ $tenant->website }}" target="_blank" class="text-decoration-none">
                                {{ $tenant->website }}
                                <i class="fas fa-external-link-alt ms-1" style="font-size: 0.75rem;"></i>
                            </a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                @if($tenant->custom_domain)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-link"></i>
                        Domain Kustom
                    </div>
                    <div class="info-item-value">
                        <a href="https://{{ $tenant->custom_domain }}" target="_blank" class="text-decoration-none">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ $tenant->custom_domain }}</code>
                            <i class="fas fa-external-link-alt ms-1" style="font-size: 0.75rem;"></i>
                        </a>
                    </div>
                </div>
                @endif
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-globe-americas"></i>
                        Domain Tenant
                    </div>
                    <div class="info-item-value">
                        <a href="https://{{ $tenant->domain }}" target="_blank" class="text-decoration-none">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ $tenant->domain }}</code>
                            <i class="fas fa-external-link-alt ms-1" style="font-size: 0.75rem;"></i>
                        </a>
                    </div>
                </div>
                @if($tenant->address)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Alamat
                    </div>
                    <div class="info-item-value">
                        <div>
                            <div>{{ $tenant->address }}</div>
                            @if($tenant->city || $tenant->province || $tenant->postal_code)
                                <small class="text-muted">
                                    {{ $tenant->city }}{{ $tenant->city && $tenant->province ? ', ' : '' }}
                                    {{ $tenant->province }}{{ $tenant->postal_code ? ' ' . $tenant->postal_code : '' }}
                                </small>
                            @endif
                        </div>
                    </div>
                </div>
                @endif
                @if($tenant->subscription_expires_at)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-clock"></i>
                        Berakhir Pada
                    </div>
                    <div class="info-item-value">
                        <strong>{{ \App\Helpers\DateHelper::formatIndonesian($tenant->subscription_expires_at) }}</strong>
                        <small class="text-muted ms-2">
                            ({{ \Carbon\Carbon::parse($tenant->subscription_expires_at)->diffForHumans() }})
                        </small>
                    </div>
                </div>
                @endif
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-plus"></i>
                        Dibuat
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($tenant->created_at) }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Users -->
    <div class="col-lg-4 mb-4">
        <div class="user-card">
            <h5 class="mb-3" style="font-weight: 700; color: #495057;">
                <i class="fas fa-users me-2 text-primary"></i>
                User Terbaru
            </h5>
            @if($tenant->users && $tenant->users->count() > 0)
                <div>
                    @foreach($tenant->users->take(5) as $user)
                        <div class="user-item">
                            <div class="user-avatar">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-1" style="font-weight: 600; color: #212529;">{{ $user->name }}</h6>
                                <small class="text-muted d-block">{{ $user->email }}</small>
                            </div>
                            <span class="badge-modern {{ $user->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                                {{ $user->is_active ? 'Aktif' : 'Tidak Aktif' }}
                            </span>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="text-center py-4">
                    <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Tidak ada user ditemukan</p>
                </div>
            @endif
        </div>
    </div>
</div>

<!-- Management Features -->
<div class="row">
    <div class="col-12">
        <div class="info-card">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-cogs me-2 text-primary"></i>
                    Fitur Manajemen Tenant
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 col-sm-6 mb-3">
                        <a href="{{ route('admin.tenants.onboarding', $tenant) }}" class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Onboarding Wizard</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Setup awal tenant dan konfigurasi dasar</p>
                        </a>
                    </div>
                    
                    <div class="col-md-3 col-sm-6 mb-3">
                        <a href="{{ route('admin.tenants.resource-limits', $tenant) }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-chart-pie"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Resource Limits</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Batasan resource dan monitoring penggunaan</p>
                        </a>
                    </div>
                    
                    <div class="col-md-3 col-sm-6 mb-3">
                        <a href="{{ route('admin.tenants.activity-logs', $tenant) }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
                                <i class="fas fa-history"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Activity Logs</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Riwayat aktivitas dan audit trail</p>
                        </a>
                    </div>
                    
                    <div class="col-md-3 col-sm-6 mb-3">
                        <a href="{{ route('admin.tenants.health', $tenant) }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Health Monitoring</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Status kesehatan sistem tenant</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection