@extends('layouts.tenant')

@section('title', 'Detail Peminjaman')
@section('page-title', 'Detail Peminjaman Buku')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Informasi Peminjaman</h3>
                <div class="card-tools">
                    @if($loan->status == 'active')
                        <a href="{{ tenant_route('library.edit-loan', $loan->id) }}" class="btn btn-warning btn-sm">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                    @endif
                    <a href="{{ tenant_route('library.loans') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tr>
                                <th width="40%">Buku</th>
                                <td>
                                    <strong>{{ $loan->book->title }}</strong><br>
                                    <small class="text-muted">{{ $loan->book->author }}</small>
                                </td>
                            </tr>
                            <tr>
                                <th>Peminjam</th>
                                <td>
                                    <strong>{{ $loan->borrower_name }}</strong><br>
                                    <small class="text-muted">{{ $loan->borrower_type }}</small>
                                </td>
                            </tr>
                            <tr>
                                <th>Tanggal Pinjam</th>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($loan->loan_date, true) }}</td>
                            </tr>
                            <tr>
                                <th>Tanggal Jatuh Tempo</th>
                                <td>
                                    {{ \App\Helpers\DateHelper::formatIndonesian($loan->due_date) }}
                                    @if($loan->isOverdue() && $loan->status == 'active')
                                        <br><span class="badge badge-danger">Terlambat {{ $loan->days_overdue }} hari</span>
                                    @endif
                                </td>
                            </tr>
                            @if($loan->return_date)
                            <tr>
                                <th>Tanggal Kembali</th>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($loan->return_date, true) }}</td>
                            </tr>
                            @endif
                            <tr>
                                <th>Durasi Peminjaman</th>
                                <td>{{ $loan->loan_duration }} hari</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tr>
                                <th width="40%">Status</th>
                                <td>
                                    <span class="badge badge-{{ $loan->status_color }}">
                                        {{ $loan->status_label }}
                                    </span>
                                </td>
                            </tr>
                            @if($loan->fine_amount > 0)
                            <tr>
                                <th>Denda</th>
                                <td>
                                    <strong>{{ $loan->formatted_fine_amount }}</strong>
                                    @if($loan->fine_paid)
                                        <br><small class="text-success">Sudah dibayar</small>
                                    @else
                                        <br><small class="text-danger">Belum dibayar</small>
                                    @endif
                                </td>
                            </tr>
                            @endif
                            @if($loan->creator)
                            <tr>
                                <th>Dibuat Oleh</th>
                                <td>{{ $loan->creator->name ?? '-' }}</td>
                            </tr>
                            @endif
                            @if($loan->returner)
                            <tr>
                                <th>Dikembalikan Oleh</th>
                                <td>{{ $loan->returner->name ?? '-' }}</td>
                            </tr>
                            @endif
                            @if($loan->loan_notes)
                            <tr>
                                <th>Catatan Pinjam</th>
                                <td>{{ $loan->loan_notes }}</td>
                            </tr>
                            @endif
                            @if($loan->return_notes)
                            <tr>
                                <th>Catatan Kembali</th>
                                <td>{{ $loan->return_notes }}</td>
                            </tr>
                            @endif
                        </table>
                    </div>
                </div>

                @if($loan->status == 'active' && !$loan->return_date)
                <div class="mt-3">
                    <form action="{{ tenant_route('library.return-book', $loan->id) }}" method="POST" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-success" onclick="return confirm('Apakah Anda yakin ingin mengembalikan buku ini?')">
                            <i class="fas fa-undo"></i> Kembalikan Buku
                        </button>
                    </form>
                    @if($loan->isOverdue())
                        <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#markLostModal">
                            <i class="fas fa-exclamation-triangle"></i> Tandai Hilang
                        </button>
                        <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#markDamagedModal">
                            <i class="fas fa-exclamation-circle"></i> Tandai Rusak
                        </button>
                    @endif
                </div>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Informasi Buku</h3>
            </div>
            <div class="card-body">
                <p><strong>Judul:</strong><br>{{ $loan->book->title }}</p>
                <p><strong>Penulis:</strong><br>{{ $loan->book->author }}</p>
                <p><strong>Penerbit:</strong><br>{{ $loan->book->publisher }}</p>
                <p><strong>Status Buku:</strong><br>
                    <span class="badge badge-{{ $loan->book->status_color }}">
                        {{ $loan->book->status_label }}
                    </span>
                </p>
                <p><strong>Eksemplar Tersedia:</strong><br>{{ $loan->book->available_copies }} / {{ $loan->book->total_copies }}</p>
                <a href="{{ tenant_route('library.show-book', $loan->book->id) }}" class="btn btn-info btn-sm btn-block">
                    <i class="fas fa-eye"></i> Lihat Detail Buku
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Mark as Lost Modal -->
<div class="modal fade" id="markLostModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ tenant_route('library.mark-lost', $loan->id) }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Tandai Sebagai Hilang</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control" rows="3" placeholder="Masukkan catatan (opsional)"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger">Konfirmasi</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Mark as Damaged Modal -->
<div class="modal fade" id="markDamagedModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ tenant_route('library.mark-damaged', $loan->id) }}" method="POST">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Tandai Sebagai Rusak</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control" rows="3" placeholder="Masukkan catatan (opsional)"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning">Konfirmasi</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

