@extends('layouts.tenant')

@section('title', 'Perpustakaan')
@section('page-title', 'Sistem Perpustakaan')

@section('content')
<div class="row">
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-book fa-3x text-primary mb-3"></i>
                <h5>Daftar Buku</h5>
                <p class="text-muted">Kelola koleksi buku perpustakaan</p>
                <a href="{{ tenant_route('library.books') }}" class="btn btn-primary">
                    <i class="fas fa-arrow-right"></i> Lihat Buku
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-exchange-alt fa-3x text-success mb-3"></i>
                <h5>Peminjaman</h5>
                <p class="text-muted">Kelola data peminjaman buku</p>
                <a href="{{ tenant_route('library.loans') }}" class="btn btn-success">
                    <i class="fas fa-arrow-right"></i> Lihat Peminjaman
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-chart-bar fa-3x text-info mb-3"></i>
                <h5>Statistik</h5>
                <p class="text-muted">Lihat statistik perpustakaan</p>
                <a href="{{ tenant_route('library.statistics') }}" class="btn btn-info">
                    <i class="fas fa-arrow-right"></i> Lihat Statistik
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <!-- Statistics Cards -->
    <div class="col-md-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-book fa-2x text-primary mb-2"></i>
                <h3>{{ number_format($stats['total_books']) }}</h3>
                <p class="text-muted mb-0">Total Buku</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-book-open fa-2x text-success mb-2"></i>
                <h3>{{ number_format($stats['available_books']) }}</h3>
                <p class="text-muted mb-0">Buku Tersedia</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-exchange-alt fa-2x text-info mb-2"></i>
                <h3>{{ number_format($stats['active_loans']) }}</h3>
                <p class="text-muted mb-0">Peminjaman Aktif</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card">
            <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                <h3>{{ number_format($stats['overdue_loans']) }}</h3>
                <p class="text-muted mb-0">Terlambat</p>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Peminjaman Terbaru</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.loans') }}" class="btn btn-sm btn-primary">
                        Lihat Semua
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if($recentLoans->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Buku</th>
                                    <th>Peminjam</th>
                                    <th>Tanggal Pinjam</th>
                                    <th>Jatuh Tempo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($recentLoans as $loan)
                                <tr>
                                    <td>
                                        <strong>{{ $loan->book->title ?? 'N/A' }}</strong><br>
                                        <small class="text-muted">{{ $loan->book->author ?? 'N/A' }}</small>
                                    </td>
                                    <td>
                                        <strong>{{ $loan->borrower_name }}</strong><br>
                                        <small class="text-muted">{{ $loan->borrower_type }}</small>
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($loan->loan_date) }}</td>
                                    <td>
                                        {{ \App\Helpers\DateHelper::formatIndonesian($loan->due_date) }}
                                        @if($loan->isOverdue() && $loan->status == 'active')
                                            <br><span class="badge badge-danger">Terlambat</span>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ $loan->status_color }}">
                                            {{ $loan->status_label }}
                                        </span>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Belum ada data peminjaman</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
