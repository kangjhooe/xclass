@extends('layouts.tenant')

@section('title', 'Detail Pendaftar PPDB/SPMB')

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
                        <li class="breadcrumb-item active">Detail</li>
                    </ol>
                </div>
                <h4 class="page-title">
                    <i class="fas fa-user me-2"></i>Detail Pendaftar
                </h4>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Data Pribadi -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-user me-2"></i>Data Pribadi
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ tenant_route('tenant.ppdb.verify-documents', $application) }}" class="mb-3">
                        @csrf
                        @method('PUT')
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Status Foto</label>
                                <select name="photo_status" class="form-select">
                                    <option value="">-</option>
                                    <option value="valid" {{ $application->photo_status=='valid' ? 'selected' : '' }}>Valid</option>
                                    <option value="revisi" {{ $application->photo_status=='revisi' ? 'selected' : '' }}>Perlu Revisi</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Status Ijazah</label>
                                <select name="ijazah_status" class="form-select">
                                    <option value="">-</option>
                                    <option value="valid" {{ $application->ijazah_status=='valid' ? 'selected' : '' }}>Valid</option>
                                    <option value="revisi" {{ $application->ijazah_status=='revisi' ? 'selected' : '' }}>Perlu Revisi</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Status KK</label>
                                <select name="kk_status" class="form-select">
                                    <option value="">-</option>
                                    <option value="valid" {{ $application->kk_status=='valid' ? 'selected' : '' }}>Valid</option>
                                    <option value="revisi" {{ $application->kk_status=='revisi' ? 'selected' : '' }}>Perlu Revisi</option>
                                </select>
                            </div>
                        </div>

                        <div class="mt-3">
                            <label class="form-label">Catatan Verifikasi</label>
                            <textarea name="verification_notes" class="form-control" rows="3" placeholder="Catatan revisi/validasi">{{ $application->verification_notes }}</textarea>
                        </div>

                        @if($application->documents && is_array($application->documents) && count($application->documents) > 0)
                        <div class="mt-4">
                            <h6 class="mb-3"><i class="fas fa-file-pdf me-2"></i>Dokumen Pendukung</h6>
                            @php
                                $docStatuses = $application->documents_status ?? [];
                            @endphp
                            @foreach($application->documents as $index => $docPath)
                                <div class="row mb-3 border-bottom pb-3">
                                    <div class="col-md-6">
                                        <strong>Dokumen {{ $index + 1 }}</strong><br>
                                        <small class="text-muted">{{ basename($docPath) }}</small><br>
                                        <a href="{{ Storage::url($docPath) }}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                            <i class="fas fa-download me-1"></i>Lihat/Download
                                        </a>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Status</label>
                                        <select name="documents_status[{{ $index }}]" class="form-select">
                                            <option value="pending" {{ (isset($docStatuses[$index]) && $docStatuses[$index] == 'pending') ? 'selected' : '' }}>Pending</option>
                                            <option value="valid" {{ (isset($docStatuses[$index]) && $docStatuses[$index] == 'valid') ? 'selected' : '' }}>Valid</option>
                                            <option value="revisi" {{ (isset($docStatuses[$index]) && $docStatuses[$index] == 'revisi') ? 'selected' : '' }}>Perlu Revisi</option>
                                        </select>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                        @endif

                        <div class="mt-3 d-flex justify-content-end">
                            <button type="submit" class="btn btn-warning">
                                <i class="fas fa-check me-1"></i> Simpan Verifikasi Berkas
                            </button>
                        </div>
                    </form>
                    <div class="row mb-3">
                        <div class="col-4">
                            @if($application->photo_path)
                                <img src="{{ Storage::url($application->photo_path) }}" 
                                     class="img-fluid rounded" alt="Foto Pendaftar">
                            @else
                                <div class="bg-light rounded d-flex align-items-center justify-content-center" 
                                     style="height: 150px;">
                                    <i class="fas fa-user fa-3x text-muted"></i>
                                </div>
                            @endif
                        </div>
                        <div class="col-8">
                            <h5 class="mb-1">{{ $application->full_name }}</h5>
                            <p class="text-muted mb-1">{{ $application->registration_number }}</p>
                            <span class="badge 
                                @if($application->status == 'pending') bg-warning
                                @elseif($application->status == 'accepted') bg-success
                                @else bg-danger
                                @endif">
                                {{ $application->status_label }}
                            </span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <strong>Email:</strong><br>
                            <span class="text-muted">{{ $application->email ?: '-' }}</span>
                        </div>
                        <div class="col-6">
                            <strong>No. Telepon:</strong><br>
                            <span class="text-muted">{{ $application->phone }}</span>
                        </div>
                    </div>

                    <hr>

                    <div class="row">
                        <div class="col-6">
                            <strong>Tanggal Lahir:</strong><br>
                            <span class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($application->birth_date) }}</span>
                        </div>
                        <div class="col-6">
                            <strong>Tempat Lahir:</strong><br>
                            <span class="text-muted">{{ $application->birth_place }}</span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <strong>Jenis Kelamin:</strong><br>
                            <span class="text-muted">{{ $application->gender_label }}</span>
                        </div>
                        <div class="col-6">
                            <strong>Jurusan:</strong><br>
                            <span class="badge bg-info">{{ $application->major_choice }}</span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <strong>Jalur Pendaftaran:</strong><br>
                            <span class="badge bg-secondary">{{ $application->registration_path_label }}</span>
                        </div>
                        <div class="col-6">
                            <strong>Penghasilan Orang Tua:</strong><br>
                            <span class="text-muted">
                                @if($application->parent_income)
                                    Rp {{ number_format($application->parent_income, 0, ',', '.') }}
                                @else
                                    -
                                @endif
                            </span>
                        </div>
                    </div>

                    <div class="mt-3">
                        <strong>Alamat:</strong><br>
                        <span class="text-muted">{{ $application->address }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Sekolah & Orang Tua -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-school me-2"></i>Data Sekolah & Orang Tua
                    </h5>
                </div>
                <div class="card-body">
                    <h6 class="text-primary">Asal Sekolah</h6>
                    <p class="mb-2"><strong>{{ $application->previous_school }}</strong></p>
                    <p class="text-muted small">{{ $application->previous_school_address }}</p>

                    <hr>

                    <h6 class="text-primary">Data Orang Tua</h6>
                    <div class="row">
                        <div class="col-12">
                            <strong>Nama:</strong> {{ $application->parent_name }}<br>
                            <strong>No. Telepon:</strong> {{ $application->parent_phone }}<br>
                            <strong>Pekerjaan:</strong> {{ $application->parent_occupation }}
                        </div>
                    </div>

                    <hr>

                    <h6 class="text-primary">Informasi Pendaftaran</h6>
                    <div class="row">
                        <div class="col-6">
                            <strong>Tahun Ajaran:</strong><br>
                            <span class="text-muted">{{ $application->academic_year }}</span>
                        </div>
                        <div class="col-6">
                            <strong>Gelombang:</strong><br>
                            <span class="text-muted">{{ $application->batch }}</span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <strong>Tanggal Daftar:</strong><br>
                            <span class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($application->created_at, true) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Nilai dan Informasi Tambahan -->
    @if($application->selection_score || $application->interview_score || $application->document_score || $application->total_score)
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-bar me-2"></i>Nilai dan Informasi Seleksi
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Seleksi</h6>
                                <h4 class="text-primary">{{ $application->selection_score ?? '-' }}</h4>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Wawancara</h6>
                                <h4 class="text-success">{{ $application->interview_score ?? '-' }}</h4>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Dokumen</h6>
                                <h4 class="text-warning">{{ $application->document_score ?? '-' }}</h4>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Total Nilai</h6>
                                <h4 class="text-info">{{ $application->total_score ?? '-' }}</h4>
                            </div>
                        </div>
                    </div>

                    @if($application->selection_date || $application->announcement_date || $application->accepted_date)
                    <hr>
                    <div class="row">
                        @if($application->selection_date)
                        <div class="col-md-4">
                            <strong>Tanggal Seleksi:</strong><br>
                            <span class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($application->selection_date, true) }}</span>
                        </div>
                        @endif
                        @if($application->announcement_date)
                        <div class="col-md-4">
                            <strong>Tanggal Pengumuman:</strong><br>
                            <span class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($application->announcement_date, true) }}</span>
                        </div>
                        @endif
                        @if($application->accepted_date)
                        <div class="col-md-4">
                            <strong>Tanggal Diterima:</strong><br>
                            <span class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($application->accepted_date, true) }}</span>
                        </div>
                        @endif
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
    @endif

    <!-- Berkas Upload -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-warning text-dark">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-file-upload me-2"></i>Berkas Upload
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="text-center">
                                <h6>Foto 3x4</h6>
                                @if($application->photo_path)
                                    <img src="{{ Storage::url($application->photo_path) }}" 
                                         class="img-fluid rounded border" style="max-height: 200px;" alt="Foto">
                                    <div class="mt-2">
                                        <a href="{{ Storage::url($application->photo_path) }}" 
                                           target="_blank" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-download me-1"></i>Download
                                        </a>
                                    </div>
                                @else
                                    <div class="bg-light rounded border d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-image fa-2x text-muted"></i>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="text-center">
                                <h6>Ijazah/SKHUN</h6>
                                @if($application->ijazah_path)
                                    <div class="bg-light rounded border d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-file-pdf fa-3x text-danger"></i>
                                    </div>
                                    <div class="mt-2">
                                        <a href="{{ Storage::url($application->ijazah_path) }}" 
                                           target="_blank" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-download me-1"></i>Download
                                        </a>
                                    </div>
                                @else
                                    <div class="bg-light rounded border d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-file fa-2x text-muted"></i>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="text-center">
                                <h6>Kartu Keluarga</h6>
                                @if($application->kk_path)
                                    <div class="bg-light rounded border d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-file-pdf fa-3x text-danger"></i>
                                    </div>
                                    <div class="mt-2">
                                        <a href="{{ Storage::url($application->kk_path) }}" 
                                           target="_blank" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-download me-1"></i>Download
                                        </a>
                                    </div>
                                @else
                                    <div class="bg-light rounded border d-flex align-items-center justify-content-center" 
                                         style="height: 200px;">
                                        <i class="fas fa-file fa-2x text-muted"></i>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Update Status -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-edit me-2"></i>Update Status
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('tenant.ppdb.update-status', $application) }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status Pendaftaran</label>
                                    <select class="form-select" id="status" name="status" required>
                                        <option value="pending" {{ $application->status == 'pending' ? 'selected' : '' }}>Menunggu</option>
                                        <option value="registered" {{ $application->status == 'registered' ? 'selected' : '' }}>Terdaftar</option>
                                        <option value="selection" {{ $application->status == 'selection' ? 'selected' : '' }}>Seleksi</option>
                                        <option value="announced" {{ $application->status == 'announced' ? 'selected' : '' }}>Diumumkan</option>
                                        <option value="accepted" {{ $application->status == 'accepted' ? 'selected' : '' }}>Diterima</option>
                                        <option value="rejected" {{ $application->status == 'rejected' ? 'selected' : '' }}>Ditolak</option>
                                        <option value="cancelled" {{ $application->status == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Catatan</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="3" 
                                              placeholder="Tambahkan catatan jika diperlukan">{{ $application->notes }}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="selection_score" class="form-label">Nilai Seleksi</label>
                                    <input type="number" class="form-control" id="selection_score" name="selection_score" 
                                           value="{{ $application->selection_score }}" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="interview_score" class="form-label">Nilai Wawancara</label>
                                    <input type="number" class="form-control" id="interview_score" name="interview_score" 
                                           value="{{ $application->interview_score }}" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="document_score" class="form-label">Nilai Dokumen</label>
                                    <input type="number" class="form-control" id="document_score" name="document_score" 
                                           value="{{ $application->document_score }}" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="rejected_reason" class="form-label">Alasan Ditolak</label>
                                    <textarea class="form-control" id="rejected_reason" name="rejected_reason" rows="3" 
                                              placeholder="Tambahkan alasan jika ditolak">{{ $application->rejected_reason }}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('tenant.ppdb.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>Kembali
                            </a>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-1"></i>Update Status
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
