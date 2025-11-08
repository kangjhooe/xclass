@extends('layouts.tenant')

@section('title', 'Tambah Soal')
@section('page-title', 'Tambah Soal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Tambah Soal
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('questions.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <!-- Basic Information -->
                            <div class="col-md-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Informasi Soal</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-12 mb-3">
                                                <label for="exam_id" class="form-label">Ujian <span class="text-danger">*</span></label>
                                                <select class="form-select @error('exam_id') is-invalid @enderror" 
                                                        id="exam_id" name="exam_id" required>
                                                    <option value="">Pilih Ujian</option>
                                                    @foreach($exams as $exam)
                                                        <option value="{{ $exam->id }}" {{ old('exam_id') == $exam->id ? 'selected' : '' }}>
                                                            {{ $exam->title }} - {{ $exam->subject->name }} ({{ $exam->classRoom->name }})
                                                        </option>
                                                    @endforeach
                                                </select>
                                                @error('exam_id')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-12 mb-3">
                                                <label for="question_text" class="form-label">Pertanyaan <span class="text-danger">*</span></label>
                                                <div id="question-editor-container">
                                                    <textarea class="form-control @error('question_text') is-invalid @enderror" 
                                                              id="question_text" name="question_text" rows="4" required>{{ old('question_text') }}</textarea>
                                                </div>
                                                @error('question_text')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="question_type" class="form-label">Jenis Soal <span class="text-danger">*</span></label>
                                                <select class="form-select @error('question_type') is-invalid @enderror" 
                                                        id="question_type" name="question_type" required>
                                                    <option value="">Pilih Jenis Soal</option>
                                                    <option value="multiple_choice" {{ old('question_type') == 'multiple_choice' ? 'selected' : '' }}>Pilihan Ganda</option>
                                                    <option value="true_false" {{ old('question_type') == 'true_false' ? 'selected' : '' }}>Benar/Salah</option>
                                                    <option value="essay" {{ old('question_type') == 'essay' ? 'selected' : '' }}>Esai</option>
                                                    <option value="fill_blank" {{ old('question_type') == 'fill_blank' ? 'selected' : '' }}>Isian</option>
                                                    <option value="matching" {{ old('question_type') == 'matching' ? 'selected' : '' }}>Menjodohkan</option>
                                                </select>
                                                @error('question_type')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="difficulty" class="form-label">Tingkat Kesulitan <span class="text-danger">*</span></label>
                                                <select class="form-select @error('difficulty') is-invalid @enderror" 
                                                        id="difficulty" name="difficulty" required>
                                                    <option value="">Pilih Tingkat Kesulitan</option>
                                                    <option value="easy" {{ old('difficulty') == 'easy' ? 'selected' : '' }}>Mudah</option>
                                                    <option value="medium" {{ old('difficulty') == 'medium' ? 'selected' : '' }}>Sedang</option>
                                                    <option value="hard" {{ old('difficulty') == 'hard' ? 'selected' : '' }}>Sulit</option>
                                                </select>
                                                @error('difficulty')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="points" class="form-label">Poin <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control @error('points') is-invalid @enderror" 
                                                       id="points" name="points" value="{{ old('points', 1) }}" 
                                                       min="1" required>
                                                @error('points')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="order" class="form-label">Urutan</label>
                                                <input type="number" class="form-control @error('order') is-invalid @enderror" 
                                                       id="order" name="order" value="{{ old('order') }}" 
                                                       min="0">
                                                @error('order')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                                <div class="form-text">Kosongkan untuk urutan otomatis</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Answer Options -->
                                <div class="card mt-3" id="options-card" style="display: none;">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Opsi Jawaban</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="options-container">
                                            <!-- Options will be dynamically added here -->
                                        </div>
                                        <button type="button" class="btn btn-outline-primary btn-sm" id="add-option">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Opsi
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Correct Answer -->
                                <div class="card mt-3" id="correct-answer-card" style="display: none;">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Jawaban Benar</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="correct-answer-container">
                                            <!-- Correct answer input will be dynamically added here -->
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Explanation -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Penjelasan</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="explanation" class="form-label">Penjelasan Jawaban</label>
                                            <div id="explanation-editor-container">
                                                <textarea class="form-control @error('explanation') is-invalid @enderror" 
                                                          id="explanation" name="explanation" rows="3">{{ old('explanation') }}</textarea>
                                            </div>
                                            @error('explanation')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                            <div class="form-text">Penjelasan mengapa jawaban tersebut benar (opsional)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Preview -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Preview Soal</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="question-preview">
                                            <p class="text-muted">Pilih jenis soal untuk melihat preview</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="card mt-3">
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save me-1"></i>
                                                Simpan Soal
                                            </button>
                                            <a href="{{ tenant_route('exam.questions') }}" class="btn btn-outline-secondary">
                                                <i class="fas fa-times me-1"></i>
                                                Batal
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const questionTypeSelect = document.getElementById('question_type');
    const optionsCard = document.getElementById('options-card');
    const correctAnswerCard = document.getElementById('correct-answer-card');
    const optionsContainer = document.getElementById('options-container');
    const correctAnswerContainer = document.getElementById('correct-answer-container');
    const addOptionBtn = document.getElementById('add-option');
    const questionPreview = document.getElementById('question-preview');
    
    let optionCount = 0;
    
    function updateForm() {
        const questionType = questionTypeSelect.value;
        
        // Clear previous content
        optionsContainer.innerHTML = '';
        correctAnswerContainer.innerHTML = '';
        optionCount = 0;
        
        if (questionType === 'multiple_choice' || questionType === 'matching') {
            optionsCard.style.display = 'block';
            correctAnswerCard.style.display = 'block';
            
            // Add initial options
            addOption();
            addOption();
            addOption();
            addOption();
            
            // Create correct answer select
            const correctAnswerSelect = document.createElement('select');
            correctAnswerSelect.className = 'form-select';
            correctAnswerSelect.name = 'correct_answer';
            correctAnswerSelect.id = 'correct_answer';
            correctAnswerSelect.innerHTML = '<option value="">Pilih Jawaban Benar</option>';
            correctAnswerContainer.appendChild(correctAnswerSelect);
            
        } else if (questionType === 'true_false') {
            optionsCard.style.display = 'block';
            correctAnswerCard.style.display = 'block';
            
            // Add true/false options
            addTrueFalseOptions();
            
            // Create correct answer select
            const correctAnswerSelect = document.createElement('select');
            correctAnswerSelect.className = 'form-select';
            correctAnswerSelect.name = 'correct_answer';
            correctAnswerSelect.id = 'correct_answer';
            correctAnswerSelect.innerHTML = '<option value="">Pilih Jawaban Benar</option><option value="true">Benar</option><option value="false">Salah</option>';
            correctAnswerContainer.appendChild(correctAnswerSelect);
            
        } else if (questionType === 'fill_blank') {
            optionsCard.style.display = 'none';
            correctAnswerCard.style.display = 'block';
            
            // Create correct answer input
            const correctAnswerInput = document.createElement('input');
            correctAnswerInput.type = 'text';
            correctAnswerInput.className = 'form-control';
            correctAnswerInput.name = 'correct_answer';
            correctAnswerInput.id = 'correct_answer';
            correctAnswerInput.placeholder = 'Masukkan jawaban yang benar';
            correctAnswerContainer.appendChild(correctAnswerInput);
            
        } else if (questionType === 'essay') {
            optionsCard.style.display = 'none';
            correctAnswerCard.style.display = 'none';
        }
        
        updatePreview();
    }
    
    function addOption() {
        optionCount++;
        const optionDiv = document.createElement('div');
        optionDiv.className = 'row mb-2';
        optionDiv.innerHTML = `
            <div class="col-md-1">
                <label class="form-label">${String.fromCharCode(64 + optionCount)}</label>
            </div>
            <div class="col-md-10">
                <input type="text" class="form-control" name="options[${String.fromCharCode(96 + optionCount)}]" placeholder="Opsi ${String.fromCharCode(64 + optionCount)}">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-outline-danger btn-sm remove-option">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        optionsContainer.appendChild(optionDiv);
        
        // Add event listener for remove button
        optionDiv.querySelector('.remove-option').addEventListener('click', function() {
            optionDiv.remove();
            updateCorrectAnswerOptions();
        });
        
        updateCorrectAnswerOptions();
    }
    
    function addTrueFalseOptions() {
        const trueOption = document.createElement('div');
        trueOption.className = 'row mb-2';
        trueOption.innerHTML = `
            <div class="col-md-1">
                <label class="form-label">A</label>
            </div>
            <div class="col-md-10">
                <input type="text" class="form-control" name="options[true]" value="Benar" readonly>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-outline-danger btn-sm remove-option">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        optionsContainer.appendChild(trueOption);
        
        const falseOption = document.createElement('div');
        falseOption.className = 'row mb-2';
        falseOption.innerHTML = `
            <div class="col-md-1">
                <label class="form-label">B</label>
            </div>
            <div class="col-md-10">
                <input type="text" class="form-control" name="options[false]" value="Salah" readonly>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-outline-danger btn-sm remove-option">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        optionsContainer.appendChild(falseOption);
    }
    
    function updateCorrectAnswerOptions() {
        const correctAnswerSelect = document.getElementById('correct_answer');
        if (correctAnswerSelect) {
            correctAnswerSelect.innerHTML = '<option value="">Pilih Jawaban Benar</option>';
            
            const optionInputs = optionsContainer.querySelectorAll('input[name^="options"]');
            optionInputs.forEach((input, index) => {
                const key = input.name.match(/\[(.*?)\]/)[1];
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${String.fromCharCode(65 + index)}. ${input.value || 'Opsi ' + String.fromCharCode(65 + index)}`;
                correctAnswerSelect.appendChild(option);
            });
        }
    }
    
    function updatePreview() {
        const questionText = document.getElementById('question_text').value;
        const questionType = questionTypeSelect.value;
        
        if (!questionText) {
            questionPreview.innerHTML = '<p class="text-muted">Masukkan pertanyaan untuk melihat preview</p>';
            return;
        }
        
        let preview = `<div class="mb-3"><strong>Pertanyaan:</strong><br>${questionText}</div>`;
        
        if (questionType === 'multiple_choice' || questionType === 'true_false') {
            const optionInputs = optionsContainer.querySelectorAll('input[name^="options"]');
            if (optionInputs.length > 0) {
                preview += '<div class="mb-3"><strong>Opsi Jawaban:</strong><br>';
                optionInputs.forEach((input, index) => {
                    if (input.value) {
                        preview += `<div class="form-check">
                            <input class="form-check-input" type="radio" disabled>
                            <label class="form-check-label">${String.fromCharCode(65 + index)}. ${input.value}</label>
                        </div>`;
                    }
                });
                preview += '</div>';
            }
        } else if (questionType === 'fill_blank') {
            preview += '<div class="mb-3"><strong>Jawaban:</strong><br><input type="text" class="form-control" placeholder="Jawaban" disabled></div>';
        } else if (questionType === 'essay') {
            preview += '<div class="mb-3"><strong>Jawaban:</strong><br><textarea class="form-control" rows="3" placeholder="Jawaban esai" disabled></textarea></div>';
        }
        
        questionPreview.innerHTML = preview;
    }
    
    // Event listeners
    questionTypeSelect.addEventListener('change', updateForm);
    addOptionBtn.addEventListener('click', addOption);
    
    // Update preview when question text changes
    document.getElementById('question_text').addEventListener('input', updatePreview);
    
    // Update preview when options change
    optionsContainer.addEventListener('input', function(e) {
        if (e.target.name && e.target.name.startsWith('options')) {
            updateCorrectAnswerOptions();
            updatePreview();
        }
    });
    
    // Initialize form
    updateForm();
});
</script>
@endpush
@endsection
