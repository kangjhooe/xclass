@extends('layouts.tenant')

@section('title', 'Template Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-file-alt me-2"></i>
                            Template Surat
                        </h3>
                        <a href="{{ tenant_route('letters.templates.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i> Buat Template
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filter dan Search -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <form method="GET" class="d-flex">
                                <input type="text" class="form-control me-2" name="search" 
                                       value="{{ request('search') }}" placeholder="Cari template...">
                                <button type="submit" class="btn btn-outline-primary">
                                    <i class="fas fa-search"></i>
                                </button>
                            </form>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" onchange="filterByCategory(this.value)">
                                <option value="">Semua Kategori</option>
                                @foreach($categories as $key => $label)
                                    <option value="{{ $key }}" {{ request('category') == $key ? 'selected' : '' }}>
                                        {{ $label }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" onchange="filterByStatus(this.value)">
                                <option value="">Semua Status</option>
                                <option value="1" {{ request('is_active') == '1' ? 'selected' : '' }}>Aktif</option>
                                <option value="0" {{ request('is_active') == '0' ? 'selected' : '' }}>Tidak Aktif</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <a href="{{ tenant_route('letters.templates.index') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh me-1"></i> Reset
                            </a>
                        </div>
                    </div>

                    @if($templates->count() > 0)
                        <div class="row">
                            @foreach($templates as $template)
                                <div class="col-md-6 col-lg-4 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header d-flex justify-content-between align-items-center">
                                            <h6 class="card-title mb-0">{{ $template->title }}</h6>
                                            <div class="dropdown">
                                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                        type="button" data-bs-toggle="dropdown">
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </button>
                                                <ul class="dropdown-menu">
                                                    <li>
                                                        <a class="dropdown-item" href="{{ tenant_route('letters.templates.show', $template) }}">
                                                            <i class="fas fa-eye me-1"></i> Lihat
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="{{ tenant_route('letters.templates.edit', $template) }}">
                                                            <i class="fas fa-edit me-1"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="{{ tenant_route('letters.templates.preview', $template) }}" target="_blank">
                                                            <i class="fas fa-external-link-alt me-1"></i> Preview
                                                        </a>
                                                    </li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <li>
                                                        <form method="POST" action="{{ tenant_route('letters.templates.toggle-active', $template) }}" style="display: inline;">
                                                            @csrf
                                                            <button type="submit" class="dropdown-item">
                                                                <i class="fas fa-{{ $template->is_active ? 'pause' : 'play' }} me-1"></i>
                                                                {{ $template->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                                                            </button>
                                                        </form>
                                                    </li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <li>
                                                        <form method="POST" action="{{ tenant_route('letters.templates.destroy', $template) }}" 
                                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus template ini?')" style="display: inline;">
                                                            @csrf
                                                            @method('DELETE')
                                                            <button type="submit" class="dropdown-item text-danger">
                                                                <i class="fas fa-trash me-1"></i> Hapus
                                                            </button>
                                                        </form>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            @if($template->category)
                                                <span class="badge bg-info mb-2">{{ $categories[$template->category] ?? $template->category }}</span>
                                            @endif
                                            
                                            <div class="mb-2">
                                                <span class="badge bg-{{ $template->is_active ? 'success' : 'secondary' }}">
                                                    {{ $template->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                                </span>
                                            </div>

                                            @if($template->description)
                                                <p class="card-text text-muted small">{{ Str::limit($template->description, 100) }}</p>
                                            @endif

                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    <i class="fas fa-tags me-1"></i>
                                                    Variabel: {{ count($template->getAvailableVariables()) }}
                                                </small>
                                            </div>

                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    <i class="fas fa-calendar me-1"></i>
                                                    Dibuat: {{ \App\Helpers\DateHelper::formatIndonesian($template->created_at) }}
                                                </small>
                                            </div>
                                        </div>
                                        <div class="card-footer">
                                            <div class="d-flex justify-content-between">
                                                <a href="{{ tenant_route('letters.templates.show', $template) }}" 
                                                   class="btn btn-sm btn-outline-primary">
                                                    <i class="fas fa-eye me-1"></i> Lihat
                                                </a>
                                                <a href="{{ tenant_route('letters.templates.edit', $template) }}" 
                                                   class="btn btn-sm btn-outline-warning">
                                                    <i class="fas fa-edit me-1"></i> Edit
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        <!-- Pagination -->
                        <div class="d-flex justify-content-center">
                            {{ $templates->appends(request()->query())->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum Ada Template Surat</h5>
                            <p class="text-muted">Buat template surat pertama Anda untuk mempermudah pembuatan surat.</p>
                            <a href="{{ tenant_route('letters.templates.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i> Buat Template Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function filterByCategory(category) {
    const url = new URL(window.location);
    if (category) {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    window.location.href = url.toString();
}

function filterByStatus(status) {
    const url = new URL(window.location);
    if (status) {
        url.searchParams.set('is_active', status);
    } else {
        url.searchParams.delete('is_active');
    }
    window.location.href = url.toString();
}
</script>
@endsection