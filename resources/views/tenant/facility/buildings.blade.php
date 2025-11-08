@extends('layouts.tenant')

@section('title', 'Gedung')
@section('page-title', 'Gedung')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-building me-2"></i>
                            Manajemen Gedung
                        </h5>
                        <a href="{{ tenant_route('facility.buildings.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>
                            Tambah Gedung
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
                            <input type="text" name="search" class="form-control" placeholder="Cari gedung..." value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3">
                            <select name="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="baik" {{ request('status') == 'baik' ? 'selected' : '' }}>Baik</option>
                                <option value="rusak_ringan" {{ request('status') == 'rusak_ringan' ? 'selected' : '' }}>Rusak Ringan</option>
                                <option value="rusak_berat" {{ request('status') == 'rusak_berat' ? 'selected' : '' }}>Rusak Berat</option>
                                <option value="rusak_total" {{ request('status') == 'rusak_total' ? 'selected' : '' }}>Rusak Total</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-outline-primary">
                                <i class="fas fa-search"></i> Cari
                            </button>
                        </div>
                        <div class="col-md-2">
                            <a href="{{ tenant_route('facility.buildings') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i> Reset
                            </a>
                        </div>
                    </form>

                    <!-- Buildings Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Gedung</th>
                                    <th>Deskripsi</th>
                                    <th>Luas</th>
                                    <th>Lantai</th>
                                    <th>Tahun Dibangun</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($buildings as $building)
                                <tr>
                                    <td>
                                        <strong>{{ $building->name }}</strong>
                                    </td>
                                    <td>
                                        @if($building->description)
                                            {{ Str::limit($building->description, 50) }}
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($building->length && $building->width)
                                            {{ number_format($building->length * $building->width, 2, ',', '.') }} m²
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>{{ $building->floors }}</td>
                                    <td>
                                        @if($building->built_year)
                                            {{ $building->built_year }}
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('facility.buildings.show', $building->id) }}" class="btn btn-sm btn-outline-primary" title="Lihat">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('facility.buildings.edit', $building->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('facility.buildings.destroy', $building->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus gedung ini?')">
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
                                        <i class="fas fa-building fa-3x mb-3 d-block"></i>
                                        <p>Belum ada gedung yang terdaftar</p>
                                        <a href="{{ tenant_route('facility.buildings.create') }}" class="btn btn-primary">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Gedung Pertama
                                        </a>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($buildings->hasPages())
                    <div class="d-flex justify-content-center mt-4">
                        {{ $buildings->appends(request()->query())->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
