@extends('layouts.tenant')

@section('title', 'Detail Mutasi Siswa')
@section('page-title', 'Detail Mutasi Siswa')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Detail Mutasi Siswa</h3>
                    <div class="card-tools">
                        <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Status Badge -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="alert alert-{{ $transfer->status_color }} d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-0">
                                        <i class="fas fa-info-circle"></i> 
                                        Status: {{ $transfer->status_label }}
                                    </h5>
                                </div>
                                @php
                                    $currentTenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
                                @endphp
                                
                                @if($transfer->status == 'pending')
                                    @if($transfer->to_tenant_id == $currentTenant->id)
                                        <div>
                                            <button class="btn btn-success btn-sm" onclick="approveTransfer()">
                                                <i class="fas fa-check"></i> Setujui
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="rejectTransfer()">
                                                <i class="fas fa-times"></i> Tolak
                                            </button>
                                        </div>
                                    @elseif($transfer->from_tenant_id == $currentTenant->id)
                                        <button class="btn btn-warning btn-sm" onclick="cancelTransfer()">
                                            <i class="fas fa-ban"></i> Batalkan
                                        </button>
                                    @endif
                                @elseif($transfer->status == 'approved')
                                    @if($transfer->to_tenant_id == $currentTenant->id)
                                        <button class="btn btn-primary btn-sm" onclick="completeTransfer()">
                                            <i class="fas fa-check-double"></i> Selesaikan Mutasi
                                        </button>
                                    @endif
                                @endif
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Informasi Siswa -->
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="mb-0"><i class="fas fa-user-graduate"></i> Informasi Siswa</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless">
                                        <tr>
                                            <th width="40%">Nama Lengkap</th>
                                            <td>: <strong>{{ $transfer->student->name ?? 'N/A' }}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>NISN</th>
                                            <td>: {{ $transfer->student->nisn ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>NIS</th>
                                            <td>: {{ $transfer->student->student_number ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Jenis Kelamin</th>
                                            <td>: {{ $transfer->student->gender == 'L' ? 'Laki-laki' : ($transfer->student->gender == 'P' ? 'Perempuan' : '-') }}</td>
                                        </tr>
                                        <tr>
                                            <th>Tanggal Lahir</th>
                                            <td>: {{ $transfer->student->birth_date ? \App\Helpers\DateHelper::formatIndonesian($transfer->student->birth_date) : '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Tempat Lahir</th>
                                            <td>: {{ $transfer->student->birth_place ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Kelas</th>
                                            <td>: {{ $transfer->student->class->name ?? '-' }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Informasi Mutasi -->
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-header bg-info text-white">
                                    <h5 class="mb-0"><i class="fas fa-exchange-alt"></i> Informasi Mutasi</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless">
                                        <tr>
                                            <th width="40%">Dari Tenant</th>
                                            <td>: <strong>{{ $transfer->fromTenant->name ?? 'N/A' }}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>NPSN</th>
                                            <td>: {{ $transfer->fromTenant->npsn ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Ke Tenant</th>
                                            <td>: <strong>{{ $transfer->toTenant->name ?? 'N/A' }}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>NPSN</th>
                                            <td>: {{ $transfer->toTenant->npsn ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Tanggal Pengajuan</th>
                                            <td>: {{ \App\Helpers\DateHelper::formatIndonesian($transfer->created_at, true) }}</td>
                                        </tr>
                                        @if($transfer->processed_at)
                                            <tr>
                                                <th>Tanggal Diproses</th>
                                                <td>: {{ \App\Helpers\DateHelper::formatIndonesian($transfer->processed_at, true) }}</td>
                                            </tr>
                                        @endif
                                        @if($transfer->processedBy)
                                            <tr>
                                                <th>Diproses Oleh</th>
                                                <td>: {{ $transfer->processedBy->name }}</td>
                                            </tr>
                                        @endif
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Alasan dan Catatan -->
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card mb-4">
                                <div class="card-header bg-secondary text-white">
                                    <h5 class="mb-0"><i class="fas fa-file-alt"></i> Alasan dan Catatan</h5>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="font-weight-bold">Alasan Mutasi:</label>
                                        <p class="text-muted">{{ $transfer->reason ?? '-' }}</p>
                                    </div>
                                    
                                    @if($transfer->notes)
                                        <div class="mb-3">
                                            <label class="font-weight-bold">Catatan:</label>
                                            <p class="text-muted">{{ $transfer->notes }}</p>
                                        </div>
                                    @endif
                                    
                                    @if($transfer->rejection_reason)
                                        <div class="mb-3">
                                            <label class="font-weight-bold text-danger">Alasan Penolakan:</label>
                                            <p class="text-danger">{{ $transfer->rejection_reason }}</p>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Siswa Snapshot (jika ada) -->
                    @if($transfer->student_data)
                        <div class="row">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header bg-warning text-dark">
                                        <h5 class="mb-0">
                                            <i class="fas fa-camera"></i> Data Siswa Saat Pengajuan (Snapshot)
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-sm table-bordered">
                                                <tbody>
                                                    @foreach($transfer->student_data as $key => $value)
                                                        @if($value && !is_array($value))
                                                            <tr>
                                                                <th width="30%">{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                                                                <td>{{ $value }}</td>
                                                            </tr>
                                                        @endif
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
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
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success">Setujui</button>
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
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger">Tolak</button>
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
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning">Batalkan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function approveTransfer() {
    const modal = new bootstrap.Modal(document.getElementById('approveModal'));
    modal.show();
}

function rejectTransfer() {
    const modal = new bootstrap.Modal(document.getElementById('rejectModal'));
    modal.show();
}

function cancelTransfer() {
    const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
    modal.show();
}

function completeTransfer() {
    if (!confirm('Apakah Anda yakin ingin menyelesaikan mutasi ini? Setelah diselesaikan, siswa akan pindah ke tenant ini secara permanen.')) {
        return;
    }
    
    fetch('{{ tenant_route("tenant.data-pokok.mutasi-siswa.complete", $transfer->id) }}', {
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
    
    fetch('{{ tenant_route("tenant.data-pokok.mutasi-siswa.approve", $transfer->id) }}', {
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
    
    fetch('{{ tenant_route("tenant.data-pokok.mutasi-siswa.reject", $transfer->id) }}', {
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
    
    fetch('{{ tenant_route("tenant.data-pokok.mutasi-siswa.cancel", $transfer->id) }}', {
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
