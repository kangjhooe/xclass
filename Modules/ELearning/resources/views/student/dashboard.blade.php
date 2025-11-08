@extends('layouts.tenant')

@section('title', $title)
@section('page-title', 'Dashboard - ' . $course->title)

@push('styles')
<style>
    .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        color: white;
        margin-bottom: 2rem;
    }
    
    .stat-box {
        background: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .stat-box:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        margin: 0 auto 1rem;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    
    .stat-label {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .activity-card {
        background: #fff;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }
    
    .activity-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    .deadline-badge {
        background: #fef3c7;
        color: #92400e;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
        <div class="row align-items-center">
            <div class="col-md-8">
                <h1 class="h3 mb-2 text-white">{{ $course->title }}</h1>
                <p class="text-white-50 mb-0">Dashboard Pembelajaran</p>
            </div>
            <div class="col-md-4 text-end">
                <div class="text-white">
                    <div class="small opacity-75">Progress Keseluruhan</div>
                    <div class="h4 mb-0">{{ number_format($enrollment->progress_percentage, 0) }}%</div>
                    <div class="progress mt-2" style="height: 8px; background: rgba(255,255,255,0.3);">
                        <div class="progress-bar bg-white" style="width: {{ $enrollment->progress_percentage }}%"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="stat-box">
                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="stat-value">{{ $stats['materials_completed'] }}</div>
                <div class="stat-label">Materi</div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stat-box">
                <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                    <i class="fas fa-video"></i>
                </div>
                <div class="stat-value">{{ $stats['videos_completed'] }}</div>
                <div class="stat-label">Video</div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stat-box">
                <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-value">{{ $stats['assignments_completed'] }}</div>
                <div class="stat-label">Tugas</div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="stat-box">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <i class="fas fa-question-circle"></i>
                </div>
                <div class="stat-value">{{ $stats['quizzes_completed'] }}</div>
                <div class="stat-label">Quiz</div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Recent Announcements -->
        <div class="col-md-6 mb-4">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-header bg-white" style="border-bottom: 2px solid #e5e7eb;">
                    <h5 class="mb-0">
                        <i class="fas fa-bullhorn me-2 text-primary"></i>Pengumuman Terbaru
                    </h5>
                </div>
                <div class="card-body">
                    @forelse($recentAnnouncements as $announcement)
                    <div class="activity-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">{{ $announcement->title }}</h6>
                                <p class="text-muted small mb-0">{{ Str::limit($announcement->content, 100) }}</p>
                                <small class="text-muted">{{ $announcement->created_at->format('d-m-Y H:i') }}</small>
                            </div>
                            @if($announcement->is_important)
                            <span class="badge bg-danger">Penting</span>
                            @endif
                        </div>
                    </div>
                    @empty
                    <div class="text-center py-4 text-muted">
                        <i class="fas fa-bullhorn mb-2" style="font-size: 2rem;"></i>
                        <p>Belum ada pengumuman</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Upcoming Assignments -->
        <div class="col-md-6 mb-4">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-header bg-white" style="border-bottom: 2px solid #e5e7eb;">
                    <h5 class="mb-0">
                        <i class="fas fa-tasks me-2 text-primary"></i>Tugas Mendatang
                    </h5>
                </div>
                <div class="card-body">
                    @forelse($upcomingAssignments as $assignment)
                    <div class="activity-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">{{ $assignment->title }}</h6>
                                <p class="text-muted small mb-0">
                                    Deadline: {{ $assignment->due_date->format('d-m-Y H:i') }}
                                </p>
                            </div>
                            <div>
                                <span class="deadline-badge">
                                    {{ $assignment->due_date->diffForHumans() }}
                                </span>
                            </div>
                        </div>
                        <div class="mt-2">
                            <a href="{{ tenant_route('tenant.elearning.assignments.show', [$course, $assignment]) }}" class="btn btn-sm btn-primary">
                                <i class="fas fa-arrow-right me-1"></i>Lihat Tugas
                            </a>
                        </div>
                    </div>
                    @empty
                    <div class="text-center py-4 text-muted">
                        <i class="fas fa-tasks mb-2" style="font-size: 2rem;"></i>
                        <p>Belum ada tugas mendatang</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row">
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-header bg-white" style="border-bottom: 2px solid #e5e7eb;">
                    <h5 class="mb-0">
                        <i class="fas fa-bolt me-2 text-primary"></i>Quick Actions
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <a href="{{ tenant_route('tenant.elearning.student.course.show', $course) }}" class="btn btn-outline-primary w-100">
                                <i class="fas fa-book me-2"></i>Konten Kursus
                            </a>
                        </div>
                        <div class="col-md-3">
                            <a href="{{ tenant_route('tenant.elearning.forums.index', $course) }}" class="btn btn-outline-primary w-100">
                                <i class="fas fa-comments me-2"></i>Forum Diskusi
                            </a>
                        </div>
                        <div class="col-md-3">
                            <a href="{{ tenant_route('tenant.elearning.announcements.index', $course) }}" class="btn btn-outline-primary w-100">
                                <i class="fas fa-bullhorn me-2"></i>Pengumuman
                            </a>
                        </div>
                        <div class="col-md-3">
                            <a href="{{ tenant_route('tenant.elearning.student.courses') }}" class="btn btn-outline-secondary w-100">
                                <i class="fas fa-arrow-left me-2"></i>Kursus Saya
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

