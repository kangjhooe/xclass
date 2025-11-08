@extends('layouts.tenant')

@section('title', 'Laporan')
@section('page-title', 'Laporan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-bar me-2"></i>
                        Dashboard Laporan
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Statistics Cards -->
                    <div class="row mb-4">
                        <div class="col-md-2">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_students'] }}</h4>
                                            <small>Siswa</small>
                                        </div>
                                        <i class="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_teachers'] }}</h4>
                                            <small>Guru</small>
                                        </div>
                                        <i class="fas fa-chalkboard-teacher fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_classes'] }}</h4>
                                            <small>Kelas</small>
                                        </div>
                                        <i class="fas fa-door-open fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
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
                        <div class="col-md-2">
                            <div class="card bg-secondary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_budget'], 0, ',', '.') }}</h4>
                                            <small>Anggaran</small>
                                        </div>
                                        <i class="fas fa-wallet fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-dark text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_expenses'], 0, ',', '.') }}</h4>
                                            <small>Pengeluaran</small>
                                        </div>
                                        <i class="fas fa-receipt fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Report Categories -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Laporan Akademik</h6>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <a href="{{ tenant_route('report.academic') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Akademik Umum</h6>
                                                <small class="text-muted">Overview</small>
                                            </div>
                                            <p class="mb-1">Statistik umum akademik sekolah</p>
                                        </a>
                                        <a href="{{ tenant_route('report.students') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Siswa</h6>
                                                <small class="text-muted">Detail</small>
                                            </div>
                                            <p class="mb-1">Data lengkap siswa per kelas</p>
                                        </a>
                                        <a href="{{ tenant_route('report.attendance') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Kehadiran</h6>
                                                <small class="text-muted">Periode</small>
                                            </div>
                                            <p class="mb-1">Data kehadiran siswa</p>
                                        </a>
                                        <a href="{{ tenant_route('report.grades') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Nilai</h6>
                                                <small class="text-muted">Periode</small>
                                            </div>
                                            <p class="mb-1">Data nilai siswa per mata pelajaran</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Laporan Keuangan</h6>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <a href="{{ tenant_route('report.financial') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Keuangan Umum</h6>
                                                <small class="text-muted">Overview</small>
                                            </div>
                                            <p class="mb-1">Statistik umum keuangan sekolah</p>
                                        </a>
                                        <a href="{{ tenant_route('report.financial-detail') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Pengeluaran Detail</h6>
                                                <small class="text-muted">Periode</small>
                                            </div>
                                            <p class="mb-1">Detail pengeluaran per kategori</p>
                                        </a>
                                        <a href="{{ tenant_route('report.spp') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan SPP</h6>
                                                <small class="text-muted">Periode</small>
                                            </div>
                                            <p class="mb-1">Data pembayaran SPP siswa</p>
                                        </a>
                                        <a href="{{ tenant_route('report.budget') }}" class="list-group-item list-group-item-action">
                                            <div class="d-flex w-100 justify-content-between">
                                                <h6 class="mb-1">Laporan Anggaran</h6>
                                                <small class="text-muted">Periode</small>
                                            </div>
                                            <p class="mb-1">Realization anggaran sekolah</p>
                                        </a>
                                    </div>
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
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'academic']) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export Laporan Akademik PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'financial']) }}" class="btn btn-outline-success w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export Laporan Keuangan PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'students']) }}" class="btn btn-outline-info w-100 mb-2">
                                                <i class="fas fa-file-excel me-1"></i>
                                                Export Data Siswa Excel
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'attendance']) }}" class="btn btn-outline-warning w-100 mb-2">
                                                <i class="fas fa-file-excel me-1"></i>
                                                Export Data Kehadiran Excel
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
