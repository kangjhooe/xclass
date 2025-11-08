@extends('layouts.app')

@section('title', 'Detail Pendaftaran PPDB/SPMB')

@section('content')
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                        <a href="{{ route('home') }}">
                            <i class="fas fa-home me-1"></i>Beranda
                        </a>
                    </li>
                    <li class="breadcrumb-item">
                        <a href="{{ route('public.ppdb.index') }}">PPDB</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">
                        Detail Pendaftaran
                    </li>
                </ol>
            </nav>

            <!-- Header Card -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-user-graduate me-2"></i>
                        Detail Pendaftaran PPDB/SPMB
                    </h3>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <h5 class="text-primary mb-3">
                                <i class="fas fa-id-card me-2"></i>Informasi Pendaftaran
                            </h5>
                            <table class="table table-borderless">
                                <tr>
                                    <td width="40%"><strong>Nomor Pendaftaran:</strong></td>
                                    <td>{{ $application->registration_number }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td>
                                        @if($application->status == 'accepted')
                                            <span class="badge bg-success">{{ $application->status_label }}</span>
                                        @elseif($application->status == 'rejected')
                                            <span class="badge bg-danger">{{ $application->status_label }}</span>
                                        @elseif($application->status == 'announced')
                                            <span class="badge bg-info">{{ $application->status_label }}</span>
                                        @elseif($application->status == 'selection')
                                            <span class="badge bg-warning">{{ $application->status_label }}</span>
                                        @else
                                            <span class="badge bg-secondary">{{ $application->status_label }}</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Tahun Ajaran:</strong></td>
                                    <td>{{ $application->academic_year }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gelombang:</strong></td>
                                    <td>{{ $application->batch }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Jalur Pendaftaran:</strong></td>
                                    <td>{{ $application->registration_path_label }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Tanggal Pendaftaran:</strong></td>
                                    <td>{{ $application->registration_date ? \App\Helpers\DateHelper::formatIndonesian($application->registration_date, true) : '-' }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h5 class="text-primary mb-3">
                                <i class="fas fa-user me-2"></i>Data Pribadi
                            </h5>
                            <table class="table table-borderless">
                                <tr>
                                    <td width="40%"><strong>Nama Lengkap:</strong></td>
                                    <td>{{ $application->full_name }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Jenis Kelamin:</strong></td>
                                    <td>{{ $application->gender_label }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Tempat, Tanggal Lahir:</strong></td>
                                    <td>{{ $application->birth_place }}, {{ $application->birth_date ? \App\Helpers\DateHelper::formatIndonesian($application->birth_date) : '-' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td>{{ $application->email ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>No. Telepon:</strong></td>
                                    <td>{{ $application->phone }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Alamat:</strong></td>
                                    <td>{{ $application->address }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Sekolah & Orang Tua -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-school me-2"></i>Data Sekolah & Orang Tua
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-primary mb-3">Data Sekolah</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td width="40%"><strong>Asal Sekolah:</strong></td>
                                    <td>{{ $application->previous_school }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Alamat Sekolah:</strong></td>
                                    <td>{{ $application->previous_school_address }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Pilihan Jurusan:</strong></td>
                                    <td>{{ $application->major_choice }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary mb-3">Data Orang Tua</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td width="40%"><strong>Nama Orang Tua:</strong></td>
                                    <td>{{ $application->parent_name }}</td>
                                </tr>
                                <tr>
                                    <td><strong>No. Telepon:</strong></td>
                                    <td>{{ $application->parent_phone }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Pekerjaan:</strong></td>
                                    <td>{{ $application->parent_occupation }}</td>
                                </tr>
                                @if($application->parent_income)
                                <tr>
                                    <td><strong>Penghasilan:</strong></td>
                                    <td>Rp {{ number_format($application->parent_income, 0, ',', '.') }}</td>
                                </tr>
                                @endif
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nilai & Seleksi -->
            @if($application->total_score || $application->selection_score)
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-line me-2"></i>Hasil Seleksi
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        @if($application->selection_score)
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Seleksi</h6>
                                <h3 class="text-primary">{{ number_format($application->selection_score, 2) }}</h3>
                            </div>
                        </div>
                        @endif
                        @if($application->interview_score)
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Wawancara</h6>
                                <h3 class="text-info">{{ number_format($application->interview_score, 2) }}</h3>
                            </div>
                        </div>
                        @endif
                        @if($application->document_score)
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Dokumen</h6>
                                <h3 class="text-success">{{ number_format($application->document_score, 2) }}</h3>
                            </div>
                        </div>
                        @endif
                        @if($application->total_score)
                        <div class="col-md-3">
                            <div class="text-center">
                                <h6 class="text-muted">Nilai Total</h6>
                                <h3 class="text-danger">{{ number_format($application->total_score, 2) }}</h3>
                            </div>
                        </div>
                        @endif
                    </div>
                    @if($application->selection_date)
                    <div class="row mt-3">
                        <div class="col-12">
                            <p class="text-muted mb-0">
                                <i class="fas fa-calendar me-2"></i>
                                Tanggal Seleksi: {{ \App\Helpers\DateHelper::formatIndonesian($application->selection_date, true) }}
                            </p>
                        </div>
                    </div>
                    @endif
                    @if($application->announcement_date)
                    <div class="row mt-2">
                        <div class="col-12">
                            <p class="text-muted mb-0">
                                <i class="fas fa-bullhorn me-2"></i>
                                Tanggal Pengumuman: {{ \App\Helpers\DateHelper::formatIndonesian($application->announcement_date, true) }}
                            </p>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            @endif

            <!-- Status Info -->
            @if($application->status == 'accepted')
            <div class="alert alert-success">
                <div class="d-flex align-items-center">
                    <i class="fas fa-check-circle fa-3x me-3"></i>
                    <div>
                        <h4 class="alert-heading mb-2">Selamat! Anda Diterima</h4>
                        <p class="mb-0">Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.</p>
                        @if($application->accepted_date)
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            Diterima pada: {{ \App\Helpers\DateHelper::formatIndonesian($application->accepted_date, true) }}
                        </small>
                        @endif
                    </div>
                </div>
            </div>
            @elseif($application->status == 'rejected')
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <i class="fas fa-times-circle fa-3x me-3"></i>
                    <div>
                        <h4 class="alert-heading mb-2">Maaf, Anda Tidak Diterima</h4>
                        <p class="mb-0">Terima kasih telah mendaftar. Silakan coba lagi di periode berikutnya.</p>
                        @if($application->rejected_reason)
                        <div class="mt-3">
                            <strong>Alasan:</strong>
                            <p class="mb-0">{{ $application->rejected_reason }}</p>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
            @else
            <div class="alert alert-info">
                <div class="d-flex align-items-center">
                    <i class="fas fa-clock fa-3x me-3"></i>
                    <div>
                        <h4 class="alert-heading mb-2">Proses Seleksi</h4>
                        <p class="mb-0">Data Anda sedang dalam proses seleksi. Silakan tunggu pengumuman selanjutnya.</p>
                    </div>
                </div>
            </div>
            @endif

            <!-- Catatan -->
            @if($application->notes)
            <div class="card border-info mb-4">
                <div class="card-header bg-info text-white">
                    <h6 class="mb-0">
                        <i class="fas fa-sticky-note me-2"></i>Catatan
                    </h6>
                </div>
                <div class="card-body">
                    <p class="mb-0">{{ $application->notes }}</p>
                </div>
            </div>
            @endif

            <!-- Action Buttons -->
            <div class="d-grid gap-2 d-md-flex justify-content-md-center mb-4">
                <a href="{{ route('public.ppdb.announcement') }}" class="btn btn-primary me-md-2">
                    <i class="fas fa-bullhorn me-2"></i>Cek Pengumuman
                </a>
                <a href="{{ route('public.ppdb.index') }}" class="btn btn-outline-secondary me-md-2">
                    <i class="fas fa-user-plus me-2"></i>Daftar Lagi
                </a>
                <a href="{{ route('home') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-home me-2"></i>Kembali ke Beranda
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

