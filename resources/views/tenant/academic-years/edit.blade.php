@extends('layouts.tenant')

@section('title', 'Edit Tahun Pelajaran')
@section('page-title', 'Edit Tahun Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Tahun Pelajaran: {{ $academicYear->year_name }}
            </h2>
            <p>Edit informasi tahun pelajaran</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.academic-years.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Form Edit Tahun Pelajaran
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.academic-years.update', $academicYear) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="year_name" class="form-label fw-semibold">Nama Tahun Pelajaran <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('year_name') is-invalid @enderror" 
                                   id="year_name" name="year_name" value="{{ old('year_name', $academicYear->year_name) }}" 
                                   placeholder="Contoh: 2024/2025" required>
                            @error('year_name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6">
                            <label for="start_date" class="form-label fw-semibold">Tanggal Mulai <span class="text-danger">*</span></label>
                            <input type="date" class="form-control @error('start_date') is-invalid @enderror" 
                                   id="start_date" name="start_date" value="{{ old('start_date', $academicYear->start_date->format('Y-m-d')) }}" required>
                            @error('start_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="end_date" class="form-label fw-semibold">Tanggal Selesai <span class="text-danger">*</span></label>
                            <input type="date" class="form-control @error('end_date') is-invalid @enderror" 
                                   id="end_date" name="end_date" value="{{ old('end_date', $academicYear->end_date->format('Y-m-d')) }}" required>
                            @error('end_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">&nbsp;</label>
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1" 
                                       {{ old('is_active', $academicYear->is_active) ? 'checked' : '' }}>
                                <label class="form-check-label" for="is_active">
                                    Set sebagai tahun pelajaran aktif
                                </label>
                            </div>
                            <small class="text-muted">Jika dicentang, tahun pelajaran lain akan dinonaktifkan</small>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2 mt-4">
                        <a href="{{ tenant_route('tenant.academic-years.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-info-circle me-2 text-primary"></i>
                    Informasi
                </h5>
            </div>
            <div class="card-body">
                <div class="info-item mb-3">
                    <p class="mb-2">
                        <strong>Status Saat Ini:</strong>
                        @if($academicYear->is_active)
                            <span class="badge-modern bg-success">Aktif</span>
                        @else
                            <span class="badge-modern bg-secondary">Tidak Aktif</span>
                        @endif
                    </p>
                </div>
                <div class="info-item mb-3">
                    <p class="mb-2">
                        <strong>Dibuat:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($academicYear->created_at, true) }}
                    </p>
                </div>
                <div class="info-item mb-3">
                    <p class="mb-2">
                        <strong>Diperbarui:</strong> {{ \App\Helpers\DateHelper::formatIndonesian($academicYear->updated_at, true) }}
                    </p>
                </div>
                <div class="info-item mb-0">
                    <p class="mb-0">
                        <strong>Catatan:</strong> Mengubah tahun pelajaran aktif akan mempengaruhi data nilai dan jadwal.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Validasi tanggal
    document.getElementById('start_date').addEventListener('change', function() {
        const startDate = new Date(this.value);
        const endDateInput = document.getElementById('end_date');
        
        if (startDate && endDateInput.value) {
            const endDate = new Date(endDateInput.value);
            if (endDate <= startDate) {
                endDateInput.setCustomValidity('Tanggal selesai harus lebih besar dari tanggal mulai');
            } else {
                endDateInput.setCustomValidity('');
            }
        }
    });
    
    document.getElementById('end_date').addEventListener('change', function() {
        const endDate = new Date(this.value);
        const startDateInput = document.getElementById('start_date');
        
        if (endDate && startDateInput.value) {
            const startDate = new Date(startDateInput.value);
            if (endDate <= startDate) {
                this.setCustomValidity('Tanggal selesai harus lebih besar dari tanggal mulai');
            } else {
                this.setCustomValidity('');
            }
        }
    });
</script>
@endpush
