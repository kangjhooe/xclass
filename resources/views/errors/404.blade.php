@extends('errors.layout')

@section('title', '404 - Halaman Tidak Ditemukan')

@section('content')
    <div class="error-icon">
        <i class="fas fa-search-location"></i>
    </div>
    
    <div class="error-code">404</div>
    
    <h1 class="error-title">Halaman Tidak Ditemukan</h1>
    
    <p class="error-description">
        Oops! Sepertinya halaman yang Anda cari telah tersesat di dunia digital. 
        Jangan khawatir, mari kita bawa Anda kembali ke tempat yang tepat.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <a href="{{ url('/') }}" class="btn btn-primary btn-home">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
        <button onclick="history.back()" class="btn btn-secondary-custom">
            <i class="fas fa-arrow-left me-2"></i>
            Kembali Sebelumnya
        </button>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-lightbulb me-1"></i>
            Tips: Periksa kembali URL atau gunakan menu navigasi untuk menemukan halaman yang Anda cari.
        </small>
    </div>
@endsection
