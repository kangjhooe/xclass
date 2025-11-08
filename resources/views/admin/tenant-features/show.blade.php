@extends('layouts.admin')

@section('title', 'Tenant Features - ' . $tenant->name)
@section('page-title', 'Tenant Features')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-cogs me-3"></i>
                Feature Management
            </h2>
            <p>Configure features for <strong>{{ $tenant->name }}</strong></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.tenant-features.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Back to All Tenants
            </a>
        </div>
    </div>
</div>

<!-- Tenant Info -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
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
                            <small>Users: <strong>{{ $tenant->users_count ?? 0 }}</strong></small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Features Management -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Available Features
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.tenant-features.update', $tenant) }}">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        @foreach($availableFeatures as $key => $feature)
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100 feature-card {{ in_array($key, $tenantFeatures) ? 'feature-enabled' : '' }}">
                                    <div class="card-body">
                                        <div class="form-check">
                                            <input class="form-check-input feature-checkbox" type="checkbox" 
                                                   name="features[]" value="{{ $key }}" 
                                                   id="feature_{{ $key }}"
                                                   {{ in_array($key, $tenantFeatures) ? 'checked' : '' }}>
                                            <label class="form-check-label w-100" for="feature_{{ $key }}">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="{{ $feature['icon'] }} fa-2x text-primary me-3"></i>
                                                    <div>
                                                        <h6 class="mb-1 text-dark">{{ $feature['name'] }}</h6>
                                                        <span class="badge-modern bg-{{ getCategoryColor($feature['category']) }}" style="color: white;">
                                                            {{ $feature['category'] }}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p class="text-muted small mb-0">{{ $feature['description'] }}</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <button type="button" class="btn btn-modern btn-secondary" id="selectAll">
                                        <i class="fas fa-check-square me-1"></i>
                                        Select All
                                    </button>
                                    <button type="button" class="btn btn-modern btn-secondary" id="selectNone">
                                        <i class="fas fa-square me-1"></i>
                                        Select None
                                    </button>
                                </div>
                                <div>
                                    <a href="{{ route('admin.tenant-features.index') }}" class="btn btn-modern btn-secondary me-2">
                                        Cancel
                                    </a>
                                    <button type="submit" class="btn btn-modern btn-primary">
                                        <i class="fas fa-save me-1"></i>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
/* Custom styles for tenant features management */
.avatar-lg {
    width: 60px;
    height: 60px;
}

.feature-card {
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    cursor: pointer;
}

.feature-card:hover {
    border-color: #1e3a8a;
    box-shadow: 0 4px 8px rgba(30, 58, 138, 0.1);
}

.feature-enabled {
    border-color: #198754 !important;
    background-color: rgba(25, 135, 84, 0.05);
}

.feature-card .form-check-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.feature-card .form-check-label {
    cursor: pointer;
}

.feature-card .form-check-input:checked + .form-check-label .feature-card {
    border-color: #198754;
    background-color: rgba(25, 135, 84, 0.05);
}

.card {
    border-radius: 0.5rem;
}

.badge {
    font-size: 0.75rem;
    font-weight: 500;
}

.btn {
    border-radius: 0.375rem;
}

/* Category colors */
.bg-core { background-color: #1e3a8a !important; }
.bg-additional { background-color: #6c757d !important; }
.bg-finance { background-color: #198754 !important; }
.bg-communication { background-color: #0dcaf0 !important; }
.bg-hr { background-color: #fd7e14 !important; }
.bg-analytics { background-color: #6f42c1 !important; }
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox');
    const selectAllBtn = document.getElementById('selectAll');
    const selectNoneBtn = document.getElementById('selectNone');
    
    // Handle card click to toggle checkbox
    featureCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.feature-checkbox');
                checkbox.checked = !checkbox.checked;
                updateCardState(this, checkbox.checked);
            }
        });
    });
    
    // Handle checkbox change
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.closest('.feature-card');
            updateCardState(card, this.checked);
        });
    });
    
    // Update card visual state
    function updateCardState(card, isChecked) {
        if (isChecked) {
            card.classList.add('feature-enabled');
        } else {
            card.classList.remove('feature-enabled');
        }
    }
    
    // Select all features
    selectAllBtn.addEventListener('click', function() {
        featureCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            const card = checkbox.closest('.feature-card');
            updateCardState(card, true);
        });
    });
    
    // Select none
    selectNoneBtn.addEventListener('click', function() {
        featureCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const card = checkbox.closest('.feature-card');
            updateCardState(card, false);
        });
    });
    
    // Initialize card states
    featureCheckboxes.forEach(checkbox => {
        const card = checkbox.closest('.feature-card');
        updateCardState(card, checkbox.checked);
    });
});
</script>
@endsection

@php
function getCategoryColor($category) {
    $colors = [
        'Core' => 'core',
        'Additional' => 'additional',
        'Finance' => 'finance',
        'Communication' => 'communication',
        'HR' => 'hr',
        'Analytics' => 'analytics'
    ];
    return $colors[$category] ?? 'secondary';
}
@endphp
