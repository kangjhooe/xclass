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
    
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: none;
    }
    
    .stats-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        margin-bottom: 1rem;
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .stats-number {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0.5rem 0;
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
                    <h1 class="h3 mb-1">Manajemen Kursus</h1>
                    <p class="text-muted mb-0">Kelola semua kursus pembelajaran online</p>
                </div>
                <a href="{{ tenant_route('tenant.elearning.courses.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Buat Kursus Baru
                </a>
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="stats-card">
                <div class="stats-icon primary">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stats-number">{{ $courses->total() }}</div>
                <div class="stats-label">Total Kursus</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stats-card">
                <div class="stats-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stats-number">{{ $courses->where('status', 'published')->count() }}</div>
                <div class="stats-label">Published</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stats-card">
                <div class="stats-icon info">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stats-number">{{ \Modules\ELearning\app\Models\CourseEnrollment::where('status', 'enrolled')->count() }}</div>
                <div class="stats-label">Total Siswa</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stats-card">
                <div class="stats-icon primary">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="stats-number">{{ $courses->where('status', 'draft')->count() }}</div>
                <div class="stats-label">Draft</div>
            </div>
        </div>
    </div>

    <!-- Courses Grid -->
    <div class="row">
        @forelse($courses as $course)
        <div class="col-md-4 mb-4">
            <div class="course-card">
                @if($course->thumbnail)
                <img src="{{ Storage::url($course->thumbnail) }}" class="course-card-img" alt="{{ $course->title }}">
                @else
                <div class="course-card-img bg-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-book text-white" style="font-size: 3rem;"></i>
                </div>
                @endif
                <div class="course-card-body">
                    <h5 class="course-card-title">{{ $course->title }}</h5>
                    <p class="course-card-text">{{ Str::limit($course->description, 120) }}</p>
                    <div class="mb-3">
                        <span class="badge bg-{{ $course->status === 'published' ? 'success' : ($course->status === 'draft' ? 'secondary' : 'warning') }}">
                            {{ ucfirst($course->status) }}
                        </span>
                        @if($course->subject)
                        <span class="badge bg-info ms-1">{{ $course->subject->name }}</span>
                        @endif
                        @if($course->level)
                        <span class="badge bg-secondary ms-1">{{ ucfirst($course->level) }}</span>
                        @endif
                    </div>
                    <div class="course-card-footer">
                        <div class="d-flex gap-2">
                            <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-sm btn-primary flex-fill">
                                <i class="fas fa-eye me-1"></i>Lihat
                            </a>
                            <a href="{{ tenant_route('tenant.elearning.courses.edit', $course) }}" class="btn btn-sm btn-outline-warning">
                                <i class="fas fa-edit"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @empty
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-body text-center py-5">
                    <i class="fas fa-book-open text-muted mb-3" style="font-size: 4rem;"></i>
                    <h5 class="text-muted">Belum ada kursus</h5>
                    <p class="text-muted mb-4">Mulai membuat kursus pembelajaran online pertama Anda</p>
                    <a href="{{ tenant_route('tenant.elearning.courses.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Buat Kursus Baru
                    </a>
                </div>
            </div>
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($courses->hasPages())
    <div class="row mt-4">
        <div class="col-12">
            <div class="d-flex justify-content-center">
                {{ $courses->links() }}
            </div>
        </div>
    </div>
    @endif
</div>
@endsection

