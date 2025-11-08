@extends('layouts.admin')

@section('title', 'Activity Logs - ' . $tenant->name)
@section('page-title', 'Activity Logs')

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
                <i class="fas fa-history me-3"></i>
                Activity Logs - {{ $tenant->name }}
            </h2>
            <p>Log aktivitas dan audit trail</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ route('admin.tenants.activity-logs.export', $tenant) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-download me-2"></i>
                    Export CSV
                </a>
                <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i>
                    Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-filter me-2 text-primary"></i>
                    Filter Pencarian
                </h5>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.tenants.activity-logs', $tenant) }}" class="form-modern">
                    <div class="row">
                        <div class="col-md-3 mb-2">
                            <label class="form-label">User</label>
                            <select name="user_id" class="form-select">
                                <option value="">Semua User</option>
                                @foreach($users as $user)
                                    <option value="{{ $user->id }}" {{ request('user_id') == $user->id ? 'selected' : '' }}>
                                        {{ $user->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-2">
                            <label class="form-label">Action</label>
                            <select name="action" class="form-select">
                                <option value="">Semua Action</option>
                                @foreach($actions as $action)
                                    <option value="{{ $action }}" {{ request('action') == $action ? 'selected' : '' }}>
                                        {{ ucfirst($action) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-2">
                            <label class="form-label">Model Type</label>
                            <select name="model_type" class="form-select">
                                <option value="">Semua Model</option>
                                @foreach($modelTypes as $modelType)
                                    <option value="{{ $modelType }}" {{ request('model_type') == $modelType ? 'selected' : '' }}>
                                        {{ class_basename($modelType) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-2">
                            <label class="form-label">Tanggal Mulai</label>
                            <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}">
                        </div>
                        
                        <div class="col-md-3 mb-2">
                            <label class="form-label">Tanggal Akhir</label>
                            <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}">
                        </div>
                        
                        <div class="col-md-3 mb-2 d-flex align-items-end">
                            <button type="submit" class="btn btn-modern btn-primary me-2">
                                <i class="fas fa-filter me-1"></i>
                                Filter
                            </button>
                            <a href="{{ route('admin.tenants.activity-logs', $tenant) }}" class="btn btn-modern btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Reset
                            </a>
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
                    <i class="fas fa-list me-2 text-primary"></i>
                    Activity Logs ({{ $logs->total() }} total)
                </h5>
            </div>
            <div class="card-body">
                @if($logs->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Model</th>
                                    <th>Description</th>
                                    <th>IP Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($logs as $log)
                                    <tr>
                                        <td>
                                            <small>{{ \App\Helpers\DateHelper::formatIndonesian($log->logged_at) }}</small>
                                        </td>
                                        <td>
                                            @if($log->user)
                                                <span class="badge-modern bg-info" style="color: white;">{{ $log->user->name }}</span>
                                            @else
                                                <span class="badge-modern bg-secondary" style="color: white;">System</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge-modern bg-{{ $log->action === 'create' ? 'success' : ($log->action === 'update' ? 'warning' : ($log->action === 'delete' ? 'danger' : 'primary')) }}" style="color: white;">
                                                {{ ucfirst($log->action) }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($log->model_type)
                                                <small>{{ class_basename($log->model_type) }}</small>
                                            @else
                                                <small class="text-muted">-</small>
                                            @endif
                                        </td>
                                        <td>
                                            <small>{{ Str::limit($log->description, 50) }}</small>
                                        </td>
                                        <td>
                                            <small>{{ $log->ip_address ?? '-' }}</small>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-modern btn-primary" 
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#logModal{{ $log->id }}">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    
                                    <!-- Log Detail Modal -->
                                    <div class="modal fade" id="logModal{{ $log->id }}" tabindex="-1">
                                        <div class="modal-dialog modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title">
                                                        <i class="fas fa-info-circle me-2"></i>
                                                        Log Detail
                                                    </h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="card-modern">
                                                        <div class="card-body p-0">
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-clock"></i>
                                                                    Tanggal
                                                                </div>
                                                                <div class="info-item-value">
                                                                    {{ \App\Helpers\DateHelper::formatIndonesian($log->logged_at) }}
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-user"></i>
                                                                    User
                                                                </div>
                                                                <div class="info-item-value">
                                                                    {{ $log->user ? $log->user->name : 'System' }}
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-tag"></i>
                                                                    Action
                                                                </div>
                                                                <div class="info-item-value">
                                                                    <span class="badge-modern bg-{{ $log->action === 'create' ? 'success' : ($log->action === 'update' ? 'warning' : ($log->action === 'delete' ? 'danger' : 'primary')) }}" style="color: white;">{{ $log->action }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-comment"></i>
                                                                    Description
                                                                </div>
                                                                <div class="info-item-value">
                                                                    {{ $log->description }}
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-database"></i>
                                                                    Model
                                                                </div>
                                                                <div class="info-item-value">
                                                                    {{ $log->model_type ? class_basename($log->model_type) . ' #' . $log->model_id : '-' }}
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-network-wired"></i>
                                                                    IP Address
                                                                </div>
                                                                <div class="info-item-value">
                                                                    {{ $log->ip_address ?? '-' }}
                                                                </div>
                                                            </div>
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-link"></i>
                                                                    URL
                                                                </div>
                                                                <div class="info-item-value">
                                                                    <small>{{ $log->url ?? '-' }}</small>
                                                                </div>
                                                            </div>
                                                            @if($log->old_values)
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-arrow-left"></i>
                                                                    Old Values
                                                                </div>
                                                                <div class="info-item-value">
                                                                    <pre class="mb-0 bg-light p-2 rounded" style="white-space: pre-wrap; word-wrap: break-word;">{{ json_encode($log->old_values, JSON_PRETTY_PRINT) }}</pre>
                                                                </div>
                                                            </div>
                                                            @endif
                                                            @if($log->new_values)
                                                            <div class="info-item">
                                                                <div class="info-item-label">
                                                                    <i class="fas fa-arrow-right"></i>
                                                                    New Values
                                                                </div>
                                                                <div class="info-item-value">
                                                                    <pre class="mb-0 bg-light p-2 rounded" style="white-space: pre-wrap; word-wrap: break-word;">{{ json_encode($log->new_values, JSON_PRETTY_PRINT) }}</pre>
                                                                </div>
                                                            </div>
                                                            @endif
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Tutup</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="mt-3">
                        {{ $logs->links() }}
                    </div>
                @else
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h5>Tidak ada activity logs ditemukan</h5>
                        <p>Coba ubah filter pencarian Anda</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

