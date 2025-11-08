@extends('layouts.tenant')

@section('title', 'Tambah Buku')
@section('page-title', 'Tambah Data Buku')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-book me-3"></i>
                Tambah Data Buku
            </h2>
            <p>Lengkapi form di bawah ini untuk menambahkan buku baru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('library.books') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Tambah Buku
        </h5>
    </div>
    <form action="{{ tenant_route('library.store-book') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="title">Judul Buku <span class="text-danger">*</span></label>
                                <input type="text" name="title" id="title" class="form-control @error('title') is-invalid @enderror" 
                                       value="{{ old('title') }}" placeholder="Masukkan judul buku" required>
                                @error('title')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="author">Penulis <span class="text-danger">*</span></label>
                                <input type="text" name="author" id="author" class="form-control @error('author') is-invalid @enderror" 
                                       value="{{ old('author') }}" placeholder="Masukkan nama penulis" required>
                                @error('author')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="isbn">ISBN</label>
                                <input type="text" name="isbn" id="isbn" class="form-control @error('isbn') is-invalid @enderror" 
                                       value="{{ old('isbn') }}" placeholder="Masukkan ISBN (opsional)">
                                @error('isbn')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="publisher">Penerbit <span class="text-danger">*</span></label>
                                <input type="text" name="publisher" id="publisher" class="form-control @error('publisher') is-invalid @enderror" 
                                       value="{{ old('publisher') }}" placeholder="Masukkan nama penerbit" required>
                                @error('publisher')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="year">Tahun Terbit <span class="text-danger">*</span></label>
                                <input type="number" name="year" id="year" class="form-control @error('year') is-invalid @enderror" 
                                       value="{{ old('year') }}" placeholder="Tahun terbit" min="1900" max="{{ date('Y') }}" required>
                                @error('year')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="category">Kategori <span class="text-danger">*</span></label>
                                <select name="category" id="category" class="form-control @error('category') is-invalid @enderror" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="Fiksi" {{ old('category') == 'Fiksi' ? 'selected' : '' }}>Fiksi</option>
                                    <option value="Non-Fiksi" {{ old('category') == 'Non-Fiksi' ? 'selected' : '' }}>Non-Fiksi</option>
                                    <option value="Pelajaran" {{ old('category') == 'Pelajaran' ? 'selected' : '' }}>Pelajaran</option>
                                    <option value="Referensi" {{ old('category') == 'Referensi' ? 'selected' : '' }}>Referensi</option>
                                    <option value="Novel" {{ old('category') == 'Novel' ? 'selected' : '' }}>Novel</option>
                                    <option value="Biografi" {{ old('category') == 'Biografi' ? 'selected' : '' }}>Biografi</option>
                                    <option value="Ensiklopedia" {{ old('category') == 'Ensiklopedia' ? 'selected' : '' }}>Ensiklopedia</option>
                                    <option value="Lainnya" {{ old('category') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="total_copies">Total Eksemplar <span class="text-danger">*</span></label>
                                <input type="number" name="total_copies" id="total_copies" class="form-control @error('total_copies') is-invalid @enderror" 
                                       value="{{ old('total_copies', 1) }}" placeholder="Jumlah eksemplar" min="1" required>
                                @error('total_copies')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="available_copies">Eksemplar Tersedia <span class="text-danger">*</span></label>
                                <input type="number" name="available_copies" id="available_copies" class="form-control @error('available_copies') is-invalid @enderror" 
                                       value="{{ old('available_copies', 1) }}" placeholder="Jumlah tersedia" min="0" required>
                                @error('available_copies')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Deskripsi</label>
                        <textarea name="description" id="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan deskripsi buku (opsional)">{{ old('description') }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Online Library Section -->
                    <div class="card mt-3">
                        <div class="card-header bg-info">
                            <h5 class="card-title mb-0 text-white">
                                <i class="fas fa-book-reader"></i> Perpustakaan Online
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" id="is_online" name="is_online" value="1" 
                                           {{ old('is_online') ? 'checked' : '' }} onchange="toggleOnlineFields()">
                                    <label class="custom-control-label" for="is_online">
                                        Aktifkan sebagai Buku Online
                                    </label>
                                </div>
                                <small class="form-text text-muted">
                                    Centang untuk membuat buku tersedia di perpustakaan online
                                </small>
                            </div>

                            <div id="onlineFields" style="display: none;">
                                <div class="form-group">
                                    <label for="pdf_file">Upload File PDF <span class="text-danger">*</span></label>
                                    <input type="file" name="pdf_file" id="pdf_file" 
                                           class="form-control-file @error('pdf_file') is-invalid @enderror" 
                                           accept=".pdf" onchange="checkFileSize(this)">
                                    <small class="form-text text-muted">
                                        Maksimal 100MB. Format: PDF
                                    </small>
                                    @error('pdf_file')
                                        <div class="invalid-feedback d-block">{{ $message }}</div>
                                    @enderror
                                    <div id="fileInfo" class="mt-2"></div>
                                </div>

                                <div class="form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="is_public" name="is_public" value="1" 
                                               {{ old('is_public') ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="is_public">
                                            Buku Publik (Dapat dibaca tanpa login)
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="allow_download" name="allow_download" value="1" 
                                               {{ old('allow_download') ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="allow_download">
                                            Izinkan Download PDF
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="published_at">Tanggal Publikasi</label>
                                    <input type="date" name="published_at" id="published_at" 
                                           class="form-control @error('published_at') is-invalid @enderror" 
                                           value="{{ old('published_at') }}">
                                    <small class="form-text text-muted">
                                        Kosongkan untuk menggunakan tanggal saat ini
                                    </small>
                                    @error('published_at')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-light p-4">
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('library.books') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-times me-2"></i> Batal
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i> Simpan
                        </button>
                    </div>
                </div>
            </form>
        </div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Set available copies equal to total copies by default
    $('#total_copies').change(function() {
        const total = $(this).val();
        if (total && !$('#available_copies').val()) {
            $('#available_copies').val(total);
        }
    });
    
    // Validate available copies not exceed total copies
    $('#available_copies').change(function() {
        const available = parseInt($(this).val());
        const total = parseInt($('#total_copies').val());
        if (available > total) {
            alert('Eksemplar tersedia tidak boleh melebihi total eksemplar');
            $(this).val(total);
        }
    });

    // Initialize online fields visibility
    toggleOnlineFields();
});

function toggleOnlineFields() {
    const isOnline = document.getElementById('is_online').checked;
    const onlineFields = document.getElementById('onlineFields');
    
    if (isOnline) {
        onlineFields.style.display = 'block';
        document.getElementById('pdf_file').required = true;
    } else {
        onlineFields.style.display = 'none';
        document.getElementById('pdf_file').required = false;
    }
}

function checkFileSize(input) {
    const file = input.files[0];
    const fileInfo = document.getElementById('fileInfo');
    
    if (file) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const fileSize = file.size;
        
        if (fileSize > maxSize) {
            fileInfo.innerHTML = '<div class="alert alert-danger">File terlalu besar. Maksimal 100MB</div>';
            input.value = '';
        } else {
            const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
            fileInfo.innerHTML = `<div class="alert alert-success">
                <i class="fas fa-check-circle"></i> File: ${file.name}<br>
                Ukuran: ${sizeInMB} MB
            </div>`;
        }
    }
}
</script>
@endpush
