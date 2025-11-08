@extends('layouts.tenant')

@section('title', 'Dashboard Data Pokok')
@section('page-title', 'Dashboard Data Pokok')

@push('styles')
<style>
    /* Modern Stats Cards */
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before {
        --card-color-1: #3b82f6;
        --card-color-2: #1d4ed8;
    }
    
    .stats-card.success::before {
        --card-color-1: #10b981;
        --card-color-2: #059669;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
    }
    
    .stats-card.info::before {
        --card-color-1: #06b6d4;
        --card-color-2: #0891b2;
    }
    
    .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }
    
    .stats-number {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0.5rem 0;
        color: #1f2937;
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .modern-card-header.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .modern-card-header.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .modern-card-header.info {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: #fff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        text-decoration: none;
        color: #374151;
        transition: all 0.3s ease;
        display: block;
        position: relative;
        overflow: hidden;
    }
    
    .quick-action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }
    
    .quick-action-btn:hover::before {
        left: 100%;
    }
    
    .quick-action-btn:hover {
        border-color: #667eea;
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
        color: #667eea;
    }
    
    .quick-action-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        font-size: 20px;
        color: white;
    }
    
    /* Recent Item Styles */
    .recent-item {
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 0.75rem;
        transition: all 0.3s ease;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
    }
    
    .recent-item:hover {
        background: #fff;
        border-color: #667eea;
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .avatar-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        color: white;
        flex-shrink: 0;
    }
    
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
    }
    
    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .page-header p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1><i class="fas fa-database me-3"></i>Dashboard Data Pokok</h1>
    <p>Ringkasan data pokok sekolah Anda</p>
</div>

<!-- Statistik Cards -->
<div class="row g-4 mb-4">
    <div class="col-xl-3 col-md-6">
        <div class="stats-card primary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Guru</div>
                    <div class="stats-number text-primary">{{ $stats['teachers'] }}</div>
                    <small class="text-muted">Daftar guru aktif</small>
                </div>
                <div class="stats-icon primary">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="stats-card success">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Siswa</div>
                    <div class="stats-number text-success">{{ $stats['students'] }}</div>
                    <small class="text-muted">Daftar siswa aktif</small>
                </div>
                <div class="stats-icon success">
                    <i class="fas fa-user-graduate"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="stats-card warning">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Staf Non-Guru</div>
                    <div class="stats-number text-warning">{{ $stats['staff'] }}</div>
                    <small class="text-muted">Tenaga kependidikan</small>
                </div>
                <div class="stats-icon warning">
                    <i class="fas fa-users"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="stats-card info">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Kelas</div>
                    <div class="stats-number text-info">{{ $stats['classes'] }}</div>
                    <small class="text-muted">Kelas tersedia</small>
                </div>
                <div class="stats-icon info">
                    <i class="fas fa-door-open"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-bolt me-2"></i>
                    Aksi Cepat
                </h6>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.teachers.create') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="fw-semibold">Tambah Guru</div>
                        </a>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.students.create') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="fw-semibold">Tambah Siswa</div>
                        </a>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.create') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="fw-semibold">Tambah Staf</div>
                        </a>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <a href="{{ tenant_route('tenant.classes.create') }}" class="quick-action-btn">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="fw-semibold">Tambah Kelas</div>
                        </a>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button type="button" class="quick-action-btn w-100" data-bs-toggle="modal" data-bs-target="#searchModal" style="border: none; background: #fff;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="fw-semibold">Cari Data</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Activities -->
<div class="row g-4 mb-4">
    <!-- Recent Teachers -->
    <div class="col-lg-4 col-md-6">
        <div class="modern-card">
            <div class="modern-card-header info d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-chalkboard-teacher me-2"></i>
                    Guru Terbaru
                </h6>
                <a href="{{ tenant_route('tenant.teachers.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Semua
                </a>
            </div>
            <div class="card-body p-3">
                @if($recentTeachers->count() > 0)
                    @foreach($recentTeachers as $teacher)
                        <a href="{{ tenant_route('tenant.teachers.show', $teacher) }}" class="recent-item text-decoration-none d-block">
                            <div class="d-flex align-items-center">
                                <div class="avatar-circle" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                    {{ strtoupper(substr($teacher->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h6 class="mb-0 text-dark">{{ $teacher->name }}</h6>
                                    <small class="text-muted">
                                        <i class="fas fa-id-card me-1"></i>{{ $teacher->nip ?? 'Belum ada NIP' }}
                                    </small>
                                </div>
                                <i class="fas fa-chevron-right text-muted"></i>
                            </div>
                        </a>
                    @endforeach
                @else
                    <div class="text-center py-5">
                        <div class="mb-3">
                            <i class="fas fa-chalkboard-teacher fa-4x text-muted" style="opacity: 0.3;"></i>
                        </div>
                        <p class="text-muted mb-0">Belum ada data guru</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <!-- Recent Students -->
    <div class="col-lg-4 col-md-6">
        <div class="modern-card">
            <div class="modern-card-header success d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-user-graduate me-2"></i>
                    Siswa Terbaru
                </h6>
                <a href="{{ tenant_route('tenant.students.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Semua
                </a>
            </div>
            <div class="card-body p-3">
                @if($recentStudents->count() > 0)
                    @foreach($recentStudents as $student)
                        <a href="{{ tenant_route('tenant.students.show', $student) }}" class="recent-item text-decoration-none d-block">
                            <div class="d-flex align-items-center">
                                <div class="avatar-circle" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                    {{ strtoupper(substr($student->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h6 class="mb-0 text-dark">{{ $student->name }}</h6>
                                    <small class="text-muted">
                                        <i class="fas fa-id-card me-1"></i>{{ $student->nisn ?? 'Belum ada NISN' }}
                                    </small>
                                </div>
                                <i class="fas fa-chevron-right text-muted"></i>
                            </div>
                        </a>
                    @endforeach
                @else
                    <div class="text-center py-5">
                        <div class="mb-3">
                            <i class="fas fa-user-graduate fa-4x text-muted" style="opacity: 0.3;"></i>
                        </div>
                        <p class="text-muted mb-0">Belum ada data siswa</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
    
    <!-- Recent Staff -->
    <div class="col-lg-4 col-md-6">
        <div class="modern-card">
            <div class="modern-card-header warning d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-users me-2"></i>
                    Staf Terbaru
                </h6>
                <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Semua
                </a>
            </div>
            <div class="card-body p-3">
                @if($recentStaff->count() > 0)
                    @foreach($recentStaff as $staff)
                        <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.show', $staff) }}" class="recent-item text-decoration-none d-block">
                            <div class="d-flex align-items-center">
                                <div class="avatar-circle" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                    {{ strtoupper(substr($staff->name, 0, 1)) }}
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h6 class="mb-0 text-dark">{{ $staff->name }}</h6>
                                    <small class="text-muted">
                                        <i class="fas fa-briefcase me-1"></i>{{ $staff->position ?? 'Tidak ada posisi' }}
                                    </small>
                                </div>
                                <i class="fas fa-chevron-right text-muted"></i>
                            </div>
                        </a>
                    @endforeach
                @else
                    <div class="text-center py-5">
                        <div class="mb-3">
                            <i class="fas fa-users fa-4x text-muted" style="opacity: 0.3;"></i>
                        </div>
                        <p class="text-muted mb-0">Belum ada data staf</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Export Options -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-download me-2"></i>
                    Export Data
                </h6>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button class="quick-action-btn w-100" onclick="exportData('all')" style="border: none;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="fw-semibold">Export Semua</div>
                        </button>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button class="quick-action-btn w-100" onclick="exportData('teachers')" style="border: none;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="fw-semibold">Export Guru</div>
                        </button>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button class="quick-action-btn w-100" onclick="exportData('students')" style="border: none;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="fw-semibold">Export Siswa</div>
                        </button>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button class="quick-action-btn w-100" onclick="exportData('staff')" style="border: none;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="fw-semibold">Export Staf</div>
                        </button>
                    </div>
                    <div class="col-lg-2 col-md-4 col-sm-6">
                        <button class="quick-action-btn w-100" onclick="exportData('classes')" style="border: none;">
                            <div class="quick-action-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="fw-semibold">Export Kelas</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Search Modal -->
<div class="modal fade" id="searchModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px; border: none;">
            <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0;">
                <h5 class="modal-title">
                    <i class="fas fa-search me-2"></i>Pencarian Data Pokok
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <div class="input-group input-group-lg mb-4">
                    <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-search text-muted"></i>
                    </span>
                    <input type="text" class="form-control border-start-0" id="searchInput" placeholder="Cari nama, NIP, NISN, atau posisi..." autocomplete="off" style="border-radius: 0 12px 12px 0;">
                    <button class="btn btn-primary" type="button" onclick="performSearch()" style="border-radius: 0 12px 12px 0;">
                        <i class="fas fa-search me-1"></i>Cari
                    </button>
                </div>
                <div id="searchResults" class="mt-3"></div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function exportData(type) {
    // Show loading state
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
    btn.disabled = true;
    
    // Create download link
    const url = `{{ tenant_route('tenant.data-pokok.export') }}?type=${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button after a short delay
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 1000);
}

function performSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query.trim()) {
        alert('Masukkan kata kunci pencarian');
        return;
    }
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin me-2"></i>Mencari...</div>';
    
    fetch(`{{ tenant_route('tenant.data-pokok.search') }}?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            if (!data.results || data.results.length === 0) {
                resultsDiv.innerHTML = '<p class="text-muted text-center py-3">Tidak ada hasil ditemukan</p>';
                return;
            }
            
            let html = '<div class="d-flex flex-column gap-2">';
            data.results.forEach(result => {
                const typeConfig = {
                    'teacher': { 
                        label: 'Guru', 
                        color: 'primary', 
                        icon: 'fa-chalkboard-teacher',
                        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    },
                    'student': { 
                        label: 'Siswa', 
                        color: 'success', 
                        icon: 'fa-user-graduate',
                        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    },
                    'staff': { 
                        label: 'Staf', 
                        color: 'warning', 
                        icon: 'fa-users',
                        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }
                };
                const config = typeConfig[result.type] || { 
                    label: result.type, 
                    color: 'secondary', 
                    icon: 'fa-user',
                    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                };
                
                html += `
                    <a href="${result.url}" class="recent-item text-decoration-none d-block">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle" style="background: ${config.gradient};">
                                <i class="fas ${config.icon}"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h6 class="mb-0 text-dark">${result.title}</h6>
                                <small class="text-muted">${result.subtitle || '-'}</small>
                            </div>
                            <span class="badge bg-${config.color} me-2">${config.label}</span>
                            <i class="fas fa-chevron-right text-muted"></i>
                        </div>
                    </a>
                `;
            });
            html += '</div>';
            resultsDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p class="text-danger text-center py-3">Terjadi kesalahan saat mencari. Silakan coba lagi.</p>';
        });
}

// Allow search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});
</script>
@endsection
