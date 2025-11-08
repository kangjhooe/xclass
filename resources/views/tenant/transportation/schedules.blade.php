@extends('layouts.tenant')

@section('title', 'Jadwal')
@section('page-title', 'Jadwal')

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
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
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
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
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
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
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
                    <i class="fas fa-clock me-2 text-success"></i>
                    Daftar Jadwal
                </h4>
                <a href="{{ tenant_route('transportation.schedules.create') }}" class="quick-action-btn">
                    <i class="fas fa-plus"></i>
                    Tambah Jadwal
                </a>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="modern-card">
                <div class="card-body">
                    <form method="GET" action="{{ tenant_route('transportation.schedules') }}" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Cari</label>
                            <input type="text" name="search" class="form-control" 
                                   placeholder="Nama rute..." 
                                   value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Rute</label>
                            <select name="route_id" class="form-select">
                                <option value="">Semua Rute</option>
                                @foreach($routes as $route)
                                    <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                        {{ $route->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Tanggal</label>
                            <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button type="submit" class="btn btn-success w-100">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Schedules Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Data Jadwal
                </div>
                <div class="card-body p-0">
                    @if($schedules->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Rute</th>
                                        <th>Waktu Keberangkatan</th>
                                        <th>Waktu Kedatangan</th>
                                        <th>Supir</th>
                                        <th>Kendaraan</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($schedules as $schedule)
                                    <tr>
                                        <td>
                                            <strong>{{ $schedule->route->name ?? 'N/A' }}</strong>
                                        </td>
                                        <td>
                                            <i class="fas fa-clock me-1 text-primary"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($schedule->departure_time, true) }}
                                        </td>
                                        <td>
                                            <i class="fas fa-clock me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($schedule->arrival_time, true) }}
                                        </td>
                                        <td>
                                            {{ $schedule->driver_name ?? '-' }}
                                            @if($schedule->driver_phone)
                                                <br><small class="text-muted">{{ $schedule->driver_phone }}</small>
                                            @endif
                                        </td>
                                        <td>{{ $schedule->vehicle_number ?? '-' }}</td>
                                        <td>
                                            @if($schedule->status == 'scheduled')
                                                <span class="badge bg-primary">Terjadwal</span>
                                            @elseif($schedule->status == 'ongoing')
                                                <span class="badge bg-success">Berlangsung</span>
                                            @elseif($schedule->status == 'completed')
                                                <span class="badge bg-info">Selesai</span>
                                            @else
                                                <span class="badge bg-danger">Dibatalkan</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('transportation.schedules.show', $schedule->id) }}" class="btn btn-sm btn-outline-info" title="Lihat Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('transportation.schedules.edit', $schedule->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('transportation.schedules.destroy', $schedule->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus jadwal ini?')">
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
                                        Menampilkan {{ $schedules->firstItem() }} sampai {{ $schedules->lastItem() }} dari {{ $schedules->total() }} data
                                    </small>
                                </div>
                                <div>
                                    {{ $schedules->links() }}
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="text-center p-4">
                            <i class="fas fa-clock fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Belum ada data jadwal</p>
                            <a href="{{ tenant_route('transportation.schedules.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus"></i>
                                Tambah Jadwal Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

