console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const config = {
    mode: "time",                 // time | words
    textType: "words",            // words | punctuation | numbers | mixed
    difficulty: "easy",           // easy | medium | hard
    duration: 60,
    wordCount: 10
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
  const rawWpmEl = document.getElementById("raw-wpm");
  const consistencyEl = document.getElementById("consistency");

  const restartBtn = document.getElementById("restart-btn");
  const topRestartBtn = document.getElementById("top-restart-btn");

  const modeButtons = document.querySelectorAll(".mode-btn");
  const wordSelect = document.getElementById("word-count");
  const timeSelect = document.getElementById("time-count");
  const textTypeSelect = document.getElementById("text-type");
  const difficultySelect = document.getElementById("difficulty");
  const topTimer = document.getElementById("top-timer");

  const canvas = document.getElementById("wpm-graph");
  const ctx = canvas.getContext("2d");

  /* =========================
     WORD POOLS
  ========================= */
  const EASY = ["the","and","to","of","is","you","it","in","for","on","as","be","by","if","we","he","she","do","go"];
  const MEDIUM = ["people","system","process","support","control","important","experience","understand","business"];
  const HARD = ["phenomenon","ubiquitous","paradigmatic","idiosyncratic","juxtaposition","counterintuitive"];

  const NUMBERS = ["0","1","2","3","4","5","6","7","8","9"];
  const PUNCT = [".",",","!","?",";",":"];

  /* =========================
     STATE
  ========================= */
  let charIndex = 0;
  let started = false;
  let correct = 0;
  let incorrect = 0;
  let timer = null;
  let timeLeft = config.duration;
  let startTime = null;
  let wpmHistory = [0];

  /* =========================
     HELPERS
  ========================= */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function pickWord() {
    const r = Math.random();
    if (config.difficulty === "easy") return r < 0.8 ? pick(EASY) : pick(MEDIUM);
    if (config.difficulty === "medium") {
      if (r < 0.25) return pick(EASY);
      if (r < 0.75) return pick(MEDIUM);
      return pick(HARD);
    }
    return r < 0.5 ? pick(HARD) : r < 0.75 ? pick(MEDIUM) : pick(EASY);
  }

 function pickToken() {
  const r = Math.random();

  // how often numbers/punctuation appear
  let symbolChance = 0.15;
  if (config.difficulty === "medium") symbolChance = 0.3;
  if (config.difficulty === "hard") symbolChance = 0.5;

  // NUMBERS MODE = words + numbers
  if (config.textType === "numbers") {
    return r < symbolChance
      ? pick(NUMBERS)
      : pickWord();
  }

  // PUNCTUATION MODE = words + punctuation
  if (config.textType === "punctuation") {
    return r < symbolChance
      ? pick(PUNCT)
      : pickWord();
  }

  // MIXED MODE = words + numbers + punctuation
  if (config.textType === "mixed") {
    if (r < symbolChance) {
      return Math.random() < 0.5
        ? pick(NUMBERS)
        : pick(PUNCT);
    }
    return pickWord();
  }

  // WORDS ONLY
  return pickWord();
}


  function generateLine(words = 12) {
    return Array.from({ length: words }, pickToken).join(" ");
  }

  function setCaret(chars) {
    chars.forEach(c => c.classList.remove("current"));
    chars[charIndex]?.classList.add("current");
  }

  /* =========================
     MODE INIT
  ========================= */
  function initTimeMode() {
    typingText.innerHTML = "";
    charIndex = 0;
    for (let i = 0; i < 3; i++) {
      const line = document.createElement("div");
      line.className = "sentence";
      generateLine().split("").forEach((ch, j) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.className = "char";
        if (i === 0 && j === 0) span.classList.add("current");
        line.appendChild(span);
      });
      typingText.appendChild(line);
    }
  }

  function initWordsMode() {
    typingText.innerHTML = "";
    charIndex = 0;
    generateLine(config.wordCount).split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = "char";
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  function getChars() {
    return config.mode === "time"
      ? typingText.querySelector(".sentence")?.querySelectorAll(".char")
      : typingText.querySelectorAll(".char");
  }

  function slideLine() {
  const lines = typingText.querySelectorAll(".sentence");
  if (lines.length < 3) return;

  // REMOVE current caret from all chars
  typingText.querySelectorAll(".char.current")
    .forEach(c => c.classList.remove("current"));

  // remove first line
  lines[0].remove();

  // add ONE new line at bottom
  const newLine = document.createElement("div");
  newLine.className = "sentence";

  generateLine().split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "char";
    if (i === 0) span.classList.add("current");
    newLine.appendChild(span);
  });

  typingText.appendChild(newLine);
  charIndex = 0;
}


  /* =========================
     CONTROLS VISIBILITY
  ========================= */
  function updateControls() {
    if (config.mode === "time") {
      timeSelect.classList.remove("hidden");
      wordSelect.classList.add("hidden");
      topTimer.textContent = `${config.duration}s`;
    } else {
      wordSelect.classList.remove("hidden");
      timeSelect.classList.add("hidden");
      topTimer.textContent = `0 / ${config.wordCount}`;
    }
  }

  /* =========================
     TIMER
  ========================= */
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      const mins = (Date.now() - startTime) / 60000 || 0.01;
      const rawWpm = ((correct + incorrect) / 5) / mins;
    wpmHistory.push(Math.round(rawWpm));

      topTimer.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  /* =========================
     GRAPH
  ========================= */
  function drawGraph() {
    if (wpmHistory.length < 2) wpmHistory.push(wpmHistory.at(-1));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = 30;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    const max = Math.max(...wpmHistory, 10);

    ctx.strokeStyle = "#9fe0d6";
    ctx.lineWidth = 3;
    ctx.beginPath();

    wpmHistory.forEach((v, i) => {
      const x = pad + (i / (wpmHistory.length - 1)) * w;
      const y = pad + h - (v / max) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  /* =========================
     END TEST
  ========================= */
  function endTest() {
    clearInterval(timer);

    const mins = (Date.now() - startTime) / 60000 || 0.01;
    const wpm = Math.round((correct / 5) / mins);
    const raw = Math.round(((correct + incorrect) / 5) / mins);
    const acc = Math.round((correct / Math.max(1, correct + incorrect)) * 100);

    const avg = wpmHistory.reduce((a,b)=>a+b,0) / wpmHistory.length;
    const variance = wpmHistory.reduce((a,b)=>a + Math.pow(b - avg,2),0) / wpmHistory.length;
    const consistency = Math.max(0, Math.round(100 - Math.sqrt(variance)));

    resultWpm.textContent = wpm;
    rawWpmEl.textContent = raw;
    resultAccuracy.textContent = acc + "%";
    charSummary.textContent = `${correct} / ${incorrect}`;
    consistencyEl.textContent = consistency + "%";
    resultTime.textContent = `${Math.round(mins * 60)}s`;

    app.classList.add("hidden");
    resultPage.classList.remove("hidden");
    setTimeout(drawGraph, 100);
  }

  /* =========================
     INPUT
  ========================= */
 window.addEventListener("keydown", e => {
  if (e.key === " " || e.key === "Backspace") e.preventDefault();

  if (!started) {
    started = true;
    startTime = Date.now();
    if (config.mode === "time") startTimer();
  }

  if (e.key !== "Backspace" && e.key.length !== 1) return;

  const chars = getChars();
  const current = chars?.[charIndex];
  if (!current) return;

  // BACKSPACE
  if (e.key === "Backspace") {
    if (charIndex === 0) return;
    charIndex--;
    chars[charIndex].classList.remove("correct", "incorrect");
    setCaret(chars);
    return;
  }

  // check if LAST character of line
  const isLastChar = charIndex === chars.length - 1;

  // mark correctness
  if (e.key === current.textContent) {
    current.classList.add("correct");
    correct++;
  } else {
    current.classList.add("incorrect");
    incorrect++;
  }

  // 🔥 TIME MODE: slide immediately AFTER last char
  if (config.mode === "time" && isLastChar) {
    slideLine();
    return;
  }

  // normal move
  charIndex++;
  setCaret(chars);

  // WORD MODE end
  // WORD COUNT TRACKING (WORDS MODE)
if (
  config.mode === "words" &&
  e.key === " " &&
  current.textContent === " "
) {
  wordsTyped++;
  topTimer.textContent = `${wordsTyped} / ${config.wordCount}`;

  if (wordsTyped >= config.wordCount) {
    endTest();
    return;
  }
}

  }
);

  /* =========================
     RESET & EVENTS
  ========================= */
  function reset() {
  clearInterval(timer);

  // reset state
  started = false;
  charIndex = 0;
  correct = 0;
  incorrect = 0;
  wordsTyped = 0;
  startTime = null;
  wpmHistory = [0];

  // switch pages
  resultPage.classList.add("hidden");
  app.classList.remove("hidden");

  if (config.mode === "time") {
    timeLeft = config.duration;
    topTimer.textContent = `${timeLeft}s`;
    initTimeMode();
  } else {
    topTimer.textContent = `0 / ${config.wordCount}`;
    initWordsMode();
  }

  typingText.focus();
}


  modeButtons.forEach(btn => btn.onclick = () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    config.mode = btn.dataset.mode;
    reset();
  });

  wordSelect.onchange = e => (config.wordCount = +e.target.value, reset());
  timeSelect.onchange = e => (config.duration = +e.target.value, reset());
  textTypeSelect.onchange = e => (config.textType = e.target.value, reset());
  difficultySelect.onchange = e => (config.difficulty = e.target.value, reset());

  restartBtn.onclick = reset;
  topRestartBtn.onclick = reset;

  updateControls();
  reset();
});
