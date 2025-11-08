@extends('layouts.tenant')

@section('title', 'Soal yang Dibagikan')
@section('page-title', 'Soal yang Dibagikan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-share-alt me-2"></i>
                        Soal yang Dibagikan oleh Tenant Lain
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Filters -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <label for="subject_filter" class="form-label">Mata Pelajaran</label>
                            <select class="form-select" id="subject_filter" onchange="filterQuestions()">
                                <option value="">Semua Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                    {{ $subject->name }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="type_filter" class="form-label">Tipe Soal</label>
                            <select class="form-select" id="type_filter" onchange="filterQuestions()">
                                <option value="">Semua Tipe</option>
                                <option value="multiple_choice" {{ request('type') == 'multiple_choice' ? 'selected' : '' }}>Pilihan Ganda</option>
                                <option value="true_false" {{ request('type') == 'true_false' ? 'selected' : '' }}>Benar/Salah</option>
                                <option value="essay" {{ request('type') == 'essay' ? 'selected' : '' }}>Essay</option>
                                <option value="fill_blank" {{ request('type') == 'fill_blank' ? 'selected' : '' }}>Isian</option>
                                <option value="matching" {{ request('type') == 'matching' ? 'selected' : '' }}>Menjodohkan</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="difficulty_filter" class="form-label">Tingkat Kesulitan</label>
                            <select class="form-select" id="difficulty_filter" onchange="filterQuestions()">
                                <option value="">Semua Tingkat</option>
                                <option value="easy" {{ request('difficulty') == 'easy' ? 'selected' : '' }}>Mudah</option>
                                <option value="medium" {{ request('difficulty') == 'medium' ? 'selected' : '' }}>Sedang</option>
                                <option value="hard" {{ request('difficulty') == 'hard' ? 'selected' : '' }}>Sulit</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="search_filter" class="form-label">Pencarian</label>
                            <input type="text" class="form-control" id="search_filter" placeholder="Cari soal..." 
                                   value="{{ request('search') }}" onkeyup="filterQuestions()">
                        </div>
                    </div>

                    <!-- Questions List -->
                    <div class="row">
                        @forelse($questions as $question)
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="badge bg-{{ $question->question_type === 'multiple_choice' ? 'primary' : ($question->question_type === 'essay' ? 'success' : 'info') }} me-2">
                                            {{ ucfirst(str_replace('_', ' ', $question->question_type)) }}
                                        </span>
                                        <span class="badge bg-{{ $question->difficulty === 'easy' ? 'success' : ($question->difficulty === 'medium' ? 'warning' : 'danger') }}">
                                            {{ ucfirst($question->difficulty) }}
                                        </span>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="#" onclick="viewQuestion({{ $question->id }})">
                                                <i class="fas fa-eye me-2"></i>Lihat Detail
                                            </a></li>
                                            <li><a class="dropdown-item" href="#" onclick="copyQuestion({{ $question->id }})">
                                                <i class="fas fa-copy me-2"></i>Salin ke Bank Soal
                                            </a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <h6 class="card-title">{{ Str::limit($question->question_text, 100) }}</h6>
                                    <p class="card-text">
                                        <small class="text-muted">
                                            <i class="fas fa-user me-1"></i>
                                            Dibuat oleh: {{ $question->creator->name ?? 'Unknown' }}
                                        </small>
                                    </p>
                                    <p class="card-text">
                                        <small class="text-muted">
                                            <i class="fas fa-building me-1"></i>
                                            Dari: {{ $question->originTenant->name ?? 'Unknown' }}
                                        </small>
                                    </p>
                                    <p class="card-text">
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            Dibagikan: {{ $question->shared_at ? $question->shared_at->format('d/m/Y H:i') : 'Unknown' }}
                                        </small>
                                    </p>
                                </div>
                                <div class="card-footer">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge bg-secondary">{{ $question->subject->name }}</span>
                                        <button class="btn btn-sm btn-primary" onclick="copyQuestion({{ $question->id }})">
                                            <i class="fas fa-copy me-1"></i>
                                            Salin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @empty
                        <div class="col-12">
                            <div class="text-center py-5">
                                <i class="fas fa-share-alt fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">Tidak ada soal yang dibagikan</h5>
                                <p class="text-muted">Belum ada soal yang dibagikan oleh tenant lain</p>
                            </div>
                        </div>
                        @endforelse
                    </div>

                    <!-- Pagination -->
                    @if($questions->hasPages())
                    <div class="d-flex justify-content-center">
                        {{ $questions->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Question Detail Modal -->
<div class="modal fade" id="questionDetailModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detail Soal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="questionDetailContent">
                <!-- Content will be loaded here -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                <button type="button" class="btn btn-primary" id="copyFromModal">
                    <i class="fas fa-copy me-1"></i>
                    Salin ke Bank Soal
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let currentQuestionId = null;

    function filterQuestions() {
        const subjectId = document.getElementById('subject_filter').value;
        const type = document.getElementById('type_filter').value;
        const difficulty = document.getElementById('difficulty_filter').value;
        const search = document.getElementById('search_filter').value;

        const url = new URL(window.location);
        url.searchParams.set('subject_id', subjectId);
        url.searchParams.set('type', type);
        url.searchParams.set('difficulty', difficulty);
        url.searchParams.set('search', search);

        window.location.href = url.toString();
    }

    function viewQuestion(questionId) {
        currentQuestionId = questionId;
        
        // Show loading
        document.getElementById('questionDetailContent').innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Load question detail
        const baseUrl = '{{ tenant_route("questions.index") }}';
        fetch(baseUrl.replace(/\/questions$/, '/questions/' + questionId))
            .then(response => response.text())
            .then(html => {
                document.getElementById('questionDetailContent').innerHTML = html;
                new bootstrap.Modal(document.getElementById('questionDetailModal')).show();
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('questionDetailContent').innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Gagal memuat detail soal
                    </div>
                `;
            });
    }

    function copyQuestion(questionId) {
        if (confirm('Apakah Anda yakin ingin menyalin soal ini ke bank soal Anda?')) {
            const baseUrl = '{{ tenant_route("questions.index") }}';
            const url = baseUrl.replace(/\/questions$/, '/questions/' + questionId + '/copy');
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Soal berhasil disalin ke bank soal Anda');
                    location.reload();
                } else {
                    alert('Gagal menyalin soal: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menyalin soal');
            });
        }
    }

    // Copy from modal
    document.getElementById('copyFromModal').addEventListener('click', function() {
        if (currentQuestionId) {
            copyQuestion(currentQuestionId);
        }
    });
</script>
@endpush
