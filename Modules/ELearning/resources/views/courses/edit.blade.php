@extends('layouts.admin-simple')

@push('styles')
<style>
    .form-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
    }
    
    .form-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border-radius: 16px 16px 0 0;
        font-weight: 600;
    }
    
    .form-label {
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1 class="h3 mb-1">Edit Kursus</h1>
                    <p class="text-muted mb-0">Edit informasi kursus: {{ $course->title }}</p>
                </div>
                <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Kembali
                </a>
            </div>
        </div>
    </div>

    <form action="{{ tenant_route('tenant.elearning.courses.update', $course) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        <div class="row">
            <div class="col-md-8">
                <div class="form-card">
                    <div class="form-card-header">
                        <i class="fas fa-info-circle me-2"></i>Informasi Kursus
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Judul Kursus <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $course->title) }}" required>
                            @error('title')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Mata Pelajaran</label>
                            <select name="subject_id" class="form-select @error('subject_id') is-invalid @enderror">
                                <option value="">Pilih Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                <option value="{{ $subject->id }}" {{ old('subject_id', $course->subject_id) == $subject->id ? 'selected' : '' }}>
                                    {{ $subject->name }}
                                </option>
                                @endforeach
                            </select>
                            @error('subject_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Guru <span class="text-danger">*</span></label>
                            <select name="teacher_id" class="form-select @error('teacher_id') is-invalid @enderror" required>
                                <option value="">Pilih Guru</option>
                                @foreach($teachers as $teacher)
                                <option value="{{ $teacher->id }}" {{ old('teacher_id', $course->teacher_id) == $teacher->id ? 'selected' : '' }}>
                                    {{ $teacher->name }}
                                </option>
                                @endforeach
                            </select>
                            @error('teacher_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" class="form-control @error('description') is-invalid @enderror" rows="5">{{ old('description', $course->description) }}</textarea>
                            @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Silabus</label>
                            <textarea name="syllabus" class="form-control @error('syllabus') is-invalid @enderror" rows="5">{{ old('syllabus', $course->syllabus) }}</textarea>
                            @error('syllabus')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="form-card">
                    <div class="form-card-header">
                        <i class="fas fa-cog me-2"></i>Pengaturan
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Thumbnail</label>
                            @if($course->thumbnail)
                            <div class="mb-2">
                                <img src="{{ Storage::url($course->thumbnail) }}" alt="Current thumbnail" class="img-thumbnail" style="max-width: 100%; height: auto;">
                            </div>
                            @endif
                            <input type="file" name="thumbnail" class="form-control @error('thumbnail') is-invalid @enderror" accept="image/*">
                            @error('thumbnail')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Level <span class="text-danger">*</span></label>
                            <select name="level" class="form-select @error('level') is-invalid @enderror" required>
                                <option value="pemula" {{ old('level', $course->level) == 'pemula' ? 'selected' : '' }}>Pemula</option>
                                <option value="menengah" {{ old('level', $course->level) == 'menengah' ? 'selected' : '' }}>Menengah</option>
                                <option value="lanjutan" {{ old('level', $course->level) == 'lanjutan' ? 'selected' : '' }}>Lanjutan</option>
                            </select>
                            @error('level')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Kategori</label>
                            <input type="text" name="category" class="form-control @error('category') is-invalid @enderror" value="{{ old('category', $course->category) }}">
                            @error('category')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Durasi (Jam)</label>
                            <input type="number" name="duration_hours" class="form-control @error('duration_hours') is-invalid @enderror" value="{{ old('duration_hours', $course->duration_hours) }}" min="0">
                            @error('duration_hours')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Maksimal Siswa</label>
                            <input type="number" name="max_students" class="form-control @error('max_students') is-invalid @enderror" value="{{ old('max_students', $course->max_students) }}" min="1">
                            @error('max_students')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Status <span class="text-danger">*</span></label>
                            <select name="status" class="form-select @error('status') is-invalid @enderror" required>
                                <option value="draft" {{ old('status', $course->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                                <option value="published" {{ old('status', $course->status) == 'published' ? 'selected' : '' }}>Published</option>
                                <option value="archived" {{ old('status', $course->status) == 'archived' ? 'selected' : '' }}>Archived</option>
                            </select>
                            @error('status')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="d-flex gap-2 justify-content-end">
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary">
                        <i class="fas fa-times me-2"></i>Batal
                    </a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

