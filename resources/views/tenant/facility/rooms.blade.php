@extends('layouts.tenant')

@section('title', 'Ruangan')
@section('page-title', 'Ruangan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-door-open me-2"></i>
                            Manajemen Ruangan
                        </h5>
                        <a href="{{ tenant_route('facility.rooms.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>
                            Tambah Ruangan
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
                        <div class="col-md-3">
                            <input type="text" name="search" class="form-control" placeholder="Cari ruangan..." value="{{ request('search') }}">
                        </div>
                        <div class="col-md-2">
                            <select name="type" class="form-select">
                                <option value="">Semua Jenis</option>
                                <option value="classroom" {{ request('type') == 'classroom' ? 'selected' : '' }}>Kelas</option>
                                <option value="office" {{ request('type') == 'office' ? 'selected' : '' }}>Kantor</option>
                                <option value="library" {{ request('type') == 'library' ? 'selected' : '' }}>Perpustakaan</option>
                                <option value="laboratory" {{ request('type') == 'laboratory' ? 'selected' : '' }}>Laboratorium</option>
                                <option value="auditorium" {{ request('type') == 'auditorium' ? 'selected' : '' }}>Auditorium</option>
                                <option value="other" {{ request('type') == 'other' ? 'selected' : '' }}>Lainnya</option>
                            </select>
                        </div>
                        <div class="col-md-2">
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
                            <a href="{{ tenant_route('facility.rooms') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i> Reset
                            </a>
                        </div>
                    </form>

                    <!-- Rooms Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Ruangan</th>
                                    <th>Gedung</th>
                                    <th>Jenis</th>
                                    <th>Lantai</th>
                                    <th>Kapasitas</th>
                                    <th>Luas</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($rooms as $room)
                                <tr>
                                    <td>
                                        <strong>{{ $room->name }}</strong>
                                        @if($room->description)
                                            <br><small class="text-muted">{{ Str::limit($room->description, 30) }}</small>
                                        @endif
                                    </td>
                                    <td>{{ $room->building_name ?? 'N/A' }}</td>
                                    <td>
                                        @switch($room->type)
                                            @case('classroom')
                                                <span class="badge bg-primary">Kelas</span>
                                                @break
                                            @case('office')
                                                <span class="badge bg-info">Kantor</span>
                                                @break
                                            @case('library')
                                                <span class="badge bg-success">Perpustakaan</span>
                                                @break
                                            @case('laboratory')
                                                <span class="badge bg-warning">Laboratorium</span>
                                                @break
                                            @case('auditorium')
                                                <span class="badge bg-secondary">Auditorium</span>
                                                @break
                                            @default
                                                <span class="badge bg-dark">Lainnya</span>
                                        @endswitch
                                    </td>
                                    <td>Lantai {{ $room->floor }}</td>
                                    <td>{{ number_format($room->capacity) }} orang</td>
                                    <td>
                                        @if($room->length && $room->width)
                                            {{ number_format($room->length * $room->width, 2, ',', '.') }} m²
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($room->status == 'active')
                                            <span class="badge bg-success">Aktif</span>
                                        @elseif($room->status == 'inactive')
                                            <span class="badge bg-warning">Tidak Aktif</span>
                                        @else
                                            <span class="badge bg-info">Maintenance</span>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('facility.rooms.show', $room->id) }}" class="btn btn-sm btn-outline-primary" title="Lihat">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('facility.rooms.edit', $room->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('facility.rooms.destroy', $room->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus ruangan ini?')">
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
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-door-open fa-3x mb-3 d-block"></i>
                                        <p>Belum ada ruangan yang terdaftar</p>
                                        <a href="{{ tenant_route('facility.rooms.create') }}" class="btn btn-primary">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Ruangan Pertama
                                        </a>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($rooms->hasPages())
                    <div class="d-flex justify-content-center mt-4">
                        {{ $rooms->appends(request()->query())->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
