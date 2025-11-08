@extends('layouts.tenant')

@section('title', 'Kesehatan')
@section('page-title', 'Kesehatan')

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
        --card-color-1: #10b981;
        --card-color-2: #059669;
    }
    
    .stats-card.success::before {
        --card-color-1: #22c55e;
        --card-color-2: #16a34a;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.danger::before {
        --card-color-1: #ef4444;
        --card-color-2: #dc2626;
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
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    /* Table Styles */
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
                        <div class="stats-label">Total Rekam Medis</div>
                        <div class="stats-number">{{ $stats['total_records'] }}</div>
                    </div>
                    <div class="stats-icon primary">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Sehat</div>
                        <div class="stats-number">{{ $stats['healthy_students'] }}</div>
                    </div>
                    <div class="stats-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Bulan Ini</div>
                        <div class="stats-number">{{ $stats['this_month_records'] }}</div>
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
                        <div class="stats-label">Sakit</div>
                        <div class="stats-number">{{ $stats['sick_students'] }}</div>
                    </div>
                    <div class="stats-icon danger">
                        <i class="fas fa-exclamation-triangle"></i>
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
                        <a href="{{ tenant_route('health.records.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus"></i>
                            Tambah Rekam Medis
                        </a>
                        <a href="{{ tenant_route('health.records') }}" class="quick-action-btn secondary">
                            <i class="fas fa-list"></i>
                            Daftar Rekam Medis
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Records -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-history me-2"></i>
                    Rekam Medis Terbaru
                </div>
                <div class="card-body p-0">
                    @if($recentRecords->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Siswa</th>
                                        <th>Kelas</th>
                                        <th>Gejala</th>
                                        <th>Diagnosis</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($recentRecords as $record)
                                    <tr>
                                        <td>{{ \App\Helpers\DateHelper::formatIndonesian($record->checkup_date) }}</td>
                                        <td>
                                            <div>
                                                <strong>{{ $record->student->name }}</strong><br>
                                                <small class="text-muted">{{ $record->student->student_number }}</small>
                                            </div>
                                        </td>
                                        <td>{{ $record->student->classRoom->name ?? 'N/A' }}</td>
                                        <td>
                                            @if($record->symptoms)
                                                <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $record->symptoms }}">
                                                    {{ Str::limit($record->symptoms, 30) }}
                                                </span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($record->diagnosis)
                                                <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $record->diagnosis }}">
                                                    {{ Str::limit($record->diagnosis, 30) }}
                                                </span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($record->health_status == 'healthy')
                                                <span class="badge bg-success">Sehat</span>
                                            @elseif($record->health_status == 'sick')
                                                <span class="badge bg-danger">Sakit</span>
                                            @elseif($record->health_status == 'recovering')
                                                <span class="badge bg-warning">Pulih</span>
                                            @else
                                                <span class="badge bg-secondary">{{ ucfirst($record->health_status) }}</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('health.records.show', $record->id) }}" class="btn btn-sm btn-outline-info" title="Lihat Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('health.records.edit', $record->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('health.records.destroy', $record->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')">
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
                    @else
                        <div class="text-center p-4">
                            <i class="fas fa-heartbeat fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Belum ada data rekam medis</p>
                            <a href="{{ tenant_route('health.records.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus"></i>
                                Tambah Rekam Medis Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
