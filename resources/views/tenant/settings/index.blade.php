@extends('layouts.tenant')

@section('title', 'Profil Instansi')
@section('page-title', 'Profil Instansi')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    
    /* Section Styles */
    .section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #495057;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e9ecef;
        display: flex;
        align-items: center;
    }
    
    .section-title i {
        margin-right: 0.5rem;
        color: #f5576c;
    }
    
    /* Form Styles */
    .form-label {
        font-weight: 500;
        color: #495057;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
    }
    
    .form-label i {
        margin-right: 0.5rem;
        color: #6c757d;
        width: 16px;
    }
    
    .form-control:focus,
    .form-select:focus {
        border-color: #f5576c;
        box-shadow: 0 0 0 0.2rem rgba(245, 87, 108, 0.25);
    }
    
    /* Image Preview */
    .image-preview {
        border-radius: 12px;
        border: 2px solid #e9ecef;
        padding: 1rem;
        background: #f8f9fa;
        margin-top: 1rem;
    }
    
    .image-preview img {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Button Styles */
    .btn-primary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border: none;
        border-radius: 8px;
        padding: 0.625rem 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
    }
    
    /* Divider */
    .section-divider {
        border: none;
        border-top: 2px solid #e9ecef;
        margin: 2rem 0;
        opacity: 0.5;
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif
@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-12">
            <h2>
                <i class="fas fa-building me-3"></i>
                Profil Instansi
            </h2>
            <p>Kelola informasi dan pengaturan instansi Anda</p>
        </div>
    </div>
</div>

<!-- Settings Form -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-building me-2 text-primary"></i>
            Informasi & Pengaturan Instansi
        </h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ tenant_route('settings.update') }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            
            <div class="row">
                <!-- Basic Information -->
                <div class="col-md-6">
                    <h5 class="section-title">
                        <i class="fas fa-info-circle"></i>
                        Informasi Dasar
                    </h5>
                    
                    <div class="mb-3">
                        <label for="npsn" class="form-label">
                            <i class="fas fa-id-card"></i>
                            <span>NPSN</span>
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="npsn" 
                               value="{{ $tenant->npsn }}" 
                               readonly
                               style="background-color: #f8f9fa;">
                        <div class="form-text mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            NPSN tidak dapat diubah
                        </div>
                    </div>
                            
                    <div class="mb-3">
                        <label for="name" class="form-label">
                            <i class="fas fa-tag"></i>
                            <span>Nama Lembaga <span class="text-danger">*</span></span>
                        </label>
                        <input type="text" 
                               class="form-control @error('name') is-invalid @enderror" 
                               id="name" 
                               name="name" 
                               value="{{ old('name', $tenant->name) }}"
                               placeholder="Masukkan nama lembaga">
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="type_tenant" class="form-label">
                                    <i class="fas fa-school"></i>
                                    <span>Jenis Instansi <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('type_tenant') is-invalid @enderror" 
                                        id="type_tenant" 
                                        name="type_tenant" 
                                        required>
                                    <option value="">Pilih Jenis Instansi</option>
                                    <option value="Sekolah Umum" {{ old('type_tenant', $tenant->type_tenant) == 'Sekolah Umum' ? 'selected' : '' }}>
                                        Sekolah Umum
                                    </option>
                                    <option value="Madrasah" {{ old('type_tenant', $tenant->type_tenant) == 'Madrasah' ? 'selected' : '' }}>
                                        Madrasah
                                    </option>
                                </select>
                                @error('type_tenant')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="jenjang" class="form-label">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>Jenjang Pendidikan <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('jenjang') is-invalid @enderror" 
                                        id="jenjang" 
                                        name="jenjang" 
                                        required>
                                    <option value="">Pilih Jenjang</option>
                                    <option value="SD" {{ old('jenjang', $tenant->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                                    <option value="MI" {{ old('jenjang', $tenant->jenjang) == 'MI' ? 'selected' : '' }}>MI</option>
                                    <option value="SMP" {{ old('jenjang', $tenant->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                    <option value="MTs" {{ old('jenjang', $tenant->jenjang) == 'MTs' ? 'selected' : '' }}>MTs</option>
                                    <option value="SMA" {{ old('jenjang', $tenant->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                    <option value="MA" {{ old('jenjang', $tenant->jenjang) == 'MA' ? 'selected' : '' }}>MA</option>
                                    <option value="SMK" {{ old('jenjang', $tenant->jenjang) == 'SMK' ? 'selected' : '' }}>SMK</option>
                                    <option value="Lainnya" {{ old('jenjang', $tenant->jenjang) == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('jenjang')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope"></i>
                            <span>Email <span class="text-danger">*</span></span>
                        </label>
                        <input type="email" 
                               class="form-control @error('email') is-invalid @enderror" 
                               id="email" 
                               name="email" 
                               value="{{ old('email', $tenant->email) }}"
                               placeholder="Masukkan email lembaga">
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="phone" class="form-label">
                            <i class="fas fa-phone"></i>
                            <span>Telepon</span>
                        </label>
                        <input type="text" 
                               class="form-control @error('phone') is-invalid @enderror" 
                               id="phone" 
                               name="phone" 
                               value="{{ old('phone', $tenant->phone) }}"
                               placeholder="Masukkan nomor telepon">
                        @error('phone')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="website" class="form-label">
                            <i class="fas fa-globe"></i>
                            <span>Website</span>
                        </label>
                        <input type="url" 
                               class="form-control @error('website') is-invalid @enderror" 
                               id="website" 
                               name="website" 
                               value="{{ old('website', $tenant->website) }}"
                               placeholder="https://example.com">
                        @error('website')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="custom_domain" class="form-label">
                            <i class="fas fa-link"></i>
                            <span>Domain Kustom</span>
                        </label>
                        <input type="text" 
                               class="form-control @error('custom_domain') is-invalid @enderror" 
                               id="custom_domain" 
                               name="custom_domain" 
                               value="{{ old('custom_domain', $tenant->custom_domain) }}"
                               placeholder="contoh: sman1jakarta.sch.id">
                        <div class="form-text mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            Pastikan domain ini diarahkan ke server aplikasi dan memiliki sertifikat SSL aktif.
                        </div>
                        @error('custom_domain')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <!-- Address Information -->
                <div class="col-md-6">
                    <h5 class="section-title">
                        <i class="fas fa-map-marker-alt"></i>
                        Informasi Alamat
                    </h5>

                    <div class="mb-3">
                        <label for="address" class="form-label">
                            <i class="fas fa-home"></i>
                            <span>Alamat Lengkap (Jalan)</span>
                        </label>
                        <textarea class="form-control @error('address') is-invalid @enderror" 
                                  id="address" 
                                  name="address" 
                                  rows="2" 
                                  placeholder="Masukkan alamat lengkap (nama jalan, RT/RW, dll)">{{ old('address', $tenant->address) }}</textarea>
                        @error('address')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="province_code" class="form-label">
                                    <i class="fas fa-map"></i>
                                    <span>Provinsi <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('province_code') is-invalid @enderror" 
                                        id="province_code" 
                                        name="province_code" 
                                        required>
                                    <option value="">Pilih Provinsi</option>
                                </select>
                                <input type="hidden" id="province" name="province" value="{{ old('province', $tenant->province) }}">
                                @error('province_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="regency_code" class="form-label">
                                    <i class="fas fa-city"></i>
                                    <span>Kabupaten/Kota <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('regency_code') is-invalid @enderror" 
                                        id="regency_code" 
                                        name="regency_code"
                                        required
                                        disabled>
                                    <option value="">Pilih Kabupaten/Kota</option>
                                </select>
                                <input type="hidden" id="regency" name="regency" value="{{ old('regency', $tenant->regency) }}">
                                <input type="hidden" id="city" name="city" value="{{ old('city', $tenant->city) }}">
                                @error('regency_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="district_code" class="form-label">
                                    <i class="fas fa-map-marked-alt"></i>
                                    <span>Kecamatan <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('district_code') is-invalid @enderror" 
                                        id="district_code" 
                                        name="district_code"
                                        required
                                        disabled>
                                    <option value="">Pilih Kecamatan</option>
                                </select>
                                <input type="hidden" id="district" name="district" value="{{ old('district', $tenant->district) }}">
                                @error('district_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="village_code" class="form-label">
                                    <i class="fas fa-location-dot"></i>
                                    <span>Kelurahan/Desa <span class="text-danger">*</span></span>
                                </label>
                                <select class="form-control @error('village_code') is-invalid @enderror" 
                                        id="village_code" 
                                        name="village_code"
                                        required
                                        disabled>
                                    <option value="">Pilih Kelurahan/Desa</option>
                                </select>
                                <input type="hidden" id="village" name="village" value="{{ old('village', $tenant->village) }}">
                                @error('village_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="postal_code" class="form-label">
                            <i class="fas fa-mail-bulk"></i>
                            <span>Kode Pos</span>
                        </label>
                        <input type="text" 
                               class="form-control @error('postal_code') is-invalid @enderror" 
                               id="postal_code" 
                               name="postal_code" 
                               value="{{ old('postal_code', $tenant->postal_code) }}"
                               placeholder="Masukkan kode pos">
                        @error('postal_code')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <div class="row">
                <!-- Logo Upload -->
                <div class="col-md-6">
                    <h5 class="section-title">
                        <i class="fas fa-image"></i>
                        Logo Lembaga
                    </h5>
                    
                    <div class="mb-3">
                        <label for="logo" class="form-label">
                            <i class="fas fa-upload"></i>
                            Upload Logo
                        </label>
                        <input type="file" 
                               class="form-control @error('logo') is-invalid @enderror" 
                               id="logo" 
                               name="logo" 
                               accept="image/*">
                        <div class="form-text mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            Format: JPEG, PNG, JPG, GIF, SVG. Maksimal 2MB.
                        </div>
                        @error('logo')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    @if($tenant->logo)
                        <div class="image-preview">
                            <label class="form-label mb-3">Logo Saat Ini:</label>
                            <div class="d-flex align-items-center">
                                <img src="{{ Storage::url($tenant->logo) }}" 
                                     alt="Logo" 
                                     class="me-3" 
                                     style="max-width: 120px; max-height: 120px; border-radius: 8px;">
                                <div>
                                    <a href="{{ tenant_route('settings.delete-logo') }}" 
                                       class="btn btn-sm btn-danger"
                                       onclick="return confirm('Apakah Anda yakin ingin menghapus logo?')">
                                        <i class="fas fa-trash me-1"></i>
                                        Hapus Logo
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Favicon Upload -->
                <div class="col-md-6">
                    <h5 class="section-title">
                        <i class="fas fa-star"></i>
                        Favicon
                    </h5>
                    
                    <div class="mb-3">
                        <label for="favicon" class="form-label">
                            <i class="fas fa-upload"></i>
                            Upload Favicon
                        </label>
                        <input type="file" 
                               class="form-control @error('favicon') is-invalid @enderror" 
                               id="favicon" 
                               name="favicon" 
                               accept="image/*">
                        <div class="form-text mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            Format: JPEG, PNG, JPG, GIF, ICO, SVG. Maksimal 1MB. Ukuran disarankan: 32x32px.
                        </div>
                        @error('favicon')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    @if($tenant->favicon)
                        <div class="image-preview">
                            <label class="form-label mb-3">Favicon Saat Ini:</label>
                            <div class="d-flex align-items-center">
                                <img src="{{ Storage::url($tenant->favicon) }}" 
                                     alt="Favicon" 
                                     class="me-3" 
                                     style="max-width: 64px; max-height: 64px; border-radius: 8px;">
                                <div>
                                    <a href="{{ tenant_route('settings.delete-favicon') }}" 
                                       class="btn btn-sm btn-danger"
                                       onclick="return confirm('Apakah Anda yakin ingin menghapus favicon?')">
                                        <i class="fas fa-trash me-1"></i>
                                        Hapus Favicon
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12">
                    <div class="d-flex justify-content-end gap-2">
                        <a href="{{ tenant_route('tenant.dashboard') }}" class="btn btn-outline-secondary">
                            <i class="fas fa-times me-2"></i>
                            Batal
                        </a>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan Pengaturan
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const provinceSelect = document.getElementById('province_code');
    const regencySelect = document.getElementById('regency_code');
    const districtSelect = document.getElementById('district_code');
    const villageSelect = document.getElementById('village_code');
    
    const provinceNameInput = document.getElementById('province');
    const regencyNameInput = document.getElementById('regency');
    const districtNameInput = document.getElementById('district');
    const villageNameInput = document.getElementById('village');
    
    // Current values from server
    const currentProvinceCode = '{{ old("province_code", $tenant->province_code) }}';
    const currentRegencyCode = '{{ old("regency_code", $tenant->regency_code) }}';
    const currentDistrictCode = '{{ old("district_code", $tenant->district_code) }}';
    const currentVillageCode = '{{ old("village_code", $tenant->village_code) }}';
    
    // Base URL untuk geo API
    const provincesUrl = '{{ tenant_route("tenant.geo.provinces") }}';
    const baseUrl = provincesUrl.replace(/\/provinces$/, '');
    
    console.log('Provinces URL:', provincesUrl);
    console.log('Base URL:', baseUrl);
    
    // Load provinces
    async function loadProvinces() {
        try {
            console.log('Fetching provinces from:', provincesUrl);
            
            // Show loading state
            provinceSelect.innerHTML = '<option value="">Memuat data provinsi...</option>';
            provinceSelect.disabled = true;
            
            const response = await fetch(provincesUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to load provinces:', response.status, errorText);
                
                // Check if it's a 401/403 (auth issue)
                if (response.status === 401 || response.status === 403) {
                    provinceSelect.innerHTML = '<option value="">Error: Akses ditolak. Silakan refresh halaman.</option>';
                } else if (response.status === 404) {
                    provinceSelect.innerHTML = '<option value="">Error: Route tidak ditemukan. Silakan hubungi administrator.</option>';
                } else {
                    provinceSelect.innerHTML = '<option value="">Error: Gagal memuat data (' + response.status + ')</option>';
                }
                provinceSelect.disabled = false;
                return;
            }
            
            const provinces = await response.json();
            console.log('Provinces received:', provinces);
            console.log('Provinces count:', provinces ? provinces.length : 0);
            
            if (!provinces || provinces.length === 0) {
                console.error('No provinces data received or empty array');
                provinceSelect.innerHTML = '<option value="">Data provinsi tidak tersedia. Silakan hubungi administrator.</option>';
                provinceSelect.disabled = false;
                return;
            }
            
            provinceSelect.innerHTML = '<option value="">Pilih Provinsi</option>';
            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                if (province.code === currentProvinceCode) {
                    option.selected = true;
                }
                provinceSelect.appendChild(option);
            });
            
            provinceSelect.disabled = false;
            
            if (currentProvinceCode) {
                provinceNameInput.value = provinceSelect.options[provinceSelect.selectedIndex]?.textContent || '';
                loadRegencies(currentProvinceCode);
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
            console.error('Error stack:', error.stack);
            provinceSelect.innerHTML = '<option value="">Error: ' + error.message + '. Silakan refresh halaman.</option>';
            provinceSelect.disabled = false;
        }
    }
    
    // Load regencies
    async function loadRegencies(provinceCode) {
        regencySelect.innerHTML = '<option value="">Pilih Kabupaten/Kota</option>';
        regencySelect.disabled = !provinceCode;
        districtSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
        districtSelect.disabled = true;
        villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';
        villageSelect.disabled = true;
        
        if (!provinceCode) return;
        
        try {
            const response = await fetch(`${baseUrl}/regencies/${provinceCode}`);
            if (!response.ok) {
                throw new Error('Failed to load regencies: ' + response.statusText);
            }
            const regencies = await response.json();
            
            regencies.forEach(regency => {
                const option = document.createElement('option');
                option.value = regency.code;
                option.textContent = regency.name;
                if (regency.code === currentRegencyCode) {
                    option.selected = true;
                }
                regencySelect.appendChild(option);
            });
            
            regencySelect.disabled = false;
            
            if (currentRegencyCode && provinceCode === currentProvinceCode) {
                regencyNameInput.value = regencySelect.options[regencySelect.selectedIndex]?.textContent || '';
                const cityInput = document.getElementById('city');
                if (cityInput) cityInput.value = regencyNameInput.value;
                loadDistricts(provinceCode, currentRegencyCode);
            }
        } catch (error) {
            console.error('Error loading regencies:', error);
        }
    }
    
    // Load districts
    async function loadDistricts(provinceCode, regencyCode) {
        districtSelect.innerHTML = '<option value="">Pilih Kecamatan</option>';
        districtSelect.disabled = !regencyCode;
        villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';
        villageSelect.disabled = true;
        
        if (!provinceCode || !regencyCode) return;
        
        try {
            const response = await fetch(`${baseUrl}/districts/${provinceCode}/${regencyCode}`);
            if (!response.ok) {
                throw new Error('Failed to load districts: ' + response.statusText);
            }
            const districts = await response.json();
            
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.code;
                option.textContent = district.name;
                if (district.code === currentDistrictCode) {
                    option.selected = true;
                }
                districtSelect.appendChild(option);
            });
            
            districtSelect.disabled = false;
            
            if (currentDistrictCode && provinceCode === currentProvinceCode && regencyCode === currentRegencyCode) {
                districtNameInput.value = districtSelect.options[districtSelect.selectedIndex]?.textContent || '';
                loadVillages(provinceCode, regencyCode, currentDistrictCode);
            }
        } catch (error) {
            console.error('Error loading districts:', error);
        }
    }
    
    // Load villages
    async function loadVillages(provinceCode, regencyCode, districtCode) {
        villageSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>';
        villageSelect.disabled = !districtCode;
        
        if (!provinceCode || !regencyCode || !districtCode) return;
        
        try {
            const response = await fetch(`${baseUrl}/villages/${provinceCode}/${regencyCode}/${districtCode}`);
            if (!response.ok) {
                throw new Error('Failed to load villages: ' + response.statusText);
            }
            const villages = await response.json();
            
            villages.forEach(village => {
                const option = document.createElement('option');
                option.value = village.code;
                option.textContent = village.name;
                if (village.code === currentVillageCode) {
                    option.selected = true;
                }
                villageSelect.appendChild(option);
            });
            
            villageSelect.disabled = false;
            
            if (currentVillageCode && provinceCode === currentProvinceCode && regencyCode === currentRegencyCode && districtCode === currentDistrictCode) {
                villageNameInput.value = villageSelect.options[villageSelect.selectedIndex]?.textContent || '';
            }
        } catch (error) {
            console.error('Error loading villages:', error);
        }
    }
    
    // Event listeners
    provinceSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        provinceNameInput.value = selectedOption ? selectedOption.textContent : '';
        loadRegencies(this.value);
    });
    
    regencySelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        regencyNameInput.value = selectedOption ? selectedOption.textContent : '';
        const cityInput = document.getElementById('city');
        if (cityInput) cityInput.value = regencyNameInput.value;
        loadDistricts(provinceSelect.value, this.value);
    });
    
    districtSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        districtNameInput.value = selectedOption ? selectedOption.textContent : '';
        loadVillages(provinceSelect.value, regencySelect.value, this.value);
    });
    
    villageSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        villageNameInput.value = selectedOption ? selectedOption.textContent : '';
    });
    
    // Initialize
    loadProvinces();
});
</script>
@endpush
