@extends('layouts.admin')

@section('title', 'Detail Subscription: ' . $tenant->name)
@section('page-title', 'Detail Subscription: ' . $tenant->name)

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-credit-card me-3"></i>
                Detail Subscription: {{ $tenant->name }}
            </h2>
            <p>Informasi lengkap subscription dan billing</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.subscriptions.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Kembali
            </a>
        </div>
    </div>
</div>

<!-- Trial/Warning Alert -->
@if($subscription->is_trial && $subscription->isTrialEndingSoon())
<div class="row mb-4">
    <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert" style="border-left: 4px solid #f59e0b;">
            <h5 class="alert-heading">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Peringatan: Trial Period Akan Berakhir
            </h5>
            <p class="mb-2">
                <strong>Trial period Anda akan berakhir dalam {{ $subscription->days_until_effective_end }} hari</strong> 
                ({{ \App\Helpers\DateHelper::formatIndonesian($subscription->effective_end_date) }}).
            </p>
            <p class="mb-2">
                Setelah trial berakhir, subscription akan dikenakan biaya sebesar 
                <strong>Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}</strong> per tahun.
            </p>
            <p class="mb-0">
                Silakan siapkan pembayaran untuk melanjutkan layanan.
            </p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    </div>
</div>
@elseif(!$subscription->is_trial && $subscription->isEndingSoon())
<div class="row mb-4">
    <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert" style="border-left: 4px solid #f59e0b;">
            <h5 class="alert-heading">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Peringatan: Subscription Akan Berakhir
            </h5>
            <p class="mb-2">
                <strong>Subscription Anda akan berakhir dalam {{ $subscription->days_until_renewal }} hari</strong> 
                ({{ \App\Helpers\DateHelper::formatIndonesian($subscription->end_date) }}).
            </p>
            <p class="mb-2">
                Biaya renewal: <strong>Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}</strong> per tahun.
            </p>
            <p class="mb-0">
                Silakan lakukan pembayaran untuk memperpanjang subscription.
            </p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    </div>
</div>
@endif

<!-- Billing Summary Card -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern primary fade-in-up fade-in-up-delay-1">
            <div class="stat-icon-modern">
                <i class="fas fa-crown"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 1.5rem;">
                <span class="badge-modern {{ $subscription->subscriptionPlan->is_free ? 'bg-secondary' : 'bg-primary' }}" style="color: white;">
                    {{ $subscription->subscriptionPlan->name }}
                </span>
            </h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">{{ $subscription->subscriptionPlan->formatted_price_per_student }}</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern success fade-in-up fade-in-up-delay-2">
            <div class="stat-icon-modern">
                <i class="fas fa-user-graduate"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ number_format($subscription->current_student_count) }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Saat billing: {{ number_format($subscription->student_count_at_billing) }}</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern {{ $subscription->pending_student_increase > 0 ? 'warning' : 'success' }} fade-in-up fade-in-up-delay-3">
            <div class="stat-icon-modern">
                <i class="fas fa-arrow-up"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: {{ $subscription->pending_student_increase > 0 ? '#b45309' : '#047857' }}; font-size: 2rem;">
                {{ $subscription->pending_student_increase > 0 ? '+' . $subscription->pending_student_increase : '0' }}
            </h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">
                @if($subscription->pending_student_increase > 0)
                    Threshold: {{ $subscription->subscriptionPlan->billing_threshold }} siswa
                @else
                    Tidak ada penambahan
                @endif
            </p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card-modern info fade-in-up fade-in-up-delay-4">
            <div class="stat-icon-modern">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0e7490; font-size: 1.3rem;">
                @if($subscription->is_trial)
                                    <span class="badge-modern bg-success" style="color: white;">
                                        <i class="fas fa-gift me-1"></i>Gratis
                                    </span>
                                @else
                                    Rp {{ number_format($subscription->current_billing_amount, 0, ',', '.') }}
                                @endif
            </h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">
                @if($subscription->is_trial)
                    Next: Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}
                @elseif($subscription->next_billing_amount != $subscription->current_billing_amount)
                    Next: Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}
                @else
                    Billing Amount
                @endif
            </p>
        </div>
    </div>
</div>

<!-- Threshold Information Card -->
@if(!$subscription->subscriptionPlan->is_free && $subscription->pending_student_increase > 0)
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up" style="border-left-color: #f59e0b !important;">
            <div class="card-header" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;">
                <h5>
                    <i class="fas fa-exclamation-triangle me-2 text-warning"></i>
                    Informasi Threshold Billing
                </h5>
            </div>
            <div class="card-body">
                <div class="alert alert-info mb-0">
                    <h6 class="alert-heading">
                        <i class="fas fa-info-circle me-2"></i>
                        Cara Kerja Threshold Billing
                    </h6>
                    <p class="mb-2">
                        <strong>Penambahan siswa saat ini:</strong> {{ $subscription->pending_student_increase }} siswa
                    </p>
                    <p class="mb-2">
                        <strong>Threshold untuk plan {{ $subscription->subscriptionPlan->name }}:</strong> {{ $subscription->subscriptionPlan->billing_threshold }} siswa
                    </p>
                    @if($subscription->checkThreshold())
                        <div class="alert alert-warning mb-0 mt-3">
                            <strong>
                                <i class="fas fa-check-circle me-2"></i>
                                Threshold Tercapai!
                            </strong>
                            <p class="mb-0 mt-2">
                                Penambahan siswa ({{ $subscription->pending_student_increase }}) telah melewati threshold ({{ $subscription->subscriptionPlan->billing_threshold }}). 
                                Tagihan tambahan akan dibuat dan digabungkan ke subscription tahun berikutnya.
                            </p>
                        </div>
                    @else
                        <p class="mb-0">
                            <strong>Status:</strong> 
                            <span class="badge bg-info">
                                Belum mencapai threshold ({{ $subscription->subscriptionPlan->billing_threshold - $subscription->pending_student_increase }} siswa lagi)
                            </span>
                        </p>
                        <p class="mb-0 mt-2">
                            Penambahan siswa yang belum mencapai threshold akan <strong>tidak ditagih langsung</strong>, 
                            tetapi akan <strong>digabungkan ke billing tahun berikutnya</strong>.
                        </p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- Subscription Details -->
<div class="row mb-4">
    <div class="col-md-6">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-calendar me-2 text-primary"></i>
                    Informasi Subscription
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-info-circle"></i>
                        Status
                    </div>
                    <div class="info-item-value">
                        <span class="badge-modern bg-{{ $subscription->status_badge }}" style="color: white;">
                            {{ ucfirst($subscription->status) }}
                        </span>
                        @if($subscription->is_trial)
                            <span class="badge-modern bg-info ms-2" style="color: white;">
                                <i class="fas fa-gift me-1"></i>Trial
                            </span>
                        @endif
                    </div>
                </div>
                @if($subscription->is_trial)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-gift"></i>
                        Trial Period
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($subscription->trial_start_date) }} 
                        s/d 
                        {{ \App\Helpers\DateHelper::formatIndonesian($subscription->trial_end_date) }}
                        <br><small class="text-{{ $subscription->isTrialEndingSoon() ? 'danger' : 'muted' }}">
                            ({{ $subscription->days_until_effective_end }} hari lagi)
                        </small>
                        @if($subscription->isTrialEndingSoon())
                            <br><span class="badge-modern bg-warning" style="color: white;">
                                <i class="fas fa-exclamation-triangle me-1"></i>Ending Soon
                            </span>
                        @endif
                    </div>
                </div>
                @endif
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-plus"></i>
                        Start Date
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($subscription->start_date) }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-times"></i>
                        End Date
                    </div>
                    <div class="info-item-value">
                        {{ \App\Helpers\DateHelper::formatIndonesian($subscription->end_date) }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-check"></i>
                        Next Billing
                    </div>
                    <div class="info-item-value">
                        @if($subscription->next_billing_date)
                            {{ \App\Helpers\DateHelper::formatIndonesian($subscription->next_billing_date) }}
                            <small class="text-muted">({{ $subscription->days_until_renewal }} hari lagi)</small>
                        @else
                            <span class="text-muted">-</span>
                        @endif
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-sync-alt"></i>
                        Billing Cycle
                    </div>
                    <div class="info-item-value">
                        {{ ucfirst($subscription->billing_cycle) }}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-money-check-alt"></i>
                        Payment Status
                    </div>
                    <div class="info-item-value">
                        @if($subscription->is_paid)
                            <span class="badge-modern bg-success" style="color: white;">
                                <i class="fas fa-check me-1"></i>Paid
                            </span>
                            @if($subscription->paid_at)
                                <br><small class="text-muted">Paid on: {{ \App\Helpers\DateHelper::formatIndonesian($subscription->paid_at) }}</small>
                            @endif
                        @else
                            <span class="badge-modern bg-danger" style="color: white;">
                                <i class="fas fa-times me-1"></i>Unpaid
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-cog me-2 text-primary"></i>
                    Aksi
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.subscriptions.update-student-count', $tenant) }}" class="mb-3 form-modern">
                    @csrf
                    <div class="mb-3">
                        <label for="student_count" class="form-label">Update Jumlah Siswa</label>
                        <input type="number" 
                               name="student_count" 
                               id="student_count" 
                               class="form-control" 
                               value="{{ $subscription->current_student_count }}" 
                               min="0" 
                               required>
                        <small class="text-muted">Update jumlah siswa akan memicu perhitungan ulang billing</small>
                    </div>
                    <button type="submit" class="btn btn-modern btn-primary">
                        <i class="fas fa-save me-1"></i>
                        Update Siswa
                    </button>
                </form>

                @if($subscription->status === 'active' && $subscription->days_until_renewal <= 30)
                    <form method="POST" action="{{ route('admin.subscriptions.renewal', $subscription) }}" class="mb-3">
                        @csrf
                        <button type="submit" class="btn btn-modern btn-success w-100" onclick="return confirm('Yakin ingin memproses renewal?')">
                            <i class="fas fa-sync-alt me-1"></i>
                            Process Renewal
                        </button>
                    </form>
                @endif

                <a href="{{ route('admin.subscriptions.index') }}" class="btn btn-modern btn-secondary w-100">
                    <i class="fas fa-arrow-left me-1"></i>
                    Kembali ke Daftar
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Billing History -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-history me-2 text-primary"></i>
                    Riwayat Billing
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-modern">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Tanggal</th>
                                <th>Jumlah Siswa</th>
                                <th>Billing Amount</th>
                                <th>Tipe</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($billingHistory as $history)
                                <tr>
                                    <td>
                                        <strong>{{ $history->invoice_number ?? '-' }}</strong>
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($history->billing_date) }}</td>
                                    <td>
                                        {{ number_format($history->student_count) }}
                                        @if($history->previous_student_count)
                                            <br><small class="text-muted">
                                                Sebelumnya: {{ number_format($history->previous_student_count) }}
                                            </small>
                                        @endif
                                    </td>
                                    <td>
                                        <strong>Rp {{ number_format($history->billing_amount, 0, ',', '.') }}</strong>
                                        @if($history->previous_billing_amount)
                                            <br><small class="text-muted">
                                                Sebelumnya: Rp {{ number_format($history->previous_billing_amount, 0, ',', '.') }}
                                            </small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge-modern {{ $history->billing_type === 'threshold_met' ? 'bg-warning' : 'bg-info' }}" style="color: white;">
                                            {{ ucfirst(str_replace('_', ' ', $history->billing_type)) }}
                                        </span>
                                        @if($history->threshold_triggered)
                                            <br><small class="text-warning">
                                                <i class="fas fa-exclamation-triangle me-1"></i>Threshold triggered
                                            </small>
                                        @endif
                                    </td>
                                    <td>
                                        @if($history->is_paid)
                                            <span class="badge-modern bg-success" style="color: white;">Paid</span>
                                        @else
                                            <span class="badge-modern bg-danger" style="color: white;">Unpaid</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if(!$history->is_paid)
                                            <form method="POST" action="{{ route('admin.subscriptions.mark-paid', $history) }}" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-modern btn-success" onclick="return confirm('Mark as paid?')">
                                                    <i class="fas fa-check me-1"></i>Mark Paid
                                                </button>
                                            </form>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-inbox"></i>
                                            <h5>Tidak ada riwayat billing</h5>
                                            <p>Belum ada riwayat billing untuk subscription ini</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="mt-3">
                    {{ $billingHistory->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

