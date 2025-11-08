@extends('layouts.tenant')

@section('title', 'Mengerjakan Ujian')
@section('page-title', 'Mengerjakan Ujian')

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
                                {{ $attempt->exam->title }}
                            </h5>
                            <small>{{ $attempt->exam->subject->name }} - {{ $attempt->exam->classRoom->name }}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="d-flex align-items-center justify-content-end">
                                <div class="me-3">
                                    <div class="text-center">
                                        <div class="h4 mb-0" id="timer">00:00:00</div>
                                        <small>Sisa Waktu</small>
                                    </div>
                                </div>
                                <div class="progress me-3" style="width: 100px; height: 8px;">
                                    <div class="progress-bar" id="progress-bar" role="progressbar" style="width: 0%"></div>
                                </div>
                                <button type="button" class="btn btn-warning" id="submit-exam-btn" onclick="submitExam()">
                                    <i class="fas fa-paper-plane me-1"></i>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Exam Instructions -->
            @if($attempt->exam->instructions)
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-info-circle me-2"></i>
                            Instruksi Ujian
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            {!! nl2br(e($attempt->exam->instructions)) !!}
                        </div>
                    </div>
                </div>
            @endif

            <!-- Questions Navigation -->
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-list me-2"></i>
                        Navigasi Soal
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row" id="question-nav">
                        @foreach($questions as $index => $question)
                            <div class="col-md-2 col-sm-3 col-4 mb-2">
                                <button type="button" 
                                        class="btn btn-outline-secondary w-100 question-nav-btn" 
                                        data-question="{{ $index + 1 }}"
                                        id="nav-{{ $index + 1 }}">
                                    {{ $index + 1 }}
                                </button>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Questions -->
            <form id="exam-form">
                @csrf
                <input type="hidden" id="attempt-id" value="{{ $attempt->id }}">
                
                @foreach($questions as $index => $question)
                    <div class="card mb-3 question-card" id="question-{{ $index + 1 }}" style="display: none;">
                        <div class="card-header">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h6 class="card-title mb-0">
                                        Soal {{ $index + 1 }} dari {{ $questions->count() }}
                                        <span class="badge bg-{{ $question->difficulty_color }} ms-2">
                                            {{ $question->difficulty_label }}
                                        </span>
                                        <span class="badge bg-primary ms-1">
                                            {{ $question->points }} poin
                                        </span>
                                    </h6>
                                </div>
                                <div class="col-md-4 text-end">
                                    <div class="btn-group" role="group">
                                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="previousQuestion()" {{ $index === 0 ? 'disabled' : '' }}>
                                            <i class="fas fa-chevron-left"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="nextQuestion()" {{ $index === $questions->count() - 1 ? 'disabled' : '' }}>
                                            <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- Question Text -->
                            <div class="mb-4">
                                <h6>Pertanyaan:</h6>
                                <div class="question-text">
                                    {!! nl2br(e($question->question_text)) !!}
                                </div>
                            </div>

                            <!-- Answer Options -->
                            <div class="answer-options">
                                @if($question->question_type === 'multiple_choice')
                                    @php
                                        $options = $attempt->exam->randomize_answers ? 
                                            $question->getRandomizedOptions(true) : 
                                            $question->options;
                                    @endphp
                                    @foreach($options as $key => $option)
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" type="radio" 
                                                   name="answer_{{ $question->id }}" 
                                                   id="option_{{ $question->id }}_{{ $key }}" 
                                                   value="{{ $key }}"
                                                   data-question-id="{{ $question->id }}">
                                            <label class="form-check-label" for="option_{{ $question->id }}_{{ $key }}">
                                                {{ $key }}. {{ $option }}
                                            </label>
                                        </div>
                                    @endforeach
                                    
                                @elseif($question->question_type === 'true_false')
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="radio" 
                                               name="answer_{{ $question->id }}" 
                                               id="option_{{ $question->id }}_true" 
                                               value="true"
                                               data-question-id="{{ $question->id }}">
                                        <label class="form-check-label" for="option_{{ $question->id }}_true">
                                            Benar
                                        </label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="radio" 
                                               name="answer_{{ $question->id }}" 
                                               id="option_{{ $question->id }}_false" 
                                               value="false"
                                               data-question-id="{{ $question->id }}">
                                        <label class="form-check-label" for="option_{{ $question->id }}_false">
                                            Salah
                                        </label>
                                    </div>
                                    
                                @elseif($question->question_type === 'fill_blank')
                                    <div class="mb-3">
                                        <label for="answer_{{ $question->id }}" class="form-label">Jawaban:</label>
                                        <input type="text" class="form-control" 
                                               id="answer_{{ $question->id }}" 
                                               name="answer_{{ $question->id }}"
                                               data-question-id="{{ $question->id }}"
                                               placeholder="Masukkan jawaban Anda">
                                    </div>
                                    
                                @elseif($question->question_type === 'essay')
                                    <div class="mb-3">
                                        <label for="answer_{{ $question->id }}" class="form-label">Jawaban:</label>
                                        <div id="essay-editor-container-{{ $question->id }}">
                                            <textarea class="form-control" 
                                                      id="answer_{{ $question->id }}" 
                                                      name="answer_{{ $question->id }}"
                                                      data-question-id="{{ $question->id }}"
                                                      rows="5" 
                                                      placeholder="Tulis jawaban Anda di sini"></textarea>
                                        </div>
                                    </div>
                                    
                                @elseif($question->question_type === 'matching')
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6>Kolom A:</h6>
                                            @foreach($question->options['left'] ?? [] as $key => $left)
                                                <div class="mb-2">
                                                    <span class="badge bg-primary me-2">{{ $key }}</span>
                                                    {{ $left }}
                                                </div>
                                            @endforeach
                                        </div>
                                        <div class="col-md-6">
                                            <h6>Kolom B:</h6>
                                            @foreach($question->options['right'] ?? [] as $key => $right)
                                                <div class="mb-2">
                                                    <span class="badge bg-secondary me-2">{{ $key }}</span>
                                                    {{ $right }}
                                                </div>
                                            @endforeach
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <label class="form-label">Jawaban (format: A1-B2, A2-B1, dst.):</label>
                                        <input type="text" class="form-control" 
                                               id="answer_{{ $question->id }}" 
                                               name="answer_{{ $question->id }}"
                                               data-question-id="{{ $question->id }}"
                                               placeholder="Contoh: A1-B2, A2-B1">
                                    </div>
                                @endif
                            </div>

                            <!-- Question Navigation -->
                            <div class="mt-4">
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-outline-primary" onclick="previousQuestion()" {{ $index === 0 ? 'disabled' : '' }}>
                                        <i class="fas fa-chevron-left me-1"></i>
                                        Sebelumnya
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="nextQuestion()" {{ $index === $questions->count() - 1 ? 'disabled' : '' }}>
                                        Selanjutnya
                                        <i class="fas fa-chevron-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </form>
        </div>
    </div>
</div>

<!-- Submit Confirmation Modal -->
<div class="modal fade" id="submitModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Submit</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Apakah Anda yakin ingin mengirim jawaban ujian?</p>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Setelah submit, Anda tidak dapat mengubah jawaban lagi.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary" onclick="confirmSubmit()">Ya, Submit</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
let currentQuestion = 1;
let totalQuestions = {{ $questions->count() }};
let timeRemaining = {{ $attempt->getRemainingTime() }};
let timerInterval;
let autoSaveInterval;

// Initialize exam
document.addEventListener('DOMContentLoaded', function() {
    showQuestion(1);
    startTimer();
    startAutoSave();
    loadSavedAnswers();
    
    // Add event listeners for answer changes
    document.querySelectorAll('input[name^="answer_"], textarea[name^="answer_"]').forEach(function(element) {
        element.addEventListener('change', function() {
            saveAnswer(this);
            updateQuestionStatus();
        });
    });
});

function showQuestion(questionNumber) {
    // Hide all questions
    document.querySelectorAll('.question-card').forEach(function(card) {
        card.style.display = 'none';
    });
    
    // Show current question
    document.getElementById('question-' + questionNumber).style.display = 'block';
    
    // Update navigation buttons
    document.querySelectorAll('.question-nav-btn').forEach(function(btn) {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    
    document.getElementById('nav-' + questionNumber).classList.remove('btn-outline-secondary');
    document.getElementById('nav-' + questionNumber).classList.add('btn-primary');
    
    currentQuestion = questionNumber;
    updateProgress();
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        showQuestion(currentQuestion + 1);
    }
}

function previousQuestion() {
    if (currentQuestion > 1) {
        showQuestion(currentQuestion - 1);
    }
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(function() {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmit();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const timeString = String(hours).padStart(2, '0') + ':' + 
                      String(minutes).padStart(2, '0') + ':' + 
                      String(seconds).padStart(2, '0');
    
    document.getElementById('timer').textContent = timeString;
    
    // Change color when time is running low
    if (timeRemaining <= 300) { // 5 minutes
        document.getElementById('timer').classList.add('text-danger');
    }
}

function startAutoSave() {
    autoSaveInterval = setInterval(function() {
        saveAllAnswers(true);
    }, 30000); // Auto-save every 30 seconds
}

function saveAnswer(element) {
    const questionId = element.dataset.questionId;
    const answer = element.value;
    
    fetch('{{ tenant_route("exam.save-answer", $attempt) }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
            question_id: questionId,
            answer: answer,
            time_spent: 0,
            auto_save: true
        })
    });
}

function saveAllAnswers(autoSave = false) {
    const answers = {};
    
    document.querySelectorAll('input[name^="answer_"], textarea[name^="answer_"]').forEach(function(element) {
        if (element.value) {
            const questionId = element.dataset.questionId;
            answers[questionId] = element.value;
        }
    });
    
    if (Object.keys(answers).length > 0) {
        fetch('{{ tenant_route("exam.save-answer", $attempt) }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                answers: answers,
                auto_save: autoSave
            })
        });
    }
}

function loadSavedAnswers() {
    // This would typically load from the server
    // For now, we'll just update the question status
    updateQuestionStatus();
}

function updateQuestionStatus() {
    document.querySelectorAll('.question-nav-btn').forEach(function(btn) {
        const questionNumber = parseInt(btn.dataset.question);
        const questionId = document.querySelector(`#question-${questionNumber} input[name^="answer_"], #question-${questionNumber} textarea[name^="answer_"]`)?.dataset.questionId;
        
        if (questionId) {
            const answerElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (answerElement && answerElement.value) {
                btn.classList.remove('btn-outline-secondary');
                btn.classList.add('btn-success');
            } else {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-secondary');
            }
        }
    });
}

function submitExam() {
    const modal = new bootstrap.Modal(document.getElementById('submitModal'));
    modal.show();
}

function confirmSubmit() {
    saveAllAnswers(false);
    
    fetch('{{ tenant_route("exam.submit", $attempt) }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            alert('Terjadi kesalahan: ' + data.error);
        }
    });
}

function autoSubmit() {
    if (confirm('Waktu ujian telah habis. Jawaban akan disubmit otomatis.')) {
        confirmSubmit();
    }
}

// Navigation click handlers
document.querySelectorAll('.question-nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const questionNumber = parseInt(this.dataset.question);
        showQuestion(questionNumber);
    });
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', function(e) {
    if (timeRemaining > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});
</script>
@endpush
@endsection
