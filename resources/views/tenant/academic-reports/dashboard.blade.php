@extends('layouts.tenant')

@section('title', 'Dashboard Laporan Akademik')
@section('page-title', 'Dashboard Laporan Akademik')

@push('styles')
<style>
    /* Modern Stats Cards */
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before {
        --card-color-1: #3b82f6;
        --card-color-2: #1d4ed8;
    }
    
    .stats-card.success::before {
        --card-color-1: #10b981;
        --card-color-2: #059669;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.info::before {
        --card-color-1: #06b6d4;
        --card-color-2: #0891b2;
    }
    
    .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }
    
    .stats-number {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0.5rem 0;
        color: #1f2937;
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .modern-card-header.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .modern-card-header.info {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: #fff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        text-decoration: none;
        color: #374151;
        transition: all 0.3s ease;
        display: block;
        position: relative;
        overflow: hidden;
    }
    
    .quick-action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }
    
    .quick-action-btn:hover::before {
        left: 100%;
    }
    
    .quick-action-btn:hover {
        border-color: #667eea;
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
        color: #667eea;
    }
    
    .quick-action-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        font-size: 20px;
        color: white;
    }
    
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
    }
    
    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .page-header p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
    }
    
    .semester-stat-box {
        background: #f9fafb;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
    }
    
    .semester-stat-box:hover {
        background: #fff;
        border-color: #667eea;
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1><i class="fas fa-chart-line me-3"></i>Dashboard Laporan Akademik</h1>
    <p>Ringkasan laporan dan statistik akademik sekolah</p>
</div>

<!-- Statistik Cards -->
<div class="row g-4 mb-4">
    <div class="col-xl-3 col-md-6">
        <div class="stats-card success">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Siswa</div>
                    <div class="stats-number text-success">{{ $totalStudents }}</div>
                    <small class="text-muted">Siswa aktif</small>
                </div>
                <div class="stats-icon success">
                    <i class="fas fa-user-graduate"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-xl-3 col-md-6">
        <div class="stats-card info">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Mata Pelajaran</div>
                    <div class="stats-number text-info">{{ $totalSubjects }}</div>
                    <small class="text-muted">Total mapel</small>
                </div>
                <div class="stats-icon info">
                    <i class="fas fa-book"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-xl-3 col-md-6">
        <div class="stats-card primary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Nilai</div>
                    <div class="stats-number text-primary">{{ $totalGrades }}</div>
                    <small class="text-muted">Data nilai</small>
                </div>
                <div class="stats-icon primary">
                    <i class="fas fa-chart-line"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-xl-3 col-md-6">
        <div class="stats-card warning">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Tahun Pelajaran</div>
                    <div class="stats-number text-warning" style="font-size: 1.5rem;">{{ $currentAcademicYear->year_name ?? 'Belum Diatur' }}</div>
                    <small class="text-muted">Tahun aktif</small>
                </div>
                <div class="stats-icon warning">
                    <i class="fas fa-calendar"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Semester Statistics -->
<div class="row g-4 mb-4">
    <!-- Semester 1 -->
    <div class="col-lg-6">
        <div class="modern-card">
            <div class="modern-card-header info">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Statistik Semester 1
                </h6>
            </div>
            <div class="card-body">
                <div class="row g-3 mb-3">
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h3 class="text-primary mb-2">{{ $semester1Stats['total_grades'] }}</h3>
                            <p class="mb-0 text-muted">Total Nilai</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h3 class="text-success mb-2">{{ number_format($semester1Stats['average_score'], 1) }}</h3>
                            <p class="mb-0 text-muted">Rata-rata</p>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row g-3">
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h4 class="text-success mb-2">{{ $semester1Stats['passed_count'] }}</h4>
                            <p class="mb-0 text-muted">Lulus</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h4 class="text-danger mb-2">{{ $semester1Stats['failed_count'] }}</h4>
                            <p class="mb-0 text-muted">Tidak Lulus</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Semester 2 -->
    <div class="col-lg-6">
        <div class="modern-card">
            <div class="modern-card-header success">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Statistik Semester 2
                </h6>
            </div>
            <div class="card-body">
                <div class="row g-3 mb-3">
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h3 class="text-primary mb-2">{{ $semester2Stats['total_grades'] }}</h3>
                            <p class="mb-0 text-muted">Total Nilai</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h3 class="text-success mb-2">{{ number_format($semester2Stats['average_score'], 1) }}</h3>
                            <p class="mb-0 text-muted">Rata-rata</p>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row g-3">
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h4 class="text-success mb-2">{{ $semester2Stats['passed_count'] }}</h4>
                            <p class="mb-0 text-muted">Lulus</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="semester-stat-box">
                            <h4 class="text-danger mb-2">{{ $semester2Stats['failed_count'] }}</h4>
                            <p class="mb-0 text-muted">Tidak Lulus</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-bolt me-2"></i>
                    Menu Cepat
                </h6>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.academic-years.index') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="fw-semibold">Kelola Tahun Pelajaran</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.student-grades.index') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="fw-semibold">Input Nilai Siswa</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.academic-reports.class-report') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="fw-semibold">Rekap Nilai per Kelas</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.academic-reports.student-report') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="fw-semibold">Rekap Nilai per Siswa</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
