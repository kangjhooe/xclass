@extends('layouts.tenant')

@section('title', 'Detail Ujian')
@section('page-title', 'Detail Ujian')

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
                                <i class="fas fa-clipboard-list me-2"></i>
                                {{ $exam->title }}
                            </h5>
                            <small>{{ $exam->subject->name }} - {{ $exam->classRoom->name }}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="d-flex align-items-center justify-content-end">
                                <span class="badge bg-{{ $exam->status_color }} me-2">
                                    {{ $exam->status_label }}
                                </span>
                                <div class="btn-group">
                                    <a href="{{ tenant_route('exam.exams.edit', $exam) }}" class="btn btn-outline-light btn-sm" title="Edit Ujian">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <div class="btn-group" role="group">
                                        <button type="button" class="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown" title="Export Hasil">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="{{ tenant_route('exam.export', $exam) }}?format=excel">
                                                <i class="fas fa-file-excel me-2"></i>Export Excel
                                            </a></li>
                                            <li><a class="dropdown-item" href="{{ tenant_route('exam.export', $exam) }}?format=pdf">
                                                <i class="fas fa-file-pdf me-2"></i>Export PDF
                                            </a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $statistics['total_attempts'] }}</h3>
                            <small>Total Peserta</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $statistics['average_score'] }}</h3>
                            <small>Rata-rata Nilai</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $statistics['highest_score'] }}</h3>
                            <small>Nilai Tertinggi</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">{{ $statistics['lowest_score'] }}</h3>
                            <small>Nilai Terendah</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Exam Details -->
            <div class="row">
                <div class="col-md-8">
                    <!-- Exam Information -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-info-circle me-2"></i>
                                Informasi Ujian
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td><strong>Jenis Ujian:</strong></td>
                                            <td>{{ $exam->type_label }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Durasi:</strong></td>
                                            <td>{{ $exam->formatted_duration }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Soal:</strong></td>
                                            <td>{{ $exam->total_questions }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Nilai:</strong></td>
                                            <td>{{ $exam->total_score }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Nilai Kelulusan:</strong></td>
                                            <td>{{ $exam->passing_score }}%</td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td><strong>Waktu Mulai:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($exam->start_time, true) }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Waktu Selesai:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($exam->end_time, true) }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Maksimal Percobaan:</strong></td>
                                            <td>{{ $exam->max_attempts }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Guru:</strong></td>
                                            <td>{{ $exam->teacher->name }}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Dibuat:</strong></td>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($exam->created_at, true) }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            @if($exam->description)
                                <div class="mt-3">
                                    <strong>Deskripsi:</strong>
                                    <p class="mt-2">{{ $exam->description }}</p>
                                </div>
                            @endif
                            
                            @if($exam->instructions)
                                <div class="mt-3">
                                    <strong>Instruksi:</strong>
                                    <div class="mt-2 p-3 bg-light rounded">
                                        {!! nl2br(e($exam->instructions)) !!}
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Settings -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-cog me-2"></i>
                                Pengaturan Ujian
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" {{ $exam->allow_review ? 'checked' : '' }} disabled>
                                        <label class="form-check-label">Izinkan Review Jawaban</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" {{ $exam->show_correct_answers ? 'checked' : '' }} disabled>
                                        <label class="form-check-label">Tampilkan Jawaban Benar</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" {{ $exam->randomize_questions ? 'checked' : '' }} disabled>
                                        <label class="form-check-label">Acak Urutan Soal</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" {{ $exam->randomize_answers ? 'checked' : '' }} disabled>
                                        <label class="form-check-label">Acak Urutan Jawaban</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Questions List -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-question-circle me-2"></i>
                                Daftar Soal
                            </h6>
                        </div>
                        <div class="card-body">
                            @if($exam->questions->count() > 0)
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Soal</th>
                                                <th>Jenis</th>
                                                <th>Kesulitan</th>
                                                <th>Poin</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($exam->questions as $index => $question)
                                                <tr>
                                                    <td>{{ $index + 1 }}</td>
                                                    <td>{{ Str::limit($question->question_text, 100) }}</td>
                                                    <td>
                                                        <span class="badge bg-info">{{ $question->type_label }}</span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-{{ $question->difficulty_color }}">
                                                            {{ $question->difficulty_label }}
                                                        </span>
                                                    </td>
                                                    <td>{{ $question->points }}</td>
                                                    <td>
                                                        @if($question->is_active)
                                                            <span class="badge bg-success">Aktif</span>
                                                        @else
                                                            <span class="badge bg-secondary">Nonaktif</span>
                                                        @endif
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <div class="text-center py-3">
                                    <i class="fas fa-question-circle fa-2x text-muted mb-2"></i>
                                    <p class="text-muted">Belum ada soal</p>
                                    <a href="{{ tenant_route('questions.create') }}" class="btn btn-primary btn-sm">
                                        <i class="fas fa-plus me-1"></i>
                                        Tambah Soal
                                    </a>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <!-- Score Distribution -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-chart-bar me-2"></i>
                                Distribusi Nilai
                            </h6>
                        </div>
                        <div class="card-body">
                            @if($statistics['score_distribution'])
                                @foreach($statistics['score_distribution'] as $range => $count)
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span>{{ $range }}%</span>
                                        <div class="progress flex-grow-1 mx-2" style="height: 20px;">
                                            @php
                                                $percentage = $statistics['total_attempts'] > 0 ? ($count / $statistics['total_attempts']) * 100 : 0;
                                            @endphp
                                            <div class="progress-bar" role="progressbar" style="width: {{ $percentage }}%">
                                                {{ $count }}
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @else
                                <p class="text-muted text-center">Belum ada data</p>
                            @endif
                        </div>
                    </div>

                    <!-- Pass Rate -->
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-percentage me-2"></i>
                                Tingkat Kelulusan
                            </h6>
                        </div>
                        <div class="card-body text-center">
                            <div class="h2 text-success">{{ $statistics['pass_rate'] }}%</div>
                            <p class="text-muted">Siswa yang lulus</p>
                        </div>
                    </div>

                    <!-- Recent Attempts -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-users me-2"></i>
                                Peserta Terbaru
                            </h6>
                        </div>
                        <div class="card-body">
                            @if($attempts->count() > 0)
                                @foreach($attempts as $attempt)
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <div class="fw-bold">{{ $attempt->student->name }}</div>
                                            <small class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($attempt->submitted_at, true) }}</small>
                                        </div>
                                        <div class="text-end">
                                            <div class="fw-bold">{{ $attempt->score }}</div>
                                            <span class="badge bg-{{ $attempt->isPassed() ? 'success' : 'danger' }}">
                                                {{ $attempt->isPassed() ? 'Lulus' : 'Tidak Lulus' }}
                                            </span>
                                        </div>
                                    </div>
                                @endforeach
                                
                                @if($attempts->hasPages())
                                    <div class="text-center mt-3">
                                        <a href="{{ tenant_route('exam.attempts.index') }}?exam_id={{ $exam->id }}" class="btn btn-outline-primary btn-sm">
                                            Lihat Semua
                                        </a>
                                    </div>
                                @endif
                            @else
                                <p class="text-muted text-center">Belum ada peserta</p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
