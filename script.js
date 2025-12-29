console.log("script.js loaded");
document.addEventListener("DOMContentLoaded", () => {


  // =========================
  // DOM Elements
  // =========================
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const typingInput = document.getElementById("typing-input");
  const timeDisplay = document.getElementById("time");
  const wpmDisplay = document.getElementById("wpm");
  const accuracyDisplay = document.getElementById("accuracy");
  const textToType = document.getElementById("text-to-type");
  const difficultySelect = document.getElementById("difficulty");
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  // =========================
  // App State
  // =========================
  let timer = null;
  let timeLeft = 60;
  let isTestRunning = false;
  let currentMode = "time";
  let currentDifficulty = "easy";

  // =========================
  // Helpers
  // =========================
  function getSelectedMode() {
    for (const radio of modeRadios) {
      if (radio.checked) {
        return radio.value;
      }
    }
  }

  // =========================
  // Start Test
  // =========================
  function startTest() {
    if (isTestRunning) return;

    isTestRunning = true;
    currentMode = getSelectedMode();
    currentDifficulty = difficultySelect.value;

    typingInput.disabled = false;
    typingInput.value = "";
    typingInput.focus();

    startBtn.disabled = true;
    restartBtn.disabled = false;

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;
    timer = setInterval(() => {
  timeLeft--;
  timeDisplay.textContent = timeLeft;

  if (timeLeft <= 0) {
    endTest();
  }
}, 1000);
    console.log("Test started:", currentMode, currentDifficulty);
  }

  // =========================
  // Reset Test
  // =========================
  function resetTest() {
    isTestRunning = false;
    clearInterval(timer);

    typingInput.disabled = true;
    typingInput.value = "";

    startBtn.disabled = false;
    restartBtn.disabled = true;

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "0%";

    console.log("Test reset");
  }
  function endTest() {
  isTestRunning = false;
  clearInterval(timer);

  typingInput.disabled = true;
  startBtn.disabled = false;
  restartBtn.disabled = true;

  console.log("Test ended");
}


  // =========================
  // Events
  // =========================
  startBtn.addEventListener("click", startTest);
  restartBtn.addEventListener("click", resetTest);

});
