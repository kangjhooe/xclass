@extends('layouts.admin')

@section('title', 'Kelola Akses Tenant')
@section('page-title', 'Kelola Akses Tenant')

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

@if(session('info'))
    <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="fas fa-info-circle me-2"></i>{{ session('info') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-key me-3"></i>
                Kelola Akses Tenant
            </h2>
            <p>Minta akses ke tenant dan kelola permintaan akses Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.super-admin-access.requests') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-list-alt me-2"></i>
                Lihat Permintaan Saya
            </a>
        </div>
    </div>
</div>

<!-- Quick Access Section -->
@if($approvedAccesses->count() > 0)
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up" style="border-left-color: #10b981 !important;">
            <div class="card-header" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;">
                <h5>
                    <i class="fas fa-bolt me-2 text-success"></i>
                    Akses Cepat (Tenant yang Sudah Disetujui)
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    @foreach($approvedAccesses as $access)
                        <div class="col-md-4 col-lg-3 mb-3">
                            <div class="card-modern h-100" style="border-left-color: #10b981 !important;">
                                <div class="card-body d-flex flex-column">
                                    <div class="mb-3">
                                        <div class="d-flex align-items-center mb-2">
                                            <div class="stat-icon-modern me-2" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin-bottom: 0;">
                                                <i class="fas fa-building"></i>
                                            </div>
                                            <h6 class="card-title mb-0" style="font-weight: 600;">{{ Str::limit($access->tenant->name, 25) }}</h6>
                                        </div>
                                        <p class="text-muted small mb-2">
                                            <i class="fas fa-hashtag me-1"></i>NPSN: {{ $access->tenant->npsn }}
                                        </p>
                                        @if($access->expires_at)
                                            <p class="text-muted small mb-2">
                                                <i class="fas fa-clock me-1"></i>
                                                Berakhir: {{ \App\Helpers\DateHelper::formatIndonesian($access->expires_at) }}
                                            </p>
                                        @else
                                            <p class="text-success small mb-2">
                                                <i class="fas fa-infinity me-1"></i>
                                                Tidak Berbatas Waktu
                                            </p>
                                        @endif
                                    </div>
                                    <form method="POST" action="{{ route('admin.super-admin-access.access', $access->tenant) }}" class="mt-auto">
                                        @csrf
                                        <button type="submit" class="btn btn-modern btn-success w-100">
                                            <i class="fas fa-sign-in-alt me-1"></i>
                                            Akses Tenant
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- All Tenants Section -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Semua Tenant
                </h5>
                <a href="{{ route('admin.super-admin-access.requests') }}" class="btn btn-modern btn-info">
                    <i class="fas fa-list-alt me-1"></i>
                    Lihat Permintaan Saya
                </a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-modern mb-0">
                        <thead>
                            <tr>
                                <th class="border-0 py-3 px-4">Nama Tenant</th>
                                <th class="border-0 py-3 px-4">NPSN</th>
                                <th class="border-0 py-3 px-4">Status</th>
                                <th class="border-0 py-3 px-4">Tanggal Permintaan</th>
                                <th class="border-0 py-3 px-4">Tanggal Disetujui</th>
                                <th class="border-0 py-3 px-4">Berakhir</th>
                                <th class="border-0 py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tenants as $tenant)
                                @php
                                    $access = $accesses->get($tenant->id);
                                @endphp
                                <tr class="border-bottom">
                                    <td class="py-3 px-4">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                                <i class="fas fa-school text-white"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-0 text-dark">{{ $tenant->name }}</h6>
                                                @if($tenant->email)
                                                    <small class="text-muted">{{ $tenant->email }}</small>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="badge bg-light text-dark border">{{ $tenant->npsn }}</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        @if($access)
                                            @if($access->status === 'approved' && $access->isActive())
                                                <span class="badge-modern bg-success" style="color: white;">
                                                    <i class="fas fa-check-circle me-1"></i>
                                                    Disetujui & Aktif
                                                </span>
                                            @elseif($access->status === 'approved' && $access->isExpired())
                                                <span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-clock me-1"></i>
                                                    Kedaluwarsa
                                                </span>
                                            @elseif($access->status === 'pending')
                                                <span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-hourglass-half me-1"></i>
                                                    Menunggu Persetujuan
                                                </span>
                                            @elseif($access->status === 'rejected')
                                                <span class="badge-modern bg-danger" style="color: white;">
                                                    <i class="fas fa-times-circle me-1"></i>
                                                    Ditolak
                                                </span>
                                            @elseif($access->status === 'revoked')
                                                <span class="badge-modern bg-secondary" style="color: white;">
                                                    <i class="fas fa-ban me-1"></i>
                                                    Dicabut
                                                </span>
                                            @endif
                                        @else
                                            <span class="badge-modern bg-secondary" style="color: white;">
                                                <i class="fas fa-minus-circle me-1"></i>
                                                Belum Ada Akses
                                            </span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4">
                                        @if($access)
                                            <small class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($access->created_at) }}</small>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4">
                                        @if($access && $access->approved_at)
                                            <small class="text-muted">
                                                {{ \App\Helpers\DateHelper::formatIndonesian($access->approved_at) }}
                                                @if($access->approver)
                                                    <br>oleh {{ $access->approver->name }}
                                                @endif
                                            </small>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4">
                                        @if($access && $access->expires_at)
                                            <small class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($access->expires_at) }}</small>
                                        @else
                                            <span class="text-muted">Tidak Berbatas</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        @if($access && $access->status === 'approved' && $access->isActive())
                                            <form method="POST" action="{{ route('admin.super-admin-access.access', $tenant) }}" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-modern btn-success" title="Akses Tenant">
                                                    <i class="fas fa-sign-in-alt"></i>
                                                </button>
                                            </form>
                                        @elseif($access && $access->status === 'pending')
                                            <span class="text-muted small">Menunggu...</span>
                                        @elseif($access && $access->status === 'rejected')
                                            <a href="{{ route('admin.super-admin-access.request', $tenant) }}" class="btn btn-modern btn-warning" title="Ajukan Ulang">
                                                <i class="fas fa-redo"></i>
                                            </a>
                                        @else
                                            <a href="{{ route('admin.super-admin-access.request', $tenant) }}" class="btn btn-modern btn-primary" title="Minta Akses">
                                                <i class="fas fa-key"></i>
                                            </a>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-inbox"></i>
                                            <h5>Tidak ada tenant tersedia</h5>
                                            <p>Tidak ada tenant yang dapat diakses</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Info Card -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Untuk mengakses tenant, Anda perlu meminta izin terlebih dahulu kepada admin tenant.
                    </div>
                    <div class="col-md-6 mb-2">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Setelah permintaan disetujui, Anda dapat mengakses tenant tersebut.
                    </div>
                    <div class="col-md-6 mb-2">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Akses dapat memiliki batas waktu atau tidak berbatas waktu, tergantung kebijakan admin tenant.
                    </div>
                    <div class="col-md-6 mb-2">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Anda dapat melihat status semua permintaan di menu "Permintaan Saya".
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
