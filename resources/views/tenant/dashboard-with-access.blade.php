@extends('layouts.tenant')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-tachometer-alt mr-2"></i>
                        Dashboard - {{ auth()->user()->tenant->name ?? 'Tenant' }}
                    </h3>
                </div>
                <div class="card-body">
                    <!-- Access Summary -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="info-box">
                                <span class="info-box-icon bg-info">
                                    <i class="fas fa-cogs"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Fitur Aktif</span>
                                    <span class="info-box-number">
                                        {{ \App\Helpers\TenantAccessHelper::getActiveFeatures()->count() }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="info-box">
                                <span class="info-box-icon bg-success">
                                    <i class="fas fa-puzzle-piece"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Modul Aktif</span>
                                    <span class="info-box-number">
                                        {{ \App\Helpers\TenantAccessHelper::getActiveModules()->count() }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="info-box">
                                <span class="info-box-icon bg-warning">
                                    <i class="fas fa-calendar-alt"></i>
                                </span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Subscription</span>
                                    <span class="info-box-number">
                                        @php
                                            $subscription = \App\Helpers\TenantAccessHelper::getSubscriptionInfo();
                                        @endphp
                                        @if($subscription['is_valid'])
                                            {{ $subscription['plan'] ?? 'Free' }}
                                        @else
                                            Expired
                                        @endif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Access Menu -->
                    <div class="row">
                        <div class="col-12">
                            <h5>Modul yang Tersedia</h5>
                            <div class="row">
                                @php
                                    $menuItems = \App\Helpers\TenantAccessHelper::getAccessibleMenuItems();
                                @endphp
                                
                                @foreach($menuItems as $item)
                                <div class="col-md-3 col-sm-6 mb-3">
                                    <div class="card card-outline card-primary">
                                        <div class="card-body text-center">
                                            <i class="{{ $item['icon'] }} fa-2x mb-2 text-primary"></i>
                                            <h6 class="card-title">{{ $item['name'] }}</h6>
                                            <a href="{{ route($item['route']) }}" class="btn btn-primary btn-sm">
                                                <i class="fas fa-arrow-right mr-1"></i>
                                                Akses
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Feature Status -->
                    @if(\App\Helpers\TenantAccessHelper::getActiveFeatures()->count() > 0)
                    <div class="row mt-4">
                        <div class="col-12">
                            <h5>Fitur yang Tersedia</h5>
                            <div class="row">
                                @foreach(\App\Helpers\TenantAccessHelper::getActiveFeatures() as $feature)
                                <div class="col-md-4 mb-2">
                                    <div class="alert alert-success">
                                        <i class="fas fa-check-circle mr-2"></i>
                                        <strong>{{ $feature->feature_name }}</strong>
                                        @if($feature->expires_at)
                                            <br><small class="text-muted">
                                                Expires: {{ \App\Helpers\DateHelper::formatIndonesian($feature->expires_at) }}
                                            </small>
                                        @endif
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Module Status -->
                    @if(\App\Helpers\TenantAccessHelper::getActiveModules()->count() > 0)
                    <div class="row mt-4">
                        <div class="col-12">
                            <h5>Modul yang Tersedia</h5>
                            <div class="row">
                                @foreach(\App\Helpers\TenantAccessHelper::getActiveModules() as $module)
                                <div class="col-md-4 mb-2">
                                    <div class="alert alert-info">
                                        <i class="fas fa-puzzle-piece mr-2"></i>
                                        <strong>{{ $module->module_name }}</strong>
                                        @if($module->permissions)
                                            <br><small class="text-muted">
                                                Permissions: {{ implode(', ', $module->permissions) }}
                                            </small>
                                        @endif
                                        @if($module->expires_at)
                                            <br><small class="text-warning">
                                                Expires: {{ \App\Helpers\DateHelper::formatIndonesian($module->expires_at) }}
                                            </small>
                                        @endif
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Access Denied Messages -->
                    @if(!\App\Helpers\TenantAccessHelper::hasModule('ppdb'))
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <strong>Modul PPDB tidak tersedia</strong> - Hubungi administrator untuk mengaktifkan modul ini.
                    </div>
                    @endif

                    @if(!\App\Helpers\TenantAccessHelper::hasFeature('online_payment'))
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>Fitur Pembayaran Online tidak tersedia</strong> - Upgrade subscription untuk mengaktifkan fitur ini.
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Auto-refresh access status every 5 minutes
    setInterval(function() {
        // You can add AJAX call here to refresh access status
        console.log('Checking access status...');
    }, 300000);
});
</script>
@endpush
