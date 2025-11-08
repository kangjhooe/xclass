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
                    <h1 class="h3 mb-1">Tambah Materi</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <a href="{{ tenant_route('tenant.elearning.materials.index', $course) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Kembali
                </a>
            </div>
        </div>
    </div>

    <form action="{{ tenant_route('tenant.elearning.materials.store', $course) }}" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="form-card">
            <div class="form-card-header">
                <i class="fas fa-info-circle me-2"></i>Informasi Materi
            </div>
            <div class="card-body p-4">
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label class="form-label">Judul Materi <span class="text-danger">*</span></label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" required>
                        @error('title')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Tipe <span class="text-danger">*</span></label>
                        <select name="type" class="form-select @error('type') is-invalid @enderror" required>
                            <option value="text" {{ old('type') == 'text' ? 'selected' : '' }}>Teks</option>
                            <option value="pdf" {{ old('type') == 'pdf' ? 'selected' : '' }}>PDF</option>
                            <option value="powerpoint" {{ old('type') == 'powerpoint' ? 'selected' : '' }}>PowerPoint</option>
                            <option value="image" {{ old('type') == 'image' ? 'selected' : '' }}>Gambar</option>
                            <option value="link" {{ old('type') == 'link' ? 'selected' : '' }}>Link</option>
                            <option value="document" {{ old('type') == 'document' ? 'selected' : '' }}>Dokumen</option>
                        </select>
                        @error('type')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Bab</label>
                        <input type="text" name="chapter" class="form-control @error('chapter') is-invalid @enderror" value="{{ old('chapter') }}" placeholder="Contoh: Bab 1, Modul 1">
                        @error('chapter')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Urutan</label>
                        <input type="number" name="order" class="form-control @error('order') is-invalid @enderror" value="{{ old('order', 0) }}" min="0">
                        @error('order')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">URL Eksternal</label>
                        <input type="url" name="external_url" class="form-control @error('external_url') is-invalid @enderror" value="{{ old('external_url') }}" placeholder="https://...">
                        @error('external_url')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <small class="text-muted">Hanya untuk tipe Link</small>
                    </div>

                    <div class="col-md-12 mb-3">
                        <label class="form-label">Konten</label>
                        <textarea name="content" class="form-control @error('content') is-invalid @enderror" rows="8">{{ old('content') }}</textarea>
                        @error('content')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-12 mb-3">
                        <label class="form-label">File</label>
                        <input type="file" name="file" class="form-control @error('file') is-invalid @enderror">
                        @error('file')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <small class="text-muted">Maksimal 10MB</small>
                    </div>

                    <div class="col-md-6 mb-3">
                        <div class="form-check">
                            <input type="checkbox" name="allow_download" class="form-check-input" value="1" {{ old('allow_download', true) ? 'checked' : '' }}>
                            <label class="form-check-label">Izinkan Download</label>
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <div class="form-check">
                            <input type="checkbox" name="is_published" class="form-check-input" value="1" {{ old('is_published', true) ? 'checked' : '' }}>
                            <label class="form-check-label">Published</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="d-flex gap-2 justify-content-end">
                    <a href="{{ tenant_route('tenant.elearning.materials.index', $course) }}" class="btn btn-outline-secondary">
                        <i class="fas fa-times me-2"></i>Batal
                    </a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Simpan Materi
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

