@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $course->title)

@push('styles')
<style>
    .course-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        color: white;
        margin-bottom: 2rem;
    }
    
    .course-nav {
        background: #fff;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
    }
    
    .content-section {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
    }
    
    .content-item {
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
    }
    
    .content-item:hover {
        border-color: #667eea;
        background: #f8f9ff;
        color: inherit;
        transform: translateX(4px);
    }
    
    .content-item.completed {
        border-color: #10b981;
        background: #f0fdf4;
    }
    
    .content-item.completed::before {
        content: '✓';
        display: inline-block;
        width: 24px;
        height: 24px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        margin-right: 0.75rem;
        font-size: 0.875rem;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Course Header -->
    <div class="course-header">
        <div class="row align-items-center">
            <div class="col-md-8">
                <h1 class="h3 mb-2 text-white">{{ $course->title }}</h1>
                <p class="text-white-50 mb-0">{{ $course->description }}</p>
                <div class="mt-3">
                    <span class="badge bg-white text-primary me-2">{{ $course->subject->name ?? 'Umum' }}</span>
                    <span class="badge bg-white text-primary">{{ ucfirst($course->level) }}</span>
                </div>
            </div>
            <div class="col-md-4 text-end">
                <div class="text-white">
                    <div class="small opacity-75">Progress</div>
                    <div class="h4 mb-0">{{ number_format($enrollment->progress_percentage, 0) }}%</div>
                    <div class="progress mt-2" style="height: 8px; background: rgba(255,255,255,0.3);">
                        <div class="progress-bar bg-white" style="width: {{ $enrollment->progress_percentage }}%"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Course Navigation -->
    <div class="course-nav">
        <div class="d-flex gap-2 flex-wrap">
            <a href="{{ tenant_route('tenant.elearning.student.course.dashboard', $course) }}" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
            </a>
            <a href="#materials" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-file-alt me-1"></i>Materi
            </a>
            <a href="#videos" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-video me-1"></i>Video
            </a>
            <a href="#assignments" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-tasks me-1"></i>Tugas
            </a>
            <a href="#quizzes" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-question-circle me-1"></i>Quiz
            </a>
            <a href="{{ tenant_route('tenant.elearning.forums.index', $course) }}" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-comments me-1"></i>Forum
            </a>
        </div>
    </div>

    <!-- Materials Section -->
    <div id="materials" class="content-section">
        <h5 class="mb-4">
            <i class="fas fa-file-alt me-2 text-primary"></i>Materi Pembelajaran
        </h5>
        @forelse($course->materials as $material)
        <a href="#" class="content-item {{ $material->progress ? 'completed' : '' }}">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">{{ $material->title }}</h6>
                    <p class="text-muted small mb-0">{{ $material->chapter ?? 'Umum' }}</p>
                </div>
                <div>
                    <span class="badge bg-secondary">{{ ucfirst($material->type) }}</span>
                </div>
            </div>
        </a>
        @empty
        <div class="text-center py-4 text-muted">
            <i class="fas fa-file-alt mb-2" style="font-size: 2rem;"></i>
            <p>Belum ada materi pembelajaran</p>
        </div>
        @endforelse
    </div>

    <!-- Videos Section -->
    <div id="videos" class="content-section">
        <h5 class="mb-4">
            <i class="fas fa-video me-2 text-primary"></i>Video Pembelajaran
        </h5>
        @forelse($course->videos as $video)
        <a href="{{ tenant_route('tenant.elearning.videos.show', [$course, $video]) }}" class="content-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">{{ $video->title }}</h6>
                    <p class="text-muted small mb-0">
                        @if($video->duration_seconds)
                        <i class="fas fa-clock me-1"></i>{{ $video->formatted_duration }}
                        @endif
                        @if($video->chapter)
                        <span class="ms-2"><i class="fas fa-tag me-1"></i>{{ $video->chapter }}</span>
                        @endif
                    </p>
                </div>
                <div>
                    <i class="fas fa-play-circle text-primary" style="font-size: 1.5rem;"></i>
                </div>
            </div>
        </a>
        @empty
        <div class="text-center py-4 text-muted">
            <i class="fas fa-video mb-2" style="font-size: 2rem;"></i>
            <p>Belum ada video pembelajaran</p>
        </div>
        @endforelse
    </div>

    <!-- Assignments Section -->
    <div id="assignments" class="content-section">
        <h5 class="mb-4">
            <i class="fas fa-tasks me-2 text-primary"></i>Tugas
        </h5>
        @forelse($course->assignments as $assignment)
        <a href="{{ tenant_route('tenant.elearning.assignments.show', [$course, $assignment]) }}" class="content-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">{{ $assignment->title }}</h6>
                    <p class="text-muted small mb-0">
                        @if($assignment->due_date)
                        <i class="fas fa-calendar me-1"></i>Deadline: {{ $assignment->due_date->format('d-m-Y') }}
                        @endif
                        @if($assignment->isOverdue())
                        <span class="badge bg-danger ms-2">Terlambat</span>
                        @endif
                    </p>
                </div>
                <div>
                    <span class="badge bg-primary">{{ $assignment->max_score }} poin</span>
                </div>
            </div>
        </a>
        @empty
        <div class="text-center py-4 text-muted">
            <i class="fas fa-tasks mb-2" style="font-size: 2rem;"></i>
            <p>Belum ada tugas</p>
        </div>
        @endforelse
    </div>

    <!-- Quizzes Section -->
    <div id="quizzes" class="content-section">
        <h5 class="mb-4">
            <i class="fas fa-question-circle me-2 text-primary"></i>Quiz
        </h5>
        @forelse($course->quizzes as $quiz)
        <a href="{{ tenant_route('tenant.elearning.quizzes.show', [$course, $quiz]) }}" class="content-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">{{ $quiz->title }}</h6>
                    <p class="text-muted small mb-0">
                        @if($quiz->time_limit_minutes)
                        <i class="fas fa-clock me-1"></i>{{ $quiz->time_limit_minutes }} menit
                        @else
                        <i class="fas fa-infinity me-1"></i>Tidak terbatas
                        @endif
                        <span class="ms-2"><i class="fas fa-question me-1"></i>{{ $quiz->total_questions }} pertanyaan</span>
                    </p>
                </div>
                <div>
                    <span class="badge bg-warning">{{ $quiz->max_score }} poin</span>
                </div>
            </div>
        </a>
        @empty
        <div class="text-center py-4 text-muted">
            <i class="fas fa-question-circle mb-2" style="font-size: 2rem;"></i>
            <p>Belum ada quiz</p>
        </div>
        @endforelse
    </div>
</div>
@endsection

