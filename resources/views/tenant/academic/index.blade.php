@extends('layouts.tenant')

@section('title', 'Akademik')
@section('page-title', 'Akademik')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>
                        Manajemen Akademik
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('academic.curriculum') }}" class="btn btn-primary">
                                    <i class="fas fa-book me-1"></i>
                                    Kurikulum
                                </a>
                                <a href="{{ tenant_route('academic.syllabus') }}" class="btn btn-info">
                                    <i class="fas fa-list me-1"></i>
                                    Silabus
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari data akademik...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_curriculums'] }}</h4>
                                            <small>Total Kurikulum</small>
                                        </div>
                                        <i class="fas fa-book fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['active_curriculums'] }}</h4>
                                            <small>Kurikulum Aktif</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_syllabi'] }}</h4>
                                            <small>Total Silabus</small>
                                        </div>
                                        <i class="fas fa-list fa-2x opacity-75"></i>
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
                                        <i class="fas fa-graduation-cap fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Kurikulum Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentCurriculums as $curriculum)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $curriculum->name }}</h6>
                                            <small class="text-muted">{{ $curriculum->description }}</small>
                                        </div>
                                        <div>
                                            @if($curriculum->is_active)
                                                <span class="badge bg-success">Aktif</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak Aktif</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada kurikulum</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Silabus Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentSyllabi as $syllabus)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $syllabus->title }}</h6>
                                            <small class="text-muted">{{ $syllabus->subject->name ?? 'N/A' }} - {{ $syllabus->classRoom->name ?? 'N/A' }}</small>
                                        </div>
                                        <div>
                                            <span class="badge bg-primary">Silabus</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada silabus</p>
                                    @endforelse
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
