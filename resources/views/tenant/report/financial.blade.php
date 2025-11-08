@extends('layouts.tenant')

@section('title', 'Laporan Keuangan')
@section('page-title', 'Laporan Keuangan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-pie me-2"></i>
                        Laporan Keuangan
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
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_budget'], 0, ',', '.') }}</h4>
                                            <small>Total Anggaran</small>
                                        </div>
                                        <i class="fas fa-wallet fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_expenses'], 0, ',', '.') }}</h4>
                                            <small>Total Pengeluaran</small>
                                        </div>
                                        <i class="fas fa-receipt fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['this_month_expenses'], 0, ',', '.') }}</h4>
                                            <small>Bulan Ini</small>
                                        </div>
                                        <i class="fas fa-calendar fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['budget_utilization'] }}%</h4>
                                            <small>Utilisasi</small>
                                        </div>
                                        <i class="fas fa-chart-line fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Expense by Category -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Pengeluaran per Kategori</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($expenseByCategory as $expense)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $expense->category_name ?? 'Tanpa Kategori' }}</h6>
                                            <small class="text-muted">Kategori</small>
                                        </div>
                                        <div>
                                            <span class="fw-bold text-primary">Rp {{ number_format($expense->total_amount, 0, ',', '.') }}</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada data pengeluaran</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <!-- Monthly Expenses -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Pengeluaran Bulanan ({{ now()->year }})</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($monthlyExpenses as $monthly)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ \Carbon\Carbon::create()->month($monthly->month)->format('F') }}</h6>
                                            <small class="text-muted">Bulan</small>
                                        </div>
                                        <div>
                                            <span class="fw-bold text-success">Rp {{ number_format($monthly->total, 0, ',', '.') }}</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada data pengeluaran bulanan</p>
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
                                            <a href="{{ tenant_route('report.financial-detail') }}" class="btn btn-primary w-100 mb-2">
                                                <i class="fas fa-list me-1"></i>
                                                Detail Pengeluaran
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.spp') }}" class="btn btn-success w-100 mb-2">
                                                <i class="fas fa-money-bill me-1"></i>
                                                Laporan SPP
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.budget') }}" class="btn btn-info w-100 mb-2">
                                                <i class="fas fa-chart-bar me-1"></i>
                                                Laporan Anggaran
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'financial']) }}" class="btn btn-outline-primary w-100 mb-2">
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
