@extends('layouts.admin')

@section('title', 'Resource Limits - ' . $tenant->name)
@section('page-title', 'Resource Limits')

@include('components.admin-modern-styles')

@push('styles')
<style>
    .usage-card {
        border-left: 4px solid #007bff;
        transition: all 0.3s;
    }
    
    .usage-card.warning {
        border-left-color: #ffc107;
    }
    
    .usage-card.danger {
        border-left-color: #dc3545;
    }
    
    .progress-custom {
        height: 25px;
        border-radius: 5px;
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
                    <i class="fas fa-chart-pie me-2 text-primary"></i>
                    Resource Limits - {{ $tenant->name }}
                </h4>
                <p class="text-muted mb-0">Kelola batasan dan monitoring penggunaan resource</p>
            </div>
            <div>
                <form action="{{ route('admin.tenants.resource-limits.refresh', $tenant) }}" method="POST" class="d-inline">
                    @csrf
                    <button type="submit" class="btn btn-info me-2">
                        <i class="fas fa-sync-alt me-1"></i>
                        Refresh Usage
                    </button>
                </form>
                <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i>
                    Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Resource Usage Cards -->
<div class="row mb-4">
    <!-- Storage Usage -->
    <div class="col-md-6 mb-3">
        <div class="card usage-card {{ $limit->getStorageUsagePercentage() > 80 ? 'danger' : ($limit->getStorageUsagePercentage() > 60 ? 'warning' : '') }}">
            <div class="card-body">
                <h6 class="card-title">
                    <i class="fas fa-hdd me-2"></i>
                    Storage Usage
                </h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>{{ number_format($limit->current_storage_mb, 0) }} MB</span>
                    <span>{{ number_format($limit->max_storage_mb, 0) }} MB</span>
                </div>
                <div class="progress progress-custom">
                    <div class="progress-bar {{ $limit->getStorageUsagePercentage() > 80 ? 'bg-danger' : ($limit->getStorageUsagePercentage() > 60 ? 'bg-warning' : 'bg-primary') }}" 
                         role="progressbar" 
                         style="width: {{ min($limit->getStorageUsagePercentage(), 100) }}%">
                        {{ number_format($limit->getStorageUsagePercentage(), 1) }}%
                    </div>
                </div>
                @if($limit->isStorageExceeded())
                    <small class="text-danger mt-2 d-block">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        Limit exceeded!
                    </small>
                @endif
            </div>
        </div>
    </div>

    <!-- User Usage -->
    <div class="col-md-6 mb-3">
        <div class="card usage-card {{ $limit->getUserUsagePercentage() > 80 ? 'danger' : ($limit->getUserUsagePercentage() > 60 ? 'warning' : '') }}">
            <div class="card-body">
                <h6 class="card-title">
                    <i class="fas fa-users me-2"></i>
                    User Usage
                </h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>{{ $limit->current_users }} users</span>
                    <span>{{ $limit->max_users }} users</span>
                </div>
                <div class="progress progress-custom">
                    <div class="progress-bar {{ $limit->getUserUsagePercentage() > 80 ? 'bg-danger' : ($limit->getUserUsagePercentage() > 60 ? 'bg-warning' : 'bg-success') }}" 
                         role="progressbar" 
                         style="width: {{ min($limit->getUserUsagePercentage(), 100) }}%">
                        {{ number_format($limit->getUserUsagePercentage(), 1) }}%
                    </div>
                </div>
                @if($limit->isUserLimitExceeded())
                    <small class="text-danger mt-2 d-block">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        Limit exceeded!
                    </small>
                @endif
            </div>
        </div>
    </div>

    <!-- Student Usage -->
    <div class="col-md-6 mb-3">
        <div class="card usage-card {{ $limit->getStudentUsagePercentage() && $limit->getStudentUsagePercentage() > 80 ? 'danger' : ($limit->getStudentUsagePercentage() && $limit->getStudentUsagePercentage() > 60 ? 'warning' : '') }}">
            <div class="card-body">
                <h6 class="card-title">
                    <i class="fas fa-user-graduate me-2"></i>
                    Student Usage
                </h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>{{ $limit->current_students }} students</span>
                    <span>{{ $limit->max_students ?? 'Unlimited' }} students</span>
                </div>
                @if($limit->max_students)
                    <div class="progress progress-custom">
                        <div class="progress-bar {{ $limit->getStudentUsagePercentage() > 80 ? 'bg-danger' : ($limit->getStudentUsagePercentage() > 60 ? 'bg-warning' : 'bg-info') }}" 
                             role="progressbar" 
                             style="width: {{ min($limit->getStudentUsagePercentage(), 100) }}%">
                            {{ number_format($limit->getStudentUsagePercentage(), 1) }}%
                        </div>
                    </div>
                    @if($limit->isStudentLimitExceeded())
                        <small class="text-danger mt-2 d-block">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            Limit exceeded!
                        </small>
                    @endif
                @else
                    <div class="text-muted">
                        <i class="fas fa-infinity me-1"></i>
                        Unlimited
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Database Size -->
    <div class="col-md-6 mb-3">
        <div class="card usage-card">
            <div class="card-body">
                <h6 class="card-title">
                    <i class="fas fa-database me-2"></i>
                    Database Size
                </h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>{{ number_format($limit->current_database_size_mb, 2) }} MB</span>
                    <span>{{ number_format($limit->max_database_size_mb, 0) }} MB</span>
                </div>
                @php
                    $dbUsage = $limit->max_database_size_mb > 0 ? ($limit->current_database_size_mb / $limit->max_database_size_mb) * 100 : 0;
                @endphp
                <div class="progress progress-custom">
                    <div class="progress-bar {{ $dbUsage > 80 ? 'bg-danger' : ($dbUsage > 60 ? 'bg-warning' : 'bg-secondary') }}" 
                         role="progressbar" 
                         style="width: {{ min($dbUsage, 100) }}%">
                        {{ number_format($dbUsage, 1) }}%
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Limits Form -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-cog me-2"></i>
                    Edit Resource Limits
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ route('admin.tenants.resource-limits.update', $tenant) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Storage (MB)</label>
                            <input type="number" name="max_storage_mb" class="form-control" 
                                   value="{{ $limit->max_storage_mb }}" min="0" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Users</label>
                            <input type="number" name="max_users" class="form-control" 
                                   value="{{ $limit->max_users }}" min="0" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Students (kosongkan untuk unlimited)</label>
                            <input type="number" name="max_students" class="form-control" 
                                   value="{{ $limit->max_students }}" min="0">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">API Rate Limit (per minute)</label>
                            <input type="number" name="api_rate_limit_per_minute" class="form-control" 
                                   value="{{ $limit->api_rate_limit_per_minute }}" min="1" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">API Rate Limit (per hour)</label>
                            <input type="number" name="api_rate_limit_per_hour" class="form-control" 
                                   value="{{ $limit->api_rate_limit_per_hour }}" min="1" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Database Size (MB)</label>
                            <input type="number" name="max_database_size_mb" class="form-control" 
                                   value="{{ $limit->max_database_size_mb }}" min="0" required>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@if($limit->last_checked_at)
    <div class="row mt-3">
        <div class="col-12">
            <small class="text-muted">
                <i class="fas fa-clock me-1"></i>
                Terakhir diperbarui: {{ \App\Helpers\DateHelper::formatIndonesian($limit->last_checked_at) }}
            </small>
        </div>
    </div>
@endif
@endsection

