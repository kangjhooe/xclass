@extends('layouts.tenant')

@section('title', 'Detail User')
@section('page-title', 'Detail User')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user me-3"></i>
                Detail User: {{ $user->name }}
            </h2>
            <p>Informasi lengkap tentang user</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.users.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi User
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-user text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Nama Lengkap</small>
                                    <strong>{{ $user->name }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-envelope text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Email</small>
                                    <strong>{{ $user->email }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-user-tag text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Role</small>
                                    <x-role-badge :role="$user->role" />
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Status</small>
                                    @if($user->is_active)
                                        <span class="badge-modern bg-success">Aktif</span>
                                    @else
                                        <span class="badge-modern bg-danger">Tidak Aktif</span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-plus text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Dibuat</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($user->created_at, true) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-calendar-edit text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Diperbarui</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($user->updated_at, true) }}</strong>
                                </div>
                            </div>
                        </div>
                        @if($user->last_login_at)
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-sign-in-alt text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Terakhir Login</small>
                                    <strong>{{ \App\Helpers\DateHelper::formatIndonesian($user->last_login_at, true) }}</strong>
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-key me-2 text-primary"></i>
                    Izin User
                </h5>
            </div>
            <div class="card-body">
                @php
                    $allPermissions = \App\Helpers\RbacHelper::getAllPermissions($user);
                @endphp

                @if(count($allPermissions) > 0)
                    <div class="d-flex flex-column gap-2">
                        @foreach($allPermissions as $permission)
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <span>{{ \App\Helpers\RbacHelper::getPermissionDisplayName($permission) }}</span>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-muted mb-0">Tidak ada izin khusus</p>
                @endif
            </div>
        </div>

        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-cog me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <div class="d-grid gap-2">
                    @can('update', $user)
                    <a href="{{ tenant_route('tenant.users.edit', $user) }}" class="btn btn-modern btn-warning">
                        <i class="fas fa-edit me-2"></i> Edit User
                    </a>
                    @endcan

                    @can('update', $user)
                    <form action="{{ tenant_route('tenant.users.toggle-status', $user) }}" 
                          method="POST" 
                          onsubmit="return confirm('Yakin ingin mengubah status user ini?')">
                        @csrf
                        @method('PATCH')
                        <button type="submit" class="btn btn-modern btn-{{ $user->is_active ? 'warning' : 'success' }} w-100">
                            <i class="fas fa-{{ $user->is_active ? 'ban' : 'check' }} me-2"></i>
                            {{ $user->is_active ? 'Nonaktifkan' : 'Aktifkan' }} User
                        </button>
                    </form>
                    @endcan

                    @can('delete', $user)
                    <form action="{{ tenant_route('tenant.users.destroy', $user) }}" 
                          method="POST" 
                          onsubmit="return confirm('Yakin ingin menghapus user ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-modern btn-danger w-100">
                            <i class="fas fa-trash me-2"></i> Hapus User
                        </button>
                    </form>
                    @endcan
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
