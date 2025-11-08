@extends('layouts.tenant')

@section('title', 'Edit Sesi Konseling')
@section('page-title', 'Edit Sesi Konseling')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-edit me-2"></i>
                        Form Edit Sesi Konseling
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('counseling.sessions.update', $session) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select class="form-select @error('student_id') is-invalid @enderror" id="student_id" name="student_id" required>
                                        <option value="">Pilih Siswa</option>
                                        <option value="1" {{ old('student_id', 1) == 1 ? 'selected' : '' }}>Ahmad Fauzi (X-1)</option>
                                        <option value="2" {{ old('student_id', 2) == 2 ? 'selected' : '' }}>Sarah Putri (IX-2)</option>
                                        <option value="3" {{ old('student_id', 3) == 3 ? 'selected' : '' }}>Muhammad Rizki (XI-3)</option>
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
                                        <option value="1" {{ old('counselor_id', 1) == 1 ? 'selected' : '' }}>Bu Sari</option>
                                        <option value="2" {{ old('counselor_id', 2) == 2 ? 'selected' : '' }}>Pak Budi</option>
                                        <option value="3" {{ old('counselor_id', 3) == 3 ? 'selected' : '' }}>Bu Dewi</option>
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
                                    <input type="date" class="form-control @error('session_date') is-invalid @enderror" id="session_date" name="session_date" value="{{ old('session_date', '2024-01-20') }}" required>
                                    @error('session_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="session_time" class="form-label">Waktu Sesi <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control @error('session_time') is-invalid @enderror" id="session_time" name="session_time" value="{{ old('session_time', '10:00') }}" required>
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
                                        <option value="academic" {{ old('problem_type', 'academic') == 'academic' ? 'selected' : '' }}>Masalah Belajar</option>
                                        <option value="social" {{ old('problem_type', 'social') == 'social' ? 'selected' : '' }}>Masalah Sosial</option>
                                        <option value="family" {{ old('problem_type', 'family') == 'family' ? 'selected' : '' }}>Masalah Keluarga</option>
                                        <option value="personal" {{ old('problem_type', 'personal') == 'personal' ? 'selected' : '' }}>Masalah Pribadi</option>
                                        <option value="career" {{ old('problem_type', 'career') == 'career' ? 'selected' : '' }}>Masalah Karir</option>
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
                                        <option value="scheduled" {{ old('status', 'completed') == 'scheduled' ? 'selected' : '' }}>Terjadwal</option>
                                        <option value="ongoing" {{ old('status', 'completed') == 'ongoing' ? 'selected' : '' }}>Berlangsung</option>
                                        <option value="completed" {{ old('status', 'completed') == 'completed' ? 'selected' : '' }}>Selesai</option>
                                        <option value="cancelled" {{ old('status', 'completed') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Deskripsi Masalah</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="4" placeholder="Jelaskan masalah yang dialami siswa...">{{ old('description', 'Siswa mengalami kesulitan dalam memahami materi matematika dan sering tidak mengerjakan tugas.') }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan Konselor</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" id="notes" name="notes" rows="3" placeholder="Catatan dari konselor...">{{ old('notes', 'Sesi konseling berjalan dengan baik. Siswa sudah menunjukkan kemajuan dalam memahami materi.') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Update
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
