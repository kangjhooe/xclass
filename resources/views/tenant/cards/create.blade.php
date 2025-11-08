@extends('layouts.tenant')

@section('title', 'Buat Kartu Baru')
@section('page-title', 'Buat Kartu Baru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-id-card me-3"></i>
                Buat Kartu Baru
            </h2>
            <p>Buat kartu tanda baru untuk siswa, guru, atau staf</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Buat Kartu Baru
        </h5>
    </div>
    <div class="card-body p-4">
        <form method="POST" action="{{ tenant_route('tenant.cards.store') }}">
            @csrf
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Jenis Kartu <span class="text-danger">*</span></label>
                            <select name="card_type" id="card_type" class="form-select" required>
                                <option value="">Pilih Jenis Kartu</option>
                                <option value="student" {{ old('card_type') == 'student' ? 'selected' : '' }}>Kartu Tanda Siswa</option>
                                <option value="teacher" {{ old('card_type') == 'teacher' ? 'selected' : '' }}>Kartu Tanda Pegawai (Guru)</option>
                                <option value="staff" {{ old('card_type') == 'staff' ? 'selected' : '' }}>Kartu Tanda Pegawai (Staf)</option>
                            </select>
                            @error('card_type')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Pilih Orang <span class="text-danger">*</span></label>
                            <select name="cardable_id" id="cardable_id" class="form-select" required>
                                <option value="">Pilih Jenis Kartu terlebih dahulu</option>
                            </select>
                            @error('cardable_id')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label class="form-label">Template (Opsional)</label>
                            <select name="template_id" id="template_id" class="form-select">
                                <option value="">Gunakan Template Default</option>
                            </select>
                            <small class="text-muted">Biarkan kosong untuk menggunakan template default</small>
                        </div>
                    </div>
                    
            <div class="d-flex justify-content-end mt-4 pt-4 border-top">
                <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-modern btn-secondary me-2">
                    <i class="fas fa-times me-2"></i>
                    Batal
                </a>
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-check me-2"></i>
                    Buat Kartu
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
document.getElementById('card_type').addEventListener('change', function() {
    const cardType = this.value;
    const cardableSelect = document.getElementById('cardable_id');
    const templateSelect = document.getElementById('template_id');
    
    // Clear options
    cardableSelect.innerHTML = '<option value="">Memuat...</option>';
    templateSelect.innerHTML = '<option value="">Gunakan Template Default</option>';
    
    if (!cardType) {
        cardableSelect.innerHTML = '<option value="">Pilih Jenis Kartu terlebih dahulu</option>';
        return;
    }
    
    // Load cardables
    fetch(`/{{ request()->route('tenant') }}/cards/cardables?type=${cardType}`)
        .then(response => response.json())
        .then(data => {
            cardableSelect.innerHTML = '<option value="">Pilih...</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name + (item.identifier ? ` (${item.identifier})` : '');
                cardableSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            cardableSelect.innerHTML = '<option value="">Error memuat data</option>';
        });
    
    // Load templates
    fetch(`/{{ request()->route('tenant') }}/cards/templates/data?type=${cardType}`)
        .then(response => response.json())
        .then(data => {
            templateSelect.innerHTML = '<option value="">Gunakan Template Default</option>';
            data.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.name + (template.has_photo ? ' (Dengan Foto)' : ' (Tanpa Foto)');
                templateSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
</script>
@endpush
@endsection

