@extends('layouts.tenant')

@section('title', 'Kedisiplinan')
@section('page-title', 'Sistem Kedisiplinan')

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
        --card-color-1: #ef4444;
        --card-color-2: #dc2626;
    }
    
    .stats-card.success::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f97316;
        --card-color-2: #ea580c;
    }
    
    .stats-card.danger::before {
        --card-color-1: #dc2626;
        --card-color-2: #b91c1c;
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
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    }
    
    .stats-icon.danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        border-bottom: 3px solid #ef4444;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-left: 3px solid transparent;
    }
    
    .table-modern tbody tr:hover {
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
        border-left-color: #ef4444;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
    }
    
    .table-modern tbody td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.95rem;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
    
    .quick-action-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        color: white;
    }
    
    .quick-action-btn.secondary {
        background: white;
        color: #ef4444;
        border: 2px solid #ef4444;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
    }
    
    .quick-action-btn.secondary:hover {
        background: #ef4444;
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
                        <div class="stats-label">Total Tindakan</div>
                        <div class="stats-number">{{ $stats['total_actions'] }}</div>
                    </div>
                    <div class="stats-icon primary">
                        <i class="fas fa-gavel"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Peringatan</div>
                        <div class="stats-number">{{ $stats['warning_actions'] }}</div>
                    </div>
                    <div class="stats-icon success">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Bulan Ini</div>
                        <div class="stats-number">{{ $stats['this_month_actions'] }}</div>
                    </div>
                    <div class="stats-icon warning">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Serius</div>
                        <div class="stats-number">{{ $stats['serious_actions'] }}</div>
                    </div>
                    <div class="stats-icon danger">
                        <i class="fas fa-ban"></i>
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
                        <a href="{{ tenant_route('discipline.actions.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus"></i>
                            Tambah Tindakan Disiplin
                        </a>
                        <a href="{{ tenant_route('discipline.actions') }}" class="quick-action-btn secondary">
                            <i class="fas fa-list"></i>
                            Daftar Tindakan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Actions -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-history me-2"></i>
                    Tindakan Terbaru
                </div>
                <div class="card-body p-0">
                    @if($recentActions->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Siswa</th>
                                        <th>Pelanggaran</th>
                                        <th>Tindakan</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($recentActions as $action)
                                    <tr>
                                        <td>{{ $action->violation_date ? \App\Helpers\DateHelper::formatIndonesian($action->violation_date) : '-' }}</td>
                                        <td>
                                            <strong>{{ $action->student->name ?? 'N/A' }}</strong>
                                            @if($action->student && $action->student->classRoom)
                                                <br><small class="text-muted">{{ $action->student->classRoom->name }}</small>
                                            @elseif($action->student && $action->student->class)
                                                <br><small class="text-muted">{{ $action->student->class->name }}</small>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $action->violation_type_color ?? 'secondary' }}">
                                                {{ $action->violation_type_label ?? ucfirst($action->violation_type ?? 'N/A') }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge bg-info">{{ $action->sanction_type_label ?? ucfirst($action->sanction_type ?? 'N/A') }}</span>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $action->status_color ?? 'secondary' }}">
                                                {{ $action->status_label ?? ucfirst($action->status ?? 'N/A') }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('discipline.actions.edit', $action->id) }}" class="btn btn-sm btn-outline-primary" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center p-5">
                            <div class="mb-4">
                                <i class="fas fa-inbox fa-5x text-muted" style="opacity: 0.3;"></i>
                            </div>
                            <h5 class="text-muted mb-2" style="font-weight: 600;">Belum ada tindakan disiplin</h5>
                            <p class="text-muted mb-4">Mulai dengan membuat tindakan disiplin pertama untuk siswa</p>
                            <a href="{{ tenant_route('discipline.actions.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus"></i>
                                Tambah Tindakan Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
