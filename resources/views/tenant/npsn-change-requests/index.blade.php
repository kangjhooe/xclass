@extends('layouts.tenant')

@section('title', 'Pengajuan Perubahan NPSN')
@section('page-title', 'Pengajuan Perubahan NPSN')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: none;
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 12px;">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 12px;">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

@if(session('info'))
    <div class="alert alert-info alert-dismissible fade show" role="alert" style="border-radius: 12px;">
        <i class="fas fa-info-circle me-2"></i>{{ session('info') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-4">
        <div class="stats-card">
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                    <div class="stats-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h3 class="mb-0">{{ $stats['pending'] }}</h3>
                    <small class="text-muted">Menunggu Persetujuan</small>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stats-card">
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                    <div class="stats-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h3 class="mb-0">{{ $stats['approved'] }}</h3>
                    <small class="text-muted">Disetujui</small>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stats-card">
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                    <div class="stats-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <i class="fas fa-times-circle"></i>
                    </div>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h3 class="mb-0">{{ $stats['rejected'] }}</h3>
                    <small class="text-muted">Ditolak</small>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Pengajuan Perubahan NPSN
            </h2>
            <p>NPSN Saat Ini: <strong>{{ $tenant->npsn }}</strong></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('npsn-change-requests.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Ajukan Perubahan NPSN
            </a>
        </div>
    </div>
</div>

<!-- Requests Table -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Pengajuan
        </h5>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-modern mb-0">
                <thead>
                    <tr>
                        <th>NPSN Lama</th>
                        <th>NPSN Baru</th>
                        <th>Alasan</th>
                        <th>Status</th>
                        <th>Tanggal Pengajuan</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($requests as $request)
                    <tr>
                        <td>
                            <code class="text-dark">{{ $request->current_npsn }}</code>
                        </td>
                        <td>
                            <code class="text-primary">{{ $request->requested_npsn }}</code>
                        </td>
                        <td>
                            <small>{{ Str::limit($request->reason, 80) }}</small>
                        </td>
                        <td>
                            @if($request->status === 'pending')
                                <span class="badge-modern bg-warning">
                                    <i class="fas fa-clock me-1"></i>Menunggu
                                </span>
                            @elseif($request->status === 'approved')
                                <span class="badge-modern bg-success">
                                    <i class="fas fa-check me-1"></i>Disetujui
                                </span>
                            @else
                                <span class="badge-modern bg-danger">
                                    <i class="fas fa-times me-1"></i>Ditolak
                                </span>
                            @endif
                        </td>
                        <td>
                            <small>{{ \Carbon\Carbon::parse($request->created_at)->format('d-m-Y H:i') }}</small>
                        </td>
                        <td class="text-center">
                            <a href="{{ tenant_route('npsn-change-requests.show', $request->id) }}" 
                               class="btn btn-modern btn-primary btn-sm">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                                <p class="text-muted">Belum ada pengajuan perubahan NPSN</p>
                                <a href="{{ tenant_route('npsn-change-requests.create') }}" class="btn btn-modern btn-primary">
                                    <i class="fas fa-plus me-2"></i>
                                    Ajukan Perubahan NPSN
                                </a>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    @if($requests->hasPages())
    <div class="card-footer">
        {{ $requests->links() }}
    </div>
    @endif
</div>
@endsection

