@extends('layouts.tenant')

@section('title', 'Laporan Nilai')
@section('page-title', 'Laporan Nilai')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-file-alt me-3"></i>
                Laporan Nilai
            </h2>
            <p>Laporan nilai siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="filter-card fade-in-up fade-in-up-delay-5 mb-3">
    <form method="GET" action="{{ tenant_route('tenant.grades.report') }}" class="row g-3">
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
            <label class="form-label fw-semibold">Semester</label>
            <select name="semester" class="form-select">
                <option value="">Semua Semester</option>
                <option value="Ganjil" {{ request('semester') == 'Ganjil' ? 'selected' : '' }}>Ganjil</option>
                <option value="Genap" {{ request('semester') == 'Genap' ? 'selected' : '' }}>Genap</option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label fw-semibold">Tahun Pelajaran</label>
            <input type="text" name="academic_year" class="form-control" value="{{ $academicYear }}" placeholder="2024/2025">
        </div>
        <div class="col-md-2">
            <label class="form-label fw-semibold">&nbsp;</label>
            <button type="submit" class="btn btn-modern btn-primary w-100">
                <i class="fas fa-search me-2"></i>Cari
            </button>
        </div>
    </form>
</div>

@if($grades->count() > 0)
    <div class="card-modern fade-in-up fade-in-up-delay-5">
        <div class="card-header">
            <h5 class="mb-0">
                <i class="fas fa-list me-2 text-primary"></i>
                Data Laporan Nilai
            </h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-modern">
                    <thead>
                        <tr>
                            <th>Siswa</th>
                            <th>Mata Pelajaran</th>
                            <th>Jenis Tugas</th>
                            <th>Nilai</th>
                            <th>Persentase</th>
                            <th>Semester</th>
                            <th>Tahun Pelajaran</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($grades as $grade)
                        <tr>
                            <td>{{ $grade->student->name ?? '-' }}</td>
                            <td>{{ $grade->subject->name ?? '-' }}</td>
                            <td>{{ $grade->assignment_type ?? '-' }}</td>
                            <td>
                                <strong>{{ $grade->score ?? 0 }} / {{ $grade->max_score ?? 100 }}</strong>
                            </td>
                            <td>
                                @if($grade->max_score > 0)
                                    <span class="badge-modern {{ ($grade->score / $grade->max_score) * 100 >= 75 ? 'bg-success' : (($grade->score / $grade->max_score) * 100 >= 60 ? 'bg-warning' : 'bg-danger') }}">
                                        {{ number_format(($grade->score / $grade->max_score) * 100, 2) }}%
                                    </span>
                                @else
                                    <span class="badge-modern bg-secondary">0%</span>
                                @endif
                            </td>
                            <td>{{ $grade->semester ?? '-' }}</td>
                            <td>{{ $grade->academic_year ?? '-' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@else
    <div class="card-modern fade-in-up fade-in-up-delay-5">
        <div class="card-body text-center py-5">
            <i class="fas fa-inbox fa-3x text-muted mb-3" style="opacity: 0.3;"></i>
            <p class="text-muted">Tidak ada data nilai</p>
        </div>
    </div>
@endif
@endsection
