@extends('layouts.tenant')

@section('title', 'Kelola Menu')

@section('content')
<div class="container-fluid">
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-white-50">Total Menu</h6>
                            <h3 class="mb-0">{{ $stats['total'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-bars"></i>
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
                            <h6 class="mb-0 text-white-50">Aktif</h6>
                            <h3 class="mb-0">{{ $stats['active'] ?? 0 }}</h3>
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
                            <h6 class="mb-0 text-white-50">Tidak Aktif</h6>
                            <h3 class="mb-0">{{ $stats['inactive'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-pause-circle"></i>
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
                            <h6 class="mb-0 text-white-50">Root Menu</h6>
                            <h3 class="mb-0">{{ $stats['root'] ?? 0 }}</h3>
                        </div>
                        <div class="fs-1 opacity-50">
                            <i class="fas fa-sitemap"></i>
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
                            <i class="fas fa-bars mr-2"></i>
                            Kelola Menu Sidebar
                        </h3>
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('tenant.admin.menu.export', request()->query()) }}" class="btn btn-outline-success">
                                <i class="fas fa-download mr-1"></i>
                                Export CSV
                            </a>
                            <a href="{{ tenant_route('tenant.admin.menu.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus mr-1"></i>
                                Tambah Menu
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
                                <form method="GET" action="{{ tenant_route('tenant.admin.menu.index') }}" id="filterForm">
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="form-label">Pencarian</label>
                                            <input type="text" 
                                                   class="form-control" 
                                                   name="search" 
                                                   placeholder="Cari nama, URL, atau icon..." 
                                                   value="{{ request('search') }}">
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Status</label>
                                            <select name="status" class="form-select">
                                                <option value="">Semua Status</option>
                                                <option value="1" {{ request('status') == '1' ? 'selected' : '' }}>Aktif</option>
                                                <option value="0" {{ request('status') == '0' ? 'selected' : '' }}>Tidak Aktif</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Parent</label>
                                            <select name="parent" class="form-select">
                                                <option value="">Semua</option>
                                                <option value="root" {{ request('parent') == 'root' ? 'selected' : '' }}>Root Menu</option>
                                                @foreach($rootMenus ?? [] as $rootMenu)
                                                    <option value="{{ $rootMenu->id }}" {{ request('parent') == $rootMenu->id ? 'selected' : '' }}>{{ $rootMenu->name }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Target</label>
                                            <select name="target" class="form-select">
                                                <option value="">Semua</option>
                                                <option value="_self" {{ request('target') == '_self' ? 'selected' : '' }}>Internal</option>
                                                <option value="_blank" {{ request('target') == '_blank' ? 'selected' : '' }}>External</option>
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Tampilan</label>
                                            <select name="view_mode" class="form-select" onchange="this.form.submit()">
                                                <option value="tree" {{ ($viewMode ?? 'tree') == 'tree' ? 'selected' : '' }}>Tree View</option>
                                                <option value="flat" {{ ($viewMode ?? 'tree') == 'flat' ? 'selected' : '' }}>Flat View</option>
                                            </select>
                                        </div>
                                        <div class="col-md-1">
                                            <label class="form-label">Urutkan</label>
                                            <select name="sort_by" class="form-select">
                                                <option value="order" {{ request('sort_by') == 'order' ? 'selected' : '' }}>Urutan</option>
                                                <option value="name" {{ request('sort_by') == 'name' ? 'selected' : '' }}>Nama</option>
                                                <option value="created_at" {{ request('sort_by') == 'created_at' ? 'selected' : '' }}>Tanggal</option>
                                            </select>
                                        </div>
                                        <div class="col-md-12">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-search mr-1"></i>
                                                Terapkan Filter
                                            </button>
                                            <a href="{{ tenant_route('tenant.admin.menu.index') }}" class="btn btn-outline-secondary">
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
                                <strong id="selectedCount">0</strong> menu dipilih
                            </span>
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-success" onclick="bulkAction('activate')">
                                    <i class="fas fa-check mr-1"></i> Aktifkan
                                </button>
                                <button type="button" class="btn btn-sm btn-secondary" onclick="bulkAction('deactivate')">
                                    <i class="fas fa-ban mr-1"></i> Nonaktifkan
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

                    @if($menus->count() > 0)
                        @if(($viewMode ?? 'tree') === 'tree')
                            <!-- Tree View with Drag & Drop -->
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle mr-2"></i>
                                <strong>Tip:</strong> Seret menu untuk mengubah urutan. Klik dan tahan ikon <i class="fas fa-grip-vertical"></i> untuk memindahkan.
                            </div>
                            <div id="menu-tree" class="list-group">
                                @foreach($menus as $menu)
                                    @include('publicpage::admin.menu.partials.menu-item', ['menu' => $menu, 'level' => 0])
                                @endforeach
                            </div>
                        @else
                            <!-- Flat View with Table -->
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead class="table-light">
                                        <tr>
                                            <th width="40">
                                                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)">
                                            </th>
                                            <th width="60">Urutan</th>
                                            <th>Nama Menu</th>
                                            <th>URL</th>
                                            <th width="80">Icon</th>
                                            <th width="120">Parent</th>
                                            <th width="100">Status</th>
                                            <th width="200" class="text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($menus as $item)
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="menu-checkbox" value="{{ $item->id }}" onchange="updateBulkToolbar()">
                                            </td>
                                            <td>
                                                <span class="badge bg-primary">{{ $item->order }}</span>
                                            </td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    @if($item->icon)
                                                        <i class="{{ $item->icon }} me-2"></i>
                                                    @endif
                                                    <strong>{{ $item->name }}</strong>
                                                    @if($item->target === '_blank')
                                                        <span class="badge bg-info ms-2">External</span>
                                                    @endif
                                                </div>
                                            </td>
                                            <td>
                                                <code class="small">{{ Str::limit($item->url, 50) }}</code>
                                            </td>
                                            <td>
                                                @if($item->icon)
                                                    <i class="{{ $item->icon }} fa-lg"></i>
                                                @else
                                                    <span class="text-muted">-</span>
                                                @endif
                                            </td>
                                            <td>
                                                @if($item->parent)
                                                    <span class="badge bg-secondary">{{ $item->parent->name }}</span>
                                                @else
                                                    <span class="text-muted">Root</span>
                                                @endif
                                            </td>
                                            <td>
                                                <span class="badge {{ $item->status_badge_class }}">
                                                    {{ $item->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <a href="{{ $item->formatted_url }}" 
                                                       class="btn btn-sm btn-outline-info" 
                                                       target="_blank"
                                                       title="Lihat">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    <button type="button" 
                                                            class="btn btn-sm btn-outline-success toggle-status-btn" 
                                                            data-id="{{ $item->id }}"
                                                            data-active="{{ $item->is_active ? '1' : '0' }}"
                                                            title="Toggle Status">
                                                        <i class="fas fa-toggle-{{ $item->is_active ? 'on' : 'off' }}"></i>
                                                    </button>
                                                    <a href="{{ tenant_route('tenant.admin.menu.edit', $item->id) }}" 
                                                       class="btn btn-sm btn-outline-primary"
                                                       title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </a>
                                                    <button type="button" 
                                                            class="btn btn-sm btn-outline-secondary duplicate-btn" 
                                                            data-id="{{ $item->id }}"
                                                            title="Duplikasi">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                    <form action="{{ tenant_route('tenant.admin.menu.destroy', $item->id) }}" 
                                                          method="POST" 
                                                          class="d-inline"
                                                          onsubmit="return confirm('Apakah Anda yakin ingin menghapus menu ini?')">
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
                            @if(method_exists($menus, 'hasPages') && $menus->hasPages())
                            <div class="d-flex justify-content-between align-items-center mt-4">
                                <div>
                                    <small class="text-muted">
                                        Menampilkan {{ $menus->firstItem() }} - {{ $menus->lastItem() }} dari {{ $menus->total() }} menu
                                    </small>
                                </div>
                                <div>
                                    {{ $menus->appends(request()->query())->links() }}
                                </div>
                            </div>
                            @endif
                        @endif
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-bars fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum ada menu</h5>
                            <p class="text-muted">Mulai dengan membuat menu pertama Anda.</p>
                            <a href="{{ tenant_route('tenant.admin.menu.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i>
                                Tambah Menu Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Action Form -->
<form id="bulkActionForm" method="POST" action="{{ tenant_route('tenant.admin.menu.bulk-action') }}">
    @csrf
    <input type="hidden" name="action" id="bulkAction">
    <input type="hidden" name="ids[]" id="bulkIds">
</form>
@endsection

@push('styles')
<link href="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.css" rel="stylesheet">
<style>
    .menu-item {
        cursor: move;
        transition: all 0.2s;
    }
    .menu-item:hover {
        background-color: #f8f9fa;
    }
    .menu-item.dragging {
        opacity: 0.5;
    }
    .menu-handle {
        cursor: grab;
        color: #6c757d;
    }
    .menu-handle:active {
        cursor: grabbing;
    }
    .menu-children {
        margin-left: 30px;
        border-left: 2px solid #dee2e6;
        padding-left: 15px;
    }
</style>
@endpush

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>
    // Bulk selection
    function toggleSelectAll(checkbox) {
        const checkboxes = document.querySelectorAll('.menu-checkbox');
        checkboxes.forEach(cb => cb.checked = checkbox.checked);
        updateBulkToolbar();
    }

    function updateBulkToolbar() {
        const checked = document.querySelectorAll('.menu-checkbox:checked');
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
        document.querySelectorAll('.menu-checkbox').forEach(cb => cb.checked = false);
        const selectAll = document.getElementById('selectAll');
        if (selectAll) selectAll.checked = false;
        updateBulkToolbar();
    }

    function bulkAction(action) {
        const checked = document.querySelectorAll('.menu-checkbox:checked');
        if (checked.length === 0) {
            alert('Pilih minimal satu menu');
            return;
        }

        if (action === 'delete' && !confirm(`Apakah Anda yakin ingin menghapus ${checked.length} menu?`)) {
            return;
        }

        const ids = Array.from(checked).map(cb => cb.value);
        document.getElementById('bulkAction').value = action;
        
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
            
            fetch(`{{ tenant_route('tenant.admin.menu.toggle-status', ':id') }}`.replace(':id', id), {
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

    // Duplicate menu
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            
            if (!confirm('Apakah Anda yakin ingin menduplikasi menu ini?')) {
                return;
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `{{ tenant_route('tenant.admin.menu.duplicate', ':id') }}`.replace(':id', id);
            
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = '{{ csrf_token() }}';
            form.appendChild(csrfInput);
            
            document.body.appendChild(form);
            form.submit();
        });
    });

    // Drag & Drop for Tree View
    @if(($viewMode ?? 'tree') === 'tree')
    const menuTree = document.getElementById('menu-tree');
    if (menuTree && typeof Sortable !== 'undefined') {
        new Sortable(menuTree, {
            handle: '.menu-handle',
            animation: 150,
            ghostClass: 'dragging',
            onEnd: function(evt) {
                const items = Array.from(menuTree.querySelectorAll('.menu-item'));
                const menus = items.map((item, index) => {
                    const menuId = item.dataset.menuId;
                    const parentId = item.closest('.menu-children')?.dataset.parentId || null;
                    return {
                        id: menuId,
                        order: index + 1,
                        parent_id: parentId
                    };
                });

                // Update order via AJAX
                fetch('{{ tenant_route("admin.menu.update-order") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ menus: menus })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Gagal memperbarui urutan menu');
                        location.reload();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat memperbarui urutan');
                    location.reload();
                });
            }
        });
    }
    @endif
</script>
@endpush
