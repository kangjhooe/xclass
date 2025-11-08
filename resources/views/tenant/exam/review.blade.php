@extends('layouts.tenant')

@section('title', 'Review Hasil Ujian')
@section('page-title', 'Review Hasil Ujian')

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
                                <i class="fas fa-clipboard-check me-2"></i>
                                {{ $attempt->exam->title }}
                            </h5>
                            <small>{{ $attempt->exam->subject->name }} - {{ $attempt->exam->classRoom->name }}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="d-flex align-items-center justify-content-end">
                                <div class="me-3 text-center">
                                    <div class="h4 mb-0">{{ $attempt->score }}/{{ $attempt->exam->total_score }}</div>
                                    <small>Nilai</small>
                                </div>
                                <div class="text-center">
                                    <div class="h4 mb-0">{{ $attempt->grading_data['percentage_score'] ?? 0 }}%</div>
                                    <small>Persentase</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Summary Stats -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $attempt->correct_answers }}</h4>
                            <p class="mb-0">Jawaban Benar</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-check-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-danger text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $attempt->total_questions - $attempt->correct_answers }}</h4>
                            <p class="mb-0">Jawaban Salah</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-times-circle fa-2x"></i>
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
                            <h4 class="mb-0">{{ $attempt->time_spent }}s</h4>
                            <p class="mb-0">Waktu Pengerjaan</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card {{ $attempt->grading_data['is_passed'] ?? false ? 'bg-success' : 'bg-warning' }} text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $attempt->grading_data['is_passed'] ?? false ? 'LULUS' : 'TIDAK LULUS' }}</h4>
                            <p class="mb-0">Status</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-{{ $attempt->grading_data['is_passed'] ?? false ? 'trophy' : 'exclamation-triangle' }} fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Review Controls -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h6 class="mb-0">Review Jawaban</h6>
                            <small class="text-muted">Lihat jawaban Anda dan kunci jawaban yang benar</small>
                        </div>
                        <div class="col-md-6 text-end">
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-outline-primary" id="toggle-answers">
                                    <i class="fas fa-eye me-1"></i>
                                    <span id="toggle-text">Tampilkan Kunci Jawaban</span>
                                </button>
                                <button type="button" class="btn btn-outline-success" onclick="exportResults()">
                                    <i class="fas fa-download me-1"></i> Export
                                </button>
                                <a href="{{ tenant_route('exam.index') }}" class="btn btn-outline-secondary">
                                    <i class="fas fa-arrow-left me-1"></i> Kembali
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Questions Review -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-list me-2"></i>
                        Review Jawaban ({{ $questions->count() }} Soal)
                    </h6>
                </div>
                <div class="card-body">
                    @foreach($questions as $index => $question)
                        @php
                            $answer = $question->answers->where('attempt_id', $attempt->id)->first();
                            $isCorrect = $answer ? $answer->is_correct : false;
                            $studentAnswer = $answer ? $answer->answer : null;
                            $correctAnswer = $question->correct_answer;
                        @endphp
                        
                        <div class="question-review-item mb-4 {{ $isCorrect ? 'correct' : 'incorrect' }}">
                            <div class="question-header">
                                <div class="question-number">
                                    <span class="number">{{ $index + 1 }}</span>
                                    <span class="status {{ $isCorrect ? 'correct' : 'incorrect' }}">
                                        <i class="fas fa-{{ $isCorrect ? 'check' : 'times' }}"></i>
                                    </span>
                                </div>
                                <div class="question-points">
                                    <span class="points">{{ $answer ? $answer->points : 0 }}/{{ $question->points }} poin</span>
                                    <span class="difficulty difficulty-{{ $question->difficulty }}">
                                        {{ ucfirst($question->difficulty) }}
                                    </span>
                                </div>
                            </div>

                            <div class="question-content">
                                <div class="question-text">
                                    {!! $question->question_text !!}
                                </div>
                                
                                <!-- Student Answer -->
                                <div class="answer-section">
                                    <h6>Jawaban Anda:</h6>
                                    <div class="student-answer {{ $isCorrect ? 'answer-correct' : 'answer-incorrect' }}">
                                        @if($question->question_type === 'multiple_choice')
                                            @php
                                                $options = $question->formatted_options;
                                                $selectedOption = null;
                                                foreach($options as $option) {
                                                    if($option['value'] === $studentAnswer) {
                                                        $selectedOption = $option;
                                                        break;
                                                    }
                                                }
                                            @endphp
                                            @if($selectedOption)
                                                <div class="option-review selected">
                                                    <span class="option-letter">{{ $selectedOption['letter'] }}</span>
                                                    <span class="option-text">{{ $selectedOption['text'] }}</span>
                                                </div>
                                            @else
                                                <div class="no-answer">Tidak dijawab</div>
                                            @endif
                                            
                                        @elseif($question->question_type === 'true_false')
                                            <div class="option-review selected">
                                                <span class="option-letter">{{ $studentAnswer === 'true' ? 'A' : 'B' }}</span>
                                                <span class="option-text">{{ $studentAnswer === 'true' ? 'Benar' : 'Salah' }}</span>
                                            </div>
                                            
                                        @elseif($question->question_type === 'essay')
                                            <div class="essay-answer">
                                                <div class="answer-text">{{ $studentAnswer ?: 'Tidak dijawab' }}</div>
                                                @if($answer && $answer->grading_data['feedback'] ?? false)
                                                    <div class="feedback">
                                                        <strong>Feedback:</strong> {{ $answer->grading_data['feedback'] }}
                                                    </div>
                                                @endif
                                            </div>
                                            
                                        @elseif($question->question_type === 'fill_blank')
                                            <div class="fill-blank-answer">
                                                <div class="answer-text">{{ $studentAnswer ?: 'Tidak dijawab' }}</div>
                                            </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Correct Answer (Hidden by default) -->
                                <div class="correct-answer-section" id="correct-answer-{{ $question->id }}" style="display: none;">
                                    <h6>Kunci Jawaban:</h6>
                                    <div class="correct-answer">
                                        @if($question->question_type === 'multiple_choice')
                                            @php
                                                $correctOption = null;
                                                foreach($question->formatted_options as $option) {
                                                    if($option['value'] === $correctAnswer) {
                                                        $correctOption = $option;
                                                        break;
                                                    }
                                                }
                                            @endphp
                                            @if($correctOption)
                                                <div class="option-review correct-answer">
                                                    <span class="option-letter">{{ $correctOption['letter'] }}</span>
                                                    <span class="option-text">{{ $correctOption['text'] }}</span>
                                                </div>
                                            @endif
                                            
                                        @elseif($question->question_type === 'true_false')
                                            <div class="option-review correct-answer">
                                                <span class="option-letter">{{ $correctAnswer === 'true' ? 'A' : 'B' }}</span>
                                                <span class="option-text">{{ $correctAnswer === 'true' ? 'Benar' : 'Salah' }}</span>
                                            </div>
                                            
                                        @elseif($question->question_type === 'essay')
                                            <div class="essay-answer">
                                                <div class="answer-text">{{ $correctAnswer ?: 'Tidak ada kunci jawaban' }}</div>
                                            </div>
                                            
                                        @elseif($question->question_type === 'fill_blank')
                                            <div class="fill-blank-answer">
                                                <div class="answer-text">{{ $correctAnswer ?: 'Tidak ada kunci jawaban' }}</div>
                                            </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Explanation -->
                                @if($question->explanation)
                                    <div class="explanation-section" id="explanation-{{ $question->id }}" style="display: none;">
                                        <h6>Penjelasan:</h6>
                                        <div class="explanation-text">{{ $question->explanation }}</div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
.question-review-item {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.question-review-item.correct {
    border-left: 4px solid #28a745;
}

.question-review-item.incorrect {
    border-left: 4px solid #dc3545;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.question-number {
    display: flex;
    align-items: center;
    gap: 10px;
}

.number {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
}

.status {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
}

.status.correct {
    background: #28a745;
}

.status.incorrect {
    background: #dc3545;
}

.question-points {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.points {
    font-weight: bold;
    color: #2c3e50;
}

.difficulty {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
}

.difficulty-easy {
    background: #d4edda;
    color: #155724;
}

.difficulty-medium {
    background: #fff3cd;
    color: #856404;
}

.difficulty-hard {
    background: #f8d7da;
    color: #721c24;
}

.question-content {
    padding: 20px;
}

.question-text {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
    color: #2c3e50;
}

.answer-section {
    margin-bottom: 20px;
}

.answer-section h6 {
    color: #495057;
    margin-bottom: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.student-answer {
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.answer-correct {
    background: #d4edda;
    border-color: #c3e6cb;
}

.answer-incorrect {
    background: #f8d7da;
    border-color: #f5c6cb;
}

.option-review {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    margin-bottom: 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.option-review.selected {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
}

.option-review.correct-answer {
    background: #d4edda;
    border: 1px solid #c3e6cb;
}

.option-letter {
    width: 25px;
    height: 25px;
    background: #6c757d;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    flex-shrink: 0;
}

.option-review.correct-answer .option-letter {
    background: #28a745;
}

.option-text {
    flex: 1;
    line-height: 1.4;
}

.essay-answer, .fill-blank-answer {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.answer-text {
    line-height: 1.6;
    white-space: pre-wrap;
}

.feedback {
    margin-top: 10px;
    padding: 10px;
    background: #e3f2fd;
    border-radius: 4px;
    border-left: 4px solid #2196f3;
}

.correct-answer-section {
    margin-bottom: 20px;
}

.correct-answer-section h6 {
    color: #495057;
    margin-bottom: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.correct-answer {
    padding: 15px;
    background: #e8f5e8;
    border: 1px solid #c3e6cb;
    border-radius: 6px;
}

.explanation-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
}

.explanation-section h6 {
    color: #495057;
    margin-bottom: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.explanation-text {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    line-height: 1.6;
}

.no-answer {
    color: #6c757d;
    font-style: italic;
}

@media (max-width: 768px) {
    .question-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
    
    .question-points {
        align-items: flex-start;
    }
}
</style>
@endpush

@push('scripts')
<script>
let showAnswers = false;

document.getElementById('toggle-answers').addEventListener('click', function() {
    showAnswers = !showAnswers;
    
    const correctAnswers = document.querySelectorAll('[id^="correct-answer-"]');
    const explanations = document.querySelectorAll('[id^="explanation-"]');
    const toggleText = document.getElementById('toggle-text');
    
    correctAnswers.forEach(element => {
        element.style.display = showAnswers ? 'block' : 'none';
    });
    
    explanations.forEach(element => {
        element.style.display = showAnswers ? 'block' : 'none';
    });
    
    toggleText.textContent = showAnswers ? 'Sembunyikan Kunci Jawaban' : 'Tampilkan Kunci Jawaban';
});

function exportResults() {
    const format = prompt('Pilih format export:\n1. Excel\n2. PDF', '1');
    
    if (format === '1' || format === 'excel') {
        window.open('{{ tenant_route("exam.attempts.export", $attempt) }}?format=excel', '_blank');
    } else if (format === '2' || format === 'pdf') {
        window.open('{{ tenant_route("exam.attempts.export", $attempt) }}?format=pdf', '_blank');
    }
}
</script>
@endpush
