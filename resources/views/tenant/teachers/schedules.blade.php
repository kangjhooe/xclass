@extends('layouts.tenant')

@section('title', 'Jadwal Mengajar - ' . $teacher->name)
@section('page-title', 'Jadwal Mengajar')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Jadwal Mengajar - {{ $teacher->name }}</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('teachers.show', $teacher) }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali ke Detail
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if($teacher->schedules && $teacher->schedules->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Hari</th>
                                    <th>Jam Mulai</th>
                                    <th>Jam Selesai</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Ruangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($teacher->schedules as $schedule)
                                <tr>
                                    <td>
                                        <span class="badge bg-primary">
                                            {{ $schedule->day ?? '-' }}
                                        </span>
                                    </td>
                                    <td>{{ $schedule->start_time ?? '-' }}</td>
                                    <td>{{ $schedule->end_time ?? '-' }}</td>
                                    <td>{{ $schedule->classRoom->name ?? '-' }}</td>
                                    <td>{{ $schedule->subject->name ?? '-' }}</td>
                                    <td>{{ $schedule->room ?? '-' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada jadwal mengajar</h5>
                        <p class="text-muted">Jadwal mengajar untuk guru ini belum diatur</p>
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
                    <label class="form-label fw-bold">Total Jadwal:</label>
                    <p class="mb-0">{{ $teacher->schedules ? $teacher->schedules->count() : 0 }} sesi</p>
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
                    <a href="{{ tenant_route('teachers.classes', $teacher) }}" class="btn btn-success">
                        <i class="fas fa-chalkboard me-2"></i>
                        Lihat Kelas
                    </a>
                    <a href="{{ tenant_route('teachers.edit', $teacher) }}" class="btn btn-warning">
                        <i class="fas fa-edit me-2"></i>
                        Edit Data
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
