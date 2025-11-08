@extends('layouts.tenant')

@section('title', 'Buku Tamu')
@section('page-title', 'Daftar Buku Tamu')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .guest-book-index {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 2rem;
        margin-bottom: 2rem;
    }
    
    .card-modern {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease;
    }
    
    .card-modern:hover {
        transform: translateY(-5px);
    }
    
    .card-header-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border: none;
    }
    
    .btn-primary-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-primary-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .filter-card {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    .form-control-modern {
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
    }
    
    .form-control-modern:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
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
        font-size: 0.85rem;
        letter-spacing: 0.5px;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s ease;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .table-modern tbody tr:hover {
        background: #f8f9fa;
        transform: scale(1.01);
    }
    
    .table-modern tbody td {
        padding: 1rem;
        vertical-align: middle;
    }
    
    .badge-modern {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    
    .btn-group-modern .btn {
        border-radius: 8px;
        margin: 0 2px;
        transition: all 0.3s ease;
    }
    
    .btn-group-modern .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .visitor-photo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #667eea;
        margin-right: 0.75rem;
    }
    
    .visitor-info {
        display: flex;
        align-items: center;
    }
    
    .visitor-details {
        flex: 1;
    }
    
    .stats-card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
    }
    
    .stats-number {
        font-size: 2rem;
        font-weight: 700;
        color: #667eea;
    }
    
    .stats-label {
        color: #6c757d;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6c757d;
    }
    
    .empty-state i {
        font-size: 4rem;
        color: #dee2e6;
        margin-bottom: 1rem;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-book me-3"></i>
                Buku Tamu
            </h2>
            <p>Kelola data tamu yang berkunjung</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            @php
                $tenantNpsn = request()->route('tenant');
                if (is_object($tenantNpsn)) {
                    $tenantNpsn = $tenantNpsn->npsn;
                }
            @endphp
            <a href="{{ url('/' . $tenantNpsn . '/guest-book/create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Data
            </a>
        </div>
    </div>
</div>

<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card primary">
            <div class="stat-icon">
                <i class="fas fa-users"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $stats['total'] ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Tamu</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card success">
            <div class="stat-icon">
                <i class="fas fa-sign-in-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $stats['checked_in'] ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Sedang Masuk</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card info">
            <div class="stat-icon">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0369a1; font-size: 2rem;">{{ $stats['checked_out'] ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Sudah Keluar</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card warning">
            <div class="stat-icon">
                <i class="fas fa-calendar-day"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $stats['today'] ?? 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Hari Ini</p>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header d-flex flex-row align-items-center justify-content-between">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2 text-primary"></i>Daftar Buku Tamu
                </h5>
            </div>
            
            <div class="card-body p-4">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                <!-- Filter Form -->
                <div class="filter-card mb-3">
                    <form method="GET" action="{{ tenant_route('tenant.guest-book.index') }}" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">
                                <i class="fas fa-search me-1"></i>Cari
                            </label>
                            <input type="text" name="search" class="form-control form-control-modern" 
                                   placeholder="Nama tamu, organisasi, atau orang yang ditemui..." 
                                   value="{{ request('search') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">
                                <i class="fas fa-filter me-1"></i>Status
                            </label>
                            <select name="status" class="form-control form-control-modern">
                                <option value="">Semua Status</option>
                                <option value="checked_in" {{ request('status') == 'checked_in' ? 'selected' : '' }}>Masuk</option>
                                <option value="checked_out" {{ request('status') == 'checked_out' ? 'selected' : '' }}>Keluar</option>
                                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">
                                <i class="fas fa-calendar me-1"></i>Dari Tanggal
                            </label>
                            <input type="date" name="date_from" class="form-control form-control-modern" 
                                   value="{{ request('date_from') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">
                                <i class="fas fa-calendar me-1"></i>Sampai Tanggal
                            </label>
                            <input type="date" name="date_to" class="form-control form-control-modern" 
                                   value="{{ request('date_to') }}">
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button type="submit" class="btn btn-modern btn-primary me-2 w-100">
                                <i class="fas fa-search me-2"></i>Filter
                            </button>
                        </div>
                    </form>
                    @if(request()->hasAny(['search', 'status', 'date_from', 'date_to']))
                    <div class="mt-2">
                        <a href="{{ tenant_route('tenant.guest-book.index') }}" class="btn btn-modern btn-secondary btn-sm">
                            <i class="fas fa-times me-1"></i>Reset Filter
                        </a>
                    </div>
                    @endif
                </div>

                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th width="5%">No</th>
                                <th width="20%">Nama Tamu</th>
                                <th width="15%">Organisasi</th>
                                <th width="10%">Tujuan</th>
                                <th width="15%">Orang yang Ditemui</th>
                                <th width="10%">Tanggal</th>
                                <th width="8%">Waktu</th>
                                <th width="8%">Status</th>
                                <th width="9%">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($guestBooks as $index => $guestBook)
                            <tr>
                                <td>{{ $guestBooks->firstItem() + $index }}</td>
                                <td>
                                    <div class="visitor-info">
                                        @if($guestBook->photo_path)
                                            <img src="{{ asset('storage/' . $guestBook->photo_path) }}" 
                                                 alt="{{ $guestBook->visitor_name }}" 
                                                 class="visitor-photo"
                                                 onerror="this.style.display='none'">
                                        @else
                                            <div class="visitor-photo d-flex align-items-center justify-content-center bg-light text-muted">
                                                <i class="fas fa-user"></i>
                                            </div>
                                        @endif
                                        <div class="visitor-details">
                                            <strong>{{ $guestBook->visitor_name }}</strong>
                                            @if($guestBook->visitor_phone)
                                                <br><small class="text-muted">
                                                    <i class="fas fa-phone me-1"></i>{{ $guestBook->visitor_phone }}
                                                </small>
                                            @endif
                                            @if($guestBook->visitor_email)
                                                <br><small class="text-muted">
                                                    <i class="fas fa-envelope me-1"></i>{{ $guestBook->visitor_email }}
                                                </small>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    @if($guestBook->visitor_organization)
                                        <i class="fas fa-building me-1 text-muted"></i>{{ $guestBook->visitor_organization }}
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="badge badge-modern badge-info">
                                        <i class="fas fa-bullseye me-1"></i>{{ $guestBook->purpose_label }}
                                    </span>
                                </td>
                                <td>
                                    @if($guestBook->person_to_meet)
                                        <i class="fas fa-handshake me-1 text-muted"></i>{{ $guestBook->person_to_meet }}
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    <i class="fas fa-calendar me-1 text-muted"></i>
                                    {{ \App\Helpers\DateHelper::formatIndonesian($guestBook->visit_date) }}
                                </td>
                                <td>
                                    <i class="fas fa-clock me-1 text-muted"></i>
                                    {{ $guestBook->visit_time->format('H:i') }}
                                </td>
                                <td>
                                    <span class="badge-modern bg-{{ $guestBook->status_color }}">
                                        @if($guestBook->status == 'checked_in')
                                            <i class="fas fa-sign-in-alt me-1"></i>
                                        @elseif($guestBook->status == 'checked_out')
                                            <i class="fas fa-sign-out-alt me-1"></i>
                                        @else
                                            <i class="fas fa-times-circle me-1"></i>
                                        @endif
                                        {{ $guestBook->status_label }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <a href="{{ tenant_route('tenant.guest-book.show', $guestBook) }}" 
                                           class="btn btn-modern btn-primary btn-sm" title="Lihat Detail"
                                           data-bs-toggle="tooltip">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ tenant_route('tenant.guest-book.edit', $guestBook) }}" 
                                           class="btn btn-modern btn-warning btn-sm" title="Edit"
                                           data-bs-toggle="tooltip">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        @if($guestBook->status == 'checked_in')
                                        <form action="{{ tenant_route('tenant.guest-book.checkout', $guestBook) }}" 
                                              method="POST" class="d-inline" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin check out tamu ini?')">
                                            @csrf
                                            <button type="submit" class="btn btn-modern btn-success btn-sm" title="Check Out"
                                                    data-bs-toggle="tooltip">
                                                <i class="fas fa-sign-out-alt"></i>
                                            </button>
                                        </form>
                                        @endif
                                        <form action="{{ tenant_route('tenant.guest-book.destroy', $guestBook) }}" 
                                              method="POST" class="d-inline" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus data ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus"
                                                    data-bs-toggle="tooltip">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="9" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="fas fa-book-open fa-3x mb-3" style="opacity: 0.3;"></i>
                                        <h5 class="mt-3">Tidak ada data buku tamu</h5>
                                        <p class="text-muted">Belum ada data tamu yang terdaftar</p>
                                        <a href="{{ tenant_route('tenant.guest-book.create') }}" class="btn btn-modern btn-primary mt-2">
                                            <i class="fas fa-plus me-2"></i>Tambah Data Tamu
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                @if($guestBooks->hasPages())
                <div class="card-footer">
                    <div class="d-flex justify-content-center">
                        {{ $guestBooks->appends(request()->query())->links() }}
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
</script>
@endsection
@endsection