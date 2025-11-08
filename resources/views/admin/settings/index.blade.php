@extends('layouts.admin')

@section('title', 'Pengaturan Sistem')
@section('page-title', 'Pengaturan Sistem')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-cog me-3"></i>
                Pengaturan Logo & Favicon
            </h2>
            <p>Kelola logo dan favicon sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.dashboard') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-cog me-2 text-primary"></i>
                    Pengaturan Logo & Favicon
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data" class="form-modern">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <!-- System Name -->
                        <div class="col-md-6">
                            <div class="mb-4">
                                <label for="system_name" class="form-label">
                                    <i class="fas fa-tag me-1"></i>
                                    Nama Sistem
                                </label>
                                <input type="text" 
                                       class="form-control @error('system_name') is-invalid @enderror" 
                                       id="system_name" 
                                       name="system_name" 
                                       value="{{ old('system_name', system_name()) }}"
                                       placeholder="Masukkan nama sistem">
                                @error('system_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Logo Upload -->
                        <div class="col-md-6">
                            <div class="mb-4">
                                <label for="system_logo" class="form-label">
                                    <i class="fas fa-image me-1"></i>
                                    Logo Sistem
                                </label>
                                <div class="mb-3">
                                    @if(system_logo())
                                        <div class="current-logo mb-3">
                                            <p class="text-muted small">Logo saat ini:</p>
                                            <img src="{{ system_logo() }}" 
                                                 alt="Current Logo" 
                                                 class="img-thumbnail" 
                                                 style="max-width: 200px; max-height: 100px;">
                                            <div class="mt-2">
                                                <a href="{{ route('admin.settings.delete-logo') }}" 
                                                   class="btn btn-modern btn-danger"
                                                   onclick="return confirm('Yakin ingin menghapus logo?')">
                                                    <i class="fas fa-trash me-1"></i>
                                                    Hapus Logo
                                                </a>
                                            </div>
                                        </div>
                                    @else
                                        <div class="no-logo mb-3">
                                            <p class="text-muted small">Belum ada logo yang diupload</p>
                                        </div>
                                    @endif
                                </div>
                                <input type="file" 
                                       class="form-control @error('system_logo') is-invalid @enderror" 
                                       id="system_logo" 
                                       name="system_logo" 
                                       accept="image/*">
                                <div class="form-text">
                                    Format: JPEG, PNG, JPG, GIF, SVG. Maksimal 2MB.
                                </div>
                                @error('system_logo')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <!-- Favicon Upload -->
                        <div class="col-md-6">
                            <div class="mb-4">
                                <label for="system_favicon" class="form-label">
                                    <i class="fas fa-star me-1"></i>
                                    Favicon
                                </label>
                                <div class="mb-3">
                                    @if(system_favicon())
                                        <div class="current-favicon mb-3">
                                            <p class="text-muted small">Favicon saat ini:</p>
                                            <img src="{{ system_favicon() }}" 
                                                 alt="Current Favicon" 
                                                 class="img-thumbnail" 
                                                 style="max-width: 32px; max-height: 32px;">
                                            <div class="mt-2">
                                                <a href="{{ route('admin.settings.delete-favicon') }}" 
                                                   class="btn btn-modern btn-danger"
                                                   onclick="return confirm('Yakin ingin menghapus favicon?')">
                                                    <i class="fas fa-trash me-1"></i>
                                                    Hapus Favicon
                                                </a>
                                            </div>
                                        </div>
                                    @else
                                        <div class="no-favicon mb-3">
                                            <p class="text-muted small">Belum ada favicon yang diupload</p>
                                        </div>
                                    @endif
                                </div>
                                <input type="file" 
                                       class="form-control @error('system_favicon') is-invalid @enderror" 
                                       id="system_favicon" 
                                       name="system_favicon" 
                                       accept="image/*">
                                <div class="form-text">
                                    Format: JPEG, PNG, JPG, GIF, ICO, SVG. Maksimal 1MB. Ukuran disarankan 32x32px.
                                </div>
                                @error('system_favicon')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Preview Section -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card-modern">
                                <div class="card-header">
                                    <h5>
                                        <i class="fas fa-eye me-2 text-primary"></i>
                                        Preview
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6>Halaman Login:</h6>
                                            <div class="border rounded p-3 text-center" style="background: #f8f9fa;">
                                                <div id="login-preview">
                                                    @if(system_logo())
                                                        <img src="{{ system_logo() }}" 
                                                             alt="Logo" 
                                                             style="max-height: 60px; margin-bottom: 1rem;">
                                                    @else
                                                        <div class="placeholder-logo" style="height: 60px; background: #dee2e6; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                                                            <span class="text-muted">Logo akan muncul di sini</span>
                                                        </div>
                                                    @endif
                                                    <h4>{{ system_name() }}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6>Navbar Admin:</h6>
                                            <div class="border rounded p-3" style="background: #f8f9fa;">
                                                <nav class="navbar navbar-light">
                                                    <div class="container-fluid">
                                                        <div class="d-flex align-items-center">
                                                            @if(system_logo())
                                                                <img src="{{ system_logo() }}" 
                                                                     alt="Logo" 
                                                                     style="max-height: 40px; margin-right: 10px;">
                                                            @else
                                                                <div class="placeholder-logo" style="width: 40px; height: 40px; background: #dee2e6; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                                                                    <i class="fas fa-image text-muted"></i>
                                                                </div>
                                                            @endif
                                                            <span class="navbar-brand mb-0">{{ system_name() }}</span>
                                                        </div>
                                                    </div>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <button type="submit" class="btn btn-modern btn-primary">
                                <i class="fas fa-save me-2"></i>
                                Simpan Pengaturan
                            </button>
                            <a href="{{ route('admin.dashboard') }}" class="btn btn-modern btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Kembali
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Preview logo when file is selected
    document.getElementById('system_logo').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.querySelector('#login-preview .placeholder-logo');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Logo Preview" style="max-height: 60px;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Preview favicon when file is selected
    document.getElementById('system_favicon').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Update favicon preview if needed
                console.log('Favicon preview updated');
            };
            reader.readAsDataURL(file);
        }
    });
</script>
@endpush
@endsection
