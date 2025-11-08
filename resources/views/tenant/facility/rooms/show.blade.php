@extends('layouts.tenant')

@section('title', 'Detail Ruangan')
@section('page-title', 'Detail Ruangan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-door-open me-2"></i>
                            Detail Ruangan: {{ $room->name }}
                        </h5>
                        <div>
                            <a href="{{ tenant_route('facility.rooms.edit', $room->id) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i>
                                Edit
                            </a>
                            <a href="{{ tenant_route('facility.rooms') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Informasi Ruangan</h6>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Nama Ruangan:</strong></td>
                                    <td>{{ $room->name }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gedung:</strong></td>
                                    <td>{{ $room->building_name ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Jenis:</strong></td>
                                    <td>
                                        @switch($room->type)
                                            @case('classroom')
                                                <span class="badge bg-primary">Kelas</span>
                                                @break
                                            @case('office')
                                                <span class="badge bg-info">Kantor</span>
                                                @break
                                            @case('library')
                                                <span class="badge bg-success">Perpustakaan</span>
                                                @break
                                            @case('laboratory')
                                                <span class="badge bg-warning">Laboratorium</span>
                                                @break
                                            @case('auditorium')
                                                <span class="badge bg-secondary">Auditorium</span>
                                                @break
                                            @default
                                                <span class="badge bg-dark">Lainnya</span>
                                        @endswitch
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Lantai:</strong></td>
                                    <td>Lantai {{ $room->floor }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Kapasitas:</strong></td>
                                    <td>{{ number_format($room->capacity) }} orang</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td>
                                        @if($room->status == 'active')
                                            <span class="badge bg-success">Aktif</span>
                                        @elseif($room->status == 'inactive')
                                            <span class="badge bg-warning">Tidak Aktif</span>
                                        @else
                                            <span class="badge bg-info">Maintenance</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Dibuat:</strong></td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($room->created_at, true) }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Diperbarui:</strong></td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($room->updated_at, true) }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6>Deskripsi</h6>
                            <p>{{ $room->description ?: 'Tidak ada deskripsi' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
