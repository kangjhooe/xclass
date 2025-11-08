@extends('layouts.tenant')

@section('title', 'Edit Tema')

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
    }
    .modern-card-header {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.25rem 1.5rem;
        border-bottom: 2px solid #e9ecef;
        border-radius: 12px 12px 0 0;
    }
    .modern-card-header h5 {
        margin: 0;
        color: #495057;
        font-weight: 600;
    }
    .form-label {
        font-weight: 500;
        color: #495057;
        margin-bottom: 0.5rem;
    }
    .form-control:focus, .form-select:focus {
        border-color: #fa709a;
        box-shadow: 0 0 0 0.2rem rgba(250, 112, 154, 0.25);
    }
    .form-section-title {
        color: #495057;
        font-weight: 600;
        font-size: 1.1rem;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e9ecef;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="page-header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h1><i class="fas fa-edit me-2"></i>Edit Tema</h1>
                <p>Ubah informasi tema: <strong>{{ $theme->name }}</strong></p>
            </div>
            <a href="{{ route('tenant.public-page.themes.index', ['tenant' => request()->route('tenant')]) }}" class="btn btn-light btn-sm">
                <i class="fas fa-arrow-left me-2"></i>Kembali
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <h5><i class="fas fa-palette me-2"></i>Form Edit Tema</h5>
                </div>
                <div class="card-body p-4">
                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('tenant.public-page.themes.update', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}">
                        @csrf
                        @method('PUT')

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nama Tema <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $theme->name) }}" required>
                                </div>

                                <div class="mb-3">
                                    <label for="description" class="form-label">Deskripsi</label>
                                    <textarea class="form-control" id="description" name="description" rows="3">{{ old('description', $theme->description) }}</textarea>
                                </div>

                                <div class="mb-3">
                                    <label for="layout_type" class="form-label">Tipe Layout <span class="text-danger">*</span></label>
                                    <select class="form-select" id="layout_type" name="layout_type" required>
                                        <option value="sidebar-left" {{ old('layout_type', $theme->layout_type) == 'sidebar-left' ? 'selected' : '' }}>Sidebar Kiri</option>
                                        <option value="full-width" {{ old('layout_type', $theme->layout_type) == 'full-width' ? 'selected' : '' }}>Full Width</option>
                                        <option value="boxed" {{ old('layout_type', $theme->layout_type) == 'boxed' ? 'selected' : '' }}>Boxed</option>
                                    </select>
                                </div>

                                @if(!$theme->is_system)
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="is_public" name="is_public" value="1" {{ old('is_public', $theme->is_public) ? 'checked' : '' }}>
                                        <label class="form-check-label" for="is_public">
                                            Buat tema ini publik (dapat diakses oleh tenant lain)
                                        </label>
                                    </div>
                                @else
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Ini adalah tema sistem dan tidak dapat diubah status publiknya.
                                    </div>
                                @endif
                            </div>

                            <div class="col-md-6">
                                <h5 class="form-section-title mb-3">
                                    <i class="fas fa-palette me-2"></i>Konfigurasi Warna
                                </h5>
                                
                                @php
                                    $config = $theme->theme_config ?? [];
                                @endphp

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="primary_color" class="form-label">Primary Color</label>
                                        <input type="color" class="form-control form-control-color" id="primary_color" name="theme_config[primary_color]" value="{{ old('theme_config.primary_color', $config['primary_color'] ?? '#007bff') }}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="secondary_color" class="form-label">Secondary Color</label>
                                        <input type="color" class="form-control form-control-color" id="secondary_color" name="theme_config[secondary_color]" value="{{ old('theme_config.secondary_color', $config['secondary_color'] ?? '#6c757d') }}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="success_color" class="form-label">Success Color</label>
                                        <input type="color" class="form-control form-control-color" id="success_color" name="theme_config[success_color]" value="{{ old('theme_config.success_color', $config['success_color'] ?? '#28a745') }}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="danger_color" class="form-label">Danger Color</label>
                                        <input type="color" class="form-control form-control-color" id="danger_color" name="theme_config[danger_color]" value="{{ old('theme_config.danger_color', $config['danger_color'] ?? '#dc3545') }}">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="sidebar_bg" class="form-label">Sidebar Background</label>
                                    <input type="text" class="form-control" id="sidebar_bg" name="theme_config[sidebar_bg]" value="{{ old('theme_config.sidebar_bg', $config['sidebar_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}" placeholder="linear-gradient(...) atau #hex">
                                </div>

                                <div class="mb-3">
                                    <label for="card_header_bg" class="form-label">Card Header Background</label>
                                    <input type="text" class="form-control" id="card_header_bg" name="theme_config[card_header_bg]" value="{{ old('theme_config.card_header_bg', $config['card_header_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}">
                                </div>

                                <div class="mb-3">
                                    <label for="footer_bg" class="form-label">Footer Background</label>
                                    <input type="text" class="form-control" id="footer_bg" name="theme_config[footer_bg]" value="{{ old('theme_config.footer_bg', $config['footer_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}">
                                </div>

                                <div class="mb-3">
                                    <label for="button_bg" class="form-label">Button Background</label>
                                    <input type="text" class="form-control" id="button_bg" name="theme_config[button_bg]" value="{{ old('theme_config.button_bg', $config['button_bg'] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}">
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <h5 class="form-section-title">
                                    <i class="fas fa-bars me-2"></i>Konfigurasi Menu & Tampilan
                                </h5>
                                
                                @php
                                    $menuConfig = $theme->menu_config ?? [];
                                @endphp
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="menu_style" class="form-label">Style Menu</label>
                                        <select class="form-select" id="menu_style" name="menu_config[menu_style]">
                                            <option value="sidebar" {{ old('menu_config.menu_style', $menuConfig['menu_style'] ?? 'sidebar') == 'sidebar' ? 'selected' : '' }}>Sidebar</option>
                                            <option value="topbar" {{ old('menu_config.menu_style', $menuConfig['menu_style'] ?? 'sidebar') == 'topbar' ? 'selected' : '' }}>Top Bar</option>
                                            <option value="dropdown" {{ old('menu_config.menu_style', $menuConfig['menu_style'] ?? 'sidebar') == 'dropdown' ? 'selected' : '' }}>Dropdown</option>
                                            <option value="accordion" {{ old('menu_config.menu_style', $menuConfig['menu_style'] ?? 'sidebar') == 'accordion' ? 'selected' : '' }}>Accordion</option>
                                        </select>
                                        <small class="form-text text-muted">Pilih gaya menu yang ingin ditampilkan</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_position" class="form-label">Posisi Menu</label>
                                        <select class="form-select" id="menu_position" name="menu_config[menu_position]">
                                            <option value="left" {{ old('menu_config.menu_position', $menuConfig['menu_position'] ?? 'left') == 'left' ? 'selected' : '' }}>Kiri</option>
                                            <option value="right" {{ old('menu_config.menu_position', $menuConfig['menu_position'] ?? 'left') == 'right' ? 'selected' : '' }}>Kanan</option>
                                            <option value="top" {{ old('menu_config.menu_position', $menuConfig['menu_position'] ?? 'left') == 'top' ? 'selected' : '' }}>Atas</option>
                                        </select>
                                        <small class="form-text text-muted">Pilih posisi menu di halaman</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_hover_effect" class="form-label">Efek Hover Menu</label>
                                        <select class="form-select" id="menu_hover_effect" name="menu_config[menu_hover_effect]">
                                            <option value="background" {{ old('menu_config.menu_hover_effect', $menuConfig['menu_hover_effect'] ?? 'background') == 'background' ? 'selected' : '' }}>Background</option>
                                            <option value="underline" {{ old('menu_config.menu_hover_effect', $menuConfig['menu_hover_effect'] ?? 'background') == 'underline' ? 'selected' : '' }}>Underline</option>
                                            <option value="border-left" {{ old('menu_config.menu_hover_effect', $menuConfig['menu_hover_effect'] ?? 'background') == 'border-left' ? 'selected' : '' }}>Border Kiri</option>
                                        </select>
                                        <small class="form-text text-muted">Pilih efek saat menu di-hover</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_font_size" class="form-label">Ukuran Font Menu</label>
                                        <input type="text" class="form-control" id="menu_font_size" name="menu_config[menu_font_size]" value="{{ old('menu_config.menu_font_size', $menuConfig['menu_font_size'] ?? '14px') }}" placeholder="14px">
                                        <small class="form-text text-muted">Contoh: 14px, 1rem, 16px</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_font_weight" class="form-label">Ketebalan Font Menu</label>
                                        <select class="form-select" id="menu_font_weight" name="menu_config[menu_font_weight]">
                                            <option value="400" {{ old('menu_config.menu_font_weight', $menuConfig['menu_font_weight'] ?? '500') == '400' ? 'selected' : '' }}>Normal (400)</option>
                                            <option value="500" {{ old('menu_config.menu_font_weight', $menuConfig['menu_font_weight'] ?? '500') == '500' ? 'selected' : '' }}>Medium (500)</option>
                                            <option value="600" {{ old('menu_config.menu_font_weight', $menuConfig['menu_font_weight'] ?? '500') == '600' ? 'selected' : '' }}>Semi Bold (600)</option>
                                            <option value="700" {{ old('menu_config.menu_font_weight', $menuConfig['menu_font_weight'] ?? '500') == '700' ? 'selected' : '' }}>Bold (700)</option>
                                        </select>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_item_padding" class="form-label">Padding Item Menu</label>
                                        <input type="text" class="form-control" id="menu_item_padding" name="menu_config[menu_item_padding]" value="{{ old('menu_config.menu_item_padding', $menuConfig['menu_item_padding'] ?? '12px 20px') }}" placeholder="12px 20px">
                                        <small class="form-text text-muted">Contoh: 12px 20px</small>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="menu_border_radius" class="form-label">Border Radius Menu</label>
                                        <input type="text" class="form-control" id="menu_border_radius" name="menu_config[menu_border_radius]" value="{{ old('menu_config.menu_border_radius', $menuConfig['menu_border_radius'] ?? '0px') }}" placeholder="0px">
                                        <small class="form-text text-muted">Contoh: 0px, 5px, 10px</small>
                                    </div>
                                </div>

                                <div class="row mt-3">
                                    <div class="col-md-6 mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="show_menu_icons" name="menu_config[show_menu_icons]" value="1" {{ old('menu_config.show_menu_icons', $menuConfig['show_menu_icons'] ?? true) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="show_menu_icons">
                                                Tampilkan Ikon Menu
                                            </label>
                                        </div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="show_menu_search" name="menu_config[show_menu_search]" value="1" {{ old('menu_config.show_menu_search', $menuConfig['show_menu_search'] ?? true) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="show_menu_search">
                                                Tampilkan Kotak Pencarian di Menu
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <h5 class="form-section-title">
                                    <i class="fas fa-code me-2"></i>Custom CSS & JavaScript (Opsional)
                                </h5>
                                
                                <div class="mb-3">
                                    <label for="custom_css" class="form-label">Custom CSS</label>
                                    <textarea class="form-control font-monospace" id="custom_css" name="custom_css" rows="8" placeholder="/* Custom CSS */">{{ old('custom_css', $theme->custom_css) }}</textarea>
                                    <small class="form-text text-muted">Tambahkan CSS kustom untuk tema ini</small>
                                </div>

                                <div class="mb-3">
                                    <label for="custom_js" class="form-label">Custom JavaScript</label>
                                    <textarea class="form-control font-monospace" id="custom_js" name="custom_js" rows="8" placeholder="// Custom JavaScript">{{ old('custom_js', $theme->custom_js) }}</textarea>
                                    <small class="form-text text-muted">Tambahkan JavaScript kustom untuk tema ini</small>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Simpan Perubahan
                            </button>
                            <a href="{{ route('tenant.public-page.themes.preview', ['tenant' => request()->route('tenant'), 'theme' => $theme->id]) }}" 
                               class="btn btn-info" target="_blank">
                                <i class="fas fa-eye me-2"></i>Preview
                            </a>
                            <a href="{{ route('tenant.public-page.themes.index', ['tenant' => request()->route('tenant')]) }}" class="btn btn-secondary">
                                <i class="fas fa-times me-2"></i>Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

