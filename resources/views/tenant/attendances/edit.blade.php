@extends('layouts.tenant')

@section('title', 'Edit Kehadiran')
@section('page-title', 'Edit Kehadiran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Kehadiran
            </h2>
            <p>Edit data kehadiran siswa</p>
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
            Form Edit Kehadiran
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.attendances.update', ['attendance' => $attendance->id]) }}" method="POST">
            @csrf
            @method('PUT')
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Siswa</label>
                    <input type="text" class="form-control" value="{{ $attendance->student->name ?? '-' }}" readonly style="background: #f9fafb;">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Tanggal</label>
                    <input type="text" class="form-control" value="{{ \Carbon\Carbon::parse($attendance->attendance_date)->format('d-m-Y') }}" readonly style="background: #f9fafb;">
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label fw-semibold">Mata Pelajaran</label>
                    <input type="text" class="form-control" value="{{ $attendance->schedule->subject->name ?? '-' }}" readonly style="background: #f9fafb;">
                </div>
                <div class="col-md-6">
                    <label for="status" class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                    <select name="status" id="status" class="form-select @error('status') is-invalid @enderror" required>
                        <option value="present" {{ old('status', $attendance->status) == 'present' ? 'selected' : '' }}>Hadir</option>
                        <option value="absent" {{ old('status', $attendance->status) == 'absent' ? 'selected' : '' }}>Tidak Hadir</option>
                        <option value="late" {{ old('status', $attendance->status) == 'late' ? 'selected' : '' }}>Terlambat</option>
                        <option value="excused" {{ old('status', $attendance->status) == 'excused' ? 'selected' : '' }}>Izin</option>
                    </select>
                    @error('status')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="mb-4">
                <label for="notes" class="form-label fw-semibold">Keterangan</label>
                <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" rows="3">{{ old('notes', $attendance->notes) }}</textarea>
                @error('notes')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
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
