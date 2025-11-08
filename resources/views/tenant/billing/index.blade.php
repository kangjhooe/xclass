@extends('layouts.tenant')

@section('title', 'Billing & Subscription')
@section('page-title', 'Billing & Subscription')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-credit-card me-3"></i>
                Billing & Subscription
            </h2>
            <p>Kelola billing dan subscription sekolah Anda</p>
        </div>
    </div>
</div>
<!-- Trial/Warning Alert -->
@if($subscription && $subscription->is_trial && $subscription->isTrialEndingSoon())
<div class="row mb-4">
    <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <h5 class="alert-heading">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Peringatan: Trial Period Akan Berakhir
            </h5>
            <p class="mb-2">
                <strong>Trial period Anda akan berakhir dalam {{ $subscription->days_until_effective_end }} hari</strong> 
                ({{ $subscription->effective_end_date->format('d-m-Y') }}).
            </p>
            <p class="mb-2">
                Setelah trial berakhir, subscription akan dikenakan biaya sebesar 
                <strong>Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}</strong> per tahun.
            </p>
            <p class="mb-0">
                Silakan siapkan pembayaran untuk melanjutkan layanan. Hubungi admin untuk informasi pembayaran.
            </p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    </div>
</div>
@elseif($subscription && !$subscription->is_trial && $subscription->isEndingSoon())
<div class="row mb-4">
    <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <h5 class="alert-heading">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Peringatan: Subscription Akan Berakhir
            </h5>
            <p class="mb-2">
                <strong>Subscription Anda akan berakhir dalam {{ $subscription->days_until_renewal }} hari</strong> 
                ({{ $subscription->end_date->format('d-m-Y') }}).
            </p>
            <p class="mb-2">
                Biaya renewal: <strong>Rp {{ number_format($subscription->next_billing_amount, 0, ',', '.') }}</strong> per tahun.
            </p>
            <p class="mb-0">
                Silakan lakukan pembayaran untuk memperpanjang subscription. Hubungi admin untuk informasi pembayaran.
            </p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    </div>
</div>
@endif

<!-- Current Subscription Card -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h5 class="mb-0">
                    <i class="fas fa-credit-card me-2"></i>
                    Subscription Saat Ini
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <div class="text-center p-3 border rounded">
                            <h6 class="text-muted mb-2">Plan</h6>
                            <h4 class="mb-0">
                                <span class="badge bg-{{ $summary['plan']->is_free ? 'secondary' : 'primary' }} fs-6">
                                    {{ $summary['plan']->name }}
                                </span>
                            </h4>
                            @if($subscription && $subscription->is_trial)
                                <span class="badge bg-info mt-2">
                                    <i class="fas fa-gift me-1"></i>Trial Period
                                </span>
                            @endif
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center p-3 border rounded">
                            <h6 class="text-muted mb-2">Jumlah Siswa</h6>
                            <h4 class="mb-0">{{ number_format($summary['current_student_count']) }}</h4>
                            <small class="text-muted">
                                Saat billing: {{ number_format($summary['student_count_at_billing']) }}
                            </small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center p-3 border rounded">
                            <h6 class="text-muted mb-2">Billing Amount</h6>
                            @if($subscription && $subscription->is_trial)
                                <h4 class="mb-0 text-success">
                                    <i class="fas fa-gift me-1"></i>Gratis
                                </h4>
                                <small class="text-muted">
                                    Next: Rp {{ number_format($summary['next_billing_amount'], 0, ',', '.') }}
                                </small>
                            @else
                                <h4 class="mb-0 text-primary">
                                    Rp {{ number_format($summary['current_billing_amount'], 0, ',', '.') }}
                                </h4>
                                @if($summary['next_billing_amount'] != $summary['current_billing_amount'])
                                    <small class="text-info">
                                        Next: Rp {{ number_format($summary['next_billing_amount'], 0, ',', '.') }}
                                    </small>
                                @endif
                            @endif
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center p-3 border rounded">
                            <h6 class="text-muted mb-2">Status</h6>
                            <h4 class="mb-0">
                                <span class="badge bg-{{ $summary['status'] === 'active' ? 'success' : 'danger' }}">
                                    {{ ucfirst($summary['status']) }}
                                </span>
                            </h4>
                            @if($subscription && $subscription->is_paid)
                                <small class="text-success">
                                    <i class="fas fa-check me-1"></i>Paid
                                </small>
                            @else
                                <small class="text-danger">
                                    <i class="fas fa-times me-1"></i>Unpaid
                                </small>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Threshold Information -->
@if($subscription && !$summary['plan']->is_free && $summary['pending_increase'] > 0)
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white;">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Penambahan Siswa
                </h5>
            </div>
            <div class="card-body">
                <div class="alert alert-info mb-0">
                    <h6 class="alert-heading">
                        <i class="fas fa-info-circle me-2"></i>
                        Cara Kerja Threshold Billing
                    </h6>
                    <p class="mb-2">
                        <strong>Penambahan siswa saat ini:</strong> {{ $summary['pending_increase'] }} siswa
                    </p>
                    <p class="mb-2">
                        <strong>Threshold untuk plan {{ $summary['plan']->name }}:</strong> {{ $summary['threshold'] }} siswa
                    </p>
                    @if($summary['threshold_met'])
                        <div class="alert alert-warning mb-0 mt-3">
                            <strong>
                                <i class="fas fa-check-circle me-2"></i>
                                Threshold Tercapai!
                            </strong>
                            <p class="mb-0 mt-2">
                                Penambahan siswa ({{ $summary['pending_increase'] }}) telah melewati threshold ({{ $summary['threshold'] }}). 
                                Tagihan tambahan akan dibuat dan digabungkan ke subscription tahun berikutnya.
                            </p>
                        </div>
                    @else
                        <p class="mb-0">
                            <strong>Status:</strong> 
                            <span class="badge bg-info">
                                Belum mencapai threshold ({{ $summary['remaining_to_threshold'] }} siswa lagi)
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
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-calendar me-2 text-primary"></i>
                    Informasi Subscription
                </h5>
            </div>
            <div class="card-body">
                <table class="table table-borderless">
                    @if($subscription && $subscription->is_trial)
                    <tr>
                        <td width="40%"><strong>Trial Period:</strong></td>
                        <td>
                            {{ $subscription->trial_start_date->format('d-m-Y') }} 
                            s/d 
                            {{ $subscription->trial_end_date->format('d-m-Y') }}
                            <br><small class="text-{{ $subscription->isTrialEndingSoon() ? 'danger' : 'muted' }}">
                                ({{ $subscription->days_until_effective_end }} hari lagi)
                            </small>
                        </td>
                    </tr>
                    @endif
                    <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>{{ $subscription ? $subscription->start_date->format('d-m-Y') : '-' }}</td>
                    </tr>
                    <tr>
                        <td><strong>End Date:</strong></td>
                        <td>{{ $subscription ? $subscription->end_date->format('d-m-Y') : '-' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Next Billing:</strong></td>
                        <td>
                            @if($subscription && $subscription->next_billing_date)
                                {{ $subscription->next_billing_date->format('d-m-Y') }}
                                <br><small class="text-muted">
                                    ({{ $subscription->days_until_renewal }} hari lagi)
                                </small>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Billing Cycle:</strong></td>
                        <td>{{ $subscription ? ucfirst($subscription->billing_cycle) : '-' }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-file-invoice me-2 text-primary"></i>
                    Ringkasan Billing
                </h5>
            </div>
            <div class="card-body">
                <table class="table table-borderless">
                    <tr>
                        <td width="50%"><strong>Harga per Siswa:</strong></td>
                        <td>{{ $summary['plan']->formatted_price_per_student }}</td>
                    </tr>
                    <tr>
                        <td><strong>Jumlah Siswa:</strong></td>
                        <td>{{ number_format($summary['current_student_count']) }} siswa</td>
                    </tr>
                    @if($summary['pending_increase'] > 0)
                    <tr>
                        <td><strong>Pending Increase:</strong></td>
                        <td>
                            <span class="badge bg-warning">
                                +{{ $summary['pending_increase'] }} siswa
                            </span>
                        </td>
                    </tr>
                    @endif
                    <tr>
                        <td><strong>Billing Saat Ini:</strong></td>
                        <td>
                            <strong>Rp {{ number_format($summary['current_billing_amount'], 0, ',', '.') }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Billing Berikutnya:</strong></td>
                        <td>
                            <strong class="text-primary">
                                Rp {{ number_format($summary['next_billing_amount'], 0, ',', '.') }}
                            </strong>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Recent Billing History -->
@if($billingHistory && $billingHistory->count() > 0)
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-history me-2 text-primary"></i>
                    Riwayat Billing Terakhir
                </h5>
                <a href="{{ route('tenant.billing.history') }}" class="btn btn-modern btn-primary btn-sm">
                    <i class="fas fa-list me-2"></i>
                    Lihat Semua
                </a>
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
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($billingHistory as $history)
                                <tr>
                                    <td><strong>{{ $history->invoice_number ?? '-' }}</strong></td>
                                    <td>{{ $history->billing_date->format('d-m-Y') }}</td>
                                    <td>{{ number_format($history->student_count) }}</td>
                                    <td>
                                        <strong>Rp {{ number_format($history->billing_amount, 0, ',', '.') }}</strong>
                                    </td>
                                    <td>
                                        <span class="badge-modern bg-{{ $history->billing_type === 'threshold_met' ? 'warning' : 'info' }}">
                                            {{ ucfirst(str_replace('_', ' ', $history->billing_type)) }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($history->is_paid)
                                            <span class="badge-modern bg-success">Paid</span>
                                        @else
                                            <span class="badge-modern bg-danger">Unpaid</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

<!-- Information Card -->
<div class="row mt-4">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5" style="background: #f8f9fa;">
            <div class="card-body">
                <h6 class="mb-3" style="font-weight: 600;">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Penting
                </h6>
                <ul class="mb-0">
                    <li>Billing dilakukan per tahun berdasarkan jumlah siswa aktif.</li>
                    <li>Penambahan siswa kecil (< threshold) akan digabungkan ke billing tahun berikutnya.</li>
                    <li>Penambahan siswa besar (≥ threshold) akan ditagih langsung.</li>
                    @if($subscription && $subscription->is_trial)
                    <li>Anda sedang dalam <strong>trial period gratis</strong>. Setelah trial berakhir, billing akan dimulai.</li>
                    @endif
                    <li>Untuk pertanyaan atau bantuan, hubungi admin sistem.</li>
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection

