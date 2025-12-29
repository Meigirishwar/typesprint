console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const timeDisplay = document.getElementById("time");
  const typingText = document.getElementById("typing-text");

  const sampleText =
    "without group day man become course look while general since run which how last call set she good take little another these off";

  let timer = null;
  let timeLeft = 60;
  let isRunning = false;
  let currentIndex = 0;

  // =========================
  // Load text
  // =========================
  function loadText() {
    typingText.innerHTML = "";
    currentIndex = 0;

    sampleText.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "char";
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });

    console.log("Text loaded");
  }

  // =========================
  // Start test
  // =========================
  function startTest() {
    if (isRunning) return;

    isRunning = true;
    clearInterval(timer);
    loadText();

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    startBtn.disabled = true;
    restartBtn.disabled = false;

    timer = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        endTest();
      }
    }, 1000);

    console.log("Test started");
  }

  function endTest() {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    restartBtn.disabled = true;
    console.log("Test ended");
  }

  function resetTest() {
    clearInterval(timer);
    isRunning = false;
    typingText.textContent = "Loading text...";
    timeLeft = 60;
    timeDisplay.textContent = timeLeft;
    startBtn.disabled = false;
    restartBtn.disabled = true;
    console.log("Test reset");
  }

  // =========================
  // TYPING ENGINE (REAL FIX)
  // =========================
  window.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  e.preventDefault();

  const chars = typingText.querySelectorAll(".char");
  const currentChar = chars[currentIndex];

  console.log("Key pressed:", e.key, "Expected:", currentChar?.textContent);

  // BACKSPACE
  if (e.key === "Backspace") {
    if (currentIndex === 0) return;

    currentIndex--;
    chars[currentIndex].classList.remove("correct", "incorrect");

    chars.forEach(c => c.classList.remove("current"));
    chars[currentIndex].classList.add("current");
    return;
  }

  // ignore non printable keys
  if (e.key.length !== 1) return;
  if (!currentChar) return;

  if (e.key === currentChar.textContent) {
    currentChar.classList.add("correct");
    console.log("✔ correct");
  } else {
    currentChar.classList.add("incorrect");
    console.log("✖ incorrect");
  }

  currentChar.classList.remove("current");
  currentIndex++;

  if (chars[currentIndex]) {
    chars[currentIndex].classList.add("current");
  }
});

  startBtn.addEventListener("click", startTest);
  restartBtn.addEventListener("click", resetTest);
});
