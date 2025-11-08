@extends('layouts.tenant')

@section('title', 'Statistik Alumni')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title">
                            <i class="fas fa-chart-bar me-2"></i>
                            Statistik Alumni
                        </h3>
                        <a href="{{ tenant_route('tenant.alumni.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left me-1"></i>
                            Kembali
                        </a>
                    </div>
                </div>

                <div class="card-body">
                    <!-- Overview Statistics -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-primary">
                                    <i class="fas fa-graduation-cap"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Total Alumni</span>
                                    <span class="info-box-number">{{ $stats['total'] }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-success">
                                    <i class="fas fa-check-circle"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Alumni Aktif</span>
                                    <span class="info-box-number">{{ $stats['active'] }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-info">
                                    <i class="fas fa-chart-line"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Rata-rata GPA</span>
                                    <span class="info-box-number">{{ number_format($stats['average_gpa'], 2) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="info-box">
                                <span class="info-box-icon bg-warning">
                                    <i class="fas fa-star"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Rata-rata Nilai</span>
                                    <span class="info-box-number">{{ number_format($stats['average_final_grade'], 2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Status Distribution -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-pie-chart me-2"></i>
                                        Distribusi Status Alumni
                                    </h5>
                                </div>
                                <div class="card-body">
                                    @if($stats['by_status']->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Status</th>
                                                        <th>Jumlah</th>
                                                        <th>Persentase</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($stats['by_status'] as $status => $count)
                                                        <tr>
                                                            <td>
                                                                @php
                                                                    $statusLabels = [
                                                                        'employed' => 'Bekerja',
                                                                        'unemployed' => 'Tidak Bekerja',
                                                                        'self_employed' => 'Wiraswasta',
                                                                        'studying' => 'Kuliah',
                                                                        'retired' => 'Pensiun',
                                                                        'unknown' => 'Tidak Diketahui'
                                                                    ];
                                                                    $statusColors = [
                                                                        'employed' => 'success',
                                                                        'unemployed' => 'warning',
                                                                        'self_employed' => 'info',
                                                                        'studying' => 'primary',
                                                                        'retired' => 'secondary',
                                                                        'unknown' => 'dark'
                                                                    ];
                                                                @endphp
                                                                <span class="badge bg-{{ $statusColors[$status] ?? 'secondary' }}">
                                                                    {{ $statusLabels[$status] ?? ucfirst($status) }}
                                                                </span>
                                                            </td>
                                                            <td>{{ $count }}</td>
                                                            <td>{{ $stats['total'] > 0 ? number_format(($count / $stats['total']) * 100, 1) : 0 }}%</td>
                                                        </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="text-center py-4">
                                            <div class="text-muted">
                                                <i class="fas fa-chart-pie fa-3x mb-3"></i>
                                                <br>
                                                Belum ada data status alumni
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Graduation Year Distribution -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-calendar-alt me-2"></i>
                                        Distribusi Tahun Lulus
                                    </h5>
                                </div>
                                <div class="card-body">
                                    @if($stats['by_graduation_year']->count() > 0)
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Tahun Lulus</th>
                                                        <th>Jumlah</th>
                                                        <th>Persentase</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($stats['by_graduation_year'] as $year => $count)
                                                        <tr>
                                                            <td>{{ $year }}</td>
                                                            <td>{{ $count }}</td>
                                                            <td>{{ $stats['total'] > 0 ? number_format(($count / $stats['total']) * 100, 1) : 0 }}%</td>
                                                        </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="text-center py-4">
                                            <div class="text-muted">
                                                <i class="fas fa-calendar fa-3x mb-3"></i>
                                                <br>
                                                Belum ada data tahun lulus
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">
                                        <i class="fas fa-chart-bar me-2"></i>
                                        Grafik Distribusi Alumni
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <!-- Status Chart -->
                                        <div class="col-md-6">
                                            <h6>Status Alumni</h6>
                                            <canvas id="statusChart" width="400" height="200"></canvas>
                                        </div>
                                        
                                        <!-- Graduation Year Chart -->
                                        <div class="col-md-6">
                                            <h6>Tahun Lulus</h6>
                                            <canvas id="yearChart" width="400" height="200"></canvas>
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

@push('styles')
<style>
.info-box {
    display: block;
    min-height: 90px;
    background: #fff;
    width: 100%;
    box-shadow: 0 1px 1px rgba(0,0,0,0.1);
    border-radius: 2px;
    margin-bottom: 15px;
}

.info-box-icon {
    border-top-left-radius: 2px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 2px;
    display: block;
    float: left;
    height: 90px;
    width: 90px;
    text-align: center;
    font-size: 45px;
    line-height: 90px;
    background: rgba(0,0,0,0.2);
}

.info-box-content {
    padding: 5px 10px;
    margin-left: 90px;
}

.info-box-text {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 14px;
}

.info-box-number {
    display: block;
    font-weight: bold;
    font-size: 18px;
}
</style>
@endpush

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Status Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    const statusData = @json($stats['by_status']);
    
    const statusLabels = {
        'employed': 'Bekerja',
        'unemployed': 'Tidak Bekerja',
        'self_employed': 'Wiraswasta',
        'studying': 'Kuliah',
        'retired': 'Pensiun',
        'unknown': 'Tidak Diketahui'
    };
    
    const statusColors = {
        'employed': '#28a745',
        'unemployed': '#ffc107',
        'self_employed': '#17a2b8',
        'studying': '#007bff',
        'retired': '#6c757d',
        'unknown': '#343a40'
    };
    
    new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusData).map(key => statusLabels[key] || key),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: Object.keys(statusData).map(key => statusColors[key] || '#6c757d'),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Graduation Year Chart
    const yearCtx = document.getElementById('yearChart').getContext('2d');
    const yearData = @json($stats['by_graduation_year']);
    
    new Chart(yearCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(yearData),
            datasets: [{
                label: 'Jumlah Alumni',
                data: Object.values(yearData),
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
});
</script>
@endpush
