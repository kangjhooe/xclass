@extends('layouts.tenant')

@section('title', 'Tambah Surat Masuk')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tambah Surat Masuk</h3>
                    <div class="card-tools">
                        <a href="{{ tenant_route('tenant.letters.incoming.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <form action="{{ tenant_route('tenant.letters.incoming.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nomor_surat">Nomor Surat <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('nomor_surat') is-invalid @enderror" 
                                           id="nomor_surat" name="nomor_surat" value="{{ old('nomor_surat') }}" required>
                                    @error('nomor_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="tanggal_terima">Tanggal Terima <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('tanggal_terima') is-invalid @enderror" 
                                           id="tanggal_terima" name="tanggal_terima" value="{{ old('tanggal_terima', date('Y-m-d')) }}" required>
                                    @error('tanggal_terima')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="jenis_surat">Jenis Surat</label>
                                    <select class="form-control @error('jenis_surat') is-invalid @enderror" id="jenis_surat" name="jenis_surat">
                                        <option value="">Pilih Jenis Surat</option>
                                        @foreach(\App\Models\Tenant\IncomingLetter::getJenisSuratOptions() as $value => $label)
                                            <option value="{{ $value }}" {{ old('jenis_surat') == $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('jenis_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="prioritas">Prioritas</label>
                                    <select class="form-control @error('prioritas') is-invalid @enderror" id="prioritas" name="prioritas">
                                        <option value="">Pilih Prioritas</option>
                                        @foreach(\App\Models\Tenant\IncomingLetter::getPrioritasOptions() as $value => $label)
                                            <option value="{{ $value }}" {{ old('prioritas') == $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('prioritas')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="sifat_surat">Sifat Surat</label>
                                    <select class="form-control @error('sifat_surat') is-invalid @enderror" id="sifat_surat" name="sifat_surat">
                                        <option value="">Pilih Sifat Surat</option>
                                        @foreach(\App\Models\Tenant\IncomingLetter::getSifatSuratOptions() as $value => $label)
                                            <option value="{{ $value }}" {{ old('sifat_surat') == $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('sifat_surat')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="status">Status <span class="text-danger">*</span></label>
                                    <select class="form-control @error('status') is-invalid @enderror" id="status" name="status" required>
                                        <option value="baru" {{ old('status') == 'baru' ? 'selected' : '' }}>Baru</option>
                                        <option value="diproses" {{ old('status') == 'diproses' ? 'selected' : '' }}>Diproses</option>
                                        <option value="selesai" {{ old('status') == 'selesai' ? 'selected' : '' }}>Selesai</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="pengirim">Pengirim <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('pengirim') is-invalid @enderror" 
                                   id="pengirim" name="pengirim" value="{{ old('pengirim') }}" required>
                            @error('pengirim')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="perihal">Perihal <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('perihal') is-invalid @enderror" 
                                   id="perihal" name="perihal" value="{{ old('perihal') }}" required>
                            @error('perihal')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="lampiran">Lampiran</label>
                            <div id="lampiran-container">
                                <div class="input-group mb-2">
                                    <input type="text" class="form-control" name="lampiran[]" placeholder="Nama lampiran">
                                    <div class="input-group-append">
                                        <button type="button" class="btn btn-outline-danger" onclick="removeLampiran(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addLampiran()">
                                <i class="fas fa-plus"></i> Tambah Lampiran
                            </button>
                        </div>

                        <div class="form-group">
                            <label for="file_path">File Surat</label>
                            <input type="file" class="form-control @error('file_path') is-invalid @enderror" 
                                   id="file_path" name="file_path" accept=".pdf,.doc,.docx">
                            <small class="form-text text-muted">Format yang diperbolehkan: PDF, DOC, DOCX (Maksimal 10MB)</small>
                            @error('file_path')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="isi_ringkas">Isi Ringkas</label>
                            <textarea class="form-control @error('isi_ringkas') is-invalid @enderror" 
                                      id="isi_ringkas" name="isi_ringkas" rows="3" placeholder="Ringkasan isi surat">{{ old('isi_ringkas') }}</textarea>
                            @error('isi_ringkas')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="tindak_lanjut">Tindak Lanjut</label>
                            <textarea class="form-control @error('tindak_lanjut') is-invalid @enderror" 
                                      id="tindak_lanjut" name="tindak_lanjut" rows="3" placeholder="Tindak lanjut yang diperlukan">{{ old('tindak_lanjut') }}</textarea>
                            @error('tindak_lanjut')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="catatan">Catatan</label>
                            <textarea class="form-control @error('catatan') is-invalid @enderror" 
                                      id="catatan" name="catatan" rows="3">{{ old('catatan') }}</textarea>
                            @error('catatan')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Simpan
                        </button>
                        <a href="{{ tenant_route('tenant.letters.incoming.index') }}" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Batal
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function addLampiran() {
    const container = document.getElementById('lampiran-container');
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <input type="text" class="form-control" name="lampiran[]" placeholder="Nama lampiran">
        <div class="input-group-append">
            <button type="button" class="btn btn-outline-danger" onclick="removeLampiran(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

function removeLampiran(button) {
    button.closest('.input-group').remove();
}
</script>
@endsection
