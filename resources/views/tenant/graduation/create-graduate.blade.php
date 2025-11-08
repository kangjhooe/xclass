@extends('layouts.tenant')

@section('title', 'Tambah Lulusan')
@section('page-title', 'Tambah Data Lulusan')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Tambah Data Lulusan</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('graduation.graduates') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('graduation.graduates.store') }}" method="POST">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="student_id">Siswa <span class="text-danger">*</span></label>
                                <select name="student_id" id="student_id" class="form-control @error('student_id') is-invalid @enderror" required>
                                    <option value="">Pilih Siswa</option>
                                    @foreach($students as $student)
                                        <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} - {{ $student->student_number }} ({{ $student->class->name ?? 'N/A' }})
                                        </option>
                                    @endforeach
                                </select>
                                @error('student_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="academic_year_id">Tahun Akademik <span class="text-danger">*</span></label>
                                <select name="academic_year_id" id="academic_year_id" class="form-control @error('academic_year_id') is-invalid @enderror" required>
                                    <option value="">Pilih Tahun Akademik</option>
                                    @foreach($academicYears as $academicYear)
                                        <option value="{{ $academicYear->id }}" {{ old('academic_year_id') == $academicYear->id ? 'selected' : '' }}>
                                            {{ $academicYear->year }} - {{ $academicYear->year + 1 }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('academic_year_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="graduation_date">Tanggal Kelulusan <span class="text-danger">*</span></label>
                                <input type="date" name="graduation_date" id="graduation_date" class="form-control @error('graduation_date') is-invalid @enderror" 
                                       value="{{ old('graduation_date', date('Y-m-d')) }}" required>
                                @error('graduation_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="final_grade">Nilai Akhir <span class="text-danger">*</span></label>
                                <input type="number" name="final_grade" id="final_grade" class="form-control @error('final_grade') is-invalid @enderror" 
                                       value="{{ old('final_grade') }}" placeholder="Masukkan nilai akhir (0-100)" min="0" max="100" step="0.01" required>
                                @error('final_grade')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="achievement">Prestasi <span class="text-danger">*</span></label>
                                <select name="achievement" id="achievement" class="form-control @error('achievement') is-invalid @enderror" required>
                                    <option value="">Pilih Prestasi</option>
                                    <option value="none" {{ old('achievement') == 'none' ? 'selected' : '' }}>Tidak Ada</option>
                                    <option value="cum_laude" {{ old('achievement') == 'cum_laude' ? 'selected' : '' }}>Cum Laude</option>
                                    <option value="magna_laude" {{ old('achievement') == 'magna_laude' ? 'selected' : '' }}>Magna Laude</option>
                                    <option value="summa_laude" {{ old('achievement') == 'summa_laude' ? 'selected' : '' }}>Summa Laude</option>
                                </select>
                                @error('achievement')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="rank">Peringkat</label>
                                <input type="number" name="rank" id="rank" class="form-control @error('rank') is-invalid @enderror" 
                                       value="{{ old('rank') }}" placeholder="Masukkan peringkat (opsional)" min="1">
                                @error('rank')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="certificate_number">Nomor Sertifikat <span class="text-danger">*</span></label>
                        <input type="text" name="certificate_number" id="certificate_number" class="form-control @error('certificate_number') is-invalid @enderror" 
                               value="{{ old('certificate_number') }}" placeholder="Masukkan nomor sertifikat" required>
                        @error('certificate_number')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Catatan tambahan (opsional)">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                    <a href="{{ tenant_route('graduation.graduates') }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
