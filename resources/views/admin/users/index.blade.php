@extends('layouts.admin')

@section('title', 'Admin Users')
@section('page-title', 'Admin Users')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-shield me-3"></i>
                Admin Users Management
            </h2>
            <p>Kelola semua admin users global (super_admin dan school_admin)</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.users.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Admin User
            </a>
        </div>
    </div>
</div>

<!-- Users Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-users me-2 text-primary"></i>
                    Daftar Admin Users
                </h5>
            </div>
            <div class="card-body">
                @if($users->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Tenant</th>
                                    <th>Status</th>
                                    <th>Login Terakhir</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($users as $user)
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                                                    <i class="fas fa-user text-white"></i>
                                                </div>
                                                <div>
                                                    <h6 class="mb-0">{{ $user->name }}</h6>
                                                    <small class="text-muted">{{ $user->phone ?? '-' }}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{ $user->email }}</td>
                                        <td>
                                            <span class="badge bg-{{ $user->role === 'super_admin' ? 'danger' : 'info' }}">
                                                {{ ucfirst(str_replace('_', ' ', $user->role)) }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($user->tenant)
                                                <small>{{ $user->tenant->name }}</small>
                                            @else
                                                <small class="text-muted">-</small>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $user->is_active ? 'success' : 'secondary' }}">
                                                {{ $user->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($user->last_login_at)
                                                <small class="text-muted">
                                                    {{ $user->last_login_at->format('d/m/Y H:i') }}
                                                </small>
                                            @else
                                                <small class="text-muted">Belum Pernah</small>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ route('admin.users.show', $user) }}" 
                                                   class="btn btn-sm btn-outline-primary" title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ route('admin.users.edit', $user) }}" 
                                                   class="btn btn-sm btn-outline-warning" title="Ubah">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                @if($user->is_active)
                                                    <form method="POST" action="{{ route('admin.users.deactivate', $user) }}" 
                                                          style="display: inline;" onsubmit="return confirm('Apakah Anda yakin ingin menonaktifkan user ini?')">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-secondary" title="Nonaktifkan">
                                                            <i class="fas fa-user-times"></i>
                                                        </button>
                                                    </form>
                                                @else
                                                    <form method="POST" action="{{ route('admin.users.activate', $user) }}" 
                                                          style="display: inline;">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-success" title="Aktifkan">
                                                            <i class="fas fa-user-check"></i>
                                                        </button>
                                                    </form>
                                                @endif
                                                <button type="button" class="btn btn-sm btn-outline-danger" 
                                                        onclick="deleteUser({{ $user->id }})" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="d-flex justify-content-center mt-4">
                        {{ $users->links() }}
                    </div>
                @else
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h5>Belum ada admin users</h5>
                        <p>Buat admin user pertama Anda untuk memulai</p>
                        <a href="{{ route('admin.users.create') }}" class="btn btn-modern btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Admin User
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Hapus</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <form id="deleteForm" method="POST" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">Hapus</button>
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