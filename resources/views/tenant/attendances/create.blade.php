@extends('layouts.tenant')

@section('title', 'Tambah Kehadiran')
@section('page-title', 'Tambah Kehadiran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-plus-circle me-3"></i>
                Tambah Kehadiran
            </h2>
            <p>Input data kehadiran siswa</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.attendances.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Kehadiran
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.attendances.store') }}" method="POST">
            @csrf
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="schedule_id" class="form-label fw-semibold">Jadwal <span class="text-danger">*</span></label>
                    <select name="schedule_id" id="schedule_id" class="form-select @error('schedule_id') is-invalid @enderror" required onchange="loadStudents()">
                        <option value="">Pilih Jadwal</option>
                        @foreach($schedules as $schedule)
                            <option value="{{ $schedule->id }}" {{ old('schedule_id') == $schedule->id ? 'selected' : '' }}>
                                {{ $schedule->classRoom->name ?? '-' }} - {{ $schedule->subject->name ?? '-' }}
                            </option>
                        @endforeach
                    </select>
                    @error('schedule_id')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label for="attendance_date" class="form-label fw-semibold">Tanggal <span class="text-danger">*</span></label>
                    <input type="date" name="attendance_date" id="attendance_date" class="form-control @error('attendance_date') is-invalid @enderror" value="{{ old('attendance_date', date('Y-m-d')) }}" required>
                    @error('attendance_date')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div id="students-container" class="mt-4">
                @if($schedule && $students->count() > 0)
                    <h5 class="mb-3">
                        <i class="fas fa-users me-2 text-primary"></i>
                        Daftar Siswa
                    </h5>
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Siswa</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($students as $student)
                                <tr>
                                    <td>
                                        <strong>{{ $student->name }}</strong>
                                        <br>
                                        <small class="text-muted">{{ $student->nis ?? $student->student_number }}</small>
                                    </td>
                                    <td>
                                        <select name="students[{{ $loop->index }}][status]" class="form-select" required>
                                            <option value="present" {{ old('students.'.$loop->index.'.status') == 'present' ? 'selected' : '' }}>Hadir</option>
                                            <option value="absent" {{ old('students.'.$loop->index.'.status') == 'absent' ? 'selected' : '' }}>Tidak Hadir</option>
                                            <option value="late" {{ old('students.'.$loop->index.'.status') == 'late' ? 'selected' : '' }}>Terlambat</option>
                                            <option value="excused" {{ old('students.'.$loop->index.'.status') == 'excused' ? 'selected' : '' }}>Izin</option>
                                        </select>
                                        <input type="hidden" name="students[{{ $loop->index }}][student_id]" value="{{ $student->id }}">
                                    </td>
                                    <td>
                                        <input type="text" name="students[{{ $loop->index }}][notes]" class="form-control" placeholder="Keterangan (opsional)" value="{{ old('students.'.$loop->index.'.notes') }}">
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="alert alert-info" style="border-radius: 12px; border: none;">
                        <i class="fas fa-info-circle me-2"></i>
                        Pilih jadwal terlebih dahulu untuk menampilkan daftar siswa
                    </div>
                @endif
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-save me-2"></i>Simpan
                </button>
                <a href="{{ tenant_route('tenant.attendances.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
function loadStudents() {
    const scheduleId = document.getElementById('schedule_id').value;
    if (scheduleId) {
        window.location.href = '{{ tenant_route("tenant.attendances.create") }}?schedule_id=' + scheduleId;
    }
}
</script>
@endpush
