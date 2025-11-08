@extends('layouts.admin')

@section('title', 'Minta Akses Tenant')
@section('page-title', 'Minta Akses Tenant: ' . $tenant->name)

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-key me-3"></i>
                Minta Akses Tenant: {{ $tenant->name }}
            </h2>
            <p>Formulir permintaan akses ke tenant</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ route('admin.super-admin-access.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i>
                Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8 mx-auto">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-key me-2 text-primary"></i>
                    Formulir Permintaan Akses
                </h5>
            </div>
            <div class="card-body">
                <!-- Tenant Info -->
                <div class="card-modern mb-4">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="fas fa-building me-2 text-primary"></i>
                            Informasi Tenant
                        </h6>
                    </div>
                    <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Nama:</strong> {{ $tenant->name }}
                        </div>
                        <div class="col-md-6">
                            <strong>NPSN:</strong> {{ $tenant->npsn }}
                        </div>
                        @if($tenant->email)
                        <div class="col-md-6 mt-2">
                            <strong>Email:</strong> {{ $tenant->email }}
                        </div>
                        @endif
                        @if($tenant->phone)
                        <div class="col-md-6 mt-2">
                            <strong>Telepon:</strong> {{ $tenant->phone }}
                        </div>
                        @endif
                    </div>
                    </div>
                </div>

                <!-- Existing Access Info -->
                @if($existing)
                    <div class="alert alert-{{ $existing->status === 'approved' ? 'success' : ($existing->status === 'rejected' ? 'danger' : 'warning') }} mb-4">
                        <h6 class="alert-heading">
                            <i class="fas fa-info-circle me-2"></i>
                            Status Akses Saat Ini
                        </h6>
                        <p class="mb-1">
                            <strong>Status:</strong> 
                            <span class="badge-modern bg-{{ $existing->status === 'approved' ? 'success' : ($existing->status === 'rejected' ? 'danger' : 'warning') }}" style="color: white;">
                                {{ $existing->status_label }}
                            </span>
                        </p>
                        @if($existing->request_reason)
                            <p class="mb-1"><strong>Alasan Permintaan:</strong> {{ $existing->request_reason }}</p>
                        @endif
                        @if($existing->response_message)
                            <p class="mb-1"><strong>Pesan dari Admin:</strong> {{ $existing->response_message }}</p>
                        @endif
                        @if($existing->approved_at)
                            <p class="mb-1"><strong>Disetujui pada:</strong> {{ $existing->approved_at->format('d-m-Y H:i') }}</p>
                        @endif
                        @if($existing->expires_at)
                            <p class="mb-0"><strong>Berakhir pada:</strong> {{ $existing->expires_at->format('d-m-Y H:i') }}</p>
                        @endif
                    </div>
                @endif

                <!-- Request Form -->
                <form method="POST" action="{{ route('admin.super-admin-access.request.store', $tenant) }}">
                    @csrf
                    
                    <div class="mb-3">
                        <label for="request_reason" class="form-label">
                            <i class="fas fa-comment-alt me-1"></i>
                            Alasan Permintaan Akses <span class="text-danger">*</span>
                        </label>
                        <textarea 
                            name="request_reason" 
                            id="request_reason" 
                            class="form-control @error('request_reason') is-invalid @enderror" 
                            rows="5" 
                            placeholder="Jelaskan alasan Anda membutuhkan akses ke tenant ini. Alasan yang jelas akan membantu admin tenant dalam mempertimbangkan permintaan Anda."
                            required>{{ old('request_reason', $existing->request_reason ?? '') }}</textarea>
                        @error('request_reason')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">
                            <i class="fas fa-info-circle me-1"></i>
                            Mohon jelaskan dengan jelas mengapa Anda membutuhkan akses ke tenant ini. 
                            Alasan yang detail akan membantu admin tenant dalam mempertimbangkan permintaan Anda.
                        </div>
                    </div>

                    <div class="alert alert-info">
                        <h6 class="alert-heading">
                            <i class="fas fa-lightbulb me-2"></i>
                            Tips Menulis Alasan yang Baik
                        </h6>
                        <ul class="mb-0 small">
                            <li>Jelaskan tujuan spesifik mengapa Anda membutuhkan akses</li>
                            <li>Sebutkan fitur atau data apa yang akan Anda akses</li>
                            <li>Berikan konteks tentang tugas atau proyek yang sedang Anda kerjakan</li>
                            <li>Jika memungkinkan, sebutkan durasi atau batas waktu akses yang dibutuhkan</li>
                        </ul>
                    </div>

                    <div class="d-flex justify-content-between">
                        <a href="{{ route('admin.super-admin-access.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-paper-plane me-2"></i>
                            Kirim Permintaan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
