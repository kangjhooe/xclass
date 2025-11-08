@extends('layouts.tenant')

@section('title', 'Mutasi Siswa')
@section('page-title', 'Mutasi Siswa Antar Tenant')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-exchange-alt me-3"></i>
                Mutasi Siswa Antar Tenant
            </h2>
            <p>Kelola mutasi siswa antar sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Ajukan Mutasi
            </a>
        </div>
    </div>
</div>
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif
@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle"></i> {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Statistik Cards -->
<div class="row mb-4">
    <div class="col-xl-3 col-md-6 mb-3">
        <div class="stat-card primary fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-exchange-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $statistics['total'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Mutasi</p>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="stat-card warning fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-clock"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $statistics['pending'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Menunggu Persetujuan</p>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="stat-card success fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $statistics['approved'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Disetujui</p>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="stat-card info fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-check-double"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0369a1; font-size: 2rem;">{{ $statistics['completed'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Selesai</p>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Mutasi Siswa
        </h5>
    </div>
    <div class="card-body">
        <!-- Filter Form -->
        <div class="filter-card mb-3">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label for="status" class="form-label fw-semibold">Status</label>
                    <select class="form-select" id="status" name="status">
                        <option value="">Semua Status</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Menunggu Persetujuan</option>
                        <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Disetujui</option>
                        <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Ditolak</option>
                        <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Selesai</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="student_name" class="form-label fw-semibold">Nama Siswa</label>
                    <input type="text" class="form-control" id="student_name" name="student_name" 
                           value="{{ request('student_name') }}" placeholder="Cari nama siswa">
                </div>
                <div class="col-md-2">
                    <label for="date_from" class="form-label fw-semibold">Tanggal Dari</label>
                    <input type="date" class="form-control" id="date_from" name="date_from" 
                           value="{{ request('date_from') }}">
                </div>
                <div class="col-md-2">
                    <label for="date_to" class="form-label fw-semibold">Tanggal Sampai</label>
                    <input type="date" class="form-control" id="date_to" name="date_to" 
                           value="{{ request('date_to') }}">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="submit" class="btn btn-modern btn-primary w-100">
                        <i class="fas fa-search me-2"></i> Filter
                    </button>
                </div>
            </form>
        </div>

        <!-- Mutasi Table -->
        <div class="table-responsive">
            <table class="table table-modern">
                <thead>
                                <tr>
                                    <th width="50">No</th>
                                    <th>Nama Siswa</th>
                                    <th>Dari Tenant</th>
                                    <th>Ke Tenant</th>
                                    <th width="150">Status</th>
                                    <th width="120">Tanggal</th>
                                    <th width="200" class="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($transfers->items() as $transfer)
                                    <tr>
                                        <td class="text-center">{{ $loop->iteration + ($transfers->currentPage() - 1) * $transfers->perPage() }}</td>
                                        <td>
                                            <strong>{{ $transfer->student->name ?? 'N/A' }}</strong><br>
                                            <small class="text-muted">{{ $transfer->student->nisn ?? '-' }}</small>
                                        </td>
                                        <td>{{ $transfer->fromTenant->name ?? 'N/A' }}</td>
                                        <td>{{ $transfer->toTenant->name ?? 'N/A' }}</td>
                                        <td>
                                            @if($transfer->status == 'pending')
                                                <span class="badge-modern bg-warning">Menunggu Persetujuan</span>
                                            @elseif($transfer->status == 'approved')
                                                <span class="badge-modern bg-success">Disetujui</span>
                                            @elseif($transfer->status == 'rejected')
                                                <span class="badge-modern bg-danger">Ditolak</span>
                                            @elseif($transfer->status == 'completed')
                                                <span class="badge-modern bg-info">Selesai</span>
                                            @endif
                                        </td>
                                        <td>{{ \App\Helpers\DateHelper::formatIndonesian($transfer->created_at) }}</td>
                                        <td class="text-center">
                                            <div class="d-flex gap-2 justify-content-center">
                                                <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.show', $transfer->id) }}" class="btn btn-modern btn-primary btn-sm" title="Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                
                                                @if($transfer->status == 'pending')
                                                    @php
                                                        $currentTenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
                                                    @endphp
                                                    
                                                    @if($transfer->to_tenant_id == $currentTenant->id)
                                                        <button class="btn btn-modern btn-success btn-sm" onclick="approveTransfer({{ $transfer->id }})" title="Setujui">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                        <button class="btn btn-modern btn-danger btn-sm" onclick="rejectTransfer({{ $transfer->id }})" title="Tolak">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    @elseif($transfer->from_tenant_id == $currentTenant->id)
                                                        <button class="btn btn-modern btn-warning btn-sm" onclick="cancelTransfer({{ $transfer->id }})" title="Batalkan">
                                                            <i class="fas fa-ban"></i>
                                                        </button>
                                                    @endif
                                                @elseif($transfer->status == 'approved')
                                                    @php
                                                        $currentTenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
                                                    @endphp
                                                    
                                                    @if($transfer->to_tenant_id == $currentTenant->id)
                                                        <button class="btn btn-modern btn-primary btn-sm" onclick="completeTransfer({{ $transfer->id }})" title="Selesaikan">
                                                            <i class="fas fa-check-double"></i>
                                                        </button>
                                                    @endif
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="text-center py-5">
                                            <div class="text-muted">
                                                <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                                                <p class="text-muted">Tidak ada data mutasi siswa</p>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($transfers->hasPages())
                    <div class="card-footer">
                        {{ $transfers->links() }}
                    </div>
                    @endif
                </div>
            </div>
</div>

<!-- Approve Modal -->
<div class="modal fade" id="approveModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Setujui Mutasi</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="approveForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="approve_notes">Catatan (Opsional)</label>
                        <textarea class="form-control" id="approve_notes" name="notes" rows="3" placeholder="Tambahkan catatan jika diperlukan"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-modern btn-success">Setujui</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div class="modal fade" id="rejectModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Tolak Mutasi</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="rejectForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="rejection_reason">Alasan Penolakan <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="rejection_reason" name="rejection_reason" rows="3" required placeholder="Masukkan alasan penolakan"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-modern btn-danger">Tolak</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Cancel Modal -->
<div class="modal fade" id="cancelModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Batalkan Mutasi</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="cancelForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="cancel_reason">Alasan Pembatalan (Opsional)</label>
                        <textarea class="form-control" id="cancel_reason" name="reason" rows="3" placeholder="Masukkan alasan pembatalan"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-modern btn-warning">Batalkan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
let currentTransferId = null;

function approveTransfer(id) {
    currentTransferId = id;
    const modal = new bootstrap.Modal(document.getElementById('approveModal'));
    modal.show();
}

function rejectTransfer(id) {
    currentTransferId = id;
    const modal = new bootstrap.Modal(document.getElementById('rejectModal'));
    modal.show();
}

function cancelTransfer(id) {
    currentTransferId = id;
    const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
    modal.show();
}

function completeTransfer(id) {
    if (!confirm('Apakah Anda yakin ingin menyelesaikan mutasi ini?')) {
        return;
    }
    
    const url = `{{ tenant_route('tenant.data-pokok.mutasi-siswa.complete', ['id' => 'PLACEHOLDER_ID']) }}`.replace('PLACEHOLDER_ID', id);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message || 'Terjadi kesalahan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses permintaan');
    });
}

document.getElementById('approveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    const url = `{{ tenant_route('tenant.data-pokok.mutasi-siswa.approve', ['id' => 'PLACEHOLDER_ID']) }}`.replace('PLACEHOLDER_ID', currentTransferId);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message || 'Terjadi kesalahan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses permintaan');
    });
});

document.getElementById('rejectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    if (!data.rejection_reason) {
        alert('Alasan penolakan wajib diisi');
        return;
    }
    
    const url = `{{ tenant_route('tenant.data-pokok.mutasi-siswa.reject', ['id' => 'PLACEHOLDER_ID']) }}`.replace('PLACEHOLDER_ID', currentTransferId);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message || 'Terjadi kesalahan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses permintaan');
    });
});

document.getElementById('cancelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    const url = `{{ tenant_route('tenant.data-pokok.mutasi-siswa.cancel', ['id' => 'PLACEHOLDER_ID']) }}`.replace('PLACEHOLDER_ID', currentTransferId);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message || 'Terjadi kesalahan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses permintaan');
    });
});
</script>
@endsection
