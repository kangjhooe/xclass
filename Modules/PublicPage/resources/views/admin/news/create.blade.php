@extends('layouts.tenant')

@section('title', 'Tambah Berita')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title">
                            <i class="fas fa-plus mr-2"></i>
                            Tambah Berita
                        </h3>
                        <a href="{{ tenant_route('admin.news.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left mr-1"></i>
                            Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('admin.news.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="row">
                            <div class="col-lg-8">
                                <!-- Basic Information -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Informasi Dasar</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="title" class="form-label">Judul Berita <span class="text-danger">*</span></label>
                                            <input type="text" 
                                                   class="form-control @error('title') is-invalid @enderror" 
                                                   id="title" 
                                                   name="title" 
                                                   value="{{ old('title') }}" 
                                                   required>
                                            @error('title')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="excerpt" class="form-label">Ringkasan</label>
                                            <div id="excerpt-editor-container">
                                                <div id="news-excerpt-editor" style="height: 150px;"></div>
                                                <textarea class="form-control @error('excerpt') is-invalid @enderror d-none" 
                                                          id="excerpt" 
                                                          name="excerpt" 
                                                          placeholder="Ringkasan singkat berita...">{{ old('excerpt') }}</textarea>
                                            </div>
                                            @error('excerpt')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="content" class="form-label">Konten Berita <span class="text-danger">*</span></label>
                                            <div id="content-editor-container">
                                                <div id="news-content-editor" style="height: 400px;"></div>
                                                <textarea class="form-control @error('content') is-invalid @enderror d-none" 
                                                          id="content" 
                                                          name="content" 
                                                          required>{{ old('content') }}</textarea>
                                            </div>
                                            @error('content')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <!-- SEO Information -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">Informasi SEO</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="meta_title" class="form-label">Meta Title</label>
                                            <input type="text" 
                                                   class="form-control @error('meta_title') is-invalid @enderror" 
                                                   id="meta_title" 
                                                   name="meta_title" 
                                                   value="{{ old('meta_title') }}">
                                            @error('meta_title')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="meta_description" class="form-label">Meta Description</label>
                                            <textarea class="form-control @error('meta_description') is-invalid @enderror" 
                                                      id="meta_description" 
                                                      name="meta_description" 
                                                      rows="3">{{ old('meta_description') }}</textarea>
                                            @error('meta_description')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="meta_keywords" class="form-label">Meta Keywords</label>
                                            <input type="text" 
                                                   class="form-control @error('meta_keywords') is-invalid @enderror" 
                                                   id="meta_keywords" 
                                                   name="meta_keywords" 
                                                   value="{{ old('meta_keywords') }}"
                                                   placeholder="keyword1, keyword2, keyword3">
                                            @error('meta_keywords')
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
                                        <!-- Drag and Drop Zone -->
                                        <div id="drop-zone" 
                                             class="border border-2 border-dashed rounded p-4 text-center mb-3"
                                             style="min-height: 200px; cursor: pointer; transition: all 0.3s;"
                                             ondrop="handleDrop(event)" 
                                             ondragover="handleDragOver(event)" 
                                             ondragleave="handleDragLeave(event)"
                                             onclick="document.getElementById('featured_image').click()">
                                            <div id="drop-zone-content">
                                                <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                                <p class="mb-2">
                                                    <strong>Seret dan lepas gambar di sini</strong>
                                                </p>
                                                <p class="text-muted mb-0">atau klik untuk memilih file</p>
                                                <small class="text-muted d-block mt-2">Format: JPG, PNG, GIF. Maksimal 2MB.</small>
                                            </div>
                                        </div>

                                        <input type="file" 
                                               class="form-control @error('featured_image') is-invalid @enderror d-none" 
                                               id="featured_image" 
                                               name="featured_image" 
                                               accept="image/*">
                                        @error('featured_image')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror

                                        <!-- Image Preview -->
                                        <div id="image-preview-container" class="text-center" style="display: none;">
                                            <div class="position-relative d-inline-block">
                                                <img id="preview-img" src="" alt="Preview" class="img-fluid rounded shadow" style="max-height: 300px;">
                                                <button type="button" 
                                                        class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" 
                                                        onclick="removeImage()"
                                                        title="Hapus gambar">
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
                                            <label for="author" class="form-label">Penulis <span class="text-danger">*</span></label>
                                            <input type="text" 
                                                   class="form-control @error('author') is-invalid @enderror" 
                                                   id="author" 
                                                   name="author" 
                                                   value="{{ old('author', auth()->user()->name ?? '') }}" 
                                                   required>
                                            @error('author')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                            <select class="form-select @error('status') is-invalid @enderror" 
                                                    id="status" 
                                                    name="status" 
                                                    required>
                                                <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                                <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Published</option>
                                            </select>
                                            @error('status')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="mb-3">
                                            <label for="published_at" class="form-label">Tanggal Publikasi</label>
                                            <input type="datetime-local" 
                                                   class="form-control @error('published_at') is-invalid @enderror" 
                                                   id="published_at" 
                                                   name="published_at" 
                                                   value="{{ old('published_at') }}">
                                            @error('published_at')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" 
                                                   type="checkbox" 
                                                   id="is_featured" 
                                                   name="is_featured" 
                                                   value="1" 
                                                   {{ old('is_featured') ? 'checked' : '' }}>
                                            <label class="form-check-label" for="is_featured">
                                                Jadikan Berita Unggulan
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save mr-1"></i>
                                                Simpan Berita
                                            </button>
                                            <a href="{{ tenant_route('admin.news.index') }}" class="btn btn-secondary">
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
    // Initialize Quill editors for news
    function initNewsQuillEditors() {
        if (typeof Quill === 'undefined') {
            console.error('Quill.js tidak ditemukan');
            return;
        }

        // Initialize content editor
        const contentEditorDiv = document.getElementById('news-content-editor');
        const contentTextarea = document.getElementById('content');
        
        if (contentEditorDiv && contentTextarea) {
            // Check if already initialized
            if (!contentEditorDiv.classList.contains('ql-container')) {
                const quill = new Quill(contentEditorDiv, {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'align': [] }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Tuliskan konten berita di sini...'
                });
                
                // Load existing content
                if (contentTextarea.value) {
                    quill.root.innerHTML = contentTextarea.value;
                }
                
                // Sync with textarea
                quill.on('text-change', () => {
                    contentTextarea.value = quill.root.innerHTML;
                });
                
                // Store in global object
                if (!window.quillEditor) {
                    window.quillEditor = { editors: new Map() };
                }
                window.quillEditor.editors.set('news-content', quill);
            }
        }

        // Initialize excerpt editor
        const excerptEditorDiv = document.getElementById('news-excerpt-editor');
        const excerptTextarea = document.getElementById('excerpt');
        
        if (excerptEditorDiv && excerptTextarea) {
            // Check if already initialized
            if (!excerptEditorDiv.classList.contains('ql-container')) {
                const quill = new Quill(excerptEditorDiv, {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Tuliskan ringkasan berita di sini...'
                });
                
                // Load existing content
                if (excerptTextarea.value) {
                    quill.root.innerHTML = excerptTextarea.value;
                }
                
                // Sync with textarea
                quill.on('text-change', () => {
                    excerptTextarea.value = quill.root.innerHTML;
                });
                
                // Store in global object
                if (!window.quillEditor) {
                    window.quillEditor = { editors: new Map() };
                }
                window.quillEditor.editors.set('news-excerpt', quill);
            }
        }
    }

    // Try multiple ways to ensure Quill is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initNewsQuillEditors, 100);
        });
    } else {
        setTimeout(initNewsQuillEditors, 100);
    }
    
    // Also try on window load as fallback
    window.addEventListener('load', function() {
        setTimeout(initNewsQuillEditors, 200);
    });

    // Ensure Quill content is synced before form submit
    document.querySelector('form').addEventListener('submit', function(e) {
        const contentEditor = window.quillEditor?.editors?.get('news-content');
        const excerptEditor = window.quillEditor?.editors?.get('news-excerpt');
        
        if (contentEditor) {
            const contentTextarea = document.getElementById('content');
            const htmlContent = contentEditor.root.innerHTML;
            // Get plain text to check if content is empty
            const plainText = contentEditor.getText().trim();
            
            contentTextarea.value = htmlContent;
            
            // Validate that content is not empty
            if (plainText.length === 0) {
                e.preventDefault();
                alert('Konten berita tidak boleh kosong!');
                contentEditor.focus();
                return false;
            }
        } else {
            // If editor not initialized, check textarea directly
            const contentTextarea = document.getElementById('content');
            if (!contentTextarea.value || contentTextarea.value.trim() === '') {
                e.preventDefault();
                alert('Konten berita tidak boleh kosong!');
                contentTextarea.focus();
                return false;
            }
        }
        
        if (excerptEditor) {
            const excerptTextarea = document.getElementById('excerpt');
            excerptTextarea.value = excerptEditor.root.innerHTML;
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

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file maksimal 2MB!');
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
        document.getElementById('drop-zone').style.display = 'block';
        document.getElementById('image-preview-container').style.display = 'none';
        document.getElementById('preview-img').src = '';
    }

    // Image preview on file input change
    document.getElementById('featured_image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Auto-generate meta title from title
    document.getElementById('title').addEventListener('input', function() {
        const title = this.value;
        const metaTitle = document.getElementById('meta_title');
        if (!metaTitle.value) {
            metaTitle.value = title;
        }
    });

    // Auto-generate excerpt from content (when Quill editor is ready)
    setTimeout(function() {
        const contentEditor = window.quillEditor?.editors?.get('news-content');
        const excerptEditor = window.quillEditor?.editors?.get('news-excerpt');
        
        if (contentEditor) {
            let excerptGenerated = false;
            
            contentEditor.on('text-change', function() {
                const excerptTextarea = document.getElementById('excerpt');
                // Only auto-generate if excerpt is empty and user hasn't manually edited it
                if (!excerptGenerated && (!excerptTextarea.value || excerptTextarea.value.trim() === '')) {
                    const plainText = contentEditor.getText().trim();
                    if (plainText.length > 50) { // Only generate if content is substantial
                        const excerptText = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
                        excerptTextarea.value = excerptText;
                        // Update excerpt editor if it exists
                        if (excerptEditor) {
                            excerptEditor.root.innerHTML = excerptText;
                        }
                    }
                }
            });
            
            // Track if user manually edits excerpt
            if (excerptEditor) {
                excerptEditor.on('text-change', function() {
                    excerptGenerated = true;
                });
            }
        }
    }, 1000);

    // Set default published date if status is published
    document.getElementById('status').addEventListener('change', function() {
        const publishedAt = document.getElementById('published_at');
        if (this.value === 'published' && !publishedAt.value) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            publishedAt.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    });
</script>
@endpush
