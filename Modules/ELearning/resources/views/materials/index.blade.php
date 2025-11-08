@extends('layouts.admin-simple')

@push('styles')
<style>
    .course-card, .stats-card, .form-card, .info-card, .feature-card, .table-modern {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
    }
    .course-card:hover, .stats-card:hover, .info-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
    }
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .table-modern thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
    }
    .empty-state-icon {
        font-size: 4rem;
        color: #9ca3af;
        margin-bottom: 1rem;
    }
    .empty-state-title {
        color: #6b7280;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    .empty-state-text {
        color: #9ca3af;
        margin-bottom: 1.5rem;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1 class="h3 mb-1">Materi Pembelajaran</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <div>
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left me-2"></i>Kembali
                    </a>
                    <a href="{{ tenant_route('tenant.elearning.materials.create', $course) }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Tambah Materi
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Materials List -->
    <div class="row">
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-header bg-white" style="border-bottom: 2px solid #e5e7eb;">
                    <h5 class="mb-0">
                        <i class="fas fa-file-alt me-2 text-primary"></i>Daftar Materi
                    </h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-modern table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Judul</th>
                                    <th>Tipe</th>
                                    <th>Bab</th>
                                    <th>Urutan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($materials as $index => $material)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        <strong>{{ $material->title }}</strong>
                                        @if($material->file_name)
                                        <br><small class="text-muted"><i class="fas fa-file me-1"></i>{{ $material->file_name }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge bg-secondary">{{ ucfirst($material->type) }}</span>
                                    </td>
                                    <td>{{ $material->chapter ?? '-' }}</td>
                                    <td>{{ $material->order }}</td>
                                    <td>
                                        <span class="badge bg-{{ $material->is_published ? 'success' : 'secondary' }}">
                                            {{ $material->is_published ? 'Published' : 'Draft' }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="{{ tenant_route('tenant.elearning.materials.show', [$course, $material]) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.elearning.materials.edit', [$course, $material]) }}" class="btn btn-sm btn-outline-warning">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('tenant.elearning.materials.destroy', [$course, $material]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="7" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-file-alt empty-state-icon"></i>
                                            <h5 class="empty-state-title">Belum ada materi</h5>
                                            <p class="empty-state-text">Mulai tambahkan materi pembelajaran pertama</p>
                                            <a href="{{ tenant_route('tenant.elearning.materials.create', $course) }}" class="btn btn-primary">
                                                <i class="fas fa-plus me-2"></i>Tambah Materi
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

