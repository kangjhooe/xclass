@extends('layouts.admin')

@section('title', 'Super Admin Dashboard')
@section('page-title', 'Dashboard')

@include('components.admin-modern-styles')

@push('styles')
<style>
    /* Dashboard Admin Styles - Similar to Tenant Show Page */
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
    
    .tenant-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
        background: #f8f9fa;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
    }
    
    .tenant-item:hover {
        background: #e9ecef;
        transform: translateX(5px);
        text-decoration: none;
        color: inherit;
    }
    
    .tenant-avatar {
        width: 45px;
        height: 45px;
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
        text-align: center;
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
        margin: 0 auto 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
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
    
    .stat-card {
        animation: fadeInUp 0.6s ease-out !important;
        animation-fill-mode: both !important;
    }
    
    .stat-card:nth-child(1) { animation-delay: 0.1s !important; }
    .stat-card:nth-child(2) { animation-delay: 0.2s !important; }
    .stat-card:nth-child(3) { animation-delay: 0.3s !important; }
    .stat-card:nth-child(4) { animation-delay: 0.4s !important; }
    
    /* Responsive improvements */
    @media (max-width: 768px) {
        .stat-card {
            margin-bottom: 1rem;
        }
        
        .feature-card {
            margin-bottom: 1rem;
        }
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-tachometer-alt me-3"></i>
                Super Admin Dashboard
            </h2>
            <p>Overview sistem dan statistik global</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenants.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Tenant
            </a>
        </div>
    </div>
</div>

<!-- Global Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card primary">
            <div class="stat-icon">
                <i class="fas fa-building"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($stats['total_tenants']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Tenant</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card success">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($stats['active_tenants']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Tenant Aktif</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card warning">
            <div class="stat-icon">
                <i class="fas fa-user-shield"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($stats['total_admin_tenants']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Admin Users</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card info">
            <div class="stat-icon">
                <i class="fas fa-database"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 2rem;">{{ number_format($stats['total_backups']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Backup</p>
        </div>
    </div>
</div>

<!-- System Health Status -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-heartbeat me-2 text-primary"></i>
                    Status Kesehatan Sistem
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="fas fa-database fa-2x text-{{ $system_health['database_status'] === 'healthy' ? 'success' : 'danger' }}"></i>
                            </div>
                            <div>
                                <h6 class="mb-0">Database</h6>
                                <span class="badge bg-{{ $system_health['database_status'] === 'healthy' ? 'success' : 'danger' }}">
                                    {{ ucfirst($system_health['database_status']) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="fas fa-hdd fa-2x text-{{ $system_health['storage_status'] === 'healthy' ? 'success' : ($system_health['storage_status'] === 'warning' ? 'warning' : 'danger') }}"></i>
                            </div>
                            <div>
                                <h6 class="mb-0">Penyimpanan</h6>
                                <span class="badge bg-{{ $system_health['storage_status'] === 'healthy' ? 'success' : ($system_health['storage_status'] === 'warning' ? 'warning' : 'danger') }}">
                                    {{ ucfirst($system_health['storage_status']) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="fas fa-archive fa-2x text-{{ $system_health['backup_status'] === 'healthy' ? 'success' : 'warning' }}"></i>
                            </div>
                            <div>
                                <h6 class="mb-0">Backup</h6>
                                <span class="badge bg-{{ $system_health['backup_status'] === 'healthy' ? 'success' : 'warning' }}">
                                    {{ ucfirst($system_health['backup_status']) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="fas fa-exclamation-triangle fa-2x text-{{ $system_health['error_rate'] < 5 ? 'success' : ($system_health['error_rate'] < 10 ? 'warning' : 'danger') }}"></i>
                            </div>
                            <div>
                                <h6 class="mb-0">Tingkat Error</h6>
                                <span class="badge bg-{{ $system_health['error_rate'] < 5 ? 'success' : ($system_health['error_rate'] < 10 ? 'warning' : 'danger') }}">
                                    {{ $system_health['error_rate'] }}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-building me-2 text-primary"></i>
                    Tenant Terbaru
                </h5>
            </div>
            <div class="card-body p-0">
                @if($recent_tenants->count() > 0)
                    <div style="padding: 1rem;">
                        @foreach($recent_tenants as $tenant)
                            <a href="{{ route('admin.tenants.show', $tenant) }}" class="tenant-item">
                                <div class="tenant-avatar">
                                    <i class="fas fa-building"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1" style="font-weight: 600; color: #212529;">{{ $tenant->name }}</h6>
                                    <small class="text-muted d-block">{{ $tenant->npsn }}</small>
                                </div>
                                <span class="badge-modern {{ $tenant->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                                    {{ $tenant->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                </span>
                            </a>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-building fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Tidak ada tenant ditemukan</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-user-shield me-2 text-primary"></i>
                    Admin User Terbaru
                </h5>
            </div>
            <div class="card-body p-0">
                @if($recent_admin_tenants->count() > 0)
                    <div style="padding: 1rem;">
                        @foreach($recent_admin_tenants as $user)
                            <div class="user-item">
                                <div class="user-avatar">
                                    {{ strtoupper(substr($user->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1" style="font-weight: 600; color: #212529;">{{ $user->name }}</h6>
                                    <small class="text-muted d-block">{{ $user->email }}</small>
                                    @if($user->tenant)
                                        <small class="text-info d-block">
                                            <i class="fas fa-building me-1"></i>{{ $user->tenant->name }}
                                        </small>
                                    @endif
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
                        <p class="text-muted mb-0">Tidak ada admin user ditemukan</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Recent System Logs -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list-alt me-2 text-primary"></i>
                    Log Sistem Terbaru
                </h5>
            </div>
            <div class="card-body">
                @if($recent_logs->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Level</th>
                                    <th>Pesan</th>
                                    <th>User</th>
                                    <th>Tenant</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($recent_logs as $log)
                                    <tr>
                                        <td>{{ $log->created_at->format('H:i:s') }}</td>
                                        <td>
                                            <span class="badge {{ $log->level_badge_class }}">
                                                {{ strtoupper($log->level) }}
                                            </span>
                                        </td>
                                        <td>{{ Str::limit($log->message, 50) }}</td>
                                        <td>{{ $log->user ? $log->user->name : '-' }}</td>
                                        <td>{{ $log->tenant ? $log->tenant->name : '-' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <a href="{{ route('admin.logs') }}" class="btn btn-outline-primary btn-sm">
                            Lihat Semua Log
                        </a>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada log ditemukan</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-bolt me-2 text-primary"></i>
                    Aksi Cepat
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.tenants.create') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                                <i class="fas fa-plus"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Tambah Tenant</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Tambah tenant baru</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.users.create') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Tambah Admin</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Tambah admin user</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.backup') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-database"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Backup</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Kelola backup</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.statistics.index') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Statistik</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Lihat laporan</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.tenant-features.index') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Fitur</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Kelola fitur</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ route('admin.settings') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
                                <i class="fas fa-cog"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Pengaturan</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Pengaturan</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
