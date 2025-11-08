@extends('layouts.tenant')

@section('title', 'Edit Kelas')
@section('page-title', 'Edit Kelas')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Kelas: {{ $classRoom->name }}
            </h2>
            <p>Ubah informasi kelas</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.classes.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
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
                    Form Edit Kelas
                </h5>
            </div>
            <div class="card-body">
                    <form action="{{ tenant_route('tenant.classes.update', $classRoom) }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nama Kelas <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                           id="name" name="name" value="{{ old('name', $classRoom->name) }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="level" class="form-label">Level <span class="text-danger">*</span></label>
                                    <select class="form-control @error('level') is-invalid @enderror" 
                                            id="level" name="level" required>
                                        <option value="">Pilih Level</option>
                                        <!-- Opsi level akan diisi oleh JavaScript berdasarkan jenjang -->
                                    </select>
                                    @error('level')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="academic_year" class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('academic_year') is-invalid @enderror" 
                                           id="academic_year" name="academic_year" value="{{ old('academic_year', $classRoom->academic_year) }}" required>
                                    @error('academic_year')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="room_number" class="form-label">No. Ruangan</label>
                                    <input type="text" class="form-control @error('room_number') is-invalid @enderror" 
                                           id="room_number" name="room_number" value="{{ old('room_number', $classRoom->room_number) }}">
                                    @error('room_number')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="capacity" class="form-label">Kapasitas</label>
                                    <input type="number" class="form-control @error('capacity') is-invalid @enderror" 
                                           id="capacity" name="capacity" value="{{ old('capacity', $classRoom->capacity) }}" min="1">
                                    @error('capacity')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="homeroom_teacher_id" class="form-label">Wali Kelas</label>
                                    <select class="form-control @error('homeroom_teacher_id') is-invalid @enderror" 
                                            id="homeroom_teacher_id" name="homeroom_teacher_id">
                                        <option value="">Pilih Wali Kelas</option>
                                        @foreach($teachers as $teacher)
                                            <option value="{{ $teacher->id }}" {{ old('homeroom_teacher_id', $classRoom->homeroom_teacher_id) == $teacher->id ? 'selected' : '' }}>
                                                {{ $teacher->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('homeroom_teacher_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="is_active" name="is_active" 
                                       value="1" {{ old('is_active', $classRoom->is_active) ? 'checked' : '' }}>
                                <label class="form-check-label" for="is_active">
                                    Kelas aktif
                                </label>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Update Kelas
                            </button>
                            <a href="{{ tenant_route('tenant.classes.show', $classRoom) }}" class="btn btn-info">
                                <i class="fas fa-eye me-2"></i>Lihat Detail
                            </a>
                            <a href="{{ tenant_route('tenant.classes.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>Kembali
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Ambil jenjang pendidikan dari tenant
    const tenantJenjang = '{{ app(\App\Core\Services\TenantService::class)->getCurrentTenant()->jenjang ?? "" }}';
    const levelSelect = document.getElementById('level');
    
    // Hapus semua opsi kecuali yang pertama
    while (levelSelect.children.length > 1) {
        levelSelect.removeChild(levelSelect.lastChild);
    }
    
    // Tentukan level berdasarkan jenjang
    let levels = [];
    
    if (tenantJenjang === 'SD' || tenantJenjang === 'MI') {
        levels = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    } else if (tenantJenjang === 'SMP' || tenantJenjang === 'MTs') {
        levels = ['VII', 'VIII', 'IX'];
    } else if (tenantJenjang === 'SMA' || tenantJenjang === 'MA' || tenantJenjang === 'SMK') {
        levels = ['X', 'XI', 'XII'];
    } else {
        // Untuk jenjang lainnya, berikan opsi umum
        levels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    }
    
    // Tambahkan opsi level ke select
    levels.forEach(function(level) {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        
        // Set selected jika sesuai dengan nilai saat ini
        const currentLevel = '{{ old("level", $classRoom->level) }}';
        if (option.value === currentLevel) {
            option.selected = true;
        }
        
        levelSelect.appendChild(option);
    });
    
});
</script>
@endsection

