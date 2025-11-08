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
    .stats-icon.danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    
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
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['total_assets'] ?? 0 }}</h3>
                        <small class="text-muted">Total Aset</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['active'] ?? 0 }}</h3>
                        <small class="text-muted">Aktif</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['maintenance'] ?? 0 }}</h3>
                        <small class="text-muted">Maintenance</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">Rp {{ number_format($stats['total_value'] ?? 0, 0, ',', '.') }}</h3>
                        <small class="text-muted">Total Nilai</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions & Filters -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createAssetModal">
                        <i class="fas fa-plus me-1"></i> Tambah Aset
                    </button>
                    <a href="{{ route('tenant.facility.depreciation') }}" class="btn btn-info">
                        <i class="fas fa-calculator me-1"></i> Depresiasi
                    </a>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <input type="text" name="search" class="form-control" placeholder="Cari..." value="{{ request('search') }}">
                        <select name="asset_type" class="form-select">
                            <option value="">Semua Tipe</option>
                            <option value="building" {{ request('asset_type') == 'building' ? 'selected' : '' }}>Gedung</option>
                            <option value="room" {{ request('asset_type') == 'room' ? 'selected' : '' }}>Ruangan</option>
                            <option value="equipment" {{ request('asset_type') == 'equipment' ? 'selected' : '' }}>Peralatan</option>
                            <option value="furniture" {{ request('asset_type') == 'furniture' ? 'selected' : '' }}>Furniture</option>
                        </select>
                        <select name="status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                            <option value="maintenance" {{ request('status') == 'maintenance' ? 'selected' : '' }}>Maintenance</option>
                            <option value="disposed" {{ request('status') == 'disposed' ? 'selected' : '' }}>Disposed</option>
                        </select>
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Assets Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>Daftar Aset
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Kode Aset</th>
                            <th>Nama</th>
                            <th>Tipe</th>
                            <th>Nilai Pembelian</th>
                            <th>Nilai Sekarang</th>
                            <th>Lokasi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($assets as $asset)
                        <tr>
                            <td><strong>{{ $asset->asset_code ?? '-' }}</strong></td>
                            <td>{{ $asset->name ?? '-' }}</td>
                            <td>{{ ucfirst($asset->asset_type ?? '-') }}</td>
                            <td>Rp {{ number_format($asset->purchase_value ?? 0, 0, ',', '.') }}</td>
                            <td>Rp {{ number_format($asset->current_value ?? 0, 0, ',', '.') }}</td>
                            <td>{{ $asset->location ?? '-' }}</td>
                            <td>
                                @if($asset->status == 'active')
                                    <span class="badge bg-success">Aktif</span>
                                @elseif($asset->status == 'maintenance')
                                    <span class="badge bg-warning">Maintenance</span>
                                @else
                                    <span class="badge bg-danger">Disposed</span>
                                @endif
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada aset</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($assets->hasPages())
        <div class="card-footer bg-white">
            {{ $assets->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Asset Modal -->
<div class="modal fade" id="createAssetModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-plus me-2"></i>Tambah Aset
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.facility.create-asset') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nama Aset <span class="text-danger">*</span></label>
                            <input type="text" name="name" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Kode Aset <span class="text-danger">*</span></label>
                            <input type="text" name="asset_code" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tipe Aset <span class="text-danger">*</span></label>
                            <select name="asset_type" class="form-select" required>
                                <option value="building">Gedung</option>
                                <option value="room">Ruangan</option>
                                <option value="equipment">Peralatan</option>
                                <option value="furniture">Furniture</option>
                                <option value="vehicle">Kendaraan</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Serial Number</label>
                            <input type="text" name="serial_number" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tanggal Pembelian</label>
                            <input type="date" name="purchase_date" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nilai Pembelian <span class="text-danger">*</span></label>
                            <input type="number" name="purchase_value" class="form-control" step="0.01" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nilai Sekarang</label>
                            <input type="number" name="current_value" class="form-control" step="0.01">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Lokasi</label>
                            <input type="text" name="location" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status <span class="text-danger">*</span></label>
                            <select name="status" class="form-select" required>
                                <option value="active">Aktif</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="disposed">Disposed</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" class="form-control" rows="3"></textarea>
                        </div>
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
@endsection

