@extends('layouts.admin')

@section('title', 'Health Monitoring - ' . $tenant->name)
@section('page-title', 'Health Monitoring')

@include('components.admin-modern-styles')

@push('styles')
<style>
    .health-card {
        border-left: 4px solid;
        transition: all 0.3s;
    }
    
    .health-card.healthy {
        border-left-color: #28a745;
    }
    
    .health-card.warning {
        border-left-color: #ffc107;
    }
    
    .health-card.critical {
        border-left-color: #dc3545;
    }
    
    .health-card.unknown {
        border-left-color: #6c757d;
    }
    
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-1">
                    <i class="fas fa-heartbeat me-2 text-primary"></i>
                    Health Monitoring - {{ $tenant->name }}
                </h4>
                <p class="text-muted mb-0">Monitoring kesehatan dan performa sistem</p>
            </div>
            <div>
                <form action="{{ route('admin.tenants.health.refresh', $tenant) }}" method="POST" class="d-inline me-2">
                    @csrf
                    <button type="submit" class="btn btn-info">
                        <i class="fas fa-sync-alt me-1"></i>
                        Refresh Metrics
                    </button>
                </form>
                @if($monitoring->has_active_alerts)
                    <form action="{{ route('admin.tenants.health.clear-alerts', $tenant) }}" method="POST" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-warning">
                            <i class="fas fa-bell-slash me-1"></i>
                            Clear Alerts
                        </button>
                    </form>
                @endif
                <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-outline-secondary ms-2">
                    <i class="fas fa-arrow-left me-1"></i>
                    Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Health Status Card -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card health-card {{ $monitoring->status }}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">
                            <i class="fas fa-{{ $monitoring->status === 'healthy' ? 'check-circle' : ($monitoring->status === 'warning' ? 'exclamation-triangle' : ($monitoring->status === 'critical' ? 'times-circle' : 'question-circle')) }} me-2"></i>
                            Status: <span class="text-uppercase">{{ $monitoring->status }}</span>
                        </h5>
                        <p class="text-muted mb-0">
                            Terakhir diperbarui: {{ $monitoring->last_checked_at ? \App\Helpers\DateHelper::formatIndonesian($monitoring->last_checked_at) : 'Belum pernah' }}
                        </p>
                    </div>
                    <div>
                        <span class="badge bg-{{ $monitoring->status === 'healthy' ? 'success' : ($monitoring->status === 'warning' ? 'warning' : ($monitoring->status === 'critical' ? 'danger' : 'secondary')) }} fs-6 px-3 py-2">
                            {{ strtoupper($monitoring->status) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Alerts -->
@if($monitoring->has_active_alerts && $monitoring->active_alerts)
    <div class="row mb-4">
        <div class="col-12">
            <div class="card border-warning">
                <div class="card-header bg-warning text-dark">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Active Alerts
                    </h5>
                </div>
                <div class="card-body">
                    @foreach($monitoring->active_alerts as $alert)
                        <div class="alert alert-{{ $alert['severity'] === 'error' ? 'danger' : 'warning' }} mb-2">
                            <strong>{{ ucfirst($alert['type']) }}:</strong> {{ $alert['message'] }}
                            <br>
                            <small class="text-muted">{{ $alert['created_at'] ?? 'Unknown time' }}</small>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
@endif

<!-- Performance Metrics -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-tachometer-alt fa-2x text-primary mb-2"></i>
                <div class="metric-value text-primary">
                    {{ $monitoring->response_time_ms ? number_format($monitoring->response_time_ms, 0) : '-' }}
                </div>
                <small class="text-muted">Response Time (ms)</small>
            </div>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-exclamation-circle fa-2x text-danger mb-2"></i>
                <div class="metric-value text-danger">
                    {{ $monitoring->error_count_24h }}
                </div>
                <small class="text-muted">Errors (24h)</small>
            </div>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-chart-line fa-2x text-info mb-2"></i>
                <div class="metric-value text-info">
                    {{ number_format($monitoring->error_rate, 2) }}%
                </div>
                <small class="text-muted">Error Rate</small>
            </div>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-arrow-up fa-2x text-success mb-2"></i>
                <div class="metric-value text-success">
                    {{ $monitoring->uptime_percentage_24h }}%
                </div>
                <small class="text-muted">Uptime (24h)</small>
            </div>
        </div>
    </div>
</div>

<!-- System Metrics -->
<div class="row mb-4">
    <div class="col-md-4 mb-3">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-microchip me-2"></i>
                    CPU Usage
                </h6>
            </div>
            <div class="card-body">
                @if($monitoring->cpu_usage_percent !== null)
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar {{ $monitoring->cpu_usage_percent > 90 ? 'bg-danger' : ($monitoring->cpu_usage_percent > 75 ? 'bg-warning' : 'bg-success') }}" 
                             role="progressbar" 
                             style="width: {{ $monitoring->cpu_usage_percent }}%">
                            {{ number_format($monitoring->cpu_usage_percent, 1) }}%
                        </div>
                    </div>
                @else
                    <p class="text-muted mb-0">Data tidak tersedia</p>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-memory me-2"></i>
                    Memory Usage
                </h6>
            </div>
            <div class="card-body">
                @if($monitoring->memory_usage_percent !== null)
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar {{ $monitoring->memory_usage_percent > 90 ? 'bg-danger' : ($monitoring->memory_usage_percent > 75 ? 'bg-warning' : 'bg-info') }}" 
                             role="progressbar" 
                             style="width: {{ $monitoring->memory_usage_percent }}%">
                            {{ number_format($monitoring->memory_usage_percent, 1) }}%
                        </div>
                    </div>
                @else
                    <p class="text-muted mb-0">Data tidak tersedia</p>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-hdd me-2"></i>
                    Disk Usage
                </h6>
            </div>
            <div class="card-body">
                @if($monitoring->disk_usage_percent !== null)
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar {{ $monitoring->disk_usage_percent > 90 ? 'bg-danger' : ($monitoring->disk_usage_percent > 75 ? 'bg-warning' : 'bg-secondary') }}" 
                             role="progressbar" 
                             style="width: {{ $monitoring->disk_usage_percent }}%">
                            {{ number_format($monitoring->disk_usage_percent, 1) }}%
                        </div>
                    </div>
                @else
                    <p class="text-muted mb-0">Data tidak tersedia</p>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Request Statistics -->
<div class="row">
    <div class="col-md-6 mb-3">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Request Statistics (24h)
                </h6>
            </div>
            <div class="card-body">
                <table class="table table-sm">
                    <tr>
                        <td>Total Requests:</td>
                        <td><strong>{{ number_format($monitoring->request_count_24h) }}</strong></td>
                    </tr>
                    <tr>
                        <td>Errors:</td>
                        <td><strong class="text-danger">{{ number_format($monitoring->error_count_24h) }}</strong></td>
                    </tr>
                    <tr>
                        <td>Error Rate:</td>
                        <td><strong>{{ number_format($monitoring->error_rate, 2) }}%</strong></td>
                    </tr>
                    <tr>
                        <td>Last Success:</td>
                        <td>
                            @if($monitoring->last_successful_request_at)
                                {{ \App\Helpers\DateHelper::formatIndonesian($monitoring->last_successful_request_at) }}
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>Last Error:</td>
                        <td>
                            @if($monitoring->last_error_at)
                                <span class="text-danger">{{ \App\Helpers\DateHelper::formatIndonesian($monitoring->last_error_at) }}</span>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 mb-3">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-database me-2"></i>
                    Database Information
                </h6>
            </div>
            <div class="card-body">
                <table class="table table-sm">
                    <tr>
                        <td>Database Size:</td>
                        <td>
                            <strong>
                                @if($monitoring->database_size_mb)
                                    {{ number_format($monitoring->database_size_mb, 2) }} MB
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </strong>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>

@if($monitoring->notes)
    <div class="row mt-3">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title mb-0">Notes</h6>
                </div>
                <div class="card-body">
                    <p class="mb-0">{{ $monitoring->notes }}</p>
                </div>
            </div>
        </div>
    </div>
@endif
@endsection

