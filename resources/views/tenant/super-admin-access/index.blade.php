@extends('layouts.tenant')

@section('title', 'Kelola Akses Super Admin')
@section('page-title', 'Kelola Akses Super Admin')

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle"></i> {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="avatar-sm bg-warning rounded-circle d-flex align-items-center justify-content-center">
                            <i class="fas fa-clock fa-lg text-white"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h3 class="mb-0 text-dark">{{ $stats['pending'] }}</h3>
                        <small class="text-muted">Menunggu Persetujuan</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="avatar-sm bg-success rounded-circle d-flex align-items-center justify-content-center">
                            <i class="fas fa-check-circle fa-lg text-white"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h3 class="mb-0 text-dark">{{ $stats['approved'] }}</h3>
                        <small class="text-muted">Akses Aktif</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center">
                            <i class="fas fa-list fa-lg text-white"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h3 class="mb-0 text-dark">{{ $requests->total() }}</h3>
                        <small class="text-muted">Total Permintaan</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Requests Table -->
<div class="row">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-header bg-white border-0 py-3">
                <h5 class="card-title mb-0 text-dark">
                    <i class="fas fa-list me-2 text-primary"></i>
                    Permintaan Akses Super Admin
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="border-0 py-3 px-4">Super Admin</th>
                                <th class="border-0 py-3 px-4">Status</th>
                                <th class="border-0 py-3 px-4">Alasan Permintaan</th>
                                <th class="border-0 py-3 px-4">Tanggal</th>
                                <th class="border-0 py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($requests as $request)
                            <tr class="border-bottom">
                                <td class="py-3 px-4">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                            <i class="fas fa-user-shield text-white"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-0 text-dark">{{ $request->user->name }}</h6>
                                            <small class="text-muted">{{ $request->user->email }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-{{ $request->status_badge }}">
                                        {{ $request->status_label }}
                                    </span>
                                    @if($request->expires_at)
                                        <br><small class="text-muted">Berlaku hingga: {{ \App\Helpers\DateHelper::formatIndonesian($request->expires_at) }}</small>
                                    @endif
                                </td>
                                <td class="py-3 px-4">
                                    <small>{{ Str::limit($request->request_reason, 100) }}</small>
                                </td>
                                <td class="py-3 px-4">
                                    <small class="text-muted">
                                        Diminta: {{ \App\Helpers\DateHelper::formatIndonesian($request->created_at) }}<br>
                                        @if($request->approved_at)
                                            Disetujui: {{ \App\Helpers\DateHelper::formatIndonesian($request->approved_at) }}
                                        @endif
                                    </small>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    @if($request->status === 'pending')
                                        <a href="{{ tenant_route('tenant.super-admin-access.show', $request->id) }}" class="btn btn-sm btn-primary" title="Tinjau">
                                            <i class="fas fa-eye me-1"></i>
                                            Tinjau
                                        </a>
                                    @elseif($request->status === 'approved' && $request->isActive())
                                        <button type="button" class="btn btn-sm btn-warning" onclick="revokeAccess({{ $request->id }})" title="Cabut Akses">
                                            <i class="fas fa-ban me-1"></i>
                                            Cabut
                                        </button>
                                    @else
                                        <a href="{{ tenant_route('tenant.super-admin-access.show', $request->id) }}" class="btn btn-sm btn-info" title="Detail">
                                            <i class="fas fa-info-circle"></i>
                                        </a>
                                    @endif
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center py-4">
                                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                    <p class="text-muted">Belum ada permintaan akses</p>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                
                @if($requests->hasPages())
                <div class="card-footer bg-white border-0 py-3">
                    {{ $requests->links() }}
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Revoke Form -->
<form id="revokeForm" method="POST" style="display: none;">
    @csrf
</form>

@push('scripts')
<script>
function revokeAccess(accessId) {
    if (!confirm('Apakah Anda yakin ingin mencabut akses super admin ini?')) {
        return;
    }
    
    const form = document.getElementById('revokeForm');
    form.action = `{{ tenant_route('tenant.super-admin-access.revoke', '') }}/${accessId}`;
    form.submit();
}
</script>
@endpush
@endsection
