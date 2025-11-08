@extends('layouts.admin')

@section('title', 'Edit Tenant - ' . $tenant->name)
@section('page-title', 'Edit Tenant')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Tenant: {{ $tenant->name }}
            </h2>
            <p>Ubah informasi tenant</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                    Form Edit Data Tenant
                </h5>
            </div>

            <form action="{{ route('admin.tenants.update', $tenant) }}" method="POST" class="form-modern">
                @csrf
                @method('PUT')
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="name">Nama Sekolah <span class="text-danger">*</span></label>
                                <input type="text" 
                                       class="form-control @error('name') is-invalid @enderror" 
                                       id="name" 
                                       name="name" 
                                       value="{{ old('name', $tenant->name) }}" 
                                       required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="email">Email <span class="text-danger">*</span></label>
                                <input type="email" 
                                       class="form-control @error('email') is-invalid @enderror" 
                                       id="email" 
                                       name="email" 
                                       value="{{ old('email', $tenant->email) }}" 
                                       required>
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="type_tenant">Jenis Sekolah</label>
                                <select class="form-control @error('type_tenant') is-invalid @enderror" 
                                        id="type_tenant" 
                                        name="type_tenant">
                                    <option value="Sekolah Umum" {{ old('type_tenant', $tenant->type_tenant) == 'Sekolah Umum' ? 'selected' : '' }}>Sekolah Umum</option>
                                    <option value="Madrasah" {{ old('type_tenant', $tenant->type_tenant) == 'Madrasah' ? 'selected' : '' }}>Madrasah</option>
                                </select>
                                @error('type_tenant')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="jenjang">Jenjang</label>
                                <select class="form-control @error('jenjang') is-invalid @enderror" 
                                        id="jenjang" 
                                        name="jenjang">
                                    <option value="SD" {{ old('jenjang', $tenant->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                                    <option value="MI" {{ old('jenjang', $tenant->jenjang) == 'MI' ? 'selected' : '' }}>MI</option>
                                    <option value="SMP" {{ old('jenjang', $tenant->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                    <option value="MTs" {{ old('jenjang', $tenant->jenjang) == 'MTs' ? 'selected' : '' }}>MTs</option>
                                    <option value="SMA" {{ old('jenjang', $tenant->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                    <option value="MA" {{ old('jenjang', $tenant->jenjang) == 'MA' ? 'selected' : '' }}>MA</option>
                                    <option value="SMK" {{ old('jenjang', $tenant->jenjang) == 'SMK' ? 'selected' : '' }}>SMK</option>
                                    <option value="Lainnya" {{ old('jenjang', $tenant->jenjang) == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('jenjang')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="phone">Telepon</label>
                                <input type="text" 
                                       class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" 
                                       name="phone" 
                                       value="{{ old('phone', $tenant->phone) }}">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="website">Website</label>
                                <input type="url" 
                                       class="form-control @error('website') is-invalid @enderror" 
                                       id="website" 
                                       name="website" 
                                       value="{{ old('website', $tenant->website) }}">
                                @error('website')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="address">Alamat</label>
                        <textarea class="form-control @error('address') is-invalid @enderror" 
                                  id="address" 
                                  name="address" 
                                  rows="3">{{ old('address', $tenant->address) }}</textarea>
                        @error('address')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="city">Kota</label>
                                <input type="text" 
                                       class="form-control @error('city') is-invalid @enderror" 
                                       id="city" 
                                       name="city" 
                                       value="{{ old('city', $tenant->city) }}">
                                @error('city')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="province">Provinsi</label>
                                <input type="text" 
                                       class="form-control @error('province') is-invalid @enderror" 
                                       id="province" 
                                       name="province" 
                                       value="{{ old('province', $tenant->province) }}">
                                @error('province')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="postal_code">Kode Pos</label>
                                <input type="text" 
                                       class="form-control @error('postal_code') is-invalid @enderror" 
                                       id="postal_code" 
                                       name="postal_code" 
                                       value="{{ old('postal_code', $tenant->postal_code) }}">
                                @error('postal_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="subscription_plan">Paket Langganan <span class="text-danger">*</span></label>
                                <select class="form-control @error('subscription_plan') is-invalid @enderror" 
                                        id="subscription_plan" 
                                        name="subscription_plan" 
                                        required>
                                    <option value="basic" {{ old('subscription_plan', $tenant->subscription_plan) == 'basic' ? 'selected' : '' }}>Basic</option>
                                    <option value="premium" {{ old('subscription_plan', $tenant->subscription_plan) == 'premium' ? 'selected' : '' }}>Premium</option>
                                    <option value="enterprise" {{ old('subscription_plan', $tenant->subscription_plan) == 'enterprise' ? 'selected' : '' }}>Enterprise</option>
                                </select>
                                @error('subscription_plan')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="subscription_expires_at">Tanggal Berakhir Subscription</label>
                                <input type="date" 
                                       class="form-control @error('subscription_expires_at') is-invalid @enderror" 
                                       id="subscription_expires_at" 
                                       name="subscription_expires_at" 
                                       value="{{ old('subscription_expires_at', $tenant->subscription_expires_at ? $tenant->subscription_expires_at->format('Y-m-d') : '') }}">
                                @error('subscription_expires_at')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-white border-top">
                    <div class="d-flex justify-content-between">
                        <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-times me-2"></i>
                            Batal
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Perbarui Tenant
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="info-sidebar">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-building me-2 text-primary"></i>
                        Informasi Tenant
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        @if($tenant->logo)
                            <img src="{{ Storage::url($tenant->logo) }}" alt="{{ $tenant->name }}" class="img-fluid rounded" style="max-height: 100px;">
                        @else
                            <div class="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                <i class="fas fa-building fa-2x text-white"></i>
                            </div>
                        @endif
                        <h6 class="mt-2 mb-0">{{ $tenant->name }}</h6>
                        <small class="text-muted">{{ $tenant->npsn }}</small>
                    </div>
                    
                    <hr>
                    
                    <div class="mb-2">
                        <strong>Status:</strong>
                        <span class="badge-modern {{ $tenant->is_active ? 'bg-success' : 'bg-danger' }}" style="color: white; float: right;">
                            {{ $tenant->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </div>
                    
                    <div class="mb-2">
                        <strong>Subscription:</strong>
                        <span class="badge-modern bg-primary" style="color: white; float: right;">
                            {{ ucfirst($tenant->subscription_plan ?? 'Tidak ada') }}
                        </span>
                    </div>
                    
                    <div class="mb-2">
                        <strong>Dibuat:</strong>
                        <span class="float-right text-muted">
                            {{ \App\Helpers\DateHelper::formatIndonesian($tenant->created_at) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection