@extends('layouts.tenant')

@section('title', 'SPP')
@section('page-title', 'Sumbangan Pembinaan Pendidikan')

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
    
    .stats-card.danger::before {
        --card-color-1: #ef4444;
        --card-color-2: #dc2626;
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
    
    .stats-icon.danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
    
    .stats-amount {
        font-size: 1.25rem;
        font-weight: 600;
        color: #10b981;
    }
    
    /* Modern Table Styles */
    .modern-table {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    
    .modern-table thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .modern-table thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .modern-table tbody tr {
        transition: all 0.2s ease;
    }
    
    .modern-table tbody tr:hover {
        background-color: #f8f9fa;
        transform: scale(1.01);
    }
    
    .modern-table tbody td {
        padding: 1rem;
        vertical-align: middle;
        border-top: 1px solid #e5e7eb;
    }
    
    /* Filter Card */
    .filter-card {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
    }
    
    /* Badge Styles */
    .badge-modern {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Button Groups */
    .btn-action {
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['total_payments']) }}</div>
                        <div class="stats-label">Total Pembayaran</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['paid_payments']) }}</div>
                        <div class="stats-label">Sudah Lunas</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['pending_payments']) }}</div>
                        <div class="stats-label">Belum Bayar</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['overdue_payments']) }}</div>
                        <div class="stats-label">Terlambat</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Amount Summary -->
    <div class="row mb-4">
        <div class="col-lg-6 mb-3">
            <div class="stats-card info">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Total Terkumpul</div>
                        <div class="stats-amount">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</div>
                    </div>
                    <div class="stats-icon info">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Belum Terbayar</div>
                        <div class="stats-amount" style="color: #f59e0b;">Rp {{ number_format($stats['pending_amount'], 0, ',', '.') }}</div>
                    </div>
                    <div class="stats-icon warning">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Main Content Card -->
    <div class="card modern-table">
        <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
            <div class="d-flex justify-content-between align-items-center">
                <h3 class="card-title mb-0" style="color: white;">
                    <i class="fas fa-list me-2"></i>Data Pembayaran SPP
                </h3>
                <div class="btn-group">
                    <a href="{{ tenant_route('spp.payments.create') }}" class="btn btn-light btn-sm">
                        <i class="fas fa-plus"></i> Tambah Pembayaran
                    </a>
                    <a href="{{ tenant_route('spp.create') }}" class="btn btn-light btn-sm">
                        <i class="fas fa-file-invoice"></i> Buat Tagihan
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Filter Card -->
        <div class="filter-card">
            <form method="GET" action="{{ tenant_route('spp.index') }}" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label small text-muted">Cari</label>
                    <input type="text" name="search" class="form-control form-control-sm" 
                           placeholder="Nama siswa, NIS, atau no. kwitansi..." 
                           value="{{ request('search') }}">
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Status</label>
                    <select name="status" class="form-select form-select-sm">
                        <option value="">Semua Status</option>
                        <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Belum Bayar</option>
                        <option value="paid" {{ request('status') == 'paid' ? 'selected' : '' }}>Lunas</option>
                        <option value="overdue" {{ request('status') == 'overdue' ? 'selected' : '' }}>Terlambat</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Siswa</label>
                    <select name="student_id" class="form-select form-select-sm">
                        <option value="">Semua Siswa</option>
                        @foreach($students as $student)
                            <option value="{{ $student->id }}" {{ request('student_id') == $student->id ? 'selected' : '' }}>
                                {{ $student->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Tahun</label>
                    <input type="number" name="year" class="form-control form-control-sm" 
                           placeholder="Tahun" 
                           value="{{ request('year') }}" 
                           min="2020" max="2100">
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Bulan</label>
                    <select name="month" class="form-select form-select-sm">
                        <option value="">Semua Bulan</option>
                        @for($i = 1; $i <= 12; $i++)
                            <option value="{{ $i }}" {{ request('month') == $i ? 'selected' : '' }}>
                                {{ \Carbon\Carbon::create()->month($i)->format('F') }}
                            </option>
                        @endfor
                    </select>
                </div>
                <div class="col-md-1">
                    <label class="form-label small text-muted">&nbsp;</label>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary btn-sm w-100">
                            <i class="fas fa-search"></i>
                        </button>
                        <a href="{{ tenant_route('spp.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-redo"></i>
                        </a>
                    </div>
                </div>
            </form>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0 modern-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Siswa</th>
                            <th>Periode</th>
                            <th>Jumlah</th>
                            <th>Jatuh Tempo</th>
                            <th>Status</th>
                            <th>Metode</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payments as $index => $payment)
                        <tr>
                            <td>{{ $payments->firstItem() + $index }}</td>
                            <td>
                                <div>
                                    <strong>{{ $payment->student->name ?? 'N/A' }}</strong><br>
                                    <small class="text-muted">{{ $payment->student->student_number ?? 'N/A' }}</small>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <strong>{{ $payment->period_label ?? 'N/A' }}</strong><br>
                                    <small class="text-muted">{{ $payment->receipt_number ?? '-' }}</small>
                                </div>
                            </td>
                            <td>
                                <strong class="text-primary">Rp {{ number_format($payment->amount, 0, ',', '.') }}</strong>
                            </td>
                            <td>
                                {{ $payment->due_date ? \App\Helpers\DateHelper::formatIndonesian($payment->due_date) : '-' }}
                                @if($payment->paid_date)
                                    <br><small class="text-success">Lunas: {{ \App\Helpers\DateHelper::formatIndonesian($payment->paid_date) }}</small>
                                @endif
                            </td>
                            <td>
                                <span class="badge badge-modern bg-{{ $payment->status_color }}">
                                    {{ $payment->status_label }}
                                </span>
                            </td>
                            <td>
                                @if($payment->payment_method)
                                    <span class="badge bg-info">{{ $payment->method_label }}</span>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group" role="group">
                                    <a href="{{ tenant_route('spp.payments.show', $payment->id) }}" 
                                       class="btn btn-info btn-sm btn-action" 
                                       title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    @if($payment->payment_status == 'paid')
                                        <a href="{{ tenant_route('spp.payments.invoice', $payment->id) }}" 
                                           class="btn btn-success btn-sm btn-action" 
                                           title="Download Invoice">
                                            <i class="fas fa-file-pdf"></i>
                                        </a>
                                    @endif
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                                    <p class="mb-0">Belum ada data pembayaran SPP</p>
                                    <a href="{{ tenant_route('spp.payments.create') }}" class="btn btn-primary btn-sm mt-3">
                                        <i class="fas fa-plus"></i> Tambah Pembayaran Pertama
                                    </a>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            @if($payments->hasPages())
            <div class="card-footer bg-white">
                <div class="d-flex justify-content-center">
                    {{ $payments->links() }}
                </div>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection
