@extends('layouts.admin')

@section('title', 'Subscription Management')
@section('page-title', 'Subscription Management')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-credit-card me-3"></i>
                Subscription Management
            </h2>
            <p>Kelola subscription dan billing untuk semua tenant</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.subscriptions.statistics') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-chart-bar me-2"></i>
                Statistics
            </a>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern primary fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-list"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ number_format($stats['total'] ?? 0) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Subscription</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($stats['active']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Active</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern warning fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #b45309; font-size: 2rem;">{{ number_format($stats['unpaid']) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Unpaid</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern info fade-in-up fade-in-up-delay-4">
            <div class="stat-icon-modern">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 1.5rem;">Rp {{ number_format($stats['total_revenue'], 0, ',', '.') }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Revenue</p>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-filter me-2 text-primary"></i>
                    Filter Pencarian
                </h5>
            </div>
            <div class="card-body">
                <form method="GET" action="{{ route('admin.subscriptions.index') }}" class="row g-3 form-modern">
                    <div class="col-md-3">
                        <label for="plan_id" class="form-label">Plan</label>
                        <select name="plan_id" id="plan_id" class="form-select">
                            <option value="">Semua Plan</option>
                            @foreach($plans as $plan)
                                <option value="{{ $plan->id }}" {{ request('plan_id') == $plan->id ? 'selected' : '' }}>
                                    {{ $plan->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="status" class="form-label">Status</label>
                        <select name="status" id="status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                            <option value="expired" {{ request('status') == 'expired' ? 'selected' : '' }}>Expired</option>
                            <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Suspended</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="payment_status" class="form-label">Payment</label>
                        <select name="payment_status" id="payment_status" class="form-select">
                            <option value="">Semua</option>
                            <option value="paid" {{ request('payment_status') == 'paid' ? 'selected' : '' }}>Paid</option>
                            <option value="unpaid" {{ request('payment_status') == 'unpaid' ? 'selected' : '' }}>Unpaid</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="search" class="form-label">Cari Tenant</label>
                        <input type="text" name="search" id="search" class="form-control" value="{{ request('search') }}" placeholder="Nama atau NPSN...">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">&nbsp;</label>
                        <div>
                            <button type="submit" class="btn btn-modern btn-primary w-100">
                                <i class="fas fa-search me-1"></i>Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Subscriptions Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Subscription
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Plan</th>
                                <th>Siswa</th>
                                <th>Pending Increase</th>
                                <th>Billing Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Next Billing</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($subscriptions as $subscription)
                                <tr>
                                    <td>
                                        <strong>{{ $subscription->tenant->name }}</strong>
                                        <br><small class="text-muted">NPSN: {{ $subscription->tenant->npsn }}</small>
                                    </td>
                                    <td>
                                        <span class="badge-modern {{ $subscription->subscriptionPlan->is_free ? 'bg-secondary' : 'bg-primary' }}" style="color: white;">
                                            {{ $subscription->subscriptionPlan->name }}
                                        </span>
                                        @if($subscription->is_trial)
                                            <span class="badge-modern bg-info ms-1" style="color: white;">
                                                <i class="fas fa-gift me-1"></i>Trial
                                            </span>
                                        @endif
                                    </td>
                                    <td>
                                        <strong>{{ number_format($subscription->current_student_count) }}</strong>
                                        <br><small class="text-muted">Saat billing: {{ number_format($subscription->student_count_at_billing) }}</small>
                                    </td>
                                    <td>
                                        @if($subscription->pending_student_increase > 0)
                                            <span class="badge-modern bg-warning" style="color: white;">
                                                +{{ $subscription->pending_student_increase }}
                                            </span>
                                            <br><small class="text-muted">
                                                Threshold: {{ $subscription->subscriptionPlan->billing_threshold }}
                                            </small>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($subscription->is_trial)
                                            <span class="badge-modern bg-success" style="color: white;">
                                                <i class="fas fa-gift me-1"></i>Gratis (Trial)
                                            </span>
                                            <br><small class="text-muted">
                                                Next: Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}
                                            </small>
                                        @else
                                            <strong>Rp {{ number_format($subscription->current_billing_amount, 0, ',', '.') }}</strong>
                                            @if($subscription->next_billing_amount != $subscription->current_billing_amount)
                                                <br><small class="text-info">
                                                    Next: Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}
                                                </small>
                                            @endif
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge-modern bg-{{ $subscription->status_badge }}" style="color: white;">
                                            {{ ucfirst($subscription->status) }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($subscription->is_paid)
                                            <span class="badge-modern bg-success" style="color: white;">
                                                <i class="fas fa-check me-1"></i>Paid
                                            </span>
                                        @else
                                            <span class="badge-modern bg-danger" style="color: white;">
                                                <i class="fas fa-times me-1"></i>Unpaid
                                            </span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($subscription->is_trial && $subscription->trial_end_date)
                                            {{ \App\Helpers\DateHelper::formatIndonesian($subscription->trial_end_date) }}
                                            <br><small class="text-{{ $subscription->isTrialEndingSoon() ? 'danger' : 'muted' }}">
                                                ({{ $subscription->days_until_effective_end }} hari lagi)
                                            </small>
                                            @if($subscription->isTrialEndingSoon())
                                                <br><span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-exclamation-triangle me-1"></i>Ending Soon
                                                </span>
                                            @endif
                                        @elseif($subscription->next_billing_date)
                                            {{ \App\Helpers\DateHelper::formatIndonesian($subscription->next_billing_date) }}
                                            <br><small class="text-{{ $subscription->isEndingSoon() ? 'danger' : 'muted' }}">
                                                ({{ $subscription->days_until_renewal }} hari lagi)
                                            </small>
                                            @if($subscription->isEndingSoon())
                                                <br><span class="badge-modern bg-warning" style="color: white;">
                                                    <i class="fas fa-exclamation-triangle me-1"></i>Ending Soon
                                                </span>
                                            @endif
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.subscriptions.show', $subscription->tenant) }}" class="btn btn-modern btn-primary">
                                            <i class="fas fa-eye me-1"></i>Detail
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-inbox"></i>
                                            <h5>Tidak ada subscription ditemukan</h5>
                                            <p>Coba ubah filter pencarian Anda</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-3">
                    {{ $subscriptions->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

