@extends('layouts.tenant')

@section('title', 'Kelas yang Diampu - ' . $teacher->name)
@section('page-title', 'Kelas yang Diampu')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Kelas yang Diampu - {{ $teacher->name }}</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('teachers.show', $teacher) }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali ke Detail
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if($teacher->classes && $teacher->classes->count() > 0)
                    <div class="row">
                        @foreach($teacher->classes as $class)
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card border h-100">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="avatar-lg bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                            {{ substr($class->name, 0, 1) }}
                                        </div>
                                        <div>
                                            <h5 class="card-title mb-0">{{ $class->name }}</h5>
                                            <p class="card-text text-muted">{{ $class->description ?? 'Kelas' }}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        @if($class->grade)
                                            <span class="badge bg-primary mb-2">{{ $class->grade }}</span>
                                        @endif
                                        
                                        @if($class->capacity)
                                            <p class="card-text">
                                                <small>
                                                    <i class="fas fa-users me-1"></i>
                                                    Kapasitas: {{ $class->capacity }} siswa
                                                </small>
                                            </p>
                                        @endif
                                        
                                        @if($class->room)
                                            <p class="card-text">
                                                <small>
                                                    <i class="fas fa-door-open me-1"></i>
                                                    Ruangan: {{ $class->room }}
                                                </small>
                                            </p>
                                        @endif
                                        
                                        @if($class->academic_year)
                                            <p class="card-text">
                                                <small>
                                                    <i class="fas fa-calendar me-1"></i>
                                                    Tahun Ajaran: {{ $class->academic_year }}
                                                </small>
                                            </p>
                                        @endif
                                    </div>
                                </div>
                                
                                <div class="card-footer bg-transparent">
                                    <div class="btn-group w-100" role="group">
                                        <a href="{{ tenant_route('classes.show', $class) }}" class="btn btn-outline-primary btn-sm">
                                            <i class="fas fa-eye me-1"></i>
                                            Detail
                                        </a>
                                        <a href="{{ tenant_route('classes.students', $class) }}" class="btn btn-outline-success btn-sm">
                                            <i class="fas fa-users me-1"></i>
                                            Siswa
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-chalkboard fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada kelas yang diampu</h5>
                        <p class="text-muted">Guru ini belum ditugaskan untuk mengampu kelas apapun</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Informasi Guru</h5>
            </div>
            <div class="card-body">
                <div class="text-center mb-3">
                    <div class="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                        {{ substr($teacher->name, 0, 1) }}
                    </div>
                    <h5 class="mt-2 mb-0">{{ $teacher->name }}</h5>
                    <p class="text-muted">{{ $teacher->subject_specialization ?? 'Guru' }}</p>
                </div>
                
                <div class="info-item mb-3">
                    <label class="form-label fw-bold">Total Kelas:</label>
                    <p class="mb-0">{{ $teacher->classes ? $teacher->classes->count() : 0 }} kelas</p>
                </div>
                
                <div class="info-item mb-3">
                    <label class="form-label fw-bold">Spesialisasi:</label>
                    <p class="mb-0">{{ $teacher->subject_specialization ?? '-' }}</p>
                </div>
                
                <div class="info-item mb-3">
                    <label class="form-label fw-bold">Status:</label>
                    <p class="mb-0">
                        <span class="badge bg-{{ $teacher->is_active ? 'success' : 'danger' }}">
                            {{ $teacher->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="card-title">Aksi</h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    <a href="{{ tenant_route('teachers.show', $teacher) }}" class="btn btn-primary">
                        <i class="fas fa-user me-2"></i>
                        Detail Guru
                    </a>
                    <a href="{{ tenant_route('teachers.schedules', $teacher) }}" class="btn btn-info">
                        <i class="fas fa-calendar me-2"></i>
                        Lihat Jadwal
                    </a>
                    <a href="{{ tenant_route('teachers.edit', $teacher) }}" class="btn btn-warning">
                        <i class="fas fa-edit me-2"></i>
                        Edit Data
                    </a>
                </div>
            </div>
        </div>
        
        @if($teacher->classes && $teacher->classes->count() > 0)
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="card-title">Statistik Kelas</h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-6">
                        <div class="border-end">
                            <h4 class="text-success">{{ $teacher->classes->count() }}</h4>
                            <p class="text-muted mb-0">Total Kelas</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <h4 class="text-info">{{ $teacher->subjects ? $teacher->subjects->count() : 0 }}</h4>
                        <p class="text-muted mb-0">Mata Pelajaran</p>
                    </div>
                </div>
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
