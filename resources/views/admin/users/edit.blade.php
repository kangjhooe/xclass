@extends('layouts.admin')

@section('title', 'Edit Admin User')
@section('page-title', 'Edit Admin User')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-edit me-3"></i>
                Edit Admin User: {{ $user->name }}
            </h2>
            <p>Ubah informasi admin user</p>
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
                    Form Edit Data Admin User
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.users.update', $user) }}" class="form-modern">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" name="name" value="{{ old('name', $user->name) }}" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="email" class="form-label">Alamat Email <span class="text-danger">*</span></label>
                                <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                       id="email" name="email" value="{{ old('email', $user->email) }}" required>
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
                                       id="phone" name="phone" value="{{ old('phone', $user->phone) }}">
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
                                    <option value="super_admin" {{ old('role', $user->role) === 'super_admin' ? 'selected' : '' }}>
                                        Super Admin
                                    </option>
                                    <option value="school_admin" {{ old('role', $user->role) === 'school_admin' ? 'selected' : '' }}>
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
                                <option value="{{ $tenant->id }}" {{ old('instansi_id', $user->instansi_id) == $tenant->id ? 'selected' : '' }}>
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
                                <label for="password" class="form-label">New Password</label>
                                <input type="password" class="form-control @error('password') is-invalid @enderror" 
                                       id="password" name="password">
                                @error('password')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                                <div class="form-text">
                                    <small class="text-muted">Leave empty to keep current password</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="password_confirmation" class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" 
                                       id="password_confirmation" name="password_confirmation">
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
                            Update User
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
                        <i class="fas fa-user me-2 text-primary"></i>
                        Informasi User
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                            <i class="fas fa-user fa-2x text-white"></i>
                        </div>
                        <h6 class="mt-2 mb-0">{{ $user->name }}</h6>
                        <small class="text-muted">{{ $user->email }}</small>
                    </div>
                    
                    <hr>
                    
                    <div class="mb-2">
                        <strong>Status:</strong>
                        <span class="badge-modern {{ $user->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white; float: right;">
                            {{ $user->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </div>
                    
                    <div class="mb-2">
                        <strong>Role:</strong>
                        <span class="badge-modern {{ $user->role === 'super_admin' ? 'bg-danger' : 'bg-info' }}" style="color: white; float: right;">
                            {{ ucfirst(str_replace('_', ' ', $user->role)) }}
                        </span>
                    </div>
                    
                    @if($user->tenant)
                        <div class="mb-2">
                            <strong>Tenant:</strong>
                            <span class="float-right text-muted">{{ $user->tenant->name }}</span>
                        </div>
                    @endif
                    
                    <div class="mb-2">
                        <strong>Last Login:</strong>
                        <span class="float-right text-muted">
                            {{ $user->last_login_at ? \App\Helpers\DateHelper::formatIndonesian($user->last_login_at) : 'Belum pernah' }}
                        </span>
                    </div>
                    
                    <div class="mb-2">
                        <strong>Dibuat:</strong>
                        <span class="float-right text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($user->created_at) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection