@extends('layouts.tenant')

@section('title', 'Surat Keluar')
@section('page-title', 'Surat Keluar')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-paper-plane me-3"></i>
                Daftar Surat Keluar
            </h2>
            <p>Kelola surat keluar sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                <a href="{{ tenant_route('tenant.letters.outgoing.export', request()->query()) }}" 
                   class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-file-excel me-2"></i> Export Excel
                </a>
                <a href="{{ tenant_route('tenant.letters.outgoing.print', request()->query()) }}" 
                   class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-print me-2"></i> Cetak PDF
                </a>
                <a href="{{ tenant_route('tenant.letters.outgoing.create') }}" 
                   class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Tambah
                </a>
            </div>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Surat Keluar
        </h5>
    </div>
    <div class="card-body">
        <!-- Filter Form -->
        <div class="filter-card mb-3">
                        <form method="GET" class="row g-3">
                            <div class="col-md-3">
                                <label for="search" class="form-label fw-bold">Pencarian</label>
                                <input type="text" class="form-control" id="search" name="search" 
                                       value="{{ request('search') }}" 
                                       placeholder="Nomor surat, tujuan, atau perihal">
                            </div>
                            <div class="col-md-2">
                                <label for="status" class="form-label fw-bold">Status</label>
                                <select class="form-select" id="status" name="status">
                                    <option value="">Semua Status</option>
                                    <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                    <option value="menunggu_ttd" {{ request('status') == 'menunggu_ttd' ? 'selected' : '' }}>Menunggu TTD</option>
                                    <option value="terkirim" {{ request('status') == 'terkirim' ? 'selected' : '' }}>Terkirim</option>
                                    <option value="arsip" {{ request('status') == 'arsip' ? 'selected' : '' }}>Arsip</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="jenis_surat" class="form-label fw-bold">Jenis Surat</label>
                                <select class="form-select" id="jenis_surat" name="jenis_surat">
                                    <option value="">Semua Jenis</option>
                                    @foreach(\App\Models\Tenant\OutgoingLetter::getJenisSuratOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ request('jenis_surat') == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="prioritas" class="form-label fw-bold">Prioritas</label>
                                <select class="form-select" id="prioritas" name="prioritas">
                                    <option value="">Semua Prioritas</option>
                                    @foreach(\App\Models\Tenant\OutgoingLetter::getPrioritasOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ request('prioritas') == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="start_date" class="form-label fw-bold">Tanggal Mulai</label>
                                <input type="date" class="form-control" id="start_date" name="start_date" 
                                       value="{{ request('start_date') }}">
                            </div>
                            <div class="col-md-2">
                                <label for="end_date" class="form-label fw-bold">Tanggal Akhir</label>
                                <input type="date" class="form-control" id="end_date" name="end_date" 
                                       value="{{ request('end_date') }}">
                            </div>
                            <div class="col-md-12">
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-modern btn-primary">
                                        <i class="fas fa-search me-2"></i> Filter
                                    </button>
                                    <a href="{{ tenant_route('tenant.letters.outgoing.index') }}" class="btn btn-modern btn-secondary">
                                        <i class="fas fa-times me-2"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Table -->
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th width="5%">No</th>
                                    <th width="15%">Nomor Surat</th>
                                    <th width="12%">Tanggal Surat</th>
                                    <th width="15%">Tujuan</th>
                                    <th width="20%">Perihal</th>
                                    <th width="10%">Jenis</th>
                                    <th width="8%">Prioritas</th>
                                    <th width="8%">Status</th>
                                    <th width="7%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($letters as $letter)
                                <tr>
                                    <td class="text-center">{{ $letters->firstItem() + $loop->index }}</td>
                                    <td>
                                        <strong>{{ $letter->nomor_surat }}</strong>
                                        @if($letter->file_path)
                                            <br><small class="text-muted">
                                                <i class="fas fa-paperclip"></i> Ada lampiran
                                            </small>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($letter->tanggal_surat) }}</td>
                                    <td>{{ $letter->tujuan }}</td>
                                    <td>
                                        <div class="text-truncate" style="max-width: 200px;" title="{{ $letter->perihal }}">
                                            {{ $letter->perihal }}
                                        </div>
                                        @if($letter->isi_ringkas)
                                            <br><small class="text-muted">{{ Str::limit($letter->isi_ringkas, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge-modern bg-info">{{ $letter->jenis_surat ?? '-' }}</span>
                                    </td>
                                    <td>
                                        <span class="badge-modern bg-{{ $letter->prioritas_color }}">
                                            {{ $letter->prioritas_label ?? '-' }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge-modern bg-{{ $letter->status_color }}">
                                            {{ $letter->status_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="{{ tenant_route('tenant.letters.outgoing.show', $letter) }}" 
                                               class="btn btn-modern btn-primary btn-sm" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.letters.outgoing.edit', $letter) }}" 
                                               class="btn btn-modern btn-warning btn-sm" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            @if($letter->file_path)
                                                <a href="{{ tenant_route('tenant.letters.outgoing.download', $letter) }}" 
                                                   class="btn btn-modern btn-success btn-sm" title="Download">
                                                    <i class="fas fa-download"></i>
                                                </a>
                                            @endif
                                            <a href="{{ tenant_route('tenant.letters.outgoing.activity-logs', $letter) }}" 
                                               class="btn btn-modern btn-info btn-sm" title="Log Aktivitas">
                                                <i class="fas fa-history"></i>
                                            </a>
                                            <form action="{{ tenant_route('tenant.letters.outgoing.destroy', $letter) }}" 
                                                  method="POST" class="d-inline" 
                                                  onsubmit="return confirm('Apakah Anda yakin ingin menghapus surat ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="9" class="text-center py-5">
                                        <div class="text-muted">
                                            <i class="fas fa-paper-plane fa-3x mb-3" style="opacity: 0.3;"></i>
                                            <p>Tidak ada surat keluar</p>
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($letters->hasPages())
                        <div class="card-footer">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="text-muted">
                                    Menampilkan {{ $letters->firstItem() }} sampai {{ $letters->lastItem() }} 
                                    dari {{ $letters->total() }} data
                                </div>
                                <div>
                                    {{ $letters->links() }}
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
@endsection