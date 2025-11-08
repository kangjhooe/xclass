@extends('layouts.admin')

@section('title', 'Tenant Features Management')
@section('page-title', 'Tenant Features')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-cogs me-3"></i>
                Tenant Features Management
            </h2>
            <p>Kontrol fitur yang tersedia untuk setiap tenant sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="stat-card-modern primary" style="background: rgba(255,255,255,0.15) !important; backdrop-filter: blur(10px);">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-modern me-3" style="margin-bottom: 0;">
                        <i class="fas fa-building"></i>
                    </div>
                    <div>
                        <h3 class="mb-0" style="color: white; font-size: 1.5rem;">{{ $tenants->total() }}</h3>
                        <p class="mb-0" style="color: rgba(255,255,255,0.9); font-size: 0.85rem;">Total Tenants</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Actions -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-tools me-2 text-primary"></i>
                    Bulk Feature Management
                </h5>
            </div>
            <div class="card-body">
                <form id="bulkForm" method="POST" action="{{ route('admin.tenant-features.bulk-update') }}">
                    @csrf
                    <div class="row g-4">
                        <div class="col-lg-4">
                            <div class="form-group">
                                <label class="form-label fw-semibold text-dark">
                                    <i class="fas fa-building me-2 text-primary"></i>
                                    Select Tenants
                                </label>
                                <select name="tenant_ids[]" id="tenantSelect" class="form-select form-select-lg" multiple>
                                    @foreach($tenants as $tenant)
                                        <option value="{{ $tenant->id }}">{{ $tenant->name }}</option>
                                    @endforeach
                                </select>
                                <div class="form-text">Hold Ctrl/Cmd to select multiple tenants</div>
                            </div>
                        </div>
                        <div class="col-lg-3">
                            <div class="form-group">
                                <label class="form-label fw-semibold text-dark">
                                    <i class="fas fa-play-circle me-2 text-primary"></i>
                                    Action Type
                                </label>
                                <select name="action" id="actionSelect" class="form-select form-select-lg">
                                    <option value="">Choose Action</option>
                                    <option value="enable" class="text-success">✅ Enable Features</option>
                                    <option value="disable" class="text-danger">❌ Disable Features</option>
                                    <option value="set" class="text-info">🔄 Set Features</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-lg-5">
                            <div class="form-group">
                                <label class="form-label fw-semibold text-dark">
                                    <i class="fas fa-list-check me-2 text-primary"></i>
                                    Select Features
                                </label>
                                <div class="features-grid">
                                    @foreach($availableFeatures as $key => $feature)
                                        <div class="feature-option">
                                            <input class="form-check-input feature-checkbox" type="checkbox" 
                                                   name="features[]" value="{{ $key }}" id="feature_{{ $key }}">
                                            <label class="form-check-label feature-label" for="feature_{{ $key }}">
                                                <div class="feature-card">
                                                    <i class="{{ $feature['icon'] }} feature-icon"></i>
                                                    <span class="feature-name">{{ $feature['name'] }}</span>
                                                </div>
                                            </label>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-outline-primary" id="selectAllFeatures">
                                        <i class="fas fa-check-square me-1"></i>
                                        Select All
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" id="selectNoneFeatures">
                                        <i class="fas fa-square me-1"></i>
                                        Select None
                                    </button>
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg px-4" id="bulkSubmit" disabled>
                                    <i class="fas fa-rocket me-2"></i>
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Tenants with Features -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2 text-primary"></i>
                    Tenants & Features Overview
                </h5>
                <span class="badge-modern bg-primary" style="color: white;">
                    <i class="fas fa-chart-bar me-1"></i>
                    {{ $tenants->count() }} Tenants
                </span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-modern mb-0">
                        <thead>
                            <tr>
                                <th class="border-0 py-4 px-4">
                                    <span class="text-muted fw-bold text-uppercase small">School Information</span>
                                </th>
                                <th class="border-0 py-4 px-4">
                                    <span class="text-muted fw-bold text-uppercase small">Status</span>
                                </th>
                                <th class="border-0 py-4 px-4">
                                    <span class="text-muted fw-bold text-uppercase small">Active Features</span>
                                </th>
                                <th class="border-0 py-4 px-4 text-center">
                                    <span class="text-muted fw-bold text-uppercase small">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($tenants as $tenant)
                            <tr class="border-bottom tenant-row">
                                <td class="py-4 px-4">
                                    <div class="d-flex align-items-center">
                                        <div class="tenant-avatar bg-gradient-primary rounded-3 d-flex align-items-center justify-content-center me-3">
                                            <i class="fas fa-school text-white"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-1 text-dark fw-semibold">{{ $tenant->name }}</h6>
                                            <div class="d-flex align-items-center">
                                                <span class="badge bg-light text-dark me-2">{{ $tenant->npsn }}</span>
                                                <small class="text-muted">{{ $tenant->subscription_plan ?? 'No Plan' }}</small>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    @if($tenant->is_active)
                                        <div class="status-indicator">
                                            <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                                                <i class="fas fa-check-circle me-2"></i>Active
                                            </span>
                                        </div>
                                    @else
                                        <div class="status-indicator">
                                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                                                <i class="fas fa-times-circle me-2"></i>Inactive
                                            </span>
                                        </div>
                                    @endif
                                </td>
                                <td class="py-4 px-4">
                                    @php
                                        $tenantFeatures = \DB::table('tenant_feature_pivot')
                                            ->where('tenant_id', $tenant->id)
                                            ->where('is_active', true)
                                            ->pluck('feature_name')
                                            ->toArray();
                                    @endphp
                                    @if(count($tenantFeatures) > 0)
                                        <div class="features-preview">
                                            <div class="d-flex flex-wrap gap-2">
                                                @foreach(array_slice($tenantFeatures, 0, 3) as $featureName)
                                                    @if(isset($availableFeatures[$featureName]))
                                                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2">
                                                            <i class="{{ $availableFeatures[$featureName]['icon'] }} me-1"></i>
                                                            {{ $availableFeatures[$featureName]['name'] }}
                                                        </span>
                                                    @endif
                                                @endforeach
                                                @if(count($tenantFeatures) > 3)
                                                    <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-2">
                                                        +{{ count($tenantFeatures) - 3 }} more
                                                    </span>
                                                @endif
                                            </div>
                                        </div>
                                    @else
                                        <div class="no-features">
                                            <span class="text-muted">
                                                <i class="fas fa-exclamation-circle me-2"></i>
                                                No features enabled
                                            </span>
                                        </div>
                                    @endif
                                </td>
                                <td class="py-4 px-4 text-center">
                                    <a href="{{ route('admin.tenant-features.show', $tenant) }}" 
                                       class="btn btn-primary btn-sm px-3" 
                                       title="Manage Features">
                                        <i class="fas fa-cogs me-2"></i>
                                        Manage
                                    </a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-5">
                                    <div class="empty-state">
                                        <i class="fas fa-inbox"></i>
                                        <h5>Belum ada tenant</h5>
                                        <p>Buat tenant terlebih dahulu untuk mengelola fitur mereka</p>
                                        <a href="{{ route('admin.tenants.create') }}" class="btn btn-modern btn-primary">
                                            <i class="fas fa-plus me-2"></i>
                                            Buat Tenant Pertama
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                @if($tenants->hasPages())
                <div class="card-footer bg-white border-top py-3">
                    <div class="d-flex justify-content-center">
                        {{ $tenants->links() }}
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

<style>
/* Custom styles for tenant features management */
.bg-gradient-primary {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.bg-gradient-light {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.hero-section {
    box-shadow: 0 10px 30px rgba(30, 58, 138, 0.1);
}

.stats-card {
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.tenant-avatar {
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.table tbody tr.tenant-row:hover {
    background-color: rgba(30, 58, 138, 0.03);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.badge {
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 0.5rem;
}

.card {
    border: none;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
    border-radius: 1rem 1rem 0 0 !important;
}

.table th {
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none;
}

.table td {
    vertical-align: middle;
    border: none;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border: 2px dashed #e9ecef;
}

.feature-option {
    position: relative;
}

.feature-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.feature-label {
    cursor: pointer;
    display: block;
    width: 100%;
}

.feature-card {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.feature-card:hover {
    border-color: #1e3a8a;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.1);
    transform: translateY(-2px);
}

.feature-checkbox:checked + .feature-label .feature-card {
    border-color: #198754;
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
}

.feature-icon {
    font-size: 1.5rem;
    color: #1e3a8a;
    margin-bottom: 0.5rem;
}

.feature-checkbox:checked + .feature-label .feature-icon {
    color: #198754;
}

.feature-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
}

.feature-checkbox:checked + .feature-label .feature-name {
    color: #198754;
}

.icon-wrapper {
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.1);
}

.empty-state {
    padding: 3rem;
}

.empty-icon {
    opacity: 0.5;
}

.btn {
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-select-lg {
    border-radius: 0.5rem;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.form-select-lg:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.1);
}

.status-indicator .badge {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
}

.features-preview .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
}

.no-features {
    font-style: italic;
}

/* Custom scrollbar for features grid */
.features-grid::-webkit-scrollbar {
    width: 6px;
}

.features-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.features-grid::-webkit-scrollbar-thumb {
    background: #1e3a8a;
    border-radius: 3px;
}

.features-grid::-webkit-scrollbar-thumb:hover {
    background: #3b82f6;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const actionSelect = document.getElementById('actionSelect');
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox');
    const bulkSubmit = document.getElementById('bulkSubmit');
    const selectAllBtn = document.getElementById('selectAllFeatures');
    const selectNoneBtn = document.getElementById('selectNoneFeatures');
    
    // Enable/disable bulk submit button
    function updateBulkSubmit() {
        const hasAction = actionSelect.value !== '';
        const hasFeatures = Array.from(featureCheckboxes).some(cb => cb.checked);
        const hasTenants = document.getElementById('tenantSelect').selectedOptions.length > 0;
        
        bulkSubmit.disabled = !(hasAction && hasFeatures && hasTenants);
        
        // Update button text based on selection
        if (hasFeatures) {
            bulkSubmit.innerHTML = `<i class="fas fa-rocket me-2"></i>Apply Changes (${Array.from(featureCheckboxes).filter(cb => cb.checked).length} features)`;
        } else {
            bulkSubmit.innerHTML = `<i class="fas fa-rocket me-2"></i>Apply Changes`;
        }
    }
    
    // Update feature card visual state
    function updateFeatureCard(checkbox) {
        const card = checkbox.closest('.feature-option').querySelector('.feature-card');
        if (checkbox.checked) {
            card.style.borderColor = '#198754';
            card.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
            card.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.2)';
        } else {
            card.style.borderColor = '#e9ecef';
            card.style.background = 'white';
            card.style.boxShadow = 'none';
        }
    }
    
    // Event listeners
    actionSelect.addEventListener('change', updateBulkSubmit);
    featureCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            updateFeatureCard(this);
            updateBulkSubmit();
        });
    });
    document.getElementById('tenantSelect').addEventListener('change', updateBulkSubmit);
    
    // Select all features
    selectAllBtn.addEventListener('click', function() {
        featureCheckboxes.forEach(cb => {
            cb.checked = true;
            updateFeatureCard(cb);
        });
        updateBulkSubmit();
    });
    
    // Select none features
    selectNoneBtn.addEventListener('click', function() {
        featureCheckboxes.forEach(cb => {
            cb.checked = false;
            updateFeatureCard(cb);
        });
        updateBulkSubmit();
    });
    
    // Select all features when action is set
    actionSelect.addEventListener('change', function() {
        if (this.value === 'set') {
            featureCheckboxes.forEach(cb => {
                cb.checked = true;
                updateFeatureCard(cb);
            });
        }
        updateBulkSubmit();
    });
    
    // Initialize feature cards
    featureCheckboxes.forEach(cb => {
        updateFeatureCard(cb);
    });
    
    // Initialize bulk submit button
    updateBulkSubmit();
});
</script>
@endsection
