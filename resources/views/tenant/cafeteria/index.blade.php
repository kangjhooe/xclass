@extends('layouts.tenant')

@section('title', 'Kafetaria')
@section('page-title', 'Sistem Kafetaria')

@push('styles')
<style>
    /* Modern Stats Cards */
    .stats-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        padding: 1.75rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
        height: 5px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .stats-card.primary::before {
        --card-color-1: #3b82f6;
        --card-color-2: #2563eb;
    }
    
    .stats-card.success::before {
        --card-color-1: #10b981;
        --card-color-2: #059669;
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
        width: 72px;
        height: 72px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }
    
    .stats-card:hover .stats-icon {
        transform: rotate(5deg) scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-number {
        font-size: 3rem;
        font-weight: 800;
        margin: 0.5rem 0;
        background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
        transition: all 0.3s ease;
    }
    
    .stats-card:hover .stats-number {
        transform: scale(1.05);
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    
    .modern-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 1.5rem 2rem;
        border: none;
        font-weight: 700;
        font-size: 1.125rem;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
    }
    
    .modern-card-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .modern-card:hover .modern-card-header::before {
        left: 100%;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.875rem 1.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .quick-action-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .quick-action-btn.secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }
    
    .quick-action-btn.secondary:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .quick-action-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .quick-action-btn.primary:hover {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .quick-action-btn.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
    
    .quick-action-btn.success:hover {
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    
    .quick-action-btn.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
    }
    
    .quick-action-btn.info:hover {
        box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
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
                        <div class="stats-label">Total Menu</div>
                        <div class="stats-number">{{ $stats['total_menu_items'] }}</div>
                    </div>
                    <div class="stats-icon primary">
                        <i class="fas fa-utensils"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Tersedia</div>
                        <div class="stats-number">{{ $stats['available_items'] }}</div>
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
                        <div class="stats-label">Total Pesanan</div>
                        <div class="stats-number">{{ $stats['total_orders'] }}</div>
                    </div>
                    <div class="stats-icon info">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Hari Ini</div>
                        <div class="stats-number">{{ $stats['today_orders'] }}</div>
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
                        <a href="{{ tenant_route('cafeteria.menu.create') }}" class="quick-action-btn primary">
                            <i class="fas fa-plus"></i>
                            Tambah Menu
                        </a>
                        <a href="{{ tenant_route('cafeteria.orders.create') }}" class="quick-action-btn success">
                            <i class="fas fa-shopping-cart"></i>
                            Buat Pesanan
                        </a>
                        <a href="{{ tenant_route('cafeteria.menu') }}" class="quick-action-btn info">
                            <i class="fas fa-list"></i>
                            Daftar Menu
                        </a>
                        <a href="{{ tenant_route('cafeteria.orders') }}" class="quick-action-btn">
                            <i class="fas fa-clipboard-list"></i>
                            Daftar Pesanan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Orders & Popular Items -->
    <div class="row">
        <div class="col-md-6 mb-4">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-history me-2"></i>
                    Pesanan Terbaru
                </div>
                <div class="card-body p-0">
                    @if($recentOrders->count() > 0)
                        <div class="list-group list-group-flush">
                            @foreach($recentOrders as $order)
                            <div class="list-group-item border-0 px-4 py-3" style="transition: all 0.3s ease;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1 fw-bold">{{ $order->student->name ?? 'N/A' }}</h6>
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            {{ \App\Helpers\DateHelper::formatIndonesian($order->created_at, true) }}
                                        </small>
                                    </div>
                                    <div>
                                        @if($order->status == 'pending')
                                            <span class="badge bg-warning px-3 py-2" style="font-weight: 600;">Menunggu</span>
                                        @elseif($order->status == 'preparing')
                                            <span class="badge bg-info px-3 py-2" style="font-weight: 600;">Menyiapkan</span>
                                        @elseif($order->status == 'ready')
                                            <span class="badge bg-success px-3 py-2" style="font-weight: 600;">Siap</span>
                                        @elseif($order->status == 'completed')
                                            <span class="badge bg-primary px-3 py-2" style="font-weight: 600;">Selesai</span>
                                        @else
                                            <span class="badge bg-danger px-3 py-2" style="font-weight: 600;">Dibatalkan</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center p-5">
                            <div class="mb-4">
                                <i class="fas fa-inbox fa-5x text-muted" style="opacity: 0.3;"></i>
                            </div>
                            <h5 class="text-muted mb-2" style="font-weight: 600;">Belum ada pesanan</h5>
                            <p class="text-muted mb-4">Pesanan akan muncul di sini</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-md-6 mb-4">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-star me-2"></i>
                    Menu Populer
                </div>
                <div class="card-body p-0">
                    @if($popularItems->count() > 0)
                        <div class="list-group list-group-flush">
                            @foreach($popularItems as $item)
                            <div class="list-group-item border-0 px-4 py-3" style="transition: all 0.3s ease;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1 fw-bold">{{ $item->name }}</h6>
                                        <small class="text-muted text-capitalize">
                                            <i class="fas fa-tag me-1"></i>
                                            {{ $item->category }}
                                        </small>
                                    </div>
                                    <div>
                                        <span class="badge bg-primary px-3 py-2" style="font-weight: 600;">
                                            {{ $item->orders_count }} pesanan
                                        </span>
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center p-5">
                            <div class="mb-4">
                                <i class="fas fa-utensils fa-5x text-muted" style="opacity: 0.3;"></i>
                            </div>
                            <h5 class="text-muted mb-2" style="font-weight: 600;">Belum ada menu</h5>
                            <p class="text-muted mb-4">Tambahkan menu untuk mulai</p>
                            <a href="{{ tenant_route('cafeteria.menu.create') }}" class="quick-action-btn primary">
                                <i class="fas fa-plus"></i>
                                Tambah Menu Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
