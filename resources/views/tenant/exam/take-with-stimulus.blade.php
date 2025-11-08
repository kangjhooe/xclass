@extends('layouts.tenant')

@section('title', 'Mengerjakan Ujian')
@section('page-title', 'Mengerjakan Ujian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-clipboard-list me-2"></i>
                            {{ $attempt->exam->title }}
                        </h5>
                        <div class="d-flex align-items-center gap-3">
                            <div class="text-end">
                                <div class="h5 mb-0 text-primary" id="timer">00:00:00</div>
                                <small class="text-muted">Sisa Waktu</small>
                            </div>
                            <div class="text-end">
                                <div class="h6 mb-0" id="progress">0/{{ $questions->count() }}</div>
                                <small class="text-muted">Soal</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <form id="examForm" action="{{ tenant_route('exam.submit', $attempt) }}" method="POST">
                        @csrf
                        
                        <!-- Exam Instructions -->
                        @if($attempt->exam->instructions)
                        <div class="alert alert-info mb-4">
                            <h6 class="alert-heading">
                                <i class="fas fa-info-circle me-1"></i>
                                Instruksi Ujian
                            </h6>
                            <p class="mb-0">{{ $attempt->exam->instructions }}</p>
                        </div>
                        @endif

                        <!-- Questions with Stimulus -->
                        <div id="questions-container">
                            @php
                                $currentGroup = null;
                                $questionNumber = 1;
                            @endphp
                            
                            @foreach($questions as $question)
                                @if($question->belongsToGroup() && $question->questionGroup->id !== $currentGroup?->id)
                                    @php
                                        $currentGroup = $question->questionGroup;
                                    @endphp
                                    
                                    <!-- Stimulus Display -->
                                    <div class="card mb-4 stimulus-card" data-group-id="{{ $currentGroup->id }}">
                                        <div class="card-header bg-primary text-white">
                                            <h6 class="mb-0">
                                                <i class="{{ $currentGroup->stimulus_type_icon }} me-2"></i>
                                                Stimulus: {{ $currentGroup->title }}
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="stimulus-content">
                                                {!! $currentGroup->formatted_stimulus_content !!}
                                            </div>
                                            @if($currentGroup->description)
                                                <div class="mt-3">
                                                    <small class="text-muted">
                                                        <strong>Deskripsi:</strong> {{ $currentGroup->description }}
                                                    </small>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                @endif

                                <!-- Question Display -->
                                <div class="card mb-4 question-card" data-question-id="{{ $question->id }}" data-group-id="{{ $question->question_group_id }}">
                                    <div class="card-header">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h6 class="mb-0">
                                                Soal {{ $questionNumber }}
                                                @if($question->belongsToGroup())
                                                    <small class="text-muted">(Kelompok: {{ $question->questionGroup->title }})</small>
                                                @endif
                                            </h6>
                                            <div>
                                                <span class="badge bg-{{ $question->difficulty_color }} me-2">
                                                    {{ $question->difficulty_label }}
                                                </span>
                                                <span class="badge bg-success">
                                                    {{ $question->points }} poin
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="question-text mb-3">
                                            <strong>{{ $question->question_text }}</strong>
                                        </div>

                                        <!-- Answer Options -->
                                        <div class="answer-options">
                                            @if($question->type === 'multiple_choice')
                                                @php
                                                    $options = $question->randomized_options ?? $question->options;
                                                @endphp
                                                @foreach($options as $key => $option)
                                                <div class="form-check mb-2">
                                                    <input class="form-check-input" type="radio" 
                                                           name="answers[{{ $question->id }}]" 
                                                           id="q{{ $question->id }}_{{ $key }}" 
                                                           value="{{ $key }}"
                                                           data-question-id="{{ $question->id }}">
                                                    <label class="form-check-label" for="q{{ $question->id }}_{{ $key }}">
                                                        {{ $key }}. {{ $option }}
                                                    </label>
                                                </div>
                                                @endforeach
                                            
                                            @elseif($question->type === 'true_false')
                                                @php
                                                    $options = $question->randomized_options ?? $question->options;
                                                @endphp
                                                @foreach($options as $key => $option)
                                                <div class="form-check mb-2">
                                                    <input class="form-check-input" type="radio" 
                                                           name="answers[{{ $question->id }}]" 
                                                           id="q{{ $question->id }}_{{ $key }}" 
                                                           value="{{ $key }}"
                                                           data-question-id="{{ $question->id }}">
                                                    <label class="form-check-label" for="q{{ $question->id }}_{{ $key }}">
                                                        {{ $option }}
                                                    </label>
                                                </div>
                                                @endforeach
                                            
                                            @elseif($question->type === 'essay')
                                                <div class="mb-3">
                                                    <textarea class="form-control" 
                                                              name="answers[{{ $question->id }}]" 
                                                              id="q{{ $question->id }}"
                                                              rows="5" 
                                                              placeholder="Tulis jawaban Anda di sini..."
                                                              data-question-id="{{ $question->id }}"></textarea>
                                                </div>
                                            
                                            @elseif($question->type === 'fill_blank')
                                                <div class="mb-3">
                                                    <input type="text" class="form-control" 
                                                           name="answers[{{ $question->id }}]" 
                                                           id="q{{ $question->id }}"
                                                           placeholder="Jawaban Anda..."
                                                           data-question-id="{{ $question->id }}">
                                                </div>
                                            
                                            @elseif($question->type === 'matching')
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <h6>Kolom A</h6>
                                                        @foreach($question->options['left'] ?? [] as $key => $item)
                                                        <div class="mb-2">
                                                            <label class="form-label">{{ $key }}. {{ $item }}</label>
                                                        </div>
                                                        @endforeach
                                                    </div>
                                                    <div class="col-md-6">
                                                        <h6>Kolom B</h6>
                                                        @foreach($question->options['right'] ?? [] as $key => $item)
                                                        <div class="mb-2">
                                                            <select class="form-select" 
                                                                    name="answers[{{ $question->id }}][{{ $key }}]"
                                                                    data-question-id="{{ $question->id }}">
                                                                <option value="">Pilih jawaban</option>
                                                                @foreach($question->options['right'] as $rightKey => $rightItem)
                                                                <option value="{{ $rightKey }}">{{ $rightItem }}</option>
                                                                @endforeach
                                                            </select>
                                                        </div>
                                                        @endforeach
                                                    </div>
                                                </div>
                                            @endif
                                        </div>

                                        <!-- Question Navigation -->
                                        <div class="d-flex justify-content-between mt-3">
                                            <button type="button" class="btn btn-outline-secondary" 
                                                    onclick="markForReview({{ $question->id }})">
                                                <i class="fas fa-flag me-1"></i>
                                                Tandai untuk Review
                                            </button>
                                            <div>
                                                <button type="button" class="btn btn-outline-primary me-2" 
                                                        onclick="saveAnswer({{ $question->id }})">
                                                    <i class="fas fa-save me-1"></i>
                                                    Simpan
                                                </button>
                                                <span class="badge bg-info" id="saved-{{ $question->id }}" style="display: none;">
                                                    Tersimpan
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                @php $questionNumber++; @endphp
                            @endforeach
                        </div>

                        <!-- Submit Button -->
                        <div class="text-center mt-4">
                            <button type="button" class="btn btn-success btn-lg" onclick="submitExam()">
                                <i class="fas fa-check me-2"></i>
                                Selesai dan Submit Ujian
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let timeLeft = {{ $attempt->getRemainingTime() }};
    let timerInterval;
    let autoSaveInterval;

    document.addEventListener('DOMContentLoaded', function() {
        // Start timer
        startTimer();
        
        // Auto-save every 30 seconds
        autoSaveInterval = setInterval(autoSave, 30000);
        
        // Load saved answers
        loadSavedAnswers();
        
        // Update progress
        updateProgress();
    });

    function startTimer() {
        timerInterval = setInterval(function() {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitExam();
                return;
            }
            
            timeLeft--;
            updateTimerDisplay();
        }, 1000);
        
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        document.getElementById('timer').textContent = 
            String(hours).padStart(2, '0') + ':' + 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
    }

    function updateProgress() {
        const totalQuestions = {{ $questions->count() }};
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked, textarea:not(:empty), input[type="text"]:not(:empty)').length;
        document.getElementById('progress').textContent = `${answeredQuestions}/${totalQuestions}`;
    }

    function saveAnswer(questionId) {
        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        
        const answerInputs = document.querySelectorAll(`[data-question-id="${questionId}"]`);
        let answer = '';
        
        if (answerInputs[0].type === 'radio') {
            const checked = document.querySelector(`input[name="answers[${questionId}]"]:checked`);
            answer = checked ? checked.value : '';
        } else if (answerInputs[0].tagName === 'TEXTAREA') {
            answer = answerInputs[0].value;
        } else if (answerInputs[0].type === 'text') {
            answer = answerInputs[0].value;
        } else if (answerInputs[0].tagName === 'SELECT') {
            // For matching questions
            const selects = document.querySelectorAll(`select[data-question-id="${questionId}"]`);
            const answers = {};
            selects.forEach((select, index) => {
                answers[index] = select.value;
            });
            answer = JSON.stringify(answers);
        }
        
        formData.append('answer', answer);
        
        fetch(`/tenant/exam/save-answer/{{ $attempt->id }}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById(`saved-${questionId}`).style.display = 'inline';
                setTimeout(() => {
                    document.getElementById(`saved-${questionId}`).style.display = 'none';
                }, 2000);
                updateProgress();
            }
        })
        .catch(error => {
            console.error('Error saving answer:', error);
        });
    }

    function autoSave() {
        const allQuestions = document.querySelectorAll('.question-card');
        allQuestions.forEach(questionCard => {
            const questionId = questionCard.getAttribute('data-question-id');
            saveAnswer(questionId);
        });
    }

    function loadSavedAnswers() {
        // This would load previously saved answers
        // Implementation depends on your API
    }

    function markForReview(questionId) {
        // Implementation for marking questions for review
        console.log('Marking question for review:', questionId);
    }

    function submitExam() {
        if (confirm('Yakin ingin menyelesaikan ujian? Pastikan semua jawaban sudah disimpan.')) {
            // Auto-save all answers before submit
            autoSave();
            
            setTimeout(() => {
                document.getElementById('examForm').submit();
            }, 1000);
        }
    }

    // Add event listeners for answer changes
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="radio"], textarea, input[type="text"], select')) {
            updateProgress();
        }
    });
</script>
@endpush
