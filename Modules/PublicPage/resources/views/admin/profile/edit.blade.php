@extends('layouts.tenant')

@section('title', 'Edit Profile Instansi')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-edit mr-2"></i>
                        Edit Profile Instansi
                    </h3>
                    <div class="card-tools">
                        <a href="{{ route('tenant.public-page.profile.show', ['tenant' => request()->route('tenant')]) }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-eye mr-1"></i>
                            Lihat Profile
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if($errors->any())
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <strong>Terjadi kesalahan:</strong>
                            <ul class="mb-0 mt-2">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="close" data-dismiss="alert">
                                <span>&times;</span>
                            </button>
                        </div>
                    @endif

                    <form action="{{ route('tenant.public-page.profile.update', ['tenant' => request()->route('tenant')]) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="row">
                            <!-- Logo dan Info Dasar -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">Logo Instansi</h5>
                                    </div>
                                    <div class="card-body text-center">
                                        <div class="mb-3">
                                            @if($profile->logo)
                                                <img id="logo-preview" src="{{ asset($profile->logo) }}" alt="Logo Preview" 
                                                     class="img-fluid rounded" style="max-height: 200px;">
                                            @else
                                                <div id="logo-preview" class="bg-light rounded d-flex align-items-center justify-content-center" 
                                                     style="height: 200px;">
                                                    <i class="fas fa-building fa-3x text-muted"></i>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="form-group">
                                            <label for="logo">Upload Logo Baru</label>
                                            <input type="file" class="form-control-file" id="logo" name="logo" accept="image/*">
                                            <small class="form-text text-muted">Format: JPG, PNG, GIF. Maksimal 2MB</small>
                                        </div>
                                    </div>
                                </div>

                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">Informasi Kontak</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-group">
                                            <label for="phone">Telepon</label>
                                            <input type="text" class="form-control" id="phone" name="phone" 
                                                   value="{{ old('phone', $profile->phone) }}" placeholder="Contoh: 021-12345678">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="email">Email</label>
                                            <input type="email" class="form-control" id="email" name="email" 
                                                   value="{{ old('email', $profile->email) }}" placeholder="Contoh: info@sekolah.com">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="website">Website</label>
                                            <input type="url" class="form-control" id="website" name="website" 
                                                   value="{{ old('website', $profile->website) }}" placeholder="Contoh: https://sekolah.com">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="address">Alamat</label>
                                            <textarea class="form-control" id="address" name="address" rows="3" 
                                                      placeholder="Alamat lengkap instansi">{{ old('address', $profile->address) }}</textarea>
                                        </div>
                                        
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="city">Kota</label>
                                                    <input type="text" class="form-control" id="city" name="city" 
                                                           value="{{ old('city', $profile->city) }}" placeholder="Nama kota">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="province">Provinsi</label>
                                                    <input type="text" class="form-control" id="province" name="province" 
                                                           value="{{ old('province', $profile->province) }}" placeholder="Nama provinsi">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="postal_code">Kode Pos</label>
                                            <input type="text" class="form-control" id="postal_code" name="postal_code" 
                                                   value="{{ old('postal_code', $profile->postal_code) }}" placeholder="Contoh: 12345">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Detail Profile -->
                            <div class="col-md-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">Detail Instansi</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-group">
                                            <label for="institution_name">Nama Instansi <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" id="institution_name" name="institution_name" 
                                                   value="{{ old('institution_name', $profile->institution_name) }}" required>
                                        </div>

                                        <div class="form-group">
                                            <label for="institution_type">Jenis Instansi</label>
                                            <select class="form-control" id="institution_type" name="institution_type">
                                                <option value="">Pilih Jenis Instansi</option>
                                                <option value="Sekolah Dasar" {{ old('institution_type', $profile->institution_type) == 'Sekolah Dasar' ? 'selected' : '' }}>Sekolah Dasar</option>
                                                <option value="Sekolah Menengah Pertama" {{ old('institution_type', $profile->institution_type) == 'Sekolah Menengah Pertama' ? 'selected' : '' }}>Sekolah Menengah Pertama</option>
                                                <option value="Sekolah Menengah Atas" {{ old('institution_type', $profile->institution_type) == 'Sekolah Menengah Atas' ? 'selected' : '' }}>Sekolah Menengah Atas</option>
                                                <option value="Madrasah Ibtidaiyah" {{ old('institution_type', $profile->institution_type) == 'Madrasah Ibtidaiyah' ? 'selected' : '' }}>Madrasah Ibtidaiyah</option>
                                                <option value="Madrasah Tsanawiyah" {{ old('institution_type', $profile->institution_type) == 'Madrasah Tsanawiyah' ? 'selected' : '' }}>Madrasah Tsanawiyah</option>
                                                <option value="Madrasah Aliyah" {{ old('institution_type', $profile->institution_type) == 'Madrasah Aliyah' ? 'selected' : '' }}>Madrasah Aliyah</option>
                                                <option value="Pondok Pesantren" {{ old('institution_type', $profile->institution_type) == 'Pondok Pesantren' ? 'selected' : '' }}>Pondok Pesantren</option>
                                                <option value="Lainnya" {{ old('institution_type', $profile->institution_type) == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label for="slogan">Slogan</label>
                                            <input type="text" class="form-control" id="slogan" name="slogan" 
                                                   value="{{ old('slogan', $profile->slogan) }}" placeholder="Contoh: Berakhlak Mulia, Berprestasi Tinggi">
                                        </div>

                                        <div class="form-group">
                                            <label for="description">Deskripsi</label>
                                            <textarea class="form-control" id="description" name="description" rows="4" 
                                                      placeholder="Deskripsi singkat tentang instansi">{{ old('description', $profile->description) }}</textarea>
                                        </div>

                                        <div class="form-group">
                                            <label for="vision">Visi</label>
                                            <textarea class="form-control" id="vision" name="vision" rows="3" 
                                                      placeholder="Visi instansi">{{ old('vision', $profile->vision) }}</textarea>
                                        </div>

                                        <div class="form-group">
                                            <label for="mission">Misi</label>
                                            <textarea class="form-control" id="mission" name="mission" rows="4" 
                                                      placeholder="Misi instansi">{{ old('mission', $profile->mission) }}</textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- SEO Information -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">Informasi SEO</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-group">
                                            <label for="seo_title">SEO Title</label>
                                            <input type="text" class="form-control" id="seo_title" name="seo_title" 
                                                   value="{{ old('seo_title', $profile->seo_title) }}" 
                                                   placeholder="Judul untuk mesin pencari (maksimal 60 karakter)">
                                            <small class="form-text text-muted">Judul yang akan muncul di hasil pencarian Google</small>
                                        </div>

                                        <div class="form-group">
                                            <label for="seo_description">SEO Description</label>
                                            <textarea class="form-control" id="seo_description" name="seo_description" rows="3" 
                                                      placeholder="Deskripsi untuk mesin pencari (maksimal 160 karakter)">{{ old('seo_description', $profile->seo_description) }}</textarea>
                                            <small class="form-text text-muted">Deskripsi yang akan muncul di hasil pencarian Google</small>
                                        </div>

                                        <div class="form-group">
                                            <label for="seo_keywords">SEO Keywords</label>
                                            <input type="text" class="form-control" id="seo_keywords" name="seo_keywords" 
                                                   value="{{ old('seo_keywords', $profile->seo_keywords) }}" 
                                                   placeholder="Kata kunci dipisahkan dengan koma">
                                            <small class="form-text text-muted">Kata kunci yang relevan dengan instansi Anda</small>
                                        </div>
                                    </div>
                                </div>

                                <!-- Social Media -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">Media Sosial</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="social_media_facebook">Facebook</label>
                                                    <input type="url" class="form-control" id="social_media_facebook" name="social_media[facebook]" 
                                                           value="{{ old('social_media.facebook', $profile->social_media['facebook'] ?? '') }}" 
                                                           placeholder="https://facebook.com/username">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="social_media_instagram">Instagram</label>
                                                    <input type="url" class="form-control" id="social_media_instagram" name="social_media[instagram]" 
                                                           value="{{ old('social_media.instagram', $profile->social_media['instagram'] ?? '') }}" 
                                                           placeholder="https://instagram.com/username">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="social_media_twitter">Twitter</label>
                                                    <input type="url" class="form-control" id="social_media_twitter" name="social_media[twitter]" 
                                                           value="{{ old('social_media.twitter', $profile->social_media['twitter'] ?? '') }}" 
                                                           placeholder="https://twitter.com/username">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="social_media_youtube">YouTube</label>
                                                    <input type="url" class="form-control" id="social_media_youtube" name="social_media[youtube]" 
                                                           value="{{ old('social_media.youtube', $profile->social_media['youtube'] ?? '') }}" 
                                                           placeholder="https://youtube.com/channel/username">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-body text-center">
                                        <button type="submit" class="btn btn-primary btn-lg">
                                            <i class="fas fa-save mr-2"></i>
                                            Simpan Perubahan
                                        </button>
                                        <a href="{{ route('tenant.public-page.profile.show', ['tenant' => request()->route('tenant')]) }}" class="btn btn-secondary btn-lg ml-2">
                                            <i class="fas fa-times mr-2"></i>
                                            Batal
                                        </a>
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
$(document).ready(function() {
    // Logo preview
    $('#logo').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#logo-preview').html('<img src="' + e.target.result + '" class="img-fluid rounded" style="max-height: 200px;">');
            };
            reader.readAsDataURL(file);
        }
    });

    // Character counter for SEO fields
    $('#seo_title').on('input', function() {
        const length = $(this).val().length;
        const maxLength = 60;
        if (length > maxLength) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    $('#seo_description').on('input', function() {
        const length = $(this).val().length;
        const maxLength = 160;
        if (length > maxLength) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Auto-hide alerts
    setTimeout(function() {
        $('.alert').fadeOut();
    }, 5000);
});
</script>
@endpush
