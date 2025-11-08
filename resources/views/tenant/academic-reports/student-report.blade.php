@extends('layouts.tenant')

@section('title', 'Rekap Nilai per Siswa')
@section('page-title', 'Rekap Nilai per Siswa')

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
                <form method="GET" action="{{ tenant_route('tenant.academic-reports.student-report') }}">
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
                        <div class="col-md-4">
                            <label for="student_id" class="form-label">Siswa</label>
                            <select name="student_id" id="student_id" class="form-select">
                                <option value="">Pilih Siswa</option>
                                @foreach($students as $student)
                                    <option value="{{ $student->id }}" 
                                            {{ $studentId == $student->id ? 'selected' : '' }}>
                                        {{ $student->name }} - {{ $student->classRoom->name ?? 'Tidak ada kelas' }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-search me-2"></i>
                                    Filter
                                </button>
                                @if($studentId)
                                    <form action="{{ tenant_route('tenant.academic-reports.print-report') }}" method="POST" class="d-inline">
                                        @csrf
                                        <input type="hidden" name="student_id" value="{{ $studentId }}">
                                        <input type="hidden" name="academic_year_id" value="{{ $academicYearId }}">
                                        <input type="hidden" name="semester" value="{{ $semester }}">
                                        <button type="submit" class="btn btn-success">
                                            <i class="fas fa-print me-2"></i>
                                            Cetak Rapor
                                        </button>
                                    </form>
                                @endif
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@if($studentId && isset($student))
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-user me-2"></i>
                    Rekap Nilai - {{ $student->name }}
                </h5>
            </div>
            <div class="card-body">
                <!-- Informasi Siswa -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <table class="table table-sm table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Nama Siswa</strong></td>
                                <td>{{ $student->name }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>NIS/NISN</strong></td>
                                <td>{{ $student->nis ?? '-' }} / {{ $student->nisn ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Kelas</strong></td>
                                <td>{{ $student->classRoom->name ?? 'Tidak ada kelas' }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-sm table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Tahun Pelajaran</strong></td>
                                <td>{{ $academicYears->where('id', $academicYearId)->first()->year_name ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Semester</strong></td>
                                <td>{{ $semester }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Tanggal Cetak</strong></td>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Tabel Nilai -->
                @if($grades->count() > 0)
                    @php
                        $subjectAverages = [];
                        $overallAverage = 0;
                        
                        // Group by subject and calculate averages
                        $subjectGroups = $grades->groupBy('subject_id');
                        foreach ($subjectGroups as $subjectId => $subjectGrades) {
                            $average = $subjectGrades->avg('final_score');
                            $subjectAverages[$subjectId] = [
                                'subject' => $subjectGrades->first()->subject,
                                'average' => $average,
                                'letter_grade' => $average >= 90 ? 'A' : ($average >= 80 ? 'B' : ($average >= 70 ? 'C' : ($average >= 60 ? 'D' : 'E'))),
                                'teacher' => $subjectGrades->first()->teacher,
                                'details' => $subjectGrades
                            ];
                        }
                        
                        $overallAverage = collect($subjectAverages)->avg('average');
                        $overallLetterGrade = $overallAverage >= 90 ? 'A' : ($overallAverage >= 80 ? 'B' : ($overallAverage >= 70 ? 'C' : ($overallAverage >= 60 ? 'D' : 'E')));
                    @endphp
                    
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-dark">
                                <tr>
                                    <th width="5%">No</th>
                                    <th width="25%">Mata Pelajaran</th>
                                    <th width="15%">Guru</th>
                                    <th width="15%">Nilai Akhir</th>
                                    <th width="10%">Predikat</th>
                                    <th width="10%">Status</th>
                                    <th width="20%">Detail Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php $no = 1; @endphp
                                @foreach($subjectAverages as $subjectId => $data)
                                    <tr>
                                        <td>{{ $no++ }}</td>
                                        <td><strong>{{ $data['subject']->name }}</strong></td>
                                        <td>{{ $data['teacher']->name }}</td>
                                        <td>
                                            <strong class="fs-5">{{ number_format($data['average'], 2) }}</strong>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $data['letter_grade'] == 'A' ? 'success' : ($data['letter_grade'] == 'B' ? 'info' : ($data['letter_grade'] == 'C' ? 'warning' : ($data['letter_grade'] == 'D' ? 'secondary' : 'danger'))) }} fs-6">
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
                                            @foreach($data['details'] as $grade)
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
                    
                    <!-- Ringkasan -->
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h5 class="card-title">Rata-rata Keseluruhan</h5>
                                    <h2 class="text-primary">{{ number_format($overallAverage, 2) }}</h2>
                                    <span class="badge bg-{{ $overallLetterGrade == 'A' ? 'success' : ($overallLetterGrade == 'B' ? 'info' : ($overallLetterGrade == 'C' ? 'warning' : ($overallLetterGrade == 'D' ? 'secondary' : 'danger'))) }} fs-5">
                                        {{ $overallLetterGrade }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h5 class="card-title">Status Kelulusan</h5>
                                    @if($overallAverage >= 60)
                                        <h2 class="text-success">LULUS</h2>
                                        <span class="badge bg-success fs-6">Siswa dinyatakan lulus</span>
                                    @else
                                        <h2 class="text-danger">TIDAK LULUS</h2>
                                        <span class="badge bg-danger fs-6">Siswa tidak memenuhi KKM</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Tidak ada data nilai</h5>
                        <p class="text-muted">Siswa ini belum memiliki nilai untuk periode yang dipilih.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@else
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-body text-center py-5">
                <i class="fas fa-user fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Pilih Siswa untuk Melihat Rekap Nilai</h5>
                <p class="text-muted">Gunakan filter di atas untuk memilih siswa yang ingin dilihat rekapitulasi nilainya.</p>
            </div>
        </div>
    </div>
</div>
@endif
@endsection
