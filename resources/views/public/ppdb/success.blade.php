@extends('layouts.app')

@section('title', 'Pendaftaran Berhasil')

@section('content')
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card border-success">
                <div class="card-header bg-success text-white text-center">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-check-circle me-2"></i>
                        Pendaftaran Berhasil!
                    </h3>
                </div>
                <div class="card-body text-center">
                    <div class="mb-4">
                        <i class="fas fa-user-graduate text-success" style="font-size: 4rem;"></i>
                    </div>
                    
                    <h4 class="text-success mb-3">Selamat {{ $application->full_name }}!</h4>
                    
                    <div class="alert alert-info">
                        <h5 class="alert-heading">Nomor Pendaftaran Anda</h5>
                        <h3 class="text-primary mb-0">{{ $application->registration_number }}</h3>
                        <hr>
                        <p class="mb-0">Simpan nomor pendaftaran ini untuk mengecek hasil seleksi nanti.</p>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">
                                        <i class="fas fa-info-circle me-2"></i>Informasi Pendaftaran
                                    </h6>
                                    <ul class="list-unstyled mb-0">
                                        <li><strong>Nama:</strong> {{ $application->full_name }}</li>
                                        <li><strong>Jurusan:</strong> {{ $application->major_choice }}</li>
                                        <li><strong>Tahun Ajaran:</strong> {{ $application->academic_year }}</li>
                                        <li><strong>Gelombang:</strong> {{ $application->batch }}</li>
                                        <li><strong>Tanggal Daftar:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($application->created_at, true) }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6 class="card-title text-warning">
                                        <i class="fas fa-clock me-2"></i>Langkah Selanjutnya
                                    </h6>
                                    <ol class="mb-0">
                                        <li>Tunggu proses verifikasi dokumen</li>
                                        <li>Pantau pengumuman hasil seleksi</li>
                                        <li>Jika diterima, lakukan daftar ulang</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                            <a href="{{ route('public.ppdb.announcement') }}" class="btn btn-primary me-md-2">
                                <i class="fas fa-bullhorn me-2"></i>Cek Pengumuman
                            </a>
                            <a href="{{ route('public.ppdb.index') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-plus me-2"></i>Daftar Lagi
                            </a>
                        </div>
                    </div>

                    <div class="mt-4">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Jika ada pertanyaan, silakan hubungi panitia PPDB.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
