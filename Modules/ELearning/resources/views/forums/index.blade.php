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
                    <h1 class="h3 mb-1">Forum Diskusi</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <div>
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left me-2"></i>Kembali
                    </a>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createForumModal">
                        <i class="fas fa-plus me-2"></i>Buat Forum
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Forums List -->
    <div class="row">
        @forelse($forums as $forum)
        <div class="col-md-6 mb-3">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-1">
                                @if($forum->is_pinned)
                                <i class="fas fa-thumbtack text-warning me-2"></i>
                                @endif
                                {{ $forum->title }}
                            </h5>
                            <p class="text-muted small mb-0">{{ Str::limit($forum->description, 100) }}</p>
                        </div>
                        @if($forum->is_locked)
                        <span class="badge bg-danger">
                            <i class="fas fa-lock me-1"></i>Terlocked
                        </span>
                        @endif
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-muted small">
                                <i class="fas fa-comments me-1"></i>{{ $forum->all_posts_count ?? 0 }} post
                            </span>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('tenant.elearning.forums.show', [$course, $forum]) }}" class="btn btn-sm btn-primary">
                                <i class="fas fa-eye me-1"></i>Lihat
                            </a>
                            <a href="{{ tenant_route('tenant.elearning.forums.edit', [$course, $forum]) }}" class="btn btn-sm btn-outline-warning">
                                <i class="fas fa-edit"></i>
                            </a>
                            <form action="{{ tenant_route('tenant.elearning.forums.destroy', [$course, $forum]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-body text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-comments empty-state-icon"></i>
                        <h5 class="empty-state-title">Belum ada forum</h5>
                        <p class="empty-state-text">Mulai membuat forum diskusi pertama</p>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createForumModal">
                            <i class="fas fa-plus me-2"></i>Buat Forum
                        </button>
                    </div>
                </div>
            </div>
        </div>
        @endforelse
    </div>

    <!-- Create Forum Modal -->
    <div class="modal fade" id="createForumModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form action="{{ tenant_route('tenant.elearning.forums.store', $course) }}" method="POST">
                    @csrf
                    <div class="modal-header">
                        <h5 class="modal-title">Buat Forum Baru</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Judul Forum <span class="text-danger">*</span></label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Deskripsi</label>
                            <textarea name="description" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Buat Forum</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

