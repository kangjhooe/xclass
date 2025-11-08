@extends('layouts.admin-simple')

@push('styles')
<style>
    .form-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .form-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border-radius: 16px 16px 0 0;
        font-weight: 600;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1 class="h3 mb-1">Buat Tugas</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <a href="{{ tenant_route('tenant.elearning.assignments.index', $course) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Kembali
                </a>
            </div>
        </div>
    </div>

    <form action="{{ tenant_route('tenant.elearning.assignments.store', $course) }}" method="POST">
        @csrf
        <div class="row">
            <div class="col-md-8">
                <div class="form-card">
                    <div class="form-card-header">
                        <i class="fas fa-info-circle me-2"></i>Informasi Tugas
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Judul Tugas <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" required>
                            @error('title')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" class="form-control @error('description') is-invalid @enderror" rows="4">{{ old('description') }}</textarea>
                            @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Instruksi</label>
                            <textarea name="instructions" class="form-control @error('instructions') is-invalid @enderror" rows="4">{{ old('instructions') }}</textarea>
                            @error('instructions')
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
                            <label class="form-label">Max Score <span class="text-danger">*</span></label>
                            <input type="number" name="max_score" class="form-control @error('max_score') is-invalid @enderror" value="{{ old('max_score', 100) }}" min="0" max="100" step="0.01" required>
                            @error('max_score')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Bobot <span class="text-danger">*</span></label>
                            <input type="number" name="weight" class="form-control @error('weight') is-invalid @enderror" value="{{ old('weight', 1) }}" min="0" max="1" step="0.01" required>
                            @error('weight')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <small class="text-muted">Contoh: 0.25 = 25%</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Deadline</label>
                            <input type="datetime-local" name="due_date" class="form-control @error('due_date') is-invalid @enderror" value="{{ old('due_date') }}">
                            @error('due_date')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Max Attempts <span class="text-danger">*</span></label>
                            <input type="number" name="max_attempts" class="form-control @error('max_attempts') is-invalid @enderror" value="{{ old('max_attempts', 1) }}" min="1" max="10" required>
                            @error('max_attempts')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Max File Size (MB)</label>
                            <input type="number" name="max_file_size_mb" class="form-control @error('max_file_size_mb') is-invalid @enderror" value="{{ old('max_file_size_mb', 10) }}" min="1" max="100">
                            @error('max_file_size_mb')
                            <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="allow_late_submission" class="form-check-input" value="1" {{ old('allow_late_submission') ? 'checked' : '' }}>
                                <label class="form-check-label">Izinkan Pengiriman Terlambat</label>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" name="send_to_gradebook" class="form-check-input" value="1" {{ old('send_to_gradebook', true) ? 'checked' : '' }}>
                                <label class="form-check-label">Kirim ke Gradebook</label>
                                <small class="d-block text-muted">Nilai akan otomatis masuk ke modul penilaian</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="d-flex gap-2 justify-content-end">
                    <a href="{{ tenant_route('tenant.elearning.assignments.index', $course) }}" class="btn btn-outline-secondary">
                        <i class="fas fa-times me-2"></i>Batal
                    </a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Simpan Tugas
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

