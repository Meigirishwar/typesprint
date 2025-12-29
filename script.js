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
     INITIAL UI STATE
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
     START TEST (AUTO)
  ========================= */
  function startTest() {
    if (isRunning) return;

    isRunning = true;
    restartBtn.style.display = "inline-block";

    timer = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  /* =========================
     END TEST
  ========================= */
  function endTest() {
    clearInterval(timer);
    isRunning = false;

    const total = correct + incorrect;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const wpm = Math.round((correct / 5));

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect} / 0 / 0`;
    resultTime.textContent = "60s";

    appContainer.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     KEY HANDLER
  ========================= */
  window.addEventListener("keydown", (e) => {
    if (!isRunning) startTest();

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

    // END TEST WHEN LAST CHARACTER TYPED (WORDS MODE FIX)
    if (currentIndex === currentText.length) {
      endTest();
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
     INIT
  ========================= */
  loadText();
});
