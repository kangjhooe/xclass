@extends('layouts.tenant')

@section('title', 'Detail SPP')
@section('page-title', 'Detail Data SPP')

@push('styles')
<style>
    .card {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: none;
    }
    
    .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        border: none;
        padding: 1.25rem 1.5rem;
    }
    
    .card-header h3 {
        color: white;
        margin: 0;
    }
    
    .info-table {
        background: #fff;
    }
    
    .info-table th {
        width: 30%;
        font-weight: 600;
        color: #374151;
        background: #f8f9fa;
    }
    
    .info-table td {
        color: #1f2937;
    }
    
    .badge-modern {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-info-circle me-2"></i>Detail Data SPP
                        </h3>
                        <div class="btn-group">
                            <a href="{{ tenant_route('spp.index') }}" class="btn btn-light btn-sm">
                                <i class="fas fa-arrow-left"></i> Kembali
                            </a>
                            <a href="{{ tenant_route('spp.edit', $spp->id) }}" class="btn btn-light btn-sm">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body p-4">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <table class="table table-borderless info-table">
                                <tr>
                                    <th>Siswa:</th>
                                    <td><strong>{{ $spp->student->name ?? 'N/A' }}</strong></td>
                                </tr>
                                <tr>
                                    <th>Nomor Induk:</th>
                                    <td>{{ $spp->student->student_number ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <th>Kelas:</th>
                                    <td>{{ $spp->student->class->name ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <th>Tahun Ajaran:</th>
                                    <td>{{ $spp->academicYear->name ?? 'N/A' }}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-borderless info-table">
                                <tr>
                                    <th>Bulan:</th>
                                    <td><strong>{{ \Carbon\Carbon::create()->month($spp->month)->format('F') }}</strong></td>
                                </tr>
                                <tr>
                                    <th>Jumlah SPP:</th>
                                    <td><strong class="text-primary fs-5">Rp {{ number_format($spp->amount, 0, ',', '.') }}</strong></td>
                                </tr>
                                <tr>
                                    <th>Tanggal Jatuh Tempo:</th>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($spp->due_date) }}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td>
                                        @if($spp->status == 'paid')
                                            <span class="badge badge-modern bg-success">Sudah Bayar</span>
                                        @elseif($spp->status == 'overdue')
                                            <span class="badge badge-modern bg-danger">Terlambat</span>
                                        @else
                                            <span class="badge badge-modern bg-warning">Belum Bayar</span>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    @if($spp->notes)
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="card border-left-primary" style="border-left: 4px solid #667eea;">
                                <div class="card-body">
                                    <h5 class="card-title mb-3">
                                        <i class="fas fa-sticky-note me-2"></i>Catatan
                                    </h5>
                                    <p class="text-muted mb-0">{{ $spp->notes }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif
                    
                    <div class="row">
                        <div class="col-12">
                            <h5 class="mb-3">
                                <i class="fas fa-receipt me-2"></i>Informasi Pembayaran
                            </h5>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Tanggal Bayar</th>
                                            <th>Jumlah Bayar</th>
                                            <th>Metode Bayar</th>
                                            <th>Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @if($spp->payments && $spp->payments->count() > 0)
                                            @foreach($spp->payments as $payment)
                                            <tr>
                                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($payment->paid_date ?? $payment->created_at) }}</td>
                                                <td><strong class="text-success">Rp {{ number_format($payment->amount, 0, ',', '.') }}</strong></td>
                                                <td><span class="badge bg-info">{{ $payment->method_label ?? ucfirst($payment->payment_method ?? '-') }}</span></td>
                                                <td>{{ $payment->payment_notes ?? '-' }}</td>
                                            </tr>
                                            @endforeach
                                        @else
                                            <tr>
                                                <td colspan="4" class="text-center py-4 text-muted">
                                                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                                                    Belum ada data pembayaran
                                                </td>
                                            </tr>
                                        @endif
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-light border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>Dibuat: {{ \App\Helpers\DateHelper::formatIndonesian($spp->created_at, true) }}
                            </small>
                        </div>
                        <div class="col-md-6 text-end">
                            <small class="text-muted">
                                <i class="fas fa-edit me-1"></i>Diupdate: {{ \App\Helpers\DateHelper::formatIndonesian($spp->updated_at, true) }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
