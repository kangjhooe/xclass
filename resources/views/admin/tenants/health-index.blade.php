@extends('layouts.admin')

@section('title', 'All Tenants Health Monitoring')
@section('page-title', 'Tenants Health Monitoring')

@include('components.admin-modern-styles')

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-heartbeat me-3"></i>
                All Tenants Health Monitoring
            </h2>
            <p>Monitoring kesehatan semua tenant</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <form action="{{ route('admin.tenants-health.check-all') }}" method="POST" class="d-inline">
                @csrf
                <button type="submit" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-sync-alt me-2"></i>
                    Check All Tenants
                </button>
            </form>
        </div>
    </div>
</div>

<!-- Statistics -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $healthStatuses->get('healthy') ? $healthStatuses->get('healthy')->count() : 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Healthy</p>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern warning fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ $healthStatuses->get('warning') ? $healthStatuses->get('warning')->count() : 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Warning</p>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern danger fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-times-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #991b1b; font-size: 2rem;">{{ $healthStatuses->get('critical') ? $healthStatuses->get('critical')->count() : 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Critical</p>
        </div>
    </div>
    
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern secondary fade-in-up fade-in-up-delay-4">
            <div class="stat-icon-modern">
                <i class="fas fa-question-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #6b7280; font-size: 2rem;">{{ $healthStatuses->get('unknown') ? $healthStatuses->get('unknown')->count() : 0 }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Unknown</p>
        </div>
    </div>
</div>

<!-- Health Status by Category -->
@foreach(['critical', 'warning', 'healthy', 'unknown'] as $status)
    @if($healthStatuses->get($status) && $healthStatuses->get($status)->count() > 0)
        <div class="row mb-4">
            <div class="col-12">
                <div class="card-modern fade-in-up" style="border-left-color: {{ $status === 'healthy' ? '#10b981' : ($status === 'warning' ? '#f59e0b' : ($status === 'critical' ? '#ef4444' : '#6b7280')) }} !important;">
                    <div class="card-header" style="background: linear-gradient(135deg, {{ $status === 'healthy' ? '#d1fae5 0%, #a7f3d0 100%' : ($status === 'warning' ? '#fef3c7 0%, #fde68a 100%' : ($status === 'critical' ? '#fee2e2 0%, #fecaca 100%' : '#f3f4f6 0%, #e5e7eb 100%')) }}) !important;">
                        <h5>
                            <i class="fas fa-{{ $status === 'healthy' ? 'check-circle' : ($status === 'warning' ? 'exclamation-triangle' : ($status === 'critical' ? 'times-circle' : 'question-circle')) }} me-2 text-{{ $status === 'healthy' ? 'success' : ($status === 'warning' ? 'warning' : ($status === 'critical' ? 'danger' : 'secondary')) }}"></i>
                            {{ strtoupper($status) }} ({{ $healthStatuses->get($status)->count() }})
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-modern">
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>NPSN</th>
                                        <th>Error Rate</th>
                                        <th>Response Time</th>
                                        <th>Uptime</th>
                                        <th>Last Checked</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($healthStatuses->get($status) as $monitoring)
                                        <tr>
                                            <td>
                                                <strong>{{ $monitoring->tenant->name }}</strong>
                                            </td>
                                            <td>
                                                <code>{{ $monitoring->tenant->npsn }}</code>
                                            </td>
                                            <td>
                                                <span class="badge-modern bg-{{ $monitoring->error_rate > 10 ? 'danger' : ($monitoring->error_rate > 5 ? 'warning' : 'success') }}" style="color: white;">
                                                    {{ number_format($monitoring->error_rate, 2) }}%
                                                </span>
                                            </td>
                                            <td>
                                                @if($monitoring->response_time_ms)
                                                    {{ number_format($monitoring->response_time_ms, 0) }} ms
                                                @else
                                                    <span class="text-muted">-</span>
                                                @endif
                                            </td>
                                            <td>
                                                <span class="badge-modern bg-{{ $monitoring->uptime_percentage_24h >= 99 ? 'success' : ($monitoring->uptime_percentage_24h >= 95 ? 'warning' : 'danger') }}" style="color: white;">
                                                    {{ $monitoring->uptime_percentage_24h }}%
                                                </span>
                                            </td>
                                            <td>
                                                @if($monitoring->last_checked_at)
                                                    <small>{{ \App\Helpers\DateHelper::formatIndonesian($monitoring->last_checked_at) }}</small>
                                                @else
                                                    <span class="text-muted">-</span>
                                                @endif
                                            </td>
                                            <td>
                                                <a href="{{ route('admin.tenants.health', $monitoring->tenant) }}" class="btn btn-modern btn-primary">
                                                    <i class="fas fa-eye"></i>
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif
@endforeach

@if($healthStatuses->isEmpty() || ($healthStatuses->get('healthy')?->count() === 0 && $healthStatuses->get('warning')?->count() === 0 && $healthStatuses->get('critical')?->count() === 0 && $healthStatuses->get('unknown')?->count() === 0))
    <div class="row">
        <div class="col-12">
            <div class="card-modern fade-in-up">
                <div class="card-body">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h5>Tidak ada data health monitoring</h5>
                        <p>Belum ada data health monitoring untuk ditampilkan</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endif
@endsection

