@extends('layouts.tenant')

@section('title', 'Tambah Data Guru')
@section('page-title', 'Tambah Data Guru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chalkboard-teacher me-3"></i>
                Tambah Data Guru
            </h2>
            <p>Lengkapi form di bawah ini untuk menambahkan guru baru ke sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('teachers.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-user-plus me-2 text-primary"></i>
                    Form Tambah Guru
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('teachers.store') }}" method="POST">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" name="name" value="{{ old('name') }}" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                                <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                       id="email" name="email" value="{{ old('email') }}" required>
                                <small class="form-text text-muted">Email akan digunakan untuk login akun guru</small>
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="gender" class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                <select class="form-control @error('gender') is-invalid @enderror" 
                                        id="gender" name="gender" required>
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="L" {{ old('gender') == 'L' ? 'selected' : '' }}>Laki-laki</option>
                                    <option value="P" {{ old('gender') == 'P' ? 'selected' : '' }}>Perempuan</option>
                                </select>
                                @error('gender')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="nik" class="form-label">NIK (Nomor Induk Kependudukan)</label>
                                <input type="text" class="form-control @error('nik') is-invalid @enderror" 
                                       id="nik" name="nik" value="{{ old('nik') }}" 
                                       maxlength="16" 
                                       placeholder="16 digit angka"
                                       pattern="[0-9]{16}">
                                <small class="form-text text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    NIK adalah patokan utama. Guru dengan NIK yang sama tidak bisa didaftarkan ulang, 
                                    tetapi bisa di-cabangkan ke sekolah lain.
                                </small>
                                @error('nik')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Catatan:</strong> Data minimal yang diperlukan untuk membuat akun guru. 
                        Password akan dibuat otomatis (8 karakter acak). Email kredensial akan dikirim ke email guru. 
                        Data lengkap dapat dilengkapi melalui menu "Lengkapi Data" setelah guru dibuat.
                    </div>
                    
                    <div class="d-flex gap-2 mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan Data
                        </button>
                        <a href="{{ tenant_route('teachers.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Kembali
                        </a>
                    </div>
                </form>
                </div>
            </div>
        </div>
    
        <div class="col-md-4">
            <div class="modern-card">
                <div class="modern-card-header">
                    <h5><i class="fas fa-info-circle me-2"></i>Informasi</h5>
                </div>
                <div class="card-body">
                    <div class="alert alert-info mb-0">
                        <h6><i class="fas fa-lightbulb me-2"></i>Petunjuk Pengisian</h6>
                        <ul class="mb-0 mt-2">
                            <li>Field yang bertanda <span class="text-danger">*</span> wajib diisi</li>
                            <li>Email harus unik dan akan digunakan untuk login</li>
                            <li>Password akan dibuat otomatis (8 karakter acak)</li>
                            <li>Data lengkap dapat dilengkapi setelah guru dibuat</li>
                            <li>Akun guru akan otomatis dibuat dengan role "teacher"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
