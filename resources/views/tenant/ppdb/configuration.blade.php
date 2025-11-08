@extends('layouts.tenant')

@section('title', 'Konfigurasi PPDB/SPMB')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="{{ tenant_route('dashboard') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ tenant_route('tenant.ppdb.dashboard') }}">PPDB</a></li>
                        <li class="breadcrumb-item active">Konfigurasi</li>
                    </ol>
                </div>
                <h4 class="page-title">
                    <i class="fas fa-cogs me-2"></i>Konfigurasi PPDB/SPMB
                </h4>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">Daftar Konfigurasi PPDB</h5>
                        <a href="{{ tenant_route('tenant.ppdb.configuration.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>Tambah Konfigurasi
                        </a>
                    </div>

                    @if($configurations->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th width="5%">No</th>
                                        <th width="15%">Tahun Ajaran</th>
                                        <th width="15%">Gelombang</th>
                                        <th width="12%">Pendaftaran</th>
                                        <th width="12%">Pengumuman</th>
                                        <th width="12%">Daftar Ulang</th>
                                        <th width="10%">Status</th>
                                        <th width="19%">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($configurations as $index => $config)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td>
                                            <strong>{{ $config->academic_year }}</strong>
                                        </td>
                                        <td>
                                            <span class="badge bg-info">{{ $config->batch_name }}</span>
                                        </td>
                                        <td>
                                            <small>
                                                <strong>Mulai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($config->registration_start) }}<br>
                                                <strong>Selesai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($config->registration_end) }}
                                            </small>
                                        </td>
                                        <td>
                                            <small>{{ \App\Helpers\DateHelper::formatIndonesian($config->announcement_date) }}</small>
                                        </td>
                                        <td>
                                            <small>
                                                <strong>Mulai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($config->re_registration_start) }}<br>
                                                <strong>Selesai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($config->re_registration_end) }}
                                            </small>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $config->status_color }}">
                                                {{ $config->status }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('tenant.ppdb.configuration.edit', $config) }}" 
                                                   class="btn btn-sm btn-outline-primary" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.ppdb.configuration.toggle', $config) }}" 
                                                      method="POST" style="display: inline;">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-{{ $config->is_active ? 'warning' : 'success' }}" 
                                                            title="{{ $config->is_active ? 'Nonaktifkan' : 'Aktifkan' }}">
                                                        <i class="fas fa-{{ $config->is_active ? 'pause' : 'play' }}"></i>
                                                    </button>
                                                </form>
                                                <form action="{{ tenant_route('tenant.ppdb.configuration.run-selection', $config) }}" 
                                                      method="POST" style="display: inline;" onsubmit="return confirm('Jalankan seleksi sekarang?');">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-success" title="Jalankan Seleksi">
                                                        <i class="fas fa-list-ol"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <div class="text-muted">
                                <i class="fas fa-cogs fa-3x mb-3"></i>
                                <h5>Belum ada konfigurasi PPDB</h5>
                                <p>Silakan buat konfigurasi PPDB pertama Anda.</p>
                                <a href="{{ tenant_route('tenant.ppdb.configuration.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>Buat Konfigurasi
                                </a>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
