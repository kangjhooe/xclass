@extends('layouts.tenant')

@section('title', 'Transportasi')
@section('page-title', 'Transportasi')

@push('styles')
<style>
    /* Modern Stats Cards */
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before {
        --card-color-1: #3b82f6;
        --card-color-2: #2563eb;
    }
    
    .stats-card.success::before {
        --card-color-1: #22c55e;
        --card-color-2: #16a34a;
    }
    
    .stats-card.info::before {
        --card-color-1: #06b6d4;
        --card-color-2: #0891b2;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-number {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0.5rem 0;
        color: #1f2937;
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Modern Card Styles */
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .quick-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .quick-action-btn.secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
    }
    
    .quick-action-btn.secondary:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .quick-action-btn.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .quick-action-btn.success:hover {
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Stats Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Total Rute</div>
                        <div class="stats-number">{{ $stats['total_routes'] }}</div>
                    </div>
                    <div class="stats-icon primary">
                        <i class="fas fa-route"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Aktif</div>
                        <div class="stats-number">{{ $stats['active_routes'] }}</div>
                    </div>
                    <div class="stats-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card info">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Total Jadwal</div>
                        <div class="stats-number">{{ $stats['total_schedules'] }}</div>
                    </div>
                    <div class="stats-icon info">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Hari Ini</div>
                        <div class="stats-number">{{ $stats['today_schedules'] }}</div>
                    </div>
                    <div class="stats-icon warning">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-bolt me-2"></i>
                    Aksi Cepat
                </div>
                <div class="card-body p-3">
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="{{ tenant_route('transportation.routes.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus"></i>
                            Tambah Rute
                        </a>
                        <a href="{{ tenant_route('transportation.routes') }}" class="quick-action-btn secondary">
                            <i class="fas fa-route"></i>
                            Daftar Rute
                        </a>
                        <a href="{{ tenant_route('transportation.schedules.create') }}" class="quick-action-btn success">
                            <i class="fas fa-plus"></i>
                            Tambah Jadwal
                        </a>
                        <a href="{{ tenant_route('transportation.schedules') }}" class="quick-action-btn secondary">
                            <i class="fas fa-clock"></i>
                            Daftar Jadwal
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Data -->
    <div class="row">
        <div class="col-md-6 mb-3">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-route me-2"></i>
                    Rute Terbaru
                </div>
                <div class="card-body">
                    @forelse($recentRoutes as $route)
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                            <h6 class="mb-1 fw-bold">{{ $route->name }}</h6>
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                {{ $route->start_location }} → {{ $route->end_location }}
                            </small>
                        </div>
                        <div>
                            @if($route->status == 'active')
                                <span class="badge bg-success">Aktif</span>
                            @else
                                <span class="badge bg-secondary">Tidak Aktif</span>
                            @endif
                        </div>
                    </div>
                    @empty
                    <div class="text-center p-4">
                        <i class="fas fa-route fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Belum ada rute</p>
                        <a href="{{ tenant_route('transportation.routes.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus"></i>
                            Tambah Rute Pertama
                        </a>
                    </div>
                    @endforelse
                    @if($recentRoutes->count() > 0)
                    <div class="text-center mt-3">
                        <a href="{{ tenant_route('transportation.routes') }}" class="btn btn-sm btn-outline-primary">
                            Lihat Semua Rute
                        </a>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-md-6 mb-3">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-clock me-2"></i>
                    Jadwal Terbaru
                </div>
                <div class="card-body">
                    @forelse($recentSchedules as $schedule)
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                            <h6 class="mb-1 fw-bold">{{ $schedule->route->name ?? 'N/A' }}</h6>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                {{ \App\Helpers\DateHelper::formatIndonesian($schedule->departure_time, true) }}
                            </small>
                        </div>
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
                    @empty
                    <div class="text-center p-4">
                        <i class="fas fa-clock fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Belum ada jadwal</p>
                        <a href="{{ tenant_route('transportation.schedules.create') }}" class="quick-action-btn success">
                            <i class="fas fa-plus"></i>
                            Tambah Jadwal Pertama
                        </a>
                    </div>
                    @endforelse
                    @if($recentSchedules->count() > 0)
                    <div class="text-center mt-3">
                        <a href="{{ tenant_route('transportation.schedules') }}" class="btn btn-sm btn-outline-primary">
                            Lihat Semua Jadwal
                        </a>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
