@extends('layouts.tenant')

@section('title', 'Import Data Siswa')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Import Data Siswa dari Excel</h3>
                    <div class="card-tools">
                        <a href="{{ tenant_route('students.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            {{ session('error') }}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    @endif

                    @if(session('import_errors'))
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Beberapa data tidak dapat diimpor:</strong>
                            <ul class="mb-0 mt-2">
                                @foreach(session('import_errors') as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    @endif

                    <div class="row">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title">Upload File Excel</h5>
                                </div>
                                <div class="card-body">
                                    <form action="{{ tenant_route('students.import') }}" method="POST" enctype="multipart/form-data">
                                        @csrf
                                        <div class="form-group">
                                            <label for="file">Pilih File Excel</label>
                                            <div class="input-group">
                                                <div class="custom-file">
                                                    <input type="file" class="custom-file-input @error('file') is-invalid @enderror" 
                                                           id="file" name="file" accept=".xlsx,.xls,.csv" required>
                                                    <label class="custom-file-label" for="file">Pilih file...</label>
                                                </div>
                                            </div>
                                            @error('file')
                                                <div class="invalid-feedback d-block">{{ $message }}</div>
                                            @enderror
                                            <small class="form-text text-muted">
                                                Format yang didukung: .xlsx, .xls, .csv (Maksimal 10MB)
                                            </small>
                                        </div>

                                        <div class="form-group">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-upload"></i> Import Data
                                            </button>
                                            <a href="{{ tenant_route('students.template.download') }}" class="btn btn-success">
                                                <i class="fas fa-download"></i> Download Template
                                            </a>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title">Panduan Import</h5>
                                </div>
                                <div class="card-body">
                                    <h6>Langkah-langkah:</h6>
                                    <ol>
                                        <li>Download template Excel</li>
                                        <li>Isi data siswa sesuai template</li>
                                        <li>Upload file yang sudah diisi</li>
                                        <li>Periksa hasil import</li>
                                    </ol>

                                    <h6 class="mt-3">Format Data:</h6>
                                    <ul>
                                        <li><strong>Tanggal:</strong> DD-MM-YYYY atau DD/MM/YYYY</li>
                                        <li><strong>Jenis Kelamin:</strong> L atau P</li>
                                        <li><strong>Kelas:</strong> Nama kelas yang sudah ada</li>
                                        <li><strong>Penghasilan:</strong> Angka tanpa titik atau koma</li>
                                    </ul>

                                    <h6 class="mt-3">Field Wajib:</h6>
                                    <ul>
                                        <li>Nama Lengkap</li>
                                        <li>Jenis Kelamin</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title">Daftar Field yang Tersedia</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <h6>Data Pribadi</h6>
                                            <ul class="list-unstyled">
                                                <li>• nama_lengkap</li>
                                                <li>• email</li>
                                                <li>• nomor_telepon</li>
                                                <li>• tanggal_lahir</li>
                                                <li>• tempat_lahir</li>
                                                <li>• jenis_kelamin</li>
                                                <li>• agama</li>
                                                <li>• nik</li>
                                                <li>• nisn</li>
                                                <li>• nomor_induk_siswa</li>
                                                <li>• kelas</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Data Alamat</h6>
                                            <ul class="list-unstyled">
                                                <li>• alamat</li>
                                                <li>• rt</li>
                                                <li>• rw</li>
                                                <li>• desa_kelurahan</li>
                                                <li>• kecamatan</li>
                                                <li>• kabupaten_kota</li>
                                                <li>• kota</li>
                                                <li>• provinsi</li>
                                                <li>• kode_pos</li>
                                                <li>• jenis_tempat_tinggal</li>
                                                <li>• alat_transportasi</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Data Orang Tua</h6>
                                            <ul class="list-unstyled">
                                                <li>• nama_ayah</li>
                                                <li>• nik_ayah</li>
                                                <li>• tanggal_lahir_ayah</li>
                                                <li>• tempat_lahir_ayah</li>
                                                <li>• pendidikan_ayah</li>
                                                <li>• pekerjaan_ayah</li>
                                                <li>• perusahaan_ayah</li>
                                                <li>• telepon_ayah</li>
                                                <li>• email_ayah</li>
                                                <li>• penghasilan_ayah</li>
                                                <li>• nama_ibu (dan field serupa)</li>
                                                <li>• nama_wali (dan field serupa)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-4">
                                            <h6>Data Sekolah Sebelumnya</h6>
                                            <ul class="list-unstyled">
                                                <li>• sekolah_sebelumnya</li>
                                                <li>• alamat_sekolah_sebelumnya</li>
                                                <li>• kota_sekolah_sebelumnya</li>
                                                <li>• provinsi_sekolah_sebelumnya</li>
                                                <li>• telepon_sekolah_sebelumnya</li>
                                                <li>• kepala_sekolah_sebelumnya</li>
                                                <li>• tahun_lulus_sekolah_sebelumnya</li>
                                                <li>• nomor_ijazah_sekolah_sebelumnya</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Data Kesehatan</h6>
                                            <ul class="list-unstyled">
                                                <li>• tinggi_badan</li>
                                                <li>• berat_badan</li>
                                                <li>• kondisi_kesehatan</li>
                                                <li>• catatan_kesehatan</li>
                                                <li>• alergi</li>
                                                <li>• obat_obatan</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Data Akademik & Darurat</h6>
                                            <ul class="list-unstyled">
                                                <li>• tanggal_masuk</li>
                                                <li>• semester_masuk</li>
                                                <li>• tahun_masuk</li>
                                                <li>• status_siswa</li>
                                                <li>• catatan_khusus</li>
                                                <li>• nama_kontak_darurat</li>
                                                <li>• telepon_kontak_darurat</li>
                                                <li>• hubungan_kontak_darurat</li>
                                            </ul>
                                        </div>
                                    </div>
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

@push('scripts')
<script>
$(document).ready(function() {
    // Update file input label
    $('.custom-file-input').on('change', function() {
        var fileName = $(this).val().split('\\').pop();
        $(this).next('.custom-file-label').html(fileName);
    });
});
</script>
@endpush
