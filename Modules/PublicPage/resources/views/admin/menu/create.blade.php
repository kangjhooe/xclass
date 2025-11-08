@extends('layouts.tenant')

@section('title', 'Tambah Menu')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title">
                            <i class="fas fa-plus mr-2"></i>
                            Tambah Menu
                        </h3>
                        <a href="{{ tenant_route('tenant.admin.menu.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left mr-1"></i>
                            Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('tenant.admin.menu.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-lg-8">
                                <!-- Basic Information -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Informasi Menu</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="name" class="form-label">Nama Menu <span class="text-danger">*</span></label>
                                            <input type="text" 
                                                   class="form-control @error('name') is-invalid @enderror" 
                                                   id="name" 
                                                   name="name" 
                                                   value="{{ old('name') }}" 
                                                   placeholder="Contoh: Berita, Galeri, Kontak"
                                                   required>
                                            @error('name')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="url" class="form-label">URL <span class="text-danger">*</span></label>
                                            <input type="text" 
                                                   class="form-control @error('url') is-invalid @enderror" 
                                                   id="url" 
                                                   name="url" 
                                                   value="{{ old('url') }}" 
                                                   placeholder="Contoh: /berita, /galeri, https://example.com"
                                                   required>
                                            @error('url')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">
                                                Gunakan URL relatif (contoh: /berita) atau URL lengkap (contoh: https://example.com)
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="icon" class="form-label">Icon</label>
                                            <div class="input-group">
                                                <span class="input-group-text">
                                                    <i id="icon-preview" class="fas fa-home"></i>
                                                </span>
                                                <input type="text" 
                                                       class="form-control @error('icon') is-invalid @enderror" 
                                                       id="icon" 
                                                       name="icon" 
                                                       value="{{ old('icon') }}" 
                                                       placeholder="Contoh: fas fa-newspaper, fas fa-images">
                                            </div>
                                            @error('icon')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">
                                                Gunakan class Font Awesome (contoh: fas fa-newspaper, fas fa-images)
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="parent_id" class="form-label">Parent Menu</label>
                                            <select class="form-select @error('parent_id') is-invalid @enderror" 
                                                    id="parent_id" 
                                                    name="parent_id">
                                                <option value="">Pilih Parent Menu (Opsional)</option>
                                                @foreach($parentMenus as $parent)
                                                    <option value="{{ $parent->id }}" {{ old('parent_id') == $parent->id ? 'selected' : '' }}>
                                                        {{ $parent->name }}
                                                    </option>
                                                @endforeach
                                            </select>
                                            @error('parent_id')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">
                                                Kosongkan jika ini adalah menu utama
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-4">
                                <!-- Settings -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Pengaturan</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="order" class="form-label">Urutan <span class="text-danger">*</span></label>
                                            <input type="number" 
                                                   class="form-control @error('order') is-invalid @enderror" 
                                                   id="order" 
                                                   name="order" 
                                                   value="{{ old('order', 0) }}" 
                                                   min="0" 
                                                   required>
                                            @error('order')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">
                                                Angka yang lebih kecil akan muncul lebih dulu
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="target" class="form-label">Target Link</label>
                                            <select class="form-select @error('target') is-invalid @enderror" 
                                                    id="target" 
                                                    name="target">
                                                <option value="_self" {{ old('target', '_self') == '_self' ? 'selected' : '' }}>
                                                    Tab yang sama (_self)
                                                </option>
                                                <option value="_blank" {{ old('target') == '_blank' ? 'selected' : '' }}>
                                                    Tab baru (_blank)
                                                </option>
                                            </select>
                                            @error('target')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" 
                                                   type="checkbox" 
                                                   id="is_active" 
                                                   name="is_active" 
                                                   value="1" 
                                                   {{ old('is_active', true) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="is_active">
                                                Aktifkan Menu
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Icon Examples -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Contoh Icon</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-2">
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-home')">
                                                    <i class="fas fa-home me-1"></i>Home
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-newspaper')">
                                                    <i class="fas fa-newspaper me-1"></i>Berita
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-images')">
                                                    <i class="fas fa-images me-1"></i>Galeri
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-info-circle')">
                                                    <i class="fas fa-info-circle me-1"></i>Tentang
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-envelope')">
                                                    <i class="fas fa-envelope me-1"></i>Kontak
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="setIcon('fas fa-link')">
                                                    <i class="fas fa-link me-1"></i>Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save mr-1"></i>
                                                Simpan Menu
                                            </button>
                                            <a href="{{ tenant_route('tenant.admin.menu.index') }}" class="btn btn-secondary">
                                                <i class="fas fa-times mr-1"></i>
                                                Batal
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Icon preview
    document.getElementById('icon').addEventListener('input', function() {
        const iconClass = this.value;
        const preview = document.getElementById('icon-preview');
        
        if (iconClass) {
            preview.className = iconClass;
        } else {
            preview.className = 'fas fa-home';
        }
    });

    // Set icon from examples
    function setIcon(iconClass) {
        document.getElementById('icon').value = iconClass;
        document.getElementById('icon-preview').className = iconClass;
    }

    // Auto-generate order based on existing menus
    document.addEventListener('DOMContentLoaded', function() {
        const orderInput = document.getElementById('order');
        const parentSelect = document.getElementById('parent_id');
        
        // Set default order to next available number
        orderInput.value = {{ $parentMenus->max('order') + 1 ?? 1 }};
        
        // Update order when parent changes
        parentSelect.addEventListener('change', function() {
            if (this.value) {
                // If parent is selected, set order to 1 (first child)
                orderInput.value = 1;
            } else {
                // If no parent, set to next available root order
                orderInput.value = {{ $parentMenus->max('order') + 1 ?? 1 }};
            }
        });
    });
</script>
@endpush
