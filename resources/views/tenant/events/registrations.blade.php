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
    
    .stats-card.primary::before {
        --card-color-1: #3b82f6;
        --card-color-2: #1d4ed8;
    }
    
    .stats-card.success::before {
        --card-color-1: #10b981;
        --card-color-2: #059669;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.danger::before {
        --card-color-1: #ef4444;
        --card-color-2: #dc2626;
    }
    
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
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    .badge-modern {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        font-size: 0.875rem;
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
    
    .table-modern tbody tr {
        transition: all 0.2s ease;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
        transform: scale(1.01);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Event Info Card -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h4 class="mb-2">
                        <i class="fas fa-calendar-check text-primary me-2"></i>
                        {{ $event->title ?? 'Event' }}
                    </h4>
                    <p class="text-muted mb-0">
                        <i class="fas fa-map-marker-alt me-1"></i> {{ $event->location ?? '-' }} | 
                        <i class="fas fa-clock me-1"></i> {{ \App\Helpers\DateHelper::formatIndonesian($event->start_date ?? now(), true) }}
                    </p>
                </div>
                <div class="col-md-4 text-end">
                    <a href="{{ route('tenant.events.show', $event->id ?? 1) }}" class="btn btn-outline-primary">
                        <i class="fas fa-arrow-left me-1"></i> Kembali
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['total_registrations'] ?? 0 }}</h3>
                        <small class="text-muted">Total Pendaftaran</small>
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
                        <h3 class="mb-0 fw-bold">{{ $stats['confirmed'] ?? 0 }}</h3>
                        <small class="text-muted">Terkonfirmasi</small>
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
                        <small class="text-muted">Menunggu</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['cancelled'] ?? 0 }}</h3>
                        <small class="text-muted">Dibatalkan</small>
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
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">
                        <i class="fas fa-user-plus me-1"></i> Daftarkan Siswa
                    </button>
                    <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#bulkRegisterModal">
                        <i class="fas fa-users me-1"></i> Daftar dari Kelas
                    </button>
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#notificationModal">
                        <i class="fas fa-bell me-1"></i> Kirim Notifikasi
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <select name="status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                            <option value="confirmed" {{ request('status') == 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                            <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                        </select>
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Registrations Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white" style="border-bottom: 1px solid #e9ecef;">
            <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>
                Daftar Pendaftaran
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama Siswa</th>
                            <th>NIS</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($registrations as $registration)
                        <tr>
                            <td>{{ $registration->student_name ?? '-' }}</td>
                            <td>{{ $registration->student_number ?? '-' }}</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($registration->registered_at ?? now(), true) }}</td>
                            <td>
                                @if($registration->status == 'confirmed')
                                    <span class="badge-modern bg-success text-white">Confirmed</span>
                                @elseif($registration->status == 'pending')
                                    <span class="badge-modern bg-warning text-white">Pending</span>
                                @elseif($registration->status == 'cancelled')
                                    <span class="badge-modern bg-danger text-white">Cancelled</span>
                                @else
                                    <span class="badge-modern bg-secondary text-white">{{ $registration->status ?? '-' }}</span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-primary" 
                                        onclick="updateStatus({{ $registration->id }}, 'confirmed')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger" 
                                        onclick="updateStatus({{ $registration->id }}, 'cancelled')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada pendaftaran</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($registrations->hasPages())
        <div class="card-footer bg-white">
            {{ $registrations->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Register Modal -->
<div class="modal fade" id="registerModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-user-plus me-2"></i>Daftarkan Siswa
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.events.register-student', $event->id ?? 1) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="form-group mb-3">
                        <label class="form-label">Pilih Siswa</label>
                        <select name="student_ids[]" class="form-select" multiple required>
                            @foreach(\App\Models\Tenant\Student::where('instansi_id', session('instansi_id'))->get() as $student)
                                <option value="{{ $student->id }}">{{ $student->name }} - {{ $student->student_number }}</option>
                            @endforeach
                        </select>
                        <small class="text-muted">Tekan Ctrl untuk memilih multiple</small>
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

<!-- Notification Modal -->
<div class="modal fade" id="notificationModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-bell me-2"></i>Kirim Notifikasi
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.events.send-notification', $event->id ?? 1) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="form-group mb-3">
                        <label class="form-label">Jenis Notifikasi</label>
                        <select name="notification_type" class="form-select" required>
                            <option value="reminder">Reminder</option>
                            <option value="update">Update</option>
                            <option value="cancellation">Cancellation</option>
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label class="form-label">Pesan</label>
                        <textarea name="message" class="form-control" rows="4" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-paper-plane me-1"></i> Kirim
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
function updateStatus(id, status) {
    if(confirm('Yakin ingin mengubah status?')) {
        fetch(`{{ route('tenant.events.update-registration-status', [$event->id ?? 1, '']) }}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({status: status})
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                location.reload();
            }
        });
    }
}
</script>
@endpush
@endsection

