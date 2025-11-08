@extends('layouts.admin')

@section('title', 'System Health Monitoring')
@section('page-title', 'System Health Monitoring')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-heartbeat me-3"></i>
                System Health Monitoring
            </h2>
            <p>Monitor kesehatan sistem dan performa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);" onclick="refreshHealth()">
                <i class="fas fa-sync-alt me-2"></i>
                Refresh
            </button>
        </div>
    </div>
</div>

<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-heartbeat me-2 text-primary"></i>
                    System Health Status
                </h5>
            </div>
            <div class="card-body">
                <div class="row" id="healthStatus">
                    <!-- Health status cards will be loaded here -->
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Database Health -->
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-database me-2 text-primary"></i>
                    Database Status
                </h5>
            </div>
            <div class="card-body">
                <div id="databaseStatus">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-plug"></i>
                            Connection
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern bg-{{ $health['database']['status'] === 'healthy' ? 'success' : ($health['database']['status'] === 'warning' ? 'warning' : 'danger') }}" style="color: white;">
                                {{ ucfirst($health['database']['status']) }}
                            </span>
                        </div>
                    </div>
                    @if($health['database']['response_time'])
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-clock"></i>
                            Response Time
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['database']['response_time'] }}</strong>
                        </div>
                    </div>
                    @endif
                    @if($health['database']['database_size'])
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-database"></i>
                            Database Size
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['database']['database_size'] }}</strong>
                        </div>
                    </div>
                    @endif
                    @if($health['database']['connections'] !== null)
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-users"></i>
                            Active Connections
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['database']['connections'] }}</strong>
                        </div>
                    </div>
                    @endif
                    <small class="text-muted">{{ $health['database']['message'] }}</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Storage Health -->
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-hdd me-2 text-primary"></i>
                    Storage Status
                </h5>
            </div>
            <div class="card-body">
                <div id="storageStatus">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern bg-{{ $health['storage']['status'] === 'healthy' ? 'success' : ($health['storage']['status'] === 'warning' ? 'warning' : 'danger') }}" style="color: white;">
                                {{ ucfirst($health['storage']['status']) }}
                            </span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <small class="text-muted">Storage Usage</small>
                            <small class="text-muted">{{ $health['storage']['used_percentage'] }}%</small>
                        </div>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar {{ $health['storage']['status'] === 'healthy' ? 'bg-success' : ($health['storage']['status'] === 'warning' ? 'bg-warning' : 'bg-danger') }}" 
                                 role="progressbar" 
                                 style="width: {{ $health['storage']['used_percentage'] }}%">
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-hdd"></i>
                            Used
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['storage']['used_space'] }}</strong>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-hdd"></i>
                            Free
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['storage']['free_space'] }}</strong>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-hdd"></i>
                            Total
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['storage']['total_space'] }}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Memory Health -->
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-memory me-2 text-primary"></i>
                    Memory Status
                </h5>
            </div>
            <div class="card-body">
                <div id="memoryStatus">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern bg-{{ $health['memory']['status'] === 'healthy' ? 'success' : ($health['memory']['status'] === 'warning' ? 'warning' : 'danger') }}" style="color: white;">
                                {{ ucfirst($health['memory']['status']) }}
                            </span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <small class="text-muted">Memory Usage</small>
                            <small class="text-muted">{{ $health['memory']['percentage'] }}%</small>
                        </div>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar {{ $health['memory']['status'] === 'healthy' ? 'bg-success' : ($health['memory']['status'] === 'warning' ? 'bg-warning' : 'bg-danger') }}" 
                                 role="progressbar" 
                                 style="width: {{ $health['memory']['percentage'] }}%">
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-memory"></i>
                            Used
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['memory']['used'] }}</strong>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-memory"></i>
                            Limit
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['memory']['limit'] }}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Queue Health -->
    <div class="col-md-6 mb-4">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-tasks me-2 text-primary"></i>
                    Queue Status
                </h5>
            </div>
            <div class="card-body">
                <div id="queueStatus">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern bg-{{ $health['queue']['status'] === 'healthy' ? 'success' : ($health['queue']['status'] === 'warning' ? 'warning' : 'danger') }}" style="color: white;">
                                {{ ucfirst($health['queue']['status']) }}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-clock"></i>
                            Pending Jobs
                        </div>
                        <div class="info-item-value">
                            <strong>{{ $health['queue']['pending_jobs'] }}</strong>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-exclamation-circle"></i>
                            Failed Jobs
                        </div>
                        <div class="info-item-value">
                            <strong class="{{ $health['queue']['failed_jobs'] > 0 ? 'text-danger' : '' }}">{{ $health['queue']['failed_jobs'] }}</strong>
                        </div>
                    </div>
                    <small class="text-muted">{{ $health['queue']['message'] }}</small>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- System Statistics -->
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-chart-line me-2 text-primary"></i>
                    System Statistics
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <div class="stat-card-modern primary fade-in-up fade-in-up-delay-1">
                            <div class="stat-icon-modern">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 1.5rem;">{{ $statistics['uptime'] }}</h3>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Uptime</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card-modern {{ $statistics['error_rate'] > 5 ? 'danger' : 'success' }} fade-in-up fade-in-up-delay-2">
                            <div class="stat-icon-modern">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h3 class="mb-1" style="font-weight: 700; color: {{ $statistics['error_rate'] > 5 ? '#991b1b' : '#047857' }}; font-size: 2rem;">{{ $statistics['error_rate'] }}%</h3>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Error Rate</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card-modern info fade-in-up fade-in-up-delay-3">
                            <div class="stat-icon-modern">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 1.5rem;">{{ $statistics['response_time'] }}</h3>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Avg Response Time</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card-modern warning fade-in-up fade-in-up-delay-4">
                            <div class="stat-icon-modern">
                                <i class="fas fa-server"></i>
                            </div>
                            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($statistics['total_requests']) }}</h3>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Requests</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function refreshHealth() {
        fetch('{{ route("admin.system-health.status") }}')
            .then(response => response.json())
            .then(data => {
                // Update UI with new health data
                console.log('Health status refreshed:', data);
                location.reload(); // Simple refresh for now
            })
            .catch(error => {
                console.error('Error refreshing health status:', error);
                alert('Gagal memperbarui status kesehatan sistem');
            });
    }

    // Auto-refresh every 30 seconds
    setInterval(function() {
        fetch('{{ route("admin.system-health.status") }}')
            .then(response => response.json())
            .then(data => {
                // Update health indicators without full page reload
                updateHealthIndicators(data);
            })
            .catch(error => {
                console.error('Error refreshing health status:', error);
            });
    }, 30000);

    function updateHealthIndicators(data) {
        // Update database status
        if (data.database) {
            const dbStatus = document.querySelector('#databaseStatus .badge');
            if (dbStatus) {
                const statusClass = data.database.status === 'healthy' ? 'bg-success' : 
                                   (data.database.status === 'warning' ? 'bg-warning' : 'bg-danger');
                dbStatus.className = 'badge ' + statusClass;
                dbStatus.textContent = data.database.status.charAt(0).toUpperCase() + data.database.status.slice(1);
            }
        }
        // Add more update logic for other indicators
    }
</script>
@endpush
@endsection

