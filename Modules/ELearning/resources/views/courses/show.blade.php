@extends('layouts.admin-simple')

@push('styles')
<style>
    .info-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
    }
    
    .info-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .action-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    
    .feature-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 12px;
        padding: 1.5rem;
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
    }
    
    .feature-card:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        color: inherit;
    }
    
    .feature-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        margin-bottom: 1rem;
    }
    
    .feature-icon.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .feature-icon.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .feature-icon.info { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .feature-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h1 class="h3 mb-1">{{ $course->title }}</h1>
                    <p class="text-muted mb-0">{{ $course->description }}</p>
                    <div class="mt-2">
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
                </div>
                <a href="{{ tenant_route('tenant.elearning.courses.edit', $course) }}" class="btn btn-outline-primary">
                    <i class="fas fa-edit me-2"></i>Edit
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-8">
            <!-- Course Info -->
            <div class="info-card mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-4">
                        <i class="fas fa-info-circle me-2 text-primary"></i>Informasi Kursus
                    </h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="text-muted small">Mata Pelajaran</label>
                            <p class="mb-0 fw-semibold">{{ $course->subject->name ?? '-' }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="text-muted small">Guru</label>
                            <p class="mb-0 fw-semibold">{{ $course->teacher->name }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="text-muted small">Level</label>
                            <p class="mb-0 fw-semibold">{{ ucfirst($course->level) }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="text-muted small">Total Siswa</label>
                            <p class="mb-0 fw-semibold">{{ $course->total_enrollments }} siswa</p>
                        </div>
                        @if($course->syllabus)
                        <div class="col-12">
                            <label class="text-muted small">Silabus</label>
                            <p class="mb-0">{{ $course->syllabus }}</p>
                        </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="row g-3">
                <div class="col-md-6">
                    <a href="{{ tenant_route('tenant.elearning.materials.index', $course) }}" class="feature-card">
                        <div class="feature-icon primary">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h6 class="fw-semibold mb-1">Materi Pembelajaran</h6>
                        <p class="text-muted small mb-0">{{ $course->materials->count() }} materi</p>
                    </a>
                </div>
                <div class="col-md-6">
                    <a href="{{ tenant_route('tenant.elearning.videos.index', $course) }}" class="feature-card">
                        <div class="feature-icon info">
                            <i class="fas fa-video"></i>
                        </div>
                        <h6 class="fw-semibold mb-1">Video Pembelajaran</h6>
                        <p class="text-muted small mb-0">{{ $course->videos->count() }} video</p>
                    </a>
                </div>
                <div class="col-md-6">
                    <a href="{{ tenant_route('tenant.elearning.assignments.index', $course) }}" class="feature-card">
                        <div class="feature-icon success">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <h6 class="fw-semibold mb-1">Tugas</h6>
                        <p class="text-muted small mb-0">{{ $course->assignments->count() }} tugas</p>
                    </a>
                </div>
                <div class="col-md-6">
                    <a href="{{ tenant_route('tenant.elearning.quizzes.index', $course) }}" class="feature-card">
                        <div class="feature-icon warning">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <h6 class="fw-semibold mb-1">Quiz</h6>
                        <p class="text-muted small mb-0">{{ $course->quizzes->count() }} quiz</p>
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="action-card mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-4">
                        <i class="fas fa-cog me-2 text-primary"></i>Quick Actions
                    </h5>
                    <div class="d-grid gap-2">
                        <a href="{{ tenant_route('tenant.elearning.forums.index', $course) }}" class="btn btn-outline-primary">
                            <i class="fas fa-comments me-2"></i>Forum Diskusi
                        </a>
                        <a href="{{ tenant_route('tenant.elearning.announcements.index', $course) }}" class="btn btn-outline-primary">
                            <i class="fas fa-bullhorn me-2"></i>Pengumuman
                        </a>
                        <a href="{{ tenant_route('tenant.elearning.live-classes.index', $course) }}" class="btn btn-outline-primary">
                            <i class="fas fa-video me-2"></i>Kelas Virtual
                        </a>
                        <a href="{{ tenant_route('tenant.elearning.progress.index', $course) }}" class="btn btn-outline-info">
                            <i class="fas fa-chart-line me-2"></i>Progress & Analytics
                        </a>
                        <a href="{{ tenant_route('tenant.elearning.resources.index', $course) }}" class="btn btn-outline-secondary">
                            <i class="fas fa-folder-open me-2"></i>Resource Library
                        </a>
                    </div>
                </div>
            </div>

            <div class="info-card">
                <div class="card-body p-4">
                    <h6 class="fw-semibold mb-3">Statistik</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Progress Rata-rata</span>
                        <span class="fw-semibold">{{ number_format($course->progress_percentage, 1) }}%</span>
                    </div>
                    <div class="progress mb-3" style="height: 8px;">
                        <div class="progress-bar bg-primary" style="width: {{ $course->progress_percentage }}%"></div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">Total Enrollment</span>
                        <span class="fw-semibold">{{ $course->total_enrollments }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

