@extends('layouts.tenant')

@section('title', 'Detail Permintaan Akses')
@section('page-title', 'Detail Permintaan Akses')

@section('content')
<div class="row">
    <div class="col-md-10 offset-md-1">
        <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Detail Permintaan Akses
                </h5>
            </div>
            <div class="card-body">
                <!-- Super Admin Info -->
                <div class="mb-4">
                    <h6 class="text-muted mb-3">Informasi Super Admin:</h6>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                            <i class="fas fa-user-shield text-white"></i>
                        </div>
                        <div>
                            <h5 class="mb-0">{{ $access->user->name }}</h5>
                            <small class="text-muted">{{ $access->user->email }}</small>
                        </div>
                    </div>
                </div>

                <!-- Status -->
                <div class="mb-4">
                    <h6 class="text-muted mb-2">Status:</h6>
                    <span class="badge bg-{{ $access->status_badge }} fs-6">
                        {{ $access->status_label }}
                    </span>
                </div>

                <!-- Request Reason -->
                <div class="mb-4">
                    <h6 class="text-muted mb-2">Alasan Permintaan:</h6>
                    <div class="border rounded p-3 bg-light">
                        <p class="mb-0">{{ $access->request_reason }}</p>
                    </div>
                </div>

                <!-- Dates -->
                <div class="mb-4">
                    <h6 class="text-muted mb-2">Informasi Tanggal:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-calendar me-2 text-muted"></i> Diminta: {{ \App\Helpers\DateHelper::formatIndonesian($access->created_at) }}</li>
                        @if($access->approved_at)
                            <li><i class="fas fa-check-circle me-2 text-success"></i> Disetujui: {{ \App\Helpers\DateHelper::formatIndonesian($access->approved_at) }}</li>
                            @if($access->approver)
                                <li><i class="fas fa-user me-2 text-muted"></i> Oleh: {{ $access->approver->name }}</li>
                            @endif
                        @endif
                        @if($access->expires_at)
                            <li><i class="fas fa-clock me-2 text-warning"></i> Berlaku hingga: {{ \App\Helpers\DateHelper::formatIndonesian($access->expires_at) }}</li>
                        @endif
                    </ul>
                </div>

                @if($access->response_message)
                <div class="mb-4">
                    <h6 class="text-muted mb-2">Pesan:</h6>
                    <div class="border rounded p-3 bg-light">
                        <p class="mb-0">{{ $access->response_message }}</p>
                    </div>
                </div>
                @endif

                <!-- Actions -->
                @if($access->status === 'pending')
                <div class="border-top pt-4 mt-4">
                    <h6 class="text-dark mb-3">
                        <i class="fas fa-tasks me-2 text-primary"></i>
                        Tindakan:
                    </h6>
                    
                    <div class="row">
                        <!-- Approve Form -->
                        <div class="col-md-6 mb-4">
                            <div class="card border-success">
                                <div class="card-header bg-success text-white">
                                    <h6 class="mb-0">
                                        <i class="fas fa-check-circle me-2"></i>
                                        Setujui Akses
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <form action="{{ tenant_route('tenant.super-admin-access.approve', $access->id) }}" method="POST">
                                        @csrf
                                        <div class="mb-3">
                                            <label for="response_message_approve" class="form-label">Pesan (Opsional):</label>
                                            <textarea class="form-control" id="response_message_approve" name="response_message" rows="3" placeholder="Tambahkan pesan untuk super admin..."></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="expires_at" class="form-label">Kedaluwarsa (Opsional):</label>
                                            <input type="datetime-local" class="form-control" id="expires_at" name="expires_at" min="{{ now()->format('Y-m-d\TH:i') }}">
                                            <small class="text-muted">Kosongkan untuk akses permanen</small>
                                        </div>
                                        <button type="submit" class="btn btn-success w-100">
                                            <i class="fas fa-check me-1"></i>
                                            Setujui Akses
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Reject Form -->
                        <div class="col-md-6 mb-4">
                            <div class="card border-danger">
                                <div class="card-header bg-danger text-white">
                                    <h6 class="mb-0">
                                        <i class="fas fa-times-circle me-2"></i>
                                        Tolak Permintaan
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <form action="{{ tenant_route('tenant.super-admin-access.reject', $access->id) }}" method="POST">
                                        @csrf
                                        <div class="mb-3">
                                            <label for="response_message_reject" class="form-label">Alasan Penolakan <span class="text-danger">*</span>:</label>
                                            <textarea class="form-control @error('response_message') is-invalid @enderror" id="response_message_reject" name="response_message" rows="3" required placeholder="Jelaskan alasan penolakan..."></textarea>
                                            @error('response_message')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                        <button type="submit" class="btn btn-danger w-100">
                                            <i class="fas fa-times me-1"></i>
                                            Tolak Permintaan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @endif

                <div class="mt-4">
                    <a href="{{ tenant_route('tenant.super-admin-access.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-1"></i>
                        Kembali
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
