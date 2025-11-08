@extends('layouts.tenant')

@section('title', 'Keuangan')
@section('page-title', 'Keuangan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-calculator me-2"></i>
                        Manajemen Keuangan
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('finance.budget') }}" class="btn btn-primary">
                                    <i class="fas fa-chart-pie me-1"></i>
                                    Anggaran
                                </a>
                                <a href="{{ tenant_route('finance.expenses') }}" class="btn btn-info">
                                    <i class="fas fa-receipt me-1"></i>
                                    Pengeluaran
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari data keuangan...">
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
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Pengeluaran Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentExpenses as $expense)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $expense->description }}</h6>
                                            <small class="text-muted">{{ $expense->category->name ?? 'N/A' }}</small>
                                        </div>
                                        <div>
                                            <span class="fw-bold text-primary">Rp {{ number_format($expense->amount, 0, ',', '.') }}</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada pengeluaran</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Kategori Anggaran</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($budgetCategories as $category)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $category->name }}</h6>
                                            <small class="text-muted">{{ $category->description }}</small>
                                        </div>
                                        <div>
                                            <span class="badge bg-primary">Kategori</span>
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada kategori anggaran</p>
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
