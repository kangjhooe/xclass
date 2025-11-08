@extends('layouts.tenant')

@section('title', 'Data Pendaftar PPDB/SPMB')

@push('styles')
<style>
    /* Modern Card Styles */
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
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
    
    /* Table Styles */
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
    }
    
    .table-modern thead th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        padding: 1rem;
        border: none;
        border-bottom: 2px solid #e9ecef;
    }
    
    .table-modern tbody tr {
        transition: all 0.2s ease;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9fa;
        transform: scale(1.01);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .table-modern tbody td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
    }
    
    /* Filter Card */
    .filter-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        color: white;
        flex-shrink: 0;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <div class="d-flex justify-content-between align-items-center">
        <div>
            <h1><i class="fas fa-users me-3"></i>Data Pendaftar PPDB/SPMB</h1>
            <p>Kelola data pendaftaran peserta didik baru</p>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ tenant_route('tenant.ppdb.dashboard') }}" class="btn btn-light">
                <i class="fas fa-chart-line me-2"></i>Dashboard
            </a>
            <a href="{{ tenant_route('tenant.ppdb.create') }}" class="btn btn-light">
                <i class="fas fa-plus me-2"></i>Tambah Pendaftar
            </a>
            <a href="{{ tenant_route('tenant.ppdb.export', request()->query()) }}" class="btn btn-light">
                <i class="fas fa-download me-2"></i>Export Excel
            </a>
        </div>
    </div>
</div>

<!-- Modern Card -->
<div class="modern-card">
    <div class="modern-card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
            <i class="fas fa-list me-2"></i>
            Daftar Pendaftar
        </h6>
        <div class="btn-group" role="group">
            <input type="radio" class="btn-check" name="status-filter" id="all" autocomplete="off" 
                   {{ !request('status') ? 'checked' : '' }}>
            <label class="btn btn-sm btn-light" for="all">Semua</label>

            <input type="radio" class="btn-check" name="status-filter" id="pending" autocomplete="off"
                   {{ request('status') == 'pending' ? 'checked' : '' }}>
            <label class="btn btn-sm btn-light" for="pending">Menunggu</label>

            <input type="radio" class="btn-check" name="status-filter" id="accepted" autocomplete="off"
                   {{ request('status') == 'accepted' ? 'checked' : '' }}>
            <label class="btn btn-sm btn-light" for="accepted">Diterima</label>

            <input type="radio" class="btn-check" name="status-filter" id="rejected" autocomplete="off"
                   {{ request('status') == 'rejected' ? 'checked' : '' }}>
            <label class="btn btn-sm btn-light" for="rejected">Ditolak</label>
        </div>
    </div>
    
    <div class="card-body p-4">
        <!-- Filter Form -->
        <div class="filter-card">
                    <form method="GET" action="{{ tenant_route('tenant.ppdb.index') }}">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="search" class="form-label">Pencarian</label>
                                    <input type="text" class="form-control" id="search" name="search" 
                                           value="{{ request('search') }}" placeholder="Nama, email, atau nomor pendaftaran">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status</label>
                                    <select class="form-select" id="status" name="status">
                                        <option value="">Semua Status</option>
                                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Menunggu</option>
                                        <option value="registered" {{ request('status') == 'registered' ? 'selected' : '' }}>Terdaftar</option>
                                        <option value="selection" {{ request('status') == 'selection' ? 'selected' : '' }}>Seleksi</option>
                                        <option value="announced" {{ request('status') == 'announced' ? 'selected' : '' }}>Diumumkan</option>
                                        <option value="accepted" {{ request('status') == 'accepted' ? 'selected' : '' }}>Diterima</option>
                                        <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Ditolak</option>
                                        <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-3">
                                    <label for="academic_year" class="form-label">Tahun Ajaran</label>
                                    <select class="form-select" id="academic_year" name="academic_year">
                                        <option value="">Semua Tahun</option>
                                        @foreach($academicYears as $year)
                                            <option value="{{ $year }}" {{ request('academic_year') == $year ? 'selected' : '' }}>
                                                {{ $year }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-3">
                                    <label for="batch" class="form-label">Gelombang</label>
                                    <select class="form-select" id="batch" name="batch">
                                        <option value="">Semua Gelombang</option>
                                        @foreach($batches as $batch)
                                            <option value="{{ $batch }}" {{ request('batch') == $batch ? 'selected' : '' }}>
                                                {{ $batch }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mb-3">
                                    <label for="major" class="form-label">Jurusan</label>
                                    <select class="form-select" id="major" name="major">
                                        <option value="">Semua Jurusan</option>
                                        @foreach($majors as $major)
                                            <option value="{{ $major }}" {{ request('major') == $major ? 'selected' : '' }}>
                                                {{ $major }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-1">
                                <div class="mb-3">
                                    <label class="form-label">&nbsp;</label>
                                    <div class="d-flex gap-1">
                                        <button type="submit" class="btn btn-primary btn-sm">
                                            <i class="fas fa-search"></i>
                                        </button>
                                        <a href="{{ tenant_route('tenant.ppdb.index') }}" class="btn btn-secondary btn-sm">
                                            <i class="fas fa-times"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

        <!-- Tabel Data -->
        <div class="table-responsive">
            <table class="table table-modern" id="ppdb-table">
                            <thead>
                                <tr>
                                    <th width="3%">No</th>
                                    <th width="12%">No. Pendaftaran</th>
                                    <th width="18%">Nama Lengkap</th>
                                    <th width="8%">Jurusan</th>
                                    <th width="8%">Jalur</th>
                                    <th width="8%">Status</th>
                                    <th width="8%">Nilai</th>
                                    <th width="12%">Tanggal Daftar</th>
                                    <th width="8%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($applications as $index => $application)
                                <tr>
                                    <td>{{ $applications->firstItem() + $index }}</td>
                                    <td>
                                        <span class="badge bg-primary">{{ $application->registration_number }}</span>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            @if($application->photo_path)
                                                <img src="{{ Storage::url($application->photo_path) }}" 
                                                     class="rounded-circle me-2" width="40" height="40" alt="Foto" style="object-fit: cover;">
                                            @else
                                                <div class="avatar-circle me-2" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                                    {{ strtoupper(substr($application->full_name, 0, 1)) }}
                                                </div>
                                            @endif
                                            <div>
                                                <div class="fw-semibold">{{ $application->full_name }}</div>
                                                @if($application->phone)
                                                    <small class="text-muted">
                                                        <i class="fas fa-phone me-1"></i>{{ $application->phone }}
                                                    </small>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">{{ $application->major_choice }}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-secondary">{{ $application->registration_path_label }}</span>
                                    </td>
                                    <td>
                                        @if($application->status == 'pending')
                                            <span class="badge bg-warning">Menunggu</span>
                                        @elseif($application->status == 'registered')
                                            <span class="badge bg-info">Terdaftar</span>
                                        @elseif($application->status == 'selection')
                                            <span class="badge bg-primary">Seleksi</span>
                                        @elseif($application->status == 'announced')
                                            <span class="badge bg-secondary">Diumumkan</span>
                                        @elseif($application->status == 'accepted')
                                            <span class="badge bg-success">Diterima</span>
                                        @elseif($application->status == 'rejected')
                                            <span class="badge bg-danger">Ditolak</span>
                                        @elseif($application->status == 'cancelled')
                                            <span class="badge bg-dark">Dibatalkan</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($application->total_score)
                                            <span class="badge bg-success">{{ number_format($application->total_score, 1) }}</span>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($application->created_at, true) }}</td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('tenant.ppdb.show', $application) }}" 
                                               class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.ppdb.edit', $application) }}" 
                                               class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                                    onclick="deleteApplication({{ $application->id }})" title="Hapus">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="9" class="text-center py-5">
                                        <div class="mb-3">
                                            <i class="fas fa-inbox fa-4x text-muted" style="opacity: 0.3;"></i>
                                        </div>
                                        <h5 class="text-muted mb-3">Belum ada data pendaftar</h5>
                                        <p class="text-muted mb-4">Mulai dengan menambahkan pendaftar pertama</p>
                                        <a href="{{ tenant_route('tenant.ppdb.create') }}" class="btn btn-primary">
                                            <i class="fas fa-plus me-2"></i>Tambah Pendaftar
                                        </a>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

        <!-- Pagination -->
        @if($applications->hasPages())
        <div class="d-flex justify-content-between align-items-center mt-4">
            <div>
                <small class="text-muted">
                    Menampilkan {{ $applications->firstItem() }} sampai {{ $applications->lastItem() }} 
                    dari {{ $applications->total() }} data
                </small>
            </div>
            <div>
                {{ $applications->links() }}
            </div>
        </div>
        @endif
    </div>
</div>

<!-- Modal Konfirmasi Hapus -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px; border: none;">
            <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0;">
                <h5 class="modal-title">
                    <i class="fas fa-exclamation-triangle me-2"></i>Konfirmasi Hapus
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <p>Apakah Anda yakin ingin menghapus data pendaftar ini?</p>
                <p class="text-danger mb-0"><small>Tindakan ini tidak dapat dibatalkan.</small></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <form id="deleteForm" method="POST" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">Hapus</button>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function deleteApplication(id) {
    const form = document.getElementById('deleteForm');
    form.action = `/{{ request()->route('tenant') }}/ppdb/${id}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Filter berdasarkan status
document.querySelectorAll('input[name="status-filter"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const status = this.id;
        const url = new URL(window.location);
        
        if (status === 'all') {
            url.searchParams.delete('status');
        } else {
            url.searchParams.set('status', status);
        }
        
        window.location.href = url.toString();
    });
});
</script>
@endpush
@endsection