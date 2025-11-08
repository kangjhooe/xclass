@extends('layouts.tenant')

@section('title', 'Rekap Nilai per Kelas')
@section('page-title', 'Rekap Nilai per Kelas')

@section('content')
<!-- Filter -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-filter me-2"></i>
                    Filter Laporan
                </h6>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ tenant_route('tenant.academic-reports.class-report') }}">
                    <div class="row">
                        <div class="col-md-3">
                            <label for="academic_year_id" class="form-label">Tahun Pelajaran</label>
                            <select name="academic_year_id" id="academic_year_id" class="form-select">
                                <option value="">Pilih Tahun Pelajaran</option>
                                @foreach($academicYears as $academicYear)
                                    <option value="{{ $academicYear->id }}" 
                                            {{ $academicYearId == $academicYear->id ? 'selected' : '' }}>
                                        {{ $academicYear->year_name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="semester" class="form-label">Semester</label>
                            <select name="semester" id="semester" class="form-select">
                                <option value="1" {{ $semester == 1 ? 'selected' : '' }}>Semester 1</option>
                                <option value="2" {{ $semester == 2 ? 'selected' : '' }}>Semester 2</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="class_id" class="form-label">Kelas</label>
                            <select name="class_id" id="class_id" class="form-select">
                                <option value="">Semua Kelas</option>
                                @foreach($classes as $class)
                                    <option value="{{ $class->id }}" 
                                            {{ $classId == $class->id ? 'selected' : '' }}>
                                        {{ $class->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search me-2"></i>
                                Filter
                            </button>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <a href="{{ tenant_route('tenant.academic-reports.export-grades') }}?academic_year_id={{ $academicYearId }}&semester={{ $semester }}&class_id={{ $classId }}" 
                               class="btn btn-success w-100">
                                <i class="fas fa-download me-2"></i>
                                Export
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-users me-2"></i>
                    Rekap Nilai per Kelas
                </h5>
            </div>
            <div class="card-body">
                @if($grades->count() > 0)
                    @foreach($grades as $studentId => $studentGrades)
                        @php
                            $student = $studentGrades->first()->student;
                            $subjectAverages = [];
                            $overallAverage = 0;
                            
                            // Group by subject and calculate averages
                            $subjectGroups = $studentGrades->groupBy('subject_id');
                            foreach ($subjectGroups as $subjectId => $subjectGrades) {
                                $average = $subjectGrades->avg('final_score');
                                $subjectAverages[$subjectId] = [
                                    'subject' => $subjectGrades->first()->subject,
                                    'average' => $average,
                                    'letter_grade' => $average >= 90 ? 'A' : ($average >= 80 ? 'B' : ($average >= 70 ? 'C' : ($average >= 60 ? 'D' : 'E'))),
                                ];
                            }
                            
                            $overallAverage = collect($subjectAverages)->avg('average');
                        @endphp
                        
                        <div class="card mb-4">
                            <div class="card-header bg-light">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <h6 class="mb-0">
                                            <strong>{{ $student->name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $student->classRoom->name ?? 'Tidak ada kelas' }}</small>
                                        </h6>
                                    </div>
                                    <div class="col-md-6 text-end">
                                        <span class="badge bg-primary fs-6">
                                            Rata-rata: {{ number_format($overallAverage, 2) }}
                                        </span>
                                        <span class="badge bg-{{ $overallAverage >= 90 ? 'success' : ($overallAverage >= 80 ? 'info' : ($overallAverage >= 70 ? 'warning' : ($overallAverage >= 60 ? 'secondary' : 'danger'))) }} fs-6">
                                            {{ $overallAverage >= 90 ? 'A' : ($overallAverage >= 80 ? 'B' : ($overallAverage >= 70 ? 'C' : ($overallAverage >= 60 ? 'D' : 'E'))) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered">
                                        <thead>
                                            <tr>
                                                <th width="5%">No</th>
                                                <th width="25%">Mata Pelajaran</th>
                                                <th width="15%">Nilai Akhir</th>
                                                <th width="10%">Predikat</th>
                                                <th width="15%">Status</th>
                                                <th width="30%">Detail Nilai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @php $no = 1; @endphp
                                            @foreach($subjectAverages as $subjectId => $data)
                                                <tr>
                                                    <td>{{ $no++ }}</td>
                                                    <td>{{ $data['subject']->name }}</td>
                                                    <td>
                                                        <strong>{{ number_format($data['average'], 2) }}</strong>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-{{ $data['letter_grade'] == 'A' ? 'success' : ($data['letter_grade'] == 'B' ? 'info' : ($data['letter_grade'] == 'C' ? 'warning' : ($data['letter_grade'] == 'D' ? 'secondary' : 'danger'))) }}">
                                                            {{ $data['letter_grade'] }}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        @if($data['average'] >= 60)
                                                            <span class="badge bg-success">Lulus</span>
                                                        @else
                                                            <span class="badge bg-danger">Tidak Lulus</span>
                                                        @endif
                                                    </td>
                                                    <td>
                                                        @php
                                                            $subjectGrades = $studentGrades->where('subject_id', $subjectId);
                                                        @endphp
                                                        @foreach($subjectGrades as $grade)
                                                            <div class="d-flex justify-content-between">
                                                                <small>{{ $grade->assignment_type_label }}:</small>
                                                                <small><strong>{{ number_format($grade->final_score ?? 0, 2) }}</strong></small>
                                                            </div>
                                                        @endforeach
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Tidak ada data nilai</h5>
                        <p class="text-muted">Pilih filter yang sesuai untuk melihat rekap nilai.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
