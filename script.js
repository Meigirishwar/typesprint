console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DOM ELEMENTS
  ========================= */
  const appContainer = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");
  const typingText = document.getElementById("typing-text");
  const timeDisplay = document.getElementById("time");
  const timerSection = document.getElementById("timer");
  const restartBtn = document.getElementById("restart-btn");
  const retryBtn = document.getElementById("retry-btn");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");

  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const wordCountSelect = document.getElementById("word-count");

  /* =========================
     WORD POOL
  ========================= */
  const WORD_POOL = [
    "the","and","to","of","is","you","that","it","in","for",
    "on","with","as","are","this","but","be","have","not",
    "from","they","we","say","her","she","or","will","my",
    "one","all","would","there","their","time","people","way"
  ];

  /* =========================
     STATE
  ========================= */
  let mode = "time";
  let wordLimit = 10;
  let text = "";
  let index = 0;

  let correct = 0;
  let incorrect = 0;

  let isRunningunning = false;
  let timer = null;
  let timeLeft = 60;
  let startTime = 0;

  /* =========================
     SETTINGS
  ========================= */
  function updateSettings() {
    modeRadios.forEach(r => r.checked && (mode = r.value));
    wordLimit = +wordCountSelect.value;
    timerSection.style.display = mode === "time" ? "block" : "none";
  }

  /* =========================
     TEXT GENERATION
  ========================= */
  function generateWords(count) {
    return Array.from({ length: count }, () =>
      WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    ).join(" ");
  }

  function generateText() {
    return mode === "words"
      ? generateWords(wordLimit)
      : generateWords(200);
  }

  /* =========================
     RESET / LOAD
  ========================= */
  function loadText() {
    updateSettings();
    clearInterval(timer);

    isRunning = false;
    index = 0;
    correct = 0;
    incorrect = 0;

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    typingText.innerHTML = "";
    text = generateText();

    text.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("char");
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });

    restartBtn.style.display = "none";
  }

  /* =========================
     START TEST
  ========================= */
  function startTest() {
    if (isRunning) return;

    isRunning = true;
    startTime = Date.now();
    restartBtn.style.display = "inline-block";

    if (mode === "time") {
      timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endTest();
      }, 1000);
    }
  }

  /* =========================
     END TEST
  ========================= */
  function endTest() {
    clearInterval(timer);
    isRunning = false;

    const totalTyped = correct + incorrect;
    const accuracy = totalTyped === 0
      ? 0
      : Math.round((correct / totalTyped) * 100);

    const minutes = (Date.now() - startTime) / 60000;
    const wpm = minutes > 0
      ? Math.round((correct / 5) / minutes)
      : 0;

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect}`;
    resultTime.textContent =
      mode === "time" ? "60s" : `${Math.round(minutes * 60)}s`;

    appContainer.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     KEY HANDLER
  ========================= */
  window.addEventListener("keydown", (e) => {
    if (!isRunning) startTest();

    const chars = typingText.querySelectorAll(".char");

    /* BACKSPACE — VISUAL ONLY */
    if (e.key === "Backspace") {
      if (index === 0) return;

      index--;
      chars.forEach(c => c.classList.remove("current"));
      chars[index].classList.add("current");

      // DO NOT change correct / incorrect counts
      chars[index].classList.remove("correct", "incorrect");
      return;
    }

    if (e.key.length !== 1) return;

    const currentChar = chars[index];
    if (!currentChar) return;

    if (e.key === currentChar.textContent) {
      currentChar.classList.add("correct");
      correct++;
    } else {
      currentChar.classList.add("incorrect");
      incorrect++;
    }

    currentChar.classList.remove("current");
    index++;

    if (mode === "words" && index === text.length) {
      endTest();
      return;
    }

    if (mode === "time" && index === text.length) {
      loadText();
      startTest();
      return;
    }

    if (chars[index]) {
      chars[index].classList.add("current");
    }
  });

  /* =========================
     BUTTONS
  ========================= */
  restartBtn.addEventListener("click", loadText);
  retryBtn.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    appContainer.classList.remove("hidden");
    loadText();
  });

  modeRadios.forEach(r => r.addEventListener("change", loadText));
  wordCountSelect.addEventListener("change", loadText);

  /* =========================
     INIT
  ========================= */
  loadText();
});
