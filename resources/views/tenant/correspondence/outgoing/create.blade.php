@extends('layouts.tenant')

@section('title', 'Tambah Surat Keluar')
@section('page-title', 'Tambah Surat Keluar')

@section('styles')
<style>
.file-upload-area {
    transition: all 0.3s ease;
    cursor: pointer;
}

.file-upload-area:hover {
    border-color: #007bff !important;
    background-color: #f8f9fa !important;
}

.file-upload-area.border-primary {
    border-color: #007bff !important;
    background-color: #e3f2fd !important;
}

.auto-save-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
}
</style>
@endsection

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus-circle me-2"></i>
                        Form Tambah Surat Keluar
                    </h5>
                </div>
                <div class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form action="{{ tenant_route('correspondence.outgoing.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="letter_number" class="form-label">Nomor Surat <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('letter_number') is-invalid @enderror" 
                                           id="letter_number" name="letter_number" value="{{ old('letter_number') }}" required>
                                    @error('letter_number')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="letter_date" class="form-label">Tanggal Surat <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('letter_date') is-invalid @enderror" 
                                           id="letter_date" name="letter_date" value="{{ old('letter_date') }}" required>
                                    @error('letter_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="recipient" class="form-label">Penerima <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('recipient') is-invalid @enderror" 
                                           id="recipient" name="recipient" value="{{ old('recipient') }}" required>
                                    @error('recipient')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="subject" class="form-label">Perihal <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('subject') is-invalid @enderror" 
                                           id="subject" name="subject" value="{{ old('subject') }}" required>
                                    @error('subject')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" 
                                            id="status" name="status" required>
                                        <option value="">Pilih Status</option>
                                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                        <option value="sent" {{ old('status') == 'sent' ? 'selected' : '' }}>Terkirim</option>
                                        <option value="delivered" {{ old('status') == 'delivered' ? 'selected' : '' }}>Terkirim</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="file" class="form-label">File Surat</label>
                                    <div class="file-upload-area border border-2 border-dashed rounded p-4 text-center" 
                                         id="fileUploadArea" 
                                         ondrop="handleDrop(event)" 
                                         ondragover="handleDragOver(event)" 
                                         ondragleave="handleDragLeave(event)">
                                        <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                        <p class="mb-2">Drag & drop file di sini atau klik untuk memilih</p>
                                        <input type="file" class="form-control @error('file') is-invalid @enderror d-none" 
                                               id="file" name="file" accept=".pdf,.doc,.docx" onchange="handleFileSelect(event)">
                                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="document.getElementById('file').click()">
                                            <i class="fas fa-folder-open me-1"></i> Pilih File
                                        </button>
                                        <div class="mt-2" id="fileInfo" style="display: none;">
                                            <small class="text-success">
                                                <i class="fas fa-check-circle me-1"></i>
                                                <span id="fileName"></span>
                                            </small>
                                        </div>
                                    </div>
                                    @error('file')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Format: PDF, DOC, DOCX. Maksimal 10MB</div>
                                </div>

                                @if($templates->count() > 0)
                                <div class="mb-3">
                                    <label for="template_id" class="form-label">Template Surat</label>
                                    <select class="form-select" id="template_id" onchange="loadTemplate()">
                                        <option value="">Pilih Template</option>
                                        @foreach($templates as $template)
                                            <option value="{{ $template->id }}">{{ $template->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                @endif
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="content" class="form-label">Isi Surat</label>
                            <div class="position-relative">
                                <div id="content-editor-container">
                                    <textarea class="form-control @error('content') is-invalid @enderror" 
                                              id="content" name="content" rows="15" 
                                              placeholder="Tuliskan isi surat di sini"
                                              onkeyup="autoSave()">{{ old('content') }}</textarea>
                                </div>
                                <div class="position-absolute top-0 end-0 p-2">
                                    <small class="text-muted" id="autoSaveStatus">
                                        <i class="fas fa-save"></i> Auto-save aktif
                                    </small>
                                </div>
                            </div>
                            @error('content')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('correspondence.outgoing') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
let autoSaveTimeout;

function loadTemplate() {
    const templateId = document.getElementById('template_id').value;
    if (templateId) {
        // Load template via AJAX
        fetch(`{{ tenant_route('letters.templates.preview', '') }}/${templateId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('content').value = data.template_content;
                    // Show success message
                    const alert = document.createElement('div');
                    alert.className = 'alert alert-success alert-dismissible fade show mt-2';
                    alert.innerHTML = `
                        <i class="fas fa-check-circle me-2"></i>
                        Template berhasil dimuat!
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    document.querySelector('.card-body').insertBefore(alert, document.querySelector('.card-body').firstChild);
                    
                    // Auto remove alert after 3 seconds
                    setTimeout(() => {
                        if (alert.parentNode) {
                            alert.remove();
                        }
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Error loading template:', error);
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger alert-dismissible fade show mt-2';
                alert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Gagal memuat template!
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                document.querySelector('.card-body').insertBefore(alert, document.querySelector('.card-body').firstChild);
            });
    }
}

function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const content = document.getElementById('content').value;
        const status = document.getElementById('autoSaveStatus');
        
        // Save to localStorage
        localStorage.setItem('draft_outgoing_letter', content);
        
        // Update status
        status.innerHTML = '<i class="fas fa-check text-success"></i> Tersimpan';
        status.className = 'text-success';
        
        // Reset status after 2 seconds
        setTimeout(() => {
            status.innerHTML = '<i class="fas fa-save"></i> Auto-save aktif';
            status.className = 'text-muted';
        }, 2000);
    }, 2000); // Save after 2 seconds of inactivity
}

// Load draft on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedContent = localStorage.getItem('draft_outgoing_letter');
    if (savedContent) {
        document.getElementById('content').value = savedContent;
    }
});

// Clear draft on successful submit
document.querySelector('form').addEventListener('submit', function() {
    localStorage.removeItem('draft_outgoing_letter');
});

// File upload functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-light');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-light');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-light');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            document.getElementById('file').files = files;
            showFileInfo(file);
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        showFileInfo(file);
    }
}

function validateFile(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.');
        return false;
    }
    
    if (file.size > maxSize) {
        alert('Ukuran file terlalu besar. Maksimal 10MB.');
        return false;
    }
    
    return true;
}

function showFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').style.display = 'block';
}
</script>
@endsection
