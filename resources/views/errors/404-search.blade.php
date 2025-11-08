@extends('errors.layout')

@section('title', '404 - Hasil Pencarian Tidak Ditemukan')

@section('content')
    <div class="error-icon">
        <i class="fas fa-search-minus"></i>
    </div>
    
    <div class="error-code">404</div>
    
    <h1 class="error-title">Hasil Pencarian Tidak Ditemukan</h1>
    
    <p class="error-description">
        Maaf, tidak ada hasil yang ditemukan untuk pencarian Anda. 
        Coba gunakan kata kunci yang berbeda atau periksa ejaan kata kunci Anda.
    </p>
    
    <div class="row justify-content-center mt-4">
        <div class="col-md-8">
            <div class="card border-0" style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.1) !important;">
                <div class="card-body">
                    <h6 class="card-title mb-3" style="color: var(--primary-blue);">
                        <i class="fas fa-lightbulb me-2"></i>
                        Tips Pencarian
                    </h6>
                    <ul class="list-unstyled mb-0 small">
                        <li class="mb-2">
                            <i class="fas fa-check me-2" style="color: var(--primary-blue);"></i>
                            Periksa ejaan kata kunci
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check me-2" style="color: var(--primary-blue);"></i>
                            Gunakan kata kunci yang lebih umum
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check me-2" style="color: var(--primary-blue);"></i>
                            Coba gunakan sinonim
                        </li>
                        <li class="mb-0">
                            <i class="fas fa-check me-2" style="color: var(--primary-blue);"></i>
                            Kurangi jumlah kata kunci
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
        <button onclick="history.back()" class="btn btn-primary btn-home">
            <i class="fas fa-arrow-left me-2"></i>
            Kembali ke Pencarian
        </button>
        <a href="{{ url('/') }}" class="btn btn-secondary-custom">
            <i class="fas fa-home me-2"></i>
            Kembali ke Beranda
        </a>
    </div>
    
    <div class="mt-4">
        <small class="text-muted">
            <i class="fas fa-search me-1"></i>
            Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.
        </small>
    </div>
@endsection
