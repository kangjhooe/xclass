@extends('layouts.tenant')

@section('title', 'Edit Tugas Tambahan')
@section('page-title', 'Edit Tugas Tambahan: ' . $additionalDuty->name)

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .form-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }
    
    .form-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
    }
    
    .form-card-header h5 {
        color: white;
        font-weight: 600;
        margin: 0;
    }
    
    .module-card {
        background: #f9fafb;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
        margin-bottom: 0.75rem;
    }
    
    .module-card:hover {
        border-color: #667eea;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
    
    .module-card.active {
        border-color: #667eea;
        background: #eff6ff;
    }
    
    .form-label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }
    
    .form-control:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .form-check-input:checked {
        background-color: #667eea;
        border-color: #667eea;
    }
    
    .btn-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .btn-gradient:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        color: white;
    }
    
    .section-title {
        color: #1f2937;
        font-weight: 700;
        margin-bottom: 0.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e5e7eb;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Tugas Tambahan: {{ $additionalDuty->name }}
            </h2>
            <p>Edit informasi dan akses modul untuk tugas tambahan</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Form Edit Tugas Tambahan
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.additional-duties.update', $additionalDuty) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="code" class="form-label">Kode <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('code') is-invalid @enderror" 
                                       id="code" name="code" value="{{ old('code', $additionalDuty->code) }}" required>
                                @error('code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="order" class="form-label">Urutan</label>
                                <input type="number" class="form-control @error('order') is-invalid @enderror" 
                                       id="order" name="order" value="{{ old('order', $additionalDuty->order) }}" min="0">
                                @error('order')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="name" class="form-label">Nama Tugas <span class="text-danger">*</span></label>
                        <input type="text" class="form-control @error('name') is-invalid @enderror" 
                               id="name" name="name" value="{{ old('name', $additionalDuty->name) }}" required>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="description" class="form-label">Deskripsi</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="3">{{ old('description', $additionalDuty->description) }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1"
                                   {{ old('is_active', $additionalDuty->is_active) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_active">Aktif</label>
                        </div>
                    </div>
                    
                    <hr class="my-4" style="border-color: #e5e7eb;">
                    
                    <h5 class="mb-3" style="color: #1f2937; font-weight: 700; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb;">
                        <i class="fas fa-shield-alt me-2 text-primary"></i>Akses Modul
                    </h5>
                    <p class="text-muted mb-4" style="font-size: 0.9rem;">
                        Pilih modul yang dapat diakses oleh tugas tambahan ini dan tentukan permission yang diizinkan.
                    </p>
                    
                    @php
                        $availableModules = [
                            ['code' => 'counseling', 'name' => 'Bimbingan Konseling (BK)'],
                            ['code' => 'discipline', 'name' => 'Kedisiplinan'],
                            ['code' => 'facility', 'name' => 'Sarana Prasarana'],
                            ['code' => 'inventory', 'name' => 'Inventori / Aset'],
                            ['code' => 'correspondence', 'name' => 'Persuratan'],
                            ['code' => 'students', 'name' => 'Data Siswa'],
                            ['code' => 'attendance', 'name' => 'Kehadiran'],
                            ['code' => 'extracurricular', 'name' => 'Ekstrakurikuler'],
                            ['code' => 'events', 'name' => 'Kegiatan'],
                            ['code' => 'finance', 'name' => 'Keuangan'],
                            ['code' => 'spp', 'name' => 'SPP'],
                            ['code' => 'subjects', 'name' => 'Mata Pelajaran'],
                            ['code' => 'schedules', 'name' => 'Jadwal Pelajaran'],
                            ['code' => 'grades', 'name' => 'Penilaian'],
                            ['code' => 'academic', 'name' => 'Akademik'],
                            ['code' => 'report', 'name' => 'Laporan'],
                        ];
                        
                        $existingModules = $moduleAccesses->pluck('module_name', 'module_code')->toArray();
                    @endphp
                    
                    <div id="modules-container">
                        @foreach($availableModules as $index => $module)
                            @php
                                $isChecked = isset($existingModules[$module['code']]);
                                $existingModule = $moduleAccesses->get($module['code']);
                            @endphp
                            <div class="module-card {{ $isChecked ? 'active' : '' }}">
                                <div class="card-body" style="padding: 1rem 1.25rem;">
                                    <div class="form-check">
                                        <input class="form-check-input module-checkbox" type="checkbox" 
                                               id="module_{{ $module['code'] }}" 
                                               name="modules[{{ $index }}][enabled]" value="1"
                                               {{ $isChecked ? 'checked' : '' }}
                                               onchange="toggleModuleInputs(this, '{{ $module['code'] }}', {{ $index }})">
                                        <label class="form-check-label fw-bold" for="module_{{ $module['code'] }}">
                                            {{ $module['name'] }}
                                        </label>
                                    </div>
                                    
                                    <div class="module-inputs mt-2 ms-4" style="display: {{ $isChecked ? 'block' : 'none' }}">
                                        <input type="hidden" name="modules[{{ $index }}][code]" value="{{ $module['code'] }}">
                                        <input type="hidden" name="modules[{{ $index }}][name]" value="{{ $module['name'] }}">
                                        
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" 
                                                   name="modules[{{ $index }}][permissions][]" value="read" 
                                                   id="perm_read_{{ $index }}"
                                                   {{ $existingModule && ($existingModule->hasPermission('read') || $existingModule->hasPermission('*')) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="perm_read_{{ $index }}">Baca</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" 
                                                   name="modules[{{ $index }}][permissions][]" value="create" 
                                                   id="perm_create_{{ $index }}"
                                                   {{ $existingModule && ($existingModule->hasPermission('create') || $existingModule->hasPermission('*')) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="perm_create_{{ $index }}">Buat</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" 
                                                   name="modules[{{ $index }}][permissions][]" value="update" 
                                                   id="perm_update_{{ $index }}"
                                                   {{ $existingModule && ($existingModule->hasPermission('update') || $existingModule->hasPermission('*')) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="perm_update_{{ $index }}">Ubah</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" 
                                                   name="modules[{{ $index }}][permissions][]" value="delete" 
                                                   id="perm_delete_{{ $index }}"
                                                   {{ $existingModule && ($existingModule->hasPermission('delete') || $existingModule->hasPermission('*')) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="perm_delete_{{ $index }}">Hapus</label>
                                        </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" 
                                               name="modules[{{ $index }}][permissions][]" value="*" 
                                               id="perm_all_{{ $index }}"
                                               {{ $existingModule && $existingModule->hasPermission('*') ? 'checked' : '' }}
                                               onchange="toggleAllPermissions(this, {{ $index }})">
                                        <label class="form-check-label fw-bold" for="perm_all_{{ $index }}" style="color: #667eea;">
                                            <i class="fas fa-check-double me-1"></i>Semua Akses
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    
                    <hr class="my-4" style="border-color: #e5e7eb;">
                    
                    <div class="d-flex gap-2 mt-4">
                        <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function toggleModuleInputs(checkbox, moduleCode, index) {
    const card = checkbox.closest('.module-card');
    const inputsDiv = checkbox.closest('.card-body').querySelector('.module-inputs');
    
    if (checkbox.checked) {
        inputsDiv.style.display = 'block';
        card.classList.add('active');
    } else {
        inputsDiv.style.display = 'none';
        card.classList.remove('active');
        // Uncheck all permissions when module is unchecked
        inputsDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.name.includes('[permissions]')) {
                cb.checked = false;
            }
        });
    }
}

function toggleAllPermissions(checkbox, index) {
    const inputsDiv = checkbox.closest('.module-inputs');
    const otherCheckboxes = inputsDiv.querySelectorAll(`input[name*="[permissions][]"]:not([id="perm_all_${index}"])`);
    
    if (checkbox.checked) {
        otherCheckboxes.forEach(cb => cb.checked = false);
    }
}

// On page load, show inputs for checked modules
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.module-checkbox').forEach(checkbox => {
        const card = checkbox.closest('.module-card');
        const inputsDiv = checkbox.closest('.card-body').querySelector('.module-inputs');
        
        if (checkbox.checked && inputsDiv) {
            inputsDiv.style.display = 'block';
            if (card) {
                card.classList.add('active');
            }
        }
    });
});
</script>
@endsection
