@extends('layouts.tenant')

@section('title', 'Laporan Kehadiran')
@section('page-title', 'Laporan Kehadiran')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-calendar-check me-2"></i>
                        Laporan Kehadiran Siswa
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="GET" class="row mb-4">
                        <div class="col-md-3">
                            <select name="class_id" class="form-select">
                                <option value="">Semua Kelas</option>
                                @foreach(\App\Models\ClassRoom::where('instansi_id', session('instansi_id'))->get() as $class)
                                    <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                        {{ $class->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}" placeholder="Tanggal Mulai" required>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}" placeholder="Tanggal Akhir" required>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Filter
                            </button>
                        </div>
                        <div class="col-md-1">
                            <a href="{{ tenant_route('report.attendance') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i>
                            </a>
                        </div>
                    </form>

                    <!-- Statistics -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_attendance'] }}</h4>
                                            <small>Total Kehadiran</small>
                                        </div>
                                        <i class="fas fa-calendar fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['present'] }}</h4>
                                            <small>Hadir</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-danger text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['absent'] }}</h4>
                                            <small>Tidak Hadir</small>
                                        </div>
                                        <i class="fas fa-times fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['late'] }}</h4>
                                            <small>Terlambat</small>
                                        </div>
                                        <i class="fas fa-clock fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Attendance Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Siswa</th>
                                    <th>Kelas</th>
                                    <th>Tanggal</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($attendances as $index => $attendance)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $attendance->student_name }}</td>
                                    <td>{{ $attendance->class_name ?? 'N/A' }}</td>
                                    <td>{{ \Carbon\Carbon::parse($attendance->attendance_date)->format('d/m/Y') }}</td>
                                    <td>
                                        @if($attendance->status == 'present')
                                            <span class="badge bg-success">Hadir</span>
                                        @elseif($attendance->status == 'absent')
                                            <span class="badge bg-danger">Tidak Hadir</span>
                                        @elseif($attendance->status == 'late')
                                            <span class="badge bg-warning">Terlambat</span>
                                        @else
                                            <span class="badge bg-info">{{ ucfirst($attendance->status) }}</span>
                                        @endif
                                    </td>
                                    <td>{{ $attendance->notes ?? '-' }}</td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted">
                                        <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
                                        <p>Tidak ada data kehadiran</p>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Export Actions -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Export Laporan</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'attendance']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'attendance']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-success w-100 mb-2">
                                                <i class="fas fa-file-excel me-1"></i>
                                                Export Excel
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <button onclick="window.print()" class="btn btn-outline-info w-100 mb-2">
                                                <i class="fas fa-print me-1"></i>
                                                Print
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.index') }}" class="btn btn-outline-secondary w-100 mb-2">
                                                <i class="fas fa-arrow-left me-1"></i>
                                                Kembali
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
