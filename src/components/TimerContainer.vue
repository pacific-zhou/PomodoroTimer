<template>
  <div class="timer-container">
    <h1>Pomodoro Timer</h1>
    
    <div class="timer">
      <div class="timer-wrapper">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <circle class="timer-circle-bg" cx="150" cy="150" r="120" />
          <circle 
            class="timer-circle-progress" 
            cx="150" 
            cy="150" 
            r="120" 
            :class="{ 'pulse': isLastSeconds }"
            :style="progressStyle"
          />
        </svg>
        
        <div class="time-display" :class="{ 'text-pulse': isLastSeconds }">
          <span>{{ timerStore.displayMinutes }}</span>:<span>{{ timerStore.displaySeconds }}</span>
        </div>
      </div>
    </div>
    
    <!-- 调试信息，可以在测试后删除 -->
    <div class="debug-info" style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 5px;">
      Progress: {{ Math.round(timerStore.progress * 100) }}%
    </div>
    
    <div class="timer-controls">
      <button 
        class="btn" 
        @click="timerStore.startTimer()" 
        :disabled="timerStore.isRunning"
      >
        <i class="fas fa-play"></i> Start
      </button>
      <button 
        class="btn" 
        @click="timerStore.pauseTimer()" 
        :disabled="!timerStore.isRunning"
      >
        <i class="fas fa-pause"></i> Pause
      </button>
      <button 
        class="btn" 
        @click="timerStore.resetTimer()"
      >
        <i class="fas fa-redo"></i> Reset
      </button>
    </div>
    
    <div class="timer-modes">
      <button 
        class="mode-btn settings-btn" 
        @click="toggleSettings"
      >
        <i class="fas fa-cog"></i> Settings
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: timerStore.currentMode === 'shortBreak' }"
        @click="timerStore.switchMode('shortBreak')"
      >
        Short Break
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: timerStore.currentMode === 'longBreak' }"
        @click="timerStore.switchMode('longBreak')"
      >
        Long Break
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTimerStore } from '../stores/timer'

const timerStore = useTimerStore()

// Emit event to toggle settings panel
const emit = defineEmits(['toggle-settings'])

function toggleSettings() {
  emit('toggle-settings')
}

// Calculate progress style for SVG circle
const progressStyle = computed(() => {
  const circumference = 2 * Math.PI * 120
  
  // 计算剩余的圆弧长度
  const dashLength = circumference * timerStore.progress
  
  return {
    strokeDasharray: `${dashLength} ${circumference}`
  }
})

// 添加一个计算属性，检测是否在最后几秒
const isLastSeconds = computed(() => {
  return timerStore.isRunning && timerStore.remainingSeconds <= 10
})
</script>

<style scoped>
/* 移除不需要的样式 */
</style> 