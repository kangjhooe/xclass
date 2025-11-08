@extends('layouts.tenant')

@section('title', 'Detail Data Guru')
@section('page-title', 'Detail Data Guru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chalkboard-teacher me-3"></i>
                Detail Guru: {{ $teacher->name }}
            </h2>
            <p>Informasi lengkap tentang guru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('teachers.edit', $teacher->nik) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('teachers.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Teacher Avatar Card -->
    <div class="col-lg-4 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-body text-center p-4">
                <div class="user-avatar mb-3" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    {{ strtoupper(substr($teacher->name, 0, 1)) }}
                </div>
                <h5 class="mb-1" style="font-weight: 700;">{{ $teacher->name }}</h5>
                <p class="text-muted mb-2">{{ $teacher->subject_specialization ?? 'Guru' }}</p>
                <span class="badge-modern {{ $teacher->is_active ? 'bg-success' : 'bg-danger' }}" style="color: white;">
                    {{ $teacher->is_active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
                
                @php
                    $additionalDuties = $teacher->activeAdditionalDuties;
                @endphp
                @if($additionalDuties && $additionalDuties->count() > 0)
                <div class="mt-3">
                    <small class="text-muted d-block mb-2"><strong>Tugas Tambahan:</strong></small>
                    <div class="d-flex flex-wrap gap-1 justify-content-center">
                        @foreach($additionalDuties->take(3) as $duty)
                            <span class="badge-modern bg-info" style="color: white; font-size: 0.75rem;">{{ $duty->name }}</span>
                        @endforeach
                        @if($additionalDuties->count() > 3)
                            <span class="badge-modern bg-secondary" style="color: white; font-size: 0.75rem;">+{{ $additionalDuties->count() - 3 }}</span>
                        @endif
                    </div>
                </div>
                @endif
            </div>
        </div>
        
        <!-- Action Card -->
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-bolt me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('teachers.edit', $teacher->nik) }}" class="btn btn-modern btn-warning">
                        <i class="fas fa-edit me-2"></i> Edit Data
                    </a>
                    <a href="{{ tenant_route('teachers.schedules', $teacher->nik) }}" class="btn btn-modern btn-info">
                        <i class="fas fa-calendar me-2"></i> Lihat Jadwal
                    </a>
                    <a href="{{ tenant_route('teachers.classes', $teacher->nik) }}" class="btn btn-modern btn-success">
                        <i class="fas fa-chalkboard me-2"></i> Lihat Kelas
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Statistics Card -->
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-chart-bar me-2 text-primary"></i>
                    Statistik
                </h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-6">
                        <div class="stat-card primary" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-door-open"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #1e40af; font-size: 1.5rem;">{{ $teacher->classes ? $teacher->classes->count() : 0 }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Kelas</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card success" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-book"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #047857; font-size: 1.5rem;">{{ $teacher->subjects ? $teacher->subjects->count() : 0 }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Mata Pelajaran</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Teacher Information -->
    <div class="col-lg-8 mb-4">
        <div class="info-card fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Guru
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </div>
                    <div class="info-item-value">
                        @if($teacher->email)
                            <a href="mailto:{{ $teacher->email }}" class="text-decoration-none">{{ $teacher->email }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-phone"></i>
                        No. Telepon
                    </div>
                    <div class="info-item-value">
                        @if($teacher->phone)
                            <a href="tel:{{ $teacher->phone }}" class="text-decoration-none">{{ $teacher->phone }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-venus-mars"></i>
                        Jenis Kelamin
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->gender ? ($teacher->gender == 'L' ? 'Laki-laki' : 'Perempuan') : '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-pray"></i>
                        Agama
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->religion ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-birthday-cake"></i>
                        Tanggal Lahir
                    </div>
                    <div class="info-item-value">
                        @if($teacher->birth_date)
                            {{ \App\Helpers\DateHelper::formatIndonesian($teacher->birth_date) }}
                            @if($teacher->birth_place)
                                di {{ $teacher->birth_place }}
                            @endif
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-graduation-cap"></i>
                        Pendidikan Terakhir
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->education_level ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-id-card"></i>
                        NIP
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->nip ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-hashtag"></i>
                        No. Pegawai
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->employee_number ?? '-' }}
                    </div>
                </div>
                @if($teacher->address)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Alamat
                    </div>
                    <div class="info-item-value">
                        {{ $teacher->address }}
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Kelas yang Diampu -->
@if($teacher->classes && $teacher->classes->count() > 0)
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chalkboard me-2 text-primary"></i>
                    Kelas yang Diampu
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    @foreach($teacher->classes as $class)
                    <div class="col-md-3 col-sm-6 mb-3">
                        <div class="feature-card text-center" style="padding: 1.25rem;">
                            <div class="feature-icon" style="width: 50px; height: 50px; font-size: 1.5rem; margin: 0 auto 0.75rem; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-door-open"></i>
                            </div>
                            <h6 class="mb-1" style="font-weight: 700;">{{ $class->name }}</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">{{ $class->description ?? 'Kelas' }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- Mata Pelajaran yang Diampu -->
@if($teacher->subjects && $teacher->subjects->count() > 0)
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-book me-2 text-primary"></i>
                    Mata Pelajaran yang Diampu
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    @foreach($teacher->subjects as $subject)
                    <div class="col-md-3 col-sm-6 mb-3">
                        <div class="feature-card text-center" style="padding: 1.25rem;">
                            <div class="feature-icon" style="width: 50px; height: 50px; font-size: 1.5rem; margin: 0 auto 0.75rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-book"></i>
                            </div>
                            <h6 class="mb-1" style="font-weight: 700;">{{ $subject->name }}</h6>
                            <p class="text-muted mb-0" style="font-size: 0.875rem;">{{ $subject->description ?? 'Mata Pelajaran' }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- Jadwal Mengajar -->
@if($teacher->schedules && $teacher->schedules->count() > 0)
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                    Jadwal Mengajar
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th>Hari</th>
                                <th>Jam</th>
                                <th>Kelas</th>
                                <th>Mata Pelajaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($teacher->schedules as $schedule)
                            <tr>
                                <td>{{ $schedule->day ?? '-' }}</td>
                                <td>{{ $schedule->start_time ?? '-' }} - {{ $schedule->end_time ?? '-' }}</td>
                                <td>{{ $schedule->classRoom->name ?? '-' }}</td>
                                <td>{{ $schedule->subject->name ?? '-' }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- History Log Section -->
@php
    $activityLogs = [];
    if (method_exists($teacher, 'activityLogs')) {
        $activityLogs = $teacher->activityLogs()
            ->with('user')
            ->latest()
            ->limit(20)
            ->get();
    }
@endphp

@if(count($activityLogs) > 0)
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-history me-2 text-primary"></i>
                    Riwayat Perubahan Data
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th>Tanggal & Waktu</th>
                                <th>Aksi</th>
                                <th>Oleh</th>
                                <th>Perubahan</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($activityLogs as $log)
                            <tr>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($log->created_at, true) }}</td>
                                <td>
                                    <span class="badge bg-{{ $log->action == 'create' ? 'success' : ($log->action == 'update' ? 'info' : 'danger') }}">
                                        {{ ucfirst($log->action) }}
                                    </span>
                                </td>
                                <td>{{ $log->user->name ?? '-' }}</td>
                                <td>
                                    @if($log->changes && count($log->changes) > 0)
                                        <button type="button" class="btn btn-sm btn-link p-0" data-bs-toggle="collapse" data-bs-target="#changes-{{ $log->id }}">
                                            {{ count($log->changes) }} field berubah
                                        </button>
                                        <div class="collapse mt-2" id="changes-{{ $log->id }}">
                                            <div class="card card-body">
                                                @foreach($log->changes as $field => $change)
                                                    <div class="mb-1">
                                                        <strong>{{ $field }}:</strong><br>
                                                        <span class="text-danger"><s>{{ is_array($change['old']) ? json_encode($change['old']) : ($change['old'] ?? '-') }}</s></span>
                                                        <i class="fas fa-arrow-right mx-2"></i>
                                                        <span class="text-success">{{ is_array($change['new']) ? json_encode($change['new']) : ($change['new'] ?? '-') }}</span>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    @else
                                        <small class="text-muted">-</small>
                                    @endif
                                    @if($log->description)
                                        <br><small class="text-muted">{{ $log->description }}</small>
                                    @endif
                                </td>
                                <td><small>{{ $log->ip_address ?? '-' }}</small></td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endif
@endsection
