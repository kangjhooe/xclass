@extends('errors.layout')

@section('title', '500 - Server Error')

@section('content')
    <div class="error-icon">
        <i class="fas fa-tools"></i>
    </div>
    
    <div class="error-code">500</div>
    
    <h1 class="error-title">Server Sedang Bermasalah</h1>
    
    <p class="error-description">
        Ups! Server kami sedang mengalami gangguan teknis. Tim developer kami telah diberitahu 
        dan sedang bekerja keras untuk memperbaiki masalah ini. Silakan coba lagi dalam beberapa saat.
    </p>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <a href="{{ url('/') }}" class="btn btn-primary btn-home">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
        <button onclick="location.reload()" class="btn btn-secondary-custom">
            <i class="fas fa-redo me-2"></i>
            Coba Lagi
        </button>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Jika masalah berlanjut, silakan hubungi administrator sistem atau coba lagi nanti.
        </small>
    </div>
@endsection
