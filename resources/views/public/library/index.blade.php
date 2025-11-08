@extends('publicpage::layouts.master')

@section('title', 'Perpustakaan Online')

@push('styles')
<style>
    .book-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        border-radius: 10px;
        overflow: hidden;
        height: 100%;
    }
    
    .book-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .book-cover {
        width: 100%;
        height: 250px;
        object-fit: cover;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
    }
    
    .book-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
    }
    
    .filter-section {
        background: white;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
</style>
@endpush

@section('content')
<div class="container py-5">
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="display-4 mb-3">Perpustakaan Online</h1>
            <p class="lead text-muted">Jelajahi koleksi buku digital kami</p>
        </div>
    </div>

    <!-- Popular & Recent Books Section -->
    @if($popularBooks->count() > 0 || $recentBooks->count() > 0)
    <div class="row mb-5">
        @if($popularBooks->count() > 0)
        <div class="col-md-6 mb-4">
            <h3 class="mb-3">Buku Populer</h3>
            <div class="row">
                @foreach($popularBooks as $book)
                <div class="col-md-6 mb-3">
                    <div class="card book-card">
                        <a href="{{ route('public.library.show', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="text-decoration-none">
                            <div class="book-cover">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="card-body">
                                <h6 class="card-title text-truncate">{{ $book->title }}</h6>
                                <p class="text-muted small mb-2">{{ $book->author }}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fas fa-eye"></i> {{ number_format($book->view_count) }}
                                    </small>
                                    <span class="badge badge-primary">{{ $book->category }}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        @if($recentBooks->count() > 0)
        <div class="col-md-6 mb-4">
            <h3 class="mb-3">Buku Terbaru</h3>
            <div class="row">
                @foreach($recentBooks as $book)
                <div class="col-md-6 mb-3">
                    <div class="card book-card">
                        <a href="{{ route('public.library.show', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="text-decoration-none">
                            <div class="book-cover">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="card-body">
                                <h6 class="card-title text-truncate">{{ $book->title }}</h6>
                                <p class="text-muted small mb-2">{{ $book->author }}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fas fa-calendar"></i> {{ $book->published_at ? $book->published_at->format('d M Y') : '-' }}
                                    </small>
                                    <span class="badge badge-info">{{ $book->category }}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
    @endif

    <!-- Filter Section -->
    <div class="filter-section">
        <form method="GET" action="{{ route('public.library.index', ['tenant' => request()->route('tenant')]) }}" class="row align-items-end">
            <div class="col-md-4 mb-3">
                <label for="search" class="form-label">Cari Buku</label>
                <input type="text" class="form-control" id="search" name="search" 
                       value="{{ $search }}" placeholder="Judul, penulis, ISBN...">
            </div>
            <div class="col-md-3 mb-3">
                <label for="category" class="form-label">Kategori</label>
                <select class="form-control" id="category" name="category">
                    <option value="">Semua Kategori</option>
                    @foreach($categories as $cat)
                    <option value="{{ $cat }}" {{ $filterCategory == $cat ? 'selected' : '' }}>
                        {{ $cat }}
                    </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-3 mb-3">
                <label for="sort" class="form-label">Urutkan</label>
                <select class="form-control" id="sort" name="sort">
                    <option value="latest" {{ $sort == 'latest' ? 'selected' : '' }}>Terbaru</option>
                    <option value="popular" {{ $sort == 'popular' ? 'selected' : '' }}>Populer</option>
                    <option value="title" {{ $sort == 'title' ? 'selected' : '' }}>Judul A-Z</option>
                    <option value="author" {{ $sort == 'author' ? 'selected' : '' }}>Penulis A-Z</option>
                </select>
            </div>
            <div class="col-md-2 mb-3">
                <button type="submit" class="btn btn-primary btn-block">
                    <i class="fas fa-search"></i> Cari
                </button>
            </div>
        </form>
    </div>

    <!-- Books Grid -->
    <div class="row">
        @forelse($books as $book)
        <div class="col-md-3 mb-4">
            <div class="card book-card position-relative">
                <a href="{{ route('public.library.show', $book->id) }}" class="text-decoration-none">
                    <div class="book-cover">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title text-truncate" title="{{ $book->title }}">
                            {{ $book->title }}
                        </h6>
                        <p class="text-muted small mb-2">{{ $book->author }}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">
                                <i class="fas fa-eye"></i> {{ number_format($book->view_count) }}
                            </small>
                            @if($book->allow_download)
                            <span class="badge badge-success">
                                <i class="fas fa-download"></i> Download
                            </span>
                            @endif
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge badge-primary">{{ $book->category }}</span>
                            @if($book->pdf_file_size)
                            <small class="text-muted">{{ $book->formatted_file_size }}</small>
                            @endif
                        </div>
                    </div>
                </a>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle fa-2x mb-3"></i>
                <h5>Tidak ada buku ditemukan</h5>
                <p>Silakan coba dengan kata kunci atau filter yang berbeda</p>
            </div>
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($books->hasPages())
    <div class="row mt-4">
        <div class="col-12">
            {{ $books->links() }}
        </div>
    </div>
    @endif
</div>
@endsection

