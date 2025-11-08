@extends('layouts.tenant')

@section('title', 'Daftar Buku')
@section('page-title', 'Daftar Buku Perpustakaan')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Daftar Buku</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.create-book') }}" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Tambah Buku
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
                <form method="GET" action="{{ tenant_route('library.books') }}" class="mb-3">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <input type="text" name="search" class="form-control" placeholder="Cari judul, penulis, ISBN, atau penerbit..." value="{{ $search ?? '' }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <select name="category" class="form-control">
                                    <option value="">Semua Kategori</option>
                                    @foreach($categories as $category)
                                        <option value="{{ $category }}" {{ ($filterCategory ?? '') == $category ? 'selected' : '' }}>{{ $category }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <select name="status" class="form-control">
                                    <option value="">Semua Status</option>
                                    <option value="available" {{ ($filterStatus ?? '') == 'available' ? 'selected' : '' }}>Tersedia</option>
                                    <option value="unavailable" {{ ($filterStatus ?? '') == 'unavailable' ? 'selected' : '' }}>Tidak Tersedia</option>
                                    <option value="maintenance" {{ ($filterStatus ?? '') == 'maintenance' ? 'selected' : '' }}>Perawatan</option>
                                </select>
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
                                <th>Judul Buku</th>
                                <th>Penulis</th>
                                <th>ISBN</th>
                                <th>Penerbit</th>
                                <th>Tahun</th>
                                <th>Kategori</th>
                                <th>Stok</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($books as $index => $book)
                            <tr>
                                <td>{{ $books->firstItem() + $index }}</td>
                                <td>
                                    <div>
                                        <strong>{{ $book->title }}</strong>
                                        @if($book->description)
                                            <br><small class="text-muted">{{ Str::limit($book->description, 50) }}</small>
                                        @endif
                                    </div>
                                </td>
                                <td>{{ $book->author }}</td>
                                <td>{{ $book->isbn ?? '-' }}</td>
                                <td>{{ $book->publisher }}</td>
                                <td>{{ $book->publication_year ?? '-' }}</td>
                                <td>{{ $book->category ?? '-' }}</td>
                                <td>
                                    <span class="badge badge-info">{{ $book->available_copies }}</span> / 
                                    <span class="text-muted">{{ $book->total_copies }}</span>
                                </td>
                                <td>
                                    @if($book->status == 'available')
                                        <span class="badge badge-success">Tersedia</span>
                                    @else
                                        <span class="badge badge-danger">Tidak Tersedia</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ tenant_route('library.show-book', $book->id) }}" class="btn btn-info btn-sm" title="Lihat Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ tenant_route('library.edit-book', $book->id) }}" class="btn btn-warning btn-sm" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ tenant_route('library.destroy-book', $book->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus buku ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm" title="Hapus">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="10" class="text-center text-muted">
                                    <i class="fas fa-book fa-3x mb-3"></i><br>
                                    Belum ada data buku
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if($books->hasPages())
                <div class="d-flex justify-content-center">
                    {{ $books->links() }}
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
