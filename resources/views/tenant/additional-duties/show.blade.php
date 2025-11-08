@extends('layouts.tenant')

@section('title', 'Detail Tugas Tambahan')
@section('page-title', 'Detail Tugas Tambahan: ' . $additionalDuty->name)

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .module-table {
        border-radius: 8px;
        overflow: hidden;
    }
    
    .module-table thead {
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    }
    
    .teacher-card {
        background: #f9fafb;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 0.75rem;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    
    .teacher-card:hover {
        background: #ffffff;
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        transform: translateX(5px);
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
                Detail Tugas Tambahan: {{ $additionalDuty->name }}
            </h2>
            <p>Informasi lengkap tentang tugas tambahan</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons">
                <a href="{{ tenant_route('tenant.additional-duties.edit', $additionalDuty) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-edit me-2"></i> Edit
                </a>
                <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Tugas Tambahan
                </h5>
                @if($additionalDuty->is_active)
                    <span class="badge-modern bg-success">Aktif</span>
                @else
                    <span class="badge-modern bg-secondary">Nonaktif</span>
                @endif
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-code text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Kode</small>
                                    <code style="background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 8px; font-size: 1rem;">
                                        {{ $additionalDuty->code }}
                                    </code>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-sort-numeric-up text-primary me-2"></i>
                                <div>
                                    <small class="text-muted d-block">Urutan</small>
                                    <strong>{{ $additionalDuty->order }}</strong>
                                </div>
                            </div>
                        </div>
                        @if($additionalDuty->description)
                        <div class="col-md-12 mb-3">
                            <div class="d-flex align-items-start">
                                <i class="fas fa-align-left text-primary me-2 mt-1"></i>
                                <div>
                                    <small class="text-muted d-block">Deskripsi</small>
                                    <p class="mb-0" style="line-height: 1.6;">{{ $additionalDuty->description }}</p>
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card-modern fade-in-up fade-in-up-delay-5 mt-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-shield-alt me-2 text-primary"></i>
                    Akses Modul
                </h5>
            </div>
            <div class="card-body">
                @php
                    $modules = $additionalDuty->activeModuleAccesses;
                @endphp
                
                @if($modules && $modules->count() > 0)
                    <div class="table-responsive module-table">
                        <table class="table table-modern mb-0">
                            <thead>
                                <tr>
                                    <th>Modul</th>
                                    <th>Permissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($modules as $module)
                                <tr>
                                    <td>
                                        <strong>{{ $module->module_name }}</strong>
                                        <br>
                                        <small class="text-muted">
                                            <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">
                                                {{ $module->module_code }}
                                            </code>
                                        </small>
                                    </td>
                                    <td>
                                        @php
                                            $permissions = $module->permissions ?? [];
                                        @endphp
                                        @if(in_array('*', $permissions))
                                            <span class="badge-modern bg-primary">Semua Akses</span>
                                        @else
                                            <div class="d-flex flex-wrap gap-1">
                                                @foreach($permissions as $perm)
                                                    <span class="badge-modern bg-info">{{ ucfirst($perm) }}</span>
                                                @endforeach
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="alert alert-info mb-0" style="border-radius: 12px; border: none;">
                        <i class="fas fa-info-circle me-2"></i>
                        Belum ada modul yang diakses oleh tugas tambahan ini.
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-users me-2 text-primary"></i>
                    Guru yang Memiliki Tugas Ini
                </h5>
            </div>
            <div class="card-body">
                @php
                    $teachers = $additionalDuty->activeTeachers;
                @endphp
                
                @if($teachers && $teachers->count() > 0)
                    <div class="stat-card primary mb-3">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $teachers->count() }}</h3>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Guru</p>
                    </div>
                    
                    <div style="max-height: 500px; overflow-y: auto;">
                        @foreach($teachers->take(10) as $teacher)
                        <div class="teacher-card">
                            <div class="d-flex justify-content-between align-items-start">
                                <div style="flex: 1;">
                                    <h6 class="mb-2 fw-bold" style="color: #1f2937; font-size: 0.95rem;">
                                        {{ $teacher->name }}
                                    </h6>
                                    @if($teacher->pivot->assigned_date)
                                        <small class="text-muted" style="font-size: 0.8rem;">
                                            <i class="fas fa-calendar-alt me-1"></i>
                                            Ditugaskan: {{ \App\Helpers\DateHelper::formatIndonesian($teacher->pivot->assigned_date) }}
                                        </small>
                                    @endif
                                </div>
                                <a href="{{ tenant_route('tenant.teachers.show', $teacher) }}" 
                                   class="btn btn-modern btn-primary btn-sm">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </div>
                        </div>
                        @endforeach
                        
                        @if($teachers->count() > 10)
                        <div class="text-center mt-3 p-3" style="background: #f9fafb; border-radius: 12px;">
                            <small class="text-muted">
                                <i class="fas fa-ellipsis-h me-1"></i>
                                ...dan {{ $teachers->count() - 10 }} guru lainnya
                            </small>
                        </div>
                        @endif
                    </div>
                @else
                    <div class="alert alert-info mb-0" style="border-radius: 12px; border: none;">
                        <i class="fas fa-info-circle me-2"></i>
                        Belum ada guru yang memiliki tugas tambahan ini.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
