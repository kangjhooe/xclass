@extends('layouts.tenant')

@section('title', 'Statistik Perpustakaan')
@section('page-title', 'Statistik Perpustakaan')

@section('content')
<div class="row">
    <!-- Overall Statistics -->
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
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Buku Berdasarkan Kategori</h3>
            </div>
            <div class="card-body">
                @if($booksByCategory->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Kategori</th>
                                    <th class="text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($booksByCategory as $item)
                                <tr>
                                    <td>{{ $item->category }}</td>
                                    <td class="text-right">
                                        <strong>{{ number_format($item->total) }}</strong>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada data</p>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Buku Berdasarkan Status</h3>
            </div>
            <div class="card-body">
                @if($booksByStatus->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th class="text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($booksByStatus as $item)
                                <tr>
                                    <td>
                                        @php
                                            $statusLabels = [
                                                'available' => 'Tersedia',
                                                'unavailable' => 'Tidak Tersedia',
                                                'maintenance' => 'Perawatan',
                                                'lost' => 'Hilang',
                                                'damaged' => 'Rusak'
                                            ];
                                        @endphp
                                        {{ $statusLabels[$item->status] ?? $item->status }}
                                    </td>
                                    <td class="text-right">
                                        <strong>{{ number_format($item->total) }}</strong>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada data</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Peminjaman per Bulan (12 Bulan Terakhir)</h3>
            </div>
            <div class="card-body">
                @if($loansByMonth->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Bulan</th>
                                    <th class="text-right">Jumlah Peminjaman</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($loansByMonth as $item)
                                <tr>
                                    <td>
                                        @php
                                            $months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                                                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                                        @endphp
                                        {{ $months[$item->month] }} {{ $item->year }}
                                    </td>
                                    <td class="text-right">
                                        <strong>{{ number_format($item->total) }}</strong>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada data peminjaman dalam 12 bulan terakhir</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Buku Paling Sering Dipinjam</h3>
            </div>
            <div class="card-body">
                @if($mostBorrowedBooks->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Judul Buku</th>
                                    <th class="text-right">Jumlah Pinjam</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($mostBorrowedBooks as $book)
                                <tr>
                                    <td>
                                        <strong>{{ $book->title }}</strong><br>
                                        <small class="text-muted">{{ $book->author }}</small>
                                    </td>
                                    <td class="text-right">
                                        <strong>{{ number_format($book->loans_count) }}</strong>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada data</p>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Peminjam Paling Aktif</h3>
            </div>
            <div class="card-body">
                @if($mostActiveBorrowers->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Nama Siswa</th>
                                    <th class="text-right">Jumlah Pinjam</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($mostActiveBorrowers as $student)
                                <tr>
                                    <td>
                                        <strong>{{ $student->name }}</strong><br>
                                        <small class="text-muted">{{ $student->student_number ?? $student->nisn ?? '-' }}</small>
                                    </td>
                                    <td class="text-right">
                                        <strong>{{ number_format($student->book_loans_count) }}</strong>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada data</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Ringkasan Statistik</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 text-center">
                        <h4>{{ number_format($stats['total_loans']) }}</h4>
                        <p class="text-muted">Total Peminjaman</p>
                    </div>
                    <div class="col-md-3 text-center">
                        <h4>{{ number_format($stats['returned_loans']) }}</h4>
                        <p class="text-muted">Sudah Dikembalikan</p>
                    </div>
                    <div class="col-md-3 text-center">
                        <h4>{{ number_format($stats['borrowed_books']) }}</h4>
                        <p class="text-muted">Buku Dipinjam</p>
                    </div>
                    <div class="col-md-3 text-center">
                        <h4>
                            @php
                                $utilization = $stats['total_books'] > 0 
                                    ? round(($stats['borrowed_books'] / $stats['total_books']) * 100, 1) 
                                    : 0;
                            @endphp
                            {{ $utilization }}%
                        </h4>
                        <p class="text-muted">Tingkat Pemanfaatan</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

