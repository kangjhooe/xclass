@extends('layouts.tenant')

@section('title', 'Laporan Anggaran')
@section('page-title', 'Laporan Anggaran')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-bar me-2"></i>
                        Laporan Anggaran Sekolah
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="GET" class="row mb-4">
                        <div class="col-md-3">
                            <select name="category_id" class="form-select">
                                <option value="">Semua Kategori</option>
                                @foreach(\App\Models\BudgetCategory::where('instansi_id', session('instansi_id'))->get() as $category)
                                    <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>
                                        {{ $category->name }}
                                    </option>
                                @endforeach
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
                            <a href="{{ tenant_route('report.budget') }}" class="btn btn-outline-secondary">
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
                                            <h4 class="mb-0">Rp {{ number_format($stats['total_budget'], 0, ',', '.') }}</h4>
                                            <small>Total Anggaran</small>
                                        </div>
                                        <i class="fas fa-wallet fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['budget_count'] }}</h4>
                                            <small>Total Item</small>
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
                                            <h4 class="mb-0">{{ $stats['active_budgets'] }}</h4>
                                            <small>Anggaran Aktif</small>
                                        </div>
                                        <i class="fas fa-check fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Budget Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Anggaran</th>
                                    <th>Kategori</th>
                                    <th>Jumlah</th>
                                    <th>Periode Mulai</th>
                                    <th>Periode Akhir</th>
                                    <th>Status</th>
                                    <th>Dibuat</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($budgets as $index => $budget)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $budget->name }}</td>
                                    <td>{{ $budget->category_name ?? 'N/A' }}</td>
                                    <td>Rp {{ number_format($budget->amount, 0, ',', '.') }}</td>
                                    <td>{{ \Carbon\Carbon::parse($budget->start_date)->format('d/m/Y') }}</td>
                                    <td>{{ \Carbon\Carbon::parse($budget->end_date)->format('d/m/Y') }}</td>
                                    <td>
                                        @if($budget->is_active)
                                            <span class="badge bg-success">Aktif</span>
                                        @else
                                            <span class="badge bg-secondary">Tidak Aktif</span>
                                        @endif
                                    </td>
                                    <td>{{ \Carbon\Carbon::parse($budget->created_at)->format('d/m/Y') }}</td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-chart-bar fa-3x mb-3 d-block"></i>
                                        <p>Tidak ada data anggaran</p>
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
                                            <a href="{{ tenant_route('report.export-pdf', ['type' => 'budget']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-primary w-100 mb-2">
                                                <i class="fas fa-file-pdf me-1"></i>
                                                Export PDF
                                            </a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="{{ tenant_route('report.export-excel', ['type' => 'budget']) }}?{{ http_build_query($filters) }}" class="btn btn-outline-success w-100 mb-2">
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
