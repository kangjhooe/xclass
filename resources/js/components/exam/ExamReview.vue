<template>
  <div class="exam-review">
    <!-- Header -->
    <div class="review-header">
      <div class="review-info">
        <h2 class="review-title">{{ exam.title }}</h2>
        <div class="review-meta">
          <span class="meta-item">
            <i class="fas fa-user"></i>
            {{ student.name }}
          </span>
          <span class="meta-item">
            <i class="fas fa-calendar"></i>
            {{ formatDate(attempt.submitted_at) }}
          </span>
          <span class="meta-item">
            <i class="fas fa-clock"></i>
            {{ formatDuration(attempt.time_spent) }}
          </span>
        </div>
      </div>
      
      <!-- Score Display -->
      <div class="score-display" :class="scoreClass">
        <div class="score-label">Nilai</div>
        <div class="score-value">{{ attempt.score }}/{{ exam.total_score }}</div>
        <div class="score-percentage">{{ scorePercentage }}%</div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="review-summary">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Jawaban Benar</div>
            <div class="summary-value">{{ correctAnswers }}/{{ totalQuestions }}</div>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Jawaban Salah</div>
            <div class="summary-value">{{ wrongAnswers }}/{{ totalQuestions }}</div>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Tidak Dijawab</div>
            <div class="summary-value">{{ unansweredQuestions }}/{{ totalQuestions }}</div>
          </div>
        </div>
        
        <div class="summary-item">
          <div class="summary-icon">
            <i class="fas fa-flag"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Ditandai</div>
            <div class="summary-value">{{ flaggedCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Review -->
    <div class="questions-review">
      <div class="review-header-section">
        <h3>Review Jawaban</h3>
        <div class="review-controls">
          <button 
            @click="toggleShowCorrectAnswers" 
            class="btn btn-sm"
            :class="showCorrectAnswers ? 'btn-success' : 'btn-outline-success'"
          >
            <i class="fas fa-eye"></i>
            {{ showCorrectAnswers ? 'Sembunyikan' : 'Tampilkan' }} Kunci Jawaban
          </button>
          <button @click="exportResults" class="btn btn-sm btn-outline-primary">
            <i class="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      <div class="questions-list">
        <div 
          v-for="(question, index) in questions" 
          :key="question.id"
          class="question-review-item"
          :class="getQuestionClass(question)"
        >
          <div class="question-header">
            <div class="question-number">
              <span class="number">{{ index + 1 }}</span>
              <span class="status" :class="getAnswerStatusClass(question)">
                <i class="fas" :class="getAnswerStatusIcon(question)"></i>
              </span>
            </div>
            <div class="question-points">
              <span class="points">{{ question.points }} poin</span>
              <span class="difficulty" :class="getDifficultyClass(question.difficulty)">
                {{ getDifficultyLabel(question.difficulty) }}
              </span>
            </div>
          </div>

          <div class="question-content">
            <div class="question-text" v-html="question.question_text"></div>
            
            <!-- Student Answer -->
            <div class="answer-section">
              <h5>Jawaban Anda:</h5>
              <div class="student-answer" :class="getAnswerClass(question)">
                <div v-if="question.question_type === 'multiple_choice' || question.question_type === 'true_false'">
                  <div v-for="(option, optIndex) in question.formatted_options" :key="optIndex">
                    <div 
                      class="option-review"
                      :class="{
                        'selected': question.answer === option.value,
                        'correct': showCorrectAnswers && question.correct_answer === option.value,
                        'incorrect': showCorrectAnswers && question.answer === option.value && question.correct_answer !== option.value
                      }"
                    >
                      <span class="option-letter">{{ option.letter }}</span>
                      <span class="option-text">{{ option.text }}</span>
                      <span v-if="showCorrectAnswers && question.correct_answer === option.value" class="correct-indicator">
                        <i class="fas fa-check"></i>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-else-if="question.question_type === 'essay'" class="essay-answer">
                  <div class="answer-text">{{ question.answer || 'Tidak dijawab' }}</div>
                  <div v-if="showCorrectAnswers && question.explanation" class="answer-explanation">
                    <strong>Penjelasan:</strong> {{ question.explanation }}
                  </div>
                </div>
                
                <div v-else-if="question.question_type === 'fill_blank'" class="fill-blank-answer">
                  <div class="answer-text">{{ question.answer || 'Tidak dijawab' }}</div>
                </div>
              </div>
            </div>

            <!-- Correct Answer (if enabled) -->
            <div v-if="showCorrectAnswers" class="correct-answer-section">
              <h5>Kunci Jawaban:</h5>
              <div class="correct-answer">
                <div v-if="question.question_type === 'multiple_choice' || question.question_type === 'true_false'">
                  <div v-for="(option, optIndex) in question.formatted_options" :key="optIndex">
                    <div 
                      v-if="question.correct_answer === option.value"
                      class="option-review correct-answer"
                    >
                      <span class="option-letter">{{ option.letter }}</span>
                      <span class="option-text">{{ option.text }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-else-if="question.question_type === 'essay'" class="essay-answer">
                  <div class="answer-text">{{ question.correct_answer || 'Tidak ada kunci jawaban' }}</div>
                </div>
                
                <div v-else-if="question.question_type === 'fill_blank'" class="fill-blank-answer">
                  <div class="answer-text">{{ question.correct_answer || 'Tidak ada kunci jawaban' }}</div>
                </div>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="showCorrectAnswers && question.explanation" class="explanation-section">
              <h5>Penjelasan:</h5>
              <div class="explanation-text">{{ question.explanation }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="review-actions">
      <button @click="goBack" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left"></i> Kembali
      </button>
      <button @click="retakeExam" class="btn btn-primary" v-if="canRetake">
        <i class="fas fa-redo"></i> Ulangi Ujian
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamReview',
  props: {
    exam: {
      type: Object,
      required: true
    },
    attempt: {
      type: Object,
      required: true
    },
    student: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    answers: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showCorrectAnswers: false,
      flaggedQuestions: []
    }
  },
  computed: {
    totalQuestions() {
      return this.questions.length
    },
    correctAnswers() {
      return this.questions.filter(q => q.is_correct).length
    },
    wrongAnswers() {
      return this.questions.filter(q => q.answer && !q.is_correct).length
    },
    unansweredQuestions() {
      return this.questions.filter(q => !q.answer).length
    },
    flaggedCount() {
      return this.flaggedQuestions.length
    },
    scorePercentage() {
      return Math.round((this.attempt.score / this.exam.total_score) * 100)
    },
    scoreClass() {
      if (this.scorePercentage >= 80) return 'score-excellent'
      if (this.scorePercentage >= 60) return 'score-good'
      if (this.scorePercentage >= 40) return 'score-fair'
      return 'score-poor'
    },
    canRetake() {
      return this.attempt.attempt_number < this.exam.max_attempts
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}j ${minutes}m ${secs}s`
      }
      return `${minutes}m ${secs}s`
    },
    
    getQuestionClass(question) {
      const classes = []
      
      if (question.is_correct) {
        classes.push('correct')
      } else if (question.answer && !question.is_correct) {
        classes.push('incorrect')
      } else {
        classes.push('unanswered')
      }
      
      if (this.flaggedQuestions.includes(question.id)) {
        classes.push('flagged')
      }
      
      return classes
    },
    
    getAnswerStatusClass(question) {
      if (question.is_correct) return 'correct'
      if (question.answer && !question.is_correct) return 'incorrect'
      return 'unanswered'
    },
    
    getAnswerStatusIcon(question) {
      if (question.is_correct) return 'fa-check'
      if (question.answer && !question.is_correct) return 'fa-times'
      return 'fa-question'
    },
    
    getAnswerClass(question) {
      if (question.is_correct) return 'answer-correct'
      if (question.answer && !question.is_correct) return 'answer-incorrect'
      return 'answer-unanswered'
    },
    
    getDifficultyClass(difficulty) {
      switch (difficulty) {
        case 'easy': return 'difficulty-easy'
        case 'medium': return 'difficulty-medium'
        case 'hard': return 'difficulty-hard'
        default: return 'difficulty-medium'
      }
    },
    
    getDifficultyLabel(difficulty) {
      switch (difficulty) {
        case 'easy': return 'Mudah'
        case 'medium': return 'Sedang'
        case 'hard': return 'Sulit'
        default: return 'Sedang'
      }
    },
    
    toggleShowCorrectAnswers() {
      this.showCorrectAnswers = !this.showCorrectAnswers
    },
    
    exportResults() {
      this.$emit('export-results')
    },
    
    goBack() {
      this.$emit('go-back')
    },
    
    retakeExam() {
      this.$emit('retake-exam')
    }
  }
}
</script>

<style scoped>
.exam-review {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 20px;
}

.review-info {
  flex: 1;
}

.review-title {
  color: #2c3e50;
  margin-bottom: 15px;
}

.review-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 14px;
}

.score-display {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  min-width: 150px;
}

.score-excellent {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.score-good {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
  color: white;
}

.score-fair {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
  color: #212529;
}

.score-poor {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
  color: white;
}

.score-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.score-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-percentage {
  font-size: 16px;
  opacity: 0.9;
}

.review-summary {
  margin-bottom: 30px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.summary-item:nth-child(1) .summary-icon {
  background: #28a745;
}

.summary-item:nth-child(2) .summary-icon {
  background: #dc3545;
}

.summary-item:nth-child(3) .summary-icon {
  background: #6c757d;
}

.summary-item:nth-child(4) .summary-icon {
  background: #ffc107;
  color: #212529;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.questions-review {
  margin-bottom: 30px;
}

.review-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #dee2e6;
}

.review-controls {
  display: flex;
  gap: 10px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-review-item {
  background: white;
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

.question-review-item.unanswered {
  border-left: 4px solid #6c757d;
}

.question-review-item.flagged {
  background: #fff8e1;
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

.status.unanswered {
  background: #6c757d;
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

.answer-section h5 {
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

.answer-unanswered {
  background: #f8f9fa;
  border-color: #dee2e6;
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

.option-review.correct {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.option-review.incorrect {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
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

.option-review.correct .option-letter {
  background: #28a745;
}

.option-review.incorrect .option-letter {
  background: #dc3545;
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

.correct-indicator {
  color: #28a745;
  font-size: 14px;
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

.correct-answer-section {
  margin-bottom: 20px;
}

.correct-answer-section h5 {
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

.explanation-section h5 {
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

.review-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .review-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .review-header-section {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .review-controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .question-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .review-actions {
    flex-direction: column;
  }
}
</style>
