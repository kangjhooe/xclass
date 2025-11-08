@extends('layouts.tenant')

@section('title', 'Tambah Sesi Konseling')
@section('page-title', 'Tambah Sesi Konseling')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Tambah Sesi Konseling
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('counseling.sessions.store') }}" method="POST">
                        @csrf
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select class="form-select @error('student_id') is-invalid @enderror" id="student_id" name="student_id" required>
                                        <option value="">Pilih Siswa</option>
                                        <option value="1">Ahmad Fauzi (X-1)</option>
                                        <option value="2">Sarah Putri (IX-2)</option>
                                        <option value="3">Muhammad Rizki (XI-3)</option>
                                    </select>
                                    @error('student_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="counselor_id" class="form-label">Konselor <span class="text-danger">*</span></label>
                                    <select class="form-select @error('counselor_id') is-invalid @enderror" id="counselor_id" name="counselor_id" required>
                                        <option value="">Pilih Konselor</option>
                                        <option value="1">Bu Sari</option>
                                        <option value="2">Pak Budi</option>
                                        <option value="3">Bu Dewi</option>
                                    </select>
                                    @error('counselor_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="session_date" class="form-label">Tanggal Sesi <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('session_date') is-invalid @enderror" id="session_date" name="session_date" value="{{ old('session_date') }}" required>
                                    @error('session_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="session_time" class="form-label">Waktu Sesi <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control @error('session_time') is-invalid @enderror" id="session_time" name="session_time" value="{{ old('session_time') }}" required>
                                    @error('session_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="problem_type" class="form-label">Jenis Masalah <span class="text-danger">*</span></label>
                                    <select class="form-select @error('problem_type') is-invalid @enderror" id="problem_type" name="problem_type" required>
                                        <option value="">Pilih Jenis Masalah</option>
                                        <option value="academic">Masalah Belajar</option>
                                        <option value="social">Masalah Sosial</option>
                                        <option value="family">Masalah Keluarga</option>
                                        <option value="personal">Masalah Pribadi</option>
                                        <option value="career">Masalah Karir</option>
                                    </select>
                                    @error('problem_type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                        <option value="scheduled">Terjadwal</option>
                                        <option value="ongoing">Berlangsung</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Deskripsi Masalah</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="4" placeholder="Jelaskan masalah yang dialami siswa...">{{ old('description') }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan Konselor</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" id="notes" name="notes" rows="3" placeholder="Catatan dari konselor...">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Simpan
                            </button>
                            <a href="{{ tenant_route('counseling.sessions') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
