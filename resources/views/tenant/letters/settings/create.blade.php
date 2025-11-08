@extends('layouts.tenant')

@section('title', 'Tambah Pengaturan Nomor Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tambah Pengaturan Nomor Surat</h3>
                    <div class="card-tools">
                        <a href="{{ tenant_route('tenant.letters.settings.number-settings.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <form action="{{ tenant_route('tenant.letters.settings.number-settings.store') }}" method="POST">
                    @csrf
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="jenis_surat">Jenis Surat <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('jenis_surat') is-invalid @enderror" 
                                           id="jenis_surat" name="jenis_surat" value="{{ old('jenis_surat') }}" required>
                                    @error('jenis_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="kode_lembaga">Kode Lembaga</label>
                                    <input type="text" class="form-control @error('kode_lembaga') is-invalid @enderror" 
                                           id="kode_lembaga" name="kode_lembaga" value="{{ old('kode_lembaga', 'SCH') }}" 
                                           placeholder="Contoh: SCH, MAD, dll">
                                    @error('kode_lembaga')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="format_nomor">Format Nomor <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('format_nomor') is-invalid @enderror" 
                                   id="format_nomor" name="format_nomor" value="{{ old('format_nomor') }}" 
                                   placeholder="Contoh: {counter}/{kode_lembaga}/{bulan_romawi}/{tahun}" required>
                            <small class="form-text text-muted">
                                Gunakan placeholder: {counter}, {bulan_romawi}, {tahun}, {bulan}, {tanggal}, {kode_lembaga}
                            </small>
                            @error('format_nomor')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label>Preview Format</label>
                            <div class="alert alert-info" id="format-preview">
                                <i class="fas fa-info-circle"></i> 
                                Preview akan muncul setelah Anda mengisi format nomor
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nomor_terakhir">Nomor Terakhir <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('nomor_terakhir') is-invalid @enderror" 
                                           id="nomor_terakhir" name="nomor_terakhir" value="{{ old('nomor_terakhir', 0) }}" 
                                           min="0" required>
                                    @error('nomor_terakhir')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="reset_tahunan">Reset Tahunan</label>
                                    <select class="form-control @error('reset_tahunan') is-invalid @enderror" 
                                            id="reset_tahunan" name="reset_tahunan" required>
                                        <option value="1" {{ old('reset_tahunan', '1') == '1' ? 'selected' : '' }}>Ya</option>
                                        <option value="0" {{ old('reset_tahunan') == '0' ? 'selected' : '' }}>Tidak</option>
                                    </select>
                                    @error('reset_tahunan')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="deskripsi">Deskripsi</label>
                            <textarea class="form-control @error('deskripsi') is-invalid @enderror" 
                                      id="deskripsi" name="deskripsi" rows="3" 
                                      placeholder="Deskripsi pengaturan nomor surat">{{ old('deskripsi') }}</textarea>
                            @error('deskripsi')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Available Placeholders -->
                        <div class="form-group">
                            <label>Placeholder yang Tersedia</label>
                            <div class="row">
                                @foreach($availablePlaceholders as $placeholder => $description)
                                <div class="col-md-6 mb-2">
                                    <div class="card">
                                        <div class="card-body p-2">
                                            <code>{{ $placeholder }}</code>
                                            <br><small class="text-muted">{{ $description }}</small>
                                        </div>
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Simpan
                        </button>
                        <a href="{{ tenant_route('tenant.letters.settings.number-settings.index') }}" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Batal
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const formatInput = document.getElementById('format_nomor');
    const kodeLembagaInput = document.getElementById('kode_lembaga');
    const previewDiv = document.getElementById('format-preview');

    function updatePreview() {
        const format = formatInput.value;
        const kodeLembaga = kodeLembagaInput.value || 'SCH';
        
        if (format) {
            const bulanRomawi = {
                1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
                7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
            };

            const replacements = {
                '{counter}': '001',
                '{bulan_romawi}': bulanRomawi[new Date().getMonth() + 1],
                '{tahun}': new Date().getFullYear(),
                '{bulan}': String(new Date().getMonth() + 1).padStart(2, '0'),
                '{tanggal}': String(new Date().getDate()).padStart(2, '0'),
                '{kode_lembaga}': kodeLembaga,
            };

            let preview = format;
            Object.keys(replacements).forEach(placeholder => {
                preview = preview.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacements[placeholder]);
            });

            previewDiv.innerHTML = `<i class="fas fa-info-circle"></i> Preview: <code>${preview}</code>`;
        } else {
            previewDiv.innerHTML = '<i class="fas fa-info-circle"></i> Preview akan muncul setelah Anda mengisi format nomor';
        }
    }

    formatInput.addEventListener('input', updatePreview);
    kodeLembagaInput.addEventListener('input', updatePreview);
    
    // Initial preview
    updatePreview();
});
</script>
@endsection