@extends('layouts.tenant')

@section('title', 'Pesanan')
@section('page-title', 'Data Pesanan Kafetaria')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
    }
    
    .page-header h2 {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
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
    
    /* Table Styles */
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
    }
    
    .table-modern thead th {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #495057;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 1px;
        padding: 1.25rem 1rem;
        border: none;
        border-bottom: 3px solid #f59e0b;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-left: 3px solid transparent;
    }
    
    .table-modern tbody tr:hover {
        background: linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
        border-left-color: #f59e0b;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
    }
    
    .table-modern tbody td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.95rem;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }
    
    .quick-action-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        color: white;
    }
    
    .quick-action-btn.secondary {
        background: white;
        color: #f59e0b;
        border: 2px solid #f59e0b;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    }
    
    .quick-action-btn.secondary:hover {
        background: #f59e0b;
        color: white;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    
    .quick-action-btn.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
    
    .quick-action-btn.success:hover {
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    
    /* Action Buttons */
    .btn-action {
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Status Badge */
    .status-badge {
        padding: 0.5rem 0.875rem;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Page Header with Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 class="mb-2">
                            <i class="fas fa-clipboard-list me-2"></i>
                            Data Pesanan Kafetaria
                        </h2>
                        <p class="text-muted mb-0">Kelola semua pesanan kafetaria</p>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="{{ tenant_route('cafeteria.index') }}" class="quick-action-btn secondary">
                            <i class="fas fa-arrow-left"></i>
                            Kembali
                        </a>
                        <a href="{{ tenant_route('cafeteria.orders.create') }}" class="quick-action-btn success">
                            <i class="fas fa-plus"></i>
                            Tambah Pesanan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Orders Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Daftar Pesanan
                </div>
                <div class="card-body p-0">
                    @if($orders->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Pelanggan</th>
                                        <th>Menu</th>
                                        <th>Jumlah Item</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($orders as $index => $order)
                                    <tr>
                                        <td>{{ $orders->firstItem() + $index }}</td>
                                        <td>
                                            <strong>{{ $order->student->name ?? 'N/A' }}</strong>
                                            @if($order->student && $order->student->student_number)
                                                <br><small class="text-muted">{{ $order->student->student_number }}</small>
                                            @endif
                                        </td>
                                        <td>
                                            @if($order->menuItems->count() > 0)
                                                @foreach($order->menuItems->take(2) as $menuItem)
                                                    <span class="badge bg-info me-1">{{ $menuItem->name }} ({{ $menuItem->pivot->quantity }})</span>
                                                @endforeach
                                                @if($order->menuItems->count() > 2)
                                                    <span class="badge bg-secondary">+{{ $order->menuItems->count() - 2 }} lagi</span>
                                                @endif
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            <strong>{{ $order->menuItems->sum('pivot.quantity') }}</strong>
                                        </td>
                                        <td>
                                            <strong class="text-primary">Rp {{ number_format($order->total_amount ?? 0, 0, ',', '.') }}</strong>
                                        </td>
                                        <td>
                                            @if($order->status == 'pending')
                                                <span class="status-badge bg-warning text-white">Menunggu</span>
                                            @elseif($order->status == 'preparing')
                                                <span class="status-badge bg-info text-white">Menyiapkan</span>
                                            @elseif($order->status == 'ready')
                                                <span class="status-badge bg-success text-white">Siap</span>
                                            @elseif($order->status == 'completed')
                                                <span class="status-badge bg-primary text-white">Selesai</span>
                                            @else
                                                <span class="status-badge bg-danger text-white">Dibatalkan</span>
                                            @endif
                                        </td>
                                        <td>
                                            <small>{{ \App\Helpers\DateHelper::formatIndonesian($order->created_at, true) }}</small>
                                        </td>
                                        <td>
                                            <div class="d-flex gap-2">
                                                <a href="{{ tenant_route('cafeteria.orders.show', $order->id) }}" class="btn btn-sm btn-outline-info btn-action" title="Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="card-footer bg-white">
                            {{ $orders->links() }}
                        </div>
                    @else
                        <div class="text-center p-5">
                            <div class="mb-4">
                                <i class="fas fa-inbox fa-5x text-muted" style="opacity: 0.3;"></i>
                            </div>
                            <h5 class="text-muted mb-2" style="font-weight: 600;">Belum ada pesanan</h5>
                            <p class="text-muted mb-4">Mulai dengan membuat pesanan pertama</p>
                            <a href="{{ tenant_route('cafeteria.orders.create') }}" class="quick-action-btn success">
                                <i class="fas fa-plus"></i>
                                Tambah Pesanan Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
