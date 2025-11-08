@extends('layouts.tenant')

@section('title', 'Detail Pengajuan Perubahan NPSN')
@section('page-title', 'Detail Pengajuan Perubahan NPSN')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Detail Pengajuan Perubahan NPSN
            </h2>
            <p>Informasi lengkap tentang pengajuan perubahan NPSN</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('npsn-change-requests.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<!-- Request Details Card -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-info-circle me-2 text-primary"></i>
            Detail Pengajuan
        </h5>
    </div>
    <div class="card-body p-4">
        <div class="info-card">
            <div class="info-item">
                <label>NPSN Saat Ini</label>
                <p><code class="fs-5">{{ $npsnChangeRequest->current_npsn }}</code></p>
            </div>
            
            <div class="info-item">
                <label>NPSN yang Diminta</label>
                <p><code class="fs-5 text-primary">{{ $npsnChangeRequest->requested_npsn }}</code></p>
            </div>
            
            <div class="info-item">
                <label>Alasan Perubahan</label>
                <p>{{ $npsnChangeRequest->reason }}</p>
            </div>
            
            <div class="info-item">
                <label>Status</label>
                <p>
                    @if($npsnChangeRequest->status === 'pending')
                        <span class="badge-modern bg-warning">
                            <i class="fas fa-clock me-1"></i>Menunggu Persetujuan
                        </span>
                    @elseif($npsnChangeRequest->status === 'approved')
                        <span class="badge-modern bg-success">
                            <i class="fas fa-check me-1"></i>Disetujui
                        </span>
                    @else
                        <span class="badge-modern bg-danger">
                            <i class="fas fa-times me-1"></i>Ditolak
                        </span>
                    @endif
                </p>
            </div>
            
            <div class="info-item">
                <label>Diajukan Oleh</label>
                <p>{{ $npsnChangeRequest->requester->name }} ({{ $npsnChangeRequest->requester->email }})</p>
            </div>
            
            <div class="info-item">
                <label>Tanggal Pengajuan</label>
                <p>{{ \Carbon\Carbon::parse($npsnChangeRequest->created_at)->format('d-m-Y H:i:s') }}</p>
            </div>
            
            @if($npsnChangeRequest->status !== 'pending')
            <div class="info-item">
                <label>Diproses Oleh</label>
                <p>{{ $npsnChangeRequest->approver->name ?? '-' }}</p>
            </div>
            
            <div class="info-item">
                <label>Tanggal Diproses</label>
                <p>{{ $npsnChangeRequest->approved_at ? \Carbon\Carbon::parse($npsnChangeRequest->approved_at)->format('d-m-Y H:i:s') : '-' }}</p>
            </div>
            
            @if($npsnChangeRequest->response_message)
            <div class="info-item">
                <label>Pesan dari Super Admin</label>
                <div class="alert alert-{{ $npsnChangeRequest->status === 'approved' ? 'success' : 'danger' }} mb-0">
                    {{ $npsnChangeRequest->response_message }}
                </div>
            </div>
            @endif
            @endif
        </div>
    </div>
</div>
@endsection

