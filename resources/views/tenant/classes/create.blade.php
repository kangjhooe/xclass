@extends('layouts.tenant')

@section('title', 'Tambah Kelas')
@section('page-title', 'Tambah Kelas')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-door-open me-3"></i>
                Tambah Kelas
            </h2>
            <p>Buat kelas baru untuk tahun ajaran ini</p>
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
                    <i class="fas fa-plus me-2 text-primary"></i>
                    Form Tambah Kelas
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.classes.store') }}" method="POST">
                    @csrf
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Nama Kelas <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" name="name" value="{{ old('name') }}" required>
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
                                <label for="major" class="form-label">Jurusan</label>
                                <select class="form-control @error('major') is-invalid @enderror" 
                                        id="major" name="major">
                                    <option value="">Pilih Jurusan</option>
                                    <option value="Umum" {{ old('major') == 'Umum' ? 'selected' : '' }}>Umum</option>
                                    <option value="IPA" {{ old('major') == 'IPA' ? 'selected' : '' }}>IPA</option>
                                    <option value="IPS" {{ old('major') == 'IPS' ? 'selected' : '' }}>IPS</option>
                                    <option value="Bahasa" {{ old('major') == 'Bahasa' ? 'selected' : '' }}>Bahasa</option>
                                    <option value="Agama" {{ old('major') == 'Agama' ? 'selected' : '' }}>Agama</option>
                                    <option value="-" {{ old('major') == '-' ? 'selected' : '' }}>-</option>
                                </select>
                                @error('major')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="academic_year" class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('academic_year') is-invalid @enderror" 
                                       id="academic_year" name="academic_year" value="{{ old('academic_year', '2024/2025') }}" required>
                                @error('academic_year')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="room_id" class="form-label">Ruangan <span class="text-danger">*</span></label>
                                <select class="form-control @error('room_id') is-invalid @enderror" 
                                        id="room_id" name="room_id" required>
                                    <option value="">Pilih Ruangan</option>
                                    @foreach($rooms as $room)
                                        <option value="{{ $room->id }}" {{ old('room_id') == $room->id ? 'selected' : '' }}>
                                            {{ $room->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('room_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="homeroom_teacher_id" class="form-label">Wali Kelas <span class="text-danger">*</span></label>
                                <select class="form-control @error('homeroom_teacher_id') is-invalid @enderror" 
                                        id="homeroom_teacher_id" name="homeroom_teacher_id" required>
                                    <option value="">Pilih Wali Kelas</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('homeroom_teacher_id') == $teacher->id ? 'selected' : '' }}>
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
                        <label for="description" class="form-label">Deskripsi</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="3">{{ old('description') }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is_active" name="is_active" 
                                   value="1" {{ old('is_active', true) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_active">
                                Kelas aktif
                            </label>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2 mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Simpan Kelas
                        </button>
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
        
        // Set selected jika ada old value
        if (option.value === '{{ old("level") }}') {
            option.selected = true;
        }
        
        levelSelect.appendChild(option);
    });
    
});
</script>
@endsection
