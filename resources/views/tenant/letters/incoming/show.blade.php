@extends('layouts.tenant')

@section('title', 'Detail Surat Masuk')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-gradient-primary text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-inbox me-2"></i>Detail Surat Masuk
                        </h3>
                        <div class="btn-group">
                            <a href="{{ tenant_route('letters.incoming.index') }}" class="btn btn-light btn-sm">
                                <i class="fas fa-arrow-left me-1"></i> Kembali
                            </a>
                            <a href="{{ tenant_route('letters.incoming.edit', $surat_masuk) }}" class="btn btn-warning btn-sm">
                                <i class="fas fa-edit me-1"></i> Edit
                            </a>
                            @if($surat_masuk->file_path)
                                <a href="{{ tenant_route('letters.incoming.download', $surat_masuk) }}" class="btn btn-success btn-sm">
                                    <i class="fas fa-download me-1"></i> Download
                                </a>
                            @endif
                            <div class="dropdown">
                                <button class="btn btn-info btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-cog me-1"></i> Aksi
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="updateStatus('diproses')">
                                        <i class="fas fa-play text-warning me-2"></i>Proses Surat
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="updateStatus('selesai')">
                                        <i class="fas fa-check text-success me-2"></i>Selesai
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#dispositionModal">
                                        <i class="fas fa-share text-info me-2"></i>Tambah Disposisi
                                    </a></li>
                                    <li><a class="dropdown-item" href="{{ tenant_route('letters.incoming.activity-logs', $surat_masuk) }}">
                                        <i class="fas fa-history text-secondary me-2"></i>Log Aktivitas
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <th width="150">Nomor Surat:</th>
                                    <td>{{ $surat_masuk->nomor_surat }}</td>
                                </tr>
                                <tr>
                                    <th>Tanggal Terima:</th>
                                    <td>{{ $surat_masuk->formatted_tanggal_terima }}</td>
                                </tr>
                                <tr>
                                    <th>Pengirim:</th>
                                    <td>{{ $surat_masuk->pengirim }}</td>
                                </tr>
                                <tr>
                                    <th>Perihal:</th>
                                    <td>{{ $surat_masuk->perihal }}</td>
                                </tr>
                                <tr>
                                    <th>Status:</th>
                                    <td>
                                        <span class="badge badge-{{ $surat_masuk->status_color }}">
                                            {{ $surat_masuk->status_label }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <th width="150">File Surat:</th>
                                    <td>
                                        @if($surat_masuk->file_path)
                                            <a href="{{ tenant_route('letters.incoming.download', $surat_masuk) }}" 
                                               class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-download"></i> Download
                                            </a>
                                        @else
                                            <span class="text-muted">Tidak ada file</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <th>Lampiran:</th>
                                    <td>
                                        @if($surat_masuk->lampiran && count($surat_masuk->lampiran) > 0)
                                            <ul class="list-unstyled mb-0">
                                                @foreach($surat_masuk->lampiran as $lampiran)
                                                    <li><i class="fas fa-paperclip"></i> {{ $lampiran }}</li>
                                                @endforeach
                                            </ul>
                                        @else
                                            <span class="text-muted">Tidak ada lampiran</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <th>Dibuat Oleh:</th>
                                    <td>{{ $surat_masuk->creator->name ?? 'Tidak diketahui' }}</td>
                                </tr>
                                <tr>
                                    <th>Dibuat Tanggal:</th>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($surat_masuk->created_at, true) }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    @if($surat_masuk->catatan)
                    <div class="row mt-3">
                        <div class="col-12">
                            <h5>Catatan:</h5>
                            <div class="alert alert-info">
                                {{ $surat_masuk->catatan }}
                            </div>
                        </div>
                    </div>
                    @endif

                    @if($surat_masuk->disposisi && count($surat_masuk->disposisi) > 0)
                    <div class="row mt-3">
                        <div class="col-12">
                            <h5>Disposisi:</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Penerima</th>
                                            <th>Catatan</th>
                                            <th>Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($surat_masuk->disposisi as $disposisi)
                                        <tr>
                                            <td>{{ $disposisi['penerima'] }}</td>
                                            <td>{{ $disposisi['catatan'] }}</td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($disposisi['tanggal']) }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Status Update Form -->
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h5>Update Status:</h5>
                            <form action="{{ tenant_route('letters.incoming.status', $surat_masuk) }}" method="POST" class="d-inline">
                                @csrf
                                <div class="input-group">
                                    <select name="status" class="form-control">
                                        <option value="baru" {{ $surat_masuk->status == 'baru' ? 'selected' : '' }}>Baru</option>
                                        <option value="diproses" {{ $surat_masuk->status == 'diproses' ? 'selected' : '' }}>Diproses</option>
                                        <option value="selesai" {{ $surat_masuk->status == 'selesai' ? 'selected' : '' }}>Selesai</option>
                                    </select>
                                    <div class="input-group-append">
                                        <button type="submit" class="btn btn-primary">Update</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- Disposition Modal -->
<div class="modal fade" id="dispositionModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-share me-2"></i>Tambah Disposisi
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ tenant_route('letters.incoming.disposition', $surat_masuk) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="penerima" class="form-label">Penerima Disposisi <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="penerima" name="penerima" required 
                               placeholder="Masukkan nama penerima disposisi">
                    </div>
                    <div class="mb-3">
                        <label for="catatan" class="form-label">Catatan <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="catatan" name="catatan" rows="3" required 
                                  placeholder="Masukkan catatan disposisi"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i>Simpan Disposisi
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Status Update Modal -->
<div class="modal fade" id="statusModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-edit me-2"></i>Update Status Surat
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="statusForm" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="status" class="form-label">Status Baru <span class="text-danger">*</span></label>
                        <select class="form-select" id="status" name="status" required>
                            <option value="baru">Baru</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="status_note" class="form-label">Catatan (Opsional)</label>
                        <textarea class="form-control" id="status_note" name="status_note" rows="3" 
                                  placeholder="Masukkan catatan perubahan status"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i>Update Status
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function updateStatus(status) {
    document.getElementById('status').value = status;
    document.getElementById('statusForm').action = '{{ tenant_route("tenant.letters.incoming.status", $surat_masuk) }}';
    
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

// Auto-refresh page after status update
document.getElementById('statusForm').addEventListener('submit', function() {
    setTimeout(() => {
        location.reload();
    }, 1000);
});
</script>
@endsection
