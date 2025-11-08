@extends('layouts.admin')

@php
use Illuminate\Support\Facades\DB;
@endphp

@section('title', 'Tenant Access Management')
@section('page-title', 'Tenant Access')

@include('components.admin-modern-styles')

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-key me-3"></i>
                Tenant Access Management
            </h2>
            <p>Kelola akses fitur dan modul untuk setiap tenant</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ route('admin.tenant-access.bulk') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-layer-group me-2"></i> Bulk Update
                </a>
                <a href="{{ route('admin.tenants.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Filter Section -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-filter me-2 text-primary"></i>
                    Filter Pencarian
                </h5>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.tenant-access.index') }}" class="row g-3">
                    <div class="col-md-4">
                        <label for="search" class="form-label">Cari Tenant</label>
                        <input type="text" class="form-control" id="search" name="search" 
                               value="{{ request('search') }}" placeholder="Nama, NPSN, atau Email">
                    </div>
                    <div class="col-md-3">
                        <label for="status" class="form-label">Status</label>
                        <select class="form-select" id="status" name="status">
                            <option value="">Semua Status</option>
                            <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Aktif</option>
                            <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                        </select>
                    </div>
                    <div class="col-md-5 d-flex align-items-end">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search me-1"></i>Filter
                        </button>
                        <a href="{{ route('admin.tenant-access.index') }}" class="btn btn-outline-secondary">
                            <i class="fas fa-redo me-1"></i>Reset
                        </a>
                    </div>
                </form>
            </div>
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
                    Daftar Tenant
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
                                    <span class="text-muted fw-semibold">Status</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Features</span>
                                </th>
                                <th class="border-0 py-3 px-4">
                                    <span class="text-muted fw-semibold">Modules</span>
                                </th>
                                <th class="border-0 py-3 px-4 text-center">
                                    <span class="text-muted fw-semibold">Actions</span>
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
                                        <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                            <i class="fas fa-school text-white"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-1 text-dark">{{ $tenant->name }}</h6>
                                            @if($tenant->email)
                                                <small class="text-muted">{{ $tenant->email }}</small>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    @if($tenant->is_active)
                                        <span class="badge bg-success bg-opacity-10 text-success border border-success">
                                            <i class="fas fa-check-circle me-1"></i>Active
                                        </span>
                                    @else
                                        <span class="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                            <i class="fas fa-times-circle me-1"></i>Inactive
                                        </span>
                                    @endif
                                </td>
                                <td class="py-3 px-4">
                                    @php
                                        $featureCount = \Illuminate\Support\Facades\DB::table('tenant_feature_pivot')
                                            ->where('tenant_id', $tenant->id)
                                            ->where('is_active', true)
                                            ->count();
                                    @endphp
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info">
                                        <i class="fas fa-cogs me-1"></i>{{ $featureCount }} features
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning">
                                        <i class="fas fa-puzzle-piece me-1"></i>{{ $tenant->modules->where('is_enabled', true)->count() }} modules
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <a href="{{ route('admin.tenant-access.show', $tenant) }}" 
                                       class="btn btn-sm btn-outline-primary" 
                                       title="Manage Access">
                                        <i class="fas fa-key me-1"></i>Manage
                                    </a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="6" class="text-center py-5">
                                    <div class="empty-state">
                                        <i class="fas fa-inbox"></i>
                                        <h5>Tidak ada tenant ditemukan</h5>
                                        <p>Coba ubah filter pencarian Anda</p>
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

<style>
.avatar-sm {
    width: 40px;
    height: 40px;
}

.table tbody tr:hover {
    background-color: rgba(13, 110, 253, 0.05);
}

.badge {
    font-size: 0.75rem;
    font-weight: 500;
}

.card {
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
}

.card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.table th {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table td {
    vertical-align: middle;
}

.pagination .page-link {
    color: #1e3a8a;
    border-color: #e9ecef;
}

.pagination .page-link:hover {
    color: #3b82f6;
    background-color: #f8f9fa;
    border-color: #e9ecef;
}

.pagination .page-item.active .page-link {
    background-color: #1e3a8a;
    border-color: #1e3a8a;
}
</style>
@endsection

