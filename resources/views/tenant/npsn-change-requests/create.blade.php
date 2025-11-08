@extends('layouts.tenant')

@section('title', 'Ajukan Perubahan NPSN')
@section('page-title', 'Ajukan Perubahan NPSN')

@include('components.tenant-modern-styles')

@section('content')
@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Ajukan Perubahan NPSN
            </h2>
            <p>NPSN Saat Ini: <strong>{{ $tenant->npsn }}</strong></p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('npsn-change-requests.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<!-- Info Box -->
<div class="card-modern fade-in-up fade-in-up-delay-5 mb-3" style="background: #f8f9fa; border-left: 4px solid #667eea;">
    <div class="card-body">
        <h6 class="mb-3" style="font-weight: 600;">
            <i class="fas fa-info-circle me-2 text-primary"></i>
            Informasi Penting
        </h6>
        <ul class="mb-0 small">
            <li>Perubahan NPSN harus disetujui oleh super admin</li>
            <li>NPSN baru harus berbeda dengan NPSN saat ini</li>
            <li>NPSN baru harus terdiri dari 8 digit angka</li>
            <li>NPSN baru tidak boleh sudah digunakan oleh tenant lain</li>
            <li>Setelah disetujui, NPSN akan langsung berubah</li>
        </ul>
    </div>
</div>

<!-- Form Card -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Pengajuan Perubahan NPSN
        </h5>
    </div>
    <div class="card-body p-4">
        <form action="{{ tenant_route('npsn-change-requests.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="current_npsn" class="form-label">
                    <i class="fas fa-id-card me-2"></i>
                    NPSN Saat Ini
                </label>
                <input type="text" 
                       class="form-control" 
                       id="current_npsn" 
                       value="{{ $tenant->npsn }}" 
                       readonly
                       style="background-color: #f8f9fa;">
            </div>
            
            <div class="mb-4">
                <label for="requested_npsn" class="form-label">
                    <i class="fas fa-id-card me-2"></i>
                    NPSN Baru <span class="text-danger">*</span>
                </label>
                <input type="text" 
                       class="form-control @error('requested_npsn') is-invalid @enderror" 
                       id="requested_npsn" 
                       name="requested_npsn" 
                       value="{{ old('requested_npsn') }}"
                       placeholder="Masukkan 8 digit NPSN baru"
                       maxlength="8"
                       pattern="[0-9]{8}"
                       required>
                @error('requested_npsn')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
                <div class="form-text">
                    <i class="fas fa-info-circle me-1"></i>
                    Masukkan 8 digit angka NPSN baru
                </div>
            </div>
            
            <div class="mb-4">
                <label for="reason" class="form-label">
                    <i class="fas fa-comment-alt me-2"></i>
                    Alasan Perubahan <span class="text-danger">*</span>
                </label>
                <textarea class="form-control @error('reason') is-invalid @enderror" 
                          id="reason" 
                          name="reason" 
                          rows="5"
                          placeholder="Jelaskan alasan mengapa NPSN perlu diubah..."
                          required>{{ old('reason') }}</textarea>
                @error('reason')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
                <div class="form-text">
                    <i class="fas fa-info-circle me-1"></i>
                    Maksimal 1000 karakter
                </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                <a href="{{ tenant_route('npsn-change-requests.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>
                    Batal
                </a>
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-paper-plane me-2"></i>
                    Kirim Pengajuan
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    // Format NPSN input (only numbers, max 8 digits)
    document.getElementById('requested_npsn').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
    });
</script>
@endpush
@endsection

