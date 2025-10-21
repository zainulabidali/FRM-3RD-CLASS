let leftScore = 0;
let rightScore = 0;
let timerRunning = false;
let seconds = 0;
let timerInterval;

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const scoreSound = document.getElementById('scoreSound');
const timerEl = document.getElementById('timer');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
const celebrationOverlay = document.getElementById('celebrationOverlay');

// Setup canvas
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Score Buttons
document.getElementById('leftPlus').onclick = () => updateScore('left', 5);
document.getElementById('leftMinus').onclick = () => updateScore('left', -3);
document.getElementById('rightPlus').onclick = () => updateScore('right', 5);
document.getElementById('rightMinus').onclick = () => updateScore('right', -3);

// Edit team names
document.getElementById('editLeft').onclick = () => editName('left');
document.getElementById('editRight').onclick = () => editName('right');

// Reset Buttons
document.getElementById('scoreReset').onclick = resetScores;
document.getElementById('timerPause').onclick = toggleTimer;
document.getElementById('timerReset').onclick = resetTimer;

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
    triggerCelebration(scoreEl, teamEl, value);
  } else {
    triggerScoreAnimation(scoreEl);
  }
  
  playSound();
  saveData();
}

function triggerScoreAnimation(element) {
  element.classList.remove('score-update');
  void element.offsetWidth; // Trigger reflow
  element.classList.add('score-update');
  setTimeout(() => {
    element.classList.remove('score-update');
  }, 500);
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
  playSound();
  saveData();
}

function startTimer() {
  if (timerRunning) return; // Prevent multiple intervals
  timerRunning = true;
  timerInterval = setInterval(() => {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
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
  timerEl.textContent = "00:00";
  startTimer();
  saveData();
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
