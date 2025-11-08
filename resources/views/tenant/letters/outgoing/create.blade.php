@extends('layouts.tenant')

@section('title', 'Tambah Surat Keluar')

@section('styles')
<link href="https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.snow.css" rel="stylesheet">
<style>
.ql-editor {
    min-height: 200px;
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
                            <i class="fas fa-plus me-2"></i>
                            Tambah Surat Keluar
                        </h3>
                        <a href="{{ tenant_route('letters.outgoing.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Kembali
                        </a>
                    </div>
                </div>
                <form action="{{ tenant_route('letters.outgoing.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="jenis_surat">Jenis Surat <span class="text-danger">*</span></label>
                                    <select class="form-control @error('jenis_surat') is-invalid @enderror" 
                                            id="jenis_surat" name="jenis_surat" required>
                                        <option value="">Pilih Jenis Surat</option>
                                        @foreach($jenisSuratOptions as $key => $jenis)
                                            <option value="{{ $key }}" {{ old('jenis_surat') == $key ? 'selected' : '' }}>
                                                {{ $jenis }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('jenis_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="tanggal_surat">Tanggal Surat <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('tanggal_surat') is-invalid @enderror" 
                                           id="tanggal_surat" name="tanggal_surat" value="{{ old('tanggal_surat', date('Y-m-d')) }}" required>
                                    @error('tanggal_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <!-- Nomor Surat Otomatis -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nomor_surat">Nomor Surat</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control @error('nomor_surat') is-invalid @enderror" 
                                               id="nomor_surat" name="nomor_surat" value="{{ old('nomor_surat') }}" readonly>
                                        <button type="button" class="btn btn-outline-primary" onclick="previewNomorSurat()">
                                            <i class="fas fa-eye me-1"></i> Preview
                                        </button>
                                    </div>
                                    @error('nomor_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">
                                        Nomor surat akan di-generate otomatis berdasarkan pengaturan format.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="template_id">Template Surat (Opsional)</label>
                                    <select class="form-control @error('template_id') is-invalid @enderror" 
                                            id="template_id" name="template_id">
                                        <option value="">Pilih Template</option>
                                        @foreach($templates as $template)
                                            <option value="{{ $template->id }}" {{ old('template_id') == $template->id ? 'selected' : '' }}>
                                                {{ $template->title }}
                                                @if($template->category)
                                                    ({{ $template->category }})
                                                @endif
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('template_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="tujuan">Tujuan <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('tujuan') is-invalid @enderror" 
                                           id="tujuan" name="tujuan" value="{{ old('tujuan') }}" required>
                                    @error('tujuan')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="status">Status <span class="text-danger">*</span></label>
                                    <select class="form-control @error('status') is-invalid @enderror" id="status" name="status" required>
                                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                        <option value="menunggu_ttd" {{ old('status') == 'menunggu_ttd' ? 'selected' : '' }}>Menunggu TTD</option>
                                        <option value="terkirim" {{ old('status') == 'terkirim' ? 'selected' : '' }}>Terkirim</option>
                                        <option value="arsip" {{ old('status') == 'arsip' ? 'selected' : '' }}>Arsip</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="perihal">Perihal <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('perihal') is-invalid @enderror" 
                                   id="perihal" name="perihal" value="{{ old('perihal') }}" required>
                            @error('perihal')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="isi_surat">Isi Surat <span class="text-danger">*</span></label>
                            <textarea class="form-control @error('isi_surat') is-invalid @enderror" 
                                      id="isi_surat" name="isi_surat" rows="10" required>{{ old('isi_surat') }}</textarea>
                            @error('isi_surat')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="prioritas">Prioritas</label>
                                    <select class="form-control @error('prioritas') is-invalid @enderror" id="prioritas" name="prioritas">
                                        <option value="">Pilih Prioritas</option>
                                        @foreach(\App\Models\Tenant\OutgoingLetter::getPrioritasOptions() as $value => $label)
                                            <option value="{{ $value }}" {{ old('prioritas') == $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('prioritas')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="sifat_surat">Sifat Surat</label>
                                    <select class="form-control @error('sifat_surat') is-invalid @enderror" id="sifat_surat" name="sifat_surat">
                                        <option value="">Pilih Sifat Surat</option>
                                        @foreach(\App\Models\Tenant\OutgoingLetter::getSifatSuratOptions() as $value => $label)
                                            <option value="{{ $value }}" {{ old('sifat_surat') == $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('sifat_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="isi_ringkas">Isi Ringkas</label>
                            <textarea class="form-control @error('isi_ringkas') is-invalid @enderror" 
                                      id="isi_ringkas" name="isi_ringkas" rows="3" placeholder="Ringkasan isi surat">{{ old('isi_ringkas') }}</textarea>
                            @error('isi_ringkas')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="tindak_lanjut">Tindak Lanjut</label>
                            <textarea class="form-control @error('tindak_lanjut') is-invalid @enderror" 
                                      id="tindak_lanjut" name="tindak_lanjut" rows="3" placeholder="Tindak lanjut yang diperlukan">{{ old('tindak_lanjut') }}</textarea>
                            @error('tindak_lanjut')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="pengirim">Pengirim</label>
                            <input type="text" class="form-control @error('pengirim') is-invalid @enderror" 
                                   id="pengirim" name="pengirim" value="{{ old('pengirim') }}" placeholder="Nama pengirim surat">
                            @error('pengirim')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="tanggal_kirim">Tanggal Kirim</label>
                            <input type="date" class="form-control @error('tanggal_kirim') is-invalid @enderror" 
                                   id="tanggal_kirim" name="tanggal_kirim" value="{{ old('tanggal_kirim') }}">
                            @error('tanggal_kirim')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="file_path">File Surat</label>
                            <input type="file" class="form-control @error('file_path') is-invalid @enderror" 
                                   id="file_path" name="file_path" accept=".pdf,.doc,.docx">
                            <small class="form-text text-muted">Format yang diperbolehkan: PDF, DOC, DOCX (Maksimal 10MB)</small>
                            @error('file_path')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Nomor Surat Preview -->
                        <div class="form-group">
                            <label>Nomor Surat (Otomatis)</label>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> 
                                Nomor surat akan dihasilkan otomatis berdasarkan pengaturan nomor surat untuk jenis surat yang dipilih.
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Simpan
                        </button>
                        <a href="{{ tenant_route('letters.outgoing.index') }}" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Batal
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/quill@1.3.6/dist/quill.min.js"></script>
<script>
let quill;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill editor for isi_ringkas if needed
    const isiRingkasElement = document.getElementById('isi_ringkas');
    if (isiRingkasElement) {
        quill = new Quill('#isi_ringkas', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }

    // Auto preview nomor surat on page load
    previewNomorSurat();
    
    // Handle template selection
    document.getElementById('template_id').addEventListener('change', function() {
        if (this.value) {
            loadTemplate(this.value);
        }
    });
});

function previewNomorSurat() {
    fetch('{{ tenant_route("letters.outgoing.preview-nomor") }}')
        .then(response => response.json())
        .then(data => {
            if (data.preview) {
                document.getElementById('nomor_surat').value = data.preview;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadTemplate(templateId) {
    fetch('{{ tenant_route("letters.templates.variables", ":id") }}'.replace(':id', templateId))
        .then(response => response.json())
        .then(data => {
            if (data.variables && data.variables.length > 0) {
                showTemplateVariables(data.variables);
            }
        })
        .catch(error => {
            console.error('Error loading template variables:', error);
        });
}

function showTemplateVariables(variables) {
    // Create modal or form section for template variables
    let variablesHtml = '<div class="card mt-3"><div class="card-header"><h6>Variabel Template</h6></div><div class="card-body">';
    
    variables.forEach(variable => {
        variablesHtml += `
            <div class="form-group mb-2">
                <label for="var_${variable}">${variable}:</label>
                <input type="text" class="form-control" id="var_${variable}" name="template_variables[${variable}]" placeholder="Masukkan nilai untuk ${variable}">
            </div>
        `;
    });
    
    variablesHtml += '</div></div>';
    
    // Insert before file upload section
    const fileSection = document.querySelector('input[name="file_path"]').closest('.form-group');
    fileSection.insertAdjacentHTML('beforebegin', variablesHtml);
}

function processTemplate() {
    const templateId = document.getElementById('template_id').value;
    if (!templateId) return;
    
    const variables = {};
    const templateInputs = document.querySelectorAll('input[name^="template_variables"]');
    templateInputs.forEach(input => {
        const varName = input.name.match(/\[(.+)\]/)[1];
        variables[varName] = input.value;
    });
    
    fetch('{{ tenant_route("letters.outgoing.process-template") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            template_id: templateId,
            variables: variables
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            // Update isi_ringkas with processed template content
            if (quill) {
                quill.root.innerHTML = data.content;
            } else {
                document.getElementById('isi_ringkas').value = data.content;
            }
        }
    })
    .catch(error => {
        console.error('Error processing template:', error);
    });
}
</script>
@endsection
