@extends('publicpage::layouts.master')

@section('title', $news->title)
@section('meta_description', $news->meta_description ?? $news->excerpt)
@section('meta_keywords', $news->meta_keywords)

@section('content')
<div class="row">
    <div class="col-lg-8">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="{{ tenant_route('tenant.public.home') }}">
                        <i class="fas fa-home me-1"></i>Beranda
                    </a>
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ tenant_route('tenant.public.news.index') }}">Berita</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                    {{ Str::limit($news->title, 50) }}
                </li>
            </ol>
        </nav>

        <!-- Article Card -->
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <!-- Article Header -->
                <div class="mb-4">
                    @if($news->is_featured)
                        <div class="mb-3">
                            <span class="badge bg-warning text-dark fs-6">
                                <i class="fas fa-star me-1"></i>Berita Unggulan
                            </span>
                        </div>
                    @endif
                    
                    <h1 class="h2 mb-3 text-dark">{{ $news->title }}</h1>
                    
                    <div class="d-flex flex-wrap align-items-center text-muted mb-3">
                        <div class="me-4">
                            <i class="fas fa-calendar me-1"></i>
                            <span>{{ $news->formatted_published_date }}</span>
                        </div>
                        <div class="me-4">
                            <i class="fas fa-user me-1"></i>
                            <span>{{ $news->author }}</span>
                        </div>
                        <div class="me-4">
                            <i class="fas fa-eye me-1"></i>
                            <span>{{ $news->view_count }} views</span>
                        </div>
                        <div class="me-4">
                            <i class="fas fa-clock me-1"></i>
                            <span>{{ $news->reading_time }}</span>
                        </div>
                        @if($news->updated_at != $news->created_at)
                            <div class="ms-auto">
                                <small>
                                    <i class="fas fa-edit me-1"></i>
                                    Diperbarui: {{ $news->updated_at->format('d-m-Y H:i') }}
                                </small>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Featured Image -->
                @if($news->featured_image)
                <div class="mb-4">
                    <img src="{{ asset('storage/' . $news->featured_image) }}" 
                         alt="{{ $news->title }}" 
                         class="img-fluid rounded shadow-sm"
                         style="width: 100%; height: 400px; object-fit: cover;">
                </div>
                @endif

                <!-- Article Content -->
                <div class="article-content">
                    {!! $news->content !!}
                </div>

                <!-- Article Meta -->
                <div class="mt-5 pt-4 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-muted mb-2">Ditulis oleh:</h6>
                            <p class="mb-0">
                                <i class="fas fa-user me-2"></i>
                                {{ $news->author }}
                            </p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <h6 class="text-muted mb-2">Diterbitkan:</h6>
                            <p class="mb-0">
                                <i class="fas fa-calendar me-2"></i>
                                {{ $news->formatted_published_date }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="mt-4 pt-4 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <a href="{{ tenant_route('tenant.public.news.index') }}" class="btn btn-outline-primary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Kembali ke Daftar Berita
                            </a>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <a href="{{ tenant_route('tenant.public.home') }}" class="btn btn-primary">
                                <i class="fas fa-home me-2"></i>
                                Beranda
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="col-lg-4">
        <!-- Related News -->
        @if($relatedNews->count() > 0)
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-primary text-white">
                <h6 class="mb-0">
                    <i class="fas fa-newspaper me-2"></i>
                    Berita Terkait
                </h6>
            </div>
            <div class="card-body p-0">
                @foreach($relatedNews as $related)
                <div class="border-bottom p-3 {{ $loop->last ? 'border-0' : '' }}">
                    <div class="d-flex">
                        @if($related->featured_image)
                            <img src="{{ asset('storage/' . $related->featured_image) }}" 
                                 alt="{{ $related->title }}" 
                                 class="rounded me-3" 
                                 style="width: 80px; height: 60px; object-fit: cover;">
                        @else
                            <div class="bg-light rounded me-3 d-flex align-items-center justify-content-center" 
                                 style="width: 80px; height: 60px;">
                                <i class="fas fa-image text-muted"></i>
                            </div>
                        @endif
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <a href="{{ tenant_route('tenant.public.news.show', $related->slug) }}" 
                                   class="text-decoration-none text-dark">
                                    {{ Str::limit($related->title, 60) }}
                                </a>
                            </h6>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                {{ $related->formatted_published_date }}
                            </small>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Quick Links -->
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-secondary text-white">
                <h6 class="mb-0">
                    <i class="fas fa-link me-2"></i>
                    Tautan Cepat
                </h6>
            </div>
            <div class="card-body">
                <div class="list-group list-group-flush">
                    <a href="{{ tenant_route('tenant.public.news.index') }}" class="list-group-item list-group-item-action border-0 px-0">
                        <i class="fas fa-newspaper me-2 text-primary"></i>
                        Semua Berita
                    </a>
                    <a href="{{ tenant_route('tenant.public.gallery.index') }}" class="list-group-item list-group-item-action border-0 px-0">
                        <i class="fas fa-images me-2 text-primary"></i>
                        Galeri Foto
                    </a>
                    <a href="{{ tenant_route('tenant.public.about') }}" class="list-group-item list-group-item-action border-0 px-0">
                        <i class="fas fa-info-circle me-2 text-primary"></i>
                        Tentang Kami
                    </a>
                    <a href="{{ tenant_route('tenant.public.contact') }}" class="list-group-item list-group-item-action border-0 px-0">
                        <i class="fas fa-envelope me-2 text-primary"></i>
                        Kontak
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
.article-content {
    line-height: 1.8;
    font-size: 1.1rem;
    color: #333;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #2c3e50;
    font-weight: 600;
}

.article-content h1 { font-size: 2rem; }
.article-content h2 { font-size: 1.75rem; }
.article-content h3 { font-size: 1.5rem; }
.article-content h4 { font-size: 1.25rem; }

.article-content p {
    margin-bottom: 1.5rem;
    text-align: justify;
}

.article-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.article-content blockquote {
    border-left: 4px solid #007bff;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #666;
    background-color: #f8f9fa;
    border-radius: 0 0.5rem 0.5rem 0;
}

.article-content ul,
.article-content ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
}

.article-content li {
    margin-bottom: 0.5rem;
}

.article-content table {
    width: 100%;
    margin: 1.5rem 0;
    border-collapse: collapse;
}

.article-content table th,
.article-content table td {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    text-align: left;
}

.article-content table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.article-content code {
    background-color: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
    color: #e83e8c;
}

.article-content pre {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
}

.article-content pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}
</style>
@endpush
@endsection
