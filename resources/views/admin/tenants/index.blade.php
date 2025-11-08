@extends('layouts.admin')

@section('title', 'Tenant Management')
@section('page-title', 'Tenants')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-building me-3"></i>
                Tenant Management
            </h2>
            <p>Kelola semua tenant sekolah dan metadata mereka</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenants.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Tenant
            </a>
        </div>
    </div>
</div>

<!-- Tenants Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Semua Tenants
                </h5>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-modern mb-0">
                        <thead>
                            <tr>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">NPSN</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Nama Sekolah</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Tipe</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Status</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Langganan</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">User</span>
                                </th>
                                <th class="border-0 py-3 px-4 text-center">
                                    <span class="text-muted fw-semibold">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tenants as $tenant)
                            <tr class="border-bottom">
                                <td class="py-3 px-4">
                                    <span class="badge bg-light text-dark border">{{ $tenant->npsn }}</span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="d-flex align-items-center">
                                        @if($tenant->logo)
                                            <img src="{{ Storage::url($tenant->logo) }}" 
                                                 alt="{{ $tenant->name }}" 
                                                 class="me-3" 
                                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
                                        @else
                                            <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                                <i class="fas fa-school text-white"></i>
                                            </div>
                                        @endif
                                        <div>
                                            <h6 class="mb-1 text-dark">{{ $tenant->name }}</h6>
                                            @if($tenant->email)
                                                <small class="text-muted">{{ $tenant->email }}</small>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info">{{ ucfirst($tenant->type_tenant) }}</span>
                                    @if($tenant->jenjang)
                                        <br><small class="text-muted mt-1 d-block">{{ $tenant->jenjang }}</small>
                                    @endif
                                </td>
                                <td class="py-3 px-4">
                                    @if($tenant->is_active)
                                        <span class="badge bg-success bg-opacity-10 text-success border border-success">
                                            <i class="fas fa-check-circle me-1"></i>Aktif
                                        </span>
                                    @else
                                        <span class="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                            <i class="fas fa-times-circle me-1"></i>Tidak Aktif
                                        </span>
                                    @endif
                                </td>
                                <td class="py-3 px-4">
                                    @if($tenant->subscription_plan)
                                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary">{{ ucfirst($tenant->subscription_plan) }}</span>
                                        @if($tenant->subscription_expires_at)
                                            <br><small class="text-muted mt-1 d-block">
                                                Berakhir: {{ $tenant->subscription_expires_at->format('d M Y') }}
                                            </small>
                                        @endif
                                    @else
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Tidak Ada Paket</span>
                                    @endif
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info">
                                        <i class="fas fa-users me-1"></i>{{ $tenant->users_count }} user
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('admin.tenants.show', $tenant) }}" 
                                           class="btn btn-sm btn-outline-primary" 
                                           title="Lihat Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.tenants.edit', $tenant) }}" 
                                           class="btn btn-sm btn-outline-warning" 
                                           title="Ubah">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        @if($tenant->is_active)
                                            <form action="{{ route('admin.tenants.deactivate', $tenant) }}" method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-outline-warning" title="Nonaktifkan">
                                                    <i class="fas fa-pause"></i>
                                                </button>
                                            </form>
                                        @else
                                            <form action="{{ route('admin.tenants.activate', $tenant) }}" method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-outline-success" title="Aktifkan">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" class="text-center py-5">
                                    <div class="empty-state">
                                        <i class="fas fa-inbox"></i>
                                        <h5>Belum ada tenant</h5>
                                        <p>Buat tenant pertama Anda untuk memulai</p>
                                        <a href="{{ route('admin.tenants.create') }}" class="btn btn-modern btn-primary">
                                            <i class="fas fa-plus me-2"></i>
                                            Tambah Tenant Baru
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                @if($tenants->hasPages())
                <div class="card-footer bg-white border-top py-3">
                    <div class="d-flex justify-content-center">
                        {{ $tenants->links() }}
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection