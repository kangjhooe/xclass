@extends('layouts.tenant')

@section('title', 'Detail Mata Pelajaran')
@section('page-title', 'Detail Mata Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-book me-3"></i>
                Detail Mata Pelajaran: {{ $subject->name }}
            </h2>
            <p>Informasi lengkap tentang mata pelajaran</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.subjects.edit', $subject) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.subjects.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="info-card fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0" style="font-weight: 700; color: #495057;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Mata Pelajaran
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-hashtag"></i>
                        Kode
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern bg-info" style="color: white;">{{ $subject->code }}</span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-book"></i>
                        Nama
                    </div>
                    <div class="info-item-value">
                        {{ $subject->name }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-layer-group"></i>
                        Level
                    </div>
                    <div class="info-item-value">
                        {{ $subject->level ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-tags"></i>
                        Kategori
                    </div>
                    <div class="info-item-value">
                        {{ $subject->category ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-graduation-cap"></i>
                        SKS
                    </div>
                    <div class="info-item-value">
                        {{ $subject->credits }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-check-circle"></i>
                        Status
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern {{ $subject->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                            {{ $subject->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </div>
                </div>
                @if($subject->description)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-align-left"></i>
                        Deskripsi
                    </div>
                    <div class="info-item-value">
                        {{ $subject->description }}
                    </div>
                </div>
                @endif
            </div>
        </div>
        
        <!-- Teachers Section -->
        @if($subject->teachers->count() > 0)
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-4">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chalkboard-teacher me-2 text-primary"></i>
                    Guru Pengajar
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    @foreach($subject->teachers as $teacher)
                        <div class="col-md-6 mb-3">
                            <div class="feature-card text-center" style="padding: 1.25rem;">
                                <div class="feature-icon" style="width: 50px; height: 50px; font-size: 1.5rem; margin: 0 auto 0.75rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <h6 class="mb-1" style="font-weight: 700;">{{ $teacher->name }}</h6>
                                @if($teacher->nip)
                                <p class="text-muted mb-1" style="font-size: 0.875rem;">
                                    <i class="fas fa-id-card me-1"></i>NIP: {{ $teacher->nip }}
                                </p>
                                @endif
                                @if($teacher->email)
                                <p class="text-muted mb-0" style="font-size: 0.875rem;">
                                    <i class="fas fa-envelope me-1"></i>{{ $teacher->email }}
                                </p>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-muted text-center">Belum ada guru yang mengajar mata pelajaran ini</p>
            @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chart-bar me-2 text-primary"></i>
                    Statistik
                </h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-6 mb-3">
                        <div class="stat-card primary" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #1e40af; font-size: 1.5rem;">{{ $subject->teachers->count() }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Guru</p>
                        </div>
                    </div>
                    <div class="col-6 mb-3">
                        <div class="stat-card success" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-door-open"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #047857; font-size: 1.5rem;">{{ $subject->classes->count() }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Kelas</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card info" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #0891b2; font-size: 1.5rem;">{{ $subject->schedules->count() }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Jadwal</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card warning" style="padding: 1rem; margin-bottom: 0;">
                            <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.25rem; margin: 0 auto 0.5rem;">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h4 class="mb-0" style="font-weight: 700; color: #d97706; font-size: 1.5rem;">{{ $subject->grades->count() }}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.75rem;">Nilai</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5>
                    <i class="fas fa-bolt me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('tenant.subjects.teachers', $subject) }}" class="btn btn-modern btn-primary">
                        <i class="fas fa-chalkboard-teacher me-2"></i> Kelola Guru
                    </a>
                    <a href="{{ tenant_route('tenant.schedules.index', ['subject' => $subject->id]) }}" class="btn btn-modern btn-info">
                        <i class="fas fa-calendar-alt me-2"></i> Lihat Jadwal
                    </a>
                    <a href="{{ tenant_route('tenant.grades.index', ['subject' => $subject->id]) }}" class="btn btn-modern btn-warning">
                        <i class="fas fa-chart-line me-2"></i> Lihat Nilai
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
