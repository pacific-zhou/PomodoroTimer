// DOM Elements
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const testSoundBtn = document.getElementById('test-sound-btn');
const changeBackgroundBtn = document.getElementById('change-background-btn');
const pomodoroTimeInput = document.getElementById('pomodoro-time');
const shortBreakTimeInput = document.getElementById('short-break-time');
const longBreakTimeInput = document.getElementById('long-break-time');
const autoStartInput = document.getElementById('auto-start');
const soundEnabledInput = document.getElementById('sound-enabled');
const backgroundChangeInput = document.getElementById('background-change');
const backgroundIntervalInput = document.getElementById('background-interval');
const backgroundIntervalSetting = document.getElementById('background-interval-setting');
const timerCircleProgress = document.querySelector('.timer-circle-progress');
const startSound = document.getElementById('start-sound');
const endSound = document.getElementById('end-sound');
const startSoundFallback = document.getElementById('start-sound-fallback');
const endSoundFallback = document.getElementById('end-sound-fallback');
const photoCredit = document.getElementById('photo-credit');

// 设置音频音量
startSound.volume = 0.7;
endSound.volume = 0.7;
startSoundFallback.volume = 0.7;
endSoundFallback.volume = 0.7;

// 预加载音频文件
startSound.load();
endSound.load();
startSoundFallback.load();
endSoundFallback.load();

// 添加音频错误处理
startSound.addEventListener('error', (e) => {
    console.error('开始音频加载失败:', e);
    console.log('尝试使用备用音频源');
    startSound.src = startSoundFallback.src;
    startSound.load();
});

endSound.addEventListener('error', (e) => {
    console.error('结束音频加载失败:', e);
    console.log('尝试使用备用音频源');
    endSound.src = endSoundFallback.src;
    endSound.load();
});

// 计算圆形进度条的周长
const calculateCircumference = (radius) => {
    return 2 * Math.PI * radius;
};

// 获取圆形进度条的半径
const getCircleRadius = () => {
    return parseInt(timerCircleProgress.getAttribute('r'));
};

// 圆形进度条的周长
const circumference = calculateCircumference(getCircleRadius());

// Timer variables
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let totalSeconds = minutes * 60 + seconds;
let remainingSeconds = totalSeconds;
let currentMode = 'pomodoro';
let completedPomodoros = 0;

// Settings
let settings = {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStart: false,
    soundEnabled: true,
    backgroundChange: true,
    backgroundInterval: 1 // 默认1分钟
};

// 添加背景自动更换计时器
let backgroundChangeTimer;

// 备用背景图片数组
const fallbackBackgrounds = [
    'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=1920'
];

// 播放声音的函数
function playSound(sound) {
    if (settings.soundEnabled) {
        // 重置音频到开始位置
        sound.currentTime = 0;
        
        // 创建播放承诺
        const playPromise = sound.play();
        
        // 处理可能的播放错误
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('音频播放失败:', error);
                // 尝试使用另一种方式播放
                setTimeout(() => {
                    sound.play().catch(e => {
                        console.error('二次尝试失败:', e);
                        // 如果是主音频源失败，尝试使用备用音频源
                        if (sound === startSound) {
                            playSound(startSoundFallback);
                        } else if (sound === endSound) {
                            playSound(endSoundFallback);
                        }
                    });
                }, 100);
            });
        }
    }
}

// 更新进度条 - 倒计时方式（由长变短）
function updateProgressBar(progress) {
    // 确保进度值在0到1之间
    progress = Math.max(0, Math.min(1, progress));
    
    // 设置进度条的偏移量
    // 注意：SVG圆环的周长是2πr，我们设置dasharray为这个值
    // 当dashoffset为0时，显示完整圆环；当dashoffset为周长时，圆环完全消失
    timerCircleProgress.style.strokeDasharray = circumference;
    
    // 计算偏移量：从0(完整圆环)到circumference(空圆环)
    const offset = circumference * (1 - progress);
    timerCircleProgress.style.strokeDashoffset = offset;
    
    // 调试信息
    console.log(`Progress: ${progress.toFixed(2)}, Offset: ${offset.toFixed(2)}, Total: ${totalSeconds}, Remaining: ${remainingSeconds}`);
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        
        // Update input values
        pomodoroTimeInput.value = settings.pomodoroTime;
        shortBreakTimeInput.value = settings.shortBreakTime;
        longBreakTimeInput.value = settings.longBreakTime;
        autoStartInput.checked = settings.autoStart;
        soundEnabledInput.checked = settings.soundEnabled;
        backgroundChangeInput.checked = settings.backgroundChange;
        backgroundIntervalInput.value = settings.backgroundInterval || 1;
        
        // 根据背景更换设置显示或隐藏间隔设置
        backgroundIntervalSetting.style.display = settings.backgroundChange ? 'flex' : 'none';
        
        // Update timer based on current mode
        updateTimerDisplay();
    }
}

// Save settings to localStorage
function saveSettings() {
    settings.pomodoroTime = parseInt(pomodoroTimeInput.value);
    settings.shortBreakTime = parseInt(shortBreakTimeInput.value);
    settings.longBreakTime = parseInt(longBreakTimeInput.value);
    settings.autoStart = autoStartInput.checked;
    settings.soundEnabled = soundEnabledInput.checked;
    settings.backgroundChange = backgroundChangeInput.checked;
    settings.backgroundInterval = parseInt(backgroundIntervalInput.value) || 1;
    
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // 根据设置启用或禁用背景自动更换
    if (settings.backgroundChange) {
        startBackgroundAutoChange();
    } else {
        stopBackgroundAutoChange();
    }
    
    // Update timer based on current mode
    resetTimer();
    settingsPanel.classList.remove('active');
}

// Update timer display
function updateTimerDisplay() {
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
    
    // 计算进度并更新进度条 - 倒计时方式
    // 剩余时间比例 = 剩余秒数 / 总秒数
    const remainingRatio = remainingSeconds / totalSeconds;
    updateProgressBar(remainingRatio);
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    if (remainingSeconds === totalSeconds) {
        // 使用新的播放函数
        playSound(startSound);
    }
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timer = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timer);
            timerComplete();
            return;
        }
        
        remainingSeconds--;
        minutes = Math.floor(remainingSeconds / 60);
        seconds = remainingSeconds % 60;
        
        updateTimerDisplay();
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timer);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset timer
function resetTimer() {
    pauseTimer();
    
    // Set time based on current mode
    switch (currentMode) {
        case 'pomodoro':
            minutes = settings.pomodoroTime;
            break;
        case 'shortBreak':
            minutes = settings.shortBreakTime;
            break;
        case 'longBreak':
            minutes = settings.longBreakTime;
            break;
    }
    
    seconds = 0;
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    
    updateTimerDisplay();
}

// Timer complete
function timerComplete() {
    // 使用新的播放函数
    playSound(endSound);
    
    // 确保进度条显示为完成状态（倒计时方式为空）
    updateProgressBar(0);
    
    document.querySelector('.timer-container').classList.add('pulse');
    setTimeout(() => {
        document.querySelector('.timer-container').classList.remove('pulse');
    }, 1500);
    
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    if (currentMode === 'pomodoro') {
        completedPomodoros++;
        
        if (completedPomodoros % 4 === 0) {
            // After 4 pomodoros, switch to long break
            switchMode('longBreak');
        } else {
            // Otherwise switch to short break
            switchMode('shortBreak');
        }
    } else {
        // After a break, switch back to pomodoro
        switchMode('pomodoro');
    }
    
    // Auto start next timer if enabled
    if (settings.autoStart) {
        setTimeout(startTimer, 1500);
    }
    
    // Change background if enabled
    if (settings.backgroundChange) {
        changeBackground();
    }
}

// Switch timer mode
function switchMode(mode) {
    currentMode = mode;
    
    // Update active button
    pomodoroBtn.classList.remove('active');
    shortBreakBtn.classList.remove('active');
    longBreakBtn.classList.remove('active');
    
    switch (mode) {
        case 'pomodoro':
            pomodoroBtn.classList.add('active');
            break;
        case 'shortBreak':
            shortBreakBtn.classList.add('active');
            break;
        case 'longBreak':
            longBreakBtn.classList.add('active');
            break;
    }
    
    resetTimer();
}

// Fetch random background from Unsplash or fallback
async function changeBackground() {
    try {
        // 显示加载状态
        console.log('Fetching new background image...');
        document.body.classList.add('loading-background');
        
        // 尝试从Unsplash获取图片
        const categories = ['nature', 'landscape', 'minimal', 'mountains', 'ocean', 'forest'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        let imageUrl = `https://source.unsplash.com/featured/1920x1080/?${randomCategory}&t=${new Date().getTime()}`;
        
        // 创建一个新的图片对象
        const img = new Image();
        
        // 设置加载超时
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Image loading timeout')), 10000); // 10秒超时
        });
        
        // 设置加载完成的回调
        const loadPromise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        
        // 开始加载图片
        img.src = imageUrl;
        
        // 等待图片加载或超时
        await Promise.race([loadPromise, timeoutPromise]);
        
        // 图片加载成功
        document.body.style.backgroundImage = `url(${img.src})`;
        document.body.classList.remove('loading-background');
        console.log('Background image loaded successfully from Unsplash');
        
        // 更新图片来源信息
        photoCredit.textContent = 'Unsplash';
        photoCredit.href = 'https://unsplash.com';
        
    } catch (error) {
        console.error('Error fetching background from Unsplash:', error);
        
        try {
            // 使用备用图片
            const randomIndex = Math.floor(Math.random() * fallbackBackgrounds.length);
            const fallbackUrl = fallbackBackgrounds[randomIndex];
            
            const fallbackImg = new Image();
            
            fallbackImg.onload = function() {
                document.body.style.backgroundImage = `url(${fallbackUrl})`;
                document.body.classList.remove('loading-background');
                console.log('Using fallback background image');
                
                // 更新图片来源信息
                photoCredit.textContent = 'Pexels';
                photoCredit.href = 'https://www.pexels.com';
            };
            
            fallbackImg.onerror = function() {
                // 如果备用图片也加载失败，使用纯色背景
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = '#333';
                document.body.classList.remove('loading-background');
                console.log('Using solid color background');
                
                // 隐藏图片来源信息
                photoCredit.parentElement.style.display = 'none';
            };
            
            fallbackImg.src = fallbackUrl;
            
        } catch (fallbackError) {
            console.error('Error with fallback background:', fallbackError);
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#333';
            document.body.classList.remove('loading-background');
            
            // 隐藏图片来源信息
            photoCredit.parentElement.style.display = 'none';
        }
    }
}

// 开始自动更换背景
function startBackgroundAutoChange() {
    // 先清除可能存在的计时器
    if (backgroundChangeTimer) {
        clearInterval(backgroundChangeTimer);
    }
    
    // 获取用户设置的间隔（分钟）
    const intervalMinutes = settings.backgroundInterval || 1;
    const intervalMs = intervalMinutes * 60000; // 转换为毫秒
    
    // 设置定时更换背景
    backgroundChangeTimer = setInterval(() => {
        if (settings.backgroundChange) {
            console.log(`Auto changing background (every ${intervalMinutes} minute(s))...`);
            changeBackground();
        }
    }, intervalMs);
}

// 停止自动更换背景
function stopBackgroundAutoChange() {
    if (backgroundChangeTimer) {
        clearInterval(backgroundChangeTimer);
        backgroundChangeTimer = null;
    }
}

// 添加测试声音的功能
function testSounds() {
    console.log('测试开始声音');
    playSound(startSound);
    
    setTimeout(() => {
        console.log('测试结束声音');
        playSound(endSound);
    }, 2000);
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
longBreakBtn.addEventListener('click', () => switchMode('longBreak'));
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});
saveSettingsBtn.addEventListener('click', saveSettings);
testSoundBtn.addEventListener('click', testSounds);
changeBackgroundBtn.addEventListener('click', () => {
    // 手动更换背景
    changeBackground();
});

// 背景更换设置的交互逻辑
backgroundChangeInput.addEventListener('change', function() {
    // 显示或隐藏间隔设置
    backgroundIntervalSetting.style.display = this.checked ? 'flex' : 'none';
});

// 初始化音频
function initializeAudio() {
    return new Promise((resolve) => {
        // 尝试播放并立即暂停以解锁音频
        const initStartSound = startSound.play().then(() => {
            startSound.pause();
            startSound.currentTime = 0;
            console.log('开始音频已初始化');
        }).catch(e => console.log('初始化音频需要用户交互'));
        
        const initEndSound = endSound.play().then(() => {
            endSound.pause();
            endSound.currentTime = 0;
            console.log('结束音频已初始化');
        }).catch(e => console.log('初始化音频需要用户交互'));
        
        // 同样初始化备用音频
        const initStartFallback = startSoundFallback.play().then(() => {
            startSoundFallback.pause();
            startSoundFallback.currentTime = 0;
        }).catch(e => {});
        
        const initEndFallback = endSoundFallback.play().then(() => {
            endSoundFallback.pause();
            endSoundFallback.currentTime = 0;
        }).catch(e => {});
        
        // 无论成功与否，都在短暂延迟后解析Promise
        setTimeout(() => {
            resolve();
        }, 500);
    });
}

// 添加用户交互初始化音频
document.addEventListener('click', function initAudio() {
    initializeAudio().then(() => {
        console.log('音频初始化完成');
    });
    
    document.removeEventListener('click', initAudio);
}, { once: true });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // 立即更换一次背景
    changeBackground();
    
    // 如果启用了背景自动更换，开始自动更换
    if (settings.backgroundChange) {
        startBackgroundAutoChange();
    }
    
    // 初始化进度条 - 倒计时方式（开始时为满）
    timerCircleProgress.style.strokeDasharray = circumference;
    timerCircleProgress.style.strokeDashoffset = 0; // 初始状态为100%进度（完整圆环）
    
    // 确保圆环可见
    console.log('Pomodoro Timer initialized');
    console.log(`Circle radius: ${getCircleRadius()}, Circumference: ${circumference}`);
    
    // 检查浏览器是否支持音频API
    if (typeof Audio !== 'undefined') {
        console.log('浏览器支持音频API');
    } else {
        console.warn('浏览器可能不支持音频API');
    }
    
    // 尝试初始化音频，然后自动开始倒计时
    try {
        initializeAudio().then(() => {
            console.log('音频初始化完成，准备自动开始倒计时');
            // 延迟一秒启动，确保页面和音频已完全加载
            setTimeout(() => {
                startTimer();
            }, 1000);
        });
    } catch (error) {
        console.warn('音频初始化失败，但仍将自动开始倒计时');
        // 即使音频初始化失败，也自动开始倒计时
        setTimeout(() => {
            startTimer();
        }, 1000);
    }
}); 