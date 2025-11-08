@extends('layouts.tenant')

@section('title', 'Tambah Bobot Nilai')
@section('page-title', 'Tambah Bobot Nilai')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-plus me-2"></i>
                    Form Tambah Bobot Nilai
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.grade-weights.store') }}" method="POST">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="assignment_type" class="form-label">Jenis Penilaian <span class="text-danger">*</span></label>
                                <select name="assignment_type" id="assignment_type" class="form-select @error('assignment_type') is-invalid @enderror" required>
                                    <option value="">Pilih Jenis Penilaian</option>
                                    @foreach($assignmentTypes as $key => $label)
                                        <option value="{{ $key }}" {{ old('assignment_type') == $key ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('assignment_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="assignment_label" class="form-label">Label <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('assignment_label') is-invalid @enderror" 
                                       id="assignment_label" name="assignment_label" value="{{ old('assignment_label') }}" 
                                       placeholder="Contoh: Tugas, UTS, UAS" required>
                                @error('assignment_label')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="weight_percentage" class="form-label">Bobot (%) <span class="text-danger">*</span></label>
                                <input type="number" class="form-control @error('weight_percentage') is-invalid @enderror" 
                                       id="weight_percentage" name="weight_percentage" value="{{ old('weight_percentage') }}" 
                                       min="0" max="100" step="0.01" placeholder="Contoh: 40.00" required>
                                @error('weight_percentage')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <div class="form-check mt-4">
                                    <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1" 
                                           {{ old('is_active', true) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_active">
                                        Aktif
                                    </label>
                                </div>
                                <small class="text-muted">Bobot yang aktif akan digunakan dalam perhitungan nilai</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('tenant.grade-weights.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Bobot Nilai
                </h6>
            </div>
            <div class="card-body">
                <p class="mb-3">
                    <strong>Bobot Nilai</strong> menentukan seberapa besar kontribusi setiap jenis penilaian terhadap nilai akhir.
                </p>
                <p class="mb-3">
                    <strong>Total Bobot:</strong> Semua bobot aktif harus berjumlah 100%.
                </p>
                <p class="mb-3">
                    <strong>Contoh:</strong>
                </p>
                <ul class="mb-3">
                    <li>Tugas: 40%</li>
                    <li>UTS: 30%</li>
                    <li>UAS: 30%</li>
                </ul>
                <p class="mb-0">
                    <strong>Catatan:</strong> Pastikan total bobot tidak melebihi 100%.
                </p>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const assignmentTypeSelect = document.getElementById('assignment_type');
    const assignmentLabelInput = document.getElementById('assignment_label');
    
    // Auto-fill label based on assignment type
    assignmentTypeSelect.addEventListener('change', function() {
        const labels = {
            'tugas': 'Tugas',
            'uts': 'UTS',
            'uas': 'UAS',
            'quiz': 'Kuis',
            'project': 'Proyek'
        };
        
        if (labels[this.value]) {
            assignmentLabelInput.value = labels[this.value];
        }
    });
});
</script>
@endsection
