@extends('layouts.tenant')

@section('title', 'Tambah Nilai')
@section('page-title', 'Tambah Nilai')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-plus me-2"></i>
                    Form Tambah Nilai
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.grades.store') }}" method="POST">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                <select class="form-control @error('student_id') is-invalid @enderror" 
                                        id="student_id" name="student_id" required>
                                    <option value="">Pilih Siswa</option>
                                    @foreach($students as $student)
                                        <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} ({{ $student->nis }})
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
                                <select class="form-control @error('subject_id') is-invalid @enderror" 
                                        id="subject_id" name="subject_id" required>
                                    <option value="">Pilih Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }} ({{ $subject->code }})
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
                                <select class="form-control @error('teacher_id') is-invalid @enderror" 
                                        id="teacher_id" name="teacher_id" required>
                                    <option value="">Pilih Guru</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('teacher_id') == $teacher->id ? 'selected' : '' }}>
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
                                <label for="assignment_type" class="form-label">Tipe Penilaian <span class="text-danger">*</span></label>
                                <select class="form-control @error('assignment_type') is-invalid @enderror" 
                                        id="assignment_type" name="assignment_type" required>
                                    <option value="">Pilih Tipe Penilaian</option>
                                    <option value="UTS" {{ old('assignment_type') == 'UTS' ? 'selected' : '' }}>UTS</option>
                                    <option value="UAS" {{ old('assignment_type') == 'UAS' ? 'selected' : '' }}>UAS</option>
                                    <option value="Tugas" {{ old('assignment_type') == 'Tugas' ? 'selected' : '' }}>Tugas</option>
                                    <option value="Quiz" {{ old('assignment_type') == 'Quiz' ? 'selected' : '' }}>Quiz</option>
                                    <option value="Praktikum" {{ old('assignment_type') == 'Praktikum' ? 'selected' : '' }}>Praktikum</option>
                                    <option value="Proyek" {{ old('assignment_type') == 'Proyek' ? 'selected' : '' }}>Proyek</option>
                                </select>
                                @error('assignment_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="assignment_name" class="form-label">Nama Penilaian <span class="text-danger">*</span></label>
                        <input type="text" class="form-control @error('assignment_name') is-invalid @enderror" 
                               id="assignment_name" name="assignment_name" value="{{ old('assignment_name') }}" required>
                        @error('assignment_name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="score" class="form-label">Nilai <span class="text-danger">*</span></label>
                                <input type="number" class="form-control @error('score') is-invalid @enderror" 
                                       id="score" name="score" value="{{ old('score') }}" 
                                       min="0" max="100" step="0.01" required>
                                @error('score')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="max_score" class="form-label">Nilai Maksimal <span class="text-danger">*</span></label>
                                <input type="number" class="form-control @error('max_score') is-invalid @enderror" 
                                       id="max_score" name="max_score" value="{{ old('max_score', 100) }}" 
                                       min="1" max="100" step="0.01" required>
                                @error('max_score')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="academic_year" class="form-label">Tahun Ajaran</label>
                                <input type="text" class="form-control @error('academic_year') is-invalid @enderror" 
                                       id="academic_year" name="academic_year" value="{{ old('academic_year', '2024/2025') }}">
                                @error('academic_year')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="semester" class="form-label">Semester</label>
                                <select class="form-control @error('semester') is-invalid @enderror" 
                                        id="semester" name="semester">
                                    <option value="1" {{ old('semester', 1) == 1 ? 'selected' : '' }}>Semester 1</option>
                                    <option value="2" {{ old('semester') == 2 ? 'selected' : '' }}>Semester 2</option>
                                </select>
                                @error('semester')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="notes" class="form-label">Catatan</label>
                        <textarea class="form-control @error('notes') is-invalid @enderror" 
                                  id="notes" name="notes" rows="3">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan
                        </button>
                        <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi
                </h6>
            </div>
            <div class="card-body">
                <p class="text-muted">
                    <strong>Nilai:</strong> Masukkan nilai yang diperoleh siswa (0-100).
                </p>
                <p class="text-muted">
                    <strong>Nilai Maksimal:</strong> Nilai maksimal yang bisa diperoleh (default: 100).
                </p>
                <p class="text-muted">
                    <strong>Persentase:</strong> Akan dihitung otomatis berdasarkan nilai dan nilai maksimal.
                </p>
                <p class="text-muted">
                    <strong>Grade Letter:</strong> Akan dihitung otomatis berdasarkan persentase:
                    <br>• A: 91-100%
                    <br>• B+: 86-90%
                    <br>• B: 81-85%
                    <br>• C+: 76-80%
                    <br>• C: 71-75%
                    <br>• D: 66-70%
                    <br>• E: 0-65%
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
