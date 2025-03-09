import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings'

export const useTimerStore = defineStore('timer', () => {
  const settingsStore = useSettingsStore()
  
  // Timer state
  const minutes = ref(25)
  const seconds = ref(0)
  const isRunning = ref(false)
  const currentMode = ref('pomodoro')
  const completedPomodoros = ref(0)
  const isComplete = ref(false)
  
  // Computed properties
  const totalSeconds = computed(() => minutes.value * 60 + seconds.value)
  const remainingSeconds = ref(25 * 60)
  const displayMinutes = computed(() => String(Math.floor(remainingSeconds.value / 60)).padStart(2, '0'))
  const displaySeconds = computed(() => String(remainingSeconds.value % 60).padStart(2, '0'))
  const progress = computed(() => remainingSeconds.value / (getModeDuration() * 60))
  
  // Timer interval
  let timer = null
  
  // Get current mode duration from settings
  function getModeDuration() {
    switch (currentMode.value) {
      case 'pomodoro':
        return settingsStore.pomodoroTime
      case 'shortBreak':
        return settingsStore.shortBreakTime
      case 'longBreak':
        return settingsStore.longBreakTime
      default:
        return settingsStore.pomodoroTime
    }
  }
  
  // Start the timer
  function startTimer() {
    if (isRunning.value) return
    
    isRunning.value = true
    isComplete.value = false
    
    timer = setInterval(() => {
      if (remainingSeconds.value <= 0) {
        timerComplete()
        return
      }
      
      remainingSeconds.value--
    }, 1000)
  }
  
  // Pause the timer
  function pauseTimer() {
    if (!isRunning.value) return
    
    isRunning.value = false
    clearInterval(timer)
    timer = null
  }
  
  // Reset the timer
  function resetTimer() {
    pauseTimer()
    remainingSeconds.value = getModeDuration() * 60
    isComplete.value = false
  }
  
  // Timer complete
  function timerComplete() {
    pauseTimer()
    isComplete.value = true
    
    if (currentMode.value === 'pomodoro') {
      completedPomodoros.value++
      
      if (completedPomodoros.value % 4 === 0) {
        // After 4 pomodoros, take a long break
        switchMode('longBreak')
      } else {
        // Otherwise take a short break
        switchMode('shortBreak')
      }
    } else {
      // After a break, go back to pomodoro
      switchMode('pomodoro')
    }
    
    // Auto-start next timer if enabled
    if (settingsStore.autoStart) {
      startTimer()
    }
  }
  
  // Switch timer mode
  function switchMode(mode) {
    if (mode === currentMode.value) return
    
    pauseTimer()
    currentMode.value = mode
    remainingSeconds.value = getModeDuration() * 60
    isComplete.value = false
  }
  
  return {
    minutes,
    seconds,
    isRunning,
    currentMode,
    completedPomodoros,
    isComplete,
    totalSeconds,
    remainingSeconds,
    displayMinutes,
    displaySeconds,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode
  }
}) 