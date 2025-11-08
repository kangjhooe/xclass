@extends('layouts.app')

@section('title', 'Buku Tamu - ' . ($tenant->name ?? 'Sistem Informasi'))

@section('content')
<style>
    .guest-book-public {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 3rem 0;
    }
    
    .form-card-public {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        max-width: 900px;
        margin: 0 auto;
    }
    
    .form-header-public {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        text-align: center;
    }
    
    .form-header-public h2 {
        margin: 0;
        font-weight: 700;
    }
    
    .form-header-public p {
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
    }
    
    .form-body-public {
        padding: 2.5rem;
    }
    
    .form-group-public {
        margin-bottom: 1.5rem;
    }
    
    .form-label-public {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
    }
    
    .form-label-public i {
        margin-right: 0.5rem;
        color: #667eea;
    }
    
    .form-control-public {
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
    }
    
    .form-control-public:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .photo-upload-area-public {
        border: 3px dashed #cbd5e0;
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        background: #f7fafc;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .photo-upload-area-public:hover {
        border-color: #667eea;
        background: #edf2f7;
    }
    
    .photo-upload-area-public.dragover {
        border-color: #667eea;
        background: #e6fffa;
    }
    
    .photo-preview-public {
        max-width: 100%;
        max-height: 300px;
        border-radius: 10px;
        margin-top: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-camera-public {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin: 0.5rem;
    }
    
    .btn-camera-public:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .btn-submit-public {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 1rem 3rem;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .btn-submit-public:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .section-title-public {
        color: #667eea;
        font-weight: 700;
        margin: 2rem 0 1.5rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .input-icon-wrapper-public {
        position: relative;
    }
    
    .input-icon-public {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #a0aec0;
    }
    
    .input-icon-wrapper-public .form-control {
        padding-left: 2.5rem;
    }
    
    .alert-modern {
        border-radius: 10px;
        border: none;
        padding: 1rem 1.5rem;
    }
</style>

<div class="guest-book-public">
    <div class="container">
        <div class="form-card-public">
            <div class="form-header-public">
                <h2>
                    <i class="fas fa-book me-2"></i>Buku Tamu
                </h2>
                <p>Silakan isi form berikut untuk mengisi buku tamu</p>
            </div>
            
            <div class="form-body-public">
                @if(session('success'))
                    <div class="alert alert-success alert-modern alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                @if($errors->any())
                    <div class="alert alert-danger alert-modern alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <strong>Terjadi kesalahan:</strong>
                        <ul class="mb-0 mt-2">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                <form action="{{ tenant_route('public.guest-book.store') }}" method="POST" enctype="multipart/form-data" id="guestBookFormPublic">
                    @csrf
                    
                    <!-- Informasi Pribadi -->
                    <h5 class="section-title-public">
                        <i class="fas fa-user me-2"></i>Informasi Pribadi
                    </h5>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-public">
                                <label for="visitor_name" class="form-label-public">
                                    <i class="fas fa-user"></i>Nama Tamu <span class="text-danger">*</span>
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-user input-icon-public"></i>
                                    <input type="text" name="visitor_name" id="visitor_name" 
                                           class="form-control form-control-public @error('visitor_name') is-invalid @enderror" 
                                           value="{{ old('visitor_name') }}" placeholder="Masukkan nama tamu" required>
                                </div>
                                @error('visitor_name')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-public">
                                <label for="visitor_phone" class="form-label-public">
                                    <i class="fas fa-phone"></i>No. Telepon
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-phone input-icon-public"></i>
                                    <input type="text" name="visitor_phone" id="visitor_phone" 
                                           class="form-control form-control-public @error('visitor_phone') is-invalid @enderror" 
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
                            <div class="form-group-public">
                                <label for="visitor_email" class="form-label-public">
                                    <i class="fas fa-envelope"></i>Email
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-envelope input-icon-public"></i>
                                    <input type="email" name="visitor_email" id="visitor_email" 
                                           class="form-control form-control-public @error('visitor_email') is-invalid @enderror" 
                                           value="{{ old('visitor_email') }}" placeholder="Masukkan email">
                                </div>
                                @error('visitor_email')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-public">
                                <label for="visitor_organization" class="form-label-public">
                                    <i class="fas fa-building"></i>Organisasi/Instansi
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-building input-icon-public"></i>
                                    <input type="text" name="visitor_organization" id="visitor_organization" 
                                           class="form-control form-control-public @error('visitor_organization') is-invalid @enderror" 
                                           value="{{ old('visitor_organization') }}" placeholder="Masukkan nama organisasi">
                                </div>
                                @error('visitor_organization')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-public">
                        <label for="visitor_address" class="form-label-public">
                            <i class="fas fa-map-marker-alt"></i>Alamat
                        </label>
                        <textarea name="visitor_address" id="visitor_address" 
                                  class="form-control form-control-public @error('visitor_address') is-invalid @enderror" 
                                  rows="2" placeholder="Masukkan alamat tamu">{{ old('visitor_address') }}</textarea>
                        @error('visitor_address')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Upload Foto -->
                    <h5 class="section-title-public">
                        <i class="fas fa-camera me-2"></i>Foto Tamu
                    </h5>
                    
                    <div class="form-group-public">
                        <label class="form-label-public">
                            <i class="fas fa-image"></i>Foto Tamu (Opsional)
                        </label>
                        <div class="photo-upload-area-public" id="photoUploadAreaPublic">
                            <input type="file" name="photo" id="photoInputPublic" accept="image/*" style="display: none;">
                            <i class="fas fa-camera fa-3x text-muted mb-3"></i>
                            <p class="mb-2">Klik untuk memilih foto atau drag & drop</p>
                            <p class="text-muted small mb-3">Format: JPG, PNG (Maks: 2MB)</p>
                            <button type="button" class="btn btn-camera-public" id="cameraBtnPublic">
                                <i class="fas fa-camera me-2"></i>Ambil Foto dari Kamera
                            </button>
                            <button type="button" class="btn btn-camera-public" id="fileBtnPublic">
                                <i class="fas fa-folder-open me-2"></i>Pilih dari Galeri
                            </button>
                        </div>
                        <div id="photoPreviewPublic" class="text-center mt-3" style="display: none;">
                            <img id="previewImgPublic" src="" alt="Preview" class="photo-preview-public">
                            <button type="button" class="btn btn-danger btn-sm mt-2" id="removePhotoBtnPublic">
                                <i class="fas fa-times me-1"></i>Hapus Foto
                            </button>
                        </div>
                        @error('photo')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <!-- Informasi Kunjungan -->
                    <h5 class="section-title-public">
                        <i class="fas fa-calendar-alt me-2"></i>Informasi Kunjungan
                    </h5>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-public">
                                <label for="purpose" class="form-label-public">
                                    <i class="fas fa-bullseye"></i>Tujuan Kunjungan <span class="text-danger">*</span>
                                </label>
                                <select name="purpose" id="purpose" 
                                        class="form-control form-control-public @error('purpose') is-invalid @enderror" required>
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
                            <div class="form-group-public">
                                <label for="person_to_meet" class="form-label-public">
                                    <i class="fas fa-handshake"></i>Orang yang Ditemui
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-handshake input-icon-public"></i>
                                    <input type="text" name="person_to_meet" id="person_to_meet" 
                                           class="form-control form-control-public @error('person_to_meet') is-invalid @enderror" 
                                           value="{{ old('person_to_meet') }}" placeholder="Nama orang yang akan ditemui">
                                </div>
                                @error('person_to_meet')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-public">
                        <label for="purpose_description" class="form-label-public">
                            <i class="fas fa-file-alt"></i>Deskripsi Tujuan
                        </label>
                        <textarea name="purpose_description" id="purpose_description" 
                                  class="form-control form-control-public @error('purpose_description') is-invalid @enderror" 
                                  rows="3" placeholder="Jelaskan tujuan kunjungan secara detail">{{ old('purpose_description') }}</textarea>
                        @error('purpose_description')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group-public">
                                <label for="department" class="form-label-public">
                                    <i class="fas fa-sitemap"></i>Departemen/Bagian
                                </label>
                                <div class="input-icon-wrapper-public">
                                    <i class="fas fa-sitemap input-icon-public"></i>
                                    <input type="text" name="department" id="department" 
                                           class="form-control form-control-public @error('department') is-invalid @enderror" 
                                           value="{{ old('department') }}" placeholder="Departemen yang dituju">
                                </div>
                                @error('department')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-public">
                                <label for="visit_date" class="form-label-public">
                                    <i class="fas fa-calendar"></i>Tanggal Kunjungan <span class="text-danger">*</span>
                                </label>
                                <input type="date" name="visit_date" id="visit_date" 
                                       class="form-control form-control-public @error('visit_date') is-invalid @enderror" 
                                       value="{{ old('visit_date', date('Y-m-d')) }}" required>
                                @error('visit_date')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-public">
                                <label for="visit_time" class="form-label-public">
                                    <i class="fas fa-clock"></i>Waktu Kunjungan <span class="text-danger">*</span>
                                </label>
                                <input type="time" name="visit_time" id="visit_time" 
                                       class="form-control form-control-public @error('visit_time') is-invalid @enderror" 
                                       value="{{ old('visit_time', date('H:i')) }}" required>
                                @error('visit_time')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group-public">
                        <label for="notes" class="form-label-public">
                            <i class="fas fa-sticky-note"></i>Catatan
                        </label>
                        <textarea name="notes" id="notes" 
                                  class="form-control form-control-public @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Catatan tambahan (opsional)">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group-public mt-4">
                        <button type="submit" class="btn btn-submit-public">
                            <i class="fas fa-paper-plane me-2"></i>Kirim Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('photoInputPublic');
    const photoUploadArea = document.getElementById('photoUploadAreaPublic');
    const photoPreview = document.getElementById('photoPreviewPublic');
    const previewImg = document.getElementById('previewImgPublic');
    const cameraBtn = document.getElementById('cameraBtnPublic');
    const fileBtn = document.getElementById('fileBtnPublic');
    const removePhotoBtn = document.getElementById('removePhotoBtnPublic');
    
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
