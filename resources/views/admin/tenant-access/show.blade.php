@extends('layouts.admin')

@php
use Illuminate\Support\Facades\DB;
@endphp

@section('title', 'Tenant Access - ' . $tenant->name)
@section('page-title', 'Tenant Access Management')

@include('components.admin-modern-styles')

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Header Section -->
<div class="row mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-1 text-dark">
                    <i class="fas fa-key me-2 text-primary"></i>
                    Tenant Access Management
                </h4>
                <p class="text-muted mb-0">Kelola akses fitur dan modul untuk <strong>{{ $tenant->name }}</strong></p>
            </div>
            <a href="{{ route('admin.tenant-access.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-1"></i>
                Back to List
            </a>
        </div>
    </div>
</div>

<!-- Tenant Info -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center">
                            <div class="avatar-lg bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                <i class="fas fa-school fa-2x text-white"></i>
                            </div>
                            <div>
                                <h5 class="mb-1 text-dark">{{ $tenant->name }}</h5>
                                <p class="text-muted mb-1">NPSN: {{ $tenant->npsn }}</p>
                                <span class="badge-modern bg-{{ $tenant->is_active ? 'success' : 'danger' }}" style="color: white;">
                                    <i class="fas fa-{{ $tenant->is_active ? 'check-circle' : 'times-circle' }} me-1"></i>
                                    {{ $tenant->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="text-muted">
                            <small>Subscription: <strong>{{ ucfirst($tenant->subscription_plan ?? 'No Plan') }}</strong></small><br>
                            <small>Email: <strong>{{ $tenant->email ?? '-' }}</strong></small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Features Management -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-cogs me-2 text-primary"></i>
                    Features Management
                </h5>
            </div>
            <div class="card-body">
                @if(count($availableFeatures) > 0)
                    <div class="row">
                        @foreach($availableFeatures as $key => $featureName)
                            @php
                                $featurePivot = DB::table('tenant_feature_pivot')
                                    ->where('tenant_id', $tenant->id)
                                    ->where('feature_name', $key)
                                    ->first();
                                $isEnabled = $featurePivot && $featurePivot->is_active;
                            @endphp
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="card h-100 feature-card {{ $isEnabled ? 'feature-enabled' : '' }}">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-2 text-dark">{{ $featureName }}</h6>
                                                @if($featurePivot)
                                                    @if($featurePivot->activated_at)
                                                        <small class="text-muted d-block">
                                                            Activated: {{ \Carbon\Carbon::parse($featurePivot->activated_at)->format('d-m-Y') }}
                                                        </small>
                                                    @endif
                                                @endif
                                            </div>
                                            <div>
                                                @if($isEnabled)
                                                    <span class="badge-modern bg-success" style="color: white;">Enabled</span>
                                                @else
                                                    <span class="badge-modern bg-secondary" style="color: white;">Disabled</span>
                                                @endif
                                            </div>
                                        </div>
                                        <div class="mt-3">
                                            <form method="POST" action="{{ route('admin.tenant-access.update-feature', $tenant) }}" class="d-inline">
                                                @csrf
                                                <input type="hidden" name="feature_key" value="{{ $key }}">
                                                <input type="hidden" name="feature_name" value="{{ $featureName }}">
                                                <input type="hidden" name="is_enabled" value="{{ $isEnabled ? '0' : '1' }}">
                                                <button type="submit" class="btn btn-modern btn-{{ $isEnabled ? 'warning' : 'success' }}">
                                                    <i class="fas fa-{{ $isEnabled ? 'times' : 'check' }} me-1"></i>
                                                    {{ $isEnabled ? 'Disable' : 'Enable' }}
                                                </button>
                                            </form>
                                            @if($featurePivot)
                                                <form method="POST" action="{{ route('admin.tenant-access.remove-feature', [$tenant, $key]) }}" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus fitur ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-modern btn-danger">
                                                        <i class="fas fa-trash me-1"></i>Remove
                                                    </button>
                                                </form>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>Tidak ada fitur yang tersedia.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Modules Management -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-puzzle-piece me-2 text-primary"></i>
                    Modules Management
                </h5>
            </div>
            <div class="card-body">
                @if(count($availableModules) > 0)
                    <div class="row">
                        @foreach($availableModules as $key => $moduleName)
                            @php
                                $module = $tenant->modules->where('module_key', $key)->first();
                                $isEnabled = $module && $module->is_enabled;
                            @endphp
                            <div class="col-md-6 col-lg-4 mb-3">
                                <div class="card h-100 module-card {{ $isEnabled ? 'module-enabled' : '' }}">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-2 text-dark">{{ $moduleName }}</h6>
                                                @if($module)
                                                    @if($module->expires_at)
                                                        <small class="text-muted d-block">
                                                            Expires: {{ \App\Helpers\DateHelper::formatIndonesian($module->expires_at) }}
                                                        </small>
                                                    @endif
                                                    @if($module->permissions)
                                                        <small class="text-muted d-block">
                                                            Permissions: {{ is_array($module->permissions) ? implode(', ', $module->permissions) : 'All' }}
                                                        </small>
                                                    @endif
                                                @endif
                                            </div>
                                            <div>
                                                @if($isEnabled)
                                                    <span class="badge-modern bg-success" style="color: white;">Enabled</span>
                                                @else
                                                    <span class="badge-modern bg-secondary" style="color: white;">Disabled</span>
                                                @endif
                                            </div>
                                        </div>
                                        <div class="mt-3">
                                            <form method="POST" action="{{ route('admin.tenant-access.update-module', $tenant) }}" class="d-inline">
                                                @csrf
                                                <input type="hidden" name="module_key" value="{{ $key }}">
                                                <input type="hidden" name="module_name" value="{{ $moduleName }}">
                                                <input type="hidden" name="is_enabled" value="{{ $isEnabled ? '0' : '1' }}">
                                                <button type="submit" class="btn btn-modern btn-{{ $isEnabled ? 'warning' : 'success' }}">
                                                    <i class="fas fa-{{ $isEnabled ? 'times' : 'check' }} me-1"></i>
                                                    {{ $isEnabled ? 'Disable' : 'Enable' }}
                                                </button>
                                            </form>
                                            @if($module)
                                                <form method="POST" action="{{ route('admin.tenant-access.remove-module', [$tenant, $key]) }}" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus modul ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-modern btn-danger">
                                                        <i class="fas fa-trash me-1"></i>Remove
                                                    </button>
                                                </form>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>Tidak ada modul yang tersedia.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

@endsection

