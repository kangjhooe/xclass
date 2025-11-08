@extends('layouts.tenant')

@section('title', 'Detail Buku')
@section('page-title', 'Detail Buku')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Informasi Buku</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.edit-book', $book->id) }}" class="btn btn-warning btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="{{ tenant_route('library.books') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tr>
                                <th width="40%">Judul Buku</th>
                                <td>{{ $book->title }}</td>
                            </tr>
                            <tr>
                                <th>Penulis</th>
                                <td>{{ $book->author }}</td>
                            </tr>
                            <tr>
                                <th>Penerbit</th>
                                <td>{{ $book->publisher }}</td>
                            </tr>
                            <tr>
                                <th>Tahun Terbit</th>
                                <td>{{ $book->publication_year ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>ISBN</th>
                                <td>{{ $book->isbn ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Kategori</th>
                                <td>{{ $book->category ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Sub Kategori</th>
                                <td>{{ $book->subcategory ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Bahasa</th>
                                <td>{{ $book->language ?? 'Indonesia' }}</td>
                            </tr>
                            <tr>
                                <th>Jumlah Halaman</th>
                                <td>{{ $book->pages ?? '-' }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tr>
                                <th width="40%">Status</th>
                                <td>
                                    <span class="badge badge-{{ $book->status_color }}">
                                        {{ $book->status_label }}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Kondisi</th>
                                <td>
                                    @if($book->condition)
                                        <span class="badge badge-{{ $book->condition_color }}">
                                            {{ $book->condition_label }}
                                        </span>
                                    @else
                                        -
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <th>Total Eksemplar</th>
                                <td>{{ $book->total_copies }}</td>
                            </tr>
                            <tr>
                                <th>Eksemplar Tersedia</th>
                                <td>{{ $book->available_copies }}</td>
                            </tr>
                            <tr>
                                <th>Eksemplar Dipinjam</th>
                                <td>{{ $book->total_copies - $book->available_copies }}</td>
                            </tr>
                            <tr>
                                <th>Lokasi</th>
                                <td>{{ $book->location ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Nomor Rak</th>
                                <td>{{ $book->shelf_number ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Harga</th>
                                <td>{{ $book->price ? 'Rp ' . number_format($book->price, 0, ',', '.') : '-' }}</td>
                            </tr>
                            <tr>
                                <th>Total Peminjaman</th>
                                <td>{{ $totalLoans }} kali</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                @if($book->description)
                <div class="mt-3">
                    <h5>Deskripsi</h5>
                    <p>{{ $book->description }}</p>
                </div>
                @endif

                @if($book->notes)
                <div class="mt-3">
                    <h5>Catatan</h5>
                    <p>{{ $book->notes }}</p>
                </div>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Peminjaman Aktif</h3>
            </div>
            <div class="card-body">
                @if($activeLoans->count() > 0)
                    <div class="list-group">
                        @foreach($activeLoans as $loan)
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{{ $loan->borrower_name }}</strong><br>
                                    <small class="text-muted">{{ $loan->borrower_type }}</small>
                                </div>
                                <div class="text-right">
                                    <small class="text-muted">
                                        Jatuh Tempo:<br>
                                        {{ \App\Helpers\DateHelper::formatIndonesian($loan->due_date) }}
                                    </small>
                                    @if($loan->isOverdue())
                                        <br><span class="badge badge-danger">Terlambat</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-muted text-center">Tidak ada peminjaman aktif</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

