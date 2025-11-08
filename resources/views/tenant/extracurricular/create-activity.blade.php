@extends('layouts.tenant')

@section('title', 'Tambah Kegiatan')
@section('page-title', 'Tambah Kegiatan Ekstrakurikuler')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Tambah Kegiatan Ekstrakurikuler</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('extracurricular.activities') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('extracurricular.store-activity') }}" method="POST">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="name">Nama Kegiatan <span class="text-danger">*</span></label>
                                <input type="text" name="name" id="name" class="form-control @error('name') is-invalid @enderror" 
                                       value="{{ old('name') }}" placeholder="Masukkan nama kegiatan" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="category">Kategori <span class="text-danger">*</span></label>
                                <select name="category" id="category" class="form-control @error('category') is-invalid @enderror" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="Olahraga" {{ old('category') == 'Olahraga' ? 'selected' : '' }}>Olahraga</option>
                                    <option value="Seni" {{ old('category') == 'Seni' ? 'selected' : '' }}>Seni</option>
                                    <option value="Keagamaan" {{ old('category') == 'Keagamaan' ? 'selected' : '' }}>Keagamaan</option>
                                    <option value="Kepemimpinan" {{ old('category') == 'Kepemimpinan' ? 'selected' : '' }}>Kepemimpinan</option>
                                    <option value="Teknologi" {{ old('category') == 'Teknologi' ? 'selected' : '' }}>Teknologi</option>
                                    <option value="Bahasa" {{ old('category') == 'Bahasa' ? 'selected' : '' }}>Bahasa</option>
                                    <option value="Lainnya" {{ old('category') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="teacher_id">Pembina <span class="text-danger">*</span></label>
                                <select name="teacher_id" id="teacher_id" class="form-control @error('teacher_id') is-invalid @enderror" required>
                                    <option value="">Pilih Pembina</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('teacher_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="max_participants">Maksimal Peserta <span class="text-danger">*</span></label>
                                <input type="number" name="max_participants" id="max_participants" class="form-control @error('max_participants') is-invalid @enderror" 
                                       value="{{ old('max_participants', 20) }}" placeholder="Jumlah maksimal peserta" min="1" required>
                                @error('max_participants')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="schedule">Jadwal <span class="text-danger">*</span></label>
                                <input type="text" name="schedule" id="schedule" class="form-control @error('schedule') is-invalid @enderror" 
                                       value="{{ old('schedule') }}" placeholder="Contoh: Senin, 14:00-16:00" required>
                                @error('schedule')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="location">Lokasi <span class="text-danger">*</span></label>
                                <input type="text" name="location" id="location" class="form-control @error('location') is-invalid @enderror" 
                                       value="{{ old('location') }}" placeholder="Masukkan lokasi kegiatan" required>
                                @error('location')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="status">Status</label>
                                <select name="status" id="status" class="form-control @error('status') is-invalid @enderror">
                                    <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                                    <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Deskripsi</label>
                        <textarea name="description" id="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan deskripsi kegiatan (opsional)">{{ old('description') }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="form-group">
                        <label for="requirements">Persyaratan</label>
                        <textarea name="requirements" id="requirements" class="form-control @error('requirements') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan persyaratan untuk mengikuti kegiatan (opsional)">{{ old('requirements') }}</textarea>
                        @error('requirements')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                    <a href="{{ tenant_route('extracurricular.activities') }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
