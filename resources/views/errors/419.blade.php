@extends('errors.layout')

@section('title', '419 - Sesi Kedaluwarsa')

@section('content')
    <div class="error-icon">
        <i class="fas fa-hourglass-end"></i>
    </div>
    
    <div class="error-code">419</div>
    
    <h1 class="error-title">Sesi Kedaluwarsa</h1>
    
    <p class="error-description">
        Sesi Anda telah berakhir karena tidak ada aktivitas dalam waktu yang lama. 
        Silakan muat ulang halaman untuk melanjutkan aktivitas Anda.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <button onclick="location.reload()" class="btn btn-primary btn-home">
            <i class="fas fa-redo me-2"></i>
            Muat Ulang Halaman
        </button>
        <a href="{{ url('/') }}" class="btn btn-secondary-custom">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-shield-alt me-1"></i>
            Untuk keamanan, sesi akan otomatis kedaluwarsa setelah periode tidak aktif.
        </small>
    </div>
@endsection
