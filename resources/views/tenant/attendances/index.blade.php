@extends('layouts.tenant')

@section('title', 'Data Kehadiran')
@section('page-title', 'Data Kehadiran')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .filter-card {
        background: #f8f9fa;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .badge-status {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.875rem;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-12">
            <h2>
                <i class="fas fa-calendar-check me-3"></i>
                Data Kehadiran
            </h2>
            <p>Kelola data kehadiran siswa</p>
        </div>
    </div>
</div>

<!-- Filter Card -->
<div class="filter-card mb-4 fade-in-up fade-in-up-delay-5">
        <form method="GET" action="{{ tenant_route('tenant.attendances.index') }}" class="row g-3">
            @if(Auth::user()->role === 'school_admin')
            <div class="col-md-3">
                <label class="form-label">Tahun Pelajaran</label>
                <select name="academic_year" class="form-select">
                    <option value="">Semua Tahun</option>
                    @foreach($academicYears as $year)
                        <option value="{{ $year->id }}" {{ request('academic_year') == $year->id ? 'selected' : '' }}>
                            {{ $year->year_name }}
                        </option>
                    @endforeach
                </select>
            </div>
            @endif
            <div class="col-md-3">
                <label class="form-label">Tanggal Dari</label>
                <input type="date" name="date_from" class="form-control" value="{{ request('date_from') }}">
            </div>
            <div class="col-md-3">
                <label class="form-label">Tanggal Sampai</label>
                <input type="date" name="date_to" class="form-control" value="{{ request('date_to') }}">
            </div>
            <div class="col-md-3">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                    <option value="">Semua Status</option>
                    <option value="present" {{ request('status') == 'present' ? 'selected' : '' }}>Hadir</option>
                    <option value="absent" {{ request('status') == 'absent' ? 'selected' : '' }}>Tidak Hadir</option>
                    <option value="late" {{ request('status') == 'late' ? 'selected' : '' }}>Terlambat</option>
                    <option value="excused" {{ request('status') == 'excused' ? 'selected' : '' }}>Izin</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Pencarian</label>
                <input type="text" name="search" class="form-control" placeholder="Cari siswa..." value="{{ request('search') }}">
            </div>
            <div class="col-md-12">
                <button type="submit" class="btn btn-modern btn-primary"><i class="fas fa-search me-1"></i>Cari</button>
                <a href="{{ tenant_route('tenant.attendances.index') }}" class="btn btn-modern btn-secondary"><i class="fas fa-redo me-1"></i>Reset</a>
                <a href="{{ tenant_route('tenant.attendances.create') }}" class="btn btn-modern btn-success"><i class="fas fa-plus me-1"></i>Tambah Kehadiran</a>
            </div>
        </form>
</div>

<!-- Table -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Kehadiran
        </h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-modern">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Siswa</th>
                            <th>Mata Pelajaran</th>
                            <th>Guru</th>
                            <th>Status</th>
                            <th>Keterangan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($attendances as $attendance)
                        <tr>
                            <td>{{ \Carbon\Carbon::parse($attendance->attendance_date)->format('d-m-Y') }}</td>
                            <td>{{ $attendance->student->name ?? '-' }}</td>
                            <td>{{ $attendance->schedule->subject->name ?? '-' }}</td>
                            <td>{{ $attendance->teacher->name ?? '-' }}</td>
                            <td>
                                @if($attendance->status == 'present')
                                    <span class="badge bg-success badge-status">Hadir</span>
                                @elseif($attendance->status == 'absent')
                                    <span class="badge bg-danger badge-status">Tidak Hadir</span>
                                @elseif($attendance->status == 'late')
                                    <span class="badge bg-warning badge-status">Terlambat</span>
                                @elseif($attendance->status == 'excused')
                                    <span class="badge bg-info badge-status">Izin</span>
                                @endif
                            </td>
                            <td>{{ $attendance->notes ?? '-' }}</td>
                            <td>
                                <div class="action-buttons">
                                    <a href="{{ tenant_route('tenant.attendances.show', ['attendance' => $attendance->id]) }}" class="btn btn-modern btn-primary btn-sm">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ tenant_route('tenant.attendances.edit', ['attendance' => $attendance->id]) }}" class="btn btn-modern btn-warning btn-sm">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ tenant_route('tenant.attendances.destroy', ['attendance' => $attendance->id]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-modern btn-danger btn-sm">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-4">Tidak ada data kehadiran</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                {{ $attendances->links() }}
            </div>
        </div>
    </div>
</div>
@endsection

