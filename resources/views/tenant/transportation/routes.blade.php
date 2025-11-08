@extends('layouts.tenant')

@section('title', 'Rute')
@section('page-title', 'Rute')

@push('styles')
<style>
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
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
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
    
    .quick-action-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quick-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        color: white;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">
                    <i class="fas fa-route me-2 text-primary"></i>
                    Daftar Rute
                </h4>
                <a href="{{ tenant_route('transportation.routes.create') }}" class="quick-action-btn">
                    <i class="fas fa-plus"></i>
                    Tambah Rute
                </a>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="modern-card">
                <div class="card-body">
                    <form method="GET" action="{{ tenant_route('transportation.routes') }}" class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label">Cari</label>
                            <input type="text" name="search" class="form-control" 
                                   placeholder="Nama rute, lokasi awal, atau lokasi tujuan..." 
                                   value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Status</label>
                            <select name="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                                <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                            </select>
                        </div>
                        <div class="col-md-1 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Routes Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Data Rute
                </div>
                <div class="card-body p-0">
                    @if($routes->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Nama Rute</th>
                                        <th>Lokasi</th>
                                        <th>Jarak</th>
                                        <th>Durasi</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($routes as $route)
                                    <tr>
                                        <td>
                                            <strong>{{ $route->name }}</strong>
                                        </td>
                                        <td>
                                            <div>
                                                <i class="fas fa-map-marker-alt text-primary me-1"></i>
                                                <small>{{ $route->start_location }}</small>
                                            </div>
                                            <div class="mt-1">
                                                <i class="fas fa-map-marker-alt text-danger me-1"></i>
                                                <small>{{ $route->end_location }}</small>
                                            </div>
                                        </td>
                                        <td>
                                            {{ $route->distance ? number_format($route->distance, 1) . ' km' : '-' }}
                                        </td>
                                        <td>
                                            {{ $route->estimated_duration ? $route->estimated_duration . ' menit' : '-' }}
                                        </td>
                                        <td>
                                            @if($route->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak Aktif</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('transportation.routes.show', $route->id) }}" class="btn btn-sm btn-outline-info" title="Lihat Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('transportation.routes.edit', $route->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('transportation.routes.destroy', $route->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rute ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="card-footer bg-white border-top">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <small class="text-muted">
                                        Menampilkan {{ $routes->firstItem() }} sampai {{ $routes->lastItem() }} dari {{ $routes->total() }} data
                                    </small>
                                </div>
                                <div>
                                    {{ $routes->links() }}
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="text-center p-4">
                            <i class="fas fa-route fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Belum ada data rute</p>
                            <a href="{{ tenant_route('transportation.routes.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus"></i>
                                Tambah Rute Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

