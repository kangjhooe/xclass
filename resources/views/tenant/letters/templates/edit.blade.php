@extends('layouts.tenant')

@section('title', 'Edit Template Surat')

@section('styles')
<link href="https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.snow.css" rel="stylesheet">
<style>
.ql-editor {
    min-height: 300px;
}
.variable-tag {
    display: inline-block;
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    margin: 2px;
    cursor: pointer;
}
.variable-tag:hover {
    background: #bbdefb;
}
</style>
@endsection

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-edit me-2"></i>
                            Edit Template Surat
                        </h3>
                        <a href="{{ tenant_route('letters.templates.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ tenant_route('letters.templates.update', $letterTemplate) }}" id="templateForm">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Judul Template <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                           id="title" name="title" value="{{ old('title', $letterTemplate->title) }}"
                                           placeholder="Contoh: Surat Undangan Rapat">
                                    @error('title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="category" class="form-label">Kategori</label>
                                            <select class="form-select @error('category') is-invalid @enderror" 
                                                    id="category" name="category">
                                                <option value="">Pilih Kategori</option>
                                                @foreach($categories as $key => $label)
                                                    <option value="{{ $key }}" {{ old('category', $letterTemplate->category) == $key ? 'selected' : '' }}>
                                                        {{ $label }}
                                                    </option>
                                                @endforeach
                                            </select>
                                            @error('category')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <div class="form-check mt-4">
                                                <input class="form-check-input" type="checkbox" id="is_active" name="is_active" 
                                                       value="1" {{ old('is_active', $letterTemplate->is_active) ? 'checked' : '' }}>
                                                <label class="form-check-label" for="is_active">
                                                    Template Aktif
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="description" class="form-label">Deskripsi</label>
                                    <textarea class="form-control @error('description') is-invalid @enderror" 
                                              id="description" name="description" rows="3"
                                              placeholder="Deskripsi singkat tentang template ini">{{ old('description', $letterTemplate->description) }}</textarea>
                                    @error('description')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="content" class="form-label">Isi Template <span class="text-danger">*</span></label>
                                    <div id="editor" style="height: 400px;"></div>
                                    <textarea name="content" id="content" style="display: none;">{{ old('content', $letterTemplate->content) }}</textarea>
                                    @error('content')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Variabel yang Digunakan</label>
                                    <div id="selected-variables" class="border p-3 rounded" style="min-height: 50px;">
                                        <small class="text-muted">Klik variabel di panel kanan untuk menambahkannya</small>
                                    </div>
                                    <input type="hidden" name="variables_json" id="variables_json" value="{{ old('variables_json', json_encode($letterTemplate->getAvailableVariables())) }}">
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Variabel yang Tersedia</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <h6 class="text-primary">Variabel Umum</h6>
                                            @foreach($defaultVariables as $key => $desc)
                                                <div class="variable-tag" onclick="addVariable('{{ $key }}', '{{ $desc }}')">
                                                    <code>{{ $key }}</code>
                                                </div>
                                            @endforeach
                                        </div>
                                        
                                        <div class="mb-3">
                                            <h6 class="text-success">Variabel Kustom</h6>
                                            <div class="input-group input-group-sm">
                                                <input type="text" class="form-control" id="custom-var-name" placeholder="nama_variabel">
                                                <button type="button" class="btn btn-outline-primary" onclick="addCustomVariable()">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Preview Template</h6>
                                    </div>
                                    <div class="card-body">
                                        <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="previewTemplate()">
                                            <i class="fas fa-eye me-1"></i> Preview
                                        </button>
                                        <div id="preview-result" class="mt-3" style="display: none;">
                                            <!-- Preview content will be loaded here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Update Template
                            </button>
                            <a href="{{ tenant_route('letters.templates.show', $letterTemplate) }}" class="btn btn-info">
                                <i class="fas fa-eye me-1"></i> Lihat
                            </a>
                            <a href="{{ tenant_route('letters.templates.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i> Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.min.js"></script>
<script>
let quill;
let selectedVariables = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        }
    });

    // Load existing content
    const existingContent = document.getElementById('content').value;
    if (existingContent) {
        quill.root.innerHTML = existingContent;
    }

    // Update hidden textarea when editor content changes
    quill.on('text-change', function() {
        document.getElementById('content').value = quill.root.innerHTML;
    });

    // Load existing variables
    const existingVariables = JSON.parse(document.getElementById('variables_json').value);
    selectedVariables = existingVariables.map(key => ({
        key: key,
        description: '{{ $defaultVariables }}'.includes(key) ? '{{ $defaultVariables[key] ?? "Variabel kustom" }}' : 'Variabel kustom'
    }));
    updateSelectedVariablesDisplay();
});

function addVariable(key, description) {
    if (!selectedVariables.find(v => v.key === key)) {
        selectedVariables.push({ key: key, description: description });
        updateSelectedVariablesDisplay();
        updateVariablesJson();
    }
}

function addCustomVariable() {
    const customVarName = document.getElementById('custom-var-name').value.trim();
    if (customVarName && !selectedVariables.find(v => v.key === customVarName)) {
        selectedVariables.push({ 
            key: customVarName, 
            description: 'Variabel kustom: ' + customVarName 
        });
        updateSelectedVariablesDisplay();
        updateVariablesJson();
        document.getElementById('custom-var-name').value = '';
    }
}

function removeVariable(key) {
    selectedVariables = selectedVariables.filter(v => v.key !== key);
    updateSelectedVariablesDisplay();
    updateVariablesJson();
}

function updateSelectedVariablesDisplay() {
    const container = document.getElementById('selected-variables');
    if (selectedVariables.length === 0) {
        container.innerHTML = '<small class="text-muted">Klik variabel di panel kanan untuk menambahkannya</small>';
        return;
    }

    let html = '';
    selectedVariables.forEach(variable => {
        html += `
            <span class="badge bg-primary me-1 mb-1">
                <code>${variable.key}</code>
                <i class="fas fa-times ms-1" onclick="removeVariable('${variable.key}')" style="cursor: pointer;"></i>
            </span>
        `;
    });
    container.innerHTML = html;
}

function updateVariablesJson() {
    const variables = selectedVariables.map(v => v.key);
    document.getElementById('variables_json').value = JSON.stringify(variables);
}

function previewTemplate() {
    const content = quill.root.innerHTML;
    const variables = selectedVariables.map(v => v.key);
    
    if (!content.trim()) {
        alert('Template kosong. Silakan isi template terlebih dahulu.');
        return;
    }

    // Show preview result
    const previewResult = document.getElementById('preview-result');
    previewResult.style.display = 'block';
    previewResult.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-1"></i>
            Memproses preview...
        </div>
    `;

    // Send AJAX request to preview
    fetch('{{ route("tenant.letters.templates.preview", $letterTemplate) }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            content: content,
            variables: variables
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            previewResult.innerHTML = `
                <div class="border p-3 rounded" style="background: #f8f9fa;">
                    <h6>Preview Template:</h6>
                    <div style="white-space: pre-wrap; font-family: monospace;">${data.content}</div>
                </div>
            `;
        } else {
            previewResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Error: ${data.error || 'Gagal memproses preview'}
                </div>
            `;
        }
    })
    .catch(error => {
        previewResult.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Error: Gagal memproses preview
            </div>
        `;
    });
}

// Form submission
document.getElementById('templateForm').addEventListener('submit', function(e) {
    // Update content before submit
    document.getElementById('content').value = quill.root.innerHTML;
    
    // Validate required fields
    if (!document.getElementById('title').value.trim()) {
        e.preventDefault();
        alert('Judul template harus diisi.');
        return;
    }
    
    if (!quill.getText().trim()) {
        e.preventDefault();
        alert('Isi template harus diisi.');
        return;
    }
});
</script>
@endsection