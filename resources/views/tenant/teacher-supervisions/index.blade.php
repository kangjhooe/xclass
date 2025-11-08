@extends('layouts.tenant')

@section('title', 'Supervisi Guru')
@section('page-title', 'Supervisi Guru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-clipboard-check me-3"></i>
                Supervisi Guru
            </h2>
            <p>Kelola dan pantau supervisi guru untuk meningkatkan kualitas pembelajaran</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.teacher-supervisions.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Supervisi
            </a>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="filter-card fade-in-up fade-in-up-delay-5 mb-3">
    <form method="GET" action="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Guru yang Disupervisi</label>
                    <select name="teacher_id" class="form-select">
                        <option value="">Semua Guru</option>
                        @foreach($teachers as $teacher)
                            <option value="{{ $teacher->id }}" {{ request('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                {{ $teacher->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Supervisor</label>
                    <select name="supervisor_id" class="form-select">
                        <option value="">Semua Supervisor</option>
                        @foreach($teachers as $teacher)
                            <option value="{{ $teacher->id }}" {{ request('supervisor_id') == $teacher->id ? 'selected' : '' }}>
                                {{ $teacher->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-select">
                        <option value="">Semua Status</option>
                        <option value="draft" {{ request('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Selesai</option>
                        <option value="archived" {{ request('status') == 'archived' ? 'selected' : '' }}>Diarsipkan</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Tahun Ajaran</label>
                    <input type="text" name="academic_year" class="form-control" value="{{ request('academic_year') }}" placeholder="2024/2025">
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-semibold">&nbsp;</label>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-modern btn-primary w-100">
                            <i class="fas fa-search me-2"></i> Filter
                        </button>
                        <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-redo"></i>
                        </a>
                    </div>
                </div>
            </form>
</div>

<!-- Table -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Supervisi (Total: {{ $supervisions->total() }})
        </h5>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-modern mb-0">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Guru</th>
                    <th>Supervisor</th>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Nilai</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($supervisions as $supervision)
                    <tr>
                        <td>
                            <strong>{{ \Carbon\Carbon::parse($supervision->supervision_date)->format('d-m-Y') }}</strong>
                            @if($supervision->start_time)
                                <br><small class="text-muted">{{ \Carbon\Carbon::parse($supervision->start_time)->format('H:i') }}</small>
                            @endif
                        </td>
                        <td>
                            <strong>{{ $supervision->teacher->name }}</strong>
                            <br><small class="text-muted">{{ $supervision->teacher->employee_number }}</small>
                        </td>
                        <td>
                            <strong>{{ $supervision->supervisor->name }}</strong>
                        </td>
                        <td>{{ $supervision->classRoom ? $supervision->classRoom->name : '-' }}</td>
                        <td>{{ $supervision->subject ? $supervision->subject->name : '-' }}</td>
                        <td>
                            @if($supervision->overall_score)
                                <strong class="text-primary">{{ number_format($supervision->overall_score, 2) }}</strong>
                                <br><small class="badge badge-modern badge-info">{{ $supervision->overall_rating_label }}</small>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                        <td>
                            @if($supervision->status == 'completed')
                                <span class="badge badge-modern badge-success">Selesai</span>
                            @elseif($supervision->status == 'draft')
                                <span class="badge badge-modern badge-secondary">Draft</span>
                            @else
                                <span class="badge badge-modern badge-info">Diarsipkan</span>
                            @endif
                            @if($supervision->is_confirmed)
                                <br><small class="badge badge-modern badge-success mt-1">Terkonfirmasi</small>
                            @endif
                        </td>
                        <td>
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('tenant.teacher-supervisions.show', ['teacher_supervision' => $supervision->id]) }}" 
                                   class="btn btn-modern btn-primary btn-sm" title="Lihat Detail">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ tenant_route('tenant.teacher-supervisions.edit', ['teacher_supervision' => $supervision->id]) }}" 
                                   class="btn btn-modern btn-warning btn-sm" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form action="{{ tenant_route('tenant.teacher-supervisions.destroy', ['teacher_supervision' => $supervision->id]) }}" 
                                      method="POST" class="d-inline" 
                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus supervisi ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-clipboard-check fa-3x mb-3" style="opacity: 0.3;"></i>
                                <h5 class="text-muted">Belum ada data supervisi</h5>
                                <p class="text-muted">Mulai dengan menambahkan supervisi pertama Anda</p>
                                <a href="{{ tenant_route('tenant.teacher-supervisions.create') }}" class="btn btn-modern btn-primary">
                                    <i class="fas fa-plus me-2"></i>Tambah Supervisi
                                </a>
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        </div>
    </div>
    
    <!-- Pagination -->
    @if($supervisions->hasPages())
        <div class="card-footer">
            <div class="d-flex justify-content-center">
                {{ $supervisions->links() }}
            </div>
        </div>
    @endif
</div>
@endsection

