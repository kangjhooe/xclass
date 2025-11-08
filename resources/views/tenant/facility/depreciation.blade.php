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
    .stats-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    
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
    <!-- Summary Statistics -->
    <div class="row mb-4">
        <div class="col-md-4 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($totalPurchaseValue ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Total Nilai Pembelian</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-chart-line-down"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($totalDepreciation ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Total Depresiasi</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($totalBookValue ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Nilai Buku</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Depreciation Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>Perhitungan Depresiasi Aset
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama Aset</th>
                            <th>Kode Aset</th>
                            <th>Nilai Pembelian</th>
                            <th>Umur (Tahun)</th>
                            <th>Depresiasi/Tahun</th>
                            <th>Total Depresiasi</th>
                            <th>Nilai Buku</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($depreciations as $dep)
                        <tr>
                            <td><strong>{{ $dep['asset']->name ?? '-' }}</strong></td>
                            <td>{{ $dep['asset']->asset_code ?? '-' }}</td>
                            <td>Rp {{ number_format($dep['asset']->purchase_value ?? 0, 0, ',', '.') }}</td>
                            <td>{{ $dep['years_old'] ?? 0 }} tahun</td>
                            <td>Rp {{ number_format($dep['annual_depreciation'] ?? 0, 0, ',', '.') }}</td>
                            <td>Rp {{ number_format($dep['total_depreciation'] ?? 0, 0, ',', '.') }}</td>
                            <td><strong>Rp {{ number_format($dep['book_value'] ?? 0, 0, ',', '.') }}</strong></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-outline-primary" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#updateDepreciationModal{{ $dep['asset']->id ?? '' }}">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada data depresiasi</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Update Depreciation Modal -->
@foreach($depreciations ?? [] as $dep)
<div class="modal fade" id="updateDepreciationModal{{ $dep['asset']->id ?? '' }}" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-edit me-2"></i>Update Depresiasi
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.facility.update-asset-depreciation', $dep['asset']->id ?? '') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Nilai Sekarang</label>
                        <input type="number" name="current_value" class="form-control" 
                            value="{{ $dep['book_value'] ?? 0 }}" step="0.01" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Jumlah Depresiasi</label>
                        <input type="number" name="depreciation_amount" class="form-control" 
                            step="0.01" placeholder="Opsional">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach
@endsection

