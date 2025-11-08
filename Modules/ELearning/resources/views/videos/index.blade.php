@extends('layouts.admin-simple')

@push('styles')
<style>
    .course-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .course-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
    }
    .course-card-img {
        height: 200px;
        object-fit: cover;
        width: 100%;
    }
    .course-card-body {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .course-card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.75rem;
    }
    .course-card-text {
        color: #6b7280;
        font-size: 0.9rem;
        flex: 1;
        margin-bottom: 1rem;
    }
    .course-card-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
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
                    <h1 class="h3 mb-1">Video Pembelajaran</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <div>
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left me-2"></i>Kembali
                    </a>
                    <a href="{{ tenant_route('tenant.elearning.videos.create', $course) }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Tambah Video
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Videos Grid -->
    <div class="row">
        @forelse($videos as $video)
        <div class="col-md-4 mb-4">
            <div class="course-card">
                @if($video->thumbnail)
                <img src="{{ Storage::url($video->thumbnail) }}" class="course-card-img" alt="{{ $video->title }}">
                @else
                <div class="course-card-img bg-gradient" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-video text-white" style="font-size: 3rem;"></i>
                </div>
                @endif
                <div class="course-card-body">
                    <h5 class="course-card-title">{{ $video->title }}</h5>
                    <p class="course-card-text">{{ Str::limit($video->description, 100) }}</p>
                    <div class="mb-3">
                        @if($video->duration_seconds)
                        <span class="badge bg-info">
                            <i class="fas fa-clock me-1"></i>{{ $video->formatted_duration }}
                        </span>
                        @endif
                        @if($video->chapter)
                        <span class="badge bg-secondary ms-1">{{ $video->chapter }}</span>
                        @endif
                        <span class="badge bg-{{ $video->is_published ? 'success' : 'secondary' }} ms-1">
                            {{ $video->is_published ? 'Published' : 'Draft' }}
                        </span>
                    </div>
                    <div class="course-card-footer">
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('tenant.elearning.videos.show', [$course, $video]) }}" class="btn btn-sm btn-primary flex-fill">
                                <i class="fas fa-play me-1"></i>Tonton
                            </a>
                            <a href="{{ tenant_route('tenant.elearning.videos.edit', [$course, $video]) }}" class="btn btn-sm btn-outline-warning">
                                <i class="fas fa-edit"></i>
                            </a>
                            <form action="{{ tenant_route('tenant.elearning.videos.destroy', [$course, $video]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
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
                        <i class="fas fa-video empty-state-icon"></i>
                        <h5 class="empty-state-title">Belum ada video</h5>
                        <p class="empty-state-text">Mulai tambahkan video pembelajaran pertama</p>
                        <a href="{{ tenant_route('tenant.elearning.videos.create', $course) }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>Tambah Video
                        </a>
                    </div>
                </div>
            </div>
        </div>
        @endforelse
    </div>
</div>
@endsection

