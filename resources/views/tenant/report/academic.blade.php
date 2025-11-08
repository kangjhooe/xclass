@extends('layouts.tenant')

@section('title', 'Laporan Akademik')
@section('page-title', 'Laporan Akademik')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>
                        Laporan Akademik
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Statistics Cards -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_students'] }}</h4>
                                            <small>Total Siswa</small>
                                        </div>
                                        <i class="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['active_students'] }}</h4>
                                            <small>Siswa Aktif</small>
                                        </div>
                                        <i class="fas fa-user-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_classes'] }}</h4>
                                            <small>Total Kelas</small>
                                        </div>
                                        <i class="fas fa-door-open fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_subjects'] }}</h4>
                                            <small>Mata Pelajaran</small>
                                        </div>
                                        <i class="fas fa-book fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Student Distribution by Class -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Distribusi Siswa per Kelas</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($studentDistribution as $distribution)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $distribution->class_name ?? 'Belum ada kelas' }}</h6>
                                            <small class="text-muted">Kelas</small>
                                        </div>
                                        <div>
                                            <span class="badge bg-primary fs-6">{{ $distribution->student_count }} siswa</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada data distribusi siswa</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <!-- Grade Distribution -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Distribusi Nilai</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($gradeDistribution as $grade)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">Nilai {{ $grade->grade }}</h6>
                                            <small class="text-muted">Grade</small>
                                        </div>
                                        <div>
                                            <span class="badge bg-success fs-6">{{ $grade->count }} siswa</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada data nilai</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Aksi Cepat</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.students') }}" class="btn btn-primary w-100 mb-2">
                                                <i class="fas fa-users me-1"></i>
                                                Laporan Siswa
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.attendance') }}" class="btn btn-success w-100 mb-2">
                                                <i class="fas fa-calendar-check me-1"></i>
                                                Laporan Kehadiran
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.grades') }}" class="btn btn-info w-100 mb-2">
                                                <i class="fas fa-chart-line me-1"></i>
                                                Laporan Nilai
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'academic']) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
