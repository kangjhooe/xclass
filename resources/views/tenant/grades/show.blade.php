@extends('layouts.tenant')

@section('title', 'Detail Nilai')
@section('page-title', 'Detail Nilai')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chart-line me-3"></i>
                Detail Nilai
            </h2>
            <p>Informasi detail nilai siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.grades.edit', ['grade' => $grade->id]) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                                    <strong>{{ $grade->student->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-id-card text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">NIS</small>
                                    <strong>{{ $grade->student->nis ?? $grade->student->student_number ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-0">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-door-open text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Kelas</small>
                                    <strong>{{ $grade->student->classRoom->name ?? '-' }}</strong>
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
                    <i class="fas fa-chart-bar me-2 text-primary"></i>
                    Informasi Nilai
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-book text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Mata Pelajaran</small>
                                    <strong>{{ $grade->subject->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-chalkboard-teacher text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Guru</small>
                                    <strong>{{ $grade->teacher->name ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-tasks text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Jenis Tugas</small>
                                    <strong>{{ $grade->assignment_type ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-star text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Nilai</small>
                                    <strong style="font-size: 1.5rem; color: #667eea;">
                                        {{ $grade->score ?? 0 }} / {{ $grade->max_score ?? 100 }}
                                    </strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-percentage text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Persentase</small>
                                    <strong style="font-size: 1.5rem; color: #667eea;">
                                        @if($grade->max_score > 0)
                                            {{ number_format(($grade->score / $grade->max_score) * 100, 2) }}%
                                        @else
                                            0%
                                        @endif
                                    </strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-alt text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Semester</small>
                                    <strong>{{ $grade->semester ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-check text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tahun Pelajaran</small>
                                    <strong>{{ $grade->academic_year ?? '-' }}</strong>
                                </div>
                            </div>
                        </div>
                        @if($grade->notes)
                        <div class="col-12 mb-0">
                            <div class="d-flex align-items-start">
                                <i class="fas fa-sticky-note text-primary me-2 mt-1"></i>
                                <div>
                                    <small class="text-muted d-block">Keterangan</small>
                                    <p class="mb-0" style="line-height: 1.6;">{{ $grade->notes }}</p>
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
