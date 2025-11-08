@extends('layouts.tenant')

@section('title', 'Dashboard PPDB/SPMB')

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
    
    .stats-card.danger::before {
        --card-color-1: #ef4444;
        --card-color-2: #dc2626;
    }
    
    .stats-card.secondary::before {
        --card-color-1: #6b7280;
        --card-color-2: #4b5563;
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
    
    .stats-icon.danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    .stats-icon.secondary {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
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
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1><i class="fas fa-chart-line me-3"></i>Dashboard PPDB/SPMB</h1>
    <p>Ringkasan pendaftaran peserta didik baru</p>
</div>

<!-- Statistik Cards -->
<div class="row g-4 mb-4">
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card primary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total</div>
                    <div class="stats-number text-primary">{{ $stats['total'] }}</div>
                    <small class="text-muted">Pendaftar</small>
                </div>
                <div class="stats-icon primary">
                    <i class="fas fa-users"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card info">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Terdaftar</div>
                    <div class="stats-number text-info">{{ $stats['registered'] }}</div>
                    <small class="text-muted">Pendaftar</small>
                </div>
                <div class="stats-icon info">
                    <i class="fas fa-user-plus"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card warning">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Seleksi</div>
                    <div class="stats-number text-warning">{{ $stats['selection'] }}</div>
                    <small class="text-muted">Proses seleksi</small>
                </div>
                <div class="stats-icon warning">
                    <i class="fas fa-clipboard-check"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card secondary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Diumumkan</div>
                    <div class="stats-number text-secondary">{{ $stats['announced'] }}</div>
                    <small class="text-muted">Sudah diumumkan</small>
                </div>
                <div class="stats-icon secondary">
                    <i class="fas fa-bullhorn"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card success">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Diterima</div>
                    <div class="stats-number text-success">{{ $stats['accepted'] }}</div>
                    <small class="text-muted">Lulus seleksi</small>
                </div>
                <div class="stats-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="stats-card danger">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Ditolak</div>
                    <div class="stats-number text-danger">{{ $stats['rejected'] }}</div>
                    <small class="text-muted">Tidak lulus</small>
                </div>
                <div class="stats-icon danger">
                    <i class="fas fa-times-circle"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <!-- Grafik Status -->
    <div class="col-xl-6">
        <div class="modern-card">
            <div class="modern-card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Distribusi Status Pendaftar
                </h6>
            </div>
            <div class="card-body">
                <div id="status-chart" style="height: 300px;"></div>
            </div>
        </div>
    </div>

    <!-- Grafik Jurusan -->
    <div class="col-xl-6">
        <div class="modern-card">
            <div class="modern-card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Pilihan Jurusan
                </h6>
            </div>
            <div class="card-body">
                <div id="major-chart" style="height: 300px;"></div>
            </div>
        </div>
    </div>
</div>

<!-- Tabel Pendaftar Terbaru -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-users me-2"></i>
                    Pendaftar Terbaru
                </h6>
                <div>
                    <a href="{{ tenant_route('tenant.ppdb.index') }}" class="btn btn-sm btn-light me-2">
                        <i class="fas fa-list me-1"></i>Lihat Semua
                    </a>
                    <a href="{{ tenant_route('tenant.ppdb.export') }}" class="btn btn-sm btn-light">
                        <i class="fas fa-download me-1"></i>Export Excel
                    </a>
                </div>
            </div>
            <div class="card-body">

                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>No. Pendaftaran</th>
                                    <th>Nama</th>
                                    <th>Jurusan</th>
                                    <th>Jalur</th>
                                    <th>Nilai</th>
                                    <th>Status</th>
                                    <th>Tanggal Daftar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($recentApplications as $application)
                                <tr>
                                    <td>
                                        <span class="badge bg-primary">{{ $application->registration_number }}</span>
                                    </td>
                                    <td>{{ $application->full_name }}</td>
                                    <td>{{ $application->major_choice }}</td>
                                    <td>
                                        <span class="badge bg-secondary">{{ $application->registration_path_label }}</span>
                                    </td>
                                    <td>
                                        @if($application->total_score)
                                            <span class="badge bg-success">{{ number_format($application->total_score, 1) }}</span>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($application->status == 'registered')
                                            <span class="badge bg-info">Terdaftar</span>
                                        @elseif($application->status == 'selection')
                                            <span class="badge bg-warning">Seleksi</span>
                                        @elseif($application->status == 'announced')
                                            <span class="badge bg-secondary">Diumumkan</span>
                                        @elseif($application->status == 'accepted')
                                            <span class="badge bg-success">Diterima</span>
                                        @elseif($application->status == 'rejected')
                                            <span class="badge bg-danger">Ditolak</span>
                                        @else
                                            <span class="badge bg-light text-dark">{{ $application->status_label }}</span>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($application->created_at, true) }}</td>
                                    <td>
                                        <a href="{{ tenant_route('tenant.ppdb.show', $application) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center">Belum ada data pendaftar</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script>
// Status Chart
const statusChart = echarts.init(document.getElementById('status-chart'));
const statusOption = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        orient: 'vertical',
        left: 'left'
    },
    series: [
        {
            name: 'Status Pendaftar',
            type: 'pie',
            radius: '50%',
            data: [
                { value: {{ $stats['registered'] }}, name: 'Terdaftar' },
                { value: {{ $stats['selection'] }}, name: 'Seleksi' },
                { value: {{ $stats['announced'] }}, name: 'Diumumkan' },
                { value: {{ $stats['accepted'] }}, name: 'Diterima' },
                { value: {{ $stats['rejected'] }}, name: 'Ditolak' }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
statusChart.setOption(statusOption);

// Major Chart
const majorChart = echarts.init(document.getElementById('major-chart'));
const majorOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    xAxis: {
        type: 'category',
        data: {!! json_encode(array_keys($majorStats)) !!}
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Jumlah Pendaftar',
            type: 'bar',
            data: {!! json_encode(array_values($majorStats)) !!},
            itemStyle: {
                color: '#3b82f6'
            }
        }
    ]
};
majorChart.setOption(majorOption);

// Resize charts on window resize
window.addEventListener('resize', function() {
    statusChart.resize();
    majorChart.resize();
});
</script>
@endsection
