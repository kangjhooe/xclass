@extends('layouts.tenant')

@section('title', 'Sesi Konseling')
@section('page-title', 'Manajemen Sesi Konseling')

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
        width: 100%;
    }
    
    .table-modern thead th {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #495057;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 1px;
        padding: 1.25rem 1rem;
        border: none;
        border-bottom: 3px solid #667eea;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-left: 3px solid transparent;
    }
    
    .table-modern tbody tr:hover {
        background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-left-color: #667eea;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
    
    .table-modern tbody td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.95rem;
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
    
    /* Status Badge */
    .status-badge {
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Badge Styles */
    .badge {
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }
    
    .badge:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Action Buttons */
    .btn-sm {
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .btn-sm:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Empty State */
    .empty-state {
        padding: 4rem 2rem;
    }
    
    .empty-state i {
        opacity: 0.3;
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Page Header with Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 class="mb-2" style="font-weight: 800; font-size: 2rem;">
                            <i class="fas fa-comments me-2" style="color: #667eea;"></i>
                            Manajemen Sesi Konseling
                        </h2>
                        <p class="text-muted mb-0" style="font-size: 1.05rem;">Kelola semua sesi konseling siswa dengan mudah dan efisien</p>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="{{ tenant_route('counseling.index') }}" class="quick-action-btn secondary">
                            <i class="fas fa-arrow-left"></i>
                            Kembali
                        </a>
                        <a href="{{ tenant_route('counseling.sessions.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus-circle"></i>
                            Buat Sesi Baru
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Sessions Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Daftar Sesi Konseling
                </div>
                <div class="card-body p-0">
                    @if($sessions->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Siswa</th>
                                        <th>Konselor</th>
                                        <th>Tipe</th>
                                        <th>Kategori</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($sessions as $session)
                                    <tr>
                                        <td>
                                            <strong>{{ $session->session_date ? \App\Helpers\DateHelper::formatIndonesian($session->session_date) : '-' }}</strong>
                                        </td>
                                        <td>
                                            <strong>{{ $session->student->name ?? 'N/A' }}</strong>
                                            @if($session->student && $session->student->classRoom)
                                                <br><small class="text-muted">{{ $session->student->classRoom->name }}</small>
                                            @elseif($session->student && $session->student->class)
                                                <br><small class="text-muted">{{ $session->student->class->name }}</small>
                                            @endif
                                        </td>
                                        <td>{{ $session->counselor->name ?? 'N/A' }}</td>
                                        <td>
                                            <span class="badge bg-info">{{ $session->type_label ?? ucfirst($session->session_type ?? 'N/A') }}</span>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $session->category_color ?? 'secondary' }}">
                                                {{ $session->category_label ?? $session->issue_category ?? 'N/A' }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="status-badge bg-{{ $session->status_color ?? 'secondary' }} text-white">
                                                {{ $session->status_label ?? ucfirst($session->status ?? 'N/A') }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('counseling.sessions.edit', $session->id) }}" class="btn btn-sm btn-outline-primary" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('counseling.sessions.destroy', $session->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus sesi ini?');">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="card-footer bg-white">
                            {{ $sessions->links() }}
                        </div>
                    @else
                        <div class="text-center empty-state">
                            <i class="fas fa-inbox fa-5x text-muted mb-4"></i>
                            <h4 class="text-muted mb-2" style="font-weight: 600;">Belum ada sesi konseling</h4>
                            <p class="text-muted mb-4" style="font-size: 1.05rem;">Mulai dengan membuat sesi konseling pertama untuk membantu siswa</p>
                            <a href="{{ tenant_route('counseling.sessions.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus-circle"></i>
                                Buat Sesi Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
