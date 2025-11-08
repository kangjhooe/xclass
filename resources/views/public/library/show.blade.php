@extends('publicpage::layouts.master')

@section('title', $book->title)

@push('styles')
<style>
    .book-detail-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        padding: 30px;
        margin-bottom: 30px;
    }
    
    .book-cover-large {
        width: 100%;
        max-width: 300px;
        height: 400px;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .book-info-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .related-book-card {
        transition: transform 0.3s ease;
        border: none;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .related-book-card:hover {
        transform: translateY(-5px);
    }
</style>
@endpush

@section('content')
<div class="container py-5">
    <!-- Book Header -->
    <div class="book-detail-header">
        <div class="row align-items-center">
            <div class="col-md-3 text-center mb-3 mb-md-0">
                <div class="book-cover-large d-flex align-items-center justify-content-center bg-white text-dark">
                    <i class="fas fa-book fa-5x"></i>
                </div>
            </div>
            <div class="col-md-9">
                <h1 class="mb-3">{{ $book->title }}</h1>
                <p class="lead mb-2">
                    <i class="fas fa-user"></i> {{ $book->author }}
                </p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <span class="badge badge-light badge-lg">
                        <i class="fas fa-tag"></i> {{ $book->category }}
                    </span>
                    <span class="badge badge-light badge-lg">
                        <i class="fas fa-eye"></i> {{ number_format($book->view_count) }} kali dilihat
                    </span>
                    @if($book->pages)
                    <span class="badge badge-light badge-lg">
                        <i class="fas fa-file-alt"></i> {{ number_format($book->pages) }} halaman
                    </span>
                    @endif
                    @if($book->pdf_file_size)
                    <span class="badge badge-light badge-lg">
                        <i class="fas fa-file-pdf"></i> {{ $book->formatted_file_size }}
                    </span>
                    @endif
                </div>
                <div class="mt-3">
                    <a href="{{ route('public.library.read', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="btn btn-light btn-lg mr-2">
                        <i class="fas fa-book-open"></i> Baca Sekarang
                    </a>
                    @if($book->allow_download)
                    <a href="{{ route('public.library.download', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="btn btn-outline-light btn-lg">
                        <i class="fas fa-download"></i> Download PDF
                    </a>
                    @endif
                    @auth
                    <button type="button" class="btn btn-outline-light btn-lg ml-2" id="toggleFavorite">
                        <i class="fas fa-heart" id="favoriteIcon"></i>
                        <span id="favoriteText">Favorit</span>
                    </button>
                    @endauth
                </div>
            </div>
        </div>
    </div>

    <!-- Book Info -->
    <div class="row">
        <div class="col-md-8">
            <div class="book-info-card">
                <h3 class="mb-3">Deskripsi</h3>
                <p class="text-muted">{{ $book->description ?? 'Tidak ada deskripsi' }}</p>
            </div>

            <div class="book-info-card">
                <h3 class="mb-3">Informasi Buku</h3>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <strong>Penerbit:</strong> {{ $book->publisher }}
                    </div>
                    <div class="col-md-6 mb-2">
                        <strong>Tahun Terbit:</strong> {{ $book->publication_year }}
                    </div>
                    @if($book->isbn)
                    <div class="col-md-6 mb-2">
                        <strong>ISBN:</strong> {{ $book->isbn }}
                    </div>
                    @endif
                    @if($book->language)
                    <div class="col-md-6 mb-2">
                        <strong>Bahasa:</strong> {{ $book->language }}
                    </div>
                    @endif
                    @if($book->published_at)
                    <div class="col-md-6 mb-2">
                        <strong>Diterbitkan:</strong> {{ $book->published_at->format('d M Y') }}
                    </div>
                    @endif
                </div>
            </div>

            @auth
            @if($reading)
            <div class="book-info-card">
                <h3 class="mb-3">Progress Membaca</h3>
                <div class="progress mb-3" style="height: 25px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: {{ $reading->progress_percentage }}%"
                         aria-valuenow="{{ $reading->progress_percentage }}" 
                         aria-valuemin="0" aria-valuemax="100">
                        {{ number_format($reading->progress_percentage, 1) }}%
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <small class="text-muted">
                            <i class="fas fa-bookmark"></i> Halaman terakhir: {{ $reading->last_page }}
                        </small>
                    </div>
                    @if($reading->reading_time_seconds > 0)
                    <div class="col-md-6">
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> Waktu membaca: {{ $reading->formatted_reading_time }}
                        </small>
                    </div>
                    @endif
                </div>
                @if($reading->bookmarks && count($reading->bookmarks) > 0)
                <div class="mt-3">
                    <strong>Bookmark:</strong>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                        @foreach($reading->bookmarks as $page)
                        <span class="badge badge-primary">Halaman {{ $page }}</span>
                        @endforeach
                    </div>
                </div>
                @endif
            </div>
            @endif
            @endauth
        </div>

        <div class="col-md-4">
            @if($relatedBooks->count() > 0)
            <div class="book-info-card">
                <h3 class="mb-3">Buku Terkait</h3>
                @foreach($relatedBooks as $relatedBook)
                <div class="card related-book-card mb-3">
                    <a href="{{ route('public.library.show', ['tenant' => request()->route('tenant'), 'id' => $relatedBook->id]) }}" class="text-decoration-none">
                        <div class="card-body">
                            <h6 class="card-title">{{ $relatedBook->title }}</h6>
                            <p class="text-muted small mb-0">{{ $relatedBook->author }}</p>
                        </div>
                    </a>
                </div>
                @endforeach
            </div>
            @endif
        </div>
    </div>
</div>

@auth
@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtn = document.getElementById('toggleFavorite');
    const favoriteIcon = document.getElementById('favoriteIcon');
    const favoriteText = document.getElementById('favoriteText');
    
    @if($reading && $reading->is_favorite)
    favoriteIcon.classList.add('fas', 'text-danger');
    favoriteIcon.classList.remove('far');
    favoriteText.textContent = 'Favorit';
    @else
    favoriteIcon.classList.add('far');
    favoriteIcon.classList.remove('fas', 'text-danger');
    favoriteText.textContent = 'Tambah ke Favorit';
    @endif
    
    favoriteBtn.addEventListener('click', function() {
        fetch('{{ route("public.library.favorite", ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.is_favorite) {
                    favoriteIcon.classList.add('fas', 'text-danger');
                    favoriteIcon.classList.remove('far');
                    favoriteText.textContent = 'Favorit';
                } else {
                    favoriteIcon.classList.add('far');
                    favoriteIcon.classList.remove('fas', 'text-danger');
                    favoriteText.textContent = 'Tambah ke Favorit';
                }
            }
        });
    });
});
</script>
@endpush
@endauth
@endsection

