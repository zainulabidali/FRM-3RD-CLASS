let leftScore = 0;
let rightScore = 0;
let timerRunning = false;
let seconds = 0;
let timerInterval;

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const scoreSound = document.getElementById('scoreSound');
const buttonSound = document.getElementById('buttonSound');
const warningSound = document.getElementById('warningSound');
const alarmSound = document.getElementById('alarmSound');
const tickSound = document.getElementById('tickSound');
const timerEl = document.getElementById('timer');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
const celebrationOverlay = document.getElementById('celebrationOverlay');

// Audio Context for synthesized sounds
let audioContext;
let lastTickSecond = -1;

// Initialize Audio Context on user interaction
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Setup canvas
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Score Buttons
document.getElementById('leftPlus').onclick = () => {
  initAudioContext();
  updateScore('left', 5);
};
document.getElementById('leftMinus').onclick = () => {
  initAudioContext();
  updateScore('left', -3);
};
document.getElementById('rightPlus').onclick = () => {
  initAudioContext();
  updateScore('right', 5);
};
document.getElementById('rightMinus').onclick = () => {
  initAudioContext();
  updateScore('right', -3);
};

// Edit team names
document.getElementById('editLeft').onclick = () => {
  initAudioContext();
  playButtonClick();
  editName('left');
};
document.getElementById('editRight').onclick = () => {
  initAudioContext();
  playButtonClick();
  editName('right');
};

// Reset Buttons
document.getElementById('scoreReset').onclick = () => {
  initAudioContext();
  
  // Show confirmation dialog
  if (confirm('Are you sure you want to reset the scores?\n\nThis will set both team scores to 0.')) {
    playResetSound();
    resetScores();
  } else {
    playButtonClick(); // Play cancel sound
  }
};
document.getElementById('timerPause').onclick = () => {
  initAudioContext();
  playButtonClick();
  toggleTimer();
};
document.getElementById('timerReset').onclick = () => {
  initAudioContext();
  
  // Show confirmation dialog
  if (confirm('Are you sure you want to reset the timer?\n\nThis will restart the timer from 00:00.')) {
    playResetSound();
    resetTimer();
  } else {
    playButtonClick(); // Play cancel sound
  }
};

// 🧩 Load previous data from localStorage
loadSavedData();

// Start Timer Automatically
startTimer();

function updateScore(team, value) {
  const scoreEl = team === 'left' ? leftScoreEl : rightScoreEl;
  const teamEl = document.getElementById(team + 'Team');
  
  if (team === 'left') {
    leftScore += value;
    if (leftScore < 0) leftScore = 0;
    leftScoreEl.textContent = leftScore;
  } else {
    rightScore += value;
    if (rightScore < 0) rightScore = 0;
    rightScoreEl.textContent = rightScore;
  }
  
  // Trigger celebration only for positive scores
  if (value > 0) {
    playScoreSound(true); // Plus sound
    triggerCelebration(scoreEl, teamEl, value);
  } else {
    playScoreSound(false); // Minus sound
    triggerScoreAnimation(scoreEl);
  }
  
  saveData();
}

function triggerScoreAnimation(element) {
  element.classList.remove('score-update');
  void element.offsetWidth; // Trigger reflow
  element.classList.add('score-update');
  setTimeout(() => {
    element.classList.remove('score-update');
  }, 500);
  
  // Trigger sad animation for minus points
  triggerSadAnimation(element);
}

// Celebration Animation System
function triggerCelebration(scoreEl, teamEl, points) {
  // Score explosion effect
  scoreEl.classList.remove('score-explosion');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('score-explosion');
  setTimeout(() => scoreEl.classList.remove('score-explosion'), 600);
  
  // Team glow effect
  teamEl.classList.add('team-celebrate');
  setTimeout(() => teamEl.classList.remove('team-celebrate'), 1000);
  
  // Flash effect
  createFlashEffect();
  
  // Confetti burst
  launchConfetti(scoreEl);
  
  // Floating points indicator
  createFloatingText(scoreEl, '+' + points);
  
  // Particle burst
  createParticleBurst(scoreEl);
  
  // Impact rings (new)
  createScoreImpactRing(scoreEl);
}

function createFlashEffect() {
  const flash = document.createElement('div');
  flash.className = 'flash-effect';
  celebrationOverlay.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
}

function createFloatingText(element, text) {
  const rect = element.getBoundingClientRect();
  const floatingText = document.createElement('div');
  floatingText.className = 'plus-indicator';
  floatingText.textContent = text;
  floatingText.style.left = rect.left + rect.width / 2 - 30 + 'px';
  floatingText.style.top = rect.top + 'px';
  celebrationOverlay.appendChild(floatingText);
  
  // Add sparkle effects around the text
  createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
  
  setTimeout(() => floatingText.remove(), 1500);
}

function createParticleBurst(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'];
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = (Math.PI * 2 * i) / 20;
    const velocity = 100 + Math.random() * 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    
    celebrationOverlay.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// Sparkle effects for score markers
function createSparkles(x, y) {
  const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FFE4B5'];
  
  for (let i = 0; i < 12; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'score-sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = (Math.PI * 2 * i) / 12;
    const distance = 60 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    sparkle.style.setProperty('--sx', tx + 'px');
    sparkle.style.setProperty('--sy', ty + 'px');
    sparkle.style.animationDelay = (i * 0.05) + 's';
    
    celebrationOverlay.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
}

// Animated score impact rings
function createScoreImpactRing(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const ring = document.createElement('div');
      ring.className = 'score-impact-ring';
      ring.style.left = centerX + 'px';
      ring.style.top = centerY + 'px';
      celebrationOverlay.appendChild(ring);
      setTimeout(() => ring.remove(), 1000);
    }, i * 150);
  }
}

/* -------------------------
   😢 SAD ANIMATION SYSTEM (for -3 points)
------------------------- */
function triggerSadAnimation(scoreEl) {
  const rect = scoreEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Score shake effect
  scoreEl.classList.add('score-sad-shake');
  setTimeout(() => scoreEl.classList.remove('score-sad-shake'), 600);
  
  // Sad face emoji falling
  createSadFace(scoreEl);
  
  // Blue tears falling
  createTears(centerX, centerY);
  
  // Dark cloud effect
  createDarkCloud(scoreEl);
  
  // Blue sad particles falling down
  createSadParticles(centerX, centerY);
  
  // Minus text indicator
  createMinusText(scoreEl, '-3');
}

function createSadFace(element) {
  const rect = element.getBoundingClientRect();
  const sadFace = document.createElement('div');
  sadFace.className = 'sad-face';
  sadFace.textContent = '😢';
  sadFace.style.left = rect.left + rect.width / 2 - 30 + 'px';
  sadFace.style.top = rect.top - 20 + 'px';
  celebrationOverlay.appendChild(sadFace);
  setTimeout(() => sadFace.remove(), 2000);
}

function createTears(x, y) {
  const colors = ['#4A90E2', '#5B9BD5', '#87CEEB', '#B0E0E6'];
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const tear = document.createElement('div');
      tear.className = 'sad-tear';
      tear.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
      tear.style.top = y + 'px';
      tear.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      tear.style.animationDelay = (Math.random() * 0.3) + 's';
      celebrationOverlay.appendChild(tear);
      setTimeout(() => tear.remove(), 1500);
    }, i * 100);
  }
}

function createDarkCloud(element) {
  const rect = element.getBoundingClientRect();
  const cloud = document.createElement('div');
  cloud.className = 'sad-cloud';
  cloud.style.left = rect.left + rect.width / 2 - 40 + 'px';
  cloud.style.top = rect.top - 50 + 'px';
  celebrationOverlay.appendChild(cloud);
  setTimeout(() => cloud.remove(), 1500);
}

function createSadParticles(x, y) {
  const colors = ['#6B7C93', '#8B9DC3', '#A0AEC0', '#B8C5D6'];
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'sad-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const offsetX = (Math.random() - 0.5) * 60;
    const fallDistance = 100 + Math.random() * 100;
    
    particle.style.setProperty('--fall-x', offsetX + 'px');
    particle.style.setProperty('--fall-y', fallDistance + 'px');
    particle.style.animationDelay = (i * 0.05) + 's';
    
    celebrationOverlay.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
  }
}

function createMinusText(element, text) {
  const rect = element.getBoundingClientRect();
  const minusText = document.createElement('div');
  minusText.className = 'minus-indicator';
  minusText.textContent = text;
  minusText.style.left = rect.left + rect.width / 2 - 30 + 'px';
  minusText.style.top = rect.top + 'px';
  celebrationOverlay.appendChild(minusText);
  setTimeout(() => minusText.remove(), 1500);
}

// Confetti System
let confettiPieces = [];

function launchConfetti(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 50; i++) {
    confettiPieces.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() * -8) - 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      size: Math.random() * 8 + 4,
      gravity: 0.3,
      life: 1
    });
  }
  
  if (confettiPieces.length > 0) {
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  confettiPieces = confettiPieces.filter(piece => {
    piece.vy += piece.gravity;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotation += piece.rotationSpeed;
    piece.life -= 0.01;
    
    if (piece.life <= 0 || piece.y > confettiCanvas.height) {
      return false;
    }
    
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate((piece.rotation * Math.PI) / 180);
    ctx.globalAlpha = piece.life;
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.5);
    ctx.restore();
    
    return true;
  });
  
  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  }
}

function playSound() {
  scoreSound.currentTime = 0;
  scoreSound.play();
}

function editName(side) {
  const newName = prompt("പുതിയ ടീം നാമം നൽകുക:");
  if (newName && newName.trim() !== "") {
    document.getElementById(`${side}Name`).textContent = newName.trim();
    saveData();
  }
}

function resetScores() {
  leftScore = 0;
  rightScore = 0;
  leftScoreEl.textContent = 0;
  rightScoreEl.textContent = 0;
  saveData();
}

function startTimer() {
  if (timerRunning) return; // Prevent multiple intervals
  timerRunning = true;
  timerInterval = setInterval(() => {
    seconds++;
    
    // Play tick sound every second (optional soft tick)
    if (seconds > lastTickSecond) {
      lastTickSecond = seconds;
      if (seconds >= 110) {
        playTickSound(true); // Loud tick for final 10 seconds
      } else if (seconds >= 60) {
        playTickSound(false); // Soft tick after 1 minute
      }
    }
    
    // Check for 1-minute warning (60 seconds)
    if (seconds === 60) {
      triggerOneMinuteWarning();
    }
    
    // Maximum timer is 2 minutes (120 seconds)
    if (seconds >= 120) {
      seconds = 120;
      pauseTimer();
      triggerTimerEndAnimation();
      const min = String(Math.floor(seconds / 60)).padStart(2, '0');
      const sec = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${min}:${sec}`;
      saveData();
      return;
    }
    
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
    
    // Add pulsing effect when approaching 2 minutes (last 10 seconds)
    if (seconds >= 110) {
      timerEl.classList.add('timer-warning-final');
    }
    
    saveData();
  }, 1000);
  updatePauseButton();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  updatePauseButton();
}

function toggleTimer() {
  if (timerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function updatePauseButton() {
  const btn = document.getElementById('timerPause');
  if (timerRunning) {
    btn.textContent = '⏸️ Pause';
  } else {
    btn.textContent = '▶️ Play';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  lastTickSecond = -1;
  timerEl.textContent = "00:00";
  timerEl.classList.remove('timer-warning', 'timer-warning-final');
  startTimer();
  saveData();
}

/* -------------------------
   ⏰ Timer Warning & End Animations
------------------------- */
function triggerOneMinuteWarning() {
  // Add warning class to timer
  timerEl.classList.add('timer-warning');
  
  // Play warning sound
  playWarningSound();
  
  // Create warning overlay flash
  const warningFlash = document.createElement('div');
  warningFlash.className = 'warning-flash';
  celebrationOverlay.appendChild(warningFlash);
  setTimeout(() => warningFlash.remove(), 1000);
  
  // Create warning text
  const warningText = document.createElement('div');
  warningText.className = 'warning-text';
  warningText.textContent = '⚠️ 1 MINUTE WARNING ⚠️';
  celebrationOverlay.appendChild(warningText);
  setTimeout(() => warningText.remove(), 3000);
  
  // Warning particles
  createWarningParticles();
}

function createWarningParticles() {
  const colors = ['#FF0000', '#FF6347', '#FFA500'];
  
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'warning-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = Math.random() * 0.5 + 's';
      celebrationOverlay.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }, i * 50);
  }
}

function triggerTimerEndAnimation() {
  // Remove warning classes
  timerEl.classList.remove('timer-warning', 'timer-warning-final');
  
  // Play alarm sound
  playAlarmSound();
  setTimeout(() => playAlarmSound(), 500); // Double alarm
  
  // Danger alarm animation
  timerEl.classList.add('timer-danger-end');
  setTimeout(() => timerEl.classList.remove('timer-danger-end'), 3000);
  
  // Danger flash sequence (red alert)
  createDangerFlash();
  
  // Screen shake effect
  createScreenShake();
  
  // Alarm message
  const alarmMessage = document.createElement('div');
  alarmMessage.className = 'timer-alarm-message';
  alarmMessage.innerHTML = '⚠️<br>TIME\'S UP!<br>⚠️';
  celebrationOverlay.appendChild(alarmMessage);
  setTimeout(() => alarmMessage.remove(), 4000);
  
  // Danger border pulse on container
  createDangerBorder();
}

function createDangerFlash() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const flash = document.createElement('div');
      flash.className = 'danger-flash';
      celebrationOverlay.appendChild(flash);
      setTimeout(() => flash.remove(), 300);
    }, i * 400);
  }
}

function createScreenShake() {
  const container = document.querySelector('.container');
  container.classList.add('screen-shake');
  setTimeout(() => container.classList.remove('screen-shake'), 1000);
}

function createDangerBorder() {
  const dangerBorder = document.createElement('div');
  dangerBorder.className = 'danger-border';
  document.body.appendChild(dangerBorder);
  setTimeout(() => dangerBorder.remove(), 4000);
}

/* -------------------------
   🧠 Local Storage Functions
------------------------- */
function saveData() {
  const data = {
    leftScore,
    rightScore,
    leftName: document.getElementById('leftName').textContent,
    rightName: document.getElementById('rightName').textContent,
    seconds
  };
  localStorage.setItem('scoreboardData', JSON.stringify(data));
}

function loadSavedData() {
  const saved = localStorage.getItem('scoreboardData');
  if (saved) {
    const data = JSON.parse(saved);
    leftScore = data.leftScore || 0;
    rightScore = data.rightScore || 0;
    document.getElementById('leftName').textContent = data.leftName || 'Badr';
    document.getElementById('rightName').textContent = data.rightName || 'Uhud';
    seconds = data.seconds || 0;

    leftScoreEl.textContent = leftScore;
    rightScoreEl.textContent = rightScore;

    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
  }
}

/* -------------------------
   🔊 SOUND SYNTHESIS FUNCTIONS
------------------------- */

// Score sound - different for plus and minus
function playScoreSound(isPlus) {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (isPlus) {
    // Happy ascending chime for plus
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
    oscillator.type = 'sine';
  } else {
    // Descending tone for minus
    oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
    oscillator.frequency.exponentialRampToValueAtTime(261.63, audioContext.currentTime + 0.1); // C4
    oscillator.type = 'triangle';
  }
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

// Button click sound
function playButtonClick() {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.05);
}

// Reset sound - whoosh
function playResetSound() {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Tick sound for timer
function playTickSound(isLoud) {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
  oscillator.type = 'square';
  
  const volume = isLoud ? 0.15 : 0.03;
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.03);
}

// Warning sound - 1 minute warning
function playWarningSound() {
  if (!audioContext) return;
  
  // Three ascending beeps
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      oscillator.frequency.setValueAtTime(frequencies[i], audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }, i * 150);
  }
}

// Alarm sound - timer end
function playAlarmSound() {
  if (!audioContext) return;
  
  // Loud alternating alarm beep
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator1.frequency.setValueAtTime(880, audioContext.currentTime); // A5
  oscillator2.frequency.setValueAtTime(932.33, audioContext.currentTime); // A#5
  oscillator1.type = 'square';
  oscillator2.type = 'square';
  
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime + 0.1);
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.3);
}
