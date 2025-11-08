@extends('layouts.admin-simple')

@section('title', 'Detail Pengajuan Perubahan NPSN')
@section('page-title', 'Detail Pengajuan Perubahan NPSN')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Detail Pengajuan Perubahan NPSN
            </h2>
            <p>Informasi lengkap pengajuan perubahan NPSN</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.npsn-change-requests.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <!-- Request Details Card -->
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Pengajuan
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-building"></i>
                        Tenant
                    </div>
                    <div class="info-item-value">
                        <strong>{{ $npsnChangeRequest->tenant->name }}</strong><br>
                        <small class="text-muted">{{ $npsnChangeRequest->tenant->email }}</small>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-id-card"></i>
                        NPSN Saat Ini
                    </div>
                    <div class="info-item-value">
                        <code class="fs-5" style="background: #f8f9fa; padding: 0.5rem 1rem; border-radius: 0.5rem; color: #495057;">{{ $npsnChangeRequest->current_npsn }}</code>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-arrow-right text-primary"></i>
                        NPSN yang Diminta
                    </div>
                    <div class="info-item-value">
                        <code class="fs-5 text-primary fw-bold" style="background: #e3f2fd; padding: 0.5rem 1rem; border-radius: 0.5rem;">{{ $npsnChangeRequest->requested_npsn }}</code>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-comment-alt"></i>
                        Alasan Perubahan
                    </div>
                    <div class="info-item-value">
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #3b82f6;">
                            {{ $npsnChangeRequest->reason }}
                        </div>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-info-circle"></i>
                        Status
                    </div>
                    <div class="info-item-value">
                        @if($npsnChangeRequest->status === 'pending')
                            <span class="badge-modern bg-warning" style="color: white; font-size: 0.9rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-clock me-1"></i>Menunggu Persetujuan
                            </span>
                        @elseif($npsnChangeRequest->status === 'approved')
                            <span class="badge-modern bg-success" style="color: white; font-size: 0.9rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-check me-1"></i>Disetujui
                            </span>
                        @else
                            <span class="badge-modern bg-danger" style="color: white; font-size: 0.9rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-times me-1"></i>Ditolak
                            </span>
                        @endif
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user"></i>
                        Diajukan Oleh
                    </div>
                    <div class="info-item-value">
                        <strong>{{ $npsnChangeRequest->requester->name }}</strong><br>
                        <small class="text-muted">{{ $npsnChangeRequest->requester->email }}</small>
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar"></i>
                        Tanggal Pengajuan
                    </div>
                    <div class="info-item-value">
                        <i class="fas fa-clock me-1 text-muted"></i>
                        {{ \App\Helpers\DateHelper::formatIndonesian($npsnChangeRequest->created_at) }} {{ $npsnChangeRequest->created_at->format('H:i:s') }}
                    </div>
                </div>
                
                @if($npsnChangeRequest->status !== 'pending')
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-user-shield"></i>
                        Diproses Oleh
                    </div>
                    <div class="info-item-value">
                        {{ $npsnChangeRequest->approver->name ?? '-' }}
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-calendar-check"></i>
                        Tanggal Diproses
                    </div>
                    <div class="info-item-value">
                        <i class="fas fa-clock me-1 text-muted"></i>
                        {{ $npsnChangeRequest->approved_at ? \App\Helpers\DateHelper::formatIndonesian($npsnChangeRequest->approved_at) . ' ' . \Carbon\Carbon::parse($npsnChangeRequest->approved_at)->format('H:i:s') : '-' }}
                    </div>
                </div>
                
                @if($npsnChangeRequest->response_message)
                <div class="info-item">
                    <div class="info-item-label">
                        <i class="fas fa-comment-dots"></i>
                        Pesan
                    </div>
                    <div class="info-item-value">
                        <div class="alert alert-{{ $npsnChangeRequest->status === 'approved' ? 'success' : 'danger' }} mb-0" style="border-left: 4px solid {{ $npsnChangeRequest->status === 'approved' ? '#10b981' : '#ef4444' }};">
                            <i class="fas fa-{{ $npsnChangeRequest->status === 'approved' ? 'check-circle' : 'exclamation-circle' }} me-2"></i>
                            {{ $npsnChangeRequest->response_message }}
                        </div>
                    </div>
                </div>
                @endif
                @endif
            </div>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="info-sidebar">
            <!-- Status Card -->
            <div class="card-modern fade-in-up fade-in-up-delay-1">
                <div class="card-header" style="background: linear-gradient(135deg, {{ $npsnChangeRequest->status === 'pending' ? '#f59e0b' : ($npsnChangeRequest->status === 'approved' ? '#10b981' : '#ef4444') }} 0%, {{ $npsnChangeRequest->status === 'pending' ? '#d97706' : ($npsnChangeRequest->status === 'approved' ? '#059669' : '#dc2626') }} 100%) !important; color: white !important;">
                    <h5 style="color: white !important; margin: 0 !important;">
                        <i class="fas fa-{{ $npsnChangeRequest->status === 'pending' ? 'clock' : ($npsnChangeRequest->status === 'approved' ? 'check-circle' : 'times-circle') }} me-2"></i>
                        Status Pengajuan
                    </h5>
                </div>
                <div class="card-body text-center">
                    @if($npsnChangeRequest->status === 'pending')
                        <div class="mb-3">
                            <i class="fas fa-clock" style="font-size: 3rem; color: #f59e0b;"></i>
                        </div>
                        <h4 class="text-warning mb-2">Menunggu Persetujuan</h4>
                        <p class="text-muted mb-0">Pengajuan sedang menunggu review dari super admin</p>
                    @elseif($npsnChangeRequest->status === 'approved')
                        <div class="mb-3">
                            <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981;"></i>
                        </div>
                        <h4 class="text-success mb-2">Disetujui</h4>
                        <p class="text-muted mb-0">NPSN telah berhasil diubah</p>
                    @else
                        <div class="mb-3">
                            <i class="fas fa-times-circle" style="font-size: 3rem; color: #ef4444;"></i>
                        </div>
                        <h4 class="text-danger mb-2">Ditolak</h4>
                        <p class="text-muted mb-0">Pengajuan perubahan NPSN ditolak</p>
                    @endif
                </div>
            </div>
            
            <!-- Quick Info Card -->
            <div class="card-modern fade-in-up fade-in-up-delay-2 mt-3">
                <div class="card-header">
                    <h5>
                        <i class="fas fa-info-circle me-2 text-primary"></i>
                        Informasi Cepat
                    </h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <small class="text-muted d-block mb-1">ID Pengajuan</small>
                        <strong>#{{ $npsnChangeRequest->id }}</strong>
                    </div>
                    <div class="mb-3">
                        <small class="text-muted d-block mb-1">Tenant ID</small>
                        <strong>{{ $npsnChangeRequest->tenant_id }}</strong>
                    </div>
                    <div>
                        <small class="text-muted d-block mb-1">Durasi Menunggu</small>
                        <strong>{{ $npsnChangeRequest->created_at->diffForHumans() }}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Action Card (only for pending requests) -->
@if($npsnChangeRequest->status === 'pending')
<div class="row mt-4">
    <div class="col-lg-12">
        <div class="card-modern fade-in-up">
            <div class="card-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: white !important;">
                <h5 style="color: white !important; margin: 0 !important;">
                    <i class="fas fa-cog me-2"></i>
                    Tindakan
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <!-- Approve Form -->
                    <div class="col-md-6 mb-3 mb-md-0">
                        <div class="card" style="border: 2px solid #10b981; border-radius: 0.75rem; height: 100%;">
                            <div class="card-body">
                                <h6 class="text-success mb-3">
                                    <i class="fas fa-check-circle me-2"></i>
                                    Setujui Pengajuan
                                </h6>
                                <form action="{{ route('admin.npsn-change-requests.approve', $npsnChangeRequest->id) }}" method="POST" class="form-modern">
                                    @csrf
                                    <div class="mb-3">
                                        <label for="approve_message" class="form-label">
                                            <small>Pesan (Opsional)</small>
                                        </label>
                                        <textarea class="form-control" 
                                                  id="approve_message" 
                                                  name="response_message" 
                                                  rows="3"
                                                  placeholder="Pesan untuk admin tenant..."></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-modern btn-success w-100" onclick="return confirm('Apakah Anda yakin ingin menyetujui perubahan NPSN ini? NPSN akan langsung berubah setelah disetujui.')">
                                        <i class="fas fa-check me-2"></i>
                                        Setujui Perubahan NPSN
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reject Form -->
                    <div class="col-md-6">
                        <div class="card" style="border: 2px solid #ef4444; border-radius: 0.75rem; height: 100%;">
                            <div class="card-body">
                                <h6 class="text-danger mb-3">
                                    <i class="fas fa-times-circle me-2"></i>
                                    Tolak Pengajuan
                                </h6>
                                <form action="{{ route('admin.npsn-change-requests.reject', $npsnChangeRequest->id) }}" method="POST" class="form-modern">
                                    @csrf
                                    <div class="mb-3">
                                        <label for="reject_message" class="form-label">
                                            <small>Alasan Penolakan <span class="text-danger">*</span></small>
                                        </label>
                                        <textarea class="form-control @error('response_message') is-invalid @enderror" 
                                                  id="reject_message" 
                                                  name="response_message" 
                                                  rows="3"
                                                  placeholder="Jelaskan alasan penolakan..."
                                                  required></textarea>
                                        @error('response_message')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <button type="submit" class="btn btn-modern btn-danger w-100" onclick="return confirm('Apakah Anda yakin ingin menolak perubahan NPSN ini?')">
                                        <i class="fas fa-times me-2"></i>
                                        Tolak Perubahan NPSN
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endif
@endsection

