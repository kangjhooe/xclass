@extends('layouts.tenant')

@section('title', 'Detail Jadwal')
@section('page-title', 'Detail Jadwal')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar-alt me-3"></i>
                Detail Jadwal Pelajaran
            </h2>
            <p>Informasi lengkap tentang jadwal</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.schedules.edit', ['schedule' => $schedule->id]) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                    Informasi Jadwal
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-door-open"></i>
                        Kelas
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->classRoom->name ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-book"></i>
                        Mata Pelajaran
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->subject->name ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-chalkboard-teacher"></i>
                        Guru
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->teacher->name ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-day"></i>
                        Hari
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->day ?? $schedule->time_start ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-clock"></i>
                        Waktu Mulai
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->start_time ?? $schedule->time_start ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-clock"></i>
                        Waktu Selesai
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->end_time ?? $schedule->time_end ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-building"></i>
                        Ruangan
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->room ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar"></i>
                        Tahun Pelajaran
                    </div>
                    <div class="info-item-value">
                        {{ $schedule->academic_year ?? '-' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

