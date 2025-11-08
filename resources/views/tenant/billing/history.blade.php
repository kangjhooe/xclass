@extends('layouts.tenant')

@section('title', 'Riwayat Billing')
@section('page-title', 'Riwayat Billing')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-history me-3"></i>
                Riwayat Billing
            </h2>
            <p>Riwayat pembayaran dan billing</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('tenant.billing.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Riwayat Billing
        </h5>
    </div>
    <div class="card-body">
        @if($billingHistory->count() > 0)
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
                            <th>Periode</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($billingHistory as $history)
                            <tr>
                                <td><strong>{{ $history->invoice_number ?? '-' }}</strong></td>
                                <td>{{ $history->billing_date->format('d-m-Y H:i') }}</td>
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
                                    <span class="badge-modern bg-{{ $history->billing_type === 'threshold_met' ? 'warning' : ($history->billing_type === 'initial' ? 'info' : 'primary') }}">
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
                                        <span class="badge-modern bg-success">
                                            <i class="fas fa-check me-1"></i>Paid
                                        </span>
                                        @if($history->paid_at)
                                            <br><small class="text-muted">
                                                {{ $history->paid_at->format('d-m-Y') }}
                                            </small>
                                        @endif
                                    @else
                                        <span class="badge-modern bg-danger">
                                            <i class="fas fa-times me-1"></i>Unpaid
                                        </span>
                                    @endif
                                </td>
                                <td>
                                    {{ $history->period_start->format('d-m-Y') }}
                                    <br>s/d<br>
                                    {{ $history->period_end->format('d-m-Y') }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($billingHistory->hasPages())
            <div class="card-footer">
                {{ $billingHistory->links() }}
            </div>
            @endif
        @else
            <div class="card-body text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                    <h5 class="text-muted">Belum Ada Riwayat Billing</h5>
                    <p class="text-muted">Anda belum memiliki riwayat billing.</p>
                </div>
            </div>
        @endif
    </div>
</div>
@endsection

