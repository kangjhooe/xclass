@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $title)

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
    
    .progress-ring {
        width: 60px;
        height: 60px;
    }
    
    .progress-ring circle {
        fill: none;
        stroke-width: 4;
        stroke: #e5e7eb;
    }
    
    .progress-ring .progress {
        stroke: #667eea;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 0.3s;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="h3 mb-1">Kursus Saya</h1>
            <p class="text-muted mb-0">Lihat semua kursus yang Anda ikuti</p>
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
                    <h5 class="fw-semibold mb-2">{{ $course->title }}</h5>
                    <p class="text-muted small mb-3">{{ Str::limit($course->description, 100) }}</p>
                    
                    @php
                        $enrollment = $course->enrollments()->where('student_id', auth()->user()->student->id)->first();
                        $progress = $enrollment ? $enrollment->progress_percentage : 0;
                    @endphp
                    
                    <div class="d-flex align-items-center mb-3">
                        <div class="progress-ring me-3">
                            <svg width="60" height="60">
                                <circle cx="30" cy="30" r="26"></circle>
                                <circle class="progress" cx="30" cy="30" r="26" 
                                    stroke-dasharray="{{ 2 * 3.14159 * 26 }}" 
                                    stroke-dashoffset="{{ 2 * 3.14159 * 26 * (1 - $progress / 100) }}"></circle>
                            </svg>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="small text-muted">Progress</span>
                                <span class="small fw-semibold">{{ number_format($progress, 0) }}%</span>
                            </div>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-primary" style="width: {{ $progress }}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2 mt-auto">
                        <a href="{{ tenant_route('tenant.elearning.student.course.show', $course) }}" class="btn btn-sm btn-primary flex-fill">
                            <i class="fas fa-arrow-right me-1"></i>Lanjutkan
                        </a>
                        <a href="{{ tenant_route('tenant.elearning.student.course.dashboard', $course) }}" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-chart-line"></i>
                        </a>
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
                    <p class="text-muted mb-4">Anda belum terdaftar di kursus manapun</p>
                </div>
            </div>
        </div>
        @endforelse
    </div>
</div>
@endsection

