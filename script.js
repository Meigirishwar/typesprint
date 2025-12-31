console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const config = {
    mode: "time",
    textType: "words",
    duration: 60,
    wordCount: 10,
    difficulty: "easy"
  };

  /* =========================
     DOM
  ========================= */
  const app = document.querySelector(".app-container");
  const typingText = document.getElementById("typing-text");
  const resultPage = document.getElementById("result-page");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");

  const retryBtn = document.getElementById("retry-btn");
  const restartBtn = document.getElementById("restart-btn");

  const modeButtons = document.querySelectorAll(".mode-btn");
  const textTypeSelect = document.getElementById("text-type");
  const wordSelect = document.getElementById("word-count");
  const timeSelect = document.getElementById("time-count");
  const difficultySelect = document.getElementById("difficulty");
  const topTimer = document.getElementById("top-timer");

  /* =========================
     WORD POOLS
  ========================= */
  const EASY = ["the","and","to","of","is","you","it","in","for","on","as","are","but","be","not","by","at","or","an","if","we","they","he","she","can","will","do","did","make","see","go","say","get","give","find","think","know"];
  const MEDIUM = ["people","system","process","support","develop","control","important","experience","understand","information","community","education","business","creative","analysis","performance","solution","design"];
  const HARD = ["phenomenon","ubiquitous","meticulous","paradigmatic","idiosyncratic","juxtaposition","conscientious","counterintuitive","sustainability","epistemology","cryptographic","multidimensional"];
  const NUMBERS = ["0","1","2","3","4","5","6","7","8","9"];
  const PUNCT = [",",".","?","!",";"];

  /* =========================
     STATE
  ========================= */
  let charIndex = 0;
  let started = false;
  let correct = 0;
  let incorrect = 0;
  let timer = null;
  let timeLeft = config.duration;
  let startTime = 0;

  /* =========================
     HELPERS
  ========================= */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function getBaseWord() {
    const r = Math.random();
    if (config.difficulty === "easy") return r < 0.85 ? pick(EASY) : pick(MEDIUM);
    if (config.difficulty === "medium") return r < 0.4 ? pick(EASY) : r < 0.8 ? pick(MEDIUM) : pick(HARD);
    return r < 0.3 ? pick(MEDIUM) : pick(HARD);
  }

  function getToken() {
    const r = Math.random();
    if (config.textType === "punctuation") return r < 0.15 ? pick(PUNCT) : getBaseWord();
    if (config.textType === "numbers") return r < 0.15 ? pick(NUMBERS) : getBaseWord();
    if (config.textType === "mixed") {
      if (r < 0.6) return getBaseWord();
      if (r < 0.8) return pick(PUNCT);
      return pick(NUMBERS);
    }
    return getBaseWord();
  }

  function generateText(words = 40) {
    return Array.from({ length: words }, getToken).join(" ");
  }

  function getAllChars() {
    return typingText.querySelectorAll(".char");
  }

  /* =========================
     RENDER
  ========================= */
  function renderText(text) {
    typingText.innerHTML = "";
    text.split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = "char";
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  function setCaret(chars) {
    chars.forEach(c => c.classList.remove("current"));
    if (chars[charIndex]) chars[charIndex].classList.add("current");
  }

  /* =========================
     TIMER
  ========================= */
  function startTimer() {
    startTime = Date.now();

    if (config.mode === "time") {
      timer = setInterval(() => {
        timeLeft--;
        topTimer.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) endTest();
      }, 1000);
    } else {
      timer = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        topTimer.textContent = `${elapsed}s`;
      }, 100);
    }
  }

  /* =========================
     CONTROL
  ========================= */
  function resetTest() {
    clearInterval(timer);
    started = false;
    correct = 0;
    incorrect = 0;
    charIndex = 0;

    if (config.mode === "time") {
      timeLeft = config.duration;
      topTimer.textContent = `${timeLeft}s`;
      renderText(generateText(60));
    } else {
      topTimer.textContent = "0.0s";
      renderText(generateText(config.wordCount));
    }

    wordSelect.classList.toggle("hidden", config.mode === "time");
    timeSelect.classList.toggle("hidden", config.mode === "words");

    typingText.focus();
  }

  function startTest() {
    if (started) return;
    started = true;
    startTimer();
  }

  function endTest() {
  clearInterval(timer);

  const mins = (Date.now() - startTime) / 60000 || 1 / 60;
  const wpm = Math.round((correct / 5) / mins);
  const accuracy = Math.round(
    (correct / Math.max(1, correct + incorrect)) * 100
  );

  // Numbers
  resultWpm.textContent = wpm;
  resultAccuracy.textContent = accuracy + "%";
  charSummary.textContent = `${correct} / ${incorrect}`;
  resultTime.textContent = `${Math.round(mins * 60)}s`;

  // Accuracy bar
  const accuracyFill = document.getElementById("accuracy-fill");
  if (accuracyFill) {
    accuracyFill.style.width = accuracy + "%";
  }

  // Performance badge
  const badge = document.getElementById("performance-badge");
  if (badge) {
    if (wpm >= 80) badge.textContent = "🔥 Pro level typing!";
    else if (wpm >= 50) badge.textContent = "💪 Great speed!";
    else if (wpm >= 30) badge.textContent = "🙂 Good progress!";
    else badge.textContent = "🌱 Keep practicing!";
  }

  // Show result page
  app.classList.add("hidden");
  resultPage.classList.remove("hidden");
}

  /* =========================
     INPUT
  ========================= */
  window.addEventListener("keydown", e => {
    if (!started) startTest();
    if (e.key !== "Backspace" && e.key.length !== 1) return;

    const chars = getAllChars();
    const current = chars[charIndex];
    if (!current) return;

    if (e.key === "Backspace") {
      if (charIndex === 0) return;
      charIndex--;
      chars[charIndex].classList.remove("correct", "incorrect");
      setCaret(chars);
      return;
    }

    if (e.key === current.textContent) {
      current.classList.add("correct");
      correct++;
    } else {
      current.classList.add("incorrect");
      incorrect++;
    }

    charIndex++;
    setCaret(chars);

    if (config.mode === "words" && charIndex >= chars.length) {
      endTest();
    }
  });

  /* =========================
     UI EVENTS
  ========================= */
  modeButtons.forEach(btn => btn.onclick = () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    config.mode = btn.dataset.mode;
    resetTest();
  });

  textTypeSelect.onchange = () => { config.textType = textTypeSelect.value; resetTest(); };
  wordSelect.onchange = () => { config.wordCount = +wordSelect.value; resetTest(); };
  timeSelect.onchange = () => { config.duration = +timeSelect.value; resetTest(); };
  difficultySelect.onchange = () => { config.difficulty = difficultySelect.value; resetTest(); };

  retryBtn.onclick = () => {
    resultPage.classList.add("hidden");
    app.classList.remove("hidden");
    resetTest();
  };

  restartBtn.onclick = resetTest;

  /* =========================
     INIT
  ========================= */
  resetTest();
});
