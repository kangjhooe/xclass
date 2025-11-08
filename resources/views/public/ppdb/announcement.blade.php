@extends('layouts.app')

@section('title', 'Pengumuman PPDB/SPMB')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3 class="card-title mb-0">
                        <i class="fas fa-bullhorn me-2"></i>
                        Pengumuman PPDB/SPMB
                    </h3>
                </div>
                <div class="card-body">
                    @if(isset($config) && isset($announcementOpen) && !$announcementOpen)
                        <div class="alert alert-warning">
                            Pengumuman belum dibuka. Tanggal pengumuman: <strong>{{ \App\Helpers\DateHelper::formatIndonesian($config->announcement_date) }}</strong>.
                        </div>
                    @endif
                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <div class="row">
                        <div class="col-md-8">
                            <div class="card border-info">
                                <div class="card-header bg-info text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-search me-2"></i>Cek Hasil Seleksi
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <form method="POST" action="{{ route('public.ppdb.check-result') }}">
                                        @csrf
                                        <div class="mb-3">
                                            <label for="registration_number" class="form-label">Nomor Pendaftaran</label>
                                            <input type="text" class="form-control" id="registration_number" name="registration_number" 
                                                   placeholder="Masukkan nomor pendaftaran Anda" required>
                                            <div class="form-text">Contoh: PPDB-2025-0001</div>
                                        </div>
                                        
                                        <div class="d-grid">
                                            <button type="submit" class="btn btn-info">
                                                <i class="fas fa-search me-2"></i>
                                                Cek Hasil
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card border-warning">
                                <div class="card-header bg-warning text-dark">
                                    <h6 class="mb-0">
                                        <i class="fas fa-info-circle me-2"></i>Informasi
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <ul class="list-unstyled mb-0">
                                        <li class="mb-2">
                                            <i class="fas fa-calendar text-primary me-2"></i>
                                            <strong>Periode Pendaftaran:</strong><br>
                                            <small>1 Januari - 31 Maret 2025</small>
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-clock text-success me-2"></i>
                                            <strong>Pengumuman:</strong><br>
                                            <small>15 April 2025</small>
                                        </li>
                                        <li class="mb-2">
                                            <i class="fas fa-user-check text-info me-2"></i>
                                            <strong>Daftar Ulang:</strong><br>
                                            <small>20-25 April 2025</small>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    @if(isset($announcementOpen) && !$announcementOpen)
                        <div class="alert alert-warning mt-4">
                            <i class="fas fa-clock me-2"></i>
                            <strong>Pengumuman belum dibuka.</strong> 
                            @if(isset($config) && $config && $config->announcement_date)
                                Pengumuman akan dibuka pada tanggal: <strong>{{ \App\Helpers\DateHelper::formatIndonesian($config->announcement_date) }}</strong>
                            @endif
                        </div>
                    @elseif(isset($announcementOpen) && $announcementOpen && isset($grouped) && $grouped->count() > 0)
                    <div class="row">
                        <div class="col-12">
                            <form method="GET" class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <select name="major" class="form-select">
                                        <option value="">Semua Jurusan</option>
                                        @if(isset($config) && $config && is_array($config->available_majors))
                                            @foreach($config->available_majors as $mj)
                                                <option value="{{ $mj }}" {{ ($selectedMajor ?? '') === $mj ? 'selected' : '' }}>{{ $mj }}</option>
                                            @endforeach
                                        @endif
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <select name="path" class="form-select">
                                        <option value="">Semua Jalur</option>
                                        @if(isset($config) && $config && is_array($config->admission_paths))
                                            @foreach($config->admission_paths as $jp)
                                                <option value="{{ $jp }}" {{ ($selectedPath ?? '') === $jp ? 'selected' : '' }}>{{ $jp }}</option>
                                            @endforeach
                                        @endif
                                    </select>
                                </div>
                                <div class="col-md-4 d-grid">
                                    <div class="btn-group">
                                        <button class="btn btn-outline-primary" type="submit"><i class="fas fa-filter me-1"></i> Terapkan Filter</button>
                                        <a class="btn btn-success" href="{{ route('public.ppdb.export-accepted', ['major' => $selectedMajor, 'path' => $selectedPath]) }}">
                                            <i class="fas fa-file-excel me-1"></i> Ekspor Excel
                                        </a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card border-success">
                                <div class="card-header bg-success text-white">
                                    <h5 class="mb-0">
                                        <i class="fas fa-graduation-cap me-2"></i>Daftar Diterima (Berdasarkan Seleksi)
                                    </h5>
                                </div>
                                <div class="card-body">
                                    @foreach($grouped as $key => $items)
                                        @php([$mj, $jp] = explode('||', $key))
                                        <h6 class="mt-3">Jurusan: <strong>{{ $mj }}</strong> — Jalur: <strong>{{ $jp }}</strong></h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th width="5%">No</th>
                                                        <th width="20%">No. Pendaftaran</th>
                                                        <th>Nama</th>
                                                        <th width="10%">Skor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($items as $i => $app)
                                                    <tr>
                                                        <td>{{ $i+1 }}</td>
                                                        <td>{{ $app->registration_number }}</td>
                                                        <td>{{ $app->full_name }}</td>
                                                        <td>{{ $app->total_score ?? '-' }}</td>
                                                    </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @endforeach

                                    @if(isset($accepted) && $accepted->hasPages())
                                        <div class="mt-4">
                                            {{ $accepted->links() }}
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                    @elseif(isset($announcementOpen) && $announcementOpen)
                        <div class="alert alert-info mt-4">
                            <i class="fas fa-info-circle me-2"></i>
                            Belum ada data yang diterima untuk ditampilkan.
                        </div>
                    @endif

                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <a href="{{ route('public.ppdb.index') }}" class="btn btn-primary me-md-2">
                                    <i class="fas fa-user-plus me-2"></i>Daftar PPDB
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

<script></script>
@endsection
