@extends('layouts.admin')

@section('title', 'Activity Monitor')
@section('page-title', 'Activity Monitor')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chart-line me-3"></i>
                Activity Monitor
            </h2>
            <p>Monitor aktivitas sistem dan pengguna</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.activity-monitor.export', request()->all()) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-download me-2"></i>
                Export CSV
            </a>
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
                    Filter Aktivitas
                </h5>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.activity-monitor.index') }}" class="row g-3 form-modern">
                    <div class="col-md-3">
                        <label for="tenant_id" class="form-label">Tenant</label>
                        <select name="tenant_id" id="tenant_id" class="form-select">
                            <option value="">Semua Tenant</option>
                            @foreach($tenants as $tenant)
                                <option value="{{ $tenant->id }}" {{ $tenantId == $tenant->id ? 'selected' : '' }}>
                                    {{ $tenant->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="user_id" class="form-label">User</label>
                        <select name="user_id" id="user_id" class="form-select">
                            <option value="">Semua User</option>
                            @foreach($users as $user)
                                <option value="{{ $user->id }}" {{ $userId == $user->id ? 'selected' : '' }}>
                                    {{ $user->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="date_from" class="form-label">Dari Tanggal</label>
                        <input type="date" name="date_from" id="date_from" class="form-control" value="{{ $dateFrom }}">
                    </div>
                    <div class="col-md-2">
                        <label for="date_to" class="form-label">Sampai Tanggal</label>
                        <input type="date" name="date_to" id="date_to" class="form-control" value="{{ $dateTo }}">
                    </div>
                    <div class="col-md-2">
                        <label for="action" class="form-label">Aksi</label>
                        <input type="text" name="action" id="action" class="form-control" value="{{ $action }}" placeholder="Cari aksi...">
                    </div>
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-search me-2"></i>Filter
                        </button>
                        <a href="{{ route('admin.activity-monitor.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-redo me-2"></i>Reset
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Statistics -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern primary fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($stats['total_activities']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Aktivitas</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern danger fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #991b1b; font-size: 2rem;">{{ number_format($stats['recent_errors']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Error/ Critical</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern info fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-building"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 2rem;">{{ count($stats['by_tenant']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Tenant Aktif</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-4">
            <div class="stat-icon-modern">
                <i class="fas fa-tasks"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ count($stats['by_action']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Aksi Berbeda</p>
        </div>
    </div>
</div>

<!-- Activities Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Aktivitas
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>User</th>
                                <th>Tenant</th>
                                <th>Aksi</th>
                                <th>Level</th>
                                <th>Pesan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($activities as $activity)
                                <tr>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($activity->created_at) }} {{ $activity->created_at->format('H:i:s') }}</td>
                                    <td>{{ $activity->user ? $activity->user->name : 'N/A' }}</td>
                                    <td>{{ $activity->tenant ? $activity->tenant->name : 'N/A' }}</td>
                                    <td><code>{{ $activity->action ?? 'N/A' }}</code></td>
                                    <td>
                                        <span class="badge-modern bg-{{ $activity->level === 'error' || $activity->level === 'critical' ? 'danger' : ($activity->level === 'warning' ? 'warning' : 'info') }}" style="color: white;">
                                            {{ $activity->level ?? 'info' }}
                                        </span>
                                    </td>
                                    <td>{{ \Illuminate\Support\Str::limit($activity->message ?? 'N/A', 50) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-inbox"></i>
                                            <h5>Tidak ada aktivitas ditemukan</h5>
                                            <p>Coba ubah filter pencarian Anda</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-3">
                    {{ $activities->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

