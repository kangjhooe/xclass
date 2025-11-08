@extends('layouts.tenant')

@section('title', 'Detail Kartu')
@section('page-title', 'Detail Kartu')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Detail Kartu
            </h2>
            <p>Informasi lengkap tentang kartu tanda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi Kartu
                </h5>
            </div>
            <div class="card-body">
                <div class="info-card">
                    <div class="info-item">
                        <label>Jenis Kartu</label>
                        <p>
                            @if($card->card_type == 'student')
                                <span class="badge-modern bg-primary">Kartu Tanda Siswa</span>
                            @elseif($card->card_type == 'teacher')
                                <span class="badge-modern bg-success">Kartu Tanda Pegawai (Guru)</span>
                            @else
                                <span class="badge-modern bg-info">Kartu Tanda Pegawai (Staf)</span>
                            @endif
                        </p>
                    </div>
                    
                    <div class="info-item">
                        <label>Nama</label>
                        <p><strong>{{ $card->cardable->name ?? '-' }}</strong></p>
                    </div>
                    
                    <div class="info-item">
                        <label>Identitas</label>
                        <p>
                            @if($card->card_type == 'student')
                                NISN: {{ $card->cardable->nisn ?? '-' }}
                            @else
                                NIK: {{ $card->cardable->nik ?? '-' }}
                            @endif
                        </p>
                    </div>
                    
                    <div class="info-item">
                        <label>Barcode</label>
                        <p><code>{{ $card->barcode }}</code></p>
                    </div>
                    
                    <div class="info-item">
                        <label>Template</label>
                        <p>{{ $card->template->name ?? '-' }}</p>
                    </div>
                    
                    <div class="info-item">
                        <label>Tanggal Terbit</label>
                        <p>{{ $card->issued_at ? $card->issued_at->format('d-m-Y H:i') : '-' }}</p>
                    </div>
                </div>
                
                @if($card->image_path)
                <div class="mt-4">
                    <label class="fw-semibold mb-2">Gambar Kartu</label>
                    <div>
                        <img src="{{ asset('storage/' . $card->image_path) }}" alt="Kartu" class="img-fluid rounded" style="max-width: 600px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    </div>
                </div>
                @endif
            </div>
            <div class="card-footer">
                <div class="d-flex justify-content-between">
                    <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-modern btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali
                    </a>
                    <div class="d-flex gap-2">
                        @if($card->image_path)
                            <a href="{{ tenant_route('tenant.cards.download', $card) }}" class="btn btn-modern btn-success">
                                <i class="fas fa-download me-2"></i>
                                Download
                            </a>
                        @endif
                        <form action="{{ tenant_route('tenant.cards.regenerate', $card) }}" method="POST" class="d-inline">
                            @csrf
                            <button type="submit" class="btn btn-modern btn-warning" onclick="return confirm('Yakin ingin membuat ulang kartu ini?')">
                                <i class="fas fa-redo me-2"></i>
                                Buat Ulang
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

