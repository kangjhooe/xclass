@extends('layouts.tenant')

@section('title', 'Edit Buku')
@section('page-title', 'Edit Data Buku')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Edit Data Buku</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.show-book', $book->id) }}" class="btn btn-info btn-sm">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </a>
                    <a href="{{ tenant_route('library.books') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('library.update-book', $book->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="title">Judul Buku <span class="text-danger">*</span></label>
                                <input type="text" name="title" id="title" class="form-control @error('title') is-invalid @enderror" 
                                       value="{{ old('title', $book->title) }}" required>
                                @error('title')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="author">Penulis <span class="text-danger">*</span></label>
                                <input type="text" name="author" id="author" class="form-control @error('author') is-invalid @enderror" 
                                       value="{{ old('author', $book->author) }}" required>
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
                                       value="{{ old('isbn', $book->isbn) }}">
                                @error('isbn')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="publisher">Penerbit <span class="text-danger">*</span></label>
                                <input type="text" name="publisher" id="publisher" class="form-control @error('publisher') is-invalid @enderror" 
                                       value="{{ old('publisher', $book->publisher) }}" required>
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
                                       value="{{ old('year', $book->publication_year) }}" min="1900" max="{{ date('Y') }}" required>
                                @error('year')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="category">Kategori <span class="text-danger">*</span></label>
                                <input type="text" name="category" id="category" class="form-control @error('category') is-invalid @enderror" 
                                       value="{{ old('category', $book->category) }}" required>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="language">Bahasa</label>
                                <select name="language" id="language" class="form-control">
                                    <option value="id" {{ old('language', $book->language) == 'id' ? 'selected' : '' }}>Indonesia</option>
                                    <option value="en" {{ old('language', $book->language) == 'en' ? 'selected' : '' }}>English</option>
                                    <option value="ar" {{ old('language', $book->language) == 'ar' ? 'selected' : '' }}>Arabic</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="total_copies">Total Eksemplar <span class="text-danger">*</span></label>
                                <input type="number" name="total_copies" id="total_copies" class="form-control @error('total_copies') is-invalid @enderror" 
                                       value="{{ old('total_copies', $book->total_copies) }}" min="1" required>
                                @error('total_copies')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="available_copies">Eksemplar Tersedia <span class="text-danger">*</span></label>
                                <input type="number" name="available_copies" id="available_copies" class="form-control @error('available_copies') is-invalid @enderror" 
                                       value="{{ old('available_copies', $book->available_copies) }}" min="0" required>
                                @error('available_copies')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="status">Status <span class="text-danger">*</span></label>
                                <select name="status" id="status" class="form-control @error('status') is-invalid @enderror" required>
                                    <option value="available" {{ old('status', $book->status) == 'available' ? 'selected' : '' }}>Tersedia</option>
                                    <option value="unavailable" {{ old('status', $book->status) == 'unavailable' ? 'selected' : '' }}>Tidak Tersedia</option>
                                    <option value="maintenance" {{ old('status', $book->status) == 'maintenance' ? 'selected' : '' }}>Perawatan</option>
                                    <option value="lost" {{ old('status', $book->status) == 'lost' ? 'selected' : '' }}>Hilang</option>
                                    <option value="damaged" {{ old('status', $book->status) == 'damaged' ? 'selected' : '' }}>Rusak</option>
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="condition">Kondisi</label>
                                <select name="condition" id="condition" class="form-control">
                                    <option value="">Pilih Kondisi</option>
                                    <option value="excellent" {{ old('condition', $book->condition) == 'excellent' ? 'selected' : '' }}>Sangat Baik</option>
                                    <option value="good" {{ old('condition', $book->condition) == 'good' ? 'selected' : '' }}>Baik</option>
                                    <option value="fair" {{ old('condition', $book->condition) == 'fair' ? 'selected' : '' }}>Cukup</option>
                                    <option value="poor" {{ old('condition', $book->condition) == 'poor' ? 'selected' : '' }}>Buruk</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="location">Lokasi</label>
                                <input type="text" name="location" id="location" class="form-control" 
                                       value="{{ old('location', $book->location) }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="shelf_number">Nomor Rak</label>
                                <input type="text" name="shelf_number" id="shelf_number" class="form-control" 
                                       value="{{ old('shelf_number', $book->shelf_number) }}">
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="pages">Jumlah Halaman</label>
                                <input type="number" name="pages" id="pages" class="form-control" 
                                       value="{{ old('pages', $book->pages) }}" min="1">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="price">Harga</label>
                                <input type="number" name="price" id="price" class="form-control" 
                                       value="{{ old('price', $book->price) }}" min="0" step="0.01">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="purchase_date">Tanggal Pembelian</label>
                                <input type="date" name="purchase_date" id="purchase_date" class="form-control" 
                                       value="{{ old('purchase_date', $book->purchase_date ? $book->purchase_date->format('Y-m-d') : '') }}">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="description">Deskripsi</label>
                        <textarea name="description" id="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="3">{{ old('description', $book->description) }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control" rows="3">{{ old('notes', $book->notes) }}</textarea>
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
                                           {{ old('is_online', $book->is_online) ? 'checked' : '' }} onchange="toggleOnlineFields()">
                                    <label class="custom-control-label" for="is_online">
                                        Aktifkan sebagai Buku Online
                                    </label>
                                </div>
                                <small class="form-text text-muted">
                                    Centang untuk membuat buku tersedia di perpustakaan online
                                </small>
                            </div>

                            <div id="onlineFields" style="display: {{ old('is_online', $book->is_online) ? 'block' : 'none' }};">
                                @if($book->pdf_file)
                                <div class="alert alert-info">
                                    <i class="fas fa-file-pdf"></i> File PDF saat ini: 
                                    <strong>{{ $book->pdf_file_name }}</strong> 
                                    ({{ $book->formatted_file_size }})
                                    <br>
                                    <small>Upload file baru untuk mengganti PDF yang ada</small>
                                </div>
                                @endif

                                <div class="form-group">
                                    <label for="pdf_file">Upload File PDF {{ $book->pdf_file ? '' : '*' }}</label>
                                    <input type="file" name="pdf_file" id="pdf_file" 
                                           class="form-control-file @error('pdf_file') is-invalid @enderror" 
                                           accept=".pdf" onchange="checkFileSize(this)">
                                    <small class="form-text text-muted">
                                        Maksimal 100MB. Format: PDF
                                        @if($book->pdf_file)
                                        <br>Kosongkan jika tidak ingin mengganti file PDF yang ada
                                        @endif
                                    </small>
                                    @error('pdf_file')
                                        <div class="invalid-feedback d-block">{{ $message }}</div>
                                    @enderror
                                    <div id="fileInfo" class="mt-2"></div>
                                </div>

                                <div class="form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="is_public" name="is_public" value="1" 
                                               {{ old('is_public', $book->is_public) ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="is_public">
                                            Buku Publik (Dapat dibaca tanpa login)
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="allow_download" name="allow_download" value="1" 
                                               {{ old('allow_download', $book->allow_download) ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="allow_download">
                                            Izinkan Download PDF
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="published_at">Tanggal Publikasi</label>
                                    <input type="date" name="published_at" id="published_at" 
                                           class="form-control @error('published_at') is-invalid @enderror" 
                                           value="{{ old('published_at', $book->published_at ? $book->published_at->format('Y-m-d') : '') }}">
                                    <small class="form-text text-muted">
                                        Kosongkan untuk menggunakan tanggal saat ini
                                    </small>
                                    @error('published_at')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                @if($book->is_online)
                                <div class="alert alert-success">
                                    <h6><i class="fas fa-chart-line"></i> Statistik Buku Online</h6>
                                    <div class="row mt-2">
                                        <div class="col-md-6">
                                            <small><i class="fas fa-eye"></i> Dilihat: <strong>{{ number_format($book->view_count) }} kali</strong></small>
                                        </div>
                                        <div class="col-md-6">
                                            <small><i class="fas fa-download"></i> Download: <strong>{{ number_format($book->download_count) }} kali</strong></small>
                                        </div>
                                    </div>
                                </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan Perubahan
                    </button>
                    <a href="{{ tenant_route('library.show-book', $book->id) }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
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
        @if(!$book->pdf_file)
        document.getElementById('pdf_file').required = true;
        @endif
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

