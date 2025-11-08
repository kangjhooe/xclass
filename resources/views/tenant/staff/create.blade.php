@extends('layouts.tenant')

@section('title', 'Tambah Staff')
@section('page-title', 'Tambah Staff')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-plus me-2"></i>
                    Form Tambah Staff
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.staff.store') }}" method="POST">
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
                                <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
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
                                <label for="phone" class="form-label">Telepon</label>
                                <input type="text" class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" name="phone" value="{{ old('phone') }}">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="role" class="form-label">Role <span class="text-danger">*</span></label>
                                <select class="form-control @error('role') is-invalid @enderror" 
                                        id="role" name="role" required>
                                    <option value="">Pilih Role</option>
                                    <option value="school_admin" {{ old('role') == 'school_admin' ? 'selected' : '' }}>Admin Sekolah</option>
                                    <option value="teacher" {{ old('role') == 'teacher' ? 'selected' : '' }}>Guru</option>
                                    <option value="student" {{ old('role') == 'student' ? 'selected' : '' }}>Siswa</option>
                                    <option value="parent" {{ old('role') == 'parent' ? 'selected' : '' }}>Orang Tua</option>
                                </select>
                                @error('role')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="is_active" name="is_active" 
                                           value="1" {{ old('is_active', true) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_active">
                                        Staff aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan
                        </button>
                        <a href="{{ tenant_route('tenant.staff.index') }}" class="btn btn-secondary">
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
                    Informasi Role
                </h6>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <h6 class="text-danger">Admin Sekolah</h6>
                    <p class="text-muted small">Akses penuh ke semua fitur sistem, dapat mengelola staff, siswa, dan data akademik.</p>
                </div>
                <div class="mb-3">
                    <h6 class="text-success">Guru</h6>
                    <p class="text-muted small">Dapat mengelola jadwal, presensi, dan nilai siswa yang diampu.</p>
                </div>
                <div class="mb-3">
                    <h6 class="text-primary">Siswa</h6>
                    <p class="text-muted small">Dapat melihat jadwal, presensi, dan nilai pribadi.</p>
                </div>
                <div class="mb-3">
                    <h6 class="text-info">Orang Tua</h6>
                    <p class="text-muted small">Dapat melihat jadwal, presensi, dan nilai anak.</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
