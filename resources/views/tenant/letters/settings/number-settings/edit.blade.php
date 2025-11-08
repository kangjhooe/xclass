@extends('layouts.tenant')

@section('title', 'Edit Pengaturan Nomor Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-edit me-2"></i>
                            Edit Pengaturan Nomor Surat
                        </h3>
                        <a href="{{ tenant_route('letters.settings.number-settings.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form method="POST" action="{{ tenant_route('letters.settings.number-settings.update', $letterNumberSetting) }}">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="format_nomor" class="form-label">Format Nomor Surat <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('format_nomor') is-invalid @enderror" 
                                           id="format_nomor" name="format_nomor" 
                                           value="{{ old('format_nomor', $letterNumberSetting->format_nomor) }}"
                                           placeholder="Contoh: {{NOMOR}}/{{INSTITUSI}}/{{BULAN_ROMAWI}}/{{TAHUN}}">
                                    @error('format_nomor')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">
                                        Gunakan variabel: <code>{{NOMOR}}</code>, <code>{{INSTITUSI}}</code>, <code>{{BULAN_ROMAWI}}</code>, <code>{{TAHUN}}</code>, <code>{{PREFIX}}</code>, <code>{{SUFFIX}}</code>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="institusi_code" class="form-label">Kode Institusi <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('institusi_code') is-invalid @enderror" 
                                           id="institusi_code" name="institusi_code" 
                                           value="{{ old('institusi_code', $letterNumberSetting->institusi_code) }}"
                                           placeholder="Contoh: MTsAF, SMA1, dll" maxlength="10">
                                    @error('institusi_code')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="prefix" class="form-label">Prefix (Opsional)</label>
                                            <input type="text" class="form-control @error('prefix') is-invalid @enderror" 
                                                   id="prefix" name="prefix" 
                                                   value="{{ old('prefix', $letterNumberSetting->prefix) }}"
                                                   placeholder="Contoh: SK, ST, dll" maxlength="50">
                                            @error('prefix')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="suffix" class="form-label">Suffix (Opsional)</label>
                                            <input type="text" class="form-control @error('suffix') is-invalid @enderror" 
                                                   id="suffix" name="suffix" 
                                                   value="{{ old('suffix', $letterNumberSetting->suffix) }}"
                                                   placeholder="Contoh: -A, -B, dll" maxlength="50">
                                            @error('suffix')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="reset_tahunan" name="reset_tahunan" 
                                               value="1" {{ old('reset_tahunan', $letterNumberSetting->reset_tahunan) ? 'checked' : '' }}>
                                        <label class="form-check-label" for="reset_tahunan">
                                            Reset nomor urut setiap tahun
                                        </label>
                                    </div>
                                    <div class="form-text">
                                        Jika dicentang, nomor urut akan direset ke 0 setiap tahun baru.
                                    </div>
                                </div>

                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-1"></i>
                                    <strong>Informasi:</strong> Nomor terakhir saat ini adalah <strong>{{ $letterNumberSetting->last_number }}</strong>. 
                                    Mengubah format tidak akan mempengaruhi nomor yang sudah dibuat sebelumnya.
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Preview Format</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="preview-result" class="text-center">
                                            <button type="button" class="btn btn-outline-primary" onclick="previewFormat()">
                                                <i class="fas fa-eye me-1"></i> Lihat Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Statistik</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row text-center">
                                            <div class="col-6">
                                                <div class="border-end">
                                                    <h4 class="text-primary mb-0">{{ $letterNumberSetting->last_number }}</h4>
                                                    <small class="text-muted">Nomor Terakhir</small>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <h4 class="text-success mb-0">{{ $letterNumberSetting->last_number + 1 }}</h4>
                                                <small class="text-muted">Nomor Berikutnya</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Update Pengaturan
                            </button>
                            <a href="{{ tenant_route('letters.settings.number-settings.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i> Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function previewFormat() {
    const format = document.getElementById('format_nomor').value;
    const institusi = document.getElementById('institusi_code').value || 'INST';
    const prefix = document.getElementById('prefix').value || '';
    const suffix = document.getElementById('suffix').value || '';
    
    if (!format) {
        document.getElementById('preview-result').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Masukkan format nomor terlebih dahulu
            </div>
        `;
        return;
    }
    
    // Generate preview
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // Roman month mapping
    const romanMonths = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
        7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
    };
    
    let preview = format
        .replace(/\{\{NOMOR\}\}/g, '001')
        .replace(/\{\{INSTITUSI\}\}/g, institusi)
        .replace(/\{\{BULAN_ROMAWI\}\}/g, romanMonths[month] || 'I')
        .replace(/\{\{TAHUN\}\}/g, year)
        .replace(/\{\{PREFIX\}\}/g, prefix)
        .replace(/\{\{SUFFIX\}\}/g, suffix);
    
    document.getElementById('preview-result').innerHTML = `
        <div class="alert alert-success">
            <strong>Preview:</strong><br>
            <code class="fs-4">${preview}</code>
        </div>
    `;
}

// Auto preview when format changes
document.getElementById('format_nomor').addEventListener('input', previewFormat);
document.getElementById('institusi_code').addEventListener('input', previewFormat);
document.getElementById('prefix').addEventListener('input', previewFormat);
document.getElementById('suffix').addEventListener('input', previewFormat);

// Initial preview
document.addEventListener('DOMContentLoaded', function() {
    previewFormat();
});
</script>
@endsection
