@extends('layouts.tenant')

@section('title', 'Data Alumni')
@section('page-title', 'Data Alumni')

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
    
    .stats-card.info::before {
        --card-color-1: #06b6d4;
        --card-color-2: #0891b2;
    }
    
    .stats-card.warning::before {
        --card-color-1: #f59e0b;
        --card-color-2: #d97706;
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
    
    .stats-icon.info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
    
    /* Modern Table Styles */
    .modern-table {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    
    .modern-table thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .modern-table thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .modern-table tbody tr {
        transition: all 0.2s ease;
    }
    
    .modern-table tbody tr:hover {
        background-color: #f8f9fa;
        transform: scale(1.01);
    }
    
    .modern-table tbody td {
        padding: 1rem;
        vertical-align: middle;
        border-top: 1px solid #e5e7eb;
    }
    
    /* Filter Card */
    .filter-card {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
    }
    
    /* Avatar Styles */
    .avatar-sm {
        width: 40px;
        height: 40px;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Badge Styles */
    .badge-modern {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Button Groups */
    .btn-action {
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card primary">
                <div class="d-flex align-items-center">
                    <div class="stats-icon primary me-3">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['total']) }}</div>
                        <div class="stats-label">Total Alumni</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card success">
                <div class="d-flex align-items-center">
                    <div class="stats-icon success me-3">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['employed']) }}</div>
                        <div class="stats-label">Bekerja</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card info">
                <div class="d-flex align-items-center">
                    <div class="stats-icon info me-3">
                        <i class="fas fa-university"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['studying']) }}</div>
                        <div class="stats-label">Kuliah</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card warning">
                <div class="d-flex align-items-center">
                    <div class="stats-icon warning me-3">
                        <i class="fas fa-store"></i>
                    </div>
                    <div>
                        <div class="stats-number">{{ number_format($stats['self_employed']) }}</div>
                        <div class="stats-label">Wiraswasta</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Main Content Card -->
    <div class="card modern-table">
        <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
            <div class="d-flex justify-content-between align-items-center">
                <h3 class="card-title mb-0" style="color: white;">
                    <i class="fas fa-graduation-cap me-2"></i>Data Alumni
                </h3>
                <div class="btn-group">
                    <a href="{{ tenant_route('tenant.alumni.statistics') }}" class="btn btn-light btn-sm">
                        <i class="fas fa-chart-bar"></i> Statistik
                    </a>
                    <a href="{{ tenant_route('tenant.alumni.create') }}" class="btn btn-light btn-sm">
                        <i class="fas fa-plus"></i> Tambah Alumni
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Filter Card -->
        <div class="filter-card">
            <form method="GET" action="{{ tenant_route('tenant.alumni.index') }}" class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small text-muted">Cari</label>
                    <input type="text" name="search" class="form-control form-control-sm" 
                           placeholder="Cari nama alumni..." 
                           value="{{ request('search') }}">
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Status</label>
                    <select name="status" class="form-select form-select-sm">
                        <option value="">Semua Status</option>
                        <option value="employed" {{ request('status') == 'employed' ? 'selected' : '' }}>Bekerja</option>
                        <option value="unemployed" {{ request('status') == 'unemployed' ? 'selected' : '' }}>Tidak Bekerja</option>
                        <option value="self_employed" {{ request('status') == 'self_employed' ? 'selected' : '' }}>Wiraswasta</option>
                        <option value="studying" {{ request('status') == 'studying' ? 'selected' : '' }}>Kuliah</option>
                        <option value="retired" {{ request('status') == 'retired' ? 'selected' : '' }}>Pensiun</option>
                        <option value="unknown" {{ request('status') == 'unknown' ? 'selected' : '' }}>Tidak Diketahui</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">Tahun Lulus</label>
                    <select name="graduation_year" class="form-select form-select-sm">
                        <option value="">Semua Tahun</option>
                        @foreach($graduationYears as $year)
                            <option value="{{ $year }}" {{ request('graduation_year') == $year ? 'selected' : '' }}>
                                {{ $year }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small text-muted">&nbsp;</label>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary btn-sm w-100">
                            <i class="fas fa-search"></i> Filter
                        </button>
                        <a href="{{ tenant_route('tenant.alumni.index') }}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-redo"></i>
                        </a>
                    </div>
                </div>
            </form>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0 modern-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Alumni</th>
                            <th>Tahun Lulus</th>
                            <th>Nilai Akhir</th>
                            <th>Status</th>
                            <th>Pekerjaan</th>
                            <th>Perusahaan</th>
                            <th>Kontak</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($alumni as $index => $item)
                        <tr>
                            <td>{{ $alumni->firstItem() + $index }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar-sm bg-primary text-white rounded-circle me-2">
                                        {{ substr($item->student->name ?? 'A', 0, 1) }}
                                    </div>
                                    <div>
                                        <strong>{{ $item->student->name ?? 'N/A' }}</strong>
                                        @if($item->is_active)
                                            <span class="badge bg-success badge-sm ms-1">Aktif</span>
                                        @else
                                            <span class="badge bg-secondary badge-sm ms-1">Tidak Aktif</span>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td>
                                <strong>{{ $item->graduation_year }}</strong>
                            </td>
                            <td>
                                <span class="badge badge-modern bg-{{ $item->grade_color ?? 'info' }}">
                                    {{ $item->final_grade }} ({{ $item->grade_label ?? 'N/A' }})
                                </span>
                                @if($item->gpa)
                                    <br><small class="text-muted">GPA: {{ $item->gpa }}</small>
                                @endif
                            </td>
                            <td>
                                <span class="badge badge-modern bg-{{ $item->status_color ?? 'secondary' }}">
                                    {{ $item->status_label ?? 'N/A' }}
                                </span>
                            </td>
                            <td>
                                @if($item->current_occupation)
                                    <div>
                                        <strong>{{ $item->current_occupation }}</strong>
                                        @if($item->position)
                                            <br><small class="text-muted">{{ $item->position }}</small>
                                        @endif
                                    </div>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                @if($item->company)
                                    <div>
                                        <strong>{{ $item->company }}</strong>
                                        @if($item->industry)
                                            <br><small class="text-muted">{{ $item->industry }}</small>
                                        @endif
                                    </div>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                @if($item->phone)
                                    <div><i class="fas fa-phone me-1"></i>{{ $item->phone }}</div>
                                @endif
                                @if($item->email)
                                    <div><i class="fas fa-envelope me-1"></i>{{ strlen($item->email) > 20 ? substr($item->email, 0, 20) . '...' : $item->email }}</div>
                                @endif
                                @if(!$item->phone && !$item->email)
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group" role="group">
                                    <a href="{{ tenant_route('tenant.alumni.show', $item) }}" 
                                       class="btn btn-info btn-sm btn-action" 
                                       title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ tenant_route('tenant.alumni.edit', $item) }}" 
                                       class="btn btn-warning btn-sm btn-action" 
                                       title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ tenant_route('tenant.alumni.toggle-active', $item) }}" 
                                          method="POST" class="d-inline">
                                        @csrf
                                        <button type="submit" 
                                                class="btn btn-{{ $item->is_active ? 'secondary' : 'success' }} btn-sm btn-action" 
                                                title="{{ $item->is_active ? 'Nonaktifkan' : 'Aktifkan' }}"
                                                onclick="return confirm('{{ $item->is_active ? 'Nonaktifkan' : 'Aktifkan' }} alumni ini?')">
                                            <i class="fas fa-{{ $item->is_active ? 'pause' : 'play' }}"></i>
                                        </button>
                                    </form>
                                    <form action="{{ tenant_route('tenant.alumni.destroy', $item) }}" 
                                          method="POST" class="d-inline"
                                          onsubmit="return confirm('Hapus alumni ini?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-danger btn-sm btn-action" title="Hapus">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="9" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-graduation-cap fa-3x mb-3 d-block"></i>
                                    <p class="mb-0">Belum ada data alumni</p>
                                    <a href="{{ tenant_route('tenant.alumni.create') }}" class="btn btn-primary btn-sm mt-3">
                                        <i class="fas fa-plus"></i> Tambah Alumni Pertama
                                    </a>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            @if($alumni->hasPages())
            <div class="card-footer bg-white">
                <div class="d-flex justify-content-center">
                    {{ $alumni->appends(request()->query())->links() }}
                </div>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection
