@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@push('styles')
<style>
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before { --card-color-1: #3b82f6; --card-color-2: #1d4ed8; }
    .stats-card.success::before { --card-color-1: #10b981; --card-color-2: #059669; }
    .stats-card.danger::before { --card-color-1: #ef4444; --card-color-2: #dc2626; }
    .stats-card.info::before { --card-color-1: #06b6d4; --card-color-2: #0891b2; }
    
    .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
    }
    
    .stats-icon.primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .stats-icon.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stats-icon.danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .stats-icon.info { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Date Range Filter -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <form method="GET" class="row g-3 align-items-end">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Mulai</label>
                    <input type="date" name="start_date" class="form-control" value="{{ $startDate ?? '' }}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Tanggal Akhir</label>
                    <input type="date" name="end_date" class="form-control" value="{{ $endDate ?? '' }}">
                </div>
                <div class="col-md-4">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-filter me-1"></i> Filter
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Summary Statistics -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($income ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Pendapatan</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($totalExpenses ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Pengeluaran</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($totalBudget ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Total Anggaran</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card info">
                <div class="d-flex align-items-center">
                    <div class="stats-icon info me-3">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold {{ ($budgetVariance ?? 0) < 0 ? 'text-danger' : 'text-success' }}">
                            Rp {{ number_format($budgetVariance ?? 0, 0, ',', '.') }}
                        </h3>
                        <small class="text-muted">Varians</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Expenses by Category -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-chart-pie me-2"></i>Pengeluaran per Kategori
            </h5>
        </div>
        <div class="card-body">
            @forelse($expensesByCategory ?? [] as $categoryId => $amount)
            <div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background: #f8f9fa; border-radius: 8px;">
                <div>
                    <strong>Kategori ID: {{ $categoryId }}</strong>
                </div>
                <div>
                    <strong class="text-danger">Rp {{ number_format($amount, 0, ',', '.') }}</strong>
                </div>
            </div>
            @empty
            <p class="text-muted text-center py-4">Belum ada data pengeluaran per kategori</p>
            @endforelse
        </div>
    </div>
</div>
@endsection

