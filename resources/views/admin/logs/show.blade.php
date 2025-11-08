@extends('layouts.admin')

@section('title', 'Log Detail')
@section('page-title', 'Log Detail')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-list-alt me-3"></i>
                Log Detail
            </h2>
            <p>Detail lengkap log sistem</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.logs') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Logs
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Log
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-info-circle"></i>
                        Level
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern {{ $log->level_badge_class }}" style="color: white;">
                            {{ strtoupper($log->level) }}
                        </span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-clock"></i>
                        Time
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($log->created_at) }} {{ $log->created_at->format('H:i:s') }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user"></i>
                        User
                    </div>
                    <div class="info-item-value">
                        @if($log->user)
                            {{ $log->user->name }} ({{ $log->user->email }})
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-building"></i>
                        Tenant
                    </div>
                    <div class="info-item-value">
                        @if($log->tenant)
                            {{ $log->tenant->name }} ({{ $log->tenant->npsn }})
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-network-wired"></i>
                        IP Address
                    </div>
                    <div class="info-item-value">
                        {{ $log->ip_address ?? '-' }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-desktop"></i>
                        User Agent
                    </div>
                    <div class="info-item-value">
                        <small class="text-muted">
                            {{ $log->user_agent ?? '-' }}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-comment me-2 text-primary"></i>
                    Message
                </h5>
            </div>
            <div class="card-body">
                <div class="bg-light p-3 rounded">
                    <pre class="mb-0" style="white-space: pre-wrap; word-wrap: break-word;">{{ $log->message }}</pre>
                </div>
            </div>
        </div>
    </div>
</div>

@if($log->context)
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-code me-2 text-primary"></i>
                    Context
                </h5>
            </div>
            <div class="card-body">
                <div class="bg-light p-3 rounded">
                    <pre class="mb-0" style="white-space: pre-wrap; word-wrap: break-word;">{{ $log->formatted_context }}</pre>
                </div>
            </div>
        </div>
    </div>
</div>
@endif
@endsection
