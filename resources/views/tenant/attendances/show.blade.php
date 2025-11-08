@extends('layouts.tenant')

@section('title', 'Detail Kehadiran')
@section('page-title', 'Detail Kehadiran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-eye me-3"></i>
                Detail Kehadiran
            </h2>
            <p>Informasi detail kehadiran siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.attendances.edit', ['attendance' => $attendance->id]) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.attendances.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-user me-2 text-primary"></i>
                    Informasi Siswa
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-user text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Nama Siswa</small>
                                    <strong>{{ $attendance->student->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-id-card text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">NIS</small>
                                    <strong>{{ $attendance->student->nis ?? $attendance->student->student_number ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-0">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-door-open text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Kelas</small>
                                    <strong>{{ $attendance->student->classRoom->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-calendar-check me-2 text-primary"></i>
                    Informasi Kehadiran
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal</small>
                                    <strong>{{ \Carbon\Carbon::parse($attendance->attendance_date)->format('d-m-Y') }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-book text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Mata Pelajaran</small>
                                    <strong>{{ $attendance->schedule->subject->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-chalkboard-teacher text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Guru</small>
                                    <strong>{{ $attendance->teacher->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Status</small>
                                    @if($attendance->status == 'present')
                                        <span class="badge-modern bg-success">Hadir</span>
                                    @elseif($attendance->status == 'absent')
                                        <span class="badge-modern bg-danger">Tidak Hadir</span>
                                    @elseif($attendance->status == 'late')
                                        <span class="badge-modern bg-warning">Terlambat</span>
                                    @elseif($attendance->status == 'excused')
                                        <span class="badge-modern bg-info">Izin</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @if($attendance->notes)
                        <div class="col-12 mb-0">
                            <div class="d-flex align-items-start">
                                <i class="fas fa-sticky-note text-primary me-2 mt-1"></i>
                                <div>
                                    <small class="text-muted d-block">Keterangan</small>
                                    <p class="mb-0" style="line-height: 1.6;">{{ $attendance->notes }}</p>
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
