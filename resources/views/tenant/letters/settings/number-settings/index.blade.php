@extends('layouts.tenant')

@section('title', 'Pengaturan Nomor Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-cog me-2"></i>
                            Pengaturan Nomor Surat
                        </h3>
                        @if(!$setting)
                            <a href="{{ tenant_route('letters.settings.number-settings.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i> Buat Pengaturan
                            </a>
                        @endif
                    </div>
                </div>
                <div class="card-body">
                    @if($setting)
                        <div class="row">
                            <div class="col-md-8">
                                <div class="table-responsive">
                                    <table class="table table-borderless">
                                        <tr>
                                            <th width="200">Format Nomor:</th>
                                            <td>
                                                <code class="fs-5">{{ $setting->format_nomor }}</code>
                                                <button class="btn btn-sm btn-outline-info ms-2" onclick="previewNumber()">
                                                    <i class="fas fa-eye me-1"></i> Preview
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Kode Institusi:</th>
                                            <td>{{ $setting->institusi_code }}</td>
                                        </tr>
                                        <tr>
                                            <th>Reset Tahunan:</th>
                                            <td>
                                                <span class="badge bg-{{ $setting->reset_tahunan ? 'success' : 'secondary' }}">
                                                    {{ $setting->reset_tahunan ? 'Ya' : 'Tidak' }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Nomor Terakhir:</th>
                                            <td>
                                                <span class="badge bg-info">{{ $setting->last_number }}</span>
                                                <button class="btn btn-sm btn-outline-warning ms-2" onclick="resetNumber()">
                                                    <i class="fas fa-undo me-1"></i> Reset
                                                </button>
                                            </td>
                                        </tr>
                                        @if($setting->prefix)
                                        <tr>
                                            <th>Prefix:</th>
                                            <td>{{ $setting->prefix }}</td>
                                        </tr>
                                        @endif
                                        @if($setting->suffix)
                                        <tr>
                                            <th>Suffix:</th>
                                            <td>{{ $setting->suffix }}</td>
                                        </tr>
                                        @endif
                                        <tr>
                                            <th>Terakhir Diupdate:</th>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($setting->updated_at, true) }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Preview Nomor Surat</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="preview-result" class="text-center">
                                            <button class="btn btn-outline-primary" onclick="previewNumber()">
                                                <i class="fas fa-eye me-1"></i> Lihat Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Variabel yang Tersedia</h6>
                                    </div>
                                    <div class="card-body">
                                        <small class="text-muted">
                                            <code>{{NOMOR}}</code> - Nomor urut (3 digit)<br>
                                            <code>{{INSTITUSI}}</code> - Kode institusi<br>
                                            <code>{{BULAN_ROMAWI}}</code> - Bulan dalam angka romawi<br>
                                            <code>{{TAHUN}}</code> - Tahun (4 digit)<br>
                                            <code>{{PREFIX}}</code> - Prefix (jika ada)<br>
                                            <code>{{SUFFIX}}</code> - Suffix (jika ada)
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <a href="{{ tenant_route('letters.settings.number-settings.edit', $setting) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i> Edit Pengaturan
                            </a>
                            <button class="btn btn-danger" onclick="deleteSetting()">
                                <i class="fas fa-trash me-1"></i> Hapus Pengaturan
                            </button>
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-cog fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum Ada Pengaturan Nomor Surat</h5>
                            <p class="text-muted">Buat pengaturan nomor surat untuk mengatur format penomoran otomatis.</p>
                            <a href="{{ tenant_route('letters.settings.number-settings.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i> Buat Pengaturan
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Hapus</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Apakah Anda yakin ingin menghapus pengaturan nomor surat ini?</p>
                <p class="text-danger"><small>Perhatian: Tindakan ini tidak dapat dibatalkan.</small></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <form method="POST" action="{{ tenant_route('letters.settings.number-settings.destroy', $setting) }}" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">Hapus</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function previewNumber() {
    fetch('{{ route("tenant.letters.settings.number-settings.preview") }}')
        .then(response => response.json())
        .then(data => {
            if (data.preview) {
                document.getElementById('preview-result').innerHTML = `
                    <div class="alert alert-info">
                        <strong>Preview:</strong><br>
                        <code class="fs-4">${data.preview}</code>
                    </div>
                `;
            } else {
                document.getElementById('preview-result').innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        Error: ${data.error || 'Gagal mengambil preview'}
                    </div>
                `;
            }
        })
        .catch(error => {
            document.getElementById('preview-result').innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Error: Gagal mengambil preview
                </div>
            `;
        });
}

function resetNumber() {
    if (confirm('Apakah Anda yakin ingin mereset nomor surat ke 0?')) {
        fetch('{{ route("tenant.letters.settings.number-settings.reset", $setting) }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: ' + (data.message || 'Gagal mereset nomor'));
            }
        })
        .catch(error => {
            alert('Error: Gagal mereset nomor');
        });
    }
}

function deleteSetting() {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>
@endsection
