@extends('layouts.tenant')

@section('title', 'Dashboard Buku Tamu')
@section('page-title', 'Dashboard Buku Tamu')

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
        --card-color-2: #1d4ed8;
    }
    
    .stats-card.success::before {
        --card-color-1: #10b981;
        --card-color-2: #059669;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.info::before {
        --card-color-1: #06b6d4;
        --card-color-2: #0891b2;
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
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
        background: #fff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        text-decoration: none;
        color: #374151;
        transition: all 0.3s ease;
        display: block;
        position: relative;
        overflow: hidden;
    }
    
    .quick-action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }
    
    .quick-action-btn:hover::before {
        left: 100%;
    }
    
    .quick-action-btn:hover {
        border-color: #667eea;
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
        color: #667eea;
    }
    
    .quick-action-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        font-size: 20px;
        color: white;
    }
    
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
    }
    
    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .page-header p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
    }
    
    .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        color: white;
        flex-shrink: 0;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1><i class="fas fa-users me-3"></i>Dashboard Buku Tamu</h1>
    <p>Kelola dan pantau data tamu yang berkunjung ke sekolah</p>
</div>

<!-- Statistik Cards -->
<div class="row g-4 mb-4">
    <div class="col-lg-3 col-md-6">
        <div class="stats-card primary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Tamu Hari Ini</div>
                    <div class="stats-number text-primary">{{ $stats['today_visitors'] }}</div>
                    <small class="text-muted">Kunjungan hari ini</small>
                </div>
                <div class="stats-icon primary">
                    <i class="fas fa-calendar-day"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-6">
        <div class="stats-card success">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Tamu Bulan Ini</div>
                    <div class="stats-number text-success">{{ $stats['month_visitors'] }}</div>
                    <small class="text-muted">Kunjungan bulan ini</small>
                </div>
                <div class="stats-icon success">
                    <i class="fas fa-calendar-alt"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-6">
        <div class="stats-card warning">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Sedang di Lokasi</div>
                    <div class="stats-number text-warning">{{ $stats['checked_in'] }}</div>
                    <small class="text-muted">Belum check out</small>
                </div>
                <div class="stats-icon warning">
                    <i class="fas fa-user-check"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-6">
        <div class="stats-card info">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Tamu</div>
                    <div class="stats-number text-info">{{ $stats['total_visitors'] }}</div>
                    <small class="text-muted">Total kunjungan</small>
                </div>
                <div class="stats-icon info">
                    <i class="fas fa-users"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-bolt me-2"></i>
                    Aksi Cepat
                </h6>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('guest-book.create') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="fw-semibold">Tambah Tamu Baru</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('guest-book.index') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-list"></i>
                            </div>
                            <div class="fw-semibold">Lihat Semua Tamu</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('guest-book.index', ['status' => 'checked_in']) }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="fw-semibold">Tamu di Lokasi</div>
                        </a>
                    </div>
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('guest-book.index', ['date_from' => now()->format('Y-m-d')]) }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="fw-semibold">Tamu Hari Ini</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Tamu Terbaru -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-users me-2"></i>
                    Tamu Terbaru
                </h6>
                <a href="{{ tenant_route('guest-book.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Lihat Semua
                </a>
            </div>
            <div class="card-body">
                @if($recentVisitors->count() > 0)
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th width="5%">#</th>
                                <th width="20%">Nama Tamu</th>
                                <th width="15%">Organisasi</th>
                                <th width="12%">Tujuan</th>
                                <th width="15%">Orang yang Ditemui</th>
                                <th width="10%">Tanggal</th>
                                <th width="8%">Waktu</th>
                                <th width="8%">Status</th>
                                <th width="7%">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($recentVisitors as $index => $visitor)
                            <tr>
                                <td class="text-center">{{ $index + 1 }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-circle me-2" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                            {{ strtoupper(substr($visitor->visitor_name, 0, 1)) }}
                                        </div>
                                        <div>
                                            <div class="fw-semibold">{{ $visitor->visitor_name }}</div>
                                            @if($visitor->visitor_phone)
                                                <small class="text-muted">
                                                    <i class="fas fa-phone me-1"></i>{{ $visitor->visitor_phone }}
                                                </small>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $visitor->visitor_organization }}">
                                        {{ $visitor->visitor_organization ?? '-' }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge bg-info">{{ $visitor->purpose_label }}</span>
                                </td>
                                <td>
                                    <span class="text-truncate d-inline-block" style="max-width: 120px;" title="{{ $visitor->person_to_meet }}">
                                        {{ $visitor->person_to_meet ?? '-' }}
                                    </span>
                                </td>
                                <td class="text-center">{{ \App\Helpers\DateHelper::formatIndonesian($visitor->visit_date) }}</td>
                                <td class="text-center">
                                    <span class="badge bg-secondary">{{ $visitor->visit_time->format('H:i') }}</span>
                                </td>
                                <td class="text-center">
                                    <span class="badge bg-{{ $visitor->status_color }}">
                                        {{ $visitor->status_label }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group" role="group">
                                        <a href="{{ tenant_route('guest-book.show', $visitor) }}" 
                                           class="btn btn-sm btn-outline-primary" title="Lihat Detail" data-bs-toggle="tooltip">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        @if($visitor->status == 'checked_in')
                                        <form action="{{ tenant_route('guest-book.checkout', $visitor) }}" 
                                              method="POST" class="d-inline" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin check out tamu ini?')">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-success" title="Check Out" data-bs-toggle="tooltip">
                                                <i class="fas fa-sign-out-alt"></i>
                                            </button>
                                        </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @else
                <div class="text-center py-5">
                    <div class="mb-3">
                        <i class="fas fa-users fa-4x text-muted" style="opacity: 0.3;"></i>
                    </div>
                    <h5 class="text-muted mb-3">Belum ada data tamu</h5>
                    <p class="text-muted mb-4">Mulai dengan menambahkan data tamu pertama</p>
                    <a href="{{ tenant_route('guest-book.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Tambah Data Tamu
                    </a>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
</script>
@endpush
