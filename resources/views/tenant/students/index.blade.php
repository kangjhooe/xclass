@extends('layouts.tenant')

@section('title', 'Data Siswa')
@section('page-title', 'Data Siswa')

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
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        color: white;
        flex-shrink: 0;
    }
    
    /* Pagination Styles */
    .pagination-wrapper {
        padding: 1.5rem;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        margin: 0;
        border-radius: 0 0 16px 16px;
    }
    
    .pagination-container {
        display: flex;
        align-items: center;
        overflow: visible;
        max-width: 100%;
    }
    
    .modern-card .card-body {
        padding-bottom: 0;
    }
    
    .modern-card {
        overflow: hidden;
    }
    
    .pagination-info {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        color: #6c757d;
        gap: 0.5rem;
    }
    
    .pagination-info i {
        color: #667eea;
    }
    
    /* Bootstrap Pagination Custom - Force Override */
    .pagination-wrapper .pagination {
        margin: 0 !important;
        gap: 0.5rem !important;
        display: flex !important;
        flex-wrap: wrap !important;
        list-style: none !important;
        padding: 0 !important;
    }
    
    .pagination-wrapper .pagination .page-item {
        margin: 0 !important;
        list-style: none !important;
    }
    
    .pagination-wrapper .pagination .page-link {
        border-radius: 8px !important;
        border: 1px solid #dee2e6 !important;
        color: #495057 !important;
        padding: 0.5rem 0.875rem !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
        text-decoration: none !important;
        display: inline-block !important;
        min-width: 38px !important;
        text-align: center !important;
        background-color: white !important;
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
    }
    
    .pagination-wrapper .pagination .page-link:hover:not(.disabled):not(.active) {
        background-color: #667eea !important;
        border-color: #667eea !important;
        color: white !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3) !important;
        z-index: 1 !important;
        position: relative !important;
    }
    
    .pagination-wrapper .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-color: #667eea !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4) !important;
        z-index: 1 !important;
        position: relative !important;
    }
    
    .pagination-wrapper .pagination .page-item.disabled .page-link {
        color: #adb5bd !important;
        background-color: #f8f9fa !important;
        border-color: #e9ecef !important;
        cursor: not-allowed !important;
        opacity: 0.6 !important;
        pointer-events: none !important;
    }
    
    .pagination-wrapper .pagination .page-link:focus {
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        outline: 0 !important;
    }
    
    /* Fix pagination arrows/svg icons - More aggressive */
    .pagination-wrapper .pagination svg,
    .pagination-wrapper svg,
    .pagination-container svg {
        width: 16px !important;
        height: 16px !important;
        display: inline-block !important;
        vertical-align: middle !important;
        flex-shrink: 0 !important;
    }
    
    .pagination-wrapper .pagination .page-link svg,
    .pagination-wrapper .page-link svg {
        max-width: 16px !important;
        max-height: 16px !important;
        width: 16px !important;
        height: 16px !important;
    }
    
    /* Hide any large navigation arrows */
    .pagination-wrapper .pagination > * {
        max-width: none !important;
    }
    
    /* Ensure pagination container doesn't overflow */
    .pagination-container {
        overflow: visible !important;
        width: auto !important;
    }
    
    @media (max-width: 768px) {
        .pagination-wrapper {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
        }
        
        .pagination {
            flex-wrap: wrap;
            justify-content: center;
        }
    }
</style>
@endpush

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
        <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif
@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
        <i class="fas fa-exclamation-circle me-2"></i>{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-graduate me-3"></i>
                Data Siswa
            </h2>
            <p>Kelola data siswa sekolah Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="action-buttons justify-content-md-end flex-wrap">
                @if(\App\Helpers\RbacHelper::canManageMutasi(auth()->user()))
                <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-exchange-alt me-2"></i> Mutasi
                </a>
                @endif
                <a href="{{ tenant_route('tenant.students.import.form') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-file-excel me-2"></i> Import
                </a>
                <a href="{{ tenant_route('tenant.students.template.download') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-download me-2"></i> Template
                </a>
                <a href="{{ tenant_route('tenant.students.create', ['tenant' => $tenant->npsn]) }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus me-2"></i> Tambah
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Modern Card -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Siswa
        </h5>
    </div>
    
    <div class="card-body p-4">
        <!-- Filter Form -->
        <div class="filter-card">
            <form method="GET" action="{{ tenant_route('tenant.students.index', ['tenant' => $tenant->npsn]) }}" class="row g-3" id="filterForm">
                <div class="col-md-3">
                    <label for="search" class="form-label fw-semibold">Cari Siswa</label>
                    <input type="text" class="form-control" id="search" name="search" 
                           value="{{ request('search') }}" placeholder="Nama, NIS, NISN, atau Email"
                           autocomplete="off">
                </div>
                <div class="col-md-2">
                    <label for="class_id" class="form-label fw-semibold">Kelas</label>
                    <select class="form-select" id="class_id" name="class_id" onchange="this.form.submit()">
                        <option value="">Semua Kelas</option>
                        @foreach($classes as $class)
                            <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                {{ $class->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="status" class="form-label fw-semibold">Status</label>
                    <select class="form-select" id="status" name="status" onchange="this.form.submit()">
                        <option value="">Semua Status</option>
                        <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                        <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="gender" class="form-label fw-semibold">Jenis Kelamin</label>
                    <select class="form-select" id="gender" name="gender" onchange="this.form.submit()">
                        <option value="">Semua</option>
                        <option value="L" {{ request('gender') == 'L' ? 'selected' : '' }}>Laki-laki</option>
                        <option value="P" {{ request('gender') == 'P' ? 'selected' : '' }}>Perempuan</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-semibold">&nbsp;</label>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-search me-2"></i>Cari
                        </button>
                        <a href="{{ tenant_route('tenant.students.index', ['tenant' => $tenant->npsn]) }}" class="btn btn-outline-secondary">
                            <i class="fas fa-times me-2"></i>Reset
                        </a>
                        @if($students->count() > 0)
                            <a href="{{ tenant_route('tenant.students.export', array_merge(['tenant' => $tenant->npsn], request()->only(['search', 'class_id', 'status', 'gender']))) }}" 
                               class="btn btn-success" title="Export data dengan filter yang aktif">
                                <i class="fas fa-file-excel me-2"></i>Export
                            </a>
                        @endif
                    </div>
                </div>
            </form>
        </div>

        <!-- Students Table -->
        <div class="table-responsive">
            <table class="table table-modern">
                <thead>
                    <tr>
                        <th width="50">No</th>
                        <th width="120">NIS</th>
                        <th width="130">NISN</th>
                        <th>Nama Lengkap</th>
                        <th width="120">Kelas</th>
                        <th width="120">Jenis Kelamin</th>
                        <th width="140">No. Telepon</th>
                        <th width="100">Status</th>
                        <th width="150" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($students as $student)
                        <tr>
                            <td class="text-center">{{ $loop->iteration + ($students->currentPage() - 1) * $students->perPage() }}</td>
                            <td>
                                <span class="badge bg-light text-dark">{{ $student->student_number ?? '-' }}</span>
                            </td>
                            <td>
                                <span class="badge bg-info">{{ $student->nisn ?? '-' }}</span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar-circle me-2" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                        {{ strtoupper(substr($student->name, 0, 1)) }}
                                    </div>
                                    <strong>{{ $student->name }}</strong>
                                </div>
                            </td>
                            <td>
                                @if($student->classRoom)
                                    <span class="badge bg-info">{{ $student->classRoom->name }}</span>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                @if($student->gender == 'L' || $student->gender == 'male')
                                    <span class="badge bg-primary">Laki-laki</span>
                                @elseif($student->gender == 'P' || $student->gender == 'female')
                                    <span class="badge" style="background: #ec4899;">Perempuan</span>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                @if($student->phone)
                                    <i class="fas fa-phone me-1 text-muted"></i>{{ $student->phone }}
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if($student->is_active)
                                    <span class="badge bg-success">
                                        <i class="fas fa-check-circle me-1"></i>Aktif
                                    </span>
                                @else
                                    <span class="badge bg-danger">
                                        <i class="fas fa-times-circle me-1"></i>Tidak Aktif
                                    </span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="{{ tenant_route('tenant.students.show', ['tenant' => $tenant->npsn, 'student' => $student]) }}" 
                                       class="btn btn-outline-primary" title="Lihat Detail" data-bs-toggle="tooltip">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ tenant_route('tenant.students.edit', ['tenant' => $tenant->npsn, 'student' => $student]) }}" 
                                       class="btn btn-outline-warning" title="Edit" data-bs-toggle="tooltip">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ tenant_route('tenant.students.destroy', ['tenant' => $tenant->npsn, 'student' => $student]) }}" 
                                          method="POST" class="d-inline"
                                          onsubmit="return confirm('Apakah Anda yakin ingin menghapus siswa ini?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-outline-danger" title="Hapus" data-bs-toggle="tooltip">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="text-center py-5">
                                <div class="mb-3">
                                    <i class="fas fa-search fa-4x text-muted" style="opacity: 0.3;"></i>
                                </div>
                                @if(request('search') || request('class_id') || request('status') || request('gender'))
                                    <h5 class="text-muted mb-3">Tidak ada siswa yang ditemukan</h5>
                                    <p class="text-muted mb-4">
                                    @if(request('search'))
                                        Hasil pencarian untuk "<strong>{{ request('search') }}</strong>" tidak ditemukan.
                                    @endif
                                    @if(request('class_id'))
                                        {{ request('search') ? 'atau' : 'Siswa di' }} kelas yang dipilih tidak ditemukan.
                                    @endif
                                    @if(request('status'))
                                        {{ request('search') || request('class_id') ? 'atau' : 'Siswa dengan' }} status {{ request('status') == 'active' ? 'aktif' : 'tidak aktif' }} tidak ditemukan.
                                    @endif
                                    @if(request('gender'))
                                        {{ request('search') || request('class_id') || request('status') ? 'atau' : 'Siswa' }} dengan jenis kelamin {{ request('gender') == 'L' ? 'laki-laki' : 'perempuan' }} tidak ditemukan.
                                    @endif
                                    </p>
                                    <div class="d-flex gap-2 justify-content-center">
                                        <a href="{{ tenant_route('tenant.students.index', ['tenant' => $tenant->npsn]) }}" class="btn btn-outline-secondary">
                                            <i class="fas fa-times me-2"></i>Hapus Filter
                                        </a>
                                        <a href="{{ tenant_route('tenant.students.create', ['tenant' => $tenant->npsn]) }}" class="btn btn-primary">
                                            <i class="fas fa-plus me-2"></i>Tambah Siswa
                                        </a>
                                    </div>
                                @else
                                    <h5 class="text-muted mb-3">Belum ada data siswa</h5>
                                    <p class="text-muted mb-4">Mulai dengan menambahkan siswa pertama</p>
                                    <a href="{{ tenant_route('tenant.students.create', ['tenant' => $tenant->npsn]) }}" class="btn btn-primary">
                                        <i class="fas fa-plus me-2"></i>Tambah Siswa
                                    </a>
                                @endif
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
    </div>
    
    <!-- Pagination -->
    @if($students->hasPages())
        <div class="pagination-wrapper d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="pagination-info">
                <i class="fas fa-info-circle"></i>
                <span>
                    Menampilkan <strong>{{ $students->firstItem() }}</strong> sampai <strong>{{ $students->lastItem() }}</strong> 
                    dari <strong>{{ $students->total() }}</strong> siswa
                </span>
            </div>
            <div class="pagination-container">
                {{ $students->links() }}
            </div>
        </div>
    @elseif($students->count() > 0)
        <div class="pagination-wrapper">
            <div class="pagination-info">
                <i class="fas fa-info-circle"></i>
                <span>
                    Menampilkan <strong>{{ $students->count() }}</strong> siswa
                </span>
            </div>
        </div>
    @endif
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Fix pagination SVG icons size
    const fixPaginationIcons = function() {
        const paginationSvgs = document.querySelectorAll('.pagination-wrapper svg, .pagination-container svg, .pagination svg');
        paginationSvgs.forEach(function(svg) {
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.style.width = '16px';
            svg.style.height = '16px';
            svg.style.maxWidth = '16px';
            svg.style.maxHeight = '16px';
            svg.style.display = 'inline-block';
            svg.style.verticalAlign = 'middle';
        });
    };
    
    // Run immediately and after a short delay to catch dynamically loaded content
    fixPaginationIcons();
    setTimeout(fixPaginationIcons, 100);
    setTimeout(fixPaginationIcons, 500);
});
</script>
@endpush
