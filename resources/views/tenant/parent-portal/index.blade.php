@extends('layouts.tenant')

@section('title', 'Portal Orang Tua')
@section('page-title', 'Portal Orang Tua')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-users me-2"></i>
                        Portal Orang Tua
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('parent-portal.parents.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Orang Tua
                                </a>
                                <a href="{{ tenant_route('parent-portal.notifications') }}" class="btn btn-info">
                                    <i class="fas fa-bell me-1"></i>
                                    Notifikasi
                                </a>
                                <a href="{{ tenant_route('parent-portal.messages') }}" class="btn btn-success">
                                    <i class="fas fa-envelope me-1"></i>
                                    Pesan
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari orang tua...">
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
                                            <h4 class="mb-0">{{ $stats['total_parents'] }}</h4>
                                            <small>Total Orang Tua</small>
                                        </div>
                                        <i class="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['active_parents'] }}</h4>
                                            <small>Aktif</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_notifications'] }}</h4>
                                            <small>Notifikasi</small>
                                        </div>
                                        <i class="fas fa-bell fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['unread_notifications'] }}</h4>
                                            <small>Belum Dibaca</small>
                                        </div>
                                        <i class="fas fa-envelope fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nama Orang Tua</th>
                                    <th>Email</th>
                                    <th>No. HP</th>
                                    <th>Anak</th>
                                    <th>Status</th>
                                    <th>Terakhir Login</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Budi Santoso</td>
                                    <td>budi@email.com</td>
                                    <td>08123456789</td>
                                    <td>Ahmad (X-1)</td>
                                    <td><span class="badge bg-success">Aktif</span></td>
                                    <td>2 hari lalu</td>
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
                                    <td>Siti Rahayu</td>
                                    <td>siti@email.com</td>
                                    <td>08198765432</td>
                                    <td>Sarah (IX-2)</td>
                                    <td><span class="badge bg-success">Aktif</span></td>
                                    <td>1 hari lalu</td>
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
