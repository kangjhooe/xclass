@extends('layouts.tenant')

@section('title', 'Hasil Ujian')
@section('page-title', 'Hasil Ujian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <!-- Exam Header -->
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-clipboard-check me-2"></i>
                                {{ $attempt->exam->title }}
                            </h5>
                            <small>{{ $attempt->exam->subject->name }} - {{ $attempt->exam->classRoom->name }}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="text-end">
                                <div class="h4 mb-0">{{ $attempt->score }}/{{ $attempt->exam->total_score }}</div>
                                <small>Nilai Akhir</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Score Summary -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $attempt->percentage_score }}%</h3>
                            <small>Persentase</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $attempt->grade }}</h3>
                            <small>Nilai Huruf</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-{{ $attempt->isPassed() ? 'success' : 'danger' }} text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $attempt->isPassed() ? 'LULUS' : 'TIDAK LULUS' }}</h3>
                            <small>Status</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $attempt->formatted_time_spent }}</h3>
                            <small>Waktu Pengerjaan</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed Results -->
            <div class="row">
                <div class="col-md-8">
                    <!-- Answer Review -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-list-check me-2"></i>
                                Review Jawaban
                            </h6>
                        </div>
                        <div class="card-body">
                            @foreach($attempt->answers as $index => $answer)
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <div class="row align-items-center">
                                            <div class="col-md-8">
                                                <h6 class="mb-0">Soal {{ $index + 1 }}</h6>
                                                <small class="text-muted">{{ $answer->question->type_label }} - {{ $answer->question->difficulty_label }}</small>
                                            </div>
                                            <div class="col-md-4 text-end">
                                                <span class="badge bg-{{ $answer->is_correct ? 'success' : 'danger' }}">
                                                    {{ $answer->is_correct ? 'Benar' : 'Salah' }}
                                                </span>
                                                <span class="badge bg-primary ms-1">
                                                    {{ $answer->points }}/{{ $answer->question->points }} poin
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <!-- Question -->
                                        <div class="mb-3">
                                            <strong>Pertanyaan:</strong>
                                            <div class="mt-2">
                                                {!! nl2br(e($answer->question->question_text)) !!}
                                            </div>
                                        </div>

                                        <!-- Student Answer -->
                                        <div class="mb-3">
                                            <strong>Jawaban Anda:</strong>
                                            <div class="mt-2 p-2 bg-light rounded">
                                                @if($answer->question->question_type === 'multiple_choice' || $answer->question->question_type === 'true_false')
                                                    @php
                                                        $options = $answer->question->options;
                                                        $studentAnswer = $options[$answer->answer] ?? $answer->answer;
                                                    @endphp
                                                    {{ $studentAnswer }}
                                                @else
                                                    {{ $answer->answer ?: 'Tidak dijawab' }}
                                                @endif
                                            </div>
                                        </div>

                                        <!-- Correct Answer -->
                                        @if($attempt->exam->show_correct_answers)
                                            <div class="mb-3">
                                                <strong>Jawaban Benar:</strong>
                                                <div class="mt-2 p-2 bg-success text-white rounded">
                                                    @if($answer->question->question_type === 'multiple_choice' || $answer->question->question_type === 'true_false')
                                                        @php
                                                            $options = $answer->question->options;
                                                            $correctAnswer = $options[$answer->question->correct_answer] ?? $answer->question->correct_answer;
                                                        @endphp
                                                        {{ $correctAnswer }}
                                                    @elseif($answer->question->question_type === 'essay')
                                                        <em>Memerlukan penilaian manual</em>
                                                    @else
                                                        {{ $answer->question->correct_answer }}
                                                    @endif
                                                </div>
                                            </div>
                                        @endif

                                        <!-- Explanation -->
                                        @if($answer->question->explanation)
                                            <div class="mb-3">
                                                <strong>Penjelasan:</strong>
                                                <div class="mt-2 p-2 bg-info text-white rounded">
                                                    {!! nl2br(e($answer->question->explanation)) !!}
                                                </div>
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <!-- Statistics -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-chart-pie me-2"></i>
                                Statistik
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6 mb-3">
                                    <div class="h4 text-success">{{ $attempt->correct_answers }}</div>
                                    <small>Benar</small>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="h4 text-danger">{{ $attempt->total_questions - $attempt->correct_answers }}</div>
                                    <small>Salah</small>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="h4 text-info">{{ $attempt->total_questions }}</div>
                                    <small>Total Soal</small>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="h4 text-warning">{{ $attempt->exam->passing_score }}%</div>
                                    <small>Nilai Kelulusan</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Time Information -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-clock me-2"></i>
                                Informasi Waktu
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 mb-2">
                                    <strong>Mulai:</strong><br>
                                    <small>{{ \App\Helpers\DateHelper::formatIndonesian($attempt->started_at, true) }}</small>
                                </div>
                                <div class="col-12 mb-2">
                                    <strong>Selesai:</strong><br>
                                    <small>{{ \App\Helpers\DateHelper::formatIndonesian($attempt->submitted_at, true) }}</small>
                                </div>
                                <div class="col-12 mb-2">
                                    <strong>Durasi:</strong><br>
                                    <small>{{ $attempt->formatted_time_spent }}</small>
                                </div>
                                <div class="col-12">
                                    <strong>Status:</strong><br>
                                    <span class="badge bg-{{ $attempt->status_color }}">
                                        {{ $attempt->status_label }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="card">
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <a href="{{ tenant_route('exam.index') }}" class="btn btn-primary">
                                    <i class="fas fa-home me-1"></i>
                                    Kembali ke Dashboard
                                </a>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown">
                                        <i class="fas fa-download me-1"></i>
                                        Download Hasil
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="{{ tenant_route('exam.attempts.export', $attempt) }}?format=excel">
                                            <i class="fas fa-file-excel me-2"></i>Download Excel
                                        </a></li>
                                        <li><a class="dropdown-item" href="#" onclick="alert('Export PDF untuk detail jawaban belum tersedia')">
                                            <i class="fas fa-file-pdf me-2"></i>Download PDF
                                        </a></li>
                                    </ul>
                                </div>
                                @if($attempt->exam->allow_review)
                                    <button type="button" class="btn btn-outline-info" onclick="window.print()">
                                        <i class="fas fa-print me-1"></i>
                                        Cetak Hasil
                                    </button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('styles')
<style>
@media print {
    .btn, .card-header, .navbar, .sidebar {
        display: none !important;
    }
    
    .card {
        border: 1px solid #000 !important;
        margin-bottom: 20px !important;
    }
    
    .card-body {
        padding: 15px !important;
    }
}
</style>
@endpush
@endsection
