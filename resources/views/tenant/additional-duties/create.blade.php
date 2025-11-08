@extends('layouts.tenant')

@section('title', 'Tambah Tugas Tambahan')
@section('page-title', 'Tambah Tugas Tambahan')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-plus-circle me-3"></i>
                Tambah Tugas Tambahan
            </h2>
            <p>Buat tugas tambahan baru untuk mengatur akses modul guru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Form Tugas Tambahan
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.additional-duties.store') }}" method="POST">
                    @csrf
                    
                    <div class="mb-4">
                        <label for="code" class="form-label fw-semibold">Kode <span class="text-danger">*</span></label>
                        <input type="text" class="form-control @error('code') is-invalid @enderror" 
                               id="code" name="code" value="{{ old('code') }}" 
                               placeholder="contoh: kepala_sekolah, waka_kurikulum" required>
                        <small class="text-muted">Kode unik untuk tugas tambahan (huruf kecil, underscore)</small>
                        @error('code')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-4">
                        <label for="name" class="form-label fw-semibold">Nama Tugas <span class="text-danger">*</span></label>
                        <input type="text" class="form-control @error('name') is-invalid @enderror" 
                               id="name" name="name" value="{{ old('name') }}" 
                               placeholder="contoh: Kepala Sekolah, Waka Kurikulum" required>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-4">
                        <label for="description" class="form-label fw-semibold">Deskripsi</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="3" 
                                  placeholder="Masukkan deskripsi tugas tambahan">{{ old('description') }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-4">
                        <label for="order" class="form-label fw-semibold">Urutan</label>
                        <input type="number" class="form-control @error('order') is-invalid @enderror" 
                               id="order" name="order" value="{{ old('order', 0) }}" min="0">
                        <small class="text-muted">Urutan tampil di daftar (angka lebih kecil muncul lebih dulu)</small>
                        @error('order')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="d-flex gap-2 mt-4">
                        <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan dan Lanjutkan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item mb-3">
                    <div class="alert alert-info mb-0" style="border-radius: 12px; border: none;">
                        <i class="fas fa-lightbulb me-2"></i>
                        Setelah membuat tugas tambahan, Anda akan diarahkan ke halaman pengaturan untuk mengatur akses modul yang dapat diakses oleh tugas tambahan ini.
                    </div>
                </div>
                <div class="info-item mb-0">
                    <strong class="d-block mb-2">
                        <i class="fas fa-list-ul me-2 text-primary"></i>Contoh Tugas Tambahan:
                    </strong>
                    <ul class="list-unstyled mb-0">
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Kepala Sekolah/Madrasah</span>
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Waka Kurikulum</span>
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Guru BK</span>
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Waka Sarana Prasarana</span>
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Tata Usaha</span>
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            <span class="text-muted">Waka Kesiswaan</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
