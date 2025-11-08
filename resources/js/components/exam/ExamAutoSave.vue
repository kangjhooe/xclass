<template>
  <div class="auto-save-container">
    <!-- Connection Status Indicator -->
    <div class="connection-status" :class="connectionStatusClass">
      <i class="fas" :class="connectionIcon"></i>
      <span>{{ connectionStatusText }}</span>
    </div>

    <!-- Auto-save Status -->
    <div v-if="autoSaveStatus" class="auto-save-status" :class="autoSaveStatus.type">
      <i class="fas" :class="autoSaveStatus.icon"></i>
      <span>{{ autoSaveStatus.message }}</span>
    </div>

    <!-- Queued Answers Counter -->
    <div v-if="queuedAnswersCount > 0" class="queued-answers">
      <i class="fas fa-clock"></i>
      <span>{{ queuedAnswersCount }} jawaban menunggu disimpan</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamAutoSave',
  props: {
    attemptId: {
      type: [String, Number],
      required: true
    },
    answers: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      autoSaveTimer: null,
      connectionCheckTimer: null,
      autoSaveStatus: null,
      connectionStatus: 'checking', // checking, stable, unstable, offline
      queuedAnswersCount: 0,
      lastSaveTime: null,
      saveInterval: 30000, // 30 seconds default
      retryCount: 0,
      maxRetries: 3,
      isOnline: navigator.onLine
    }
  },
  computed: {
    connectionStatusClass() {
      return {
        'status-checking': this.connectionStatus === 'checking',
        'status-stable': this.connectionStatus === 'stable',
        'status-unstable': this.connectionStatus === 'unstable',
        'status-offline': this.connectionStatus === 'offline'
      }
    },
    connectionIcon() {
      switch (this.connectionStatus) {
        case 'checking': return 'fa-spinner fa-spin'
        case 'stable': return 'fa-wifi'
        case 'unstable': return 'fa-wifi fa-exclamation-triangle'
        case 'offline': return 'fa-wifi fa-times'
        default: return 'fa-question'
      }
    },
    connectionStatusText() {
      switch (this.connectionStatus) {
        case 'checking': return 'Memeriksa koneksi...'
        case 'stable': return 'Koneksi stabil'
        case 'unstable': return 'Koneksi tidak stabil'
        case 'offline': return 'Tidak ada koneksi'
        default: return 'Status tidak diketahui'
      }
    }
  },
  mounted() {
    this.initializeAutoSave()
    this.startConnectionMonitoring()
    this.setupOnlineOfflineListeners()
  },
  beforeUnmount() {
    this.stopAutoSave()
    this.stopConnectionMonitoring()
    this.removeOnlineOfflineListeners()
  },
  methods: {
    initializeAutoSave() {
      this.checkConnection()
      this.startAutoSave()
    },

    startAutoSave() {
      this.stopAutoSave() // Clear existing timer
      
      this.autoSaveTimer = setInterval(() => {
        if (this.hasAnswersToSave()) {
          this.performAutoSave()
        }
      }, this.saveInterval)
    },

    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = null
      }
    },

    startConnectionMonitoring() {
      this.connectionCheckTimer = setInterval(() => {
        this.checkConnection()
      }, 10000) // Check every 10 seconds
    },

    stopConnectionMonitoring() {
      if (this.connectionCheckTimer) {
        clearInterval(this.connectionCheckTimer)
        this.connectionCheckTimer = null
      }
    },

    setupOnlineOfflineListeners() {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    },

    removeOnlineOfflineListeners() {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    },

    handleOnline() {
      this.isOnline = true
      this.connectionStatus = 'checking'
      this.checkConnection()
      this.showStatus('success', 'fas fa-wifi', 'Koneksi kembali normal')
    },

    handleOffline() {
      this.isOnline = false
      this.connectionStatus = 'offline'
      this.showStatus('warning', 'fas fa-wifi fa-times', 'Tidak ada koneksi internet')
    },

    async checkConnection() {
      if (!this.isOnline) {
        this.connectionStatus = 'offline'
        return
      }

      try {
        const startTime = performance.now()
        
        // Test connection with a lightweight request
        const response = await fetch('/api/connection-test', {
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        const endTime = performance.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          if (responseTime < 1000) {
            this.connectionStatus = 'stable'
            this.saveInterval = 30000 // 30 seconds
          } else if (responseTime < 3000) {
            this.connectionStatus = 'unstable'
            this.saveInterval = 60000 // 1 minute
          } else {
            this.connectionStatus = 'unstable'
            this.saveInterval = 120000 // 2 minutes
          }
          
          this.retryCount = 0
          this.startAutoSave() // Restart with new interval
        } else {
          throw new Error('Connection test failed')
        }
      } catch (error) {
        this.connectionStatus = 'offline'
        this.retryCount++
        
        if (this.retryCount >= this.maxRetries) {
          this.showStatus('error', 'fas fa-exclamation-triangle', 'Gagal menyimpan otomatis')
        }
      }
    },

    hasAnswersToSave() {
      return Object.keys(this.answers).some(key => this.answers[key] !== null && this.answers[key] !== '')
    },

    async performAutoSave() {
      if (!this.isOnline || this.connectionStatus === 'offline') {
        return
      }

      try {
        this.showStatus('saving', 'fas fa-spinner fa-spin', 'Menyimpan jawaban...')

        const answersToSave = {}
        Object.keys(this.answers).forEach(key => {
          if (this.answers[key] !== null && this.answers[key] !== '') {
            answersToSave[key] = this.answers[key]
          }
        })

        const response = await fetch(`/tenant/exam/save-answer/${this.attemptId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
          },
          body: JSON.stringify({
            answers: answersToSave,
            auto_save: true,
            connection_quality: this.connectionStatus
          })
        })

        const result = await response.json()

        if (result.success) {
          this.showStatus('success', 'fas fa-check', 'Jawaban tersimpan')
          this.lastSaveTime = new Date()
          this.queuedAnswersCount = result.queued_count || 0
          this.retryCount = 0
        } else {
          throw new Error(result.message || 'Save failed')
        }

      } catch (error) {
        console.error('Auto-save failed:', error)
        this.handleSaveError(error)
      }
    },

    handleSaveError(error) {
      this.retryCount++
      
      if (this.retryCount <= this.maxRetries) {
        this.showStatus('warning', 'fas fa-exclamation-triangle', 
          `Gagal menyimpan, mencoba lagi (${this.retryCount}/${this.maxRetries})`)
        
        // Retry with exponential backoff
        setTimeout(() => {
          this.performAutoSave()
        }, Math.pow(2, this.retryCount) * 1000)
      } else {
        this.showStatus('error', 'fas fa-times', 'Gagal menyimpan, jawaban akan disimpan saat koneksi membaik')
        this.queuedAnswersCount++
      }
    },

    showStatus(type, icon, message) {
      this.autoSaveStatus = { type, icon, message }
      
      // Auto-hide success messages after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.autoSaveStatus = null
        }, 3000)
      }
    },

    // Public method to manually trigger save
    async manualSave() {
      await this.performAutoSave()
    },

    // Public method to get save status
    getSaveStatus() {
      return {
        connectionStatus: this.connectionStatus,
        lastSaveTime: this.lastSaveTime,
        queuedAnswersCount: this.queuedAnswersCount,
        retryCount: this.retryCount,
        isOnline: this.isOnline
      }
    }
  }
}
</script>

<style scoped>
.auto-save-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.connection-status {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-checking {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.status-stable {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-unstable {
  background: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.status-offline {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.auto-save-status {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.auto-save-status.saving {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.auto-save-status.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.auto-save-status.warning {
  background: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.auto-save-status.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.queued-answers {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .auto-save-container {
    top: 10px;
    right: 10px;
    left: 10px;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .connection-status,
  .auto-save-status,
  .queued-answers {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
