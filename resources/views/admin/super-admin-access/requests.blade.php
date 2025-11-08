@extends('layouts.admin')

@section('title', 'Permintaan Akses Saya')
@section('page-title', 'Permintaan Akses Saya')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-list-alt me-3"></i>
                Permintaan Akses Saya
            </h2>
            <p>Daftar semua permintaan akses tenant yang telah Anda ajukan</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.super-admin-access.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-building me-2"></i>
                Lihat Semua Tenant
            </a>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
@if($requests->count() > 0)
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern warning fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-hourglass-half"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ $requests->where('status', 'pending')->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Menunggu</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $requests->where('status', 'approved')->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Disetujui</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern danger fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-times-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #991b1b; font-size: 2rem;">{{ $requests->where('status', 'rejected')->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Ditolak</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern primary fade-in-up fade-in-up-delay-4">
            <div class="stat-icon-modern">
                <i class="fas fa-list"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $requests->total() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total</p>
        </div>
    </div>
</div>
@endif

<!-- Requests Table -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Semua Permintaan Akses
                </h5>
            </div>
            <div class="card-body">
                @if($requests->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Tenant</th>
                                    <th>NPSN</th>
                                    <th>Status</th>
                                    <th>Alasan Permintaan</th>
                                    <th>Tanggal Permintaan</th>
                                    <th>Tanggal Disetujui/Ditolak</th>
                                    <th>Berakhir</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($requests as $request)
                                    <tr>
                                        <td>
                                            <strong>{{ $request->tenant->name }}</strong>
                                        </td>
                                        <td>{{ $request->tenant->npsn }}</td>
                                        <td>
                                            @if($request->status === 'approved' && $request->isActive())
                                                <span class="badge-modern bg-success" style="color: white;">
                                                    <i class="fas fa-check-circle me-1"></i>
                                                    Disetujui & Aktif
                                                </span>
                                            @elseif($request->status === 'approved' && $request->isExpired())
                                                <span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-clock me-1"></i>
                                                    Kedaluwarsa
                                                </span>
                                            @elseif($request->status === 'pending')
                                                <span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-hourglass-half me-1"></i>
                                                    Menunggu
                                                </span>
                                            @elseif($request->status === 'rejected')
                                                <span class="badge-modern bg-danger" style="color: white;">
                                                    <i class="fas fa-times-circle me-1"></i>
                                                    Ditolak
                                                </span>
                                            @elseif($request->status === 'revoked')
                                                <span class="badge-modern bg-secondary" style="color: white;">
                                                    <i class="fas fa-ban me-1"></i>
                                                    Dicabut
                                                </span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="text-truncate" style="max-width: 200px;" title="{{ $request->request_reason }}">
                                                {{ $request->request_reason ?? '-' }}
                                            </div>
                                        </td>
                                        <td>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($request->created_at) }}
                                        </td>
                                        <td>
                                            @if($request->approved_at)
                                                {{ \App\Helpers\DateHelper::formatIndonesian($request->approved_at) }}
                                                @if($request->approver)
                                                    <br><small class="text-muted">oleh {{ $request->approver->name }}</small>
                                                @endif
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($request->expires_at)
                                                {{ \App\Helpers\DateHelper::formatIndonesian($request->expires_at) }}
                                                @if($request->isExpired())
                                                    <br><small class="text-danger">(Kedaluwarsa)</small>
                                                @endif
                                            @else
                                                <span class="text-muted">Tidak Berbatas</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($request->status === 'approved' && $request->isActive())
                                                <form method="POST" action="{{ route('admin.super-admin-access.access', $request->tenant) }}" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-modern btn-success">
                                                        <i class="fas fa-sign-in-alt me-1"></i>
                                                        Akses
                                                    </button>
                                                </form>
                                            @elseif($request->status === 'pending')
                                                <span class="text-muted">Menunggu persetujuan...</span>
                                            @elseif($request->status === 'rejected')
                                                <a href="{{ route('admin.super-admin-access.request', $request->tenant) }}" class="btn btn-modern btn-warning">
                                                    <i class="fas fa-redo me-1"></i>
                                                    Ajukan Ulang
                                                </a>
                                            @else
                                                <a href="{{ route('admin.super-admin-access.request', $request->tenant) }}" class="btn btn-modern btn-primary">
                                                    <i class="fas fa-eye me-1"></i>
                                                    Detail
                                                </a>
                                            @endif
                                        </td>
                                    </tr>
                                    
                                    <!-- Response Message (if exists) -->
                                    @if($request->response_message)
                                        <tr class="bg-light">
                                            <td colspan="8">
                                                <div class="p-2">
                                                    <strong>
                                                        <i class="fas fa-comment me-2"></i>
                                                        Pesan dari Admin Tenant:
                                                    </strong>
                                                    <p class="mb-0 mt-1">{{ $request->response_message }}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    @endif
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="mt-3">
                        {{ $requests->links() }}
                    </div>
                @else
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h5>Belum Ada Permintaan Akses</h5>
                        <p>Anda belum pernah mengajukan permintaan akses ke tenant manapun</p>
                        <a href="{{ route('admin.super-admin-access.index') }}" class="btn btn-modern btn-primary">
                            <i class="fas fa-building me-2"></i>
                            Lihat Daftar Tenant
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
