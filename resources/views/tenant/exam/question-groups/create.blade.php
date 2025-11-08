@extends('layouts.tenant')

@section('title', 'Buat Kelompok Soal Baru')
@section('page-title', 'Buat Kelompok Soal Baru')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Buat Kelompok Soal Baru
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('question-groups.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Judul Stimulus <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                           id="title" name="title" value="{{ old('title') }}" 
                                           placeholder="Contoh: Teks Cerita Pendek" required>
                                    @error('title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                    <select class="form-select @error('subject_id') is-invalid @enderror" 
                                            id="subject_id" name="subject_id" required>
                                        <option value="">Pilih Mata Pelajaran</option>
                                        @foreach($subjects as $subject)
                                            <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
                                                {{ $subject->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('subject_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="description" class="form-label">Deskripsi</label>
                                    <textarea class="form-control @error('description') is-invalid @enderror" 
                                              id="description" name="description" rows="3" 
                                              placeholder="Deskripsi singkat tentang stimulus">{{ old('description') }}</textarea>
                                    @error('description')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="stimulus_type" class="form-label">Tipe Stimulus <span class="text-danger">*</span></label>
                                    <select class="form-select @error('stimulus_type') is-invalid @enderror" 
                                            id="stimulus_type" name="stimulus_type" required>
                                        <option value="">Pilih Tipe Stimulus</option>
                                        <option value="text" {{ old('stimulus_type') == 'text' ? 'selected' : '' }}>Teks</option>
                                        <option value="image" {{ old('stimulus_type') == 'image' ? 'selected' : '' }}>Gambar</option>
                                        <option value="table" {{ old('stimulus_type') == 'table' ? 'selected' : '' }}>Tabel</option>
                                    </select>
                                    @error('stimulus_type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <!-- Stimulus Content based on type -->
                                <div id="stimulus-content-container">
                                    <!-- Text Content -->
                                    <div id="text-content" class="stimulus-content" style="display: none;">
                                        <div class="mb-3">
                                            <label for="stimulus_content_text" class="form-label">Konten Teks <span class="text-danger">*</span></label>
                                            <textarea class="form-control @error('stimulus_content') is-invalid @enderror" 
                                                      id="stimulus_content_text" name="stimulus_content" rows="8" 
                                                      placeholder="Masukkan teks stimulus di sini...">{{ old('stimulus_content') }}</textarea>
                                            @error('stimulus_content')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>

                                    <!-- Image Content -->
                                    <div id="image-content" class="stimulus-content" style="display: none;">
                                        <div class="mb-3">
                                            <label for="stimulus_content_image" class="form-label">URL Gambar <span class="text-danger">*</span></label>
                                            <input type="url" class="form-control @error('stimulus_content') is-invalid @enderror" 
                                                   id="stimulus_content_image" name="stimulus_content" 
                                                   placeholder="https://example.com/image.jpg" value="{{ old('stimulus_content') }}">
                                            @error('stimulus_content')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Masukkan URL gambar yang dapat diakses publik</div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="image_preview" class="form-label">Preview Gambar</label>
                                            <div id="image_preview" class="border rounded p-3 text-center" style="min-height: 200px; display: none;">
                                                <img id="preview_img" src="" alt="Preview" class="img-fluid" style="max-height: 300px;">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Table Content -->
                                    <div id="table-content" class="stimulus-content" style="display: none;">
                                        <div class="mb-3">
                                            <label class="form-label">Data Tabel <span class="text-danger">*</span></label>
                                            <div class="table-builder">
                                                <div class="mb-3">
                                                    <label for="table_headers" class="form-label">Header Tabel</label>
                                                    <input type="text" class="form-control" id="table_headers" 
                                                           placeholder="Kolom 1, Kolom 2, Kolom 3" 
                                                           value="{{ old('table_headers', 'Nama, Usia, Kota') }}">
                                                    <div class="form-text">Pisahkan header dengan koma (,)</div>
                                                </div>
                                                <div class="mb-3">
                                                    <label for="table_rows" class="form-label">Baris Data</label>
                                                    <textarea class="form-control" id="table_rows" rows="5" 
                                                              placeholder="Data 1, Data 2, Data 3&#10;Data 4, Data 5, Data 6">{{ old('table_rows', 'John, 25, Jakarta\nJane, 30, Bandung') }}</textarea>
                                                    <div class="form-text">Setiap baris data dipisahkan dengan baris baru, setiap kolom dipisahkan dengan koma (,)</div>
                                                </div>
                                                <div class="mb-3">
                                                    <button type="button" class="btn btn-outline-primary" onclick="previewTable()">
                                                        <i class="fas fa-eye me-1"></i>
                                                        Preview Tabel
                                                    </button>
                                                </div>
                                                <div id="table_preview" class="mb-3" style="display: none;">
                                                    <label class="form-label">Preview Tabel</label>
                                                    <div class="table-responsive">
                                                        <table class="table table-bordered" id="preview_table">
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="hidden" name="stimulus_content" id="stimulus_content_table" value="{{ old('stimulus_content') }}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-header">
                                        <h6 class="mb-0">
                                            <i class="fas fa-info-circle me-1"></i>
                                            Informasi Stimulus
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="alert alert-info">
                                            <h6 class="alert-heading">Tipe Stimulus</h6>
                                            <ul class="mb-0">
                                                <li><strong>Teks:</strong> Untuk cerita, artikel, atau teks panjang</li>
                                                <li><strong>Gambar:</strong> Untuk diagram, grafik, atau foto</li>
                                                <li><strong>Tabel:</strong> Untuk data dalam format tabel</li>
                                            </ul>
                                        </div>

                                        <div class="alert alert-warning">
                                            <h6 class="alert-heading">Tips</h6>
                                            <ul class="mb-0">
                                                <li>Pastikan stimulus jelas dan mudah dipahami</li>
                                                <li>Gunakan bahasa yang sesuai dengan tingkat siswa</li>
                                                <li>Stimulus akan ditampilkan di atas semua soal dalam kelompok</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('question-groups.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Buat Kelompok Soal
                            </button>
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
    document.addEventListener('DOMContentLoaded', function() {
        const stimulusTypeSelect = document.getElementById('stimulus_type');
        const stimulusContentContainer = document.getElementById('stimulus-content-container');
        
        // Show/hide stimulus content based on type
        function toggleStimulusContent() {
            const selectedType = stimulusTypeSelect.value;
            const contentDivs = stimulusContentContainer.querySelectorAll('.stimulus-content');
            
            contentDivs.forEach(div => {
                div.style.display = 'none';
            });
            
            if (selectedType) {
                const targetDiv = document.getElementById(selectedType + '-content');
                if (targetDiv) {
                    targetDiv.style.display = 'block';
                }
            }
        }
        
        stimulusTypeSelect.addEventListener('change', toggleStimulusContent);
        
        // Initialize on page load
        toggleStimulusContent();
        
        // Image preview functionality
        const imageInput = document.getElementById('stimulus_content_image');
        const imagePreview = document.getElementById('image_preview');
        const previewImg = document.getElementById('preview_img');
        
        imageInput.addEventListener('input', function() {
            const url = this.value;
            if (url) {
                previewImg.src = url;
                previewImg.onload = function() {
                    imagePreview.style.display = 'block';
                };
                previewImg.onerror = function() {
                    imagePreview.style.display = 'none';
                };
            } else {
                imagePreview.style.display = 'none';
            }
        });
    });
    
    function previewTable() {
        const headers = document.getElementById('table_headers').value.split(',').map(h => h.trim());
        const rowsText = document.getElementById('table_rows').value;
        const rows = rowsText.split('\n').map(row => 
            row.split(',').map(cell => cell.trim())
        );
        
        const previewTable = document.getElementById('preview_table');
        previewTable.innerHTML = '';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        previewTable.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        rows.forEach(row => {
            if (row.length > 0 && row[0] !== '') {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
        });
        previewTable.appendChild(tbody);
        
        // Show preview
        document.getElementById('table_preview').style.display = 'block';
        
        // Update hidden input with JSON data
        const tableData = {
            headers: headers,
            rows: rows.filter(row => row.length > 0 && row[0] !== '')
        };
        document.getElementById('stimulus_content_table').value = JSON.stringify(tableData);
    }
    
    // Form submission handler
    document.querySelector('form').addEventListener('submit', function(e) {
        const stimulusType = document.getElementById('stimulus_type').value;
        let stimulusContent = '';
        
        switch(stimulusType) {
            case 'text':
                stimulusContent = document.getElementById('stimulus_content_text').value;
                break;
            case 'image':
                stimulusContent = document.getElementById('stimulus_content_image').value;
                break;
            case 'table':
                stimulusContent = document.getElementById('stimulus_content_table').value;
                break;
        }
        
        // Update the main stimulus_content input
        document.querySelector('input[name="stimulus_content"]').value = stimulusContent;
    });
</script>
@endpush
