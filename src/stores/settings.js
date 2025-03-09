import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Settings state with default values
  const pomodoroTime = ref(25)
  const shortBreakTime = ref(5)
  const longBreakTime = ref(15)
  const autoStart = ref(false)
  const soundEnabled = ref(true)
  const backgroundChange = ref(true)
  const backgroundInterval = ref(1)
  
  // Load settings from localStorage
  function loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings')
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        
        pomodoroTime.value = parsedSettings.pomodoroTime || 25
        shortBreakTime.value = parsedSettings.shortBreakTime || 5
        longBreakTime.value = parsedSettings.longBreakTime || 15
        autoStart.value = parsedSettings.autoStart || false
        soundEnabled.value = parsedSettings.soundEnabled !== undefined ? parsedSettings.soundEnabled : true
        backgroundChange.value = parsedSettings.backgroundChange !== undefined ? parsedSettings.backgroundChange : true
        backgroundInterval.value = parsedSettings.backgroundInterval || 1
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }
  
  // Save settings to localStorage
  function saveSettings() {
    const settings = {
      pomodoroTime: pomodoroTime.value,
      shortBreakTime: shortBreakTime.value,
      longBreakTime: longBreakTime.value,
      autoStart: autoStart.value,
      soundEnabled: soundEnabled.value,
      backgroundChange: backgroundChange.value,
      backgroundInterval: backgroundInterval.value
    }
    
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }
  
  // Watch for changes to settings and save them
  watch([
    pomodoroTime,
    shortBreakTime,
    longBreakTime,
    autoStart,
    soundEnabled,
    backgroundChange,
    backgroundInterval
  ], () => {
    saveSettings()
  })
  
  // Load settings on initialization
  loadSettings()
  
  return {
    pomodoroTime,
    shortBreakTime,
    longBreakTime,
    autoStart,
    soundEnabled,
    backgroundChange,
    backgroundInterval,
    saveSettings
  }
}) 