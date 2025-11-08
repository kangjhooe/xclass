@extends('layouts.tenant')

@section('title', 'Laporan Keuangan Detail')
@section('page-title', 'Laporan Keuangan Detail')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-receipt me-2"></i>
                        Laporan Pengeluaran Detail
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="GET" class="row mb-4">
                        <div class="col-md-3">
                            <select name="category_id" class="form-select">
                                <option value="">Semua Kategori</option>
                                @foreach(\App\Models\ExpenseCategory::where('instansi_id', session('instansi_id'))->get() as $category)
                                    <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>
                                        {{ $category->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}" placeholder="Tanggal Mulai" required>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}" placeholder="Tanggal Akhir" required>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Filter
                            </button>
                        </div>
                        <div class="col-md-1">
                            <a href="{{ tenant_route('report.financial-detail') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh"></i>
                            </a>
                        </div>
                    </form>

                    <!-- Statistics -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_amount'], 0, ',', '.') }}</h4>
                                            <small>Total Pengeluaran</small>
                                        </div>
                                        <i class="fas fa-money-bill fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['expense_count'] }}</h4>
                                            <small>Jumlah Transaksi</small>
                                        </div>
                                        <i class="fas fa-list fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">Rp {{ number_format($stats['average_amount'], 0, ',', '.') }}</h4>
                                            <small>Rata-rata per Transaksi</small>
                                        </div>
                                        <i class="fas fa-chart-line fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Expenses Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Deskripsi</th>
                                    <th>Kategori</th>
                                    <th>Jumlah</th>
                                    <th>Tanggal</th>
                                    <th>Metode Pembayaran</th>
                                    <th>Referensi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($expenses as $index => $expense)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $expense->description }}</td>
                                    <td>{{ $expense->category_name ?? 'N/A' }}</td>
                                    <td>
                                        <span class="fw-bold text-danger">Rp {{ number_format($expense->amount, 0, ',', '.') }}</span>
                                    </td>
                                    <td>{{ \Carbon\Carbon::parse($expense->expense_date)->format('d/m/Y') }}</td>
                                    <td>
                                        @switch($expense->payment_method)
                                            @case('cash')
                                                <span class="badge bg-success">Tunai</span>
                                                @break
                                            @case('transfer')
                                                <span class="badge bg-primary">Transfer</span>
                                                @break
                                            @case('check')
                                                <span class="badge bg-warning">Cek</span>
                                                @break
                                            @default
                                                <span class="badge bg-secondary">{{ ucfirst($expense->payment_method) }}</span>
                                        @endswitch
                                    </td>
                                    <td>{{ $expense->reference ?? '-' }}</td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted">
                                        <i class="fas fa-receipt fa-3x mb-3 d-block"></i>
                                        <p>Tidak ada data pengeluaran</p>
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
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'financial-detail']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'financial-detail']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-success w-100 mb-2">
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
