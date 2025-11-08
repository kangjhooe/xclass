@extends('layouts.admin')

@section('title', 'Settings')
@section('page-title', 'Settings')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-cog me-3"></i>
                Pengaturan Sistem
            </h2>
            <p>Konfigurasi pengaturan sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.dashboard') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                    <i class="fas fa-sliders-h me-2 text-primary"></i>
                    Pengaturan Sistem
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ route('admin.settings.update') }}" method="POST" class="form-modern">
                    @csrf
                    
                    <div class="mb-4">
                        <h6 class="mb-3" style="color: #495057; font-weight: 700; border-bottom: 2px solid #dee2e6; padding-bottom: 0.5rem;">
                            <i class="fas fa-desktop me-2 text-primary"></i>
                            Pengaturan Aplikasi
                        </h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="app_name" class="form-label">Nama Aplikasi</label>
                                    <input type="text" class="form-control @error('app_name') is-invalid @enderror" 
                                           id="app_name" name="app_name" value="{{ old('app_name', config('app.name')) }}">
                                    @error('app_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="app_domain" class="form-label">Domain Utama</label>
                                    <input type="text" class="form-control @error('app_domain') is-invalid @enderror" 
                                           id="app_domain" name="app_domain" value="{{ old('app_domain', config('tenant.domain.main')) }}">
                                    @error('app_domain')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="admin_domain" class="form-label">Domain Admin</label>
                                    <input type="text" class="form-control @error('admin_domain') is-invalid @enderror" 
                                           id="admin_domain" name="admin_domain" value="{{ old('admin_domain', config('tenant.domain.admin')) }}">
                                    @error('admin_domain')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="timezone" class="form-label">Zona Waktu Default</label>
                                    <select class="form-select @error('timezone') is-invalid @enderror" 
                                            id="timezone" name="timezone">
                                        <option value="Asia/Jakarta" {{ old('timezone', 'Asia/Jakarta') == 'Asia/Jakarta' ? 'selected' : '' }}>Asia/Jakarta</option>
                                        <option value="Asia/Makassar" {{ old('timezone', 'Asia/Jakarta') == 'Asia/Makassar' ? 'selected' : '' }}>Asia/Makassar</option>
                                        <option value="Asia/Jayapura" {{ old('timezone', 'Asia/Jakarta') == 'Asia/Jayapura' ? 'selected' : '' }}>Asia/Jayapura</option>
                                    </select>
                                    @error('timezone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6 class="mb-3" style="color: #495057; font-weight: 700; border-bottom: 2px solid #dee2e6; padding-bottom: 0.5rem;">
                            <i class="fas fa-envelope me-2 text-primary"></i>
                            Pengaturan Email
                        </h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="mail_from_name" class="form-label">Nama Pengirim</label>
                                    <input type="text" class="form-control @error('mail_from_name') is-invalid @enderror" 
                                           id="mail_from_name" name="mail_from_name" value="{{ old('mail_from_name', config('mail.from.name')) }}">
                                    @error('mail_from_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="mail_from_address" class="form-label">Alamat Pengirim</label>
                                    <input type="email" class="form-control @error('mail_from_address') is-invalid @enderror" 
                                           id="mail_from_address" name="mail_from_address" value="{{ old('mail_from_address', config('mail.from.address')) }}">
                                    @error('mail_from_address')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6 class="mb-3" style="color: #495057; font-weight: 700; border-bottom: 2px solid #dee2e6; padding-bottom: 0.5rem;">
                            <i class="fas fa-shield-alt me-2 text-primary"></i>
                            Pengaturan Keamanan
                        </h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="session_lifetime" class="form-label">Durasi Sesi (menit)</label>
                                    <input type="number" class="form-control @error('session_lifetime') is-invalid @enderror" 
                                           id="session_lifetime" name="session_lifetime" value="{{ old('session_lifetime', config('session.lifetime')) }}">
                                    @error('session_lifetime')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="password_min_length" class="form-label">Panjang Password Minimum</label>
                                    <input type="number" class="form-control @error('password_min_length') is-invalid @enderror" 
                                           id="password_min_length" name="password_min_length" value="{{ old('password_min_length', 8) }}">
                                    @error('password_min_length')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <a href="{{ route('admin.dashboard') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan Settings
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
                        Informasi Sistem
                    </h5>
                </div>
                <div class="card-body">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fab fa-laravel"></i>
                            Laravel
                        </div>
                        <div class="info-item-value">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ app()->version() }}</code>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fab fa-php"></i>
                            PHP
                        </div>
                        <div class="info-item-value">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ PHP_VERSION }}</code>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-server"></i>
                            Environment
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern {{ app()->environment() === 'production' ? 'bg-success' : 'bg-warning' }}" style="color: white;">
                                {{ app()->environment() }}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-bug"></i>
                            Mode Debug
                        </div>
                        <div class="info-item-value">
                            <span class="badge-modern {{ config('app.debug') ? 'bg-danger' : 'bg-success' }}" style="color: white;">
                                {{ config('app.debug') ? 'Aktif' : 'Nonaktif' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-modern fade-in-up mt-3">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-database me-2 text-primary"></i>
                        Info Database
                    </h5>
                </div>
                <div class="card-body p-0">
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-plug"></i>
                            Koneksi
                        </div>
                        <div class="info-item-value">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ config('database.default') }}</code>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-server"></i>
                            Host
                        </div>
                        <div class="info-item-value">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ config('database.connections.mysql.host') }}</code>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-label">
                            <i class="fas fa-database"></i>
                            Database
                        </div>
                        <div class="info-item-value">
                            <code style="background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">{{ config('database.connections.mysql.database') }}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
