@extends('layouts.tenant')

@section('title', 'Nilai Siswa')
@section('page-title', 'Nilai Siswa')

@section('content')
<!-- Filter -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-filter me-2"></i>
                    Filter Data
                </h6>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ tenant_route('tenant.student-grades.index') }}">
                    <div class="row">
                        <div class="col-md-3">
                            <label for="academic_year_id" class="form-label">Tahun Pelajaran</label>
                            <select name="academic_year_id" id="academic_year_id" class="form-select">
                                <option value="">Semua Tahun</option>
                                @foreach($academicYears as $academicYear)
                                    <option value="{{ $academicYear->id }}" 
                                            {{ request('academic_year_id') == $academicYear->id ? 'selected' : '' }}>
                                        {{ $academicYear->year_name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="semester" class="form-label">Semester</label>
                            <select name="semester" id="semester" class="form-select">
                                <option value="">Semua</option>
                                <option value="1" {{ request('semester') == '1' ? 'selected' : '' }}>Semester 1</option>
                                <option value="2" {{ request('semester') == '2' ? 'selected' : '' }}>Semester 2</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="subject_id" class="form-label">Mata Pelajaran</label>
                            <select name="subject_id" id="subject_id" class="form-select">
                                <option value="">Semua Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                    <option value="{{ $subject->id }}" 
                                            {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                        {{ $subject->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="student_id" class="form-label">Siswa</label>
                            <select name="student_id" id="student_id" class="form-select">
                                <option value="">Semua Siswa</option>
                                @foreach($students as $student)
                                    <option value="{{ $student->id }}" 
                                            {{ request('student_id') == $student->id ? 'selected' : '' }}>
                                        {{ $student->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-1">
                            <label class="form-label">&nbsp;</label>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search"></i>
                            </button>
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
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-chart-line me-2"></i>
                    Daftar Nilai Siswa
                </h5>
                <div>
                    <a href="{{ tenant_route('tenant.student-grades.bulk-input') }}" class="btn btn-success me-2">
                        <i class="fas fa-plus-circle me-2"></i>
                        Input Massal
                    </a>
                    <a href="{{ tenant_route('tenant.student-grades.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Nilai
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if($studentGrades->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Siswa</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Jenis Penilaian</th>
                                    <th>Nama Tugas</th>
                                    <th>Nilai</th>
                                    <th>Nilai Akhir</th>
                                    <th>Status</th>
                                    <th>Guru</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($studentGrades as $index => $grade)
                                    <tr>
                                        <td>{{ $studentGrades->firstItem() + $index }}</td>
                                        <td>
                                            <strong>{{ $grade->student->name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $grade->student->classRoom->name ?? '-' }}</small>
                                        </td>
                                        <td>{{ $grade->subject->name }}</td>
                                        <td>
                                            <span class="badge bg-info">{{ $grade->assignment_type_label }}</span>
                                        </td>
                                        <td>{{ $grade->assignment_name }}</td>
                                        <td>
                                            @if($grade->score !== null)
                                                <strong>{{ number_format($grade->score, 2) }}</strong>
                                                <small class="text-muted">/ {{ number_format($grade->max_score, 2) }}</small>
                                                <br>
                                                <small class="text-muted">({{ number_format($grade->percentage, 1) }}%)</small>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($grade->final_score !== null)
                                                <strong>{{ number_format($grade->final_score, 2) }}</strong>
                                                <br>
                                                <span class="badge bg-{{ $grade->letter_grade == 'A' ? 'success' : ($grade->letter_grade == 'B' ? 'info' : ($grade->letter_grade == 'C' ? 'warning' : 'danger')) }}">
                                                    {{ $grade->letter_grade }}
                                                </span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($grade->is_passed)
                                                <span class="badge bg-success">Lulus</span>
                                            @else
                                                <span class="badge bg-danger">Tidak Lulus</span>
                                            @endif
                                        </td>
                                        <td>{{ $grade->teacher->name }}</td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('tenant.student-grades.show', $grade) }}" 
                                                   class="btn btn-sm btn-outline-info">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.student-grades.edit', $grade) }}" 
                                                   class="btn btn-sm btn-outline-warning">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.student-grades.destroy', $grade) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Hapus nilai ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        {{ $studentGrades->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada data nilai</h5>
                        <p class="text-muted">Mulai dengan menambahkan nilai siswa atau gunakan fitur input massal.</p>
                        <div>
                            <a href="{{ tenant_route('tenant.student-grades.bulk-input') }}" class="btn btn-success me-2">
                                <i class="fas fa-plus-circle me-2"></i>
                                Input Massal
                            </a>
                            <a href="{{ tenant_route('tenant.student-grades.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>
                                Tambah Nilai
                            </a>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
