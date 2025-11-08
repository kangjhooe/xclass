@extends('layouts.admin')

@section('title', 'Onboarding Wizard - ' . $tenant->name)
@section('page-title', 'Onboarding Wizard')

@include('components.admin-modern-styles')

@push('styles')
<style>
    .step-item {
        position: relative;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        transition: all 0.3s;
    }
    
    .step-item.active {
        border-color: #007bff;
        background-color: #f8f9fa;
    }
    
    .step-item.completed {
        border-color: #28a745;
        background-color: #f0fff4;
    }
    
    .step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #e9ecef;
        color: #6c757d;
        font-weight: bold;
        margin-right: 1rem;
    }
    
    .step-item.active .step-number {
        background-color: #007bff;
        color: white;
    }
    
    .step-item.completed .step-number {
        background-color: #28a745;
        color: white;
    }
    
    .progress-bar-custom {
        height: 8px;
        border-radius: 4px;
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Header -->
<div class="row mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-1">
                    <i class="fas fa-rocket me-2 text-primary"></i>
                    Onboarding Wizard - {{ $tenant->name }}
                </h4>
                <p class="text-muted mb-0">Setup awal untuk tenant baru</p>
            </div>
            <div>
                <a href="{{ route('admin.tenants.show', $tenant) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i>
                    Kembali
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Progress Bar -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Progress Onboarding</h6>
                    <span class="badge bg-primary">{{ number_format($progress, 0) }}%</span>
                </div>
                <div class="progress progress-bar-custom">
                    <div class="progress-bar bg-primary" role="progressbar" 
                         style="width: {{ $progress }}%" 
                         aria-valuenow="{{ $progress }}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@if($isCompleted)
    <!-- Completion Message -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="alert alert-success">
                <h5 class="alert-heading">
                    <i class="fas fa-check-circle me-2"></i>
                    Onboarding Selesai!
                </h5>
                <p class="mb-0">Semua step onboarding telah diselesaikan. Tenant siap digunakan.</p>
            </div>
        </div>
    </div>
@endif

<!-- Steps -->
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-list-ol me-2"></i>
                    Langkah-langkah Onboarding
                </h5>
                <div>
                    @if(!$isCompleted)
                        <form action="{{ route('admin.tenants.onboarding.reset', $tenant) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin mereset onboarding?')">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-warning">
                                <i class="fas fa-redo me-1"></i>
                                Reset
                            </button>
                        </form>
                    @endif
                </div>
            </div>
            <div class="card-body">
                @foreach($steps as $index => $step)
                    <div class="step-item {{ $step->status === 'completed' ? 'completed' : ($step->status === 'in_progress' || ($currentStep && $currentStep->id === $step->id) ? 'active' : '') }}">
                        <div class="d-flex align-items-center">
                            <div class="step-number">
                                @if($step->status === 'completed')
                                    <i class="fas fa-check"></i>
                                @else
                                    {{ $index + 1 }}
                                @endif
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-1">{{ $step->step_name }}</h6>
                                <p class="text-muted mb-0 small">{{ $step->step_key }}</p>
                                @if($step->completed_at)
                                    <small class="text-muted">
                                        <i class="fas fa-clock me-1"></i>
                                        Selesai: {{ \App\Helpers\DateHelper::formatIndonesian($step->completed_at) }}
                                    </small>
                                @endif
                            </div>
                            <div>
                                @if($step->status === 'completed')
                                    <span class="badge bg-success">
                                        <i class="fas fa-check me-1"></i>
                                        Selesai
                                    </span>
                                @elseif($step->status === 'in_progress')
                                    <span class="badge bg-primary">
                                        <i class="fas fa-spinner fa-spin me-1"></i>
                                        Sedang Berlangsung
                                    </span>
                                @else
                                    <span class="badge bg-secondary">
                                        <i class="fas fa-clock me-1"></i>
                                        Pending
                                    </span>
                                @endif
                            </div>
                        </div>
                        
                        @if($step->status !== 'completed' && ($currentStep && $currentStep->id === $step->id))
                            <div class="mt-3 pt-3 border-top">
                                <form action="{{ route('admin.tenants.onboarding.complete-step', [$tenant, $step->step_key]) }}" method="POST">
                                    @csrf
                                    <div class="mb-3">
                                        <label class="form-label">Data (JSON - Opsional)</label>
                                        <textarea name="data" class="form-control" rows="3" placeholder='{"key": "value"}'></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-check me-1"></i>
                                        Selesaikan Step Ini
                                    </button>
                                </form>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection

