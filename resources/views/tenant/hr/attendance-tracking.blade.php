@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@push('styles')
<style>
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
    
    .stats-card.primary::before { --card-color-1: #3b82f6; --card-color-2: #1d4ed8; }
    .stats-card.success::before { --card-color-1: #10b981; --card-color-2: #059669; }
    .stats-card.warning::before { --card-color-1: #f59e0b; --card-color-2: #d97706; }
    .stats-card.danger::before { --card-color-1: #ef4444; --card-color-2: #dc2626; }
    
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
    
    .stats-icon.primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .stats-icon.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stats-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .stats-icon.danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    
    .table-modern {
        border-radius: 12px;
        overflow: hidden;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .table-modern thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-4 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['present_today'] ?? 0 }}</h3>
                        <small class="text-muted">Hadir Hari Ini</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="stats-card danger">
                <div class="d-flex align-items-center">
                    <div class="stats-icon danger me-3">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['absent_today'] ?? 0 }}</h3>
                        <small class="text-muted">Tidak Hadir</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <h3 class="mb-0 fw-bold">{{ $stats['late_today'] ?? 0 }}</h3>
                        <small class="text-muted">Terlambat</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions & Filters -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#recordAttendanceModal">
                        <i class="fas fa-plus me-1"></i> Catat Absensi
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <input type="date" name="date" class="form-control" value="{{ request('date', date('Y-m-d')) }}">
                        <select name="employee_id" class="form-select">
                            <option value="">Semua Karyawan</option>
                            @foreach($employees ?? [] as $employee)
                                <option value="{{ $employee->id }}" {{ request('employee_id') == $employee->id ? 'selected' : '' }}>
                                    {{ $employee->name }}
                                </option>
                            @endforeach
                        </select>
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Attendance Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>Daftar Absensi
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama Karyawan</th>
                            <th>NIK</th>
                            <th>Tanggal</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Catatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($attendances as $attendance)
                        <tr>
                            <td><strong>{{ $attendance->employee_name ?? '-' }}</strong></td>
                            <td>{{ $attendance->employee_number ?? '-' }}</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($attendance->attendance_date ?? now()) }}</td>
                            <td>{{ $attendance->check_in_time ? \Carbon\Carbon::parse($attendance->check_in_time)->format('H:i') : '-' }}</td>
                            <td>{{ $attendance->check_out_time ? \Carbon\Carbon::parse($attendance->check_out_time)->format('H:i') : '-' }}</td>
                            <td>
                                @if($attendance->status == 'present')
                                    <span class="badge bg-success">Hadir</span>
                                @elseif($attendance->status == 'absent')
                                    <span class="badge bg-danger">Tidak Hadir</span>
                                @elseif($attendance->status == 'late')
                                    <span class="badge bg-warning">Terlambat</span>
                                @else
                                    <span class="badge bg-info">{{ ucfirst($attendance->status ?? '-') }}</span>
                                @endif
                            </td>
                            <td>{{ Str::limit($attendance->notes ?? '-', 30) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada data absensi</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($attendances->hasPages())
        <div class="card-footer bg-white">
            {{ $attendances->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Record Attendance Modal -->
<div class="modal fade" id="recordAttendanceModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-user-check me-2"></i>Catat Absensi
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.hr.record-attendance') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Karyawan <span class="text-danger">*</span></label>
                        <select name="employee_id" class="form-select" required>
                            <option value="">Pilih Karyawan</option>
                            @foreach($employees ?? [] as $employee)
                                <option value="{{ $employee->id }}">{{ $employee->name }} - {{ $employee->employee_number }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tanggal <span class="text-danger">*</span></label>
                        <input type="date" name="attendance_date" class="form-control" value="{{ date('Y-m-d') }}" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Check In</label>
                            <input type="time" name="check_in_time" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Check Out</label>
                            <input type="time" name="check_out_time" class="form-control">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status <span class="text-danger">*</span></label>
                        <select name="status" class="form-select" required>
                            <option value="present">Hadir</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="excused">Izin</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Catatan</label>
                        <textarea name="notes" class="form-control" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

