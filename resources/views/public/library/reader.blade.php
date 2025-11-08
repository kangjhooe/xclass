@extends('publicpage::layouts.master')

@section('title', 'Baca: ' . $book->title)

@push('styles')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.css">
<style>
    .pdf-viewer-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: #525252;
        z-index: 9999;
        display: flex;
        flex-direction: column;
    }
    
    .pdf-toolbar {
        background: #2b2b2b;
        color: white;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .pdf-toolbar-left {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .pdf-toolbar-center {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .pdf-toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .pdf-toolbar button {
        background: #404040;
        border: none;
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .pdf-toolbar button:hover {
        background: #505050;
    }
    
    .pdf-toolbar button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .pdf-viewer {
        flex: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
    }
    
    .pdf-page {
        margin-bottom: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        background: white;
    }
    
    .pdf-sidebar {
        position: fixed;
        right: -300px;
        top: 60px;
        width: 300px;
        height: calc(100vh - 60px);
        background: white;
        box-shadow: -2px 0 10px rgba(0,0,0,0.3);
        transition: right 0.3s;
        overflow-y: auto;
        z-index: 10000;
    }
    
    .pdf-sidebar.open {
        right: 0;
    }
    
    .pdf-sidebar-header {
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
    }
    
    .pdf-sidebar-content {
        padding: 15px;
    }
    
    .bookmark-item {
        padding: 10px;
        border-bottom: 1px solid #dee2e6;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .bookmark-item:hover {
        background: #f8f9fa;
    }
    
    .progress-bar-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #2b2b2b;
        padding: 10px 20px;
        z-index: 10001;
    }
    
    .progress-bar {
        width: 100%;
        height: 5px;
        background: #404040;
        border-radius: 5px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: #007bff;
        transition: width 0.3s;
    }
    
    .page-info {
        color: white;
        text-align: center;
        margin-top: 5px;
    }
</style>
@endpush

@section('content')
<div class="pdf-viewer-container">
    <!-- Toolbar -->
    <div class="pdf-toolbar">
        <div class="pdf-toolbar-left">
            <a href="{{ route('public.library.show', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="btn btn-sm btn-secondary">
                <i class="fas fa-arrow-left"></i> Kembali
            </a>
            <h5 class="mb-0 text-truncate" style="max-width: 300px;">{{ $book->title }}</h5>
        </div>
        <div class="pdf-toolbar-center">
            <button id="prevPage" disabled>
                <i class="fas fa-chevron-left"></i> Sebelumnya
            </button>
            <span class="mx-2">
                Halaman <span id="currentPage">1</span> dari <span id="totalPages">0</span>
            </span>
            <button id="nextPage">
                Berikutnya <i class="fas fa-chevron-right"></i>
            </button>
            <input type="number" id="pageInput" min="1" value="1" 
                   style="width: 60px; padding: 5px; border-radius: 5px; border: 1px solid #505050; background: #404040; color: white; text-align: center;">
            <button id="goToPage">Go</button>
        </div>
        <div class="pdf-toolbar-right">
            <button id="zoomOut">
                <i class="fas fa-search-minus"></i>
            </button>
            <span id="zoomLevel" class="mx-2">100%</span>
            <button id="zoomIn">
                <i class="fas fa-search-plus"></i>
            </button>
            <button id="fitWidth">
                <i class="fas fa-expand-arrows-alt"></i> Fit Width
            </button>
            <button id="fitPage">
                <i class="fas fa-compress-arrows-alt"></i> Fit Page
            </button>
            @auth
            <button id="toggleSidebar">
                <i class="fas fa-bookmark"></i> Bookmark
            </button>
            <button id="addBookmark">
                <i class="fas fa-plus"></i> Tambah Bookmark
            </button>
            @endauth
            @if($book->allow_download)
            <a href="{{ route('public.library.download', ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}" class="btn btn-sm btn-success">
                <i class="fas fa-download"></i> Download
            </a>
            @endif
        </div>
    </div>

    <!-- PDF Viewer -->
    <div class="pdf-viewer" id="pdfViewer">
        <div id="loading" class="text-center text-white">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p class="mt-3">Memuat PDF...</p>
        </div>
    </div>

    <!-- Sidebar for Bookmarks -->
    @auth
    <div class="pdf-sidebar" id="sidebar">
        <div class="pdf-sidebar-header">
            <h5 class="mb-0">Bookmark & Progress</h5>
            <button class="btn btn-sm btn-secondary mt-2" id="closeSidebar">
                <i class="fas fa-times"></i> Tutup
            </button>
        </div>
        <div class="pdf-sidebar-content">
            <div class="mb-3">
                <h6>Progress Membaca</h6>
                <div class="progress mb-2" style="height: 25px;">
                    <div class="progress-bar" id="progressBar" role="progressbar" 
                         style="width: {{ $reading ? $reading->progress_percentage : 0 }}%"
                         aria-valuenow="{{ $reading ? $reading->progress_percentage : 0 }}" 
                         aria-valuemin="0" aria-valuemax="100">
                        {{ $reading ? number_format($reading->progress_percentage, 1) : 0 }}%
                    </div>
                </div>
                <small class="text-muted">
                    Halaman terakhir: <span id="lastPageText">{{ $reading ? $reading->last_page : 1 }}</span>
                </small>
            </div>
            
            <div class="mb-3">
                <h6>Bookmark</h6>
                <div id="bookmarksList">
                    @if($reading && $reading->bookmarks && count($reading->bookmarks) > 0)
                        @foreach($reading->bookmarks as $page)
                        <div class="bookmark-item" data-page="{{ $page }}">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Halaman {{ $page }}</span>
                                <button class="btn btn-sm btn-danger" onclick="removeBookmark({{ $page }})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        @endforeach
                    @else
                        <p class="text-muted">Belum ada bookmark</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
    @endauth

    <!-- Progress Bar -->
    <div class="progress-bar-container">
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width: {{ $reading ? $reading->progress_percentage : 0 }}%"></div>
        </div>
        <div class="page-info">
            <span id="progressText">{{ $reading ? number_format($reading->progress_percentage, 1) : 0 }}% selesai</span>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let currentPage = {{ $reading ? $reading->last_page : 1 }};
let pageNum = currentPage;
let totalPages = 0;
let scale = 1.0;
let readingStartTime = Date.now();
let lastProgressUpdate = Date.now();

// Initialize PDF
const pdfUrl = '{{ $book->pdf_url }}';
const loadingTask = pdfjsLib.getDocument(pdfUrl);

loadingTask.promise.then(function(pdf) {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('pageInput').max = totalPages;
    
    // Render initial page
    renderPage(currentPage);
    
    // Update progress
    updateProgress();
    
    document.getElementById('loading').style.display = 'none';
}).catch(function(error) {
    console.error('Error loading PDF:', error);
    document.getElementById('loading').innerHTML = 
        '<p class="text-danger">Error memuat PDF: ' + error.message + '</p>';
});

// Render page
function renderPage(num) {
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'pdf-page';
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        page.render(renderContext).promise.then(function() {
            const viewer = document.getElementById('pdfViewer');
            viewer.innerHTML = '';
            viewer.appendChild(canvas);
            
            currentPage = num;
            document.getElementById('currentPage').textContent = num;
            document.getElementById('pageInput').value = num;
            
            // Update button states
            document.getElementById('prevPage').disabled = (num <= 1);
            document.getElementById('nextPage').disabled = (num >= totalPages);
            
            // Update progress
            updateProgress();
            
            // Save reading progress
            saveProgress();
        });
    });
}

// Navigation
document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
        renderPage(currentPage - 1);
    }
});

document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage < totalPages) {
        renderPage(currentPage + 1);
    }
});

document.getElementById('goToPage').addEventListener('click', function() {
    const page = parseInt(document.getElementById('pageInput').value);
    if (page >= 1 && page <= totalPages) {
        renderPage(page);
    }
});

document.getElementById('pageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('goToPage').click();
    }
});

// Zoom
document.getElementById('zoomIn').addEventListener('click', function() {
    scale += 0.2;
    updateZoom();
    renderPage(currentPage);
});

document.getElementById('zoomOut').addEventListener('click', function() {
    if (scale > 0.5) {
        scale -= 0.2;
        updateZoom();
        renderPage(currentPage);
    }
});

document.getElementById('fitWidth').addEventListener('click', function() {
    // Fit to width logic
    const viewer = document.getElementById('pdfViewer');
    const containerWidth = viewer.clientWidth;
    pdfDoc.getPage(currentPage).then(function(page) {
        const viewport = page.getViewport({ scale: 1.0 });
        scale = containerWidth / viewport.width;
        updateZoom();
        renderPage(currentPage);
    });
});

document.getElementById('fitPage').addEventListener('click', function() {
    // Fit to page logic
    const viewer = document.getElementById('pdfViewer');
    const containerWidth = viewer.clientWidth;
    const containerHeight = viewer.clientHeight;
    pdfDoc.getPage(currentPage).then(function(page) {
        const viewport = page.getViewport({ scale: 1.0 });
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        scale = Math.min(scaleX, scaleY) * 0.9;
        updateZoom();
        renderPage(currentPage);
    });
});

function updateZoom() {
    document.getElementById('zoomLevel').textContent = Math.round(scale * 100) + '%';
}

// Sidebar
@auth
document.getElementById('toggleSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('closeSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('open');
});

// Bookmark click
document.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
            const page = parseInt(this.getAttribute('data-page'));
            renderPage(page);
        }
    });
});

// Add bookmark
document.getElementById('addBookmark').addEventListener('click', function() {
    addBookmark(currentPage);
});

function addBookmark(page) {
    fetch('{{ route("public.library.bookmark", ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            page: page,
            note: 'Halaman ' + page
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateBookmarksList(data.bookmarks);
        }
    });
}

function removeBookmark(page) {
    fetch('{{ route("public.library.bookmark.remove", ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            page: page
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateBookmarksList(data.bookmarks);
        }
    });
}

function updateBookmarksList(bookmarks) {
    const list = document.getElementById('bookmarksList');
    if (bookmarks && bookmarks.length > 0) {
        list.innerHTML = bookmarks.map(page => `
            <div class="bookmark-item" data-page="${page}">
                <div class="d-flex justify-content-between align-items-center">
                    <span>Halaman ${page}</span>
                    <button class="btn btn-sm btn-danger" onclick="removeBookmark(${page})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Reattach click events
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                    const page = parseInt(this.getAttribute('data-page'));
                    renderPage(page);
                }
            });
        });
    } else {
        list.innerHTML = '<p class="text-muted">Belum ada bookmark</p>';
    }
}

// Save progress
function saveProgress() {
    const now = Date.now();
    const readingTime = Math.floor((now - readingStartTime) / 1000);
    
    // Update every 5 seconds or on page change
    if (now - lastProgressUpdate > 5000 || currentPage !== pageNum) {
        fetch('{{ route("public.library.progress", ['tenant' => request()->route('tenant'), 'id' => $book->id]) }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                page: currentPage,
                total_pages: totalPages,
                reading_time: readingTime
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProgressDisplay(data.progress, currentPage);
            }
        });
        
        lastProgressUpdate = now;
        pageNum = currentPage;
    }
}

function updateProgress() {
    const progress = (currentPage / totalPages) * 100;
    updateProgressDisplay(progress, currentPage);
}

function updateProgressDisplay(progress, page) {
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
    document.getElementById('progressBar').textContent = Math.round(progress * 10) / 10 + '%';
    document.getElementById('progressText').textContent = Math.round(progress * 10) / 10 + '% selesai';
    document.getElementById('lastPageText').textContent = page;
}

// Auto-save progress every 30 seconds
setInterval(function() {
    if (pdfDoc) {
        saveProgress();
    }
}, 30000);
@endauth

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' && currentPage > 1) {
        renderPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        renderPage(currentPage + 1);
    }
});
</script>
@endpush
@endsection

