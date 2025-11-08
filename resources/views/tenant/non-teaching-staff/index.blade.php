@extends('layouts.tenant')

@section('title', 'Data Staf Non-Guru')
@section('page-title', 'Data Staf Non-Guru')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
    }
    
    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .page-header p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
    }
    
    /* Modern Table Styles */
    .table-container {
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #e5e7eb;
    }
    
    .table-modern {
        margin-bottom: 0;
        width: 100%;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .table-modern thead th {
        border: none;
        padding: 1.5rem 1.25rem;
        font-weight: 700;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        vertical-align: middle;
        white-space: nowrap;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-bottom: 1px solid #f3f4f6;
        background: white;
    }
    
    .table-modern tbody tr:last-child {
        border-bottom: none;
    }
    
    .table-modern tbody tr:hover {
        background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
        transform: translateX(4px);
        box-shadow: -4px 0 12px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .table-modern tbody td {
        padding: 1.5rem 1.25rem;
        vertical-align: middle;
        border: none;
        color: #374151;
        font-size: 0.95rem;
    }
    
    .avatar-circle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
        color: white;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        margin-right: 0.75rem;
        transition: all 0.3s ease;
    }
    
    .avatar-circle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .badge-modern {
        padding: 0.5rem 0.875rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.75rem;
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .badge-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }
    
    .badge-danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
    }
    
    .badge-info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }
    
    .badge-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
    }
    
    .badge-secondary {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        color: white;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .btn-action {
        padding: 0.5rem 0.875rem;
        font-size: 0.875rem;
        border-radius: 10px;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .btn-view {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
    }
    
    .btn-edit {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
    }
    
    .btn-delete {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
    }
    
    .filter-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
    }
    
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
    }
    
    .empty-state i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-state h5 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #374151;
    }
    
    .empty-state p {
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
    }
    
    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .contact-info small {
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1><i class="fas fa-users me-3"></i>Data Staf Non-Guru</h1>
    <p>Kelola data staf non-guru sekolah Anda</p>
</div>

<!-- Filter Card -->
<div class="filter-card">
    <form method="GET" action="{{ tenant_route('tenant.data-pokok.non-teaching-staff.index') }}">
        <div class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label fw-bold">Cari</label>
                <input type="text" name="search" class="form-control" placeholder="Nama, NIP, atau posisi..." value="{{ request('search') }}">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-bold">Posisi</label>
                <select name="position" class="form-select">
                    <option value="">Semua Posisi</option>
                    <option value="Tata Usaha" {{ request('position') == 'Tata Usaha' ? 'selected' : '' }}>Tata Usaha</option>
                    <option value="Keamanan" {{ request('position') == 'Keamanan' ? 'selected' : '' }}>Keamanan</option>
                    <option value="Kebersihan" {{ request('position') == 'Kebersihan' ? 'selected' : '' }}>Kebersihan</option>
                    <option value="Perpustakaan" {{ request('position') == 'Perpustakaan' ? 'selected' : '' }}>Perpustakaan</option>
                    <option value="Laboratorium" {{ request('position') == 'Laboratorium' ? 'selected' : '' }}>Laboratorium</option>
                    <option value="Lainnya" {{ request('position') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-bold">Status</label>
                <select name="employment_status" class="form-select">
                    <option value="">Semua Status</option>
                    <option value="permanent" {{ request('employment_status') == 'permanent' ? 'selected' : '' }}>Pegawai Tetap</option>
                    <option value="contract" {{ request('employment_status') == 'contract' ? 'selected' : '' }}>Kontrak</option>
                    <option value="honorary" {{ request('employment_status') == 'honorary' ? 'selected' : '' }}>Honorer</option>
                    <option value="intern" {{ request('employment_status') == 'intern' ? 'selected' : '' }}>Magang</option>
                    <option value="resigned" {{ request('employment_status') == 'resigned' ? 'selected' : '' }}>Keluar</option>
                </select>
            </div>
            <div class="col-md-3">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="fas fa-search me-2"></i>Cari
                </button>
                <div class="d-flex gap-2 mt-2">
                    <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.create') }}" class="btn btn-success w-100">
                        <i class="fas fa-plus me-2"></i>Tambah Staf
                    </a>
                    <button type="button" class="btn btn-outline-success" onclick="exportData()" title="Export Excel">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>

<!-- Table Container -->
<div class="table-container">
    <div class="table-responsive">
        <table class="table table-modern">
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Nama Staf</th>
                    <th>Posisi</th>
                    <th>NIP / No. Pegawai</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th style="width: 200px;" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($staff as $index => $staffMember)
                    <tr>
                        <td>
                            <div class="avatar-circle">
                                {{ strtoupper(substr($staffMember->name, 0, 1)) }}
                            </div>
                        </td>
                        <td>
                            <div>
                                <strong class="d-block">{{ $staffMember->name }}</strong>
                                @if($staffMember->department)
                                    <small class="text-muted">
                                        <i class="fas fa-building me-1"></i>{{ $staffMember->department }}
                                    </small>
                                @endif
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-secondary">{{ $staffMember->position }}</span>
                        </td>
                        <td>
                            <div class="contact-info">
                                @if($staffMember->nip)
                                    <small><i class="fas fa-id-card"></i> NIP: {{ $staffMember->nip }}</small>
                                @endif
                                @if($staffMember->employee_number)
                                    <small><i class="fas fa-hashtag"></i> No. Pegawai: {{ $staffMember->employee_number }}</small>
                                @endif
                                @if(!$staffMember->nip && !$staffMember->employee_number)
                                    <small class="text-muted">-</small>
                                @endif
                            </div>
                        </td>
                        <td>
                            <div class="contact-info">
                                @if($staffMember->phone)
                                    <small><i class="fas fa-phone"></i> {{ $staffMember->phone }}</small>
                                @endif
                                @if($staffMember->email)
                                    <small><i class="fas fa-envelope"></i> {{ $staffMember->email }}</small>
                                @endif
                                @if(!$staffMember->phone && !$staffMember->email)
                                    <small class="text-muted">-</small>
                                @endif
                            </div>
                        </td>
                        <td>
                            <span class="badge-modern badge-{{ $staffMember->employment_status_color }}">
                                {{ $staffMember->employment_status_label }}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.show', $staffMember) }}" class="btn-action btn-view" title="Detail">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.edit', $staffMember) }}" class="btn-action btn-edit" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ tenant_route('tenant.data-pokok.non-teaching-staff.destroy', $staffMember) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus data staf ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn-action btn-delete" title="Hapus">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="empty-state">
                            <i class="fas fa-users"></i>
                            <h5>Belum ada data staf</h5>
                            <p>Mulai dengan menambahkan data staf pertama Anda</p>
                            <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>Tambah Staf
                            </a>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

@if($staff->hasPages())
    <div class="row mt-4">
        <div class="col-12">
            <div class="d-flex justify-content-center">
                {{ $staff->links() }}
            </div>
        </div>
    </div>
@endif
@endsection

@section('scripts')
<script>
function exportData() {
    fetch(`{{ tenant_route('tenant.data-pokok.non-teaching-staff.export', ':id') }}`.replace(':id', 'all'))
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat export data');
        });
}
</script>
@endsection
