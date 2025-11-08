@extends('layouts.tenant')

@section('title', 'Tambah Jadwal Pelajaran')
@section('page-title', 'Tambah Jadwal Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar-alt me-3"></i>
                Tambah Jadwal Pelajaran
            </h2>
            <p>Buat jadwal pelajaran baru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-plus me-2 text-primary"></i>
                    Form Tambah Jadwal Pelajaran
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.schedules.store') }}" method="POST">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="day" class="form-label">Hari <span class="text-danger">*</span></label>
                                <select class="form-control @error('day') is-invalid @enderror" 
                                        id="day" name="day" required>
                                    <option value="">Pilih Hari</option>
                                    <option value="monday" {{ old('day') == 'monday' ? 'selected' : '' }}>Senin</option>
                                    <option value="tuesday" {{ old('day') == 'tuesday' ? 'selected' : '' }}>Selasa</option>
                                    <option value="wednesday" {{ old('day') == 'wednesday' ? 'selected' : '' }}>Rabu</option>
                                    <option value="thursday" {{ old('day') == 'thursday' ? 'selected' : '' }}>Kamis</option>
                                    <option value="friday" {{ old('day') == 'friday' ? 'selected' : '' }}>Jumat</option>
                                    <option value="saturday" {{ old('day') == 'saturday' ? 'selected' : '' }}>Sabtu</option>
                                    <option value="sunday" {{ old('day') == 'sunday' ? 'selected' : '' }}>Minggu</option>
                                </select>
                                @error('day')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="room" class="form-label">Ruangan</label>
                                <input type="text" class="form-control @error('room') is-invalid @enderror" 
                                       id="room" name="room" value="{{ old('room') }}">
                                @error('room')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="start_time" class="form-label">Waktu Mulai <span class="text-danger">*</span></label>
                                <input type="time" class="form-control @error('start_time') is-invalid @enderror" 
                                       id="start_time" name="start_time" value="{{ old('start_time') }}" required>
                                @error('start_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="end_time" class="form-label">Waktu Selesai <span class="text-danger">*</span></label>
                                <input type="time" class="form-control @error('end_time') is-invalid @enderror" 
                                       id="end_time" name="end_time" value="{{ old('end_time') }}" required>
                                @error('end_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                                <select class="form-control @error('teacher_id') is-invalid @enderror" 
                                        id="teacher_id" name="teacher_id" required>
                                    <option value="">Pilih Guru</option>
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
                        
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                <select class="form-control @error('subject_id') is-invalid @enderror" 
                                        id="subject_id" name="subject_id" required>
                                    <option value="">Pilih Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }} ({{ $subject->code }})
                                        </option>
                                    @endforeach
                                </select>
                                @error('subject_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="class_id" class="form-label">Kelas <span class="text-danger">*</span></label>
                                <select class="form-control @error('class_id') is-invalid @enderror" 
                                        id="class_id" name="class_id" required>
                                    <option value="">Pilih Kelas</option>
                                    @foreach($classes as $class)
                                        <option value="{{ $class->id }}" {{ old('class_id') == $class->id ? 'selected' : '' }}>
                                            {{ $class->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('class_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="notes" class="form-label">Catatan</label>
                        <textarea class="form-control @error('notes') is-invalid @enderror" 
                                  id="notes" name="notes" rows="3">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="academic_year" class="form-label">Tahun Ajaran</label>
                        <input type="text" class="form-control @error('academic_year') is-invalid @enderror" 
                               id="academic_year" name="academic_year" value="{{ old('academic_year', '2024/2025') }}">
                        @error('academic_year')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is_active" name="is_active" 
                                   value="1" {{ old('is_active', true) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_active">
                                Jadwal aktif
                            </label>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan
                        </button>
                        <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi
                </h6>
            </div>
            <div class="card-body">
                <p class="text-muted">
                    <strong>Waktu:</strong> Pastikan waktu selesai setelah waktu mulai.
                </p>
                <p class="text-muted">
                    <strong>Guru:</strong> Pilih guru yang akan mengajar mata pelajaran.
                </p>
                <p class="text-muted">
                    <strong>Kelas:</strong> Pilih kelas yang akan mengikuti pelajaran.
                </p>
                <p class="text-muted">
                    <strong>Ruangan:</strong> Tentukan ruangan tempat pelajaran berlangsung.
                </p>
            </div>
        </div>
    </div>
</div>
@endsection

