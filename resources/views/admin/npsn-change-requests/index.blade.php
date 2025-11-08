@extends('layouts.admin')

@section('title', 'Kelola Pengajuan Perubahan NPSN')
@section('page-title', 'Kelola Pengajuan Perubahan NPSN')

@include('components.admin-modern-styles')

@section('content')
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

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-file-alt me-3"></i>
                Kelola Pengajuan Perubahan NPSN
            </h2>
            <p>Kelola semua pengajuan perubahan NPSN dari tenant</p>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-4 mb-3">
        <div class="stat-card-modern warning fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-clock"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ $stats['pending'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Menunggu Persetujuan</p>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $stats['approved'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Disetujui</p>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stat-card-modern danger fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-times-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #991b1b; font-size: 2rem;">{{ $stats['rejected'] }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Ditolak</p>
        </div>
    </div>
</div>

<!-- Requests Table -->
<div class="card-modern fade-in-up">
    <div class="card-header">
        <h5>
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Pengajuan Perubahan NPSN
        </h5>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-modern mb-0">
                <thead>
                    <tr>
                        <th class="border-0 py-3 px-4">Tenant</th>
                        <th class="border-0 py-3 px-4">NPSN Lama</th>
                        <th class="border-0 py-3 px-4">NPSN Baru</th>
                        <th class="border-0 py-3 px-4">Alasan</th>
                        <th class="border-0 py-3 px-4">Status</th>
                        <th class="border-0 py-3 px-4">Tanggal</th>
                        <th class="border-0 py-3 px-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($requests as $request)
                    <tr class="border-bottom">
                        <td class="py-3 px-4">
                            <div>
                                <h6 class="mb-0 text-dark">{{ $request->tenant->name }}</h6>
                                <small class="text-muted">{{ $request->tenant->email }}</small>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <code class="text-dark">{{ $request->current_npsn }}</code>
                        </td>
                        <td class="py-3 px-4">
                            <code class="text-primary">{{ $request->requested_npsn }}</code>
                        </td>
                        <td class="py-3 px-4">
                            <small>{{ Str::limit($request->reason, 80) }}</small>
                        </td>
                        <td class="py-3 px-4">
                            @if($request->status === 'pending')
                                <span class="badge bg-warning">
                                    <i class="fas fa-clock me-1"></i>Menunggu
                                </span>
                            @elseif($request->status === 'approved')
                                <span class="badge bg-success">
                                    <i class="fas fa-check me-1"></i>Disetujui
                                </span>
                            @else
                                <span class="badge bg-danger">
                                    <i class="fas fa-times me-1"></i>Ditolak
                                </span>
                            @endif
                        </td>
                        <td class="py-3 px-4">
                            <small>{{ \Carbon\Carbon::parse($request->created_at)->format('d-m-Y H:i') }}</small>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <a href="{{ route('admin.npsn-change-requests.show', $request->id) }}" 
                               class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <h5>Belum ada pengajuan</h5>
                                <p>Belum ada pengajuan perubahan NPSN</p>
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

