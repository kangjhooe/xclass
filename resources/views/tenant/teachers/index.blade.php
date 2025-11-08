@extends('layouts.tenant')

@section('title', 'Data Guru')
@section('page-title', 'Data Guru')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .filter-card {
        background: #f8f9fa;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .avatar-circle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
        color: white;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        margin-right: 0.75rem;
        transition: all 0.3s ease;
    }
    
    .avatar-circle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    
    .info-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.25rem;
    }
    
    .info-cell i {
        color: #667eea;
        width: 18px;
        font-size: 0.875rem;
    }
    
    .info-cell strong {
        color: #374151;
        font-weight: 600;
    }
    
    .teacher-name {
        font-weight: 700;
        font-size: 1rem;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    
    .btn-action {
        padding: 0.5rem 0.875rem;
        font-size: 0.875rem;
        border-radius: 0.5rem;
        border: none;
        transition: all 0.3s ease;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
        <strong>Berhasil!</strong> {{ session('success') }}
        @if(session('password_info'))
            <br><br>
            <strong>Informasi Login:</strong><br>
            Email: {{ session('email') ?? '' }}<br>
            Password: <code>{{ session('password_info') }}</code><br>
            <small class="text-muted">Mohon catat password ini. Email kredensial telah dikirim ke email guru. 
            Anda juga dapat export kredensial ke PDF atau Excel.</small>
            
            @if(session('show_export') && session('teacher_nik'))
            <div class="mt-3">
                <a href="{{ tenant_route('tenant.teachers.export-credentials-pdf', session('teacher_nik')) }}" class="btn btn-sm btn-danger me-2" target="_blank">
                    <i class="fas fa-file-pdf me-1"></i>Export PDF
                </a>
                <a href="{{ tenant_route('tenant.teachers.export-credentials-excel', session('teacher_nik')) }}" class="btn btn-sm btn-success">
                    <i class="fas fa-file-excel me-1"></i>Export Excel
                </a>
            </div>
            @endif
        @endif
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-chalkboard-teacher me-3"></i>
                Data Guru
            </h2>
            <p>Kelola data guru sekolah Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end">
                <a href="{{ tenant_route('tenant.teachers.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Tambah Guru
                </a>
                <button class="btn btn-modern" onclick="exportData()" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-download me-2"></i> Export
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Filter Card -->
<div class="filter-card mb-4">
    <form method="GET" class="row g-3">
        <div class="col-md-5">
            <input type="text" name="search" class="form-control" placeholder="Cari nama, NIP, atau spesialisasi..." value="{{ request('search') }}">
        </div>
        <div class="col-md-2">
            <select name="gender" class="form-select">
                <option value="">Semua Jenis Kelamin</option>
                <option value="L" {{ request('gender') == 'L' ? 'selected' : '' }}>Laki-laki</option>
                <option value="P" {{ request('gender') == 'P' ? 'selected' : '' }}>Perempuan</option>
            </select>
        </div>
        <div class="col-md-2">
            <select name="is_active" class="form-select">
                <option value="">Semua Status</option>
                <option value="1" {{ request('is_active') == '1' ? 'selected' : '' }}>Aktif</option>
                <option value="0" {{ request('is_active') == '0' ? 'selected' : '' }}>Tidak Aktif</option>
            </select>
        </div>
        <div class="col-md-3">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-search me-2"></i>Cari
            </button>
        </div>
    </form>
</div>

<!-- Table Container -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-modern">
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Nama Guru</th>
                    <th>NIP / No. Pegawai</th>
                    <th>Kontak</th>
                    <th>Spesialisasi</th>
                    <th>Status</th>
                    <th style="width: 200px;" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($teachers as $index => $teacher)
                    <tr>
                        <td>
                            <div class="avatar-circle">
                                {{ strtoupper(substr($teacher->name, 0, 1)) }}
                            </div>
                        </td>
                        <td>
                            <div>
                                <div class="teacher-name">{{ $teacher->name }}</div>
                                <div class="d-flex flex-column gap-1">
                                    @if($teacher->gender)
                                        <div class="info-cell">
                                            <i class="fas fa-{{ $teacher->gender == 'L' ? 'mars' : 'venus' }}"></i>
                                            <span>{{ $teacher->gender == 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                                        </div>
                                    @endif
                                    @php
                                        $teacherTenant = $teacher->tenants->where('id', $tenant->id)->first();
                                        $isBranch = $teacherTenant && $teacherTenant->pivot->type === 'branch';
                                    @endphp
                                    @if($isBranch)
                                        <span class="badge badge-info badge-modern" style="width: fit-content;">
                                            <i class="fas fa-code-branch"></i>Cabang
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </td>
                        <td>
                            @if($teacher->nip)
                                <div class="info-cell mb-1">
                                    <i class="fas fa-id-card"></i>
                                    <span><strong>NIP:</strong> {{ $teacher->nip }}</span>
                                </div>
                            @endif
                            @if($teacher->employee_number)
                                <div class="info-cell">
                                    <i class="fas fa-hashtag"></i>
                                    <span><strong>No. Pegawai:</strong> {{ $teacher->employee_number }}</span>
                                </div>
                            @endif
                            @if(!$teacher->nip && !$teacher->employee_number)
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                        <td>
                            @if($teacher->email)
                                <div class="info-cell mb-1">
                                    <i class="fas fa-envelope"></i>
                                    <span>{{ $teacher->email }}</span>
                                </div>
                            @endif
                            @if($teacher->phone)
                                <div class="info-cell">
                                    <i class="fas fa-phone"></i>
                                    <span>{{ $teacher->phone }}</span>
                                </div>
                            @endif
                            @if(!$teacher->email && !$teacher->phone)
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                        <td>
                            @if($teacher->subject_specialization)
                                <span class="badge badge-secondary badge-modern">
                                    <i class="fas fa-book me-1"></i>{{ $teacher->subject_specialization }}
                                </span>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                            @if($teacher->education_level)
                                <div class="info-cell mt-1">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span class="text-muted">{{ $teacher->education_level }}</span>
                                </div>
                            @endif
                        </td>
                        <td>
                            <span class="badge badge-{{ $teacher->is_active ? 'success' : 'danger' }} badge-modern">
                                <i class="fas fa-{{ $teacher->is_active ? 'check-circle' : 'times-circle' }} me-1"></i>
                                {{ $teacher->is_active ? 'Aktif' : 'Tidak Aktif' }}
                            </span>
                            @php
                                $additionalDuties = $teacher->activeAdditionalDuties;
                            @endphp
                            @if($additionalDuties && $additionalDuties->count() > 0)
                                <div class="mt-2">
                                    @foreach($additionalDuties->take(2) as $duty)
                                        <span class="badge badge-info badge-modern d-inline-block mb-1">
                                            <i class="fas fa-briefcase me-1"></i>{{ $duty->name }}
                                        </span>
                                    @endforeach
                                    @if($additionalDuties->count() > 2)
                                        <span class="badge badge-secondary badge-modern">
                                            +{{ $additionalDuties->count() - 2 }} lagi
                                        </span>
                                    @endif
                                </div>
                            @endif
                        </td>
                        <td>
                            <div class="action-buttons">
                                <a href="{{ tenant_route('tenant.teachers.show', $teacher->nik) }}" class="btn btn-primary btn-action" title="Detail">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ tenant_route('tenant.teachers.edit', $teacher->nik) }}" class="btn btn-info btn-action text-white" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ tenant_route('tenant.teachers.destroy', $teacher->nik) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus data guru ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-action" title="Hapus">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="empty-state">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <h5 class="text-muted mb-3">Belum ada data guru</h5>
                            <p class="text-muted mb-4">Mulai dengan menambahkan data guru pertama Anda</p>
                            <a href="{{ tenant_route('tenant.teachers.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-2"></i>
                                Tambah Guru
                            </a>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        </div>
    </div>
</div>

@if($teachers->hasPages())
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-center">
                {{ $teachers->links() }}
            </div>
        </div>
    </div>
@endif
@endsection

@section('scripts')
<script>
function exportData() {
    // Implementasi export data guru
    alert('Fitur export akan segera tersedia');
}
</script>
@endsection
