@extends('layouts.tenant')

@section('title', 'Ajukan Mutasi Siswa')
@section('page-title', 'Ajukan Mutasi Siswa')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Form Pengajuan Mutasi Siswa</h3>
                    <div class="card-tools">
                        <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <form id="mutasiForm">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="student_id">Pilih Siswa <span class="text-danger">*</span></label>
                                    <select class="form-control" id="student_id" name="student_id" required>
                                        <option value="">-- Pilih Siswa --</option>
                                        @foreach($students as $student)
                                            <option value="{{ $student->id }}" 
                                                data-nisn="{{ $student->nisn }}"
                                                data-class="{{ $student->class->name ?? '-' }}"
                                                data-nis="{{ $student->student_number ?? '-' }}">
                                                {{ $student->name }} 
                                                @if($student->nisn) - NISN: {{ $student->nisn }} @endif
                                                @if($student->class) - {{ $student->class->name }} @endif
                                            </option>
                                        @endforeach
                                    </select>
                                    <small class="form-text text-muted">Pilih siswa yang akan dimutasi</small>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="to_tenant_id">Tujuan Tenant <span class="text-danger">*</span></label>
                                    <select class="form-control" id="to_tenant_id" name="to_tenant_id" required>
                                        <option value="">-- Pilih Tenant Tujuan --</option>
                                        @foreach($availableDestinations as $tenant)
                                            <option value="{{ $tenant->id }}">
                                                {{ $tenant->name }} 
                                                @if($tenant->npsn) - NPSN: {{ $tenant->npsn }} @endif
                                                @if($tenant->educational_level) ({{ $tenant->educational_level }}) @endif
                                            </option>
                                        @endforeach
                                    </select>
                                    <small class="form-text text-muted">Pilih tenant tujuan yang memiliki jenjang pendidikan yang sama</small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group mb-3">
                                    <label for="reason">Alasan Mutasi <span class="text-danger">*</span></label>
                                    <textarea class="form-control" id="reason" name="reason" rows="4" required 
                                              placeholder="Masukkan alasan mutasi siswa (misalnya: pindah domisili, mengikuti orang tua, dll)"></textarea>
                                    <small class="form-text text-muted">Alasan mutasi wajib diisi</small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group mb-3">
                                    <label for="notes">Catatan Tambahan (Opsional)</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="3" 
                                              placeholder="Tambahkan catatan atau informasi tambahan jika diperlukan"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Info Siswa Selected -->
                        <div id="studentInfo" class="alert alert-info" style="display: none;">
                            <h6><i class="fas fa-info-circle"></i> Informasi Siswa</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <strong>NISN:</strong> <span id="info-nisn">-</span>
                                </div>
                                <div class="col-md-4">
                                    <strong>NIS:</strong> <span id="info-nis">-</span>
                                </div>
                                <div class="col-md-4">
                                    <strong>Kelas:</strong> <span id="info-class">-</span>
                                </div>
                            </div>
                        </div>

                        @if($availableDestinations->isEmpty())
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle"></i> 
                                Tidak ada tenant tujuan yang tersedia dengan jenjang pendidikan yang sama.
                            </div>
                        @endif

                        <div class="form-group mt-4">
                            <button type="submit" class="btn btn-primary" id="submitBtn">
                                <i class="fas fa-paper-plane"></i> Ajukan Mutasi
                            </button>
                            <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Batal
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
document.getElementById('student_id').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const studentInfo = document.getElementById('studentInfo');
    
    if (selectedOption.value) {
        document.getElementById('info-nisn').textContent = selectedOption.dataset.nisn || '-';
        document.getElementById('info-nis').textContent = selectedOption.dataset.nis || '-';
        document.getElementById('info-class').textContent = selectedOption.dataset.class || '-';
        studentInfo.style.display = 'block';
    } else {
        studentInfo.style.display = 'none';
    }
});

document.getElementById('mutasiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    fetch('{{ tenant_route("tenant.data-pokok.mutasi-siswa.store") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message || 'Permintaan mutasi berhasil dikirim');
            window.location.href = '{{ tenant_route("tenant.data-pokok.mutasi-siswa.index") }}';
        } else {
            alert(data.message || 'Terjadi kesalahan saat mengajukan mutasi');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengajukan mutasi. Silakan coba lagi.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
});
</script>
@endsection
