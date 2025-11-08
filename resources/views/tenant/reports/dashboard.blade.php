@extends('layouts.tenant')

@section('title', 'Laporan')
@section('page-title', 'Laporan')

@section('content')
<div class="row">
    <div class="col-md-3">
        <div class="card stats-card">
            <div class="card-body text-center">
                <i class="fas fa-user-graduate fa-2x mb-3"></i>
                <h3 class="fw-bold">{{ $stats['total_students'] }}</h3>
                <p class="mb-0">Total Siswa</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card stats-card">
            <div class="card-body text-center">
                <i class="fas fa-chalkboard-teacher fa-2x mb-3"></i>
                <h3 class="fw-bold">{{ $stats['total_teachers'] }}</h3>
                <p class="mb-0">Total Guru</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card stats-card">
            <div class="card-body text-center">
                <i class="fas fa-door-open fa-2x mb-3"></i>
                <h3 class="fw-bold">{{ $stats['total_classes'] }}</h3>
                <p class="mb-0">Total Kelas</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card stats-card">
            <div class="card-body text-center">
                <i class="fas fa-book fa-2x mb-3"></i>
                <h3 class="fw-bold">{{ $stats['total_subjects'] }}</h3>
                <p class="mb-0">Total Mata Pelajaran</p>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-chart-line fa-3x text-primary mb-3"></i>
                <h4>Laporan Prestasi Akademik</h4>
                <p class="text-muted">Analisis performa akademik siswa</p>
                <a href="{{ tenant_route('tenant.reports.academic-performance') }}" class="btn btn-primary">
                    <i class="fas fa-eye me-2"></i>Lihat Laporan
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-clipboard-check fa-3x text-success mb-3"></i>
                <h4>Laporan Absensi</h4>
                <p class="text-muted">Data kehadiran siswa</p>
                <a href="{{ tenant_route('tenant.reports.attendance') }}" class="btn btn-success">
                    <i class="fas fa-eye me-2"></i>Lihat Laporan
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-user-graduate fa-3x text-info mb-3"></i>
                <h4>Laporan Prestasi Siswa</h4>
                <p class="text-muted">Performa individual siswa</p>
                <a href="{{ tenant_route('tenant.reports.student-performance') }}" class="btn btn-info">
                    <i class="fas fa-eye me-2"></i>Lihat Laporan
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-chalkboard-teacher fa-3x text-warning mb-3"></i>
                <h4>Laporan Beban Kerja Guru</h4>
                <p class="text-muted">Analisis beban mengajar guru</p>
                <a href="{{ tenant_route('tenant.reports.teacher-workload') }}" class="btn btn-warning">
                    <i class="fas fa-eye me-2"></i>Lihat Laporan
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-door-open fa-3x text-secondary mb-3"></i>
                <h4>Laporan Prestasi Kelas</h4>
                <p class="text-muted">Performa per kelas</p>
                <a href="{{ tenant_route('tenant.reports.class-performance') }}" class="btn btn-secondary">
                    <i class="fas fa-eye me-2"></i>Lihat Laporan
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
