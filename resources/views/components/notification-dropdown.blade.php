@php
    $unreadCount = \App\Models\Notification::where('user_id', auth()->id())
        ->where('instansi_id', auth()->user()->instansi_id)
        ->unread()
        ->count();
    
    $recentNotifications = \App\Models\Notification::where('user_id', auth()->id())
        ->where('instansi_id', auth()->user()->instansi_id)
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
@endphp

<div class="dropdown">
    <button class="btn btn-outline-primary dropdown-toggle position-relative" type="button" 
            id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="fas fa-bell"></i>
        @if($unreadCount > 0)
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ $unreadCount }}
                <span class="visually-hidden">unread notifications</span>
            </span>
        @endif
    </button>
    <ul class="dropdown-menu dropdown-menu-end" style="width: 350px;">
        <li class="dropdown-header d-flex justify-content-between align-items-center">
            <span>Notifikasi</span>
            @if($unreadCount > 0)
                <button class="btn btn-sm btn-outline-primary" onclick="markAllAsRead()">
                    <i class="fas fa-check-double me-1"></i> Tandai Semua Dibaca
                </button>
            @endif
        </li>
        <li><hr class="dropdown-divider"></li>
        
        @if($recentNotifications->count() > 0)
            @foreach($recentNotifications as $notification)
                <li>
                    <a class="dropdown-item {{ $notification->isUnread() ? 'bg-light' : '' }}" 
                       href="{{ $notification->link ?: '#' }}" 
                       onclick="{{ $notification->isUnread() ? 'markAsRead(' . $notification->id . ')' : '' }}">
                        <div class="d-flex w-100 justify-content-between">
                            <div class="flex-grow-1">
                                <h6 class="mb-1 {{ $notification->isUnread() ? 'fw-bold' : '' }}">
                                    {{ $notification->title }}
                                </h6>
                                <p class="mb-1 text-muted small">{{ Str::limit($notification->message, 50) }}</p>
                                <small class="text-muted">{{ $notification->created_at->diffForHumans() }}</small>
                            </div>
                            @if($notification->isUnread())
                                <span class="badge bg-primary ms-2">Baru</span>
                            @endif
                        </div>
                    </a>
                </li>
                @if(!$loop->last)
                    <li><hr class="dropdown-divider"></li>
                @endif
            @endforeach
            
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item text-center" href="{{ tenant_route('notifications.index') }}">
                    <i class="fas fa-eye me-1"></i> Lihat Semua Notifikasi
                </a>
            </li>
        @else
            <li>
                <div class="dropdown-item-text text-center text-muted py-3">
                    <i class="fas fa-bell-slash fa-2x mb-2"></i>
                    <p class="mb-0">Tidak ada notifikasi</p>
                </div>
            </li>
        @endif
    </ul>
</div>

<script>
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
            // Update UI without reload
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error marking notification as read:', error);
    });
}

function markAllAsRead() {
    fetch('{{ tenant_route("notifications.mark-all-read") }}', {
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
        }
    })
    .catch(error => {
        console.error('Error marking all notifications as read:', error);
    });
}

// Auto refresh notifications every 30 seconds
setInterval(function() {
    fetch('{{ tenant_route("notifications.unread-count") }}')
        .then(response => response.json())
        .then(data => {
            const badge = document.querySelector('#notificationDropdown .badge');
            if (data.count > 0) {
                if (badge) {
                    badge.textContent = data.count;
                } else {
                    // Create badge if it doesn't exist
                    const button = document.querySelector('#notificationDropdown');
                    const newBadge = document.createElement('span');
                    newBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
                    newBadge.textContent = data.count;
                    button.appendChild(newBadge);
                }
            } else {
                if (badge) {
                    badge.remove();
                }
            }
        })
        .catch(error => {
            console.error('Error fetching notification count:', error);
        });
}, 30000);
</script>
