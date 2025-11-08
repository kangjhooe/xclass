@extends('layouts.tenant')

@section('title', 'Nilai Siswa')
@section('page-title', 'Nilai Siswa')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-chart-line me-2"></i>
                    Daftar Nilai Siswa
                </h5>
                <div class="btn-group">
                    <a href="{{ tenant_route('tenant.grades.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Nilai
                    </a>
                    <a href="{{ tenant_route('tenant.grades.by-student') }}" class="btn btn-info">
                        <i class="fas fa-user me-2"></i>
                        Nilai per Siswa
                    </a>
                    <a href="{{ tenant_route('tenant.grades.by-subject') }}" class="btn btn-warning">
                        <i class="fas fa-book me-2"></i>
                        Nilai per Mata Pelajaran
                    </a>
                </div>
            </div>
            <div class="card-body">
                <!-- Filter Form -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        <form method="GET" class="row g-3">
                            <div class="col-md-2">
                                <select name="student_id" class="form-control">
                                    <option value="">Semua Siswa</option>
                                    @foreach($students as $student)
                                        <option value="{{ $student->id }}" {{ request('student_id') == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="subject_id" class="form-control">
                                    <option value="">Semua Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="teacher_id" class="form-control">
                                    <option value="">Semua Guru</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ request('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="assignment_type" class="form-control">
                                    <option value="">Semua Tipe</option>
                                    <option value="UTS" {{ request('assignment_type') == 'UTS' ? 'selected' : '' }}>UTS</option>
                                    <option value="UAS" {{ request('assignment_type') == 'UAS' ? 'selected' : '' }}>UAS</option>
                                    <option value="Tugas" {{ request('assignment_type') == 'Tugas' ? 'selected' : '' }}>Tugas</option>
                                    <option value="Quiz" {{ request('assignment_type') == 'Quiz' ? 'selected' : '' }}>Quiz</option>
                                    <option value="Praktikum" {{ request('assignment_type') == 'Praktikum' ? 'selected' : '' }}>Praktikum</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="academic_year" class="form-control">
                                    <option value="">Semua Tahun</option>
                                    <option value="2024/2025" {{ request('academic_year') == '2024/2025' ? 'selected' : '' }}>2024/2025</option>
                                    <option value="2023/2024" {{ request('academic_year') == '2023/2024' ? 'selected' : '' }}>2023/2024</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="semester" class="form-control">
                                    <option value="">Semua Semester</option>
                                    <option value="1" {{ request('semester') == '1' ? 'selected' : '' }}>Semester 1</option>
                                    <option value="2" {{ request('semester') == '2' ? 'selected' : '' }}>Semester 2</option>
                                </select>
                            </div>
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-outline-primary">
                                    <i class="fas fa-filter me-2"></i>
                                    Filter
                                </button>
                                <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-2"></i>
                                    Reset
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                
                @if($grades->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Siswa</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Tipe Penilaian</th>
                                    <th>Nama Penilaian</th>
                                    <th>Nilai</th>
                                    <th>Persentase</th>
                                    <th>Grade</th>
                                    <th>Guru</th>
                                    <th>Tahun Ajaran</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($grades as $grade)
                                    <tr>
                                        <td>
                                            <strong>{{ $grade->student->name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $grade->student->nis }}</small>
                                        </td>
                                        <td>
                                            <strong>{{ $grade->subject->name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $grade->subject->code }}</small>
                                        </td>
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
                                        <td>
                                            <small>{{ $grade->academic_year }}</small>
                                            <br>
                                            <small class="text-muted">Semester {{ $grade->semester }}</small>
                                        </td>
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
                                                <form action="{{ tenant_route('tenant.grades.destroy', $grade) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus nilai ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
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
                        {{ $grades->links() }}
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada nilai</h5>
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
