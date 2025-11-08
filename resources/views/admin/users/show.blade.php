@extends('layouts.admin')

@section('title', 'User Detail')
@section('page-title', 'User Detail')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user me-3"></i>
                Detail Admin User: {{ $user->name }}
            </h2>
            <p>Informasi lengkap admin user</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ route('admin.users.edit', $user) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Ubah
                </a>
                <a href="{{ route('admin.users.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi User
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user"></i>
                        Nama
                    </div>
                    <div class="info-item-value">
                        {{ $user->name }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </div>
                    <div class="info-item-value">
                        <a href="mailto:{{ $user->email }}" class="text-decoration-none">{{ $user->email }}</a>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-phone"></i>
                        Telepon
                    </div>
                    <div class="info-item-value">
                        @if($user->phone)
                            <a href="tel:{{ $user->phone }}" class="text-decoration-none">{{ $user->phone }}</a>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user-tag"></i>
                        Role
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern {{ $user->role === 'super_admin' ? 'bg-danger' : 'bg-info' }}" style="color: white;">
                            {{ ucfirst(str_replace('_', ' ', $user->role)) }}
                        </span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-check-circle"></i>
                        Status
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern {{ $user->is_active ? 'bg-success' : 'bg-secondary' }}" style="color: white;">
                            {{ $user->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-building"></i>
                        Tenant
                    </div>
                    <div class="info-item-value">
                        @if($user->tenant)
                            <a href="{{ route('admin.tenants.show', $user->tenant) }}" class="text-decoration-none">
                                {{ $user->tenant->name }} ({{ $user->tenant->npsn }})
                            </a>
                        @else
                            <span class="text-muted">Global Access</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-clock"></i>
                        Last Login
                    </div>
                    <div class="info-item-value">
                        @if($user->last_login_at)
                            {{ \App\Helpers\DateHelper::formatIndonesian($user->last_login_at) }}
                        @else
                            <span class="text-muted">Belum pernah</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-plus"></i>
                        Dibuat
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($user->created_at) }}
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-top">
                <div class="d-flex justify-content-between">
                    @if($user->is_active)
                        <form method="POST" action="{{ route('admin.users.deactivate', $user) }}" class="d-inline" onsubmit="return confirm('Yakin ingin menonaktifkan user ini?')">
                            @csrf
                            <button type="submit" class="btn btn-modern btn-warning">
                                <i class="fas fa-ban me-2"></i>
                                Nonaktifkan
                            </button>
                        </form>
                    @else
                        <form method="POST" action="{{ route('admin.users.activate', $user) }}" class="d-inline">
                            @csrf
                            <button type="submit" class="btn btn-modern btn-success">
                                <i class="fas fa-check me-2"></i>
                                Aktifkan
                            </button>
                        </form>
                    @endif
                    <a href="{{ route('admin.users.edit', $user) }}" class="btn btn-modern btn-primary">
                        <i class="fas fa-edit me-2"></i>
                        Edit User
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="info-sidebar">
            <div class="card-modern fade-in-up">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-shield-alt me-2 text-primary"></i>
                        Role Permissions
                    </h5>
                </div>
                <div class="card-body">
                    @if($user->role === 'super_admin')
                        <h6 class="text-danger mb-3">
                            <i class="fas fa-user-shield me-2"></i>
                            Super Admin Permissions
                        </h6>
                        <ul class="list-unstyled small mb-0">
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Akses penuh sistem</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Kelola semua tenants</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Kelola semua users</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Konfigurasi sistem</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Backup & recovery</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Lihat system logs</li>
                        </ul>
                    @else
                        <h6 class="text-info mb-3">
                            <i class="fas fa-user-tie me-2"></i>
                            School Admin Permissions
                        </h6>
                        <ul class="list-unstyled small mb-0">
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Kelola tenant yang ditugaskan</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Akses data tenant</li>
                            <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Operasi sekolah</li>
                            <li class="mb-2"><i class="fas fa-times text-danger me-2"></i> Pengaturan global</li>
                            <li class="mb-2"><i class="fas fa-times text-danger me-2"></i> Tenant lain</li>
                            <li class="mb-2"><i class="fas fa-times text-danger me-2"></i> System logs</li>
                        </ul>
                    @endif
                </div>
            </div>
            
            <div class="card-modern fade-in-up mt-3" style="border-left-color: #ef4444 !important;">
                <div class="card-header" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;">
                    <h5>
                        <i class="fas fa-exclamation-triangle me-2 text-danger"></i>
                        Danger Zone
                    </h5>
                </div>
                <div class="card-body">
                    <p class="small text-muted mb-3">
                        Setelah menghapus user, tidak bisa dikembalikan. Pastikan Anda yakin.
                    </p>
                    <button type="button" class="btn btn-modern btn-danger w-100" onclick="deleteUser({{ $user->id }})">
                        <i class="fas fa-trash me-2"></i>
                        Hapus User
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirm Delete</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <form id="deleteForm" method="POST" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">Delete</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function deleteUser(userId) {
    const form = document.getElementById('deleteForm');
    form.action = `/admin/users/${userId}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>
@endsection