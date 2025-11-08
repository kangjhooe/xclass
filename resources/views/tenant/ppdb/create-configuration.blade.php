@extends('layouts.tenant')

@section('title', 'Tambah Konfigurasi PPDB/SPMB')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="{{ tenant_route('dashboard') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ tenant_route('tenant.ppdb.dashboard') }}">PPDB</a></li>
                        <li class="breadcrumb-item"><a href="{{ tenant_route('tenant.ppdb.configuration') }}">Konfigurasi</a></li>
                        <li class="breadcrumb-item active">Tambah</li>
                    </ol>
                </div>
                <h4 class="page-title">
                    <i class="fas fa-plus me-2"></i>Tambah Konfigurasi PPDB/SPMB
                </h4>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <form action="{{ tenant_route('tenant.ppdb.configuration.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="academic_year" class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="academic_year" name="academic_year" 
                                           value="{{ old('academic_year') }}" placeholder="2024/2025" required>
                                    @error('academic_year')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="batch_name" class="form-label">Nama Gelombang <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="batch_name" name="batch_name" 
                                           value="{{ old('batch_name') }}" placeholder="Gelombang 1" required>
                                    @error('batch_name')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="registration_start" class="form-label">Tanggal Mulai Pendaftaran <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="registration_start" name="registration_start" 
                                           value="{{ old('registration_start') }}" required>
                                    @error('registration_start')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="registration_end" class="form-label">Tanggal Selesai Pendaftaran <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="registration_end" name="registration_end" 
                                           value="{{ old('registration_end') }}" required>
                                    @error('registration_end')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="announcement_date" class="form-label">Tanggal Pengumuman <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="announcement_date" name="announcement_date" 
                                           value="{{ old('announcement_date') }}" required>
                                    @error('announcement_date')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="re_registration_start" class="form-label">Tanggal Mulai Daftar Ulang <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="re_registration_start" name="re_registration_start" 
                                           value="{{ old('re_registration_start') }}" required>
                                    @error('re_registration_start')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="re_registration_end" class="form-label">Tanggal Selesai Daftar Ulang <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="re_registration_end" name="re_registration_end" 
                                           value="{{ old('re_registration_end') }}" required>
                                    @error('re_registration_end')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Jurusan yang Tersedia (pisahkan dengan koma) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="available_majors_text" placeholder="Mis: RPL, TKJ, AKL" value="{{ old('available_majors_text') }}">
                                    @error('available_majors_text')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                            </div>
                                        </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Jalur Pendaftaran (pisahkan dengan koma)</label>
                                    <input type="text" class="form-control" name="admission_paths_text" placeholder="Mis: Zonasi, Prestasi, Afirmasi, Umum" value="{{ old('admission_paths_text') }}">
                                    @error('admission_paths_text')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Kuota (JSON per jurusan–jalur)</label>
                            <textarea class="form-control" name="quotas_json" rows="4" placeholder='Contoh: {"RPL": {"Zonasi": 20, "Prestasi": 10}, "TKJ": {"Umum": 36}}'>{{ old('quotas_json') }}</textarea>
                            <div class="form-text">Biarkan kosong jika tidak memakai kuota per jalur.</div>
                            @error('quotas_json')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="max_applications" class="form-label">Maksimal Pendaftar</label>
                                    <input type="number" class="form-control" id="max_applications" name="max_applications" 
                                           value="{{ old('max_applications') }}" min="1" placeholder="Kosongkan untuk tidak terbatas">
                                    @error('max_applications')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="registration_fee" class="form-label">Biaya Pendaftaran (Rp)</label>
                                    <input type="number" class="form-control" id="registration_fee" name="registration_fee" 
                                           value="{{ old('registration_fee') }}" min="0" step="1000" placeholder="0">
                                    @error('registration_fee')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="auto_approval" name="auto_approval" 
                                               {{ old('auto_approval') ? 'checked' : '' }}>
                                        <label class="form-check-label" for="auto_approval">
                                            Auto Approval
                                        </label>
                                    </div>
                                    @error('auto_approval')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="is_active" name="is_active" 
                                               {{ old('is_active') ? 'checked' : '' }}>
                                        <label class="form-check-label" for="is_active">
                                            Aktifkan Konfigurasi
                                        </label>
                                    </div>
                                    @error('is_active')
                                        <div class="text-danger small">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Deskripsi</label>
                            <textarea class="form-control" id="description" name="description" rows="3" 
                                      placeholder="Tambahkan deskripsi konfigurasi PPDB">{{ old('description') }}</textarea>
                            @error('description')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('tenant.ppdb.configuration') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>Kembali
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>Simpan Konfigurasi
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
    $('#registration_fee').on('input', function() {
        var value = $(this).val().replace(/[^\d]/g, '');
        $(this).val(value);
    });

    // Date validation
    $('#registration_start').on('change', function() {
        var startDate = new Date(this.value);
        var endDateInput = document.getElementById('registration_end');
        endDateInput.min = this.value;
    });

    $('#registration_end').on('change', function() {
        var endDate = new Date(this.value);
        var announcementInput = document.getElementById('announcement_date');
        announcementInput.min = this.value;
    });

    $('#announcement_date').on('change', function() {
        var announcementDate = new Date(this.value);
        var reRegStartInput = document.getElementById('re_registration_start');
        reRegStartInput.min = this.value;
    });

    $('#re_registration_start').on('change', function() {
        var reRegStartDate = new Date(this.value);
        var reRegEndInput = document.getElementById('re_registration_end');
        reRegEndInput.min = this.value;
    });
});
</script>
@endpush
