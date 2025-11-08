@extends('errors.layout')

@section('title', '503 - Layanan Tidak Tersedia')

@section('content')
    <div class="error-icon">
        <i class="fas fa-cog fa-spin"></i>
    </div>
    
    <div class="error-code">503</div>
    
    <h1 class="error-title">Layanan Tidak Tersedia</h1>
    
    <p class="error-description">
        Sistem sedang mengalami kelebihan beban atau dalam pemeliharaan. 
        Silakan coba lagi dalam beberapa saat. Terima kasih atas kesabaran Anda.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <button onclick="location.reload()" class="btn btn-primary btn-home">
            <i class="fas fa-redo me-2"></i>
            Coba Lagi
        </button>
        <a href="{{ url('/') }}" class="btn btn-secondary-custom">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-clock me-1"></i>
            Perkiraan waktu pemulihan: 15-30 menit
        </small>
    </div>
@endsection
