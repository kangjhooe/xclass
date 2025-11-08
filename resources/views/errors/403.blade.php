@extends('errors.layout')

@section('title', '403 - Akses Ditolak')

@section('content')
    <div class="error-icon">
        <i class="fas fa-shield-alt"></i>
    </div>
    
    <div class="error-code">403</div>
    
    <h1 class="error-title">Akses Ditolak</h1>
    
    <p class="error-description">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
        Jika Anda yakin seharusnya memiliki akses, silakan hubungi administrator.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <a href="{{ url('/') }}" class="btn btn-primary btn-home">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
        @if(Auth::check())
            <a href="{{ route('admin.dashboard') }}" class="btn btn-secondary-custom">
                <i class="fas fa-tachometer-alt me-2"></i>
                Dashboard
            </a>
        @else
            <a href="{{ route('login') }}" class="btn btn-secondary-custom">
                <i class="fas fa-sign-in-alt me-2"></i>
                Masuk
            </a>
        @endif
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-exclamation-triangle me-1"></i>
            Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.
        </small>
    </div>
@endsection
