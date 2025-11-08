@extends('layouts.admin')

@section('title', 'System Logs')
@section('page-title', 'System Logs')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-list-alt me-3"></i>
                System Logs
            </h2>
            <p>Monitor dan filter log sistem</p>
        </div>
    </div>
</div>

<!-- Filter Form -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-filter me-2 text-primary"></i>
                    Filter Logs
                </h5>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.logs') }}" class="form-modern">
                    <div class="row">
                        <div class="col-md-3">
                            <label for="level" class="form-label">Log Level</label>
                            <select name="level" id="level" class="form-select">
                                <option value="">All Levels</option>
                                <option value="info" {{ request('level') === 'info' ? 'selected' : '' }}>Info</option>
                                <option value="warning" {{ request('level') === 'warning' ? 'selected' : '' }}>Warning</option>
                                <option value="error" {{ request('level') === 'error' ? 'selected' : '' }}>Error</option>
                                <option value="critical" {{ request('level') === 'critical' ? 'selected' : '' }}>Critical</option>
                                <option value="debug" {{ request('level') === 'debug' ? 'selected' : '' }}>Debug</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="tenant_id" class="form-label">Tenant</label>
                            <select name="tenant_id" id="tenant_id" class="form-select">
                                <option value="">All Tenants</option>
                                @foreach(\App\Models\Core\Tenant::all() as $tenant)
                                    <option value="{{ $tenant->id }}" {{ request('tenant_id') == $tenant->id ? 'selected' : '' }}>
                                        {{ $tenant->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="date_from" class="form-label">From Date</label>
                            <input type="date" name="date_from" id="date_from" class="form-control" value="{{ request('date_from') }}">
                        </div>
                        <div class="col-md-2">
                            <label for="date_to" class="form-label">To Date</label>
                            <input type="date" name="date_to" id="date_to" class="form-control" value="{{ request('date_to') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-modern btn-primary">
                                    <i class="fas fa-search me-1"></i>Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Logs Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list-alt me-2 text-primary"></i>
                    System Logs
                </h5>
            </div>
            <div class="card-body">
                @if($logs->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Level</th>
                                    <th>Message</th>
                                    <th>User</th>
                                    <th>Tenant</th>
                                    <th>IP Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($logs as $log)
                                    <tr>
                                        <td>
                                            <small class="text-muted">
                                                {{ \App\Helpers\DateHelper::formatIndonesian($log->created_at) }} {{ $log->created_at->format('H:i:s') }}
                                            </small>
                                        </td>
                                        <td>
                                            <span class="badge-modern {{ $log->level_badge_class }}" style="color: white;">
                                                {{ strtoupper($log->level) }}
                                            </span>
                                        </td>
                                        <td>
                                            <span title="{{ $log->message }}">
                                                {{ Str::limit($log->message, 60) }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($log->user)
                                                <small>{{ $log->user->name }}</small>
                                            @else
                                                <small class="text-muted">-</small>
                                            @endif
                                        </td>
                                        <td>
                                            @if($log->tenant)
                                                <small>{{ $log->tenant->name }}</small>
                                            @else
                                                <small class="text-muted">-</small>
                                            @endif
                                        </td>
                                        <td>
                                            <small class="text-muted">{{ $log->ip_address ?? '-' }}</small>
                                        </td>
                                        <td>
                                            <a href="{{ route('admin.logs.show', $log) }}" class="btn btn-modern btn-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="d-flex justify-content-center mt-4">
                        {{ $logs->appends(request()->query())->links() }}
                    </div>
                @else
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h5>No logs found</h5>
                        <p>No system logs match your current filter criteria.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
