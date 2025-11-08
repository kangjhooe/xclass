@extends('layouts.tenant')

@section('title', 'Log Aktivitas')
@section('page-title', 'Log Aktivitas')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-history me-2"></i>
                                Log Aktivitas - {{ $student->name }}
                            </h5>
                            <small>Riwayat aktivitas Anda di sistem</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <button onclick="exportLogs()" class="btn btn-light">
                                <i class="fas fa-download me-1"></i> Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['total_activities'] }}</h4>
                            <p class="mb-0">Total Aktivitas</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-chart-line fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['login_count'] }}</h4>
                            <p class="mb-0">Login</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-sign-in-alt fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-info text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['exam_activities'] }}</h4>
                            <p class="mb-0">Aktivitas Ujian</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-clipboard-list fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-warning text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['last_activity'] ? $statistics['last_activity']->time_ago : 'Tidak ada' }}</h4>
                            <p class="mb-0">Aktivitas Terakhir</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <form method="GET" action="{{ tenant_route('student.activity-logs') }}" class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Tipe Aktivitas</label>
                            <select name="activity_type" class="form-select">
                                <option value="">Semua Tipe</option>
                                @foreach($activityTypes as $type)
                                    <option value="{{ $type }}" {{ request('activity_type') === $type ? 'selected' : '' }}>
                                        {{ ucfirst(str_replace('_', ' ', $type)) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Modul</label>
                            <select name="module" class="form-select">
                                <option value="">Semua Modul</option>
                                @foreach($modules as $module)
                                    <option value="{{ $module }}" {{ request('module') === $module ? 'selected' : '' }}>
                                        {{ ucfirst($module) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Dari Tanggal</label>
                            <input type="date" name="date_from" class="form-control" value="{{ request('date_from') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Sampai Tanggal</label>
                            <input type="date" name="date_to" class="form-control" value="{{ request('date_to') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-search me-1"></i> Filter
                                </button>
                                <a href="{{ tenant_route('student.activity-logs') }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-1"></i> Reset
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Activity Logs -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-list me-2"></i>
                        Daftar Aktivitas
                    </h6>
                </div>
                <div class="card-body">
                    @if($activities->count() > 0)
                        <div class="timeline">
                            @foreach($activities as $activity)
                                <div class="timeline-item">
                                    <div class="timeline-marker bg-{{ $activity->activity_color }}">
                                        <i class="{{ $activity->activity_icon }}"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <div class="timeline-header">
                                            <h6 class="timeline-title">{{ $activity->formatted_description }}</h6>
                                            <span class="timeline-time">{{ $activity->time_ago }}</span>
                                        </div>
                                        <div class="timeline-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <small class="text-muted">
                                                        <i class="fas fa-tag me-1"></i>
                                                        {{ ucfirst($activity->module) }} - {{ ucfirst($activity->action) }}
                                                    </small>
                                                </div>
                                                <div class="col-md-6 text-end">
                                                    <small class="text-muted">
                                                        <i class="fas fa-globe me-1"></i>
                                                        {{ $activity->ip_address }}
                                                    </small>
                                                </div>
                                            </div>
                                            @if($activity->description)
                                                <p class="timeline-description mt-2">{{ $activity->description }}</p>
                                            @endif
                                            @if($activity->metadata && count($activity->metadata) > 0)
                                                <div class="timeline-metadata mt-2">
                                                    <button class="btn btn-sm btn-outline-info" type="button" data-bs-toggle="collapse" data-bs-target="#metadata-{{ $activity->id }}">
                                                        <i class="fas fa-info-circle me-1"></i> Detail
                                                    </button>
                                                    <div class="collapse mt-2" id="metadata-{{ $activity->id }}">
                                                        <div class="card card-body">
                                                            <pre class="mb-0">{{ json_encode($activity->metadata, JSON_PRETTY_PRINT) }}</pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        <!-- Pagination -->
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <div class="text-muted">
                                Menampilkan {{ $activities->firstItem() }} sampai {{ $activities->lastItem() }} 
                                dari {{ $activities->total() }} aktivitas
                            </div>
                            <div>
                                {{ $activities->links() }}
                            </div>
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-history fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Tidak ada aktivitas</h5>
                            <p class="text-muted">Belum ada aktivitas yang tercatat untuk periode ini.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #dee2e6;
}

.timeline-item {
    position: relative;
    margin-bottom: 30px;
}

.timeline-marker {
    position: absolute;
    left: -22px;
    top: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    z-index: 1;
}

.timeline-content {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.timeline-title {
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
}

.timeline-time {
    color: #6c757d;
    font-size: 14px;
}

.timeline-body {
    color: #495057;
}

.timeline-description {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
}

.timeline-metadata {
    margin-top: 10px;
}

.bg-success { background-color: #28a745 !important; }
.bg-primary { background-color: #007bff !important; }
.bg-info { background-color: #17a2b8 !important; }
.bg-warning { background-color: #ffc107 !important; }
.bg-danger { background-color: #dc3545 !important; }
.bg-secondary { background-color: #6c757d !important; }

@media (max-width: 768px) {
    .timeline {
        padding-left: 20px;
    }
    
    .timeline::before {
        left: 10px;
    }
    
    .timeline-marker {
        left: -17px;
        width: 25px;
        height: 25px;
        font-size: 10px;
    }
    
    .timeline-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>
@endpush

@push('scripts')
<script>
function exportLogs() {
    const format = prompt('Pilih format export:\n1. Excel\n2. CSV', '1');
    
    if (format === '1' || format === 'excel') {
        window.open('{{ tenant_route("tenant.student.activity-logs.export") }}?format=excel', '_blank');
    } else if (format === '2' || format === 'csv') {
        window.open('{{ tenant_route("tenant.student.activity-logs.export") }}?format=csv', '_blank');
    }
}
</script>
@endpush
