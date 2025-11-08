@extends('errors.layout')

@section('title', '502 - Bad Gateway')

@section('content')
    <div class="error-icon">
        <i class="fas fa-network-wired"></i>
    </div>
    
    <div class="error-code">502</div>
    
    <h1 class="error-title">Gateway Bermasalah</h1>
    
    <p class="error-description">
        Server mengalami masalah komunikasi dengan server backend. 
        Ini biasanya masalah sementara yang akan segera diperbaiki.
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
            <i class="fas fa-tools me-1"></i>
            Jika masalah berlanjut, silakan hubungi administrator sistem.
        </small>
    </div>
@endsection
