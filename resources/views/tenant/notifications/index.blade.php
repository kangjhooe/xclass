@extends('layouts.tenant')

@section('title', 'Notifikasi')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-bell me-2"></i>
                            Notifikasi
                        </h3>
                        <div class="btn-group">
                            <button class="btn btn-outline-primary" onclick="markAllAsRead()">
                                <i class="fas fa-check-double me-1"></i> Tandai Semua Dibaca
                            </button>
                            <button class="btn btn-outline-danger" onclick="clearRead()">
                                <i class="fas fa-trash me-1"></i> Hapus yang Dibaca
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filter -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <form method="GET" class="d-flex">
                                <input type="text" class="form-control me-2" name="search" 
                                       value="{{ request('search') }}" placeholder="Cari notifikasi...">
                                <button type="submit" class="btn btn-outline-primary">
                                    <i class="fas fa-search"></i>
                                </button>
                            </form>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" onchange="filterByType(this.value)">
                                <option value="">Semua Tipe</option>
                                @foreach($types as $key => $label)
                                    <option value="{{ $key }}" {{ request('type') == $key ? 'selected' : '' }}>
                                        {{ $label }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" onchange="filterByStatus(this.value)">
                                <option value="">Semua Status</option>
                                <option value="unread" {{ request('read_status') == 'unread' ? 'selected' : '' }}>Belum Dibaca</option>
                                <option value="read" {{ request('read_status') == 'read' ? 'selected' : '' }}>Sudah Dibaca</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <a href="{{ tenant_route('notifications.index') }}" class="btn btn-outline-secondary">
                                <i class="fas fa-refresh me-1"></i> Reset
                            </a>
                        </div>
                    </div>

                    @if($notifications->count() > 0)
                        <div class="list-group">
                            @foreach($notifications as $notification)
                                <div class="list-group-item {{ $notification->isUnread() ? 'list-group-item-light' : '' }}">
                                    <div class="d-flex w-100 justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center mb-2">
                                                @if($notification->isUnread())
                                                    <span class="badge bg-primary me-2">Baru</span>
                                                @endif
                                                <span class="badge bg-{{ $notification->type === 'error' ? 'danger' : ($notification->type === 'warning' ? 'warning' : ($notification->type === 'success' ? 'success' : 'info')) }} me-2">
                                                    {{ $types[$notification->type] ?? $notification->type }}
                                                </span>
                                                <small class="text-muted">{{ $notification->created_at->diffForHumans() }}</small>
                                            </div>
                                            
                                            <h6 class="mb-1 {{ $notification->isUnread() ? 'fw-bold' : '' }}">
                                                {{ $notification->title }}
                                            </h6>
                                            
                                            <p class="mb-2 text-muted">{{ $notification->message }}</p>
                                            
                                            @if($notification->link)
                                                <a href="{{ $notification->link }}" class="btn btn-sm btn-outline-primary">
                                                    <i class="fas fa-external-link-alt me-1"></i> Lihat Detail
                                                </a>
                                            @endif
                                        </div>
                                        
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                    type="button" data-bs-toggle="dropdown">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul class="dropdown-menu">
                                                @if($notification->isUnread())
                                                    <li>
                                                        <a class="dropdown-item" href="#" onclick="markAsRead({{ $notification->id }})">
                                                            <i class="fas fa-check me-1"></i> Tandai Dibaca
                                                        </a>
                                                    </li>
                                                @else
                                                    <li>
                                                        <a class="dropdown-item" href="#" onclick="markAsUnread({{ $notification->id }})">
                                                            <i class="fas fa-undo me-1"></i> Tandai Belum Dibaca
                                                        </a>
                                                    </li>
                                                @endif
                                                <li><hr class="dropdown-divider"></li>
                                                <li>
                                                    <a class="dropdown-item text-danger" href="#" onclick="deleteNotification({{ $notification->id }})">
                                                        <i class="fas fa-trash me-1"></i> Hapus
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        <!-- Pagination -->
                        <div class="d-flex justify-content-center mt-4">
                            {{ $notifications->appends(request()->query())->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Tidak Ada Notifikasi</h5>
                            <p class="text-muted">Anda belum memiliki notifikasi saat ini.</p>
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
function filterByType(type) {
    const url = new URL(window.location);
    if (type) {
        url.searchParams.set('type', type);
    } else {
        url.searchParams.delete('type');
    }
    window.location.href = url.toString();
}

function filterByStatus(status) {
    const url = new URL(window.location);
    if (status) {
        url.searchParams.set('read_status', status);
    } else {
        url.searchParams.delete('read_status');
    }
    window.location.href = url.toString();
}

function markAsRead(notificationId) {
    fetch(`{{ tenant_route('notifications.mark-read', ':id') }}`.replace(':id', notificationId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error: Gagal menandai notifikasi sebagai dibaca');
        }
    })
    .catch(error => {
        alert('Error: Gagal menandai notifikasi sebagai dibaca');
    });
}

function markAsUnread(notificationId) {
    fetch(`{{ tenant_route('notifications.mark-unread', ':id') }}`.replace(':id', notificationId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error: Gagal menandai notifikasi sebagai belum dibaca');
        }
    })
    .catch(error => {
        alert('Error: Gagal menandai notifikasi sebagai belum dibaca');
    });
}

function markAllAsRead() {
    if (confirm('Apakah Anda yakin ingin menandai semua notifikasi sebagai dibaca?')) {
        fetch('{{ route("tenant.notifications.mark-all-read") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: Gagal menandai semua notifikasi sebagai dibaca');
            }
        })
        .catch(error => {
            alert('Error: Gagal menandai semua notifikasi sebagai dibaca');
        });
    }
}

function clearRead() {
    if (confirm('Apakah Anda yakin ingin menghapus semua notifikasi yang sudah dibaca?')) {
        fetch('{{ route("tenant.notifications.clear-read") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: Gagal menghapus notifikasi yang sudah dibaca');
            }
        })
        .catch(error => {
            alert('Error: Gagal menghapus notifikasi yang sudah dibaca');
        });
    }
}

function deleteNotification(notificationId) {
    if (confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
        fetch(`{{ tenant_route('notifications.destroy', ':id') }}`.replace(':id', notificationId), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: Gagal menghapus notifikasi');
            }
        })
        .catch(error => {
            alert('Error: Gagal menghapus notifikasi');
        });
    }
}
</script>
@endsection
