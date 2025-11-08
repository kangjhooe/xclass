@extends('layouts.tenant')

@section('title', 'Tambah Data Tamu')
@section('page-title', 'Tambah Data Buku Tamu')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .guest-book-form {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 2rem;
        margin-bottom: 2rem;
    }
    
    .form-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease;
    }
    
    .form-card:hover {
        transform: translateY(-5px);
    }
    
    .card-header-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border: none;
    }
    
    .form-group-modern {
        margin-bottom: 1.5rem;
    }
    
    .form-label-modern {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
    }
    
    .form-label-modern i {
        margin-right: 0.5rem;
        color: #667eea;
    }
    
    .form-control-modern {
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
    }
    
    .form-control-modern:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .photo-upload-area {
        border: 3px dashed #cbd5e0;
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        background: #f7fafc;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .photo-upload-area:hover {
        border-color: #667eea;
        background: #edf2f7;
    }
    
    .photo-upload-area.dragover {
        border-color: #667eea;
        background: #e6fffa;
    }
    
    .photo-preview {
        max-width: 100%;
        max-height: 300px;
        border-radius: 10px;
        margin-top: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-camera {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin: 0.5rem;
    }
    
    .btn-camera:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .btn-primary-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-primary-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .section-divider {
        border-top: 2px solid #e2e8f0;
        margin: 2rem 0;
        position: relative;
    }
    
    .section-divider::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 2px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .input-icon-wrapper {
        position: relative;
    }
    
    .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #a0aec0;
    }
    
    .input-icon-wrapper .form-control {
        padding-left: 2.5rem;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-plus me-3"></i>
                Tambah Data Tamu
            </h2>
            <p>Lengkapi form di bawah ini untuk menambahkan data tamu baru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('guest-book.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Tambah Data Tamu
        </h5>
    </div>
    <form action="{{ tenant_route('guest-book.store') }}" method="POST" enctype="multipart/form-data" id="guestBookForm">
                @csrf
                <div class="card-body p-4">
                    <!-- Informasi Pribadi -->
                    <h6 class="mb-3 text-primary">
                        <i class="fas fa-user me-2"></i>Informasi Pribadi
                    </h6>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="visitor_name" class="form-label-modern">
                                    <i class="fas fa-user"></i>Nama Tamu <span class="text-danger">*</span>
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-user input-icon"></i>
                                    <input type="text" name="visitor_name" id="visitor_name" 
                                           class="form-control form-control-modern @error('visitor_name') is-invalid @enderror" 
                                           value="{{ old('visitor_name') }}" placeholder="Masukkan nama tamu" required>
                                </div>
                                @error('visitor_name')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="visitor_phone" class="form-label-modern">
                                    <i class="fas fa-phone"></i>No. Telepon
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-phone input-icon"></i>
                                    <input type="text" name="visitor_phone" id="visitor_phone" 
                                           class="form-control form-control-modern @error('visitor_phone') is-invalid @enderror" 
                                           value="{{ old('visitor_phone') }}" placeholder="Masukkan nomor telepon">
                                </div>
                                @error('visitor_phone')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="visitor_email" class="form-label-modern">
                                    <i class="fas fa-envelope"></i>Email
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-envelope input-icon"></i>
                                    <input type="email" name="visitor_email" id="visitor_email" 
                                           class="form-control form-control-modern @error('visitor_email') is-invalid @enderror" 
                                           value="{{ old('visitor_email') }}" placeholder="Masukkan email">
                                </div>
                                @error('visitor_email')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="visitor_organization" class="form-label-modern">
                                    <i class="fas fa-building"></i>Organisasi/Instansi
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-building input-icon"></i>
                                    <input type="text" name="visitor_organization" id="visitor_organization" 
                                           class="form-control form-control-modern @error('visitor_organization') is-invalid @enderror" 
                                           value="{{ old('visitor_organization') }}" placeholder="Masukkan nama organisasi">
                                </div>
                                @error('visitor_organization')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-modern">
                        <label for="visitor_address" class="form-label-modern">
                            <i class="fas fa-map-marker-alt"></i>Alamat
                        </label>
                        <textarea name="visitor_address" id="visitor_address" 
                                  class="form-control form-control-modern @error('visitor_address') is-invalid @enderror" 
                                  rows="2" placeholder="Masukkan alamat tamu">{{ old('visitor_address') }}</textarea>
                        @error('visitor_address')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Upload Foto -->
                    <div class="section-divider"></div>
                    <h6 class="mb-3 text-primary">
                        <i class="fas fa-camera me-2"></i>Foto Tamu
                    </h6>
                    
                    <div class="form-group-modern">
                        <label class="form-label-modern">
                            <i class="fas fa-image"></i>Foto Tamu (Opsional)
                        </label>
                        <div class="photo-upload-area" id="photoUploadArea">
                            <input type="file" name="photo" id="photoInput" accept="image/*" style="display: none;">
                            <i class="fas fa-camera fa-3x text-muted mb-3"></i>
                            <p class="mb-2">Klik untuk memilih foto atau drag & drop</p>
                            <p class="text-muted small mb-3">Format: JPG, PNG (Maks: 2MB)</p>
                            <button type="button" class="btn btn-camera" id="cameraBtn">
                                <i class="fas fa-camera me-2"></i>Ambil Foto dari Kamera
                            </button>
                            <button type="button" class="btn btn-camera" id="fileBtn">
                                <i class="fas fa-folder-open me-2"></i>Pilih dari Galeri
                            </button>
                        </div>
                        <div id="photoPreview" class="text-center mt-3" style="display: none;">
                            <img id="previewImg" src="" alt="Preview" class="photo-preview">
                            <button type="button" class="btn btn-danger btn-sm mt-2" id="removePhotoBtn">
                                <i class="fas fa-times me-1"></i>Hapus Foto
                            </button>
                        </div>
                        @error('photo')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Informasi Kunjungan -->
                    <div class="section-divider"></div>
                    <h6 class="mb-3 text-primary">
                        <i class="fas fa-calendar-alt me-2"></i>Informasi Kunjungan
                    </h6>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="purpose" class="form-label-modern">
                                    <i class="fas fa-bullseye"></i>Tujuan Kunjungan <span class="text-danger">*</span>
                                </label>
                                <select name="purpose" id="purpose" 
                                        class="form-control form-control-modern @error('purpose') is-invalid @enderror" required>
                                    <option value="">Pilih Tujuan</option>
                                    @foreach((new \App\Models\Tenant\GuestBook())->getPurposeOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ old('purpose') == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('purpose')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-modern">
                                <label for="person_to_meet" class="form-label-modern">
                                    <i class="fas fa-handshake"></i>Orang yang Ditemui
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-handshake input-icon"></i>
                                    <input type="text" name="person_to_meet" id="person_to_meet" 
                                           class="form-control form-control-modern @error('person_to_meet') is-invalid @enderror" 
                                           value="{{ old('person_to_meet') }}" placeholder="Nama orang yang akan ditemui">
                                </div>
                                @error('person_to_meet')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-modern">
                        <label for="purpose_description" class="form-label-modern">
                            <i class="fas fa-file-alt"></i>Deskripsi Tujuan
                        </label>
                        <textarea name="purpose_description" id="purpose_description" 
                                  class="form-control form-control-modern @error('purpose_description') is-invalid @enderror" 
                                  rows="3" placeholder="Jelaskan tujuan kunjungan secara detail">{{ old('purpose_description') }}</textarea>
                        @error('purpose_description')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group-modern">
                                <label for="department" class="form-label-modern">
                                    <i class="fas fa-sitemap"></i>Departemen/Bagian
                                </label>
                                <div class="input-icon-wrapper">
                                    <i class="fas fa-sitemap input-icon"></i>
                                    <input type="text" name="department" id="department" 
                                           class="form-control form-control-modern @error('department') is-invalid @enderror" 
                                           value="{{ old('department') }}" placeholder="Departemen yang dituju">
                                </div>
                                @error('department')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-modern">
                                <label for="visit_date" class="form-label-modern">
                                    <i class="fas fa-calendar"></i>Tanggal Kunjungan <span class="text-danger">*</span>
                                </label>
                                <input type="date" name="visit_date" id="visit_date" 
                                       class="form-control form-control-modern @error('visit_date') is-invalid @enderror" 
                                       value="{{ old('visit_date', date('Y-m-d')) }}" required>
                                @error('visit_date')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-modern">
                                <label for="visit_time" class="form-label-modern">
                                    <i class="fas fa-clock"></i>Waktu Kunjungan <span class="text-danger">*</span>
                                </label>
                                <input type="time" name="visit_time" id="visit_time" 
                                       class="form-control form-control-modern @error('visit_time') is-invalid @enderror" 
                                       value="{{ old('visit_time', date('H:i')) }}" required>
                                @error('visit_time')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-modern">
                        <label for="notes" class="form-label-modern">
                            <i class="fas fa-sticky-note"></i>Catatan
                        </label>
                        <textarea name="notes" id="notes" 
                                  class="form-control form-control-modern @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Catatan tambahan (opsional)">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer bg-light p-4">
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('guest-book.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-times me-2"></i>Batal
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan Data
                        </button>
                    </div>
                </div>
            </form>
        </div>
@endsection

<script>
document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('photoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoPreview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImg');
    const cameraBtn = document.getElementById('cameraBtn');
    const fileBtn = document.getElementById('fileBtn');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    // Click area untuk upload
    photoUploadArea.addEventListener('click', function(e) {
        if (e.target !== cameraBtn && e.target !== fileBtn && e.target.parentElement !== cameraBtn && e.target.parentElement !== fileBtn) {
            photoInput.click();
        }
    });
    
    // Button kamera - buat input baru dengan capture attribute
    cameraBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        // Buat input file baru dengan atribut capture
        const cameraInput = document.createElement('input');
        cameraInput.type = 'file';
        cameraInput.accept = 'image/*';
        cameraInput.capture = 'environment'; // 'environment' untuk kamera belakang, 'user' untuk depan
        cameraInput.style.display = 'none';
        
        // Tambahkan ke body
        document.body.appendChild(cameraInput);
        
        // Event handler untuk input kamera
        cameraInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('Ukuran file terlalu besar. Maksimal 2MB.');
                    document.body.removeChild(cameraInput);
                    return;
                }
                
                // Transfer file ke input utama
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;
                
                // Trigger change event pada input utama
                photoInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Hapus input kamera setelah digunakan
            document.body.removeChild(cameraInput);
        });
        
        // Trigger click pada input kamera
        cameraInput.click();
    });
    
    // Button file - buka galeri
    fileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        photoInput.click();
    });
    
    // Preview foto
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file terlalu besar. Maksimal 2MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                photoPreview.style.display = 'block';
                photoUploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Hapus foto
    removePhotoBtn.addEventListener('click', function() {
        photoInput.value = '';
        previewImg.src = '';
        photoPreview.style.display = 'none';
        photoUploadArea.style.display = 'block';
    });
    
    // Drag and drop
    photoUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        photoUploadArea.classList.add('dragover');
    });
    
    photoUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        photoUploadArea.classList.remove('dragover');
    });
    
    photoUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        photoUploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file terlalu besar. Maksimal 2MB.');
                return;
            }
            
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            photoInput.files = dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                photoPreview.style.display = 'block';
                photoUploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            alert('Silakan pilih file gambar.');
        }
    });
});
</script>
@endsection