@extends('layouts.tenant')

@section('title', 'Pendaftaran PPDB Baru')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="{{ tenant_route('dashboard') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ tenant_route('tenant.ppdb.dashboard') }}">PPDB</a></li>
                        <li class="breadcrumb-item"><a href="{{ tenant_route('tenant.ppdb.index') }}">Data Pendaftar</a></li>
                        <li class="breadcrumb-item active">Tambah Pendaftar</li>
                    </ol>
                </div>
                <h4 class="page-title">
                    <i class="fas fa-user-plus me-2"></i>Pendaftaran PPDB Baru
                </h4>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <form method="POST" action="{{ tenant_route('tenant.ppdb.store') }}" enctype="multipart/form-data">
                    @csrf
                    <div class="card-body">
                        <!-- Data Siswa -->
                        <div class="row">
                            <div class="col-12">
                                <h5 class="text-primary mb-3">
                                    <i class="fas fa-user mr-2"></i>
                                    Data Siswa
                                </h5>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="full_name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                    <input type="text" name="full_name" id="full_name" 
                                           class="form-control @error('full_name') is-invalid @enderror" 
                                           value="{{ old('full_name') }}" required>
                                    @error('full_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" name="email" id="email" 
                                           class="form-control @error('email') is-invalid @enderror" 
                                           value="{{ old('email') }}" required>
                                    @error('email')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="phone" class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                    <input type="text" name="phone" id="phone" 
                                           class="form-control @error('phone') is-invalid @enderror" 
                                           value="{{ old('phone') }}" required>
                                    @error('phone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="birth_place" class="form-label">Tempat Lahir <span class="text-danger">*</span></label>
                                    <input type="text" name="birth_place" id="birth_place" 
                                           class="form-control @error('birth_place') is-invalid @enderror" 
                                           value="{{ old('birth_place') }}" required>
                                    @error('birth_place')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="birth_date" class="form-label">Tanggal Lahir <span class="text-danger">*</span></label>
                                    <input type="date" name="birth_date" id="birth_date" 
                                           class="form-control @error('birth_date') is-invalid @enderror" 
                                           value="{{ old('birth_date') }}" required>
                                    @error('birth_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="gender" class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                    <select name="gender" id="gender" 
                                            class="form-select @error('gender') is-invalid @enderror" required>
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L" {{ old('gender') == 'L' ? 'selected' : '' }}>Laki-laki</option>
                                        <option value="P" {{ old('gender') == 'P' ? 'selected' : '' }}>Perempuan</option>
                                    </select>
                                    @error('gender')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="academic_year" class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                                    <select name="academic_year" id="academic_year" 
                                            class="form-select @error('academic_year') is-invalid @enderror" required>
                                        <option value="">Pilih Tahun Ajaran</option>
                                        @foreach($configurations as $config)
                                            <option value="{{ $config->academic_year }}" {{ old('academic_year') == $config->academic_year ? 'selected' : '' }}>
                                                {{ $config->academic_year }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('academic_year')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <div class="mb-3">
                                    <label for="address" class="form-label">Alamat Lengkap <span class="text-danger">*</span></label>
                                    <textarea name="address" id="address" rows="3" 
                                              class="form-control @error('address') is-invalid @enderror" required>{{ old('address') }}</textarea>
                                    @error('address')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="major_choice" class="form-label">Pilihan Jurusan <span class="text-danger">*</span></label>
                                    <select name="major_choice" id="major_choice" 
                                            class="form-select @error('major_choice') is-invalid @enderror" required>
                                        <option value="">Pilih Jurusan</option>
                                        <option value="IPA" {{ old('major_choice') == 'IPA' ? 'selected' : '' }}>IPA</option>
                                        <option value="IPS" {{ old('major_choice') == 'IPS' ? 'selected' : '' }}>IPS</option>
                                        <option value="Bahasa" {{ old('major_choice') == 'Bahasa' ? 'selected' : '' }}>Bahasa</option>
                                        <option value="Agama" {{ old('major_choice') == 'Agama' ? 'selected' : '' }}>Agama</option>
                                    </select>
                                    @error('major_choice')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="batch" class="form-label">Gelombang <span class="text-danger">*</span></label>
                                    <select name="batch" id="batch" 
                                            class="form-select @error('batch') is-invalid @enderror" required>
                                        <option value="">Pilih Gelombang</option>
                                        @foreach($configurations as $config)
                                            <option value="{{ $config->batch_name }}" {{ old('batch') == $config->batch_name ? 'selected' : '' }}>
                                                {{ $config->batch_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('batch')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <!-- Data Orang Tua -->
                        <div class="row mt-4">
                            <div class="col-12">
                                <h5 class="text-primary mb-3">
                                    <i class="fas fa-users mr-2"></i>
                                    Data Orang Tua
                                </h5>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="parent_name" class="form-label">Nama Orang Tua <span class="text-danger">*</span></label>
                                    <input type="text" name="parent_name" id="parent_name" 
                                           class="form-control @error('parent_name') is-invalid @enderror" 
                                           value="{{ old('parent_name') }}" required>
                                    @error('parent_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="parent_phone" class="form-label">No. Telepon Orang Tua <span class="text-danger">*</span></label>
                                    <input type="text" name="parent_phone" id="parent_phone" 
                                           class="form-control @error('parent_phone') is-invalid @enderror" 
                                           value="{{ old('parent_phone') }}" required>
                                    @error('parent_phone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="parent_occupation" class="form-label">Pekerjaan Orang Tua <span class="text-danger">*</span></label>
                                    <input type="text" name="parent_occupation" id="parent_occupation" 
                                           class="form-control @error('parent_occupation') is-invalid @enderror" 
                                           value="{{ old('parent_occupation') }}" required>
                                    @error('parent_occupation')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="parent_income" class="form-label">Penghasilan Orang Tua (Rp)</label>
                                    <input type="number" name="parent_income" id="parent_income" 
                                           class="form-control @error('parent_income') is-invalid @enderror" 
                                           value="{{ old('parent_income') }}" min="0">
                                    @error('parent_income')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <!-- Data Sekolah Asal -->
                        <div class="row mt-4">
                            <div class="col-12">
                                <h5 class="text-primary mb-3">
                                    <i class="fas fa-school mr-2"></i>
                                    Data Sekolah Asal
                                </h5>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="previous_school" class="form-label">Nama Sekolah Asal <span class="text-danger">*</span></label>
                                    <input type="text" name="previous_school" id="previous_school" 
                                           class="form-control @error('previous_school') is-invalid @enderror" 
                                           value="{{ old('previous_school') }}" required>
                                    @error('previous_school')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="registration_path" class="form-label">Jalur Pendaftaran <span class="text-danger">*</span></label>
                                    <select name="registration_path" id="registration_path" 
                                            class="form-select @error('registration_path') is-invalid @enderror" required>
                                        <option value="">Pilih Jalur Pendaftaran</option>
                                        <option value="zonasi" {{ old('registration_path') == 'zonasi' ? 'selected' : '' }}>Zonasi</option>
                                        <option value="affirmative" {{ old('registration_path') == 'affirmative' ? 'selected' : '' }}>Afirmasi</option>
                                        <option value="transfer" {{ old('registration_path') == 'transfer' ? 'selected' : '' }}>Pindahan</option>
                                        <option value="achievement" {{ old('registration_path') == 'achievement' ? 'selected' : '' }}>Prestasi</option>
                                        <option value="academic" {{ old('registration_path') == 'academic' ? 'selected' : '' }}>Akademik</option>
                                    </select>
                                    @error('registration_path')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <div class="mb-3">
                                    <label for="previous_school_address" class="form-label">Alamat Sekolah Asal <span class="text-danger">*</span></label>
                                    <textarea name="previous_school_address" id="previous_school_address" rows="3" 
                                              class="form-control @error('previous_school_address') is-invalid @enderror" required>{{ old('previous_school_address') }}</textarea>
                                    @error('previous_school_address')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <!-- Dokumen -->
                        <div class="row mt-4">
                            <div class="col-12">
                                <h5 class="text-primary mb-3">
                                    <i class="fas fa-file-alt mr-2"></i>
                                    Dokumen Pendukung
                                </h5>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="photo_path" class="form-label">Foto 3x4</label>
                                    <input type="file" name="photo_path" id="photo_path" 
                                           class="form-control @error('photo_path') is-invalid @enderror" 
                                           accept=".jpg,.jpeg,.png">
                                    <small class="form-text text-muted">
                                        Format: JPG, PNG. Maksimal 2MB.
                                    </small>
                                    @error('photo_path')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="ijazah_path" class="form-label">Ijazah/SKHUN</label>
                                    <input type="file" name="ijazah_path" id="ijazah_path" 
                                           class="form-control @error('ijazah_path') is-invalid @enderror" 
                                           accept=".pdf,.jpg,.jpeg,.png">
                                    <small class="form-text text-muted">
                                        Format: PDF, JPG, PNG. Maksimal 5MB.
                                    </small>
                                    @error('ijazah_path')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="kk_path" class="form-label">Kartu Keluarga</label>
                                    <input type="file" name="kk_path" id="kk_path" 
                                           class="form-control @error('kk_path') is-invalid @enderror" 
                                           accept=".pdf,.jpg,.jpeg,.png">
                                    <small class="form-text text-muted">
                                        Format: PDF, JPG, PNG. Maksimal 5MB.
                                    </small>
                                    @error('kk_path')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <div class="mb-3">
                                    <label for="documents" class="form-label">Dokumen Pendukung Lainnya</label>
                                    <input type="file" name="documents[]" id="documents" 
                                           class="form-control @error('documents') is-invalid @enderror" 
                                           multiple accept=".pdf,.jpg,.jpeg,.png">
                                    <small class="form-text text-muted">
                                        Format yang diperbolehkan: PDF, JPG, PNG. Maksimal 5MB per file.
                                    </small>
                                    @error('documents')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('tenant.ppdb.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>Kembali
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>Simpan Pendaftaran
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
$(document).ready(function() {
    // Format currency input
    $('#parent_income').on('input', function() {
        var value = $(this).val().replace(/[^\d]/g, '');
        $(this).val(value);
    });

    // File upload validation
    function validateFile(input, maxSize, allowedTypes) {
        var files = input.files;
        
        for (var i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                alert('File ' + files[i].name + ' terlalu besar. Maksimal ' + (maxSize / 1024 / 1024) + 'MB.');
                input.value = '';
                return false;
            }
            
            if (!allowedTypes.includes(files[i].type)) {
                alert('Format file ' + files[i].name + ' tidak diperbolehkan.');
                input.value = '';
                return false;
            }
        }
        return true;
    }

    // Photo validation
    $('#photo_path').on('change', function() {
        var maxSize = 2 * 1024 * 1024; // 2MB
        var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        validateFile(this, maxSize, allowedTypes);
    });

    // Document validation
    $('#ijazah_path, #kk_path').on('change', function() {
        var maxSize = 5 * 1024 * 1024; // 5MB
        var allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        validateFile(this, maxSize, allowedTypes);
    });

    // Multiple documents validation
    $('#documents').on('change', function() {
        var maxSize = 5 * 1024 * 1024; // 5MB
        var allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        validateFile(this, maxSize, allowedTypes);
    });
});
</script>
@endpush
