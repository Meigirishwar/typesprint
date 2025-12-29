console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     DOM ELEMENTS
  ========================= */
  const appContainer = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");
  const typingText = document.getElementById("typing-text");
  const timeDisplay = document.getElementById("time");
  const restartBtn = document.getElementById("restart-btn");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");

  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const wordCountSelect = document.getElementById("word-count");

  /* =========================
     INITIAL UI
  ========================= */
  resultPage.classList.add("hidden");
  appContainer.classList.remove("hidden");
  restartBtn.style.display = "none";

  /* =========================
     WORD POOL
  ========================= */
  const WORD_POOL = [
    "the","and","to","of","is","you","that","it","in","for",
    "on","with","as","are","this","but","be","have","not",
    "from","they","we","say","her","she","or","will","my",
    "one","all","would","there","their","time","people","way",
    "day","man","world","school","state","family","student"
  ];

  /* =========================
     STATE
  ========================= */
  let isRunning = false;
  let timer = null;
  let timeLeft = 60;

  let currentIndex = 0;
  let correct = 0;
  let incorrect = 0;

  let mode = "time";
  let wordLimit = 10;
  let currentText = "";

  /* =========================
     SETTINGS
  ========================= */
  function updateSettings() {
    modeRadios.forEach(radio => {
      if (radio.checked) mode = radio.value;
    });
    wordLimit = parseInt(wordCountSelect.value);
  }

  /* =========================
     TEXT GENERATION
  ========================= */
  function generateWords(count) {
    return Array.from({ length: count }, () =>
      WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    ).join(" ");
  }

  function generateSentence() {
    return generateWords(12);
  }

  /* =========================
     LOAD TEXT
  ========================= */
  function loadText() {
    updateSettings();

    typingText.innerHTML = "";
    currentIndex = 0;
    correct = 0;
    incorrect = 0;

    currentText =
      mode === "words"
        ? generateWords(wordLimit)
        : generateSentence();

    currentText.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("char");
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  /* =========================
     START TEST
  ========================= */
  function startTest() {
    if (isRunning) return;

    isRunning = true;
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
    const accuracy =
      totalTyped === 0 ? 0 : Math.round((correct / totalTyped) * 100);

    const minutes =
      mode === "time" ? 60 / 60 : (Date.now() - startTime) / 60000;

    const wpm =
      minutes > 0 ? Math.round((correct / 5) / minutes) : 0;

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect} / 0 / 0`;
    resultTime.textContent = mode === "time" ? "60s" : "-";

    appContainer.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  let startTime = 0;

  /* =========================
     KEY HANDLER
  ========================= */
  window.addEventListener("keydown", (e) => {
    if (!isRunning) {
      startTime = Date.now();
      startTest();
    }

    const chars = typingText.querySelectorAll(".char");

    // BACKSPACE
    if (e.key === "Backspace") {
      if (currentIndex === 0) return;

      currentIndex--;
      const char = chars[currentIndex];

      if (char.classList.contains("correct")) correct--;
      if (char.classList.contains("incorrect")) incorrect--;

      char.classList.remove("correct", "incorrect");
      chars.forEach(c => c.classList.remove("current"));
      char.classList.add("current");
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    const currentChar = chars[currentIndex];
    if (!currentChar) return;

    if (e.key === currentChar.textContent) {
      currentChar.classList.add("correct");
      correct++;
    } else {
      currentChar.classList.add("incorrect");
      incorrect++;
    }

    currentChar.classList.remove("current");
    currentIndex++;

    // WORDS MODE: END AT LAST CHARACTER
    if (mode === "words" && currentIndex === currentText.length) {
      endTest();
      return;
    }

    // TIME MODE: LOAD NEW SENTENCE
    if (mode === "time" && currentIndex === currentText.length) {
      loadText();
      return;
    }

    if (chars[currentIndex]) {
      chars[currentIndex].classList.add("current");
    }
  });

  /* =========================
     RESTART
  ========================= */
  restartBtn.addEventListener("click", () => {
    clearInterval(timer);
    timeLeft = 60;
    timeDisplay.textContent = timeLeft;
    restartBtn.style.display = "none";
    isRunning = false;
    loadText();
  });

  /* =========================
     SETTINGS CHANGE → RELOAD
  ========================= */
  modeRadios.forEach(r => r.addEventListener("change", loadText));
  wordCountSelect.addEventListener("change", loadText);

  /* =========================
     INIT
  ========================= */
  loadText();
});
