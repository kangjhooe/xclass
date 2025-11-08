<div class="menu-item list-group-item d-flex justify-content-between align-items-center mb-2" data-menu-id="{{ $menu->id }}">
    <div class="d-flex align-items-center flex-grow-1">
        <span class="menu-handle me-3">
            <i class="fas fa-grip-vertical text-muted"></i>
        </span>
        <input type="checkbox" class="menu-checkbox me-3" value="{{ $menu->id }}" onchange="updateBulkToolbar()">
        @if($menu->icon)
            <i class="{{ $menu->icon }} me-2"></i>
        @endif
        <div class="flex-grow-1">
            <strong>{{ $menu->name }}</strong>
            <div class="small text-muted">
                <code>{{ Str::limit($menu->url, 50) }}</code>
                @if($menu->target === '_blank')
                    <span class="badge bg-info ms-2">External</span>
                @endif
            </div>
        </div>
        <div class="me-3">
            <span class="badge bg-primary">Urutan: {{ $menu->order }}</span>
        </div>
        <div class="me-3">
            <span class="badge {{ $menu->status_badge_class }}">
                {{ $menu->is_active ? 'Aktif' : 'Tidak Aktif' }}
            </span>
        </div>
    </div>
    <div class="btn-group" role="group">
        <a href="{{ $menu->formatted_url }}" 
           class="btn btn-sm btn-outline-info" 
           target="_blank"
           title="Lihat">
            <i class="fas fa-eye"></i>
        </a>
        <button type="button" 
                class="btn btn-sm btn-outline-success toggle-status-btn" 
                data-id="{{ $menu->id }}"
                data-active="{{ $menu->is_active ? '1' : '0' }}"
                title="Toggle Status">
            <i class="fas fa-toggle-{{ $menu->is_active ? 'on' : 'off' }}"></i>
        </button>
        <a href="{{ tenant_route('tenant.admin.menu.edit', $menu->id) }}" 
           class="btn btn-sm btn-outline-primary"
           title="Edit">
            <i class="fas fa-edit"></i>
        </a>
        <button type="button" 
                class="btn btn-sm btn-outline-secondary duplicate-btn" 
                data-id="{{ $menu->id }}"
                title="Duplikasi">
            <i class="fas fa-copy"></i>
        </button>
        <form action="{{ tenant_route('tenant.admin.menu.destroy', $menu->id) }}" 
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
</div>

@if($menu->children && $menu->children->count() > 0)
    <div class="menu-children ms-4" data-parent-id="{{ $menu->id }}">
        @foreach($menu->children as $child)
            @include('publicpage::admin.menu.partials.menu-item', ['menu' => $child, 'level' => $level + 1])
        @endforeach
    </div>
@endif

