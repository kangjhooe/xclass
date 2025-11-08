@extends('layouts.tenant')

@section('title', 'Nilai per Siswa')
@section('page-title', 'Nilai per Siswa')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-user me-2"></i>
                    Nilai {{ $student->name }}
                </h5>
                <div class="btn-group">
                    <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali
                    </a>
                    <a href="{{ tenant_route('tenant.grades.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Nilai
                    </a>
                </div>
            </div>
            <div class="card-body">
                <!-- Filter Form -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        <form method="GET" class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Tahun Ajaran</label>
                                <select name="academic_year" class="form-control">
                                    <option value="2024/2025" {{ $academicYear == '2024/2025' ? 'selected' : '' }}>2024/2025</option>
                                    <option value="2023/2024" {{ $academicYear == '2023/2024' ? 'selected' : '' }}>2023/2024</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Semester</label>
                                <select name="semester" class="form-control">
                                    <option value="1" {{ $semester == 1 ? 'selected' : '' }}>Semester 1</option>
                                    <option value="2" {{ $semester == 2 ? 'selected' : '' }}>Semester 2</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">&nbsp;</label>
                                <div>
                                    <button type="submit" class="btn btn-outline-primary">
                                        <i class="fas fa-filter me-2"></i>
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                @if($grades->count() > 0)
                    @foreach($grades as $subjectId => $subjectGrades)
                        <div class="card mb-4">
                            <div class="card-header">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-book me-2"></i>
                                    {{ $subjectGrades->first()->subject->name }}
                                    <span class="badge bg-info ms-2">{{ $subjectGrades->first()->subject->code }}</span>
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Tipe Penilaian</th>
                                                <th>Nama Penilaian</th>
                                                <th>Nilai</th>
                                                <th>Persentase</th>
                                                <th>Grade</th>
                                                <th>Guru</th>
                                                <th>Tanggal</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($subjectGrades as $grade)
                                                <tr>
                                                    <td>
                                                        <span class="badge bg-info">{{ $grade->assignment_type }}</span>
                                                    </td>
                                                    <td>{{ $grade->assignment_name }}</td>
                                                    <td>
                                                        <strong>{{ $grade->score }}</strong>
                                                        <br>
                                                        <small class="text-muted">/ {{ $grade->max_score }}</small>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-{{ $grade->percentage >= 80 ? 'success' : ($grade->percentage >= 60 ? 'warning' : 'danger') }}">
                                                            {{ number_format($grade->percentage, 1) }}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-{{ $this->getGradeColor($grade->grade_letter) }}">
                                                            {{ $grade->grade_letter }}
                                                        </span>
                                                    </td>
                                                    <td>{{ $grade->teacher->name }}</td>
                                                    <td>{{ $grade->created_at->format('d M Y') }}</td>
                                                    <td>
                                                        <div class="btn-group" role="group">
                                                            <a href="{{ tenant_route('tenant.grades.show', $grade) }}" 
                                                               class="btn btn-sm btn-outline-info" title="Lihat">
                                                                <i class="fas fa-eye"></i>
                                                            </a>
                                                            <a href="{{ tenant_route('tenant.grades.edit', $grade) }}" 
                                                               class="btn btn-sm btn-outline-warning" title="Edit">
                                                                <i class="fas fa-edit"></i>
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                                
                                <!-- Summary -->
                                <div class="row mt-3">
                                    <div class="col-md-3">
                                        <div class="card border-primary">
                                            <div class="card-body text-center">
                                                <h6 class="card-title text-primary">Rata-rata</h6>
                                                <h4 class="text-primary">
                                                    {{ number_format($subjectGrades->avg('percentage'), 1) }}%
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card border-success">
                                            <div class="card-body text-center">
                                                <h6 class="card-title text-success">Nilai Tertinggi</h6>
                                                <h4 class="text-success">
                                                    {{ $subjectGrades->max('percentage') }}%
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card border-warning">
                                            <div class="card-body text-center">
                                                <h6 class="card-title text-warning">Nilai Terendah</h6>
                                                <h4 class="text-warning">
                                                    {{ $subjectGrades->min('percentage') }}%
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card border-info">
                                            <div class="card-body text-center">
                                                <h6 class="card-title text-info">Total Penilaian</h6>
                                                <h4 class="text-info">
                                                    {{ $subjectGrades->count() }}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada nilai untuk siswa ini</h5>
                        <p class="text-muted">Mulai dengan menambahkan nilai pertama</p>
                        <a href="{{ tenant_route('tenant.grades.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Nilai
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@php
function getGradeColor($grade) {
    switch($grade) {
        case 'A': return 'success';
        case 'B+': return 'success';
        case 'B': return 'info';
        case 'C+': return 'info';
        case 'C': return 'warning';
        case 'D': return 'warning';
        case 'E': return 'danger';
        default: return 'secondary';
    }
}
@endphp
