@extends('layouts.tenant')

@section('title', 'Manajemen Staff')
@section('page-title', 'Manajemen Staff')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-users me-2"></i>
                    Daftar Staff
                </h5>
                <div class="btn-group">
                    <a href="{{ tenant_route('tenant.staff.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Staff
                    </a>
                    <a href="{{ tenant_route('tenant.staff.statistics') }}" class="btn btn-info">
                        <i class="fas fa-chart-bar me-2"></i>
                        Statistik
                    </a>
                </div>
            </div>
            <div class="card-body">
                <!-- Filter Form -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        <form method="GET" class="row g-3">
                            <div class="col-md-3">
                                <input type="text" name="search" class="form-control" 
                                       placeholder="Cari nama atau email..." value="{{ request('search') }}">
                            </div>
                            <div class="col-md-2">
                                <select name="role" class="form-control">
                                    <option value="">Semua Role</option>
                                    <option value="school_admin" {{ request('role') == 'school_admin' ? 'selected' : '' }}>Admin Sekolah</option>
                                    <option value="teacher" {{ request('role') == 'teacher' ? 'selected' : '' }}>Guru</option>
                                    <option value="student" {{ request('role') == 'student' ? 'selected' : '' }}>Siswa</option>
                                    <option value="parent" {{ request('role') == 'parent' ? 'selected' : '' }}>Orang Tua</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select name="is_active" class="form-control">
                                    <option value="">Semua Status</option>
                                    <option value="1" {{ request('is_active') == '1' ? 'selected' : '' }}>Aktif</option>
                                    <option value="0" {{ request('is_active') == '0' ? 'selected' : '' }}>Tidak Aktif</option>
                                </select>
                            </div>
                            <div class="col-md-5">
                                <button type="submit" class="btn btn-outline-primary">
                                    <i class="fas fa-filter me-2"></i>
                                    Filter
                                </button>
                                <a href="{{ tenant_route('tenant.staff.index') }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-2"></i>
                                    Reset
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                
                @if($staff->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Telepon</th>
                                    <th>Status</th>
                                    <th>Terakhir Login</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($staff as $user)
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                                    <i class="fas fa-user text-white"></i>
                                                </div>
                                                <div>
                                                    <strong>{{ $user->name }}</strong>
                                                    <br>
                                                    <small class="text-muted">ID: {{ $user->id }}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{ $user->email }}</td>
                                        <td>
                                            <span class="badge bg-{{ $this->getRoleColor($user->role) }}">
                                                {{ $this->getRoleName($user->role) }}
                                            </span>
                                        </td>
                                        <td>{{ $user->phone ?? '-' }}</td>
                                        <td>
                                            <span class="badge bg-{{ $user->is_active ? 'success' : 'secondary' }}">
                                                {{ $user->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($user->last_login_at)
                                                <small>{{ \Carbon\Carbon::parse($user->last_login_at)->format('d M Y H:i') }}</small>
                                            @else
                                                <small class="text-muted">Belum pernah login</small>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <a href="{{ tenant_route('tenant.staff.show', $user) }}" 
                                                   class="btn btn-sm btn-outline-info" title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.staff.edit', $user) }}" 
                                                   class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.staff.destroy', $user) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus staff ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
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
                    
                    <div class="d-flex justify-content-center">
                        {{ $staff->links() }}
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada staff</h5>
                        <p class="text-muted">Mulai dengan menambahkan staff pertama</p>
                        <a href="{{ tenant_route('tenant.staff.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Staff
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

@php
function getRoleColor($role) {
    switch($role) {
        case 'school_admin': return 'danger';
        case 'teacher': return 'success';
        case 'student': return 'primary';
        case 'parent': return 'info';
        default: return 'secondary';
    }
}

function getRoleName($role) {
    switch($role) {
        case 'school_admin': return 'Admin Sekolah';
        case 'teacher': return 'Guru';
        case 'student': return 'Siswa';
        case 'parent': return 'Orang Tua';
        default: return ucfirst($role);
    }
}
@endphp
