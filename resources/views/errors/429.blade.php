@extends('errors.layout')

@section('title', '429 - Terlalu Banyak Permintaan')

@section('content')
    <div class="error-icon">
        <i class="fas fa-tachometer-alt"></i>
    </div>
    
    <div class="error-code">429</div>
    
    <h1 class="error-title">Terlalu Banyak Permintaan</h1>
    
    <p class="error-description">
        Anda telah melakukan terlalu banyak permintaan dalam waktu singkat. 
        Silakan tunggu sebentar sebelum mencoba lagi untuk melindungi server kami.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <button onclick="setTimeout(() => location.reload(), 30000)" class="btn btn-primary btn-home">
            <i class="fas fa-clock me-2"></i>
            Coba Lagi (30 detik)
        </button>
        <a href="{{ url('/') }}" class="btn btn-secondary-custom">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Batas: 60 permintaan per menit. Silakan tunggu sebelum mencoba lagi.
        </small>
    </div>
@endsection
