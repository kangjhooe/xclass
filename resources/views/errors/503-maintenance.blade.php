@extends('errors.layout')

@section('title', '503 - Pemeliharaan Sistem')

@section('content')
    <div class="error-icon">
        <i class="fas fa-hammer"></i>
    </div>
    
    <div class="error-code">503</div>
    
    <h1 class="error-title">Sistem Sedang Dipelihara</h1>
    
    <p class="error-description">
        Kami sedang melakukan pemeliharaan sistem untuk memberikan pengalaman yang lebih baik. 
        Sistem akan kembali online dalam waktu singkat.
    </p>
    
    <div class="row justify-content-center mt-4">
        <div class="col-md-8">
            <div class="card border-0" style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.1) !important;">
                <div class="card-body text-center">
                    <h5 class="card-title" style="color: var(--primary-blue);">
                        <i class="fas fa-info-circle me-2"></i>
                        Informasi Pemeliharaan
                    </h5>
                    <p class="card-text mb-0">
                        <strong>Waktu Mulai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }} WIB<br>
                        <strong>Perkiraan Selesai:</strong> {{ \App\Helpers\DateHelper::formatIndonesian(now()->addHours(2), true) }} WIB
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
        <button onclick="location.reload()" class="btn btn-primary btn-home">
            <i class="fas fa-redo me-2"></i>
            Periksa Status
        </button>
        <a href="mailto:admin@class.com" class="btn btn-secondary-custom">
            <i class="fas fa-envelope me-2"></i>
            Hubungi Admin
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-heart me-1"></i>
            Terima kasih atas kesabaran Anda selama pemeliharaan sistem.
        </small>
    </div>
@endsection
