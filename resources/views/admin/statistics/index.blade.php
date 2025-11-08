@extends('layouts.admin')

@section('title', 'Statistik & Laporan')
@section('page-title', 'Statistik & Laporan')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chart-bar me-3"></i>
                Statistik & Laporan
            </h2>
            <p>Overview statistik dan laporan sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="dropdown">
                <button type="button" class="btn btn-modern btn-success dropdown-toggle" data-bs-toggle="dropdown" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-download me-2"></i>Export Data
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="{{ route('admin.statistics.export', ['type' => 'overview', 'format' => 'excel']) }}">
                            <i class="fas fa-file-excel me-2"></i>Export Overview
                        </a></li>
                        <li><a class="dropdown-item" href="{{ route('admin.statistics.export', ['type' => 'institutions', 'format' => 'excel']) }}">
                            <i class="fas fa-file-excel me-2"></i>Export Institusi
                        </a></li>
                        <li><a class="dropdown-item" href="{{ route('admin.statistics.export', ['type' => 'students', 'format' => 'excel']) }}">
                            <i class="fas fa-file-excel me-2"></i>Export Siswa
                        </a></li>
                        <li><a class="dropdown-item" href="{{ route('admin.statistics.export', ['type' => 'teachers', 'format' => 'excel']) }}">
                            <i class="fas fa-file-excel me-2"></i>Export Guru
                        </a></li>
                        <li><a class="dropdown-item" href="{{ route('admin.statistics.export', ['type' => 'academic', 'format' => 'excel']) }}">
                            <i class="fas fa-file-excel me-2"></i>Export Akademik
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Overview Cards -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern primary fade-in-up fade-in-up-delay-1">
                <div class="stat-icon-modern">
                    <i class="fas fa-school"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($data['overview']['total_institutions']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Institusi</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern success fade-in-up fade-in-up-delay-2">
                <div class="stat-icon-modern">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($data['overview']['total_students']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Siswa</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern info fade-in-up fade-in-up-delay-3">
                <div class="stat-icon-modern">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 2rem;">{{ number_format($data['overview']['total_teachers']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Guru</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern warning fade-in-up fade-in-up-delay-4">
                <div class="stat-icon-modern">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($data['overview']['total_staff']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Staff</p>
            </div>
        </div>
    </div>

    <!-- Additional Stats -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern purple fade-in-up fade-in-up-delay-1">
                <div class="stat-icon-modern">
                    <i class="fas fa-door-open"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #6b21a8; font-size: 2rem;">{{ number_format($data['overview']['total_classrooms']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Kelas</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern pink fade-in-up fade-in-up-delay-2">
                <div class="stat-icon-modern">
                    <i class="fas fa-book"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #be185d; font-size: 2rem;">{{ number_format($data['overview']['total_subjects']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Mata Pelajaran</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern danger fade-in-up fade-in-up-delay-3">
                <div class="stat-icon-modern">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #991b1b; font-size: 2rem;">{{ number_format($data['overview']['total_exams']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Ujian</p>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="stat-card-modern primary fade-in-up fade-in-up-delay-4">
                <div class="stat-icon-modern">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($data['overview']['total_ppdb_applications']) }}</h3>
                <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Aplikasi PPDB</p>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
        <!-- Monthly Trends Chart -->
        <div class="col-xl-8 col-lg-7">
            <div class="card-modern fade-in-up">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-line me-2 text-primary"></i>
                        Trend Bulanan
                    </h5>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuLink" data-bs-toggle="dropdown">
                            <i class="fas fa-filter"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end">
                            <a class="dropdown-item" href="#" onclick="updateChart('12months'); return false;">12 Bulan Terakhir</a>
                            <a class="dropdown-item" href="#" onclick="updateChart('6months'); return false;">6 Bulan Terakhir</a>
                            <a class="dropdown-item" href="#" onclick="updateChart('3months'); return false;">3 Bulan Terakhir</a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-area">
                        <canvas id="monthlyTrendsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Institution Status Pie Chart -->
        <div class="col-xl-4 col-lg-5">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-chart-pie me-2 text-primary"></i>
                        Status Institusi
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-pie pt-4 pb-2">
                        <canvas id="institutionStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Statistics Tabs -->
    <div class="row">
        <div class="col-12">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <ul class="nav nav-tabs" id="statisticsTabs" role="tablist" style="border-bottom: none;">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="institutions-tab" data-bs-toggle="tab" data-bs-target="#institutions" type="button" role="tab">
                                <i class="fas fa-school me-1"></i>Institusi
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students" type="button" role="tab">
                                <i class="fas fa-user-graduate me-1"></i>Siswa
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="teachers-tab" data-bs-toggle="tab" data-bs-target="#teachers" type="button" role="tab">
                                <i class="fas fa-chalkboard-teacher me-1"></i>Guru
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="academic-tab" data-bs-toggle="tab" data-bs-target="#academic" type="button" role="tab">
                                <i class="fas fa-graduation-cap me-1"></i>Akademik
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="card-body">
                    <div class="tab-content" id="statisticsTabsContent">
                        <!-- Institutions Tab -->
                        <div class="tab-pane fade show active" id="institutions" role="tabpanel">
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-info-circle me-2 text-primary"></i>Institusi Berdasarkan Status</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Status</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($data['institutions']['by_status'] ?? [] as $status)
                                                <tr>
                                                    <td>
                                                        <span class="badge bg-{{ $status->status === 'active' ? 'success' : 'secondary' }}">
                                                            {{ ucfirst($status->status) }}
                                                        </span>
                                                    </td>
                                                    <td class="text-end"><strong>{{ number_format($status->total) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-trophy me-2 text-warning"></i>Top 10 Institusi (Berdasarkan Jumlah Siswa)</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Nama Institusi</th>
                                                    <th class="text-end">Siswa</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['institutions']['top_institutions'] ?? collect())->take(10) as $institution)
                                                <tr>
                                                    <td>{{ $institution->name ?? 'N/A' }}</td>
                                                    <td class="text-end"><strong>{{ number_format($institution->students_count ?? 0) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Students Tab -->
                        <div class="tab-pane fade" id="students" role="tabpanel">
                            <div class="row">
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-venus-mars me-2 text-primary"></i>Siswa Berdasarkan Jenis Kelamin</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Jenis Kelamin</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($data['students']['by_gender'] ?? [] as $gender)
                                                <tr>
                                                    <td>
                                                        <i class="fas fa-{{ $gender->gender === 'male' ? 'mars text-primary' : ($gender->gender === 'female' ? 'venus text-danger' : 'genderless text-secondary') }} me-2"></i>
                                                        {{ ucfirst($gender->gender === 'male' ? 'Laki-laki' : ($gender->gender === 'female' ? 'Perempuan' : $gender->gender)) }}
                                                    </td>
                                                    <td class="text-end"><strong>{{ number_format($gender->total) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-check-circle me-2 text-success"></i>Siswa Berdasarkan Status</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Status</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($data['students']['by_status'] ?? [] as $status)
                                                <tr>
                                                    <td>
                                                        <span class="badge bg-{{ $status->status === 'active' ? 'success' : 'secondary' }}">
                                                            {{ ucfirst($status->status) }}
                                                        </span>
                                                    </td>
                                                    <td class="text-end"><strong>{{ number_format($status->total) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-clock me-2 text-info"></i>Siswa Terbaru</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Nama</th>
                                                    <th>Institusi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['students']['recent_students'] ?? collect())->take(5) as $student)
                                                <tr>
                                                    <td>{{ $student->name ?? 'N/A' }}</td>
                                                    <td><small class="text-muted">{{ $student->institution->name ?? 'N/A' }}</small></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Teachers Tab -->
                        <div class="tab-pane fade" id="teachers" role="tabpanel">
                            <div class="row">
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-venus-mars me-2 text-primary"></i>Guru Berdasarkan Jenis Kelamin</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Jenis Kelamin</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($data['teachers']['by_gender'] ?? [] as $gender)
                                                <tr>
                                                    <td>
                                                        <i class="fas fa-{{ $gender->gender === 'male' ? 'mars text-primary' : ($gender->gender === 'female' ? 'venus text-danger' : 'genderless text-secondary') }} me-2"></i>
                                                        {{ ucfirst($gender->gender === 'male' ? 'Laki-laki' : ($gender->gender === 'female' ? 'Perempuan' : $gender->gender)) }}
                                                    </td>
                                                    <td class="text-end"><strong>{{ number_format($gender->total) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-graduation-cap me-2 text-success"></i>Guru Berdasarkan Pendidikan</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Pendidikan</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse($data['teachers']['by_education'] ?? [] as $education)
                                                <tr>
                                                    <td>{{ ucfirst($education->education_level ?? 'N/A') }}</td>
                                                    <td class="text-end"><strong>{{ number_format($education->total) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-clock me-2 text-info"></i>Guru Terbaru</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Nama</th>
                                                    <th>Institusi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['teachers']['recent_teachers'] ?? collect())->take(5) as $teacher)
                                                <tr>
                                                    <td>{{ $teacher->name ?? 'N/A' }}</td>
                                                    <td><small class="text-muted">{{ $teacher->institution->name ?? 'N/A' }}</small></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Academic Tab -->
                        <div class="tab-pane fade" id="academic" role="tabpanel">
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-chart-bar me-2 text-primary"></i>Statistik Ujian</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Kategori</th>
                                                    <th class="text-end">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td><i class="fas fa-clipboard-list me-2 text-primary"></i>Total Ujian</td>
                                                    <td class="text-end"><strong>{{ number_format($data['academic']['total_exams'] ?? 0) }}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td><i class="fas fa-check-circle me-2 text-success"></i>Selesai</td>
                                                    <td class="text-end"><strong>{{ number_format($data['academic']['completed_exams'] ?? 0) }}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td><i class="fas fa-spinner me-2 text-warning"></i>Berlangsung</td>
                                                    <td class="text-end"><strong>{{ number_format($data['academic']['ongoing_exams'] ?? 0) }}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td><i class="fas fa-file-alt me-2 text-info"></i>Total Hasil Ujian</td>
                                                    <td class="text-end"><strong>{{ number_format($data['academic']['total_exam_results'] ?? 0) }}</strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-clock me-2 text-info"></i>Ujian Terbaru</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Judul</th>
                                                    <th>Mata Pelajaran</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['academic']['recent_exams'] ?? collect())->take(5) as $exam)
                                                <tr>
                                                    <td>
                                                        <strong>{{ $exam->title ?? 'N/A' }}</strong>
                                                        @if($exam->subjects && $exam->subjects->count() > 0)
                                                            <br><small class="text-muted">
                                                                <i class="fas fa-book me-1"></i>
                                                                {{ $exam->subjects->pluck('name')->join(', ') }}
                                                            </small>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @if($exam->subjects && $exam->subjects->count() > 0)
                                                            {{ $exam->subjects->first()->name ?? 'N/A' }}
                                                        @else
                                                            <span class="text-muted">-</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-{{ $exam->status === 'completed' ? 'success' : ($exam->status === 'ongoing' ? 'warning' : 'secondary') }}">
                                                            {{ ucfirst($exam->status ?? 'N/A') }}
                                                        </span>
                                                    </td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="3" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-4">
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-book me-2 text-primary"></i>Ujian Berdasarkan Mata Pelajaran</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Mata Pelajaran</th>
                                                    <th class="text-end">Jumlah Ujian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['academic']['by_subject'] ?? collect())->take(10) as $subject)
                                                <tr>
                                                    <td>{{ $subject->name ?? 'N/A' }}</td>
                                                    <td class="text-end"><strong>{{ number_format($subject->exams_count ?? 0) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <h6 class="mb-3"><i class="fas fa-door-open me-2 text-success"></i>Ujian Berdasarkan Kelas</h6>
                                    <div class="table-responsive">
                                        <table class="table table-modern table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Kelas</th>
                                                    <th class="text-end">Jumlah Ujian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse(($data['academic']['by_class'] ?? collect())->take(10) as $class)
                                                <tr>
                                                    <td>{{ $class->name ?? 'N/A' }}</td>
                                                    <td class="text-end"><strong>{{ number_format($class->exams_count ?? 0) }}</strong></td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td colspan="2" class="text-center text-muted">Tidak ada data</td>
                                                </tr>
                                                @endforelse
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activities -->
    <div class="row">
        <div class="col-12">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-history me-2 text-primary"></i>
                        Aktivitas Terbaru
                    </h5>
                </div>
                <div class="card-body">
                    <div class="timeline">
                        @forelse($data['recent_activities'] ?? [] as $activity)
                        @php
                            if ($activity['type'] === 'student') {
                                $bgColor = 'success';
                                $icon = 'user-graduate';
                            } elseif ($activity['type'] === 'teacher') {
                                $bgColor = 'info';
                                $icon = 'chalkboard-teacher';
                            } else {
                                $bgColor = 'primary';
                                $icon = 'school';
                            }
                        @endphp
                        <div class="timeline-item">
                            <div class="timeline-marker bg-{{ $bgColor }}"></div>
                            <div class="timeline-content">
                                <h6 class="timeline-title">
                                    <i class="fas fa-{{ $icon }} me-2"></i>
                                    {{ $activity['description'] ?? 'Aktivitas' }}
                                </h6>
                                <p class="timeline-date">
                                    <i class="fas fa-clock me-1"></i>
                                    {{ isset($activity['date']) ? \App\Helpers\DateHelper::formatIndonesian($activity['date'], true) : 'N/A' }}
                                </p>
                            </div>
                        </div>
                        @empty
                        <div class="text-center text-muted py-4">
                            <i class="fas fa-inbox fa-2x mb-2"></i>
                            <p>Tidak ada aktivitas terbaru</p>
                        </div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
// Monthly Trends Chart
const monthlyTrendsCtx = document.getElementById('monthlyTrendsChart').getContext('2d');
let monthlyTrendsChart = new Chart(monthlyTrendsCtx, {
    type: 'line',
    data: {
        labels: {!! json_encode(array_column($data['monthly_trends'], 'month')) !!},
        datasets: [{
            label: 'Siswa',
            data: {!! json_encode(array_column($data['monthly_trends'], 'students')) !!},
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        }, {
            label: 'Guru',
            data: {!! json_encode(array_column($data['monthly_trends'], 'teachers')) !!},
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1
        }, {
            label: 'Institusi',
            data: {!! json_encode(array_column($data['monthly_trends'], 'institutions')) !!},
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Institution Status Pie Chart
@php
    $statusData = $data['institutions']['by_status'] ?? collect();
    $statusLabels = [];
    $statusValues = [];
    $statusColors = [];
    
    if($statusData && $statusData->count() > 0) {
        foreach($statusData as $item) {
            $statusLabels[] = ucfirst($item->status === 'active' ? 'Aktif' : ($item->status === 'inactive' ? 'Tidak Aktif' : $item->status));
            $statusValues[] = (int)$item->total;
            if($item->status === 'active') {
                $statusColors[] = 'rgba(34, 197, 94, 0.8)'; // green
            } else {
                $statusColors[] = 'rgba(156, 163, 175, 0.8)'; // gray
            }
        }
    }
@endphp
@if(!empty($statusLabels) && !empty($statusValues) && array_sum($statusValues) > 0)
document.addEventListener('DOMContentLoaded', function() {
    const institutionStatusCtx = document.getElementById('institutionStatusChart');
    if(institutionStatusCtx) {
        new Chart(institutionStatusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: {!! json_encode($statusLabels) !!},
                datasets: [{
                    data: {!! json_encode($statusValues) !!},
                    backgroundColor: {!! json_encode($statusColors) !!},
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
});
@else
// No data - show message in canvas
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('institutionStatusChart');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#858796';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Tidak ada data', canvas.width / 2, canvas.height / 2);
    }
});
@endif

// Update chart function
function updateChart(period) {
    fetch(`{{ route('admin.statistics.chart-data') }}?type=institutions&period=${period}`)
        .then(response => response.json())
        .then(data => {
            monthlyTrendsChart.data.labels = data.map(item => item.month);
            monthlyTrendsChart.data.datasets[0].data = data.map(item => item.total);
            monthlyTrendsChart.update();
        });
}
</script>

<style>
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e3e6f0;
}

.timeline-item {
    position: relative;
    margin-bottom: 20px;
}

.timeline-marker {
    position: absolute;
    left: -22px;
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #e3e6f0;
}

.timeline-content {
    background: #f8f9fc;
    padding: 15px;
    border-radius: 5px;
    border-left: 3px solid #4e73df;
}

.timeline-title {
    margin: 0 0 5px 0;
    font-size: 14px;
    font-weight: 600;
    color: #5a5c69;
}

.timeline-date {
    margin: 0;
    font-size: 12px;
    color: #858796;
}

.table-modern {
    border-radius: 8px;
    overflow: hidden;
}

.table-modern thead th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e3e6f0;
}

.table-modern tbody tr:hover {
    background-color: #f8f9fc;
    transition: background-color 0.2s;
}

.table-modern tbody td {
    vertical-align: middle;
    padding: 12px;
}

.card-modern {
    border: none;
    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
    border-radius: 10px;
    margin-bottom: 1.5rem;
}

.card-modern .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px 10px 0 0;
    padding: 1rem 1.5rem;
    border: none;
}

.card-modern .card-header h5 {
    margin: 0;
    font-weight: 600;
    color: white;
}

.chart-area {
    position: relative;
    height: 300px;
}

.chart-pie {
    position: relative;
    height: 250px;
}

.stat-card-modern {
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card-modern:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.25rem 2rem 0 rgba(58, 59, 69, 0.2);
}

.nav-tabs .nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    color: #5a5c69;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s;
}

.nav-tabs .nav-link:hover {
    border-bottom-color: #667eea;
    color: #667eea;
}

.nav-tabs .nav-link.active {
    border-bottom-color: #667eea;
    color: #667eea;
    background: transparent;
}
</style>
@endsection

