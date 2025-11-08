@extends('layouts.tenant')

@section('title', 'Detail Staf - ' . $nonTeachingStaff->name)
@section('page-title', 'Detail Staf')

@section('content')
<div class="row">
    <div class="col-md-4">
        <div class="card">
            <div class="card-body text-center">
                <div class="avatar-xl bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    {{ substr($nonTeachingStaff->name, 0, 1) }}
                </div>
                <h4 class="card-title">{{ $nonTeachingStaff->name }}</h4>
                <p class="card-text text-muted">{{ $nonTeachingStaff->position }}</p>
                
                <div class="d-flex justify-content-center gap-2 mb-3">
                    <span class="badge bg-{{ $nonTeachingStaff->employment_status_color }}">
                        {{ $nonTeachingStaff->employment_status_label }}
                    </span>
                    @if($nonTeachingStaff->department)
                        <span class="badge bg-secondary">{{ $nonTeachingStaff->department }}</span>
                    @endif
                </div>
                
                <div class="d-flex gap-2">
                    <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.edit', $nonTeachingStaff) }}" class="btn btn-warning btn-sm">
                        <i class="fas fa-edit me-1"></i>
                        Edit
                    </a>
                    <form action="{{ tenant_route('tenant.data-pokok.non-teaching-staff.destroy', $nonTeachingStaff) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus data staf ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash me-1"></i>
                            Hapus
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Detail
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-muted mb-3">Data Pribadi</h6>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Nama Lengkap</label>
                            <p class="mb-0">{{ $nonTeachingStaff->name }}</p>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Jenis Kelamin</label>
                            <p class="mb-0">{{ $nonTeachingStaff->gender == 'L' ? 'Laki-laki' : 'Perempuan' }}</p>
                        </div>
                        
                        @if($nonTeachingStaff->birth_date)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tanggal Lahir</label>
                                <p class="mb-0">{{ \App\Helpers\DateHelper::formatIndonesian($nonTeachingStaff->birth_date) }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->birth_place)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tempat Lahir</label>
                                <p class="mb-0">{{ $nonTeachingStaff->birth_place }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->religion)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Agama</label>
                                <p class="mb-0">{{ $nonTeachingStaff->religion }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->address)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Alamat</label>
                                <p class="mb-0">{{ $nonTeachingStaff->address }}</p>
                            </div>
                        @endif
                    </div>
                    
                    <div class="col-md-6">
                        <h6 class="text-muted mb-3">Kontak</h6>
                        
                        @if($nonTeachingStaff->phone)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Telepon</label>
                                <p class="mb-0">
                                    <i class="fas fa-phone me-1"></i>
                                    {{ $nonTeachingStaff->phone }}
                                </p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->email)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Email</label>
                                <p class="mb-0">
                                    <i class="fas fa-envelope me-1"></i>
                                    <a href="mailto:{{ $nonTeachingStaff->email }}">{{ $nonTeachingStaff->email }}</a>
                                </p>
                            </div>
                        @endif
                        
                        <h6 class="text-muted mb-3 mt-4">Data Kepegawaian</h6>
                        
                        @if($nonTeachingStaff->employee_number)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Nomor Pegawai</label>
                                <p class="mb-0">{{ $nonTeachingStaff->employee_number }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->nip)
                            <div class="mb-3">
                                <label class="form-label fw-bold">NIP</label>
                                <p class="mb-0">{{ $nonTeachingStaff->nip }}</p>
                            </div>
                        @endif
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Posisi/Jabatan</label>
                            <p class="mb-0">{{ $nonTeachingStaff->position }}</p>
                        </div>
                        
                        @if($nonTeachingStaff->department)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Departemen/Bagian</label>
                                <p class="mb-0">{{ $nonTeachingStaff->department }}</p>
                            </div>
                        @endif
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Status Kepegawaian</label>
                            <p class="mb-0">
                                <span class="badge bg-{{ $nonTeachingStaff->employment_status_color }}">
                                    {{ $nonTeachingStaff->employment_status_label }}
                                </span>
                            </p>
                        </div>
                        
                        @if($nonTeachingStaff->hire_date)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tanggal Mulai Bekerja</label>
                                <p class="mb-0">{{ \App\Helpers\DateHelper::formatIndonesian($nonTeachingStaff->hire_date) }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->salary)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Gaji</label>
                                <p class="mb-0">Rp {{ number_format($nonTeachingStaff->salary, 0, ',', '.') }}</p>
                            </div>
                        @endif
                        
                        @if($nonTeachingStaff->education_level)
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tingkat Pendidikan</label>
                                <p class="mb-0">{{ $nonTeachingStaff->education_level }}</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-history me-2"></i>
                    Riwayat Data
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Dibuat Pada</label>
                            <p class="mb-0">{{ \App\Helpers\DateHelper::formatIndonesian($nonTeachingStaff->created_at, true) }}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Terakhir Diperbarui</label>
                            <p class="mb-0">{{ \App\Helpers\DateHelper::formatIndonesian($nonTeachingStaff->updated_at, true) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="d-flex justify-content-between">
            <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-2"></i>
                Kembali ke Daftar
            </a>
            <div class="d-flex gap-2">
                <button class="btn btn-success" onclick="exportData()">
                    <i class="fas fa-download me-2"></i>
                    Export Excel
                </button>
                <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.edit', $nonTeachingStaff) }}" class="btn btn-warning">
                    <i class="fas fa-edit me-2"></i>
                    Edit Data
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function exportData() {
    fetch(`{{ tenant_route('tenant.data-pokok.non-teaching-staff.export', $nonTeachingStaff) }}`)
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat export data');
        });
}
</script>
@endsection
