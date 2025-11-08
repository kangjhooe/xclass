@extends('layouts.tenant')

@section('title', 'Dashboard')
@section('page-title', 'Dashboard')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-tachometer-alt me-3"></i>
                Dashboard Utama
            </h2>
            <p>Ringkasan keseluruhan sistem sekolah Anda</p>
        </div>
    </div>
</div>

@if($currentAcademicYear)
    <div class="alert alert-info mb-4" style="border-radius: 12px; border: none;">
        <div class="d-flex align-items-center">
            <i class="fas fa-calendar-alt fa-2x me-3"></i>
            <div class="flex-grow-1">
                <h5 class="mb-1">
                    Tahun Pelajaran Aktif: <strong>{{ $currentAcademicYear->year_name }}</strong>
                </h5>
                <p class="mb-0">
                    Semester: <strong>{{ $currentAcademicYear->getSemesterName() }}</strong>
                    <span class="mx-2">|</span>
                    Periode: {{ \App\Helpers\DateHelper::formatIndonesian($currentAcademicYear->start_date) }} s/d {{ \App\Helpers\DateHelper::formatIndonesian($currentAcademicYear->end_date) }}
                </p>
            </div>
            @if(Auth::user()->role === 'school_admin')
                <a href="{{ tenant_route('tenant.academic-years.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-cog me-2"></i>
                    Kelola Tahun Pelajaran
                </a>
            @endif
        </div>
    </div>
@else
    @if(Auth::user()->role === 'school_admin')
        <div class="alert alert-warning mb-4" style="border-radius: 12px; border: none;">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Peringatan:</strong> Belum ada tahun pelajaran yang aktif. 
            <a href="{{ tenant_route('tenant.academic-years.create') }}" class="alert-link">Buat tahun pelajaran baru</a> atau 
            <a href="{{ tenant_route('tenant.academic-years.index') }}" class="alert-link">aktifkan tahun pelajaran yang ada</a>.
        </div>
    @endif
@endif

<!-- Statistik Cards -->
<div class="row mb-4">
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card success">
            <div class="stat-icon">
                <i class="fas fa-user-graduate"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($stats['total_students']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Siswa</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card primary">
            <div class="stat-icon">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($stats['total_teachers']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Guru</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card info">
            <div class="stat-icon">
                <i class="fas fa-door-open"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 2rem;">{{ number_format($stats['total_classes']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Kelas</p>
        </div>
    </div>
    
    <div class="col-md-3 col-sm-6 mb-3">
        <div class="stat-card warning">
            <div class="stat-icon">
                <i class="fas fa-book"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($stats['total_subjects']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Mata Pelajaran</p>
        </div>
    </div>
</div>

<!-- Recent Activities -->
<div class="row mt-4">
    <!-- Recent Students -->
    <div class="col-lg-6 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-user-graduate me-2 text-primary"></i>
                    Siswa Terbaru
                </h5>
            </div>
            <div class="card-body p-0">
                @if($recent_students->count() > 0)
                    <div style="padding: 1rem;">
                        @foreach($recent_students as $student)
                            <a href="{{ tenant_route('tenant.students.show', $student) }}" class="user-item text-decoration-none d-block">
                                <div class="user-avatar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                    {{ strtoupper(substr($student->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1" style="font-weight: 600; color: #212529;">{{ $student->name }}</h6>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-id-card me-1"></i>{{ $student->student_number ?? $student->nisn ?? 'Belum ada NISN' }}
                                    </small>
                                </div>
                                <span class="badge-modern {{ $student->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                                    {{ $student->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                </span>
                            </a>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-user-graduate fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Belum ada data siswa</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <!-- Recent Teachers -->
    <div class="col-lg-6 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chalkboard-teacher me-2 text-primary"></i>
                    Guru Terbaru
                </h5>
            </div>
            <div class="card-body p-0">
                @if($recent_teachers->count() > 0)
                    <div style="padding: 1rem;">
                        @foreach($recent_teachers as $teacher)
                            <a href="{{ tenant_route('tenant.teachers.show', $teacher) }}" class="user-item text-decoration-none d-block">
                                <div class="user-avatar" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                    {{ strtoupper(substr($teacher->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1" style="font-weight: 600; color: #212529;">{{ $teacher->name }}</h6>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-id-card me-1"></i>{{ $teacher->employee_number ?? $teacher->nip ?? 'Belum ada NIP' }}
                                    </small>
                                </div>
                                <span class="badge-modern {{ $teacher->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                                    {{ $teacher->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                </span>
                            </a>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-chalkboard-teacher fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Belum ada data guru</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Today Schedules -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    Jadwal Hari Ini
                </h5>
            </div>
            <div class="card-body">
                @if($today_schedules->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Guru</th>
                                    <th>Kelas</th>
                                    <th>Ruangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($today_schedules as $schedule)
                                <tr>
                                    <td>
                                        <span class="badge bg-primary">
                                            {{ $schedule->start_time->format('H:i') }} - {{ $schedule->end_time->format('H:i') }}
                                        </span>
                                    </td>
                                    <td>{{ $schedule->subject->name ?? '-' }}</td>
                                    <td>{{ $schedule->teacher->name ?? '-' }}</td>
                                    <td>
                                        <span class="badge bg-info">{{ $schedule->classRoom->name ?? '-' }}</span>
                                    </td>
                                    <td>{{ $schedule->room ?? '-' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Tidak ada jadwal hari ini</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
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
                        <a href="{{ tenant_route('tenant.students.create') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Tambah Siswa</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Tambah siswa baru</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ tenant_route('tenant.teachers.create') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Tambah Guru</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Tambah guru baru</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ tenant_route('tenant.classes.create') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-door-open"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Tambah Kelas</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Tambah kelas baru</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ tenant_route('tenant.data-pokok.index') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                <i class="fas fa-database"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Data Pokok</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Kelola data pokok</p>
                        </a>
                    </div>
                    <div class="col-md-2 col-sm-4 col-6 mb-3">
                        <a href="{{ tenant_route('tenant.reports.dashboard') }}" class="feature-card">
                            <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h6 class="mb-2" style="font-weight: 700;">Laporan</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">Lihat laporan</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
