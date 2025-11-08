@extends('layouts.admin-simple')

@push('styles')
<style>
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
                    <h1 class="h3 mb-1">Pengumuman</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <div>
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left me-2"></i>Kembali
                    </a>
                    <a href="{{ tenant_route('tenant.elearning.announcements.create', $course) }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Buat Pengumuman
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Announcements List -->
    <div class="row">
        @forelse($announcements as $announcement)
        <div class="col-12 mb-3">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); border-left: 4px solid {{ $announcement->is_important ? '#dc3545' : '#667eea' }};">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="mb-1">
                                @if($announcement->is_important)
                                <i class="fas fa-exclamation-circle text-danger me-2"></i>
                                @endif
                                {{ $announcement->title }}
                            </h5>
                            <p class="text-muted small mb-0">
                                <i class="fas fa-user me-1"></i>{{ $announcement->creator->name }}
                                <span class="ms-2"><i class="fas fa-calendar me-1"></i>{{ $announcement->created_at->format('d-m-Y H:i') }}</span>
                            </p>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('tenant.elearning.announcements.show', [$course, $announcement]) }}" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="{{ tenant_route('tenant.elearning.announcements.edit', [$course, $announcement]) }}" class="btn btn-sm btn-outline-warning">
                                <i class="fas fa-edit"></i>
                            </a>
                            <form action="{{ tenant_route('tenant.elearning.announcements.destroy', [$course, $announcement]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                    <p class="mb-0">{{ Str::limit(strip_tags($announcement->content), 150) }}</p>
                </div>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-body text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-bullhorn empty-state-icon"></i>
                        <h5 class="empty-state-title">Belum ada pengumuman</h5>
                        <p class="empty-state-text">Mulai membuat pengumuman pertama</p>
                        <a href="{{ tenant_route('tenant.elearning.announcements.create', $course) }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>Buat Pengumuman
                        </a>
                    </div>
                </div>
            </div>
        </div>
        @endforelse
    </div>
</div>
@endsection

