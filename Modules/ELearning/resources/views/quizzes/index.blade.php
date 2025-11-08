@extends('layouts.admin-simple')

@push('styles')
<style>
    .table-modern {
        border-radius: 12px;
        overflow: hidden;
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
                    <h1 class="h3 mb-1">Quiz</h1>
                    <p class="text-muted mb-0">Kursus: {{ $course->title }}</p>
                </div>
                <div>
                    <a href="{{ tenant_route('tenant.elearning.courses.show', $course) }}" class="btn btn-outline-secondary me-2">
                        <i class="fas fa-arrow-left me-2"></i>Kembali
                    </a>
                    <a href="{{ tenant_route('tenant.elearning.quizzes.create', $course) }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>Buat Quiz
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Quizzes List -->
    <div class="row">
        <div class="col-12">
            <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
                <div class="card-header bg-white" style="border-bottom: 2px solid #e5e7eb;">
                    <h5 class="mb-0">
                        <i class="fas fa-question-circle me-2 text-primary"></i>Daftar Quiz
                    </h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-modern table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Pertanyaan</th>
                                    <th>Waktu</th>
                                    <th>Max Score</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($quizzes as $quiz)
                                <tr>
                                    <td>
                                        <strong>{{ $quiz->title }}</strong>
                                        @if($quiz->description)
                                        <br><small class="text-muted">{{ Str::limit($quiz->description, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>{{ $quiz->total_questions }} pertanyaan</td>
                                    <td>
                                        @if($quiz->time_limit_minutes)
                                        {{ $quiz->time_limit_minutes }} menit
                                        @else
                                        <span class="text-muted">Tidak terbatas</span>
                                        @endif
                                    </td>
                                    <td>{{ $quiz->max_score }} poin</td>
                                    <td>
                                        <span class="badge bg-{{ $quiz->is_published ? 'success' : 'secondary' }}">
                                            {{ $quiz->is_published ? 'Published' : 'Draft' }}
                                        </span>
                                        @if($quiz->send_to_gradebook)
                                        <br><small class="text-muted"><i class="fas fa-check-circle me-1"></i>Terintegrasi</small>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="{{ tenant_route('tenant.elearning.quizzes.show', [$course, $quiz]) }}" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.elearning.quizzes.attempts', [$course, $quiz]) }}" class="btn btn-sm btn-outline-info">
                                                <i class="fas fa-list"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.elearning.quizzes.edit', [$course, $quiz]) }}" class="btn btn-sm btn-outline-warning">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('tenant.elearning.quizzes.destroy', [$course, $quiz]) }}" method="POST" class="d-inline" onsubmit="return confirm('Yakin ingin menghapus?')">
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
                                    <td colspan="6" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="fas fa-question-circle empty-state-icon"></i>
                                            <h5 class="empty-state-title">Belum ada quiz</h5>
                                            <p class="empty-state-text">Mulai membuat quiz pertama</p>
                                            <a href="{{ tenant_route('tenant.elearning.quizzes.create', $course) }}" class="btn btn-primary">
                                                <i class="fas fa-plus me-2"></i>Buat Quiz
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

