<template>
  <div class="settings-panel" :class="{ active: isActive }">
    <h2>Settings</h2>
    
    <div class="setting">
      <label for="pomodoro-time">Pomodoro Time (minutes):</label>
      <input 
        type="number" 
        id="pomodoro-time" 
        min="1" 
        max="60" 
        v-model.number="settingsStore.pomodoroTime"
      >
    </div>
    
    <div class="setting">
      <label for="short-break-time">Short Break Time (minutes):</label>
      <input 
        type="number" 
        id="short-break-time" 
        min="1" 
        max="30" 
        v-model.number="settingsStore.shortBreakTime"
      >
    </div>
    
    <div class="setting">
      <label for="long-break-time">Long Break Time (minutes):</label>
      <input 
        type="number" 
        id="long-break-time" 
        min="1" 
        max="60" 
        v-model.number="settingsStore.longBreakTime"
      >
    </div>
    
    <div class="setting">
      <label for="auto-start">Auto-start next timer:</label>
      <input 
        type="checkbox" 
        id="auto-start" 
        v-model="settingsStore.autoStart"
      >
    </div>
    
    <div class="setting">
      <label for="sound-enabled">Sound notifications:</label>
      <input 
        type="checkbox" 
        id="sound-enabled" 
        v-model="settingsStore.soundEnabled"
      >
    </div>
    
    <div class="setting">
      <label for="background-change">Change background automatically:</label>
      <input 
        type="checkbox" 
        id="background-change" 
        v-model="settingsStore.backgroundChange"
      >
    </div>
    
    <div class="setting" v-show="settingsStore.backgroundChange">
      <label for="background-interval">Background change interval (minutes):</label>
      <input 
        type="number" 
        id="background-interval" 
        min="1" 
        max="60" 
        v-model.number="settingsStore.backgroundInterval"
      >
    </div>
    
    <div class="setting">
      <label>Change background now:</label>
      <button class="btn" @click="changeBackground">New Background</button>
    </div>
    
    <button class="btn" @click="closeSettings">Save Settings</button>
    
    <div class="sound-test">
      <button class="btn" @click="testSounds">Test Sounds</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const isActive = ref(false)

// Define emits
const emit = defineEmits(['change-background', 'test-sounds'])

// Toggle settings panel visibility
function toggleSettings() {
  isActive.value = !isActive.value
}

// Close settings panel
function closeSettings() {
  isActive.value = false
}

// Change background
function changeBackground() {
  emit('change-background')
}

// Test sounds
function testSounds() {
  emit('test-sounds')
}

// Expose methods to parent component
defineExpose({
  toggleSettings
})
</script>

<style scoped>
/* Component-specific styles can go here */
</style> 