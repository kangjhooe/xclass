@extends('layouts.tenant')

@section('title', 'Detail Tahun Pelajaran')
@section('page-title', 'Detail Tahun Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar-alt me-3"></i>
                Detail Tahun Pelajaran: {{ $academicYear->year_name }}
            </h2>
            <p>Informasi lengkap tentang tahun pelajaran</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.academic-years.edit', $academicYear) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.academic-years.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Tahun Pelajaran
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Nama Tahun Pelajaran</small>
                                    <strong>{{ $academicYear->year_name }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Status</small>
                                    @if($academicYear->is_active)
                                        <span class="badge-modern bg-success">Aktif</span>
                                    @else
                                        <span class="badge-modern bg-secondary">Tidak Aktif</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-check text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal Mulai</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->start_date) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-times text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Tanggal Selesai</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->end_date) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-clock text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Durasi</small>
                                    <strong>{{ $academicYear->start_date->diffInDays($academicYear->end_date) }} hari</strong>
                                </div>
                            </div>
                        </div>
                        @if($academicYear->is_active)
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-book-open text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Semester Aktif</small>
                                    @if($academicYear->current_semester == 1)
                                        <span class="badge-modern bg-primary">Ganjil</span>
                                    @else
                                        <span class="badge-modern bg-info">Genap</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @endif
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-plus text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Dibuat</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->created_at, true) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-edit text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Diperbarui</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->updated_at, true) }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-top">
                    <div class="d-flex flex-wrap gap-2">
                        @if($academicYear->is_active)
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-modern btn-primary dropdown-toggle" 
                                        data-bs-toggle="dropdown" 
                                        aria-expanded="false">
                                    <i class="fas fa-calendar-alt me-2"></i>
                                    Ubah Semester
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <form action="{{ tenant_route('tenant.academic-years.set-semester', $academicYear) }}" 
                                              method="POST" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="semester" value="1">
                                            <button type="submit" 
                                                    class="dropdown-item {{ $academicYear->current_semester == 1 ? 'active' : '' }}"
                                                    onclick="return confirm('Ubah semester aktif menjadi Ganjil?')">
                                                <i class="fas fa-check-circle me-2"></i>Ganjil
                                            </button>
                                        </form>
                                    </li>
                                    <li>
                                        <form action="{{ tenant_route('tenant.academic-years.set-semester', $academicYear) }}" 
                                              method="POST" class="d-inline">
                                            @csrf
                                            <input type="hidden" name="semester" value="2">
                                            <button type="submit" 
                                                    class="dropdown-item {{ $academicYear->current_semester == 2 ? 'active' : '' }}"
                                                    onclick="return confirm('Ubah semester aktif menjadi Genap?')">
                                                <i class="fas fa-check-circle me-2"></i>Genap
                                            </button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                        @endif
                        <a href="{{ tenant_route('tenant.academic-years.copy-data', $academicYear) }}" 
                           class="btn btn-modern btn-info">
                            <i class="fas fa-copy me-2"></i>
                            Copy Data dari Tahun Sebelumnya
                        </a>
                        @if(!$academicYear->is_active)
                            <form action="{{ tenant_route('tenant.academic-years.set-active', $academicYear) }}" 
                                  method="POST" class="d-inline">
                                @csrf
                                <button type="submit" class="btn btn-modern btn-success"
                                        onclick="return confirm('Aktifkan tahun pelajaran ini?')">
                                    <i class="fas fa-check me-2"></i>
                                    Aktifkan
                                </button>
                            </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-chart-bar me-2 text-primary"></i>
                    Statistik
                </h5>
            </div>
            <div class="card-body">
                <div class="stat-card primary mb-3">
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $academicYear->studentGrades->count() }}</h3>
                    <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Data Nilai</p>
                </div>
                
                <div class="stat-card success mb-3">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $academicYear->studentGrades->where('is_passed', true)->count() }}</h3>
                    <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Nilai Lulus</p>
                </div>
                
                <div class="stat-card warning mb-3">
                    <div class="stat-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $academicYear->studentGrades->where('is_passed', false)->count() }}</h3>
                    <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Nilai Tidak Lulus</p>
                </div>
                
                @if($academicYear->studentGrades->count() > 0)
                <div class="stat-card info">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="mb-1" style="font-weight: 700; color: #0891b2; font-size: 2rem;">{{ number_format($academicYear->studentGrades->avg('final_score'), 2) }}</h3>
                    <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Rata-rata Nilai</p>
                </div>
                @endif
            </div>
        </div>
        
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item mb-3">
                    <p class="mb-2">
                        <strong>Tahun pelajaran aktif</strong> akan digunakan sebagai default untuk input nilai dan jadwal baru.
                    </p>
                </div>
                @if($academicYear->is_active)
                <div class="info-item mb-3">
                    <p class="mb-2">
                        <strong>Semester aktif</strong> saat ini adalah <strong>
                            @if($academicYear->current_semester == 1)
                                Ganjil
                            @else
                                Genap
                            @endif
                        </strong>. Data yang ditampilkan dan input nilai baru akan otomatis menggunakan semester ini.
                    </p>
                </div>
                @endif
                <div class="info-item mb-0">
                    <p class="mb-0">
                        <strong>Durasi:</strong> {{ $academicYear->start_date->diffInDays($academicYear->end_date) }} hari
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
