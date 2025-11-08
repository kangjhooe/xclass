@extends('layouts.tenant')

@section('title', 'Tambah User')
@section('page-title', 'Tambah User')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-plus me-3"></i>
                Tambah User Baru
            </h2>
            <p>Buat user baru untuk sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.users.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form User
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.users.store') }}" method="POST">
            @csrf

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="name" class="form-label fw-semibold">Nama Lengkap <span class="text-danger">*</span></label>
                    <input type="text" 
                           class="form-control @error('name') is-invalid @enderror" 
                           id="name" 
                           name="name" 
                           value="{{ old('name') }}" 
                           required
                           placeholder="Masukkan nama lengkap">
                    @error('name')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="col-md-6">
                    <label for="email" class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
                    <input type="email" 
                           class="form-control @error('email') is-invalid @enderror" 
                           id="email" 
                           name="email" 
                           value="{{ old('email') }}" 
                           required
                           placeholder="Masukkan email">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="password" class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                    <input type="password" 
                           class="form-control @error('password') is-invalid @enderror" 
                           id="password" 
                           name="password" 
                           required
                           placeholder="Masukkan password">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="col-md-6">
                    <label for="password_confirmation" class="form-label fw-semibold">Konfirmasi Password <span class="text-danger">*</span></label>
                    <input type="password" 
                           class="form-control" 
                           id="password_confirmation" 
                           name="password_confirmation" 
                           required
                           placeholder="Konfirmasi password">
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="role" class="form-label fw-semibold">Role <span class="text-danger">*</span></label>
                    <select class="form-select @error('role') is-invalid @enderror" 
                            id="role" 
                            name="role" 
                            required>
                        <option value="">Pilih Role</option>
                        @foreach($roles as $value => $label)
                            <option value="{{ $value }}" {{ old('role') === $value ? 'selected' : '' }}>
                                {{ $label }}
                            </option>
                        @endforeach
                    </select>
                    @error('role')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-semibold">&nbsp;</label>
                    <div class="form-check mt-2">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="is_active" 
                               name="is_active" 
                               value="1" 
                               {{ old('is_active') ? 'checked' : '' }}>
                        <label class="form-check-label" for="is_active">
                            User Aktif
                        </label>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label fw-semibold">Izin Khusus (Opsional)</label>
                <div class="row">
                    @php
                        $permissions = [
                            'data_pokok:read' => 'Baca Data Pokok',
                            'data_pokok:create' => 'Buat Data Pokok',
                            'data_pokok:update' => 'Update Data Pokok',
                            'data_pokok:delete' => 'Hapus Data Pokok',
                            'data_pokok:export' => 'Export Data Pokok',
                            'data_pokok:import' => 'Import Data Pokok',
                            'data_pokok:mutasi' => 'Kelola Mutasi Siswa',
                            'data_pokok:assignments' => 'Kelola Penugasan Lintas Tenant',
                            'data_pokok:logs' => 'Lihat Log Aktivitas'
                        ];
                    @endphp

                    @foreach($permissions as $permission => $label)
                    <div class="col-md-4 mb-2">
                        <div class="form-check">
                            <input type="checkbox" 
                                   class="form-check-input" 
                                   id="permission_{{ $loop->index }}" 
                                   name="permissions[]" 
                                   value="{{ $permission }}"
                                   {{ in_array($permission, old('permissions', [])) ? 'checked' : '' }}>
                            <label class="form-check-label" for="permission_{{ $loop->index }}">
                                {{ $label }}
                            </label>
                        </div>
                    </div>
                    @endforeach
                </div>
                <small class="text-muted">
                    Izin khusus akan ditambahkan ke izin default berdasarkan role
                </small>
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-save me-2"></i> Simpan
                </button>
                <a href="{{ tenant_route('tenant.users.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i> Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
