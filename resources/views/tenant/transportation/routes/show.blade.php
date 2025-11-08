@extends('layouts.tenant')

@section('title', 'Detail Rute')
@section('page-title', 'Detail Rute')

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
    
    .modern-card-header {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
        border-left: 4px solid #3b82f6;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-route me-2"></i>
                    Detail Rute
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-4">
                                <h4 class="text-primary">{{ $route->name }}</h4>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-map-marker-alt text-primary me-1"></i>
                                    {{ $route->start_location }} → 
                                    <i class="fas fa-map-marker-alt text-danger me-1"></i>
                                    {{ $route->end_location }}
                                </p>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Jarak</label>
                                    <div class="detail-box">
                                        {{ $route->distance ? number_format($route->distance, 1) . ' km' : '-' }}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Durasi</label>
                                    <div class="detail-box">
                                        {{ $route->estimated_duration ? $route->estimated_duration . ' menit' : '-' }}
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Status</label>
                                <div>
                                    @if($route->status == 'active')
                                        <span class="badge bg-success">Aktif</span>
                                    @else
                                        <span class="badge bg-secondary">Tidak Aktif</span>
                                    @endif
                                </div>
                            </div>

                            @if($route->description)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Deskripsi</label>
                                <div class="detail-box">
                                    {{ $route->description }}
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
                                        <a href="{{ tenant_route('transportation.routes.edit', $route->id) }}" class="btn btn-warning">
                                            <i class="fas fa-edit me-1"></i>
                                            Edit Rute
                                        </a>
                                        <a href="{{ tenant_route('transportation.routes') }}" class="btn btn-info">
                                            <i class="fas fa-list me-1"></i>
                                            Kembali ke Daftar
                                        </a>
                                        <form action="{{ tenant_route('transportation.routes.destroy', $route->id) }}" method="POST" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus rute ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger w-100">
                                                <i class="fas fa-trash me-1"></i>
                                                Hapus Rute
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
                                            <i class="fas fa-calendar-plus me-1 text-primary"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($route->created_at, true) }}
                                        </div>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block mb-1">Diperbarui:</small>
                                        <div class="detail-box">
                                            <i class="fas fa-calendar-check me-1 text-primary"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($route->updated_at, true) }}
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

