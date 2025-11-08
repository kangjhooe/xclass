<template>
  <div class="exam-analytics">
    <!-- Header -->
    <div class="analytics-header">
      <h2 class="analytics-title">{{ exam.title }}</h2>
      <div class="analytics-actions">
        <button @click="exportAnalytics" class="btn btn-outline-primary">
          <i class="fas fa-download"></i> Export Data
        </button>
        <button @click="refreshData" class="btn btn-outline-secondary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.total_participants }}</div>
          <div class="stat-label">Total Peserta</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.completed_attempts }}</div>
          <div class="stat-label">Selesai</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.average_time }}</div>
          <div class="stat-label">Rata-rata Waktu</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.average_score }}%</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h4>Distribusi Nilai</h4>
        <div class="chart-wrapper">
          <canvas ref="scoreDistributionChart"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h4>Waktu Pengerjaan</h4>
        <div class="chart-wrapper">
          <canvas ref="timeDistributionChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Analysis -->
    <div class="detailed-analysis">
      <div class="analysis-tabs">
        <button 
          v-for="tab in analysisTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Score Analysis Tab -->
      <div v-if="activeTab === 'scores'" class="tab-content">
        <div class="score-analysis">
          <div class="score-stats">
            <div class="score-stat">
              <div class="stat-label">Nilai Tertinggi</div>
              <div class="stat-value highest">{{ statistics.highest_score }}</div>
            </div>
            <div class="score-stat">
              <div class="stat-label">Nilai Terendah</div>
              <div class="stat-value lowest">{{ statistics.lowest_score }}</div>
            </div>
            <div class="score-stat">
              <div class="stat-label">Median</div>
              <div class="stat-value">{{ statistics.median_score }}</div>
            </div>
            <div class="score-stat">
              <div class="stat-label">Standar Deviasi</div>
              <div class="stat-value">{{ statistics.standard_deviation }}</div>
            </div>
          </div>
          
          <div class="score-ranges">
            <h5>Distribusi Rentang Nilai</h5>
            <div class="ranges-list">
              <div 
                v-for="range in scoreRanges" 
                :key="range.label"
                class="range-item"
              >
                <div class="range-label">{{ range.label }}</div>
                <div class="range-bar">
                  <div 
                    class="range-fill" 
                    :style="{ width: range.percentage + '%' }"
                    :class="range.class"
                  ></div>
                </div>
                <div class="range-count">{{ range.count }} siswa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Analysis Tab -->
      <div v-if="activeTab === 'questions'" class="tab-content">
        <div class="question-analysis">
          <div class="questions-list">
            <div 
              v-for="(question, index) in questionAnalysis" 
              :key="question.id"
              class="question-analysis-item"
            >
              <div class="question-header">
                <div class="question-number">Soal {{ index + 1 }}</div>
                <div class="question-difficulty" :class="getDifficultyClass(question.difficulty)">
                  {{ getDifficultyLabel(question.difficulty) }}
                </div>
                <div class="question-points">{{ question.points }} poin</div>
              </div>
              
              <div class="question-content">
                <div class="question-text" v-html="question.question_text"></div>
                
                <div class="question-stats">
                  <div class="stat-item">
                    <span class="stat-label">Tingkat Kesulitan:</span>
                    <span class="stat-value">{{ question.difficulty_level }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Tingkat Diskriminasi:</span>
                    <span class="stat-value">{{ question.discrimination_index }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Jawaban Benar:</span>
                    <span class="stat-value">{{ question.correct_count }}/{{ question.total_attempts }}</span>
                  </div>
                </div>
                
                <div class="question-options-analysis">
                  <div 
                    v-for="(option, optIndex) in question.options_analysis" 
                    :key="optIndex"
                    class="option-analysis"
                    :class="{ 'correct-option': option.is_correct }"
                  >
                    <div class="option-header">
                      <span class="option-letter">{{ option.letter }}</span>
                      <span class="option-text">{{ option.text }}</span>
                      <span class="option-percentage">{{ option.percentage }}%</span>
                    </div>
                    <div class="option-bar">
                      <div 
                        class="option-fill" 
                        :style="{ width: option.percentage + '%' }"
                        :class="{ 'correct': option.is_correct }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Performance Tab -->
      <div v-if="activeTab === 'students'" class="tab-content">
        <div class="student-performance">
          <div class="performance-filters">
            <select v-model="selectedClass" class="form-select">
              <option value="">Semua Kelas</option>
              <option v-for="classRoom in classes" :key="classRoom.id" :value="classRoom.id">
                {{ classRoom.name }}
              </option>
            </select>
            
            <select v-model="scoreFilter" class="form-select">
              <option value="">Semua Nilai</option>
              <option value="excellent">Sangat Baik (80-100)</option>
              <option value="good">Baik (60-79)</option>
              <option value="fair">Cukup (40-59)</option>
              <option value="poor">Kurang (0-39)</option>
            </select>
          </div>
          
          <div class="students-table">
            <table class="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  <th>Nilai</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(student, index) in filteredStudents" 
                  :key="student.id"
                  class="student-row"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.class_name }}</td>
                  <td>
                    <span class="score-badge" :class="getScoreClass(student.score_percentage)">
                      {{ student.score }} ({{ student.score_percentage }}%)
                    </span>
                  </td>
                  <td>{{ formatDuration(student.time_spent) }}</td>
                  <td>
                    <span class="status-badge" :class="getStatusClass(student.status)">
                      {{ getStatusLabel(student.status) }}
                    </span>
                  </td>
                  <td>
                    <button @click="viewStudentDetail(student)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'ExamAnalytics',
  props: {
    exam: {
      type: Object,
      required: true
    },
    statistics: {
      type: Object,
      required: true
    },
    attempts: {
      type: Array,
      required: true
    },
    questionAnalysis: {
      type: Array,
      required: true
    },
    classes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'scores',
      selectedClass: '',
      scoreFilter: '',
      analysisTabs: [
        { key: 'scores', label: 'Analisis Nilai', icon: 'fas fa-chart-bar' },
        { key: 'questions', label: 'Analisis Soal', icon: 'fas fa-question-circle' },
        { key: 'students', label: 'Performa Siswa', icon: 'fas fa-users' }
      ],
      scoreDistributionChart: null,
      timeDistributionChart: null
    }
  },
  computed: {
    scoreRanges() {
      const ranges = [
        { label: '90-100', min: 90, max: 100, class: 'excellent' },
        { label: '80-89', min: 80, max: 89, class: 'good' },
        { label: '70-79', min: 70, max: 79, class: 'fair' },
        { label: '60-69', min: 60, max: 69, class: 'poor' },
        { label: '0-59', min: 0, max: 59, class: 'very-poor' }
      ]
      
      return ranges.map(range => {
        const count = this.attempts.filter(attempt => {
          const percentage = (attempt.score / this.exam.total_score) * 100
          return percentage >= range.min && percentage <= range.max
        }).length
        
        const percentage = this.attempts.length > 0 ? (count / this.attempts.length) * 100 : 0
        
        return {
          ...range,
          count,
          percentage: Math.round(percentage)
        }
      })
    },
    filteredStudents() {
      let students = this.attempts.map(attempt => ({
        ...attempt,
        score_percentage: Math.round((attempt.score / this.exam.total_score) * 100)
      }))
      
      if (this.selectedClass) {
        students = students.filter(student => student.class_id === this.selectedClass)
      }
      
      if (this.scoreFilter) {
        students = students.filter(student => {
          const percentage = student.score_percentage
          switch (this.scoreFilter) {
            case 'excellent': return percentage >= 80
            case 'good': return percentage >= 60 && percentage < 80
            case 'fair': return percentage >= 40 && percentage < 60
            case 'poor': return percentage < 40
            default: return true
          }
        })
      }
      
      return students.sort((a, b) => b.score - a.score)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.createCharts()
    })
  },
  methods: {
    createCharts() {
      this.createScoreDistributionChart()
      this.createTimeDistributionChart()
    },
    
    createScoreDistributionChart() {
      const ctx = this.$refs.scoreDistributionChart.getContext('2d')
      
      const scoreData = this.scoreRanges.map(range => range.count)
      const labels = this.scoreRanges.map(range => range.label)
      const colors = this.scoreRanges.map(range => {
        switch (range.class) {
          case 'excellent': return '#28a745'
          case 'good': return '#17a2b8'
          case 'fair': return '#ffc107'
          case 'poor': return '#fd7e14'
          case 'very-poor': return '#dc3545'
          default: return '#6c757d'
        }
      })
      
      this.scoreDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jumlah Siswa',
            data: scoreData,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      })
    },
    
    createTimeDistributionChart() {
      const ctx = this.$refs.timeDistributionChart.getContext('2d')
      
      // Group time spent into ranges
      const timeRanges = [
        { label: '0-30 min', min: 0, max: 30 },
        { label: '30-60 min', min: 30, max: 60 },
        { label: '60-90 min', min: 60, max: 90 },
        { label: '90+ min', min: 90, max: Infinity }
      ]
      
      const timeData = timeRanges.map(range => {
        return this.attempts.filter(attempt => {
          const minutes = attempt.time_spent / 60
          return minutes >= range.min && minutes < range.max
        }).length
      })
      
      const labels = timeRanges.map(range => range.label)
      
      this.timeDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: timeData,
            backgroundColor: [
              '#28a745',
              '#17a2b8',
              '#ffc107',
              '#dc3545'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
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
    
    getScoreClass(percentage) {
      if (percentage >= 80) return 'score-excellent'
      if (percentage >= 60) return 'score-good'
      if (percentage >= 40) return 'score-fair'
      return 'score-poor'
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'completed': return 'status-completed'
        case 'in_progress': return 'status-in-progress'
        case 'abandoned': return 'status-abandoned'
        default: return 'status-unknown'
      }
    },
    
    getStatusLabel(status) {
      switch (status) {
        case 'completed': return 'Selesai'
        case 'in_progress': return 'Sedang Mengerjakan'
        case 'abandoned': return 'Ditinggalkan'
        default: return 'Tidak Diketahui'
      }
    },
    
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}j ${minutes}m`
      }
      return `${minutes}m ${secs}s`
    },
    
    exportAnalytics() {
      this.$emit('export-analytics')
    },
    
    refreshData() {
      this.$emit('refresh-data')
    },
    
    viewStudentDetail(student) {
      this.$emit('view-student-detail', student)
    }
  }
}
</script>

<style scoped>
.exam-analytics {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.analytics-title {
  color: #2c3e50;
  margin: 0;
}

.analytics-actions {
  display: flex;
  gap: 10px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container h4 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.detailed-analysis {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #f8f9fa;
  color: #495057;
}

.tab-button.active {
  background: #007bff;
  color: white;
}

.tab-content {
  padding: 30px;
}

.score-analysis {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.score-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.score-stat {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.highest {
  color: #28a745;
}

.stat-value.lowest {
  color: #dc3545;
}

.score-ranges h5 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.ranges-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.range-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.range-label {
  min-width: 80px;
  font-weight: 500;
  color: #495057;
}

.range-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.range-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.range-fill.excellent {
  background: #28a745;
}

.range-fill.good {
  background: #17a2b8;
}

.range-fill.fair {
  background: #ffc107;
}

.range-fill.poor {
  background: #fd7e14;
}

.range-fill.very-poor {
  background: #dc3545;
}

.range-count {
  min-width: 80px;
  text-align: right;
  font-weight: 500;
  color: #495057;
}

.question-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-analysis-item {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
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
  font-weight: bold;
  color: #2c3e50;
}

.question-difficulty {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
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

.question-points {
  font-weight: bold;
  color: #495057;
}

.question-content {
  padding: 20px;
}

.question-text {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #2c3e50;
}

.question-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.question-options-analysis {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-analysis {
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.option-analysis.correct-option {
  background: #d4edda;
  border-color: #c3e6cb;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
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
}

.correct-option .option-letter {
  background: #28a745;
}

.option-text {
  flex: 1;
}

.option-percentage {
  font-weight: bold;
  color: #495057;
}

.option-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.option-fill {
  height: 100%;
  background: #6c757d;
  transition: width 0.3s ease;
}

.option-fill.correct {
  background: #28a745;
}

.student-performance {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.performance-filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.students-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.student-row:hover {
  background: #f8f9fa;
}

.score-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.score-excellent {
  background: #d4edda;
  color: #155724;
}

.score-good {
  background: #d1ecf1;
  color: #0c5460;
}

.score-fair {
  background: #fff3cd;
  color: #856404;
}

.score-poor {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-in-progress {
  background: #d1ecf1;
  color: #0c5460;
}

.status-abandoned {
  background: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .analysis-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    justify-content: flex-start;
  }
  
  .score-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .question-stats {
    grid-template-columns: 1fr;
  }
  
  .performance-filters {
    flex-direction: column;
  }
}
</style>
