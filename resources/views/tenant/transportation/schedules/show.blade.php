@extends('layouts.tenant')

@section('title', 'Detail Jadwal')
@section('page-title', 'Detail Jadwal')

@push('styles')
<style>
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .info-card {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e9ecef;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .info-card-header {
        background: #f8f9fa;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e9ecef;
        font-weight: 600;
        color: #495057;
    }
    
    .detail-box {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #22c55e;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-clock me-2"></i>
                    Detail Jadwal
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-4">
                                <h4 class="text-success">{{ $schedule->route->name ?? 'N/A' }}</h4>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-route me-1"></i>
                                    {{ $schedule->route->start_location ?? 'N/A' }} → {{ $schedule->route->end_location ?? 'N/A' }}
                                </p>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Waktu Keberangkatan</label>
                                    <div class="detail-box">
                                        <i class="fas fa-clock me-1 text-primary"></i>
                                        {{ \App\Helpers\DateHelper::formatIndonesian($schedule->departure_time, true) }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Waktu Kedatangan</label>
                                    <div class="detail-box">
                                        <i class="fas fa-clock me-1 text-success"></i>
                                        {{ \App\Helpers\DateHelper::formatIndonesian($schedule->arrival_time, true) }}
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Nama Supir</label>
                                    <div class="detail-box">
                                        {{ $schedule->driver_name ?? '-' }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">No. HP Supir</label>
                                    <div class="detail-box">
                                        {{ $schedule->driver_phone ?? '-' }}
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Nomor Kendaraan</label>
                                    <div class="detail-box">
                                        {{ $schedule->vehicle_number ?? '-' }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Kapasitas</label>
                                    <div class="detail-box">
                                        {{ $schedule->capacity ?? '-' }} penumpang
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Harga</label>
                                    <div class="detail-box">
                                        {{ $schedule->price ? 'Rp ' . number_format($schedule->price, 0, ',', '.') : '-' }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Status</label>
                                    <div>
                                        @if($schedule->status == 'scheduled')
                                            <span class="badge bg-primary">Terjadwal</span>
                                        @elseif($schedule->status == 'ongoing')
                                            <span class="badge bg-success">Berlangsung</span>
                                        @elseif($schedule->status == 'completed')
                                            <span class="badge bg-info">Selesai</span>
                                        @else
                                            <span class="badge bg-danger">Dibatalkan</span>
                                        @endif
                                    </div>
                                </div>
                            </div>

                            @if($schedule->notes)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Catatan</label>
                                <div class="detail-box">
                                    {{ $schedule->notes }}
                                </div>
                            </div>
                            @endif
                        </div>

                        <div class="col-md-4">
                            <div class="info-card mb-3">
                                <div class="info-card-header">
                                    <i class="fas fa-cog me-2"></i>
                                    Aksi
                                </div>
                                <div class="card-body">
                                    <div class="d-grid gap-2">
                                        <a href="{{ tenant_route('transportation.schedules.edit', $schedule->id) }}" class="btn btn-warning">
                                            <i class="fas fa-edit me-1"></i>
                                            Edit Jadwal
                                        </a>
                                        <a href="{{ tenant_route('transportation.schedules') }}" class="btn btn-info">
                                            <i class="fas fa-list me-1"></i>
                                            Kembali ke Daftar
                                        </a>
                                        <form action="{{ tenant_route('transportation.schedules.destroy', $schedule->id) }}" method="POST" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus jadwal ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger w-100">
                                                <i class="fas fa-trash me-1"></i>
                                                Hapus Jadwal
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="info-card-header">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Informasi
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <small class="text-muted d-block mb-1">Dibuat:</small>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar-plus me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($schedule->created_at, true) }}
                                        </div>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block mb-1">Diperbarui:</small>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar-check me-1 text-success"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($schedule->updated_at, true) }}
                                        </div>
                                    </div>
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

