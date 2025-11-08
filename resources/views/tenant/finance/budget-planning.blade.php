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
    .stats-card.warning::before { --card-color-1: #f59e0b; --card-color-2: #d97706; }
    .stats-card.danger::before { --card-color-1: #ef4444; --card-color-2: #dc2626; }
    
    .progress-modern {
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        background: #e9ecef;
    }
    
    .progress-modern .progress-bar {
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .table-modern {
        border-radius: 12px;
        overflow: hidden;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .table-modern thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Year Filter -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <form method="GET" class="d-flex gap-2 align-items-end">
                <div class="flex-grow-1">
                    <label class="form-label">Tahun</label>
                    <input type="number" name="year" class="form-control" value="{{ $year ?? now()->year }}" min="2020" max="2099">
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-filter me-1"></i> Filter
                </button>
            </form>
        </div>
    </div>

    <!-- Budget Planning Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-chart-pie me-2"></i>Perencanaan Anggaran per Kategori
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Anggaran</th>
                            <th>Pengeluaran</th>
                            <th>Sisa</th>
                            <th>Utilisasi</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($planning ?? [] as $item)
                        <tr>
                            <td><strong>{{ $item['category_name'] ?? '-' }}</strong></td>
                            <td>Rp {{ number_format($item['budget'] ?? 0, 0, ',', '.') }}</td>
                            <td>Rp {{ number_format($item['expense'] ?? 0, 0, ',', '.') }}</td>
                            <td>
                                <strong class="{{ ($item['remaining'] ?? 0) < 0 ? 'text-danger' : 'text-success' }}">
                                    Rp {{ number_format($item['remaining'] ?? 0, 0, ',', '.') }}
                                </strong>
                            </td>
                            <td>
                                <span class="badge {{ ($item['utilization'] ?? 0) > 100 ? 'bg-danger' : (($item['utilization'] ?? 0) > 80 ? 'bg-warning' : 'bg-success') }}">
                                    {{ number_format($item['utilization'] ?? 0, 2) }}%
                                </span>
                            </td>
                            <td>
                                <div class="progress-modern">
                                    <div class="progress-bar 
                                        {{ ($item['utilization'] ?? 0) > 100 ? 'bg-danger' : (($item['utilization'] ?? 0) > 80 ? 'bg-warning' : 'bg-success') }}" 
                                        style="width: {{ min($item['utilization'] ?? 0, 100) }}%">
                                        {{ number_format(min($item['utilization'] ?? 0, 100), 1) }}%
                                    </div>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada data perencanaan anggaran</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

