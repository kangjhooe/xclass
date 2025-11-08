@extends('layouts.app')

@section('title', 'Hasil Seleksi PPDB/SPMB')

@section('content')
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-clipboard-check me-2"></i>
                        Hasil Seleksi PPDB/SPMB
                    </h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">
                                        <i class="fas fa-user me-2"></i>Data Pendaftar
                                    </h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Nomor Pendaftaran:</strong> {{ $application->registration_number }}</li>
                                        <li><strong>Nama:</strong> {{ $application->full_name }}</li>
                                        <li><strong>Jurusan:</strong> {{ $application->major_choice }}</li>
                                        <li><strong>Tahun Ajaran:</strong> {{ $application->academic_year }}</li>
                                        <li><strong>Gelombang:</strong> {{ $application->batch }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h6 class="card-title text-primary mb-3">Status Seleksi</h6>
                                    
                                    @if($application->status == 'accepted')
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                                            <h4 class="text-success">SELAMAT!</h4>
                                            <h5>Anda DITERIMA</h5>
                                            <p class="mb-0">Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.</p>
                                        </div>
                                    @elseif($application->status == 'rejected')
                                        <div class="alert alert-danger">
                                            <i class="fas fa-times-circle fa-3x text-danger mb-3"></i>
                                            <h4 class="text-danger">Maaf</h4>
                                            <h5>Anda TIDAK DITERIMA</h5>
                                            <p class="mb-0">Terima kasih telah mendaftar. Silakan coba lagi di periode berikutnya.</p>
                                        </div>
                                    @else
                                        <div class="alert alert-warning">
                                            <i class="fas fa-clock fa-3x text-warning mb-3"></i>
                                            <h4 class="text-warning">MENUNGGU</h4>
                                            <h5>Proses Verifikasi</h5>
                                            <p class="mb-0">Data Anda sedang dalam proses verifikasi. Silakan tunggu pengumuman selanjutnya.</p>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    @if($application->notes)
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card border-info">
                                    <div class="card-header bg-info text-white">
                                        <h6 class="mb-0">
                                            <i class="fas fa-sticky-note me-2"></i>Catatan
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-0">{{ $application->notes }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif

                    @if($application->status == 'accepted')
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card border-success">
                                    <div class="card-header bg-success text-white">
                                        <h6 class="mb-0">
                                            <i class="fas fa-list-check me-2"></i>Langkah Selanjutnya
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <ol class="mb-0">
                                            <li>Datang ke sekolah pada tanggal yang ditentukan</li>
                                            <li>Bawa dokumen asli untuk verifikasi</li>
                                            <li>Lakukan pembayaran sesuai ketentuan</li>
                                            <li>Ikuti orientasi siswa baru</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif

                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <a href="{{ route('public.ppdb.announcement') }}" class="btn btn-primary me-md-2">
                                    <i class="fas fa-search me-2"></i>Cek Pendaftaran Lain
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
            </div>
        </div>
    </div>
</div>
@endsection
