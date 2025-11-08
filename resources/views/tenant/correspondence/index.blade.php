@extends('layouts.tenant')

@section('title', 'Persuratan')
@section('page-title', 'Persuratan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-envelope me-2"></i>
                        Manajemen Persuratan
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('correspondence.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Surat
                                </a>
                                <a href="{{ tenant_route('correspondence.incoming') }}" class="btn btn-info">
                                    <i class="fas fa-inbox me-1"></i>
                                    Surat Masuk
                                </a>
                                <a href="{{ tenant_route('correspondence.outgoing') }}" class="btn btn-success">
                                    <i class="fas fa-paper-plane me-1"></i>
                                    Surat Keluar
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari surat...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_incoming'] }}</h4>
                                            <small>Surat Masuk</small>
                                        </div>
                                        <i class="fas fa-inbox fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['total_outgoing'] }}</h4>
                                            <small>Surat Keluar</small>
                                        </div>
                                        <i class="fas fa-paper-plane fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['this_month_incoming'] }}</h4>
                                            <small>Masuk Bulan Ini</small>
                                        </div>
                                        <i class="fas fa-calendar fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $stats['this_month_outgoing'] }}</h4>
                                            <small>Keluar Bulan Ini</small>
                                        </div>
                                        <i class="fas fa-archive fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Surat Masuk Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentIncoming as $letter)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $letter->letter_number }}</h6>
                                            <small class="text-muted">{{ $letter->sender }}</small>
                                        </div>
                                        <div>
                                            @if($letter->status == 'new')
                                                <span class="badge bg-primary">Baru</span>
                                            @elseif($letter->status == 'processed')
                                                <span class="badge bg-success">Diproses</span>
                                            @else
                                                <span class="badge bg-secondary">Diarsipkan</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada surat masuk</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Surat Keluar Terbaru</h6>
                                </div>
                                <div class="card-body">
                                    @forelse($recentOutgoing as $letter)
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">{{ $letter->letter_number }}</h6>
                                            <small class="text-muted">{{ $letter->recipient }}</small>
                                        </div>
                                        <div>
                                            @if($letter->status == 'draft')
                                                <span class="badge bg-warning">Draft</span>
                                            @elseif($letter->status == 'sent')
                                                <span class="badge bg-success">Terkirim</span>
                                            @else
                                                <span class="badge bg-info">Terkirim</span>
                                            @endif
                                        </div>
                                    </div>
                                    @empty
                                    <p class="text-muted text-center">Belum ada surat keluar</p>
                                    @endforelse
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
