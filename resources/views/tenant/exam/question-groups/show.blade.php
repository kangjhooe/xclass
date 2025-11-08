@extends('layouts.tenant')

@section('title', 'Detail Kelompok Soal')
@section('page-title', 'Detail Kelompok Soal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-layer-group me-2"></i>
                        {{ $questionGroup->title }}
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Stimulus Display -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="{{ $questionGroup->stimulus_type_icon }} me-2"></i>
                                Stimulus ({{ $questionGroup->stimulus_type_label }})
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="stimulus-content">
                                {!! $questionGroup->formatted_stimulus_content !!}
                            </div>
                            @if($questionGroup->description)
                                <div class="mt-3">
                                    <small class="text-muted">
                                        <strong>Deskripsi:</strong> {{ $questionGroup->description }}
                                    </small>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Questions in Group -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                <i class="fas fa-question-circle me-2"></i>
                                Soal dalam Kelompok ({{ $questionGroup->questions->count() }})
                            </h6>
                            <div>
                                <button type="button" class="btn btn-sm btn-primary" onclick="showAddQuestionModal()">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Soal
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="toggleQuestionOrder()">
                                    <i class="fas fa-sort me-1"></i>
                                    Urutkan
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            @if($questionGroup->questions->count() > 0)
                                <div id="questions-list">
                                    @foreach($questionGroup->questions as $index => $question)
                                    <div class="question-item mb-3 p-3 border rounded" data-question-id="{{ $question->id }}">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div class="flex-grow-1">
                                                <div class="d-flex align-items-center mb-2">
                                                    <span class="badge bg-primary me-2">{{ $index + 1 }}</span>
                                                    <span class="badge bg-{{ $question->difficulty_color }} me-2">
                                                        {{ $question->difficulty_label }}
                                                    </span>
                                                    <span class="badge bg-secondary me-2">
                                                        {{ $question->type_label }}
                                                    </span>
                                                    <span class="badge bg-success">
                                                        {{ $question->points }} poin
                                                    </span>
                                                </div>
                                                <div class="question-text">
                                                    <strong>{{ $question->question_text }}</strong>
                                                </div>
                                                @if($question->options && in_array($question->type, ['multiple_choice', 'true_false']))
                                                <div class="mt-2">
                                                    <small class="text-muted">Opsi jawaban:</small>
                                                    <ul class="list-unstyled mt-1">
                                                        @foreach($question->options as $key => $option)
                                                        <li>
                                                            <small>{{ $key }}. {{ $option }}</small>
                                                            @if($question->answer_key == $key)
                                                                <span class="badge bg-success ms-1">Benar</span>
                                                            @endif
                                                        </li>
                                                        @endforeach
                                                    </ul>
                                                </div>
                                                @endif
                                                @if($question->explanation)
                                                <div class="mt-2">
                                                    <small class="text-muted">
                                                        <strong>Penjelasan:</strong> {{ $question->explanation }}
                                                    </small>
                                                </div>
                                                @endif
                                            </div>
                                            <div class="ms-3">
                                                <div class="btn-group-vertical" role="group">
                                                    <a href="{{ tenant_route('questions.show', $question) }}" 
                                                       class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    <a href="{{ tenant_route('questions.edit', $question) }}" 
                                                       class="btn btn-sm btn-outline-warning" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </a>
                                                    <form action="{{ tenant_route('question-groups.remove-question', [$questionGroup, $question]) }}" 
                                                          method="POST" class="d-inline"
                                                          onsubmit="return confirm('Yakin ingin mengeluarkan soal ini dari kelompok?')">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Keluarkan dari Kelompok">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="text-center py-4">
                                    <div class="text-muted">
                                        <i class="fas fa-question-circle fa-3x mb-3"></i>
                                        <p>Belum ada soal dalam kelompok ini</p>
                                        <button type="button" class="btn btn-primary" onclick="showAddQuestionModal()">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Soal Pertama
                                        </button>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Statistics -->
                    <div class="row mt-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body text-center">
                                    <h4 class="mb-0">{{ $questionGroup->questions_count }}</h4>
                                    <p class="mb-0">Total Soal</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body text-center">
                                    <h4 class="mb-0">{{ $questionGroup->total_points }}</h4>
                                    <p class="mb-0">Total Poin</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body text-center">
                                    <h4 class="mb-0">{{ $questionGroup->questions->groupBy('type')->count() }}</h4>
                                    <p class="mb-0">Jenis Soal</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body text-center">
                                    <h4 class="mb-0">{{ $questionGroup->questions->groupBy('difficulty')->count() }}</h4>
                                    <p class="mb-0">Tingkat Kesulitan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add Question Modal -->
<div class="modal fade" id="addQuestionModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Tambah Soal ke Kelompok</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div id="availableQuestionsList">
                    <div class="text-center">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let isOrdering = false;

    function showAddQuestionModal() {
        $('#addQuestionModal').modal('show');
        
        // Load available questions
        $.get(`/tenant/question-groups/{{ $questionGroup->id }}/available-questions`)
            .done(function(data) {
                let html = '';
                if (data.questions.length > 0) {
                    html = '<div class="list-group">';
                    data.questions.forEach(function(question) {
                        html += `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">${question.question_text.substring(0, 100)}${question.question_text.length > 100 ? '...' : ''}</h6>
                                    <small class="text-muted">${question.subject.name} • ${question.type_label} • ${question.points} poin</small>
                                </div>
                                <button type="button" class="btn btn-sm btn-primary" onclick="addQuestionToGroup(${question.id})">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah
                                </button>
                            </div>
                        `;
                    });
                    html += '</div>';
                } else {
                    html = '<div class="alert alert-info">Tidak ada soal yang tersedia untuk ditambahkan ke kelompok ini.</div>';
                }
                $('#availableQuestionsList').html(html);
            })
            .fail(function() {
                $('#availableQuestionsList').html('<div class="alert alert-danger">Gagal memuat soal yang tersedia.</div>');
            });
    }

    function addQuestionToGroup(questionId) {
        $.post(`/tenant/question-groups/{{ $questionGroup->id }}/add-question`, {
            question_id: questionId,
            _token: $('meta[name="csrf-token"]').attr('content')
        })
        .done(function() {
            $('#addQuestionModal').modal('hide');
            location.reload();
        })
        .fail(function() {
            alert('Gagal menambahkan soal ke kelompok');
        });
    }

    function toggleQuestionOrder() {
        isOrdering = !isOrdering;
        const questionsList = document.getElementById('questions-list');
        
        if (isOrdering) {
            questionsList.classList.add('sortable');
            // Enable drag and drop functionality
            // This would require additional JavaScript library like SortableJS
            alert('Fitur pengurutan akan segera tersedia');
        } else {
            questionsList.classList.remove('sortable');
        }
    }
</script>
@endpush
