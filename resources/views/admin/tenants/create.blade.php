@extends('layouts.admin')

@section('title', 'Create New Tenant')
@section('page-title', 'Create Tenant')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-plus me-3"></i>
                Tambah Tenant Baru
            </h2>
            <p>Buat tenant baru untuk sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenants.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                    Form Data Tenant
                </h5>
            </div>

            <form action="{{ route('admin.tenants.store') }}" method="POST" class="form-modern">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="npsn">NPSN <span class="text-danger">*</span></label>
                                <input type="text" 
                                       class="form-control @error('npsn') is-invalid @enderror" 
                                       id="npsn" 
                                       name="npsn" 
                                       value="{{ old('npsn') }}" 
                                       placeholder="8 digit angka"
                                       maxlength="8"
                                       pattern="[0-9]{8}"
                                       required>
                                @error('npsn')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                                <small class="form-text text-muted">NPSN harus terdiri dari 8 digit angka</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="name">Nama Sekolah <span class="text-danger">*</span></label>
                                <input type="text" 
                                       class="form-control @error('name') is-invalid @enderror" 
                                       id="name" 
                                       name="name" 
                                       value="{{ old('name') }}" 
                                       required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="email">Email <span class="text-danger">*</span></label>
                                <input type="email" 
                                       class="form-control @error('email') is-invalid @enderror" 
                                       id="email" 
                                       name="email" 
                                       value="{{ old('email') }}" 
                                       required>
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="phone">Telepon</label>
                                <input type="text" 
                                       class="form-control @error('phone') is-invalid @enderror" 
                                       id="phone" 
                                       name="phone" 
                                       value="{{ old('phone') }}">
                                @error('phone')
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
                                    <option value="Sekolah Umum" {{ old('type_tenant') == 'Sekolah Umum' ? 'selected' : '' }}>Sekolah Umum</option>
                                    <option value="Madrasah" {{ old('type_tenant') == 'Madrasah' ? 'selected' : '' }}>Madrasah</option>
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
                                    <option value="">Pilih Jenjang</option>
                                    <option value="SD" {{ old('jenjang') == 'SD' ? 'selected' : '' }}>SD</option>
                                    <option value="MI" {{ old('jenjang') == 'MI' ? 'selected' : '' }}>MI</option>
                                    <option value="SMP" {{ old('jenjang') == 'SMP' ? 'selected' : '' }}>SMP</option>
                                    <option value="MTs" {{ old('jenjang') == 'MTs' ? 'selected' : '' }}>MTs</option>
                                    <option value="SMA" {{ old('jenjang') == 'SMA' ? 'selected' : '' }}>SMA</option>
                                    <option value="MA" {{ old('jenjang') == 'MA' ? 'selected' : '' }}>MA</option>
                                    <option value="SMK" {{ old('jenjang') == 'SMK' ? 'selected' : '' }}>SMK</option>
                                    <option value="Lainnya" {{ old('jenjang') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('jenjang')
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
                                  rows="3">{{ old('address') }}</textarea>
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
                                       value="{{ old('city') }}">
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
                                       value="{{ old('province') }}">
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
                                       value="{{ old('postal_code') }}">
                                @error('postal_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="website">Website</label>
                                <input type="url" 
                                       class="form-control @error('website') is-invalid @enderror" 
                                       id="website" 
                                       name="website" 
                                       value="{{ old('website') }}"
                                       placeholder="https://example.com">
                                @error('website')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="custom_domain">Domain Kustom</label>
                                <input type="text" 
                                       class="form-control @error('custom_domain') is-invalid @enderror" 
                                       id="custom_domain" 
                                       name="custom_domain" 
                                       value="{{ old('custom_domain') }}"
                                       placeholder="subdomain.example.com">
                                @error('custom_domain')
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
                                    <option value="">Pilih Paket</option>
                                    <option value="basic" {{ old('subscription_plan') == 'basic' ? 'selected' : '' }}>Basic</option>
                                    <option value="premium" {{ old('subscription_plan') == 'premium' ? 'selected' : '' }}>Premium</option>
                                    <option value="enterprise" {{ old('subscription_plan') == 'enterprise' ? 'selected' : '' }}>Enterprise</option>
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
                                       value="{{ old('subscription_expires_at') }}">
                                @error('subscription_expires_at')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-white border-top">
                    <div class="d-flex justify-content-between">
                        <a href="{{ route('admin.tenants.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-times me-2"></i>
                            Batal
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan Tenant
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
                        <i class="fas fa-info-circle me-2 text-primary"></i>
                        Informasi
                    </h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <h6 class="text-primary">
                            <i class="fas fa-fingerprint me-2"></i>
                            NPSN
                        </h6>
                        <p class="small text-muted mb-0">
                            Nomor Pokok Sekolah Nasional harus terdiri dari 8 digit angka unik.
                        </p>
                    </div>
                    
                    <div class="mb-3">
                        <h6 class="text-success">
                            <i class="fas fa-crown me-2"></i>
                            Subscription Plan
                        </h6>
                        <ul class="small text-muted mb-0 ps-3">
                            <li><strong>Basic:</strong> Fitur dasar</li>
                            <li><strong>Premium:</strong> Fitur lengkap</li>
                            <li><strong>Enterprise:</strong> Fitur enterprise</li>
                        </ul>
                    </div>
                    
                    <div class="alert alert-info mb-0">
                        <small>
                            <i class="fas fa-lightbulb me-1"></i>
                            <strong>Tips:</strong> Pastikan semua data yang diisi sudah benar sebelum menyimpan.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

