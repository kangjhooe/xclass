@extends('layouts.tenant')

@section('title', 'Laporan Nilai')
@section('page-title', 'Laporan Nilai')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-line me-2"></i>
                        Laporan Nilai Siswa
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
                            <select name="subject_id" class="form-select">
                                <option value="">Semua Mata Pelajaran</option>
                                @foreach(\App\Models\Subject::where('instansi_id', session('instansi_id'))->get() as $subject)
                                    <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                        {{ $subject->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select name="academic_year_id" class="form-select">
                                <option value="">Semua Tahun Ajaran</option>
                                @foreach(\App\Models\AcademicYear::where('instansi_id', session('instansi_id'))->get() as $year)
                                    <option value="{{ $year->id }}" {{ request('academic_year_id') == $year->id ? 'selected' : '' }}>
                                        {{ $year->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Filter
                            </button>
                        </div>
                        <div class="col-md-1">
                            <a href="{{ tenant_route('report.grades') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i>
                            </a>
                        </div>
                    </form>

                    <!-- Grades Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Siswa</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Nilai</th>
                                    <th>Grade</th>
                                    <th>Semester</th>
                                    <th>Tahun Ajaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($grades as $index => $grade)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $grade->student_name }}</td>
                                    <td>{{ $grade->class_name ?? 'N/A' }}</td>
                                    <td>{{ $grade->subject_name ?? 'N/A' }}</td>
                                    <td>
                                        <span class="fw-bold">{{ $grade->score }}</span>
                                    </td>
                                    <td>
                                        @if($grade->grade == 'A')
                                            <span class="badge bg-success">A</span>
                                        @elseif($grade->grade == 'B')
                                            <span class="badge bg-primary">B</span>
                                        @elseif($grade->grade == 'C')
                                            <span class="badge bg-warning">C</span>
                                        @elseif($grade->grade == 'D')
                                            <span class="badge bg-danger">D</span>
                                        @else
                                            <span class="badge bg-secondary">{{ $grade->grade }}</span>
                                        @endif
                                    </td>
                                    <td>{{ $grade->semester ?? '-' }}</td>
                                    <td>{{ $grade->academic_year_name ?? '-' }}</td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-chart-line fa-3x mb-3 d-block"></i>
                                        <p>Tidak ada data nilai</p>
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
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'grades']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'grades']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-success w-100 mb-2">
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
