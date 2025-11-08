@extends('layouts.tenant')

@section('title', 'Kartu Tanda')
@section('page-title', 'Kartu Tanda')

@include('components.tenant-modern-styles')

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Kartu Tanda
            </h2>
            <p>Kelola kartu tanda siswa, guru, dan staf</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                <a href="{{ tenant_route('tenant.cards.templates.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-palette me-2"></i> Template
                </a>
                <a href="{{ tenant_route('tenant.cards.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Buat Kartu Baru
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Filter Section -->
<div class="filter-card fade-in-up fade-in-up-delay-5 mb-3">
    <form method="GET" action="{{ tenant_route('tenant.cards.index') }}">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Jenis Kartu</label>
                            <select name="card_type" class="form-select">
                                <option value="">Semua</option>
                                <option value="student" {{ request('card_type') == 'student' ? 'selected' : '' }}>Siswa</option>
                                <option value="teacher" {{ request('card_type') == 'teacher' ? 'selected' : '' }}>Guru</option>
                                <option value="staff" {{ request('card_type') == 'staff' ? 'selected' : '' }}>Staf</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Cari</label>
                            <input type="text" name="search" class="form-control" placeholder="Cari nama, NISN/NIK, atau barcode..." value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-modern btn-primary me-2">
                                <i class="fas fa-search me-2"></i>
                                Cari
                            </button>
                            <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-modern btn-secondary">
                                <i class="fas fa-redo me-2"></i>
                                Reset
                            </a>
                        </div>
                    </div>
                </form>
</div>

<!-- Cards List -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Kartu Tanda
        </h5>
    </div>
    <div class="card-body">
                @if($cards->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Jenis</th>
                                    <th>Nama</th>
                                    <th>Identitas</th>
                                    <th>Barcode</th>
                                    <th>Template</th>
                                    <th>Tanggal Terbit</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($cards as $card)
                                    <tr>
                                        <td>
                                            @if($card->card_type == 'student')
                                                <span class="badge-modern bg-primary">Siswa</span>
                                            @elseif($card->card_type == 'teacher')
                                                <span class="badge-modern bg-success">Guru</span>
                                            @else
                                                <span class="badge-modern bg-info">Staf</span>
                                            @endif
                                        </td>
                                        <td>{{ $card->cardable->name ?? '-' }}</td>
                                        <td>
                                            @if($card->card_type == 'student')
                                                {{ $card->cardable->nisn ?? '-' }}
                                            @else
                                                {{ $card->cardable->nik ?? '-' }}
                                            @endif
                                        </td>
                                        <td><code>{{ $card->barcode }}</code></td>
                                        <td>{{ $card->template->name ?? '-' }}</td>
                                        <td>{{ $card->issued_at ? $card->issued_at->format('d-m-Y') : '-' }}</td>
                                        <td>
                                            <div class="d-flex gap-2">
                                                <a href="{{ tenant_route('tenant.cards.show', $card) }}" class="btn btn-modern btn-primary btn-sm" title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.cards.download', $card) }}" class="btn btn-modern btn-success btn-sm" title="Download">
                                                    <i class="fas fa-download"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.cards.regenerate', $card) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-modern btn-warning btn-sm" title="Regenerate" onclick="return confirm('Yakin ingin membuat ulang kartu ini?')">
                                                        <i class="fas fa-redo"></i>
                                                    </button>
                                                </form>
                                                <form action="{{ tenant_route('tenant.cards.destroy', $card) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus" onclick="return confirm('Yakin ingin menghapus kartu ini?')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="card-footer">
                        {{ $cards->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <div class="text-muted">
                            <i class="fas fa-id-card fa-3x mb-3" style="opacity: 0.3;"></i>
                            <p class="text-muted">Belum ada kartu yang dibuat</p>
                            <a href="{{ tenant_route('tenant.cards.create') }}" class="btn btn-modern btn-primary">
                                <i class="fas fa-plus me-2"></i>
                                Buat Kartu Pertama
                            </a>
                        </div>
                    </div>
                @endif
            </div>
        </div>
@endsection

