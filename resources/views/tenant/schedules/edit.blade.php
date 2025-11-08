@extends('layouts.tenant')

@section('title', 'Edit Jadwal')
@section('page-title', 'Edit Jadwal')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Jadwal Pelajaran
            </h2>
            <p>Ubah informasi jadwal pelajaran</p>
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
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Form Edit Jadwal Pelajaran
                </h5>
            </div>
            <div class="card-body">
            <form action="{{ tenant_route('tenant.schedules.update', ['schedule' => $schedule->id]) }}" method="POST">
                @csrf
                @method('PUT')
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Kelas <span class="text-danger">*</span></label>
                        <select name="class_id" class="form-select" required>
                            <option value="">Pilih Kelas</option>
                            @foreach($classes as $class)
                                <option value="{{ $class->id }}" {{ old('class_id', $schedule->class_id) == $class->id ? 'selected' : '' }}>
                                    {{ $class->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('class_id')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                        <select name="subject_id" class="form-select" required>
                            <option value="">Pilih Mata Pelajaran</option>
                            @foreach($subjects as $subject)
                                <option value="{{ $subject->id }}" {{ old('subject_id', $schedule->subject_id) == $subject->id ? 'selected' : '' }}>
                                    {{ $subject->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('subject_id')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">Guru <span class="text-danger">*</span></label>
                        <select name="teacher_id" class="form-select" required>
                            <option value="">Pilih Guru</option>
                            @foreach($teachers as $teacher)
                                <option value="{{ $teacher->id }}" {{ old('teacher_id', $schedule->teacher_id) == $teacher->id ? 'selected' : '' }}>
                                    {{ $teacher->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('teacher_id')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Hari <span class="text-danger">*</span></label>
                        <select name="day" class="form-select" required>
                            <option value="">Pilih Hari</option>
                            <option value="Senin" {{ old('day', $schedule->day) == 'Senin' ? 'selected' : '' }}>Senin</option>
                            <option value="Selasa" {{ old('day', $schedule->day) == 'Selasa' ? 'selected' : '' }}>Selasa</option>
                            <option value="Rabu" {{ old('day', $schedule->day) == 'Rabu' ? 'selected' : '' }}>Rabu</option>
                            <option value="Kamis" {{ old('day', $schedule->day) == 'Kamis' ? 'selected' : '' }}>Kamis</option>
                            <option value="Jumat" {{ old('day', $schedule->day) == 'Jumat' ? 'selected' : '' }}>Jumat</option>
                            <option value="Sabtu" {{ old('day', $schedule->day) == 'Sabtu' ? 'selected' : '' }}>Sabtu</option>
                        </select>
                        @error('day')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Ruangan</label>
                        <input type="text" name="room" class="form-control" value="{{ old('room', $schedule->room) }}">
                        @error('room')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Waktu Mulai <span class="text-danger">*</span></label>
                        <input type="time" name="start_time" class="form-control" value="{{ old('start_time', $schedule->start_time ?? $schedule->time_start) }}" required>
                        @error('start_time')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Waktu Selesai <span class="text-danger">*</span></label>
                        <input type="time" name="end_time" class="form-control" value="{{ old('end_time', $schedule->end_time ?? $schedule->time_end) }}" required>
                        @error('end_time')
                            <div class="text-danger">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i>Simpan</button>
                    <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-secondary"><i class="fas fa-times me-1"></i>Batal</a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

