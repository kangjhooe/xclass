@extends('layouts.tenant')

@section('title', 'Detail Gedung')
@section('page-title', 'Detail Gedung')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-building me-2"></i>
                            Detail Gedung: {{ $building->name }}
                        </h5>
                        <div>
                            <a href="{{ tenant_route('facility.buildings.edit', $building->id) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i>
                                Edit
                            </a>
                            <a href="{{ tenant_route('facility.buildings') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Informasi Gedung</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Nama Gedung:</strong></td>
                                    <td>{{ $building->name }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Lahan:</strong></td>
                                    <td>
                                        @if($building->land_name)
                                            <a href="{{ tenant_route('facility.lands.show', $building->land_id) }}" class="text-decoration-none">
                                                {{ $building->land_name }}
                                                @if($building->land_location)
                                                    <small class="text-muted">({{ $building->land_location }})</small>
                                                @endif
                                            </a>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Jumlah Lantai:</strong></td>
                                    <td>{{ $building->floors }} lantai</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td>
                                        @if($building->status == 'baik')
                                            <span class="badge bg-success">Baik</span>
                                        @elseif($building->status == 'rusak_ringan')
                                            <span class="badge bg-warning">Rusak Ringan</span>
                                        @elseif($building->status == 'rusak_berat')
                                            <span class="badge bg-danger">Rusak Berat</span>
                                        @elseif($building->status == 'rusak_total')
                                            <span class="badge bg-dark">Rusak Total</span>
                                        @else
                                            <span class="badge bg-secondary">{{ $building->status }}</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Dibuat:</strong></td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($building->created_at, true) }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Diperbarui:</strong></td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($building->updated_at, true) }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Deskripsi</h6>
                            <p>{{ $building->description ?: 'Tidak ada deskripsi' }}</p>
                        </div>
                    </div>

                    <!-- Rooms in this building -->
                    <div class="mt-4">
                        <h6>Ruangan di Gedung Ini</h6>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Nama Ruangan</th>
                                        <th>Jenis</th>
                                        <th>Lantai</th>
                                        <th>Kapasitas</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($rooms as $room)
                                    <tr>
                                        <td>{{ $room->name }}</td>
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
                                            @if($room->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($room->status == 'inactive')
                                                <span class="badge bg-warning">Tidak Aktif</span>
                                            @else
                                                <span class="badge bg-info">Maintenance</span>
                                            @endif
                                        </td>
                                        <td>
                                            <a href="{{ tenant_route('facility.rooms.show', $room->id) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="6" class="text-center text-muted">
                                            <i class="fas fa-door-open fa-2x mb-2 d-block"></i>
                                            <p>Belum ada ruangan di gedung ini</p>
                                            <a href="{{ tenant_route('facility.rooms.create') }}" class="btn btn-primary btn-sm">
                                                <i class="fas fa-plus me-1"></i>
                                                Tambah Ruangan
                                            </a>
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
    </div>
</div>
@endsection
