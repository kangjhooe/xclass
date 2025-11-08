@extends('errors.layout')

@section('title', 'Error - Kesalahan Sistem')

@section('content')
    <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
    </div>
    
    <div class="error-code">{{ $exception->getStatusCode() ?? 'Error' }}</div>
    
    <h1 class="error-title">Terjadi Kesalahan</h1>
    
    <p class="error-description">
        Maaf, terjadi kesalahan yang tidak terduga dalam sistem. 
        Tim teknis telah diberitahu dan sedang bekerja untuk memperbaiki masalah ini.
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
            <i class="fas fa-bug me-1"></i>
            Jika masalah berlanjut, silakan hubungi administrator sistem.
        </small>
    </div>
@endsection
