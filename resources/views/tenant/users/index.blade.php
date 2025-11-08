@extends('layouts.tenant')

@section('title', 'Manajemen User')
@section('page-title', 'Manajemen User')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .filter-card {
        background: #f8f9fa;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-users me-3"></i>
                Manajemen User
            </h2>
            <p>Kelola pengguna sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            @can('create', App\Models\User::class)
            <a href="{{ tenant_route('tenant.users.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah User
            </a>
            @endcan
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar User
                </h5>
            </div>
            <div class="card-body">
                <!-- Filter Form -->
                <div class="filter-card mb-4">
                    <form method="GET" class="row g-3">
                        <div class="col-md-4">
                            <label for="search" class="form-label">Cari User</label>
                            <input type="text" 
                                   class="form-control" 
                                   id="search" 
                                   name="search" 
                                   value="{{ request('search') }}" 
                                   placeholder="Nama atau email...">
                        </div>
                        <div class="col-md-3">
                            <label for="role" class="form-label">Role</label>
                            <select class="form-select" id="role" name="role">
                                <option value="">Semua Role</option>
                                <option value="admin" {{ request('role') === 'admin' ? 'selected' : '' }}>Administrator</option>
                                <option value="operator" {{ request('role') === 'operator' ? 'selected' : '' }}>Operator</option>
                                <option value="kepala_sekolah" {{ request('role') === 'kepala_sekolah' ? 'selected' : '' }}>Kepala Sekolah</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="">Semua Status</option>
                                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Aktif</option>
                                <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-modern btn-primary">
                                    <i class="fas fa-search"></i> Filter
                                </button>
                                <a href="{{ tenant_route('tenant.users.index') }}" class="btn btn-modern btn-secondary">
                                    <i class="fas fa-times"></i> Reset
                                </a>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Users Table -->
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Terakhir Login</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($users as $user)
                                <tr>
                                    <td>{{ $users->firstItem() + $loop->index }}</td>
                                    <td>{{ $user->name }}</td>
                                    <td>{{ $user->email }}</td>
                                    <td>
                                        <x-role-badge :role="$user->role" />
                                    </td>
                                    <td>
                                        @if($user->is_active)
                                            <span class="badge badge-success">Aktif</span>
                                        @else
                                            <span class="badge badge-danger">Tidak Aktif</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($user->last_login_at)
                                            {{ \App\Helpers\DateHelper::formatIndonesian($user->last_login_at, true) }}
                                        @else
                                            <span class="text-muted">Belum pernah login</span>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            @can('view', $user)
                                            <a href="{{ tenant_route('tenant.users.show', $user) }}" 
                                               class="btn btn-modern btn-primary btn-sm" 
                                               title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            @endcan

                                            @can('update', $user)
                                            <a href="{{ tenant_route('tenant.users.edit', $user) }}" 
                                               class="btn btn-modern btn-warning btn-sm" 
                                               title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            @endcan

                                            @can('update', $user)
                                            <form action="{{ tenant_route('tenant.users.toggle-status', $user) }}" 
                                                  method="POST" 
                                                  class="d-inline"
                                                  onsubmit="return confirm('Yakin ingin mengubah status user ini?')">
                                                @csrf
                                                @method('PATCH')
                                                <button type="submit" 
                                                        class="btn btn-modern btn-{{ $user->is_active ? 'warning' : 'success' }} btn-sm"
                                                        title="{{ $user->is_active ? 'Nonaktifkan' : 'Aktifkan' }}">
                                                    <i class="fas fa-{{ $user->is_active ? 'ban' : 'check' }}"></i>
                                                </button>
                                            </form>
                                            @endcan

                                            @can('delete', $user)
                                            <form action="{{ tenant_route('tenant.users.destroy', $user) }}" 
                                                  method="POST" 
                                                  class="d-inline"
                                                  onsubmit="return confirm('Yakin ingin menghapus user ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" 
                                                        class="btn btn-modern btn-danger btn-sm"
                                                        title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                            @endcan
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="7" class="text-center">Tidak ada data user</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="d-flex justify-content-center">
                        {{ $users->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
