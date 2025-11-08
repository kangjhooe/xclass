@extends('layouts.tenant')

@section('title', 'Sarana Prasarana')
@section('page-title', 'Sarana Prasarana')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-building me-2"></i>
                        Manajemen Sarana Prasarana
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('facility.buildings') }}" class="btn btn-primary">
                                    <i class="fas fa-building me-1"></i>
                                    Gedung
                                </a>
                                <a href="{{ tenant_route('facility.rooms') }}" class="btn btn-info">
                                    <i class="fas fa-door-open me-1"></i>
                                    Ruangan
                                </a>
                                <a href="{{ tenant_route('facility.lands') }}" class="btn btn-success">
                                    <i class="fas fa-map me-1"></i>
                                    Lahan
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari sarana prasarana...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_buildings'] }}</h4>
                                            <small>Total Gedung</small>
                                        </div>
                                        <i class="fas fa-building fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_rooms'] }}</h4>
                                            <small>Ruangan</small>
                                        </div>
                                        <i class="fas fa-door-open fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['class_rooms'] }}</h4>
                                            <small>Kelas</small>
                                        </div>
                                        <i class="fas fa-chalkboard fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_lands'] }}</h4>
                                            <small>Lahan</small>
                                        </div>
                                        <i class="fas fa-map fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Gedung Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentBuildings as $building)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $building->name }}</h6>
                                            <small class="text-muted">{{ $building->floors }} lantai - {{ $building->capacity }} orang</small>
                                        </div>
                                        <div>
                                            @if($building->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($building->status == 'inactive')
                                                <span class="badge bg-warning">Tidak Aktif</span>
                                            @else
                                                <span class="badge bg-info">Maintenance</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada gedung</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Ruangan Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentRooms as $room)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $room->name }}</h6>
                                            <small class="text-muted">{{ $room->building_name ?? 'N/A' }} - Lantai {{ $room->floor }}</small>
                                        </div>
                                        <div>
                                            @if($room->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($room->status == 'inactive')
                                                <span class="badge bg-warning">Tidak Aktif</span>
                                            @else
                                                <span class="badge bg-info">Maintenance</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada ruangan</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Lahan Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentLands as $land)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $land->name }}</h6>
                                            <small class="text-muted">{{ number_format($land->area, 2, ',', '.') }} {{ $land->area_unit == 'm2' ? 'm²' : 'hektar' }}</small>
                                        </div>
                                        <div>
                                            @if($land->status == 'active')
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($land->status == 'inactive')
                                                <span class="badge bg-warning">Tidak Aktif</span>
                                            @else
                                                <span class="badge bg-info">Maintenance</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada lahan</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
@endsection
