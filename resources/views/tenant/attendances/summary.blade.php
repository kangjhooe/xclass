@extends('layouts.tenant')

@section('title', 'Ringkasan Kehadiran')
@section('page-title', 'Ringkasan Kehadiran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chart-bar me-3"></i>
                Ringkasan Kehadiran
            </h2>
            <p>Ringkasan data kehadiran siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.attendances.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="filter-card fade-in-up fade-in-up-delay-5 mb-3">
    <form method="GET" action="{{ tenant_route('tenant.attendance.summary') }}" class="row g-3">
        <div class="col-md-4">
            <label class="form-label fw-semibold">Siswa</label>
            <select name="student_id" class="form-select">
                <option value="">Semua Siswa</option>
                @foreach($students as $student)
                    <option value="{{ $student->id }}" {{ request('student_id') == $student->id ? 'selected' : '' }}>
                        {{ $student->name }}
                    </option>
                @endforeach
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label fw-semibold">Tanggal Dari</label>
            <input type="date" name="date_from" class="form-control" value="{{ $dateFrom }}">
        </div>
        <div class="col-md-3">
            <label class="form-label fw-semibold">Tanggal Sampai</label>
            <input type="date" name="date_to" class="form-control" value="{{ $dateTo }}">
        </div>
        <div class="col-md-2">
            <label class="form-label fw-semibold">&nbsp;</label>
            <button type="submit" class="btn btn-modern btn-primary w-100">
                <i class="fas fa-search me-2"></i>Cari
            </button>
        </div>
    </form>
</div>

@foreach($attendances as $studentId => $studentAttendances)
    @php
        $student = $studentAttendances->first()->student ?? null;
        $total = $studentAttendances->count();
        $present = $studentAttendances->where('status', 'present')->count();
        $absent = $studentAttendances->where('status', 'absent')->count();
        $late = $studentAttendances->where('status', 'late')->count();
        $excused = $studentAttendances->where('status', 'excused')->count();
    @endphp
    
    <div class="card-modern fade-in-up fade-in-up-delay-5 mb-4">
        <div class="card-header">
            <h5 class="mb-0">
                <i class="fas fa-user me-2 text-primary"></i>
                {{ $student->name ?? 'Siswa #' . $studentId }}
            </h5>
        </div>
        <div class="card-body">
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="stat-card primary">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $total }}</h3>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total</p>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card success">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $present }}</h3>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Hadir</p>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card danger">
                        <div class="stat-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3 class="mb-1" style="font-weight: 700; color: #dc2626; font-size: 2rem;">{{ $absent }}</h3>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Tidak Hadir</p>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stat-card warning">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $late }}</h3>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Terlambat</p>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-modern">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Mata Pelajaran</th>
                            <th>Status</th>
                            <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($studentAttendances as $attendance)
                        <tr>
                            <td>{{ \Carbon\Carbon::parse($attendance->attendance_date)->format('d-m-Y') }}</td>
                            <td>{{ $attendance->schedule->subject->name ?? '-' }}</td>
                            <td>
                                @if($attendance->status == 'present')
                                    <span class="badge-modern bg-success">Hadir</span>
                                @elseif($attendance->status == 'absent')
                                    <span class="badge-modern bg-danger">Tidak Hadir</span>
                                @elseif($attendance->status == 'late')
                                    <span class="badge-modern bg-warning">Terlambat</span>
                                @elseif($attendance->status == 'excused')
                                    <span class="badge-modern bg-info">Izin</span>
                                @endif
                            </td>
                            <td>{{ $attendance->notes ?? '-' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endforeach
@endsection
