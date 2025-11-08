@extends('layouts.tenant')

@section('title', 'Detail Lahan')
@section('page-title', 'Detail Lahan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-map me-2"></i>
                            Detail Lahan
                        </h5>
                        <div class="btn-group">
                            <a href="{{ tenant_route('facility.lands.edit', $land->id) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i>
                                Edit
                            </a>
                            <a href="{{ tenant_route('facility.lands') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <th width="200">Nama Lahan</th>
                                    <td><strong>{{ $land->name }}</strong></td>
                                </tr>
                                <tr>
                                    <th>Luas</th>
                                    <td>
                                        {{ number_format($land->area, 2, ',', '.') }} 
                                        {{ $land->area_unit == 'm2' ? 'm²' : 'hektar' }}
                                    </td>
                                </tr>
                                <tr>
                                    <th>Lokasi</th>
                                    <td>{{ $land->location ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>
                                        @if($land->status == 'active')
                                            <span class="badge bg-success">Aktif</span>
                                        @elseif($land->status == 'inactive')
                                            <span class="badge bg-warning">Tidak Aktif</span>
                                        @else
                                            <span class="badge bg-info">Maintenance</span>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <th width="200">Jenis Kepemilikan</th>
                                    <td>{{ $land->ownership_type ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Nomor Kepemilikan</th>
                                    <td>{{ $land->ownership_number ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <th>Tanggal Pembelian</th>
                                    <td>
                                        @if($land->purchase_date)
                                            {{ \App\Helpers\DateHelper::formatIndonesian($land->purchase_date) }}
                                        @else
                                            -
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <th>Harga Pembelian</th>
                                    <td>
                                        @if($land->purchase_price)
                                            Rp {{ number_format($land->purchase_price, 2, ',', '.') }}
                                        @else
                                            -
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    @if($land->description)
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Deskripsi</h6>
                            <p class="text-muted">{{ $land->description }}</p>
                        </div>
                    </div>
                    @endif

                    <div class="row mt-3">
                        <div class="col-12">
                            <hr>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                Dibuat: {{ \App\Helpers\DateHelper::formatIndonesian($land->created_at, true) }} |
                                <i class="fas fa-edit me-1"></i>
                                Diperbarui: {{ \App\Helpers\DateHelper::formatIndonesian($land->updated_at, true) }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

