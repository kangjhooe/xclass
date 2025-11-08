@extends('layouts.tenant')

@section('title', 'Bimbingan Konseling')
@section('page-title', 'Sistem Bimbingan Konseling')

@push('styles')
<style>
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
    
    /* Badge Styles */
    .badge {
        padding: 0.5rem 0.875rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Stats Cards -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Total Sesi</div>
                        <div class="stats-number">{{ $stats['total_sessions'] }}</div>
                    </div>
                    <div class="stats-icon primary">
                        <i class="fas fa-comments"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Selesai</div>
                        <div class="stats-number">{{ $stats['completed_sessions'] }}</div>
                    </div>
                    <div class="stats-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Berlangsung</div>
                        <div class="stats-number">{{ $stats['active_sessions'] }}</div>
                    </div>
                    <div class="stats-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stats-card info">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="stats-label">Bulan Ini</div>
                        <div class="stats-number">{{ $stats['this_month_sessions'] }}</div>
                    </div>
                    <div class="stats-icon info">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-bolt me-2"></i>
                    Aksi Cepat
                </div>
                <div class="card-body p-4">
                    <div class="d-flex gap-3 flex-wrap">
                        <a href="{{ tenant_route('counseling.sessions.create') }}" class="quick-action-btn">
                            <i class="fas fa-plus-circle"></i>
                            Buat Sesi Konseling
                        </a>
                        <a href="{{ tenant_route('counseling.sessions') }}" class="quick-action-btn secondary">
                            <i class="fas fa-list-ul"></i>
                            Daftar Sesi
                        </a>
                        <a href="{{ tenant_route('counseling.students') }}" class="quick-action-btn secondary">
                            <i class="fas fa-users"></i>
                            Manajemen Siswa
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Sessions -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-history me-2"></i>
                    Sesi Terbaru
                </div>
                <div class="card-body p-0">
                    @if($recentSessions->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Siswa</th>
                                        <th>Konselor</th>
                                        <th>Kategori</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($recentSessions as $session)
                                    <tr>
                                        <td>{{ $session->session_date ? \App\Helpers\DateHelper::formatIndonesian($session->session_date) : '-' }}</td>
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
                                            <span class="badge bg-info">{{ $session->category_label ?? $session->issue_category ?? 'N/A' }}</span>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $session->status_color ?? 'secondary' }}">
                                                {{ $session->status_label ?? ucfirst($session->status ?? 'N/A') }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('counseling.sessions.edit', $session->id) }}" class="btn btn-sm btn-outline-primary" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center p-4">
                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Belum ada sesi konseling</p>
                            <a href="{{ tenant_route('counseling.sessions.create') }}" class="quick-action-btn">
                                                <i class="fas fa-plus"></i>
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
