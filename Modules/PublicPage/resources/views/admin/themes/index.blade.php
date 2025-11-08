@extends('layouts.tenant')

@section('title', 'Kelola Tema')

@push('styles')
<style>
    .page-header {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: white;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);
    }
    .page-header h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
    }
    .page-header p {
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
    }
    .modern-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        border: none;
        margin-bottom: 1.5rem;
        transition: all 0.3s ease;
        overflow: hidden;
    }
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
    }
    .modern-card-header {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.25rem 1.5rem;
        border-bottom: 2px solid #e9ecef;
        border-radius: 12px 12px 0 0;
    }
    .theme-card {
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }
    .theme-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    .theme-card.active {
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
    .color-preview {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: inline-block;
        border: 2px solid rgba(0, 0, 0, 0.1);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h1><i class="fas fa-palette me-2"></i>Kelola Tema</h1>
                <p>Kelola tema untuk halaman publik sekolah Anda</p>
            </div>
            <div class="btn-group">
                <a href="{{ route('tenant.public-page.themes.create', ['tenant' => request()->route('tenant')]) }}" class="btn btn-light btn-sm">
                    <i class="fas fa-plus me-2"></i>Buat Tema Baru
                </a>
                <button type="button" class="btn btn-light btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
                    <span class="visually-hidden">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#importModal">
                            <i class="fas fa-upload me-2"></i>Import Tema
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <h5 class="mb-0"><i class="fas fa-list me-2"></i>Daftar Tema</h5>
                </div>
                <div class="card-body p-4">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show">
                            <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show">
                            <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <!-- Tabs untuk kategori tema -->
                    <ul class="nav nav-tabs mb-4" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#predefined" role="tab">
                                <i class="fas fa-star me-1"></i>Tema Siap Pakai
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#my-themes" role="tab">
                                <i class="fas fa-user me-1"></i>Tema Saya
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#public-themes" role="tab">
                                <i class="fas fa-globe me-1"></i>Tema Publik
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <!-- Predefined Themes -->
                        <div class="tab-pane fade show active" id="predefined" role="tabpanel">
                            <div class="row">
                                @foreach($predefinedThemes as $slug => $theme)
                                    <div class="col-md-4 mb-4">
                                        <div class="card h-100 theme-card {{ $activeThemeName === $slug ? 'active' : '' }}">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 class="card-title mb-0">{{ $theme['name'] }}</h5>
                                                    @if($activeThemeName === $slug)
                                                        <span class="badge bg-success">
                                                            <i class="fas fa-check me-1"></i>Aktif
                                                        </span>
                                                    @endif
                                                </div>
                                                <p class="card-text text-muted small">{{ $theme['description'] ?? 'Tidak ada deskripsi' }}</p>
                                                
                                                <!-- Preview colors -->
                                                <div class="d-flex gap-2 mb-3">
                                                    <div class="color-preview" style="background: {{ $theme['config']['primary_color'] ?? '#007bff' }};"></div>
                                                    @if(isset($theme['config']['sidebar_bg']))
                                                        <div class="color-preview" style="background: {{ $theme['config']['sidebar_bg'] }};"></div>
                                                    @endif
                                                </div>

                                                <div class="btn-group w-100">
                                                    <form method="POST" action="{{ route('tenant.public-page.themes.apply', ['tenant' => request()->route('tenant')]) }}" class="d-inline">
                                                        @csrf
                                                        <input type="hidden" name="theme_name" value="{{ $slug }}">
                                                        <button type="submit" class="btn btn-sm btn-primary">
                                                            <i class="fas fa-check me-1"></i>Terapkan
                                                        </button>
                                                    </form>
                                                    <a href="{{ route('tenant.public-page.themes.preview-name', ['tenant' => request()->route('tenant'), 'themeName' => $slug]) }}" 
                                                       class="btn btn-sm btn-outline-secondary" target="_blank">
                                                        <i class="fas fa-eye me-1"></i>Preview
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <!-- My Themes -->
                        <div class="tab-pane fade" id="my-themes" role="tabpanel">
                            @if($myThemes->count() > 0)
                                <div class="row">
                                    @foreach($myThemes as $theme)
                                        <div class="col-md-4 mb-4">
                                            <div class="card h-100 theme-card {{ $activeThemeName === $theme->slug ? 'active' : '' }}">
                                                <div class="card-body">
                                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                                        <h5 class="card-title mb-0">{{ $theme->name }}</h5>
                                                        @if($activeThemeName === $theme->slug)
                                                            <span class="badge bg-success">
                                                                <i class="fas fa-check me-1"></i>Aktif
                                                            </span>
                                                        @endif
                                                    </div>
                                                    <p class="card-text text-muted small">{{ $theme->description ?? 'Tidak ada deskripsi' }}</p>
                                                    
                                                    @if($theme->theme_config)
                                                        <div class="d-flex gap-2 mb-3">
                                                            <div class="color-preview" style="background: {{ $theme->theme_config['primary_color'] ?? '#007bff' }};"></div>
                                                            @if(isset($theme->theme_config['sidebar_bg']))
                                                                <div class="color-preview" style="background: {{ $theme->theme_config['sidebar_bg'] }};"></div>
                                                            @endif
                                                        </div>
                                                    @endif

                                                    <div class="d-flex gap-2 mb-2">
                                                        <small class="text-muted">
                                                            <i class="fas fa-download me-1"></i>{{ $theme->download_count }} download
                                                        </small>
                                                        <small class="text-muted">
                                                            <i class="fas fa-users me-1"></i>{{ $theme->usage_count }} penggunaan
                                                        </small>
                                                    </div>

                                                    <div class="btn-group w-100">
                                                        <form method="POST" action="{{ route('tenant.public-page.themes.apply', ['tenant' => request()->route('tenant')]) }}" class="d-inline">
                                                            @csrf
                                                            <input type="hidden" name="theme_name" value="{{ $theme->slug }}">
                                                            <button type="submit" class="btn btn-sm btn-primary">
                                                                <i class="fas fa-check me-1"></i>Terapkan
                                                            </button>
                                                        </form>
                                                        <a href="{{ route('tenant.public-page.themes.edit', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                           class="btn btn-sm btn-outline-primary">
                                                            <i class="fas fa-edit me-1"></i>Edit
                                                        </a>
                                                        <a href="{{ route('tenant.public-page.themes.preview', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                           class="btn btn-sm btn-outline-secondary" target="_blank">
                                                            <i class="fas fa-eye me-1"></i>Preview
                                                        </a>
                                                    </div>
                                                    <div class="btn-group w-100 mt-2">
                                                        <a href="{{ route('tenant.public-page.themes.export', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                           class="btn btn-sm btn-outline-info">
                                                            <i class="fas fa-download me-1"></i>Export
                                                        </a>
                                                        <form method="POST" action="{{ route('tenant.public-page.themes.duplicate', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" class="d-inline">
                                                            @csrf
                                                            <button type="submit" class="btn btn-sm btn-outline-warning">
                                                                <i class="fas fa-copy me-1"></i>Duplikasi
                                                            </button>
                                                        </form>
                                                        <form method="POST" action="{{ route('tenant.public-page.themes.destroy', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus tema ini?')" class="d-inline">
                                                            @csrf
                                                            @method('DELETE')
                                                            <button type="submit" class="btn btn-sm btn-outline-danger">
                                                                <i class="fas fa-trash me-1"></i>Hapus
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Anda belum memiliki tema. <a href="{{ route('tenant.public-page.themes.create', ['tenant' => request()->route('tenant')]) }}" class="alert-link">Buat tema baru</a>
                                </div>
                            @endif
                        </div>

                        <!-- Public Themes -->
                        <div class="tab-pane fade" id="public-themes" role="tabpanel">
                            @if($publicThemes->count() > 0)
                                <div class="row">
                                    @foreach($publicThemes as $theme)
                                        <div class="col-md-4 mb-4">
                                            <div class="card h-100 theme-card">
                                                <div class="card-body">
                                                    <h5 class="card-title mb-0">{{ $theme->name }}</h5>
                                                    <p class="card-text text-muted small">{{ $theme->description ?? 'Tidak ada deskripsi' }}</p>
                                                    
                                                    @if($theme->creator)
                                                        <small class="text-muted d-block mb-2">
                                                            <i class="fas fa-user me-1"></i>Dibuat oleh: {{ $theme->creator->name }}
                                                        </small>
                                                    @endif

                                                    @if($theme->theme_config)
                                                        <div class="d-flex gap-2 mb-3">
                                                            <div class="color-preview" style="background: {{ $theme->theme_config['primary_color'] ?? '#007bff' }};"></div>
                                                            @if(isset($theme->theme_config['sidebar_bg']))
                                                                <div class="color-preview" style="background: {{ $theme->theme_config['sidebar_bg'] }};"></div>
                                                            @endif
                                                        </div>
                                                    @endif

                                                    <div class="d-flex gap-2 mb-2">
                                                        <small class="text-muted">
                                                            <i class="fas fa-download me-1"></i>{{ $theme->download_count }} download
                                                        </small>
                                                        <small class="text-muted">
                                                            <i class="fas fa-users me-1"></i>{{ $theme->usage_count }} penggunaan
                                                        </small>
                                                    </div>

                                                    <div class="btn-group w-100">
                                                        <form method="POST" action="{{ route('tenant.public-page.themes.apply', ['tenant' => request()->route('tenant')]) }}" class="d-inline">
                                                            @csrf
                                                            <input type="hidden" name="theme_name" value="{{ $theme->slug }}">
                                                            <button type="submit" class="btn btn-sm btn-primary">
                                                                <i class="fas fa-check me-1"></i>Terapkan
                                                            </button>
                                                        </form>
                                                        <a href="{{ route('tenant.public-page.themes.preview', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                           class="btn btn-sm btn-outline-secondary" target="_blank">
                                                            <i class="fas fa-eye me-1"></i>Preview
                                                        </a>
                                                        <a href="{{ route('tenant.public-page.themes.export', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                                                           class="btn btn-sm btn-outline-info">
                                                            <i class="fas fa-download me-1"></i>Export
                                                        </a>
                                                    </div>
                                                    <form method="POST" action="{{ route('tenant.public-page.themes.duplicate', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" class="mt-2">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-warning w-100">
                                                            <i class="fas fa-copy me-1"></i>Duplikasi untuk Edit
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Belum ada tema publik yang tersedia.
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Import Modal -->
<div class="modal fade" id="importModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST" action="{{ route('tenant.public-page.themes.import', ['tenant' => request()->route('tenant')]) }}" enctype="multipart/form-data">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Import Tema</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="theme_file" class="form-label">Pilih File JSON</label>
                        <input type="file" class="form-control" id="theme_file" name="theme_file" accept=".json" required>
                        <small class="form-text text-muted">Pilih file tema dalam format JSON</small>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="is_public" name="is_public" value="1">
                        <label class="form-check-label" for="is_public">
                            Buat tema ini publik (dapat diakses oleh tenant lain)
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Import</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

