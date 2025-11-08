@extends('errors.layout')

@section('title', '401 - Tidak Terotorisasi')

@section('content')
    <div class="error-icon">
        <i class="fas fa-user-lock"></i>
    </div>
    
    <div class="error-code">401</div>
    
    <h1 class="error-title">Akses Terbatas</h1>
    
    <p class="error-description">
        Halaman ini memerlukan autentikasi. Silakan masuk dengan akun Anda 
        untuk mengakses konten yang dilindungi.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <a href="{{ route('login') }}" class="btn btn-primary btn-home">
            <i class="fas fa-sign-in-alt me-2"></i>
            Masuk Sekarang
        </a>
        <a href="{{ url('/') }}" class="btn btn-secondary-custom">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-user-plus me-1"></i>
            Belum memiliki akun? <a href="{{ route('register') }}" class="text-decoration-none fw-bold">Daftar di sini</a>
        </small>
    </div>
@endsection
