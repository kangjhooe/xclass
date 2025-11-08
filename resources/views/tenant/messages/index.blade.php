@extends('layouts.tenant')

@section('title', 'Pesan')
@section('page-title', 'Pesan')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-envelope me-3"></i>
                Pesan
            </h2>
            <p>Kelola pesan Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.messages.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Pesan Baru
            </a>
        </div>
    </div>
</div>

<div class="d-flex gap-2 mb-3 flex-wrap">
    <a href="{{ tenant_route('tenant.messages.inbox') }}" class="btn btn-modern btn-primary">
        <i class="fas fa-inbox me-2"></i>Kotak Masuk
    </a>
    <a href="{{ tenant_route('tenant.messages.sent') }}" class="btn btn-modern btn-info">
        <i class="fas fa-paper-plane me-2"></i>Terkirim
    </a>
    <a href="{{ tenant_route('tenant.messages.archived') }}" class="btn btn-modern btn-secondary">
        <i class="fas fa-archive me-2"></i>Arsip
    </a>
</div>

<div class="filter-card fade-in-up fade-in-up-delay-5 mb-3">
    <form method="GET" action="{{ tenant_route('tenant.messages.index') }}" class="row g-3">
        <div class="col-md-3">
            <select name="type" class="form-select">
                <option value="">Semua Tipe</option>
                <option value="direct" {{ request('type') == 'direct' ? 'selected' : '' }}>Direct</option>
                <option value="group" {{ request('type') == 'group' ? 'selected' : '' }}>Group</option>
                <option value="broadcast" {{ request('type') == 'broadcast' ? 'selected' : '' }}>Broadcast</option>
            </select>
        </div>
        <div class="col-md-3">
            <select name="status" class="form-select">
                <option value="">Semua Status</option>
                <option value="unread" {{ request('status') == 'unread' ? 'selected' : '' }}>Belum Dibaca</option>
                <option value="read" {{ request('status') == 'read' ? 'selected' : '' }}>Sudah Dibaca</option>
                <option value="archived" {{ request('status') == 'archived' ? 'selected' : '' }}>Arsip</option>
            </select>
        </div>
        <div class="col-md-4">
            <input type="text" name="search" class="form-control" placeholder="Cari pesan..." value="{{ request('search') }}">
        </div>
        <div class="col-md-2">
            <button type="submit" class="btn btn-modern btn-primary w-100">
                <i class="fas fa-search me-2"></i>Cari
            </button>
        </div>
    </form>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Pesan
        </h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-modern">
                <thead>
                    <tr>
                        <th>Dari/Kepada</th>
                        <th>Subjek</th>
                        <th>Tipe</th>
                        <th>Prioritas</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($messages as $message)
                    <tr class="{{ !$message->is_read && $message->receiver_id == Auth::id() ? 'table-warning' : '' }}">
                        <td>
                            @if($message->sender_id == Auth::id())
                                <strong>Kepada:</strong> {{ $message->receiver->name ?? '-' }}
                            @else
                                <strong>Dari:</strong> {{ $message->sender->name ?? '-' }}
                            @endif
                        </td>
                        <td>{{ $message->subject ?? '(Tanpa Subjek)' }}</td>
                        <td>
                            <span class="badge-modern bg-secondary">{{ $message->type }}</span>
                        </td>
                        <td>
                            @if($message->priority == 'urgent')
                                <span class="badge-modern bg-danger">Urgent</span>
                            @elseif($message->priority == 'high')
                                <span class="badge-modern bg-warning">Tinggi</span>
                            @elseif($message->priority == 'medium')
                                <span class="badge-modern bg-info">Sedang</span>
                            @else
                                <span class="badge-modern bg-secondary">Rendah</span>
                            @endif
                        </td>
                        <td>
                            @if($message->is_read)
                                <span class="badge-modern bg-success">Dibaca</span>
                            @else
                                <span class="badge-modern bg-warning">Belum Dibaca</span>
                            @endif
                        </td>
                        <td>{{ $message->created_at->format('d-m-Y H:i') }}</td>
                        <td>
                            <a href="{{ tenant_route('tenant.messages.show', ['message' => $message->id]) }}" class="btn btn-modern btn-primary btn-sm" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-4">
                            <div class="text-muted">
                                <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                                <p>Tidak ada pesan</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="mt-3">
            {{ $messages->links() }}
        </div>
    </div>
</div>
@endsection
