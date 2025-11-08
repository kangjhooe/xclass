<template>
  <div class="exam-interface">
    <!-- Header -->
    <div class="exam-header">
      <div class="exam-info">
        <h2 class="exam-title">{{ exam.title }}</h2>
        <p class="exam-description">{{ exam.description }}</p>
        <div class="exam-meta">
          <span class="meta-item">
            <i class="fas fa-book"></i>
            {{ exam.subject?.name }}
          </span>
          <span class="meta-item">
            <i class="fas fa-users"></i>
            {{ exam.classRoom?.name }}
          </span>
          <span class="meta-item">
            <i class="fas fa-question-circle"></i>
            {{ exam.total_questions }} Soal
          </span>
        </div>
      </div>
      
      <!-- Timer -->
      <ExamTimer
        :duration="exam.duration * 60"
        :start-time="attempt.started_at"
        :auto-submit="true"
        @time-up="handleTimeUp"
        @warning="handleWarning"
        @auto-submit="handleAutoSubmit"
      />
    </div>

    <!-- Instructions -->
    <div v-if="showInstructions" class="exam-instructions">
      <div class="instructions-header">
        <h4><i class="fas fa-info-circle"></i> Petunjuk Ujian</h4>
        <button @click="startExam" class="btn btn-primary">
          <i class="fas fa-play"></i> Mulai Ujian
        </button>
      </div>
      <div class="instructions-content" v-html="exam.instructions"></div>
    </div>

    <!-- Exam Content -->
    <div v-else class="exam-content">
      <!-- Progress Bar -->
      <div class="exam-progress">
        <div class="progress-info">
          <span>Soal {{ currentQuestionIndex + 1 }} dari {{ questions.length }}</span>
          <span>{{ Math.round(((currentQuestionIndex + 1) / questions.length) * 100) }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: ((currentQuestionIndex + 1) / questions.length) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <!-- Question Navigation -->
      <div class="question-navigation">
        <button 
          v-for="(question, index) in questions" 
          :key="question.id"
          @click="goToQuestion(index)"
          class="nav-btn"
          :class="{
            'current': index === currentQuestionIndex,
            'answered': answers[question.id],
            'flagged': flaggedQuestions.includes(question.id)
          }"
        >
          {{ index + 1 }}
        </button>
      </div>

      <!-- Question Display -->
      <div class="question-container">
        <div class="question-header">
          <h4>Soal {{ currentQuestionIndex + 1 }}</h4>
          <div class="question-actions">
            <button 
              @click="toggleFlag"
              class="btn btn-sm"
              :class="flaggedQuestions.includes(currentQuestion.id) ? 'btn-warning' : 'btn-outline-warning'"
            >
              <i class="fas fa-flag"></i>
              {{ flaggedQuestions.includes(currentQuestion.id) ? 'Tandai' : 'Tandai' }}
            </button>
          </div>
        </div>

        <div class="question-content">
          <div class="question-text" v-html="currentQuestion.question_text"></div>
          
          <!-- Question Type: Multiple Choice -->
          <div v-if="currentQuestion.question_type === 'multiple_choice'" class="question-options">
            <div 
              v-for="(option, index) in currentQuestion.formatted_options" 
              :key="index"
              class="option-item"
            >
              <input 
                :id="`option-${index}`"
                type="radio" 
                :name="`question-${currentQuestion.id}`"
                :value="option.value"
                v-model="answers[currentQuestion.id]"
                @change="saveAnswer"
              >
              <label :for="`option-${index}`" class="option-label">
                <span class="option-letter">{{ option.letter }}</span>
                <span class="option-text">{{ option.text }}</span>
              </label>
            </div>
          </div>

          <!-- Question Type: True/False -->
          <div v-else-if="currentQuestion.question_type === 'true_false'" class="question-options">
            <div class="option-item">
              <input 
                id="true-option"
                type="radio" 
                :name="`question-${currentQuestion.id}`"
                value="true"
                v-model="answers[currentQuestion.id]"
                @change="saveAnswer"
              >
              <label for="true-option" class="option-label">
                <span class="option-letter">A</span>
                <span class="option-text">Benar</span>
              </label>
            </div>
            <div class="option-item">
              <input 
                id="false-option"
                type="radio" 
                :name="`question-${currentQuestion.id}`"
                value="false"
                v-model="answers[currentQuestion.id]"
                @change="saveAnswer"
              >
              <label for="false-option" class="option-label">
                <span class="option-letter">B</span>
                <span class="option-text">Salah</span>
              </label>
            </div>
          </div>

          <!-- Question Type: Essay -->
          <div v-else-if="currentQuestion.question_type === 'essay'" class="question-essay">
            <textarea 
              v-model="answers[currentQuestion.id]"
              @input="saveAnswer"
              class="form-control essay-textarea"
              rows="8"
              placeholder="Tulis jawaban Anda di sini..."
            ></textarea>
          </div>

          <!-- Question Type: Fill in the Blank -->
          <div v-else-if="currentQuestion.question_type === 'fill_blank'" class="question-fill-blank">
            <div class="fill-blank-content" v-html="getFillBlankContent()"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="question-nav-buttons">
        <button 
          @click="previousQuestion" 
          :disabled="currentQuestionIndex === 0"
          class="btn btn-outline-primary"
        >
          <i class="fas fa-chevron-left"></i> Sebelumnya
        </button>
        
        <button 
          @click="nextQuestion" 
          :disabled="currentQuestionIndex === questions.length - 1"
          class="btn btn-primary"
        >
          Selanjutnya <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Submit Modal -->
    <div v-if="showSubmitModal" class="modal-overlay" @click="showSubmitModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Konfirmasi Submit Ujian</h4>
        </div>
        <div class="modal-body">
          <p>Apakah Anda yakin ingin mengirim jawaban ujian?</p>
          <div class="submit-stats">
            <div class="stat-item">
              <span class="stat-label">Jawaban Terisi:</span>
              <span class="stat-value">{{ answeredCount }}/{{ questions.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Soal Ditandai:</span>
              <span class="stat-value">{{ flaggedQuestions.length }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSubmitModal = false" class="btn btn-outline-secondary">
            Batal
          </button>
          <button @click="submitExam" class="btn btn-success">
            <i class="fas fa-check"></i> Submit Ujian
          </button>
        </div>
      </div>
    </div>

    <!-- Auto-save Status -->
    <div v-if="autoSaveStatus" class="auto-save-status" :class="autoSaveStatus.type">
      <i class="fas" :class="autoSaveStatus.icon"></i>
      <span>{{ autoSaveStatus.message }}</span>
    </div>
  </div>
</template>

<script>
import ExamTimer from './ExamTimer.vue'

export default {
  name: 'ExamInterface',
  components: {
    ExamTimer
  },
  props: {
    exam: {
      type: Object,
      required: true
    },
    attempt: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      showInstructions: true,
      showSubmitModal: false,
      autoSaveStatus: null,
      autoSaveTimer: null,
      isSubmitting: false
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {}
    },
    answeredCount() {
      return Object.keys(this.answers).filter(key => this.answers[key] !== null && this.answers[key] !== '').length
    }
  },
  mounted() {
    this.initializeAnswers()
    this.startAutoSave()
  },
  beforeUnmount() {
    this.stopAutoSave()
  },
  methods: {
    initializeAnswers() {
      // Initialize answers from attempt data
      this.questions.forEach(question => {
        this.answers[question.id] = question.answer || null
      })
    },
    
    startExam() {
      this.showInstructions = false
      this.$emit('exam-started')
    },
    
    goToQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentQuestionIndex = index
      }
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },
    
    toggleFlag() {
      const questionId = this.currentQuestion.id
      const index = this.flaggedQuestions.indexOf(questionId)
      
      if (index > -1) {
        this.flaggedQuestions.splice(index, 1)
      } else {
        this.flaggedQuestions.push(questionId)
      }
    },
    
    saveAnswer() {
      this.autoSave()
    },
    
    autoSave() {
      this.showAutoSaveStatus('saving', 'fas fa-spinner fa-spin', 'Menyimpan jawaban...')
      
      // Simulate auto-save API call
      setTimeout(() => {
        this.showAutoSaveStatus('success', 'fas fa-check', 'Jawaban tersimpan')
        setTimeout(() => {
          this.autoSaveStatus = null
        }, 2000)
      }, 500)
    },
    
    startAutoSave() {
      this.autoSaveTimer = setInterval(() => {
        if (Object.keys(this.answers).length > 0) {
          this.autoSave()
        }
      }, 30000) // Auto-save every 30 seconds
    },
    
    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = null
      }
    },
    
    showAutoSaveStatus(type, icon, message) {
      this.autoSaveStatus = { type, icon, message }
    },
    
    handleTimeUp() {
      this.showAutoSaveStatus('warning', 'fas fa-exclamation-triangle', 'Waktu habis!')
    },
    
    handleWarning(warning) {
      console.log('Timer warning:', warning)
    },
    
    handleAutoSubmit() {
      this.submitExam(true)
    },
    
    showSubmitConfirmation() {
      this.showSubmitModal = true
    },
    
    submitExam(isAutoSubmit = false) {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      this.showSubmitModal = false
      
      this.$emit('exam-submit', {
        answers: this.answers,
        flaggedQuestions: this.flaggedQuestions,
        isAutoSubmit
      })
    },
    
    getFillBlankContent() {
      // This would parse the question text and replace blanks with input fields
      // For now, return the question text as-is
      return this.currentQuestion.question_text
    }
  }
}
</script>

<style scoped>
.exam-interface {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 20px;
}

.exam-info {
  flex: 1;
}

.exam-title {
  color: #2c3e50;
  margin-bottom: 10px;
}

.exam-description {
  color: #7f8c8d;
  margin-bottom: 15px;
}

.exam-meta {
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

.exam-instructions {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.instructions-content {
  line-height: 1.6;
}

.exam-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6c757d;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.question-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-btn:hover {
  border-color: #007bff;
  background: #e3f2fd;
}

.nav-btn.current {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.nav-btn.answered {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.nav-btn.flagged {
  background: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.question-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.question-content {
  margin-bottom: 20px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #2c3e50;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.option-item input[type="radio"] {
  margin-top: 4px;
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.option-label:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.option-item input[type="radio"]:checked + .option-label {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-letter {
  width: 30px;
  height: 30px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.option-item input[type="radio"]:checked + .option-label .option-letter {
  background: #007bff;
}

.option-text {
  flex: 1;
  line-height: 1.5;
}

.question-essay {
  margin-top: 15px;
}

.essay-textarea {
  resize: vertical;
  min-height: 200px;
}

.question-nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.submit-stats {
  margin-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 500;
  color: #2c3e50;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.auto-save-status {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  z-index: 1001;
}

.auto-save-status.saving {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.auto-save-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.auto-save-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .exam-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .exam-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .question-navigation {
    justify-content: center;
  }
  
  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
  
  .question-nav-buttons {
    flex-direction: column;
  }
}
</style>
