@extends('layouts.tenant')

@section('title', 'Siswa - Bimbingan Konseling')
@section('page-title', 'Manajemen Siswa Konseling')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
    }
    
    .page-header h2 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* Modern Stats Cards */
    .stats-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        border: none;
        backdrop-filter: blur(10px);
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
        border-radius: 20px 20px 0 0;
    }
    
    .stats-card::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    .stats-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .stats-card:hover::after {
        opacity: 1;
    }
    
    .stats-card.primary::before {
        --card-color-1: #667eea;
        --card-color-2: #764ba2;
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
        width: 72px;
        height: 72px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }
    
    .stats-card:hover .stats-icon {
        transform: rotate(5deg) scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        font-size: 3rem;
        font-weight: 800;
        margin: 0.5rem 0;
        background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
        transition: all 0.3s ease;
    }
    
    .stats-card:hover .stats-number {
        transform: scale(1.05);
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    
    .modern-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem 2rem;
        border: none;
        font-weight: 700;
        font-size: 1.125rem;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
    }
    
    .modern-card-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .modern-card:hover .modern-card-header::before {
        left: 100%;
    }
    
    /* Table Styles */
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
    }
    
    .table-modern thead th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        padding: 1rem;
        border: none;
        border-bottom: 2px solid #e9ecef;
    }
    
    .table-modern tbody tr {
        transition: all 0.2s ease;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9fa;
        transform: scale(1.01);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .table-modern tbody td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.875rem 1.75rem;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    .quick-action-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .quick-action-btn:hover::before {
        width: 300px;
        height: 300px;
    }
    
    .quick-action-btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        color: white;
    }
    
    .quick-action-btn:active {
        transform: translateY(-1px) scale(1.02);
    }
    
    .quick-action-btn.secondary {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
    }
    
    .quick-action-btn.secondary:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }
    
    /* Student Card */
    .student-card {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .student-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-users me-3"></i>
                Manajemen Siswa Konseling
            </h2>
            <p>Kelola siswa yang mengikuti bimbingan konseling</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                <a href="{{ tenant_route('counseling.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-arrow-left me-2"></i> Kembali
                </a>
                <a href="{{ tenant_route('counseling.sessions.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                    <i class="fas fa-plus-circle me-2"></i> Buat Sesi Baru
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Stats Cards -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card primary fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-users"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #1e40af; font-size: 2rem;">{{ $students->total() ?? $students->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Total Siswa</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card success fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-comments"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #047857; font-size: 2rem;">{{ $students->filter(function($s) { return $s->counselingSessions->where('status', 'in_progress')->count() > 0; })->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Aktif Konseling</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card warning fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #d97706; font-size: 2rem;">{{ $students->filter(function($s) { return $s->counselingSessions->where('status', 'scheduled')->count() > 0; })->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Perlu Perhatian</p>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card info fade-in-up fade-in-up-delay-5">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="mb-1" style="font-weight: 700; color: #0369a1; font-size: 2rem;">{{ $students->filter(function($s) { return $s->counselingSessions->where('status', 'completed')->count() > 0; })->count() }}</h3>
            <p class="mb-0 text-muted" style="font-size: 0.9rem; font-weight: 500;">Selesai Konseling</p>
        </div>
    </div>
</div>

<!-- Students Table -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Siswa
                </h5>
            </div>
                <div class="card-body p-0">
                    @if($students->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Siswa</th>
                                        <th>Kelas</th>
                                        <th>NIS</th>
                                        <th>Status</th>
                                        <th>Sesi</th>
                                        <th>Sesi Terakhir</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($students as $index => $student)
                                    @php
                                        $sessions = $student->counselingSessions ?? collect();
                                        $latestSession = $sessions->sortByDesc('session_date')->first();
                                        $activeSessions = $sessions->where('status', 'in_progress')->count();
                                        $totalSessions = $sessions->count();
                                        $className = $student->classRoom->name ?? ($student->class->name ?? 'N/A');
                                    @endphp
                                    <tr>
                                        <td>{{ ($students->currentPage() - 1) * $students->perPage() + $index + 1 }}</td>
                                        <td>
                                            <strong>{{ $student->name }}</strong>
                                        </td>
                                        <td>
                                            <span class="badge bg-info">{{ $className }}</span>
                                        </td>
                                        <td>{{ $student->student_number ?? 'N/A' }}</td>
                                        <td>
                                            @if($activeSessions > 0)
                                                <span class="badge bg-success">Aktif</span>
                                            @elseif($totalSessions > 0)
                                                <span class="badge bg-info">Selesai</span>
                                            @else
                                                <span class="badge bg-secondary">Belum Ada</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge bg-primary">{{ $totalSessions }} Sesi</span>
                                        </td>
                                        <td>
                                            @if($latestSession)
                                                {{ $latestSession->session_date ? \App\Helpers\DateHelper::formatIndonesian($latestSession->session_date) : '-' }}
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('counseling.sessions.create') }}?student_id={{ $student->id }}" 
                                                   class="btn btn-sm btn-outline-success" 
                                                   title="Buat Sesi">
                                                    <i class="fas fa-plus"></i>
                                                </a>
                                                @if($totalSessions > 0)
                                                <button type="button" 
                                                        class="btn btn-sm btn-outline-primary" 
                                                        onclick="showHistory('{{ $student->nisn }}')"
                                                        title="Riwayat">
                                                    <i class="fas fa-history"></i>
                                                </button>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        @if(method_exists($students, 'links'))
                        <div class="card-footer">
                            {{ $students->links() }}
                        </div>
                        @endif
                    @else
                        <div class="card-body text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                                <h5 class="text-muted">Belum ada siswa yang mengikuti konseling</h5>
                                <p class="text-muted mb-4">Mulai dengan membuat sesi konseling pertama</p>
                                <a href="{{ tenant_route('counseling.sessions.create') }}" class="btn btn-modern btn-primary">
                                    <i class="fas fa-plus me-2"></i>
                                    Buat Sesi Pertama
                                </a>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal for History -->
<div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h5 class="modal-title" id="historyModalLabel">
                    <i class="fas fa-history me-2"></i>
                    Riwayat Konseling
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="historyContent">
                <div class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function showHistory(studentNisn) {
        const modal = new bootstrap.Modal(document.getElementById('historyModal'));
        const content = document.getElementById('historyContent');
        
        content.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        modal.show();
        
        fetch(`{{ tenant_route('counseling.sessions.history', 'PLACEHOLDER') }}`.replace('PLACEHOLDER', studentNisn))
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    let html = '<div class="table-responsive"><table class="table table-sm">';
                    html += '<thead><tr><th>Tanggal</th><th>Konselor</th><th>Kategori</th><th>Status</th></tr></thead>';
                    html += '<tbody>';
                    data.forEach(session => {
                        html += `<tr>
                            <td>${session.session_date ? new Date(session.session_date).toLocaleDateString('id-ID') : '-'}</td>
                            <td>${session.counselor ? session.counselor.name : 'N/A'}</td>
                            <td><span class="badge bg-info">${session.category_label || session.category || 'N/A'}</span></td>
                            <td><span class="badge bg-${session.status_color || 'secondary'}">${session.status_label || session.status || 'N/A'}</span></td>
                        </tr>`;
                    });
                    html += '</tbody></table></div>';
                    content.innerHTML = html;
                } else {
                    content.innerHTML = '<div class="text-center p-4"><p class="text-muted">Belum ada riwayat konseling</p></div>';
                }
            })
            .catch(error => {
                content.innerHTML = '<div class="alert alert-danger">Gagal memuat riwayat konseling</div>';
            });
    }
</script>
@endpush
