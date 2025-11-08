@extends('layouts.tenant')

@section('title', 'Tugas Tambahan')
@section('page-title', 'Kelola Tugas Tambahan')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .duty-code {
        background: #f3f4f6;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: #6b7280;
        display: inline-block;
        margin-bottom: 1rem;
    }
    
    .module-badge {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 500;
        margin: 0.25rem;
        display: inline-block;
    }
    
    .module-badge.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 0.75rem;
    }
    
    .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
        font-size: 1.1rem;
    }
    
    .stat-icon.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .stat-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
    }
    
    .stat-content {
        flex: 1;
    }
    
    .stat-label {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
    }
    
    .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        margin-top: 0.25rem;
    }
    
    .action-btn {
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
        border: 2px solid;
    }
    
    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .btn-primary-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .btn-primary-custom:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
        border-radius: 16px;
        border: 2px dashed #e5e7eb;
    }
    
    .empty-state-icon {
        font-size: 4rem;
        color: #9ca3af;
        margin-bottom: 1rem;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-briefcase me-3"></i>
                Tugas Tambahan
            </h2>
            <p>Kelola tugas tambahan dan akses modul untuk guru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.additional-duties.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Tugas Tambahan
            </a>
        </div>
    </div>
</div>

@if($duties->count() > 0)
<div class="row">
    @foreach($duties as $duty)
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5" style="position: relative;">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ $duty->name }}</h5>
                @if($duty->is_active)
                    <span class="badge-modern bg-success" style="color: white;">
                        <i class="fas fa-check-circle me-1"></i>Aktif
                    </span>
                @else
                    <span class="badge-modern bg-secondary" style="color: white;">
                        <i class="fas fa-pause-circle me-1"></i>Nonaktif
                    </span>
                @endif
            </div>
            <div class="card-body">
                <div class="duty-code">
                    <i class="fas fa-code me-2"></i>{{ $duty->code }}
                </div>
                
                @if($duty->description)
                    <p class="text-muted mb-3" style="font-size: 0.9rem; line-height: 1.6;">
                        {{ Str::limit($duty->description, 100) }}
                    </p>
                @endif
                
                @php
                    $modules = $duty->activeModuleAccesses;
                    $teacherCount = $duty->activeTeachers()->count();
                @endphp
                
                <div class="stat-item">
                    <div class="stat-icon primary">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Akses Modul</div>
                        <div class="stat-value">{{ $modules->count() }} Modul</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon success">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Guru yang Memiliki</div>
                        <div class="stat-value">{{ $teacherCount }} Guru</div>
                    </div>
                </div>
                
                @if($modules->count() > 0)
                <div class="mt-3">
                    <div class="d-flex flex-wrap gap-1">
                        @foreach($modules->take(3) as $module)
                            <span class="module-badge">{{ $module->module_name }}</span>
                        @endforeach
                        @if($modules->count() > 3)
                            <span class="module-badge warning">+{{ $modules->count() - 3 }} lagi</span>
                        @endif
                    </div>
                </div>
                @else
                <div class="alert alert-warning mb-0 mt-3" style="padding: 0.5rem; font-size: 0.85rem;">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Belum ada modul yang diakses
                </div>
                @endif
            </div>
            <div class="card-footer bg-transparent border-top" style="padding: 1rem 1.5rem;">
                <div class="d-flex gap-2">
                    <a href="{{ tenant_route('tenant.additional-duties.show', $duty) }}" 
                       class="btn btn-sm btn-outline-primary action-btn flex-fill">
                        <i class="fas fa-eye me-1"></i>Detail
                    </a>
                    <a href="{{ tenant_route('tenant.additional-duties.edit', $duty) }}" 
                       class="btn btn-sm btn-outline-warning action-btn flex-fill">
                        <i class="fas fa-edit me-1"></i>Edit
                    </a>
                    <form action="{{ tenant_route('tenant.additional-duties.destroy', $duty) }}" 
                          method="POST" 
                          class="flex-fill"
                          onsubmit="return confirm('Apakah Anda yakin ingin menghapus tugas tambahan ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger action-btn w-100">
                            <i class="fas fa-trash me-1"></i>Hapus
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @endforeach
</div>
@else
<div class="empty-state">
    <div class="empty-state-icon">
        <i class="fas fa-tasks"></i>
    </div>
    <h4 class="fw-bold mb-2">Belum ada tugas tambahan</h4>
    <p class="text-muted mb-4">Mulai dengan membuat tugas tambahan pertama untuk mengatur akses modul guru</p>
    <a href="{{ tenant_route('tenant.additional-duties.create') }}" class="btn btn-primary-custom">
        <i class="fas fa-plus me-2"></i>Buat Tugas Tambahan Pertama
    </a>
</div>
@endif
@endsection
