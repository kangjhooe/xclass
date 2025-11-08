@extends('layouts.tenant')

@section('title', 'Laporan SPP')
@section('page-title', 'Laporan SPP')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-money-bill me-2"></i>
                        Laporan Pembayaran SPP
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="GET" class="row mb-4">
                        <div class="col-md-3">
                            <select name="class_id" class="form-select">
                                <option value="">Semua Kelas</option>
                                @foreach(\App\Models\ClassRoom::where('instansi_id', session('instansi_id'))->get() as $class)
                                    <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                        {{ $class->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select name="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="paid" {{ request('status') == 'paid' ? 'selected' : '' }}>Lunas</option>
                                <option value="unpaid" {{ request('status') == 'unpaid' ? 'selected' : '' }}>Belum Lunas</option>
                                <option value="overdue" {{ request('status') == 'overdue' ? 'selected' : '' }}>Terlambat</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}" placeholder="Tanggal Mulai">
                        </div>
                        <div class="col-md-2">
                            <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}" placeholder="Tanggal Akhir">
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Filter
                            </button>
                        </div>
                        <div class="col-md-1">
                            <a href="{{ tenant_route('report.spp') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i>
                            </a>
                        </div>
                    </form>

                    <!-- Statistics -->
                    <div class="row mb-4">
                        <div class="col-md-2">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_spp'] }}</h4>
                                            <small>Total SPP</small>
                                        </div>
                                        <i class="fas fa-list fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['paid'] }}</h4>
                                            <small>Lunas</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['unpaid'] }}</h4>
                                            <small>Belum Lunas</small>
                                        </div>
                                        <i class="fas fa-clock fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-danger text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['overdue'] }}</h4>
                                            <small>Terlambat</small>
                                        </div>
                                        <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</h4>
                                            <small>Total Tagihan</small>
                                        </div>
                                        <i class="fas fa-wallet fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="card bg-secondary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['paid_amount'], 0, ',', '.') }}</h4>
                                            <small>Sudah Dibayar</small>
                                        </div>
                                        <i class="fas fa-money-bill fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SPP Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Siswa</th>
                                    <th>Kelas</th>
                                    <th>Bulan</th>
                                    <th>Jumlah</th>
                                    <th>Jatuh Tempo</th>
                                    <th>Status</th>
                                    <th>Tanggal Bayar</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($sppData as $index => $spp)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $spp->student_name }}</td>
                                    <td>{{ $spp->class_name ?? 'N/A' }}</td>
                                    <td>{{ \Carbon\Carbon::parse($spp->month)->format('F Y') }}</td>
                                    <td>Rp {{ number_format($spp->amount, 0, ',', '.') }}</td>
                                    <td>{{ \Carbon\Carbon::parse($spp->due_date)->format('d/m/Y') }}</td>
                                    <td>
                                        @if($spp->status == 'paid')
                                            <span class="badge bg-success">Lunas</span>
                                        @elseif($spp->status == 'unpaid')
                                            <span class="badge bg-warning">Belum Lunas</span>
                                        @else
                                            <span class="badge bg-danger">Terlambat</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($spp->paid_at)
                                            {{ \Carbon\Carbon::parse($spp->paid_at)->format('d/m/Y') }}
                                        @else
                                            -
                                        @endif
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-money-bill fa-3x mb-3 d-block"></i>
                                        <p>Tidak ada data SPP</p>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Export Actions -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Export Laporan</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'spp']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'spp']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-success w-100 mb-2">
                                                <i class="fas fa-file-excel me-1"></i>
                                                Export Excel
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <button onclick="window.print()" class="btn btn-outline-info w-100 mb-2">
                                                <i class="fas fa-print me-1"></i>
                                                Print
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.index') }}" class="btn btn-outline-secondary w-100 mb-2">
                                                <i class="fas fa-arrow-left me-1"></i>
                                                Kembali
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
