@extends('layouts.tenant')

@section('title', 'Peminjaman')
@section('page-title', 'Data Peminjaman Buku')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Data Peminjaman</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.create-loan') }}" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Tambah Peminjaman
                    </a>
                </div>
            </div>
            <div class="card-body">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        {{ session('success') }}
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        {{ session('error') }}
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                @endif

                <!-- Search and Filter -->
                <form method="GET" action="{{ tenant_route('library.loans') }}" class="mb-3">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <input type="text" name="search" class="form-control" placeholder="Cari buku atau nama siswa..." value="{{ $search ?? '' }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <select name="status" class="form-control">
                                    <option value="">Semua Status</option>
                                    <option value="active" {{ ($filterStatus ?? '') == 'active' ? 'selected' : '' }}>Aktif</option>
                                    <option value="returned" {{ ($filterStatus ?? '') == 'returned' ? 'selected' : '' }}>Dikembalikan</option>
                                    <option value="overdue" {{ ($filterStatus ?? '') == 'overdue' ? 'selected' : '' }}>Terlambat</option>
                                    <option value="lost" {{ ($filterStatus ?? '') == 'lost' ? 'selected' : '' }}>Hilang</option>
                                    <option value="damaged" {{ ($filterStatus ?? '') == 'damaged' ? 'selected' : '' }}>Rusak</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <div class="form-check mt-2">
                                    <input class="form-check-input" type="checkbox" name="overdue" value="1" id="overdue" {{ ($filterOverdue ?? '') == '1' ? 'checked' : '' }}>
                                    <label class="form-check-label" for="overdue">
                                        Hanya Terlambat
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-search"></i> Cari
                            </button>
                        </div>
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Buku</th>
                                <th>Peminjam</th>
                                <th>Tanggal Pinjam</th>
                                <th>Tanggal Kembali</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($loans as $index => $loan)
                            <tr>
                                <td>{{ $loans->firstItem() + $index }}</td>
                                <td>
                                    <div>
                                        <strong>{{ $loan->book->title ?? 'N/A' }}</strong><br>
                                        <small class="text-muted">{{ $loan->book->author ?? 'N/A' }}</small>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <strong>{{ $loan->borrower_name }}</strong><br>
                                        <small class="text-muted">{{ $loan->borrower_type }}</small>
                                    </div>
                                </td>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($loan->loan_date) }}</td>
                                <td>
                                    @if($loan->return_date)
                                        {{ \App\Helpers\DateHelper::formatIndonesian($loan->return_date) }}
                                    @else
                                        {{ \App\Helpers\DateHelper::formatIndonesian($loan->due_date) }}
                                        @if($loan->status == 'overdue')
                                            <br><small class="text-danger">(Terlambat)</small>
                                        @endif
                                    @endif
                                </td>
                                <td>
                                    @if($loan->status == 'active')
                                        <span class="badge badge-primary">Aktif</span>
                                    @elseif($loan->status == 'returned')
                                        <span class="badge badge-success">Dikembalikan</span>
                                    @elseif($loan->status == 'overdue')
                                        <span class="badge badge-danger">Terlambat</span>
                                    @else
                                        <span class="badge badge-secondary">{{ ucfirst($loan->status) }}</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ tenant_route('library.show-loan', $loan->id) }}" class="btn btn-info btn-sm" title="Lihat Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        @if($loan->status == 'active')
                                            <a href="{{ tenant_route('library.edit-loan', $loan->id) }}" class="btn btn-warning btn-sm" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('library.return-book', $loan->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin mengembalikan buku ini?')">
                                                @csrf
                                                <button type="submit" class="btn btn-success btn-sm" title="Kembalikan">
                                                    <i class="fas fa-undo"></i>
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" class="text-center text-muted">
                                    <i class="fas fa-book-open fa-3x mb-3"></i><br>
                                    Belum ada data peminjaman
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if($loans->hasPages())
                <div class="d-flex justify-content-center">
                    {{ $loans->links() }}
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
