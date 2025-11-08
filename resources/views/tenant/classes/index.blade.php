@extends('layouts.tenant')

@section('title', 'Kelas')
@section('page-title', 'Kelas')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-door-open me-3"></i>
                Daftar Kelas
            </h2>
            <p>Kelola data kelas sekolah Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.classes.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Kelas
            </a>
        </div>
    </div>
</div>

<!-- Modern Card -->
<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-list me-2 text-primary"></i>
            Data Kelas
        </h5>
    </div>
    
    <div class="card-body p-4">
        @if($classes->count() > 0)
            <div class="table-responsive">
                <table class="table table-modern">
                    <thead>
                        <tr>
                            <th>Nama Kelas</th>
                            <th>Level</th>
                            <th>Jurusan</th>
                            <th>Kapasitas</th>
                            <th>Ruangan</th>
                            <th>Wali Kelas</th>
                            <th>Status</th>
                            <th class="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($classes as $class)
                            <tr>
                                <td>
                                    <strong>{{ $class->name }}</strong>
                                    @if($class->description)
                                        <br><small class="text-muted">{{ $class->description }}</small>
                                    @endif
                                </td>
                                <td>
                                    <span class="badge bg-secondary">{{ $class->level ?? '-' }}</span>
                                </td>
                                <td>
                                    @if($class->major)
                                        <span class="badge bg-info">{{ $class->major }}</span>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <div class="progress" style="height: 8px;">
                                                @php
                                                    $percentage = $class->capacity > 0 ? ($class->students_count / $class->capacity) * 100 : 0;
                                                    $progressColor = $percentage >= 90 ? 'danger' : ($percentage >= 75 ? 'warning' : 'success');
                                                @endphp
                                                <div class="progress-bar bg-{{ $progressColor }}" role="progressbar" 
                                                     style="width: {{ min($percentage, 100) }}%"></div>
                                            </div>
                                        </div>
                                        <span class="badge bg-info ms-2">{{ $class->students_count }}/{{ $class->capacity }}</span>
                                    </div>
                                </td>
                                <td>
                                    @if($class->room_number)
                                        <span class="badge bg-light text-dark">{{ $class->room_number }}</span>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    @if($class->homeroomTeacher)
                                        <span class="badge bg-info">
                                            <i class="fas fa-user-tie me-1"></i>
                                            {{ $class->homeroomTeacher->name }}
                                        </span>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="badge bg-{{ $class->is_active ? 'success' : 'secondary' }}">
                                        {{ $class->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <a href="{{ tenant_route('tenant.classes.show', ['class' => $class->id]) }}" 
                                           class="btn btn-outline-primary" title="Lihat" data-bs-toggle="tooltip">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ tenant_route('tenant.classes.edit', ['class' => $class->id]) }}" 
                                           class="btn btn-outline-warning" title="Edit" data-bs-toggle="tooltip">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ tenant_route('tenant.classes.destroy', ['class' => $class->id]) }}" 
                                              method="POST" class="d-inline"
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus kelas ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-outline-danger" title="Hapus" data-bs-toggle="tooltip">
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
            
            @if($classes->hasPages())
                <div class="d-flex justify-content-center mt-4">
                    {{ $classes->links() }}
                </div>
            @endif
        @else
            <div class="text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-door-open fa-4x text-muted" style="opacity: 0.3;"></i>
                </div>
                <h5 class="text-muted mb-3">Belum ada kelas</h5>
                <p class="text-muted mb-4">Mulai dengan menambahkan kelas pertama</p>
                <a href="{{ tenant_route('tenant.classes.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Tambah Kelas
                </a>
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
});
</script>
@endpush

