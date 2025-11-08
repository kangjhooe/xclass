@extends('publicpage::layouts.master')

@section('title', 'Berita')

@section('content')
<div class="row">
    <div class="col-12">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="h3 mb-1">
                    <i class="fas fa-newspaper text-primary me-2"></i>
                    Berita Terbaru
                </h2>
                <p class="text-muted mb-0">Informasi dan berita terkini dari {{ tenant('name') ?? 'kami' }}</p>
            </div>
            <div class="d-flex gap-2">
                <!-- Filter Buttons -->
                <div class="btn-group" role="group">
                    <input type="radio" class="btn-check" name="filter" id="all" value="" {{ !request('status') ? 'checked' : '' }}>
                    <label class="btn btn-outline-primary btn-sm" for="all">Semua</label>
                    
                    <input type="radio" class="btn-check" name="filter" id="featured" value="featured" {{ request('featured') ? 'checked' : '' }}>
                    <label class="btn btn-outline-primary btn-sm" for="featured">Unggulan</label>
                </div>
            </div>
        </div>

        @if($news->count() > 0)
            <!-- Featured News (if any) -->
            @if(request('featured') || request('search'))
                @php
                    $featuredNews = $news->where('is_featured', true)->take(1);
                @endphp
                @if($featuredNews->count() > 0)
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="card news-card border-0 shadow-sm">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        @if($featuredNews->first()->featured_image)
                                            <img src="{{ asset('storage/' . $featuredNews->first()->featured_image) }}" 
                                                 class="img-fluid rounded-start h-100" 
                                                 alt="{{ $featuredNews->first()->title }}" 
                                                 style="object-fit: cover; height: 250px;">
                                        @else
                                            <div class="bg-light d-flex align-items-center justify-content-center rounded-start h-100" style="height: 250px;">
                                                <i class="fas fa-image fa-3x text-muted"></i>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body h-100 d-flex flex-column">
                                            <div class="d-flex align-items-center mb-2">
                                                <span class="badge bg-warning text-dark me-2">
                                                    <i class="fas fa-star me-1"></i>Unggulan
                                                </span>
                                                <small class="text-muted">
                                                    <i class="fas fa-calendar me-1"></i>
                                                    {{ $featuredNews->first()->formatted_published_date }}
                                                </small>
                                            </div>
                                            <h4 class="card-title">{{ $featuredNews->first()->title }}</h4>
                                            <p class="card-text text-muted">{{ $featuredNews->first()->excerpt }}</p>
                                            <div class="mt-auto">
                                                <a href="{{ tenant_route('tenant.public.news.show', $featuredNews->first()->slug) }}" 
                                                   class="btn btn-primary">
                                                    <i class="fas fa-eye me-1"></i>
                                                    Baca Selengkapnya
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            @endif

            <!-- News Grid -->
            <div class="row">
                @foreach($news as $article)
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card news-card h-100 border-0 shadow-sm">
                        @if($article->featured_image)
                            <img src="{{ asset('storage/' . $article->featured_image) }}" 
                                 class="card-img-top" 
                                 alt="{{ $article->title }}" 
                                 style="height: 200px; object-fit: cover;">
                        @else
                            <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                                 style="height: 200px;">
                                <i class="fas fa-image fa-3x text-muted"></i>
                            </div>
                        @endif
                        
                        <div class="card-body d-flex flex-column">
                            @if($article->is_featured)
                                <div class="mb-2">
                                    <span class="badge bg-warning text-dark">
                                        <i class="fas fa-star me-1"></i>Unggulan
                                    </span>
                                </div>
                            @endif
                            
                            <h5 class="card-title">{{ $article->title }}</h5>
                            
                            <div class="text-muted small mb-2">
                                <i class="fas fa-calendar me-1"></i>
                                {{ $article->formatted_published_date }}
                                <span class="ms-2">
                                    <i class="fas fa-user me-1"></i>
                                    {{ $article->author }}
                                </span>
                            </div>
                            
                            <p class="card-text text-muted">{{ $article->excerpt }}</p>
                            
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <a href="{{ tenant_route('tenant.public.news.show', $article->slug) }}" 
                                   class="btn btn-outline-primary btn-sm">
                                    <i class="fas fa-eye me-1"></i>
                                    Baca
                                </a>
                                <small class="text-muted">
                                    <i class="fas fa-eye me-1"></i>
                                    {{ $article->view_count }} views
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
            
            <!-- Pagination -->
            @if($news->hasPages())
            <div class="d-flex justify-content-center mt-5">
                <nav aria-label="Pagination">
                    {{ $news->appends(request()->query())->links() }}
                </nav>
            </div>
            @endif
        @else
            <!-- Empty State -->
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="fas fa-newspaper fa-4x text-muted"></i>
                </div>
                <h4 class="text-muted mb-3">Belum ada berita</h4>
                <p class="text-muted mb-4">Berita akan ditampilkan di sini setelah ditambahkan.</p>
                @if(auth()->check() && auth()->user()->can('create', \Modules\PublicPage\Models\News::class))
                    <a href="{{ tenant_route('admin.news.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-1"></i>
                        Tambah Berita Pertama
                    </a>
                @endif
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
    // Filter functionality
    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const url = new URL(window.location);
            if (this.value) {
                url.searchParams.set('featured', this.value === 'featured' ? '1' : '');
            } else {
                url.searchParams.delete('featured');
            }
            window.location.href = url.toString();
        });
    });
</script>
@endpush
@endsection
