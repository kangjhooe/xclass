<template>
  <div class="exam-timer">
    <div class="timer-container" :class="timerClass">
      <div class="timer-icon">
        <i class="fas fa-clock"></i>
      </div>
      <div class="timer-content">
        <div class="timer-label">Waktu Tersisa</div>
        <div class="timer-display">{{ formattedTime }}</div>
      </div>
    </div>
    
    <!-- Warning messages -->
    <div v-if="showWarning" class="timer-warning" :class="warningClass">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ warningMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamTimer',
  props: {
    duration: {
      type: Number,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    autoSubmit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      remainingTime: 0,
      timer: null,
      isRunning: false,
      hasWarned: {
        tenMinutes: false,
        fiveMinutes: false,
        oneMinute: false,
        thirtySeconds: false
      }
    }
  },
  computed: {
    formattedTime() {
      const hours = Math.floor(this.remainingTime / 3600)
      const minutes = Math.floor((this.remainingTime % 3600) / 60)
      const seconds = this.remainingTime % 60
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    timerClass() {
      if (this.remainingTime <= 30) return 'timer-critical'
      if (this.remainingTime <= 60) return 'timer-warning'
      if (this.remainingTime <= 300) return 'timer-attention'
      return 'timer-normal'
    },
    showWarning() {
      return this.remainingTime <= 300 && this.remainingTime > 0
    },
    warningClass() {
      if (this.remainingTime <= 30) return 'warning-critical'
      if (this.remainingTime <= 60) return 'warning-danger'
      if (this.remainingTime <= 300) return 'warning-warning'
      return ''
    },
    warningMessage() {
      if (this.remainingTime <= 30) return 'Waktu hampir habis! Jawaban akan otomatis disimpan.'
      if (this.remainingTime <= 60) return 'Perhatian! Waktu tersisa kurang dari 1 menit.'
      if (this.remainingTime <= 300) return 'Peringatan! Waktu tersisa kurang dari 5 menit.'
      return ''
    }
  },
  mounted() {
    this.initializeTimer()
    this.startTimer()
  },
  beforeUnmount() {
    this.stopTimer()
  },
  methods: {
    initializeTimer() {
      const startTime = new Date(this.startTime)
      const now = new Date()
      const elapsed = Math.floor((now - startTime) / 1000)
      this.remainingTime = Math.max(0, this.duration - elapsed)
    },
    startTimer() {
      if (this.isRunning) return
      
      this.isRunning = true
      this.timer = setInterval(() => {
        this.remainingTime--
        this.checkWarnings()
        
        if (this.remainingTime <= 0) {
          this.handleTimeUp()
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.isRunning = false
    },
    checkWarnings() {
      if (this.remainingTime <= 30 && !this.hasWarned.thirtySeconds) {
        this.hasWarned.thirtySeconds = true
        this.$emit('warning', { type: 'critical', time: this.remainingTime })
      } else if (this.remainingTime <= 60 && !this.hasWarned.oneMinute) {
        this.hasWarned.oneMinute = true
        this.$emit('warning', { type: 'danger', time: this.remainingTime })
      } else if (this.remainingTime <= 300 && !this.hasWarned.fiveMinutes) {
        this.hasWarned.fiveMinutes = true
        this.$emit('warning', { type: 'warning', time: this.remainingTime })
      } else if (this.remainingTime <= 600 && !this.hasWarned.tenMinutes) {
        this.hasWarned.tenMinutes = true
        this.$emit('warning', { type: 'info', time: this.remainingTime })
      }
    },
    handleTimeUp() {
      this.stopTimer()
      this.$emit('time-up')
      
      if (this.autoSubmit) {
        this.$emit('auto-submit')
      }
    },
    pauseTimer() {
      this.stopTimer()
    },
    resumeTimer() {
      this.startTimer()
    },
    addTime(seconds) {
      this.remainingTime += seconds
    }
  }
}
</script>

<style scoped>
.exam-timer {
  position: sticky;
  top: 20px;
  z-index: 1000;
}

.timer-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.timer-container.timer-critical {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  animation: pulse 1s infinite;
}

.timer-container.timer-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.timer-container.timer-attention {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

.timer-icon {
  font-size: 24px;
  opacity: 0.9;
}

.timer-content {
  flex: 1;
}

.timer-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 2px;
}

.timer-display {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.timer-warning {
  margin-top: 10px;
  padding: 10px 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.warning-critical {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.warning-danger {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc02;
}

.warning-warning {
  background-color: #fff8e1;
  color: #f57c00;
  border: 1px solid #ffecb3;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .timer-container {
    padding: 12px 15px;
  }
  
  .timer-display {
    font-size: 20px;
  }
  
  .timer-icon {
    font-size: 20px;
  }
}
</style>
