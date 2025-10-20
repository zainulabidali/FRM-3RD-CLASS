let leftScore = 0;
let rightScore = 0;
let timerRunning = false;
let seconds = 0;
let timerInterval;

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const scoreSound = document.getElementById('scoreSound');
const timerEl = document.getElementById('timer');

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
document.getElementById('timerReset').onclick = resetTimer;

// 🧩 Load previous data from localStorage
loadSavedData();

// Start Timer Automatically
startTimer();

function updateScore(team, value) {
  if (team === 'left') {
    leftScore += value;
    if (leftScore < 0) leftScore = 0;
    leftScoreEl.textContent = leftScore;
  } else {
    rightScore += value;
    if (rightScore < 0) rightScore = 0;
    rightScoreEl.textContent = rightScore;
  }
  playSound();
  saveData();
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
  timerRunning = true;
  timerInterval = setInterval(() => {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
    saveData();
  }, 1000);
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
