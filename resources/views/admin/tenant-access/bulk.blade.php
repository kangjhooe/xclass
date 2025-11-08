@extends('layouts.admin')

@section('title', 'Bulk Tenant Access Update')
@section('page-title', 'Bulk Tenant Access')

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

@if($errors->any())
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>
        <ul class="mb-0">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-layer-group me-3"></i>
                Bulk Tenant Access Update
            </h2>
            <p>Update akses fitur dan modul untuk beberapa tenant sekaligus</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenant-access.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Back to List
            </a>
        </div>
    </div>
</div>

<!-- Bulk Update Form -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Bulk Update Form
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.tenant-access.bulk-update') }}" id="bulkUpdateForm" class="form-modern">
                    @csrf
                    
                    <!-- Action Selection -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="action" class="form-label">Action</label>
                            <select class="form-select" id="action" name="action" required>
                                <option value="">Pilih Action</option>
                                <option value="enable_features">Enable Features</option>
                                <option value="disable_features">Disable Features</option>
                                <option value="enable_modules">Enable Modules</option>
                                <option value="disable_modules">Disable Modules</option>
                            </select>
                        </div>
                    </div>

                    <!-- Tenants Selection -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <label class="form-label">Pilih Tenants</label>
                            <div class="card-modern">
                                <div class="card-body">
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-modern btn-primary" id="selectAllTenants">
                                            <i class="fas fa-check-square me-1"></i>Select All
                                        </button>
                                        <button type="button" class="btn btn-modern btn-secondary" id="deselectAllTenants">
                                            <i class="fas fa-square me-1"></i>Deselect All
                                        </button>
                                    </div>
                                    <div class="row">
                                        @foreach($tenants as $tenant)
                                        <div class="col-md-4 col-lg-3 mb-2">
                                            <div class="form-check">
                                                <input class="form-check-input tenant-checkbox" type="checkbox" 
                                                       name="tenant_ids[]" value="{{ $tenant->id }}" 
                                                       id="tenant_{{ $tenant->id }}">
                                                <label class="form-check-label" for="tenant_{{ $tenant->id }}">
                                                    <div>
                                                        <strong>{{ $tenant->name }}</strong><br>
                                                        <small class="text-muted">NPSN: {{ $tenant->npsn }}</small>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Features Selection -->
                    <div class="row mb-4" id="featuresSection" style="display: none;">
                        <div class="col-12">
                            <label class="form-label">Pilih Features</label>
                            <div class="card-modern">
                                <div class="card-body">
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-modern btn-primary" id="selectAllFeatures">
                                            <i class="fas fa-check-square me-1"></i>Select All
                                        </button>
                                        <button type="button" class="btn btn-modern btn-secondary" id="deselectAllFeatures">
                                            <i class="fas fa-square me-1"></i>Deselect All
                                        </button>
                                    </div>
                                    <div class="row">
                                        @php
                                            $availableFeatures = [
                                                'online_payment' => 'Pembayaran Online',
                                                'bulk_export' => 'Export Bulk Data',
                                                'advanced_reporting' => 'Laporan Lanjutan',
                                                'api_access' => 'Akses API',
                                                'custom_domain' => 'Domain Kustom',
                                                'backup_automation' => 'Backup Otomatis',
                                                'multi_language' => 'Multi Bahasa',
                                                'advanced_analytics' => 'Analitik Lanjutan',
                                                'sso_integration' => 'Integrasi SSO',
                                                'mobile_app' => 'Aplikasi Mobile',
                                            ];
                                        @endphp
                                        @foreach($availableFeatures as $key => $name)
                                        <div class="col-md-4 col-lg-3 mb-2">
                                            <div class="form-check">
                                                <input class="form-check-input feature-checkbox" type="checkbox" 
                                                       name="keys[]" value="{{ $key }}" 
                                                       id="feature_{{ $key }}">
                                                <label class="form-check-label" for="feature_{{ $key }}">
                                                    {{ $name }}
                                                </label>
                                            </div>
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Modules Selection -->
                    <div class="row mb-4" id="modulesSection" style="display: none;">
                        <div class="col-12">
                            <label class="form-label">Pilih Modules</label>
                            <div class="card-modern">
                                <div class="card-body">
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-modern btn-primary" id="selectAllModules">
                                            <i class="fas fa-check-square me-1"></i>Select All
                                        </button>
                                        <button type="button" class="btn btn-modern btn-secondary" id="deselectAllModules">
                                            <i class="fas fa-square me-1"></i>Deselect All
                                        </button>
                                    </div>
                                    <div class="row">
                                        @php
                                            $availableModules = [
                                                'ppdb' => 'PPDB/SPMB',
                                                'spp' => 'SPP (Sumbangan Pembinaan Pendidikan)',
                                                'library' => 'Perpustakaan',
                                                'inventory' => 'Inventori/Aset',
                                                'exam' => 'Ujian Online',
                                                'extracurricular' => 'Ekstrakurikuler',
                                                'parent_portal' => 'Portal Orang Tua',
                                                'counseling' => 'Bimbingan Konseling',
                                                'discipline' => 'Kedisiplinan',
                                                'graduation' => 'Pengumuman Kelulusan',
                                                'events' => 'Event/Agenda',
                                                'health' => 'Kesehatan',
                                                'transportation' => 'Transportasi',
                                                'cafeteria' => 'Kafetaria',
                                                'alumni' => 'Alumni',
                                            ];
                                        @endphp
                                        @foreach($availableModules as $key => $name)
                                        <div class="col-md-4 col-lg-3 mb-2">
                                            <div class="form-check">
                                                <input class="form-check-input module-checkbox" type="checkbox" 
                                                       name="keys[]" value="{{ $key }}" 
                                                       id="module_{{ $key }}">
                                                <label class="form-check-label" for="module_{{ $key }}">
                                                    {{ $name }}
                                                </label>
                                            </div>
                                        </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="row">
                        <div class="col-12">
                            <div class="d-flex justify-content-end">
                                <a href="{{ route('admin.tenant-access.index') }}" class="btn btn-modern btn-secondary me-2">
                                    Cancel
                                </a>
                                <button type="submit" class="btn btn-modern btn-primary" id="submitBtn" disabled>
                                    <i class="fas fa-save me-1"></i>
                                    Apply Bulk Update
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const actionSelect = document.getElementById('action');
    const featuresSection = document.getElementById('featuresSection');
    const modulesSection = document.getElementById('modulesSection');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('bulkUpdateForm');

    // Handle action change
    actionSelect.addEventListener('change', function() {
        const value = this.value;
        
        // Hide both sections first
        featuresSection.style.display = 'none';
        modulesSection.style.display = 'none';
        
        // Uncheck all checkboxes in both sections
        document.querySelectorAll('.feature-checkbox, .module-checkbox').forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
        
        // Show relevant section based on action
        if (value === 'enable_features' || value === 'disable_features') {
            featuresSection.style.display = 'block';
            // Disable module checkboxes
            document.querySelectorAll('.module-checkbox').forEach(cb => {
                cb.disabled = true;
            });
        } else if (value === 'enable_modules' || value === 'disable_modules') {
            modulesSection.style.display = 'block';
            // Disable feature checkboxes
            document.querySelectorAll('.feature-checkbox').forEach(cb => {
                cb.disabled = true;
            });
        }
        
        updateSubmitButton();
    });

    // Select All Tenants
    document.getElementById('selectAllTenants').addEventListener('click', function() {
        document.querySelectorAll('.tenant-checkbox').forEach(cb => {
            cb.checked = true;
        });
        updateSubmitButton();
    });

    // Deselect All Tenants
    document.getElementById('deselectAllTenants').addEventListener('click', function() {
        document.querySelectorAll('.tenant-checkbox').forEach(cb => {
            cb.checked = false;
        });
        updateSubmitButton();
    });

    // Select All Features
    document.getElementById('selectAllFeatures').addEventListener('click', function() {
        document.querySelectorAll('.feature-checkbox:not([disabled])').forEach(cb => {
            cb.checked = true;
        });
        updateSubmitButton();
    });

    // Deselect All Features
    document.getElementById('deselectAllFeatures').addEventListener('click', function() {
        document.querySelectorAll('.feature-checkbox').forEach(cb => {
            cb.checked = false;
        });
        updateSubmitButton();
    });

    // Select All Modules
    document.getElementById('selectAllModules').addEventListener('click', function() {
        document.querySelectorAll('.module-checkbox:not([disabled])').forEach(cb => {
            cb.checked = true;
        });
        updateSubmitButton();
    });

    // Deselect All Modules
    document.getElementById('deselectAllModules').addEventListener('click', function() {
        document.querySelectorAll('.module-checkbox').forEach(cb => {
            cb.checked = false;
        });
        updateSubmitButton();
    });

    // Listen to checkbox changes
    document.querySelectorAll('.tenant-checkbox, .feature-checkbox, .module-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSubmitButton);
    });

    // Update submit button state
    function updateSubmitButton() {
        const action = actionSelect.value;
        const hasTenants = document.querySelectorAll('.tenant-checkbox:checked').length > 0;
        
        let hasKeys = false;
        if (action === 'enable_features' || action === 'disable_features') {
            hasKeys = document.querySelectorAll('.feature-checkbox:checked').length > 0;
        } else if (action === 'enable_modules' || action === 'disable_modules') {
            hasKeys = document.querySelectorAll('.module-checkbox:checked').length > 0;
        }
        
        if (action && hasTenants && hasKeys) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        const action = actionSelect.value;
        const tenantCount = document.querySelectorAll('.tenant-checkbox:checked').length;
        const keyCount = document.querySelectorAll('.feature-checkbox:checked, .module-checkbox:checked').length;
        
        if (!confirm(`Yakin ingin mengupdate ${tenantCount} tenant dengan ${keyCount} ${action.includes('feature') ? 'features' : 'modules'}?`)) {
            e.preventDefault();
            return false;
        }
    });
});
</script>
@endsection

