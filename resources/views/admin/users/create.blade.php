@extends('layouts.admin')

@section('title', 'Create Admin User')
@section('page-title', 'Create Admin User')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-plus me-3"></i>
                Tambah Admin User Baru
            </h2>
            <p>Buat admin user baru untuk sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.users.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-file-alt me-2 text-primary"></i>
                    Form Data Admin User
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.users.store') }}" class="form-modern">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" name="name" value="{{ old('name') }}" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="email" class="form-label">Alamat Email <span class="text-danger">*</span></label>
                                <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                       id="email" name="email" value="{{ old('email') }}" required>
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="phone" class="form-label">Nomor Telepon</label>
                                <input type="text" class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" name="phone" value="{{ old('phone') }}">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="role" class="form-label">Role <span class="text-danger">*</span></label>
                                <select class="form-select @error('role') is-invalid @enderror" 
                                        id="role" name="role" required>
                                    <option value="">Pilih Role</option>
                                    <option value="super_admin" {{ old('role') === 'super_admin' ? 'selected' : '' }}>
                                        Super Admin
                                    </option>
                                    <option value="school_admin" {{ old('role') === 'school_admin' ? 'selected' : '' }}>
                                        School Admin
                                    </option>
                                </select>
                                @error('role')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                                <label for="instansi_id" class="form-label">Tetapkan ke Tenant</label>
                        <select class="form-select @error('instansi_id') is-invalid @enderror" 
                                id="instansi_id" name="instansi_id">
                            <option value="">Tidak Ada Tenant (Akses Global)</option>
                            @foreach($tenants as $tenant)
                                <option value="{{ $tenant->id }}" {{ old('instansi_id') == $tenant->id ? 'selected' : '' }}>
                                    {{ $tenant->name }} ({{ $tenant->npsn }})
                                </option>
                            @endforeach
                        </select>
                        @error('instansi_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">
                            <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Leave empty for global access, or assign to specific tenant for school admin.
                            </small>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                                <input type="password" class="form-control @error('password') is-invalid @enderror" 
                                       id="password" name="password" required>
                                @error('password')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="password_confirmation" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                <input type="password" class="form-control" 
                                       id="password_confirmation" name="password_confirmation" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{{ route('admin.users.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="info-sidebar">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-info-circle me-2 text-primary"></i>
                        Informasi Role
                    </h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <h6 class="text-danger">
                            <i class="fas fa-user-shield me-2"></i>
                            Super Admin
                        </h6>
                        <ul class="list-unstyled small text-muted mb-0 ps-3">
                            <li>• Akses penuh sistem</li>
                            <li>• Kelola semua tenants</li>
                            <li>• Kelola semua users</li>
                            <li>• Konfigurasi sistem</li>
                            <li>• Backup & recovery</li>
                        </ul>
                    </div>
                    
                    <div class="mb-3">
                        <h6 class="text-info">
                            <i class="fas fa-user-tie me-2"></i>
                            School Admin
                        </h6>
                        <ul class="list-unstyled small text-muted mb-0 ps-3">
                            <li>• Kelola tenant yang ditugaskan</li>
                            <li>• Akses data tenant spesifik</li>
                            <li>• Terbatas pada operasi sekolah</li>
                            <li>• Tidak bisa akses pengaturan global</li>
                        </ul>
                    </div>
                    
                    <div class="alert alert-warning mb-0">
                        <small>
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            <strong>Catatan:</strong> School Admin harus ditugaskan ke tenant spesifik untuk berfungsi dengan baik.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection