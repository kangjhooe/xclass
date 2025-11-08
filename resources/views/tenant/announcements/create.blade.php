@extends('layouts.tenant')

@section('title', 'Tambah Pengumuman')
@section('page-title', 'Tambah Pengumuman')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-plus-circle me-3"></i>
                Tambah Pengumuman
            </h2>
            <p>Buat pengumuman baru untuk sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.announcements.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Pengumuman
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.announcements.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label class="form-label fw-semibold">Judul <span class="text-danger">*</span></label>
                <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" required placeholder="Masukkan judul pengumuman">
                @error('title')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <label class="form-label fw-semibold">Isi Pengumuman <span class="text-danger">*</span></label>
                <textarea name="content" class="form-control @error('content') is-invalid @enderror" rows="10" required placeholder="Masukkan isi pengumuman">{{ old('content') }}</textarea>
                @error('content')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Prioritas <span class="text-danger">*</span></label>
                    <select name="priority" class="form-select @error('priority') is-invalid @enderror" required>
                        <option value="low" {{ old('priority') == 'low' ? 'selected' : '' }}>Rendah</option>
                        <option value="medium" {{ old('priority') == 'medium' ? 'selected' : '' }}>Sedang</option>
                        <option value="high" {{ old('priority') == 'high' ? 'selected' : '' }}>Tinggi</option>
                        <option value="urgent" {{ old('priority') == 'urgent' ? 'selected' : '' }}>Urgent</option>
                    </select>
                    @error('priority')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                    <select name="status" class="form-select @error('status') is-invalid @enderror" required>
                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status') == 'archived' ? 'selected' : '' }}>Arsip</option>
                    </select>
                    @error('status')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label fw-semibold">Target Audience <span class="text-danger">*</span></label>
                <div class="row">
                    <div class="col-md-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="target_audience[]" value="all" id="target_all" {{ in_array('all', old('target_audience', [])) ? 'checked' : '' }}>
                            <label class="form-check-label" for="target_all">Semua</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="target_audience[]" value="teachers" id="target_teachers" {{ in_array('teachers', old('target_audience', [])) ? 'checked' : '' }}>
                            <label class="form-check-label" for="target_teachers">Guru</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="target_audience[]" value="students" id="target_students" {{ in_array('students', old('target_audience', [])) ? 'checked' : '' }}>
                            <label class="form-check-label" for="target_students">Siswa</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="target_audience[]" value="parents" id="target_parents" {{ in_array('parents', old('target_audience', [])) ? 'checked' : '' }}>
                            <label class="form-check-label" for="target_parents">Orang Tua</label>
                        </div>
                    </div>
                </div>
                @error('target_audience')
                    <div class="text-danger mt-2">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <label class="form-label fw-semibold">Tanggal Publikasi</label>
                <input type="datetime-local" name="publish_at" class="form-control @error('publish_at') is-invalid @enderror" value="{{ old('publish_at') }}">
                <small class="text-muted">Kosongkan untuk langsung publish</small>
                @error('publish_at')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-save me-2"></i>Simpan
                </button>
                <a href="{{ tenant_route('tenant.announcements.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
