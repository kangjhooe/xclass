@extends('layouts.tenant')

@section('title', 'Penilaian Ujian')
@section('page-title', 'Penilaian Ujian')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-graduation-cap me-2"></i>
                                {{ $exam->title }}
                            </h5>
                            <small>{{ $exam->subject->name }} - {{ $exam->classRoom->name }}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="btn-group">
                                <button class="btn btn-light" onclick="gradeAllAttempts()">
                                    <i class="fas fa-magic me-1"></i> Grade Semua
                                </button>
                                <button class="btn btn-light" onclick="exportResults()">
                                    <i class="fas fa-download me-1"></i> Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['total_attempts'] }}</h4>
                            <p class="mb-0">Total Peserta</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-users fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['average_score'] }}</h4>
                            <p class="mb-0">Rata-rata Nilai</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-chart-line fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-info text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['pass_rate'] }}%</h4>
                            <p class="mb-0">Tingkat Kelulusan</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-trophy fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-warning text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $statistics['highest_score'] }}</h4>
                            <p class="mb-0">Nilai Tertinggi</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-star fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <form method="GET" action="{{ tenant_route('exam.grading.index', $exam) }}" class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Status Penilaian</label>
                            <select name="grading_status" class="form-select">
                                <option value="">Semua</option>
                                <option value="graded" {{ request('grading_status') === 'graded' ? 'selected' : '' }}>Sudah Dinilai</option>
                                <option value="pending" {{ request('grading_status') === 'pending' ? 'selected' : '' }}>Belum Dinilai</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Rentang Nilai</label>
                            <select name="score_range" class="form-select">
                                <option value="">Semua</option>
                                <option value="excellent" {{ request('score_range') === 'excellent' ? 'selected' : '' }}>Sangat Baik (80-100)</option>
                                <option value="good" {{ request('score_range') === 'good' ? 'selected' : '' }}>Baik (60-79)</option>
                                <option value="fair" {{ request('score_range') === 'fair' ? 'selected' : '' }}>Cukup (40-59)</option>
                                <option value="poor" {{ request('score_range') === 'poor' ? 'selected' : '' }}>Kurang (0-39)</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Cari Siswa</label>
                            <input type="text" name="search" class="form-control" 
                                   placeholder="Nama siswa..." value="{{ request('search') }}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-search me-1"></i> Filter
                                </button>
                                <a href="{{ tenant_route('exam.grading.index', $exam) }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-1"></i> Reset
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Attempts List -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-list me-2"></i>
                        Daftar Hasil Ujian
                    </h6>
                </div>
                <div class="card-body">
                    @if($attempts->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Siswa</th>
                                        <th>Kelas</th>
                                        <th>Nilai</th>
                                        <th>Status</th>
                                        <th>Waktu Submit</th>
                                        <th>Penilaian</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($attempts as $index => $attempt)
                                        <tr>
                                            <td>{{ $attempts->firstItem() + $index }}</td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                                        {{ substr($attempt->student->name, 0, 1) }}
                                                    </div>
                                                    <div>
                                                        <div class="fw-bold">{{ $attempt->student->name }}</div>
                                                        <small class="text-muted">{{ $attempt->student->nis }}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{{ $attempt->student->classRoom->name ?? '-' }}</td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <span class="badge bg-{{ $attempt->grading_data['is_passed'] ?? false ? 'success' : 'danger' }} me-2">
                                                        {{ $attempt->score }}/{{ $exam->total_score }}
                                                    </span>
                                                    <small class="text-muted">
                                                        ({{ $attempt->grading_data['percentage_score'] ?? 0 }}%)
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                @if($attempt->grading_data['grading_method'] ?? false)
                                                    <span class="badge bg-success">
                                                        <i class="fas fa-check me-1"></i> Dinilai
                                                    </span>
                                                @else
                                                    <span class="badge bg-warning">
                                                        <i class="fas fa-clock me-1"></i> Belum Dinilai
                                                    </span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class="text-muted">
                                                    {{ $attempt->submitted_at->format('d/m/Y H:i') }}
                                                </div>
                                                <small class="text-muted">
                                                    {{ $attempt->time_spent }} detik
                                                </small>
                                            </td>
                                            <td>
                                                @php
                                                    $essayCount = $attempt->answers->where('question.question_type', 'essay')->count();
                                                    $gradedEssayCount = $attempt->answers->where('question.question_type', 'essay')
                                                        ->where('grading_data.manual_grading', true)->count();
                                                @endphp
                                                @if($essayCount > 0)
                                                    <span class="badge bg-{{ $gradedEssayCount === $essayCount ? 'success' : 'warning' }}">
                                                        {{ $gradedEssayCount }}/{{ $essayCount }} Essay
                                                    </span>
                                                @else
                                                    <span class="badge bg-info">Otomatis</span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <a href="{{ tenant_route('exam.grading.show', [$exam, $attempt]) }}" 
                                                       class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    @if(!($attempt->grading_data['grading_method'] ?? false))
                                                        <button onclick="gradeAttempt({{ $attempt->id }})" 
                                                                class="btn btn-sm btn-outline-success" title="Grade Otomatis">
                                                            <i class="fas fa-magic"></i>
                                                        </button>
                                                    @endif
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="text-muted">
                                Menampilkan {{ $attempts->firstItem() }} sampai {{ $attempts->lastItem() }} 
                                dari {{ $attempts->total() }} hasil
                            </div>
                            <div>
                                {{ $attempts->links() }}
                            </div>
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum ada hasil ujian</h5>
                            <p class="text-muted">Hasil ujian akan muncul setelah siswa menyelesaikan ujian.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Grade All Modal -->
<div class="modal fade" id="gradeAllModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Grade Semua Attempt</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Apakah Anda yakin ingin melakukan grading otomatis untuk semua attempt yang belum dinilai?</p>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Proses ini akan menilai semua soal objektif secara otomatis. Soal essay tetap memerlukan penilaian manual.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary" onclick="confirmGradeAll()">Ya, Grade Semua</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
function gradeAttempt(attemptId) {
    if (confirm('Apakah Anda yakin ingin melakukan grading otomatis untuk attempt ini?')) {
        const baseUrl = '{{ tenant_route("exam.grading.index", $exam) }}';
        const url = baseUrl.replace(/\/grading$/, '/grading/' + attemptId + '/grade');
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Grading berhasil!');
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat melakukan grading');
        });
    }
}

function gradeAllAttempts() {
    const modal = new bootstrap.Modal(document.getElementById('gradeAllModal'));
    modal.show();
}

function confirmGradeAll() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('gradeAllModal'));
    modal.hide();
    
    // Show loading
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
    btn.disabled = true;
    
    fetch(`{{ tenant_route('exam.grading.grade-all', $exam) }}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat melakukan grading');
    })
    .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

function exportResults() {
    const format = prompt('Pilih format export:\n1. Excel\n2. PDF', '1');
    
    if (format === '1' || format === 'excel') {
        window.open(`{{ tenant_route('exam.grading.export', $exam) }}?format=excel`, '_blank');
    } else if (format === '2' || format === 'pdf') {
        window.open(`{{ tenant_route('exam.grading.export', $exam) }}?format=pdf`, '_blank');
    }
}
</script>
@endpush
