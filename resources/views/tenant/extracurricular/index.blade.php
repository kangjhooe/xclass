@extends('layouts.tenant')

@section('title', 'Ekstrakurikuler')
@section('page-title', 'Ekstrakurikuler')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-running me-2"></i>
                        Manajemen Ekstrakurikuler
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('extracurricular.activities.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Kegiatan
                                </a>
                                <a href="{{ tenant_route('extracurricular.activities') }}" class="btn btn-info">
                                    <i class="fas fa-list me-1"></i>
                                    Daftar Kegiatan
                                </a>
                                <a href="{{ tenant_route('extracurricular.participants') }}" class="btn btn-success">
                                    <i class="fas fa-users me-1"></i>
                                    Peserta
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari kegiatan...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_activities'] }}</h4>
                                            <small>Total Kegiatan</small>
                                        </div>
                                        <i class="fas fa-running fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['active_activities'] }}</h4>
                                            <small>Aktif</small>
                                        </div>
                                        <i class="fas fa-play fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_participants'] }}</h4>
                                            <small>Total Peserta</small>
                                        </div>
                                        <i class="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['this_month_activities'] }}</h4>
                                            <small>Bulan Ini</small>
                                        </div>
                                        <i class="fas fa-clock fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Kegiatan</th>
                                    <th>Jenis</th>
                                    <th>Pembina</th>
                                    <th>Jadwal</th>
                                    <th>Peserta</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Pramuka</td>
                                    <td>Wajib</td>
                                    <td>Bu Sari</td>
                                    <td>Sabtu 08:00</td>
                                    <td>25</td>
                                    <td><span class="badge bg-success">Aktif</span></td>
                                    <td>
                                        <a href="#" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="#" class="btn btn-sm btn-outline-warning">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Basket</td>
                                    <td>Pilihan</td>
                                    <td>Pak Budi</td>
                                    <td>Selasa 15:00</td>
                                    <td>15</td>
                                    <td><span class="badge bg-success">Aktif</span></td>
                                    <td>
                                        <a href="#" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="#" class="btn btn-sm btn-outline-warning">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
