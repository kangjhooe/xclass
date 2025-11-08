@extends('layouts.tenant')

@section('title', 'Edit Nilai Siswa')
@section('page-title', 'Edit Nilai Siswa')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-edit me-2"></i>
                    Form Edit Nilai Siswa
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.student-grades.update', $studentGrade) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                                    <option value="">Pilih Siswa</option>
                                    @foreach($students as $student)
                                        <option value="{{ $student->id }}" {{ old('student_id', $studentGrade->student_id) == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} - {{ $student->classRoom->name ?? 'Tidak ada kelas' }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('student_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                <select name="subject_id" id="subject_id" class="form-select @error('subject_id') is-invalid @enderror" required>
                                    <option value="">Pilih Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ old('subject_id', $studentGrade->subject_id) == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('subject_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                                <select name="teacher_id" id="teacher_id" class="form-select @error('teacher_id') is-invalid @enderror" required>
                                    <option value="">Pilih Guru</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('teacher_id', $studentGrade->teacher_id) == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('teacher_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="academic_year_id" class="form-label">Tahun Pelajaran <span class="text-danger">*</span></label>
                                <select name="academic_year_id" id="academic_year_id" class="form-select @error('academic_year_id') is-invalid @enderror" required>
                                    <option value="">Pilih Tahun Pelajaran</option>
                                    @foreach($academicYears as $academicYear)
                                        <option value="{{ $academicYear->id }}" {{ old('academic_year_id', $studentGrade->academic_year_id) == $academicYear->id ? 'selected' : '' }}>
                                            {{ $academicYear->year_name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('academic_year_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="semester" class="form-label">Semester <span class="text-danger">*</span></label>
                                <select name="semester" id="semester" class="form-select @error('semester') is-invalid @enderror" required>
                                    <option value="">Pilih Semester</option>
                                    <option value="1" {{ old('semester', $studentGrade->semester) == '1' ? 'selected' : '' }}>Semester 1</option>
                                    <option value="2" {{ old('semester', $studentGrade->semester) == '2' ? 'selected' : '' }}>Semester 2</option>
                                </select>
                                @error('semester')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="assignment_type" class="form-label">Jenis Penilaian <span class="text-danger">*</span></label>
                                <select name="assignment_type" id="assignment_type" class="form-select @error('assignment_type') is-invalid @enderror" required>
                                    <option value="">Pilih Jenis Penilaian</option>
                                    @foreach($assignmentTypes as $key => $label)
                                        <option value="{{ $key }}" {{ old('assignment_type', $studentGrade->assignment_type) == $key ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('assignment_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="assignment_name" class="form-label">Nama Tugas/Evaluasi <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('assignment_name') is-invalid @enderror" 
                                       id="assignment_name" name="assignment_name" value="{{ old('assignment_name', $studentGrade->assignment_name) }}" 
                                       placeholder="Contoh: UTS Matematika" required>
                                @error('assignment_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <div class="mb-3">
                                <label for="score" class="form-label">Nilai</label>
                                <input type="number" class="form-control @error('score') is-invalid @enderror" 
                                       id="score" name="score" value="{{ old('score', $studentGrade->score) }}" 
                                       min="0" step="0.01" placeholder="0.00">
                                @error('score')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <div class="mb-3">
                                <label for="max_score" class="form-label">Nilai Maksimal <span class="text-danger">*</span></label>
                                <input type="number" class="form-control @error('max_score') is-invalid @enderror" 
                                       id="max_score" name="max_score" value="{{ old('max_score', $studentGrade->max_score) }}" 
                                       min="1" step="0.01" required>
                                @error('max_score')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="notes" class="form-label">Keterangan</label>
                        <textarea class="form-control @error('notes') is-invalid @enderror" 
                                  id="notes" name="notes" rows="3" 
                                  placeholder="Keterangan tambahan (opsional)">{{ old('notes', $studentGrade->notes) }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Nilai
                </h6>
            </div>
            <div class="card-body">
                <p class="mb-3">
                    <strong>Nilai Akhir Saat Ini:</strong>
                    @if($studentGrade->final_score)
                        <span class="badge bg-primary fs-6">{{ number_format($studentGrade->final_score, 2) }}</span>
                    @else
                        <span class="text-muted">Belum dihitung</span>
                    @endif
                </p>
                <p class="mb-3">
                    <strong>Predikat:</strong>
                    @if($studentGrade->letter_grade)
                        <span class="badge bg-{{ $studentGrade->letter_grade == 'A' ? 'success' : ($studentGrade->letter_grade == 'B' ? 'info' : ($studentGrade->letter_grade == 'C' ? 'warning' : ($studentGrade->letter_grade == 'D' ? 'secondary' : 'danger'))) }}">
                            {{ $studentGrade->letter_grade }}
                        </span>
                    @else
                        <span class="text-muted">-</span>
                    @endif
                </p>
                <p class="mb-3">
                    <strong>Status:</strong>
                    @if($studentGrade->is_passed)
                        <span class="badge bg-success">Lulus</span>
                    @else
                        <span class="badge bg-danger">Tidak Lulus</span>
                    @endif
                </p>
                <p class="mb-3">
                    <strong>Dibuat:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($studentGrade->created_at, true) }}
                </p>
                <p class="mb-0">
                    <strong>Diperbarui:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($studentGrade->updated_at, true) }}
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
