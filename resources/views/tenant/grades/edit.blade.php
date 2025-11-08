@extends('layouts.tenant')

@section('title', 'Edit Nilai')
@section('page-title', 'Edit Nilai')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Nilai
            </h2>
            <p>Edit nilai siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Edit Nilai
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.grades.update', ['grade' => $grade->id]) }}" method="POST">
            @csrf
            @method('PUT')
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="student_id" class="form-label fw-semibold">Siswa <span class="text-danger">*</span></label>
                    <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                        <option value="">Pilih Siswa</option>
                        @foreach($students as $student)
                            <option value="{{ $student->id }}" {{ old('student_id', $grade->student_id) == $student->id ? 'selected' : '' }}>
                                {{ $student->name }} ({{ $student->nis ?? '-' }})
                            </option>
                        @endforeach
                    </select>
                    @error('student_id')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label for="subject_id" class="form-label fw-semibold">Mata Pelajaran <span class="text-danger">*</span></label>
                    <select name="subject_id" id="subject_id" class="form-select @error('subject_id') is-invalid @enderror" required>
                        <option value="">Pilih Mata Pelajaran</option>
                        @foreach($subjects as $subject)
                            <option value="{{ $subject->id }}" {{ old('subject_id', $grade->subject_id) == $subject->id ? 'selected' : '' }}>
                                {{ $subject->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('subject_id')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="teacher_id" class="form-label fw-semibold">Guru <span class="text-danger">*</span></label>
                    <select name="teacher_id" id="teacher_id" class="form-select @error('teacher_id') is-invalid @enderror" required>
                        <option value="">Pilih Guru</option>
                        @foreach($teachers as $teacher)
                            <option value="{{ $teacher->id }}" {{ old('teacher_id', $grade->teacher_id) == $teacher->id ? 'selected' : '' }}>
                                {{ $teacher->name }}
                            </option>
                        @endforeach
                    </select>
                    @error('teacher_id')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label for="assignment_type" class="form-label fw-semibold">Jenis Tugas <span class="text-danger">*</span></label>
                    <input type="text" name="assignment_type" id="assignment_type" class="form-control @error('assignment_type') is-invalid @enderror" 
                           value="{{ old('assignment_type', $grade->assignment_type) }}" placeholder="Contoh: UTS, UAS, Tugas, dll" required>
                    @error('assignment_type')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-4">
                    <label for="score" class="form-label fw-semibold">Nilai <span class="text-danger">*</span></label>
                    <input type="number" name="score" id="score" class="form-control @error('score') is-invalid @enderror" 
                           value="{{ old('score', $grade->score) }}" min="0" max="100" step="0.01" required>
                    @error('score')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label for="max_score" class="form-label fw-semibold">Nilai Maksimal <span class="text-danger">*</span></label>
                    <input type="number" name="max_score" id="max_score" class="form-control @error('max_score') is-invalid @enderror" 
                           value="{{ old('max_score', $grade->max_score ?? 100) }}" min="1" required>
                    @error('max_score')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-4">
                    <label for="semester" class="form-label fw-semibold">Semester <span class="text-danger">*</span></label>
                    <select name="semester" id="semester" class="form-select @error('semester') is-invalid @enderror" required>
                        <option value="">Pilih Semester</option>
                        <option value="Ganjil" {{ old('semester', $grade->semester) == 'Ganjil' ? 'selected' : '' }}>Ganjil</option>
                        <option value="Genap" {{ old('semester', $grade->semester) == 'Genap' ? 'selected' : '' }}>Genap</option>
                    </select>
                    @error('semester')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="academic_year" class="form-label fw-semibold">Tahun Pelajaran <span class="text-danger">*</span></label>
                    <input type="text" name="academic_year" id="academic_year" class="form-control @error('academic_year') is-invalid @enderror" 
                           value="{{ old('academic_year', $grade->academic_year) }}" placeholder="Contoh: 2024/2025" required>
                    @error('academic_year')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label for="notes" class="form-label fw-semibold">Keterangan</label>
                    <input type="text" name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" 
                           value="{{ old('notes', $grade->notes) }}">
                    @error('notes')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-save me-2"></i>Simpan
                </button>
                <a href="{{ tenant_route('tenant.grades.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
