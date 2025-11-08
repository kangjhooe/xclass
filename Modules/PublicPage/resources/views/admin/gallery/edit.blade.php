@extends('layouts.tenant')

@section('title', 'Edit Galeri')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title">
                            <i class="fas fa-edit mr-2"></i>
                            Edit Galeri
                        </h3>
                        <a href="{{ tenant_route('admin.gallery.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left mr-1"></i>
                            Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('admin.gallery.update', $gallery->id) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-lg-8">
                                <!-- Basic Information -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Informasi Dasar</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="title" class="form-label">Judul Galeri <span class="text-danger">*</span></label>
                                            <input type="text" 
                                                   class="form-control @error('title') is-invalid @enderror" 
                                                   id="title" 
                                                   name="title" 
                                                   value="{{ old('title', $gallery->title) }}" 
                                                   required>
                                            @error('title')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="description" class="form-label">Deskripsi</label>
                                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                                      id="description" 
                                                      name="description" 
                                                      rows="4">{{ old('description', $gallery->description) }}</textarea>
                                            @error('description')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="category" class="form-label">Kategori</label>
                                            <input type="text" 
                                                   class="form-control @error('category') is-invalid @enderror" 
                                                   id="category" 
                                                   name="category" 
                                                   value="{{ old('category', $gallery->category) }}"
                                                   list="categories">
                                            <datalist id="categories">
                                                @foreach($categories ?? [] as $cat)
                                                    <option value="{{ $cat }}">
                                                @endforeach
                                            </datalist>
                                            @error('category')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="tags" class="form-label">Tags</label>
                                            <input type="text" 
                                                   class="form-control @error('tags') is-invalid @enderror" 
                                                   id="tags" 
                                                   name="tags" 
                                                   value="{{ old('tags', $gallery->tags_string) }}"
                                                   placeholder="tag1, tag2, tag3">
                                            @error('tags')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Pisahkan dengan koma</div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="caption" class="form-label">Caption</label>
                                            <textarea class="form-control @error('caption') is-invalid @enderror" 
                                                      id="caption" 
                                                      name="caption" 
                                                      rows="2">{{ old('caption', $gallery->caption) }}</textarea>
                                            @error('caption')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="alt_text" class="form-label">Alt Text</label>
                                            <input type="text" 
                                                   class="form-control @error('alt_text') is-invalid @enderror" 
                                                   id="alt_text" 
                                                   name="alt_text" 
                                                   value="{{ old('alt_text', $gallery->alt_text) }}">
                                            @error('alt_text')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <!-- Sort Order -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Pengaturan Urutan</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="sort_order" class="form-label">Urutan</label>
                                            <input type="number" 
                                                   class="form-control @error('sort_order') is-invalid @enderror" 
                                                   id="sort_order" 
                                                   name="sort_order" 
                                                   value="{{ old('sort_order', $gallery->sort_order) }}"
                                                   min="0">
                                            @error('sort_order')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-4">
                                <!-- Featured Image -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">
                                            <i class="fas fa-image mr-2"></i>
                                            Gambar Unggulan
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        @if($gallery->image_url)
                                            <div class="mb-3" id="current-image-container">
                                                <label class="form-label">Gambar Saat Ini</label>
                                                <div class="text-center position-relative d-inline-block">
                                                    <img src="{{ $gallery->image_url }}" 
                                                         alt="{{ $gallery->title }}" 
                                                         class="img-fluid rounded shadow" 
                                                         style="max-height: 300px;"
                                                         id="current-image">
                                                </div>
                                            </div>
                                        @endif

                                        <!-- Drag and Drop Zone -->
                                        <div id="drop-zone" 
                                             class="border border-2 border-dashed rounded p-4 text-center mb-3"
                                             style="min-height: 200px; cursor: pointer; transition: all 0.3s; {{ $gallery->image_url ? 'display: none;' : '' }}"
                                             ondrop="handleDrop(event)" 
                                             ondragover="handleDragOver(event)" 
                                             ondragleave="handleDragLeave(event)"
                                             onclick="document.getElementById('featured_image').click()">
                                            <div id="drop-zone-content">
                                                <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                                <p class="mb-2">
                                                    <strong>{{ $gallery->image_url ? 'Ganti gambar' : 'Seret dan lepas gambar di sini' }}</strong>
                                                </p>
                                                <p class="text-muted mb-0">atau klik untuk memilih file</p>
                                                <small class="text-muted d-block mt-2">Format: JPG, PNG, GIF, WEBP. Maksimal 5MB.</small>
                                            </div>
                                        </div>

                                        <input type="file" 
                                               class="form-control @error('image') is-invalid @enderror d-none" 
                                               id="featured_image" 
                                               name="image" 
                                               accept="image/*">
                                        @error('image')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror

                                        <!-- Image Preview -->
                                        <div id="image-preview-container" class="text-center" style="display: none;">
                                            <div class="position-relative d-inline-block">
                                                <label class="form-label d-block">Preview Gambar Baru</label>
                                                <img id="preview-img" src="" alt="Preview" class="img-fluid rounded shadow" style="max-height: 300px;">
                                                <button type="button" 
                                                        class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" 
                                                        onclick="removeImage()"
                                                        title="Batal">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                            <div class="mt-2">
                                                <small class="text-muted" id="image-info"></small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Publication Settings -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Pengaturan Publikasi</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="status" class="form-label">Status</label>
                                            <select class="form-select @error('status') is-invalid @enderror" 
                                                    id="status" 
                                                    name="status">
                                                <option value="active" {{ old('status', $gallery->status) == 'active' ? 'selected' : '' }}>Aktif</option>
                                                <option value="inactive" {{ old('status', $gallery->status) == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                                            </select>
                                            @error('status')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" 
                                                   type="checkbox" 
                                                   id="is_active" 
                                                   name="is_active" 
                                                   value="1" 
                                                   {{ old('is_active', $gallery->is_active) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="is_active">
                                                Aktifkan Galeri
                                            </label>
                                        </div>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" 
                                                   type="checkbox" 
                                                   id="is_featured" 
                                                   name="is_featured" 
                                                   value="1" 
                                                   {{ old('is_featured', $gallery->is_featured) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="is_featured">
                                                Jadikan Galeri Unggulan
                                            </label>
                                        </div>

                                        <!-- Statistics -->
                                        <div class="mt-4 pt-3 border-top">
                                            <h6 class="text-muted mb-3">
                                                <i class="fas fa-chart-bar mr-2"></i>
                                                Statistik
                                            </h6>
                                            <div class="row g-3">
                                                <div class="col-6">
                                                    <div class="text-center p-2 bg-light rounded">
                                                        <div class="text-info mb-2">
                                                            <i class="fas fa-hdd fa-2x"></i>
                                                        </div>
                                                        <div class="fw-bold fs-5">{{ $gallery->formatted_file_size }}</div>
                                                        <small class="text-muted">Ukuran File</small>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="text-center p-2 bg-light rounded">
                                                        <div class="text-primary mb-2">
                                                            <i class="fas fa-file fa-2x"></i>
                                                        </div>
                                                        <div class="fw-bold fs-5">{{ strtoupper($gallery->file_extension ?? '-') }}</div>
                                                        <small class="text-muted">Tipe File</small>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="text-center p-2 bg-light rounded">
                                                        <div class="text-success mb-2">
                                                            <i class="fas fa-calendar-plus fa-2x"></i>
                                                        </div>
                                                        <div class="fw-bold fs-6">{{ $gallery->formatted_created_date }}</div>
                                                        <small class="text-muted">Dibuat</small>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="text-center p-2 bg-light rounded">
                                                        <div class="text-warning mb-2">
                                                            <i class="fas fa-sort-numeric-up fa-2x"></i>
                                                        </div>
                                                        <div class="fw-bold fs-6">{{ $gallery->sort_order ?? '-' }}</div>
                                                        <small class="text-muted">Urutan</small>
                                                    </div>
                                                </div>
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
                                                Update Galeri
                                            </button>
                                            <a href="{{ $gallery->image_url }}" 
                                               class="btn btn-info" 
                                               target="_blank">
                                                <i class="fas fa-eye mr-1"></i>
                                                Preview
                                            </a>
                                            <a href="{{ tenant_route('admin.gallery.index') }}" class="btn btn-secondary">
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
    // Form validation
    document.querySelector('form').addEventListener('submit', function(e) {
        const title = document.getElementById('title').value.trim();
        if (!title) {
            e.preventDefault();
            alert('Judul galeri tidak boleh kosong!');
            document.getElementById('title').focus();
            return false;
        }
    });

    // Drag and Drop handlers
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-primary');
        e.currentTarget.classList.add('bg-light');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-primary');
        e.currentTarget.classList.remove('bg-light');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-primary');
        e.currentTarget.classList.remove('bg-light');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }

    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.match('image.*')) {
            alert('File harus berupa gambar!');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB!');
            return;
        }

        // Set file to input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById('featured_image').files = dataTransfer.files;

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            
            // Hide current image and drop zone, show preview
            const currentImageContainer = document.getElementById('current-image-container');
            if (currentImageContainer) {
                currentImageContainer.style.display = 'none';
            }
            document.getElementById('drop-zone').style.display = 'none';
            document.getElementById('image-preview-container').style.display = 'block';
            
            // Show file info
            const fileSize = (file.size / 1024).toFixed(2);
            document.getElementById('image-info').textContent = 
                `${file.name} (${fileSize} KB)`;
        };
        reader.readAsDataURL(file);
    }

    function removeImage() {
        document.getElementById('featured_image').value = '';
        document.getElementById('image-preview-container').style.display = 'none';
        document.getElementById('preview-img').src = '';
        
        // Show current image or drop zone
        const currentImageContainer = document.getElementById('current-image-container');
        if (currentImageContainer) {
            currentImageContainer.style.display = 'block';
        } else {
            document.getElementById('drop-zone').style.display = 'block';
        }
    }

    // Image preview on file input change
    document.getElementById('featured_image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Auto-generate alt text from title
    document.getElementById('title').addEventListener('input', function() {
        const title = this.value;
        const altText = document.getElementById('alt_text');
        if (!altText.value) {
            altText.value = title;
        }
    });
</script>
@endpush
