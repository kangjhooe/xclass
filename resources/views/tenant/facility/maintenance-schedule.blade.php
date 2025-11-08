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
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['total_scheduled'] ?? 0 }}</h3>
                        <small class="text-muted">Total Terjadwal</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['pending'] ?? 0 }}</h3>
                        <small class="text-muted">Pending</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-spinner"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['in_progress'] ?? 0 }}</h3>
                        <small class="text-muted">Sedang Berjalan</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['overdue'] ?? 0 }}</h3>
                        <small class="text-muted">Terlambat</small>
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
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createScheduleModal">
                        <i class="fas fa-plus me-1"></i> Buat Jadwal Maintenance
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}">
                        <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}">
                        <select name="status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                            <option value="in_progress" {{ request('status') == 'in_progress' ? 'selected' : '' }}>In Progress</option>
                            <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                        </select>
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Schedules Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-tools me-2"></i>Jadwal Maintenance
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Jenis Aset</th>
                            <th>Tanggal Terjadwal</th>
                            <th>Tipe Maintenance</th>
                            <th>Biaya Estimasi</th>
                            <th>Ditugaskan Kepada</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($schedules as $schedule)
                        <tr>
                            <td>{{ ucfirst($schedule->asset_type ?? '-') }}</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($schedule->scheduled_date ?? now()) }}</td>
                            <td>{{ ucfirst($schedule->maintenance_type ?? '-') }}</td>
                            <td>Rp {{ number_format($schedule->estimated_cost ?? 0, 0, ',', '.') }}</td>
                            <td>{{ $schedule->assigned_to ?? '-' }}</td>
                            <td>
                                @if($schedule->status == 'completed')
                                    <span class="badge bg-success">Completed</span>
                                @elseif($schedule->status == 'in_progress')
                                    <span class="badge bg-info">In Progress</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
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
                            <td colspan="7" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada jadwal maintenance</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($schedules->hasPages())
        <div class="card-footer bg-white">
            {{ $schedules->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Schedule Modal -->
<div class="modal fade" id="createScheduleModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-calendar-plus me-2"></i>Buat Jadwal Maintenance
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.facility.create-maintenance-schedule') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Jenis Aset</label>
                            <select name="asset_type" class="form-select" required>
                                <option value="building">Gedung</option>
                                <option value="room">Ruangan</option>
                                <option value="equipment">Peralatan</option>
                                <option value="furniture">Furniture</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">ID Aset</label>
                            <input type="number" name="asset_id" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tipe Maintenance</label>
                            <select name="maintenance_type" class="form-select" required>
                                <option value="routine">Rutin</option>
                                <option value="repair">Perbaikan</option>
                                <option value="upgrade">Upgrade</option>
                                <option value="inspection">Inspeksi</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tanggal Terjadwal</label>
                            <input type="date" name="scheduled_date" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Biaya Estimasi</label>
                            <input type="number" name="estimated_cost" class="form-control" step="0.01">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Ditugaskan Kepada</label>
                            <input type="text" name="assigned_to" class="form-control">
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" class="form-control" rows="3" required></textarea>
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

