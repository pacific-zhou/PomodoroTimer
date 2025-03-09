<template>
  <div class="container">
    <TimerContainer @toggle-settings="toggleSettings" />
    <SettingsPanel 
      ref="settingsPanel"
      @change-background="changeBackground"
      @test-sounds="testSounds"
    />
    <div class="background-credit">
      <span>Photo by <a :href="photoUrl" target="_blank">{{ photoCredit }}</a></span>
    </div>
  </div>
  
  <audio ref="startSound" src="https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3" preload="auto"></audio>
  <audio ref="endSound" src="https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3" preload="auto"></audio>
  <audio ref="startSoundFallback" src="https://soundbible.com/mp3/service-bell_daniel_simion.mp3" preload="auto"></audio>
  <audio ref="endSoundFallback" src="https://soundbible.com/mp3/analog-watch-alarm_daniel-simion.mp3" preload="auto"></audio>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTimerStore } from './stores/timer'
import { useSettingsStore } from './stores/settings'
import TimerContainer from './components/TimerContainer.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const timerStore = useTimerStore()
const settingsStore = useSettingsStore()

// Audio elements
const startSound = ref(null)
const endSound = ref(null)
const startSoundFallback = ref(null)
const endSoundFallback = ref(null)

// Settings panel reference
const settingsPanel = ref(null)

// Background image credit
const photoCredit = ref('Unsplash')
const photoUrl = ref('#')

// Initialize audio
onMounted(() => {
  // Set audio volumes
  startSound.value.volume = 0.7
  endSound.value.volume = 0.7
  startSoundFallback.value.volume = 0.7
  endSoundFallback.value.volume = 0.7
  
  // Load audio files
  startSound.value.load()
  endSound.value.load()
  startSoundFallback.value.load()
  endSoundFallback.value.load()
  
  // Add error handling for audio
  startSound.value.addEventListener('error', (e) => {
    console.error('Start audio loading failed:', e)
    console.log('Trying fallback audio source')
    startSound.value.src = startSoundFallback.value.src
    startSound.value.load()
  })
  
  endSound.value.addEventListener('error', (e) => {
    console.error('End audio loading failed:', e)
    console.log('Trying fallback audio source')
    endSound.value.src = endSoundFallback.value.src
    endSound.value.load()
  })
  
  // Initialize background
  changeBackground()
  
  // Start background auto-change if enabled
  if (settingsStore.backgroundChange) {
    startBackgroundAutoChange()
  }
  
  // Initialize audio on first user interaction
  document.addEventListener('click', initAudio, { once: true })
})

// Watch for timer completion
watch(() => timerStore.isComplete, (isComplete) => {
  if (isComplete) {
    playSound(endSound.value)
  }
})

// Watch for timer start
watch(() => timerStore.isRunning, (isRunning, wasRunning) => {
  if (isRunning && !wasRunning) {
    playSound(startSound.value)
  }
})

// Watch for background change setting
watch(() => settingsStore.backgroundChange, (newValue) => {
  if (newValue) {
    startBackgroundAutoChange()
  } else {
    stopBackgroundAutoChange()
  }
})

// Toggle settings panel
function toggleSettings() {
  settingsPanel.value.toggleSettings()
  
  // 自动切换到 Pomodoro 模式，但不显示按钮
  timerStore.switchMode('pomodoro')
}

// Background change timer
let backgroundChangeTimer

function startBackgroundAutoChange() {
  stopBackgroundAutoChange()
  const intervalMs = settingsStore.backgroundInterval * 60 * 1000
  backgroundChangeTimer = setInterval(() => {
    changeBackground()
  }, intervalMs)
}

function stopBackgroundAutoChange() {
  if (backgroundChangeTimer) {
    clearInterval(backgroundChangeTimer)
    backgroundChangeTimer = null
  }
}

// Play sound function
function playSound(sound) {
  if (!settingsStore.soundEnabled) return
  
  try {
    sound.currentTime = 0
    sound.play().catch(error => {
      console.error('Error playing sound:', error)
    })
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

// Test sounds function
function testSounds() {
  playSound(startSound.value)
  setTimeout(() => {
    playSound(endSound.value)
  }, 1000)
}

// Initialize audio on first user interaction
function initAudio() {
  const context = new (window.AudioContext || window.webkitAudioContext)()
  
  if (context.state === 'suspended') {
    context.resume()
  }
  
  // Play and immediately pause to initialize audio
  startSound.value.play().then(() => {
    startSound.value.pause()
    startSound.value.currentTime = 0
  }).catch(error => {
    console.error('Error initializing audio:', error)
  })
}

// Change background function
async function changeBackground() {
  document.body.classList.add('loading-background')
  
  try {
    // Try to fetch from Unsplash API
    const response = await fetch('https://api.unsplash.com/photos/random?orientation=landscape&query=nature,landscape&client_id=YOUR_UNSPLASH_API_KEY')
    
    if (response.ok) {
      const data = await response.json()
      const imageUrl = data.urls.regular
      const photographer = data.user.name
      const photographerUrl = data.user.links.html
      
      // Update background
      document.body.style.backgroundImage = `url(${imageUrl})`
      photoCredit.value = photographer
      photoUrl.value = photographerUrl
    } else {
      // Use fallback if API fails
      useFallbackBackground()
    }
  } catch (error) {
    console.error('Error fetching background:', error)
    useFallbackBackground()
  } finally {
    document.body.classList.remove('loading-background')
  }
}

// Fallback backgrounds
const fallbackBackgrounds = [
  'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=1920'
]

function useFallbackBackground() {
  const randomIndex = Math.floor(Math.random() * fallbackBackgrounds.length)
  const imageUrl = fallbackBackgrounds[randomIndex]
  document.body.style.backgroundImage = `url(${imageUrl})`
  photoCredit.value = 'Pexels'
  photoUrl.value = 'https://www.pexels.com'
}
</script>

<style scoped>
/* Component-specific styles can go here */
</style> 