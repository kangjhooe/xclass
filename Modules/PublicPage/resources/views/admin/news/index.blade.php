@extends('layouts.tenant')

@section('title', 'Kelola Berita')

@section('content')
<div class="container-fluid">
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-white-50">Total Berita</h6>
                            <h3 class="mb-0">{{ $stats['total'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-newspaper"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-white-50">Published</h6>
                            <h3 class="mb-0">{{ $stats['published'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-secondary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-white-50">Draft</h6>
                            <h3 class="mb-0">{{ $stats['draft'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-file-alt"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-info text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-white-50">Total Views</h6>
                            <h3 class="mb-0">{{ number_format($stats['total_views'] ?? 0) }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-newspaper mr-2"></i>
                            Kelola Berita
                        </h3>
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('admin.news.export', request()->query()) }}" class="btn btn-outline-success">
                                <i class="fas fa-download mr-1"></i>
                                Export CSV
                            </a>
                            <a href="{{ tenant_route('admin.news.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus mr-1"></i>
                                Tambah Berita
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Advanced Filters -->
                    <div class="card mb-4 border">
                        <div class="card-header bg-light">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="fas fa-filter mr-2"></i>
                                    Filter & Pencarian
                                </h6>
                                <button class="btn btn-sm btn-link text-decoration-none" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                        <div class="collapse show" id="filterCollapse">
                            <div class="card-body">
                                <form method="GET" action="{{ tenant_route('admin.news.index') }}" id="filterForm">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label">Pencarian</label>
                                            <input type="text" 
                                                   class="form-control" 
                                                   name="search" 
                                                   placeholder="Cari judul, konten, atau penulis..." 
                                                   value="{{ request('search') }}">
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Status</label>
                                            <select name="status" class="form-select">
                                                <option value="">Semua Status</option>
                                                <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                                <option value="published" {{ request('status') == 'published' ? 'selected' : '' }}>Published</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Unggulan</label>
                                            <select name="featured" class="form-select">
                                                <option value="">Semua</option>
                                                <option value="1" {{ request('featured') == '1' ? 'selected' : '' }}>Unggulan</option>
                                                <option value="0" {{ request('featured') == '0' ? 'selected' : '' }}>Bukan Unggulan</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Penulis</label>
                                            <select name="author" class="form-select">
                                                <option value="">Semua Penulis</option>
                                                @foreach($authors ?? [] as $author)
                                                    <option value="{{ $author }}" {{ request('author') == $author ? 'selected' : '' }}>{{ $author }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Urutkan</label>
                                            <select name="sort_by" class="form-select">
                                                <option value="created_at" {{ request('sort_by') == 'created_at' ? 'selected' : '' }}>Tanggal Dibuat</option>
                                                <option value="published_at" {{ request('sort_by') == 'published_at' ? 'selected' : '' }}>Tanggal Publikasi</option>
                                                <option value="title" {{ request('sort_by') == 'title' ? 'selected' : '' }}>Judul</option>
                                                <option value="view_count" {{ request('sort_by') == 'view_count' ? 'selected' : '' }}>Views</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Dari Tanggal</label>
                                            <input type="date" 
                                                   class="form-control" 
                                                   name="date_from" 
                                                   value="{{ request('date_from') }}">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Sampai Tanggal</label>
                                            <input type="date" 
                                                   class="form-control" 
                                                   name="date_to" 
                                                   value="{{ request('date_to') }}">
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Per Halaman</label>
                                            <select name="per_page" class="form-select">
                                                <option value="10" {{ request('per_page') == '10' ? 'selected' : '' }}>10</option>
                                                <option value="15" {{ request('per_page') == '15' ? 'selected' : '' }}>15</option>
                                                <option value="25" {{ request('per_page') == '25' ? 'selected' : '' }}>25</option>
                                                <option value="50" {{ request('per_page') == '50' ? 'selected' : '' }}>50</option>
                                            </select>
                                        </div>
                                        <div class="col-md-12">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search mr-1"></i>
                                                Terapkan Filter
                                            </button>
                                            <a href="{{ tenant_route('admin.news.index') }}" class="btn btn-outline-secondary">
                                                <i class="fas fa-times mr-1"></i>
                                                Reset
                                            </a>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Bulk Actions Toolbar -->
                    <div id="bulkActionsToolbar" class="alert alert-info d-none mb-3" role="alert">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>
                                <strong id="selectedCount">0</strong> berita dipilih
                            </span>
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-success" onclick="bulkAction('publish')">
                                    <i class="fas fa-check mr-1"></i> Publish
                                </button>
                                <button type="button" class="btn btn-sm btn-secondary" onclick="bulkAction('unpublish')">
                                    <i class="fas fa-file-alt mr-1"></i> Draft
                                </button>
                                <button type="button" class="btn btn-sm btn-warning" onclick="bulkAction('toggle_featured')">
                                    <i class="fas fa-star mr-1"></i> Toggle Unggulan
                                </button>
                                <button type="button" class="btn btn-sm btn-danger" onclick="bulkAction('delete')">
                                    <i class="fas fa-trash mr-1"></i> Hapus
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearSelection()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    @if($news->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover table-striped">
                                <thead class="table-light">
                                    <tr>
                                        <th width="40">
                                            <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                                        </th>
                                        <th width="80">Gambar</th>
                                        <th>Judul</th>
                                        <th width="100">Status</th>
                                        <th width="120">Penulis</th>
                                        <th width="120">Tanggal</th>
                                        <th width="80" class="text-center">Views</th>
                                        <th width="200" class="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($news as $article)
                                    <tr>
                                        <td>
                                            <input type="checkbox" class="news-checkbox" value="{{ $article->id }}" onchange="updateBulkToolbar()">
                                        </td>
                                        <td>
                                            @if($article->featured_image)
                                                <img src="{{ asset('storage/' . $article->featured_image) }}" 
                                                     alt="{{ $article->title }}" 
                                                     class="rounded" 
                                                     style="width: 60px; height: 40px; object-fit: cover;">
                                            @else
                                                <div class="bg-light rounded d-flex align-items-center justify-content-center" 
                                                     style="width: 60px; height: 40px;">
                                                    <i class="fas fa-image text-muted"></i>
                                                </div>
                                            @endif
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{{ $article->title }}</strong>
                                                @if($article->is_featured)
                                                    <span class="badge bg-warning text-dark ms-2">
                                                        <i class="fas fa-star"></i> Unggulan
                                                    </span>
                                                @endif
                                            </div>
                                            <small class="text-muted">{{ Str::limit(strip_tags($article->excerpt), 80) }}</small>
                                        </td>
                                        <td>
                                            <span class="badge {{ $article->status_badge_class }}">
                                                {{ ucfirst($article->status) }}
                                            </span>
                                        </td>
                                        <td>
                                            <small>{{ $article->author }}</small>
                                        </td>
                                        <td>
                                            <small class="text-muted">
                                                <i class="fas fa-calendar me-1"></i>
                                                {{ $article->formatted_published_date ?? $article->formatted_created_date }}
                                            </small>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge bg-info">
                                                <i class="fas fa-eye me-1"></i>{{ $article->view_count }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('public.news.show', $article->slug) }}" 
                                                   class="btn btn-sm btn-outline-info" 
                                                   target="_blank"
                                                   title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <button type="button" 
                                                        class="btn btn-sm btn-outline-success toggle-status-btn" 
                                                        data-id="{{ $article->id }}"
                                                        data-status="{{ $article->status }}"
                                                        title="Toggle Status">
                                                    <i class="fas fa-toggle-{{ $article->status === 'published' ? 'on' : 'off' }}"></i>
                                                </button>
                                                <button type="button" 
                                                        class="btn btn-sm btn-outline-warning toggle-featured-btn" 
                                                        data-id="{{ $article->id }}"
                                                        data-featured="{{ $article->is_featured ? '1' : '0' }}"
                                                        title="Toggle Unggulan">
                                                    <i class="fas fa-star"></i>
                                                </button>
                                                <a href="{{ tenant_route('admin.news.edit', $article->id) }}" 
                                                   class="btn btn-sm btn-outline-primary"
                                                   title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <button type="button" 
                                                        class="btn btn-sm btn-outline-secondary duplicate-btn" 
                                                        data-id="{{ $article->id }}"
                                                        title="Duplikasi">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                                <form action="{{ tenant_route('admin.news.destroy', $article->id) }}" 
                                                      method="POST" 
                                                      class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus berita ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" 
                                                            class="btn btn-sm btn-outline-danger"
                                                            title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        @if($news->hasPages())
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <div>
                                <small class="text-muted">
                                    Menampilkan {{ $news->firstItem() }} - {{ $news->lastItem() }} dari {{ $news->total() }} berita
                                </small>
                            </div>
                            <div>
                                {{ $news->appends(request()->query())->links() }}
                            </div>
                        </div>
                        @endif
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum ada berita</h5>
                            <p class="text-muted">Mulai dengan membuat berita pertama Anda.</p>
                            <a href="{{ tenant_route('admin.news.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i>
                                Tambah Berita Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Action Form -->
<form id="bulkActionForm" method="POST" action="{{ tenant_route('admin.news.bulk-action') }}">
    @csrf
    <input type="hidden" name="action" id="bulkAction">
    <input type="hidden" name="ids[]" id="bulkIds">
</form>
@endsection

@push('scripts')
<script>
    // Bulk selection
    function toggleSelectAll(checkbox) {
        const checkboxes = document.querySelectorAll('.news-checkbox');
        checkboxes.forEach(cb => cb.checked = checkbox.checked);
        updateBulkToolbar();
    }

    function updateBulkToolbar() {
        const checked = document.querySelectorAll('.news-checkbox:checked');
        const toolbar = document.getElementById('bulkActionsToolbar');
        const count = document.getElementById('selectedCount');
        
        if (checked.length > 0) {
            toolbar.classList.remove('d-none');
            count.textContent = checked.length;
        } else {
            toolbar.classList.add('d-none');
        }
    }

    function clearSelection() {
        document.querySelectorAll('.news-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('selectAll').checked = false;
        updateBulkToolbar();
    }

    function bulkAction(action) {
        const checked = document.querySelectorAll('.news-checkbox:checked');
        if (checked.length === 0) {
            alert('Pilih minimal satu berita');
            return;
        }

        if (action === 'delete' && !confirm(`Apakah Anda yakin ingin menghapus ${checked.length} berita?`)) {
            return;
        }

        const ids = Array.from(checked).map(cb => cb.value);
        document.getElementById('bulkAction').value = action;
        document.getElementById('bulkIds').value = ids.join(',');
        
        // Create hidden inputs for each ID
        const form = document.getElementById('bulkActionForm');
        form.querySelectorAll('input[name="ids[]"]').forEach(input => input.remove());
        ids.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = id;
            form.appendChild(input);
        });

        form.submit();
    }

    // Quick toggle status
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const currentStatus = this.dataset.status;
            
            fetch(`{{ tenant_route('admin.news.toggle-status', ':id') }}`.replace(':id', id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert(data.message || 'Terjadi kesalahan');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mengubah status');
            });
        });
    });

    // Quick toggle featured
    document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            
            fetch(`{{ tenant_route('admin.news.toggle-featured', ':id') }}`.replace(':id', id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert(data.message || 'Terjadi kesalahan');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mengubah status unggulan');
            });
        });
    });

    // Duplicate news
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            
            if (!confirm('Apakah Anda yakin ingin menduplikasi berita ini?')) {
                return;
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `{{ tenant_route('admin.news.duplicate', ':id') }}`.replace(':id', id);
            
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = '{{ csrf_token() }}';
            form.appendChild(csrfInput);
            
            document.body.appendChild(form);
            form.submit();
        });
    });
</script>
@endpush
