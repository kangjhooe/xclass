@extends('layouts.tenant')

@section('title', 'Inventori')
@section('page-title', 'Inventori')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-boxes me-2"></i>
                        Manajemen Inventori
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('inventory.items.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Barang
                                </a>
                                <a href="{{ tenant_route('inventory.items') }}" class="btn btn-info">
                                    <i class="fas fa-list me-1"></i>
                                    Daftar Barang
                                </a>
                                <a href="{{ tenant_route('inventory.movements') }}" class="btn btn-success">
                                    <i class="fas fa-exchange-alt me-1"></i>
                                    Pergerakan
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari barang...">
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
                                            <h4 class="mb-0">{{ $stats['total_items'] }}</h4>
                                            <small>Total Barang</small>
                                        </div>
                                        <i class="fas fa-box fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_items'] - $stats['low_stock_items'] - $stats['out_of_stock_items'] }}</h4>
                                            <small>Tersedia</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['low_stock_items'] }}</h4>
                                            <small>Stok Rendah</small>
                                        </div>
                                        <i class="fas fa-exclamation fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-danger text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['out_of_stock_items'] }}</h4>
                                            <small>Habis Stok</small>
                                        </div>
                                        <i class="fas fa-times fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive mt-4">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Kode Barang</th>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>Stok</th>
                                    <th>Satuan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>B001</td>
                                    <td>Buku Tulis</td>
                                    <td>Alat Tulis</td>
                                    <td>50</td>
                                    <td>Pcs</td>
                                    <td><span class="badge bg-success">Tersedia</span></td>
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
                                    <td>B002</td>
                                    <td>Pulpen</td>
                                    <td>Alat Tulis</td>
                                    <td>5</td>
                                    <td>Pcs</td>
                                    <td><span class="badge bg-warning">Hampir Habis</span></td>
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
