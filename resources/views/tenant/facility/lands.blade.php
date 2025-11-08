@extends('layouts.tenant')

@section('title', 'Lahan')
@section('page-title', 'Lahan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-map me-2"></i>
                            Manajemen Lahan
                        </h5>
                        <a href="{{ tenant_route('facility.lands.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>
                            Tambah Lahan
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <!-- Filters -->
                    <form method="GET" class="row mb-4">
                        <div class="col-md-4">
                            <input type="text" name="search" class="form-control" placeholder="Cari lahan..." value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3">
                            <select name="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                                <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                                <option value="maintenance" {{ request('status') == 'maintenance' ? 'selected' : '' }}>Maintenance</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-outline-primary">
                                <i class="fas fa-search"></i> Cari
                            </button>
                        </div>
                        <div class="col-md-2">
                            <a href="{{ tenant_route('facility.lands') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i> Reset
                            </a>
                        </div>
                    </form>

                    <!-- Lands Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Lahan</th>
                                    <th>Luas</th>
                                    <th>Lokasi</th>
                                    <th>Status</th>
                                    <th>Dibuat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($lands as $land)
                                <tr>
                                    <td>
                                        <strong>{{ $land->name }}</strong>
                                        @if($land->description)
                                            <br><small class="text-muted">{{ Str::limit($land->description, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        {{ number_format($land->area, 2, ',', '.') }} 
                                        {{ $land->area_unit == 'm2' ? 'm²' : 'hektar' }}
                                    </td>
                                    <td>{{ $land->location ?? '-' }}</td>
                                    <td>
                                        @if($land->status == 'active')
                                            <span class="badge bg-success">Aktif</span>
                                        @elseif($land->status == 'inactive')
                                            <span class="badge bg-warning">Tidak Aktif</span>
                                        @else
                                            <span class="badge bg-info">Maintenance</span>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($land->created_at) }}</td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('facility.lands.show', $land->id) }}" class="btn btn-sm btn-outline-primary" title="Lihat">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('facility.lands.edit', $land->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('facility.lands.destroy', $land->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus lahan ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted">
                                        <i class="fas fa-map fa-3x mb-3 d-block"></i>
                                        <p>Belum ada lahan yang terdaftar</p>
                                        <a href="{{ tenant_route('facility.lands.create') }}" class="btn btn-primary">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Lahan Pertama
                                        </a>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($lands->hasPages())
                    <div class="d-flex justify-content-center mt-4">
                        {{ $lands->appends(request()->query())->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

