@extends('publicpage::layouts.master')

@section('title', 'Galeri Foto')
@section('meta_description', 'Galeri foto dan dokumentasi kegiatan ' . (tenant('name') ?? 'kami'))

@section('content')
<div class="row">
    <div class="col-12">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="h3 mb-1">
                    <i class="fas fa-images text-primary me-2"></i>
                    Galeri Foto
                </h2>
                <p class="text-muted mb-0">Dokumentasi kegiatan dan momen berharga</p>
            </div>
            <div class="d-flex gap-2">
                <!-- Search Form -->
                <form action="{{ tenant_route('public.gallery.index') }}" method="GET" class="d-flex">
                    <input type="text" name="search" class="form-control form-control-sm me-2" 
                           placeholder="Cari galeri..." value="{{ request('search') }}">
                    <button type="submit" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-search"></i>
                    </button>
                </form>
            </div>
        </div>

        <!-- Filter Buttons -->
        @if($categories->count() > 0 || request('type'))
        <div class="mb-4">
            <div class="btn-group" role="group" aria-label="Filter Gallery">
                <input type="radio" class="btn-check" name="filter" id="all" value="" 
                       {{ !request('category') && !request('type') ? 'checked' : '' }}
                       onchange="window.location.href='{{ tenant_route('public.gallery.index') }}'">
                <label class="btn btn-outline-primary btn-sm" for="all">Semua</label>
                
                @if(request('type'))
                <input type="radio" class="btn-check" name="filter" id="type-image" value="image"
                       {{ request('type') == 'image' ? 'checked' : '' }}
                       onchange="window.location.href='{{ tenant_route('public.gallery.index', ['type' => 'image']) }}'">
                <label class="btn btn-outline-primary btn-sm" for="type-image">
                    <i class="fas fa-image me-1"></i>Foto
                </label>
                
                <input type="radio" class="btn-check" name="filter" id="type-video" value="video"
                       {{ request('type') == 'video' ? 'checked' : '' }}
                       onchange="window.location.href='{{ tenant_route('public.gallery.index', ['type' => 'video']) }}'">
                <label class="btn btn-outline-primary btn-sm" for="type-video">
                    <i class="fas fa-video me-1"></i>Video
                </label>
                @endif
                
                @foreach($categories as $category)
                <input type="radio" class="btn-check" name="filter" id="cat-{{ $loop->index }}" 
                       value="{{ $category }}"
                       {{ request('category') == $category ? 'checked' : '' }}
                       onchange="window.location.href='{{ tenant_route('public.gallery.index', ['category' => $category]) }}'">
                <label class="btn btn-outline-primary btn-sm" for="cat-{{ $loop->index }}">{{ $category }}</label>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Gallery Grid -->
        @if($galleries->count() > 0)
        <div class="row" id="gallery-grid">
            @foreach($galleries as $gallery)
            <div class="col-lg-4 col-md-6 mb-4 gallery-item" 
                 data-category="{{ $gallery->category ?? '' }}"
                 data-type="{{ $gallery->file_type ?? '' }}">
                <div class="card border-0 shadow-sm h-100 news-card">
                    <div class="position-relative">
                        @if($gallery->file_type === 'video')
                            <!-- Video Thumbnail -->
                            @if($gallery->thumbnail_path)
                                <img src="{{ asset('storage/' . $gallery->thumbnail_path) }}" 
                                     class="card-img-top" 
                                     alt="{{ $gallery->title }}"
                                     style="height: 250px; object-fit: cover;">
                            @else
                                <div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" 
                                     style="height: 250px;">
                                    <i class="fas fa-video fa-3x text-white"></i>
                                </div>
                            @endif
                            <div class="position-absolute top-50 start-50 translate-middle">
                                <button class="btn btn-light btn-lg rounded-circle" 
                                        onclick="openVideoModal('{{ $gallery->file_path }}', '{{ $gallery->title }}')"
                                        style="width: 60px; height: 60px;">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        @else
                            <!-- Image -->
                            @if($gallery->file_path)
                                <img src="{{ $gallery->image_url }}" 
                                     class="card-img-top" 
                                     alt="{{ $gallery->alt_text ?? $gallery->title }}"
                                     style="height: 250px; object-fit: cover; cursor: pointer;"
                                     onclick="openLightbox('{{ $gallery->image_url }}', '{{ $gallery->title }}')">
                            @else
                                <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                                     style="height: 250px;">
                                    <i class="fas fa-image fa-3x text-muted"></i>
                                </div>
                            @endif
                            <div class="position-absolute top-0 start-0 m-2">
                                <button class="btn btn-light btn-sm" 
                                        onclick="openLightbox('{{ $gallery->image_url }}', '{{ $gallery->title }}')">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        @endif
                        
                        @if($gallery->category)
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-primary">{{ $gallery->category }}</span>
                        </div>
                        @endif
                        
                        @if($gallery->file_type)
                        <div class="position-absolute bottom-0 end-0 m-2">
                            <span class="badge bg-{{ $gallery->file_type === 'video' ? 'danger' : 'success' }}">
                                <i class="fas fa-{{ $gallery->file_type === 'video' ? 'video' : 'image' }} me-1"></i>
                                {{ ucfirst($gallery->file_type) }}
                            </span>
                        </div>
                        @endif
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">{{ $gallery->title }}</h5>
                        <p class="card-text text-muted small mb-2">
                            <i class="fas fa-calendar me-1"></i>
                            {{ $gallery->created_at->format('d-m-Y') }}
                        </p>
                        @if($gallery->description)
                        <p class="card-text text-muted">{{ Str::limit($gallery->description, 100) }}</p>
                        @endif
                        <div class="mt-auto">
                            <a href="{{ tenant_route('public.gallery.show', $gallery->id) }}" 
                               class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye me-1"></i>
                                Lihat Detail
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        
        <!-- Pagination -->
        @if($galleries->hasPages())
        <div class="d-flex justify-content-center mt-5">
            <nav aria-label="Pagination">
                {{ $galleries->appends(request()->query())->links() }}
            </nav>
        </div>
        @endif
        @else
        <!-- Empty State -->
        <div class="text-center py-5">
            <div class="mb-4">
                <i class="fas fa-images fa-4x text-muted"></i>
            </div>
            <h4 class="text-muted mb-3">Belum ada galeri</h4>
            <p class="text-muted mb-4">Galeri akan ditampilkan di sini setelah ditambahkan.</p>
            @if(request('search') || request('category') || request('type'))
                <a href="{{ tenant_route('public.gallery.index') }}" class="btn btn-primary">
                    <i class="fas fa-times me-1"></i>
                    Hapus Filter
                </a>
            @endif
        </div>
        @endif
    </div>
</div>

<!-- Lightbox Modal for Images -->
<div class="modal fade" id="lightboxModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-dark">
            <div class="modal-header border-0">
                <h5 class="modal-title text-white" id="lightboxTitle">Galeri Foto</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center p-0">
                <img id="lightboxImage" src="" alt="" class="img-fluid">
            </div>
            <div class="modal-footer border-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fas fa-times me-1"></i>
                    Tutup
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Video Modal -->
<div class="modal fade" id="videoModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-dark">
            <div class="modal-header border-0">
                <h5 class="modal-title text-white" id="videoModalTitle">Video</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center p-0">
                <div class="ratio ratio-16x9" id="videoContainer">
                    <iframe id="videoFrame" src="" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="modal-footer border-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fas fa-times me-1"></i>
                    Tutup
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Lightbox functionality for images
    function openLightbox(imageSrc, title) {
        const modal = new bootstrap.Modal(document.getElementById('lightboxModal'));
        document.getElementById('lightboxImage').src = imageSrc;
        document.getElementById('lightboxTitle').textContent = title || 'Galeri Foto';
        modal.show();
    }

    // Video modal functionality
    function openVideoModal(videoUrl, title) {
        const modal = new bootstrap.Modal(document.getElementById('videoModal'));
        const videoFrame = document.getElementById('videoFrame');
        
        // Check if it's a YouTube or Vimeo URL
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be')) {
            let videoId = '';
            if (videoUrl.includes('youtube.com/watch')) {
                videoId = new URL(videoUrl).searchParams.get('v');
            } else if (videoUrl.includes('youtu.be')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            }
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        
        videoFrame.src = embedUrl;
        document.getElementById('videoModalTitle').textContent = title || 'Video';
        modal.show();
        
        // Clean up when modal is closed
        modal._element.addEventListener('hidden.bs.modal', function cleanup() {
            videoFrame.src = '';
            modal._element.removeEventListener('hidden.bs.modal', cleanup);
        }, { once: true });
    }
</script>
@endpush
