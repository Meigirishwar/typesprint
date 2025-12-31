console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const config = {
    mode: "time", // time | words
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

  const restartBtn = document.getElementById("restart-btn");

  const modeButtons = document.querySelectorAll(".mode-btn");
  const wordSelect = document.getElementById("word-count");
  const timeSelect = document.getElementById("time-count");
  const topTimer = document.getElementById("top-timer");

  /* =========================
     WORD POOL
  ========================= */
  const WORDS = [
    "the","and","to","of","is","you","it","in","for","on","as","are","but","be",
    "not","by","at","or","an","if","we","they","he","she","can","will","do",
    "make","see","go","say","get","give","find","think","know"
  ];

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
  let wordsTyped = 0;

  // GRAPH DATA
  let graphData = []; // {t, wpm, errors}

  /* =========================
     HELPERS
  ========================= */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function generateLine(words = 12) {
    return Array.from({ length: words }, () => pick(WORDS)).join(" ");
  }

  /* =========================
     TIME MODE (3 LINES)
  ========================= */
  function initTimeMode() {
    typingText.innerHTML = "";
    charIndex = 0;

    for (let i = 0; i < 3; i++) addNewLine(i === 0);
  }

  function addNewLine(isFirst = false) {
    const line = document.createElement("div");
    line.className = "sentence";

    generateLine().split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = "char";
      if (isFirst && i === 0) span.classList.add("current");
      line.appendChild(span);
    });

    typingText.appendChild(line);
  }

  function getCurrentLineChars() {
    const first = typingText.querySelector(".sentence");
    return first ? first.querySelectorAll(".char") : [];
  }

  function slideLine() {
    const first = typingText.querySelector(".sentence");
    if (!first) return;

    first.classList.add("fade-out");

    setTimeout(() => {
      first.remove();
      addNewLine();
      charIndex = 0;
      const chars = getCurrentLineChars();
      if (chars[0]) chars[0].classList.add("current");
    }, 250);
  }

  /* =========================
     WORD MODE
  ========================= */
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

  function setCaret(chars) {
    chars.forEach(c => c.classList.remove("current"));
    if (chars[charIndex]) chars[charIndex].classList.add("current");
  }

  /* =========================
     TIMER + GRAPH TRACKING
  ========================= */
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;

      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const mins = elapsedSec / 60 || 0.01;
      const liveWpm = Math.round((correct / 5) / mins);

      graphData.push({
        t: elapsedSec,
        wpm: liveWpm,
        errors: incorrect
      });

      topTimer.textContent = `${timeLeft}s`;

      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  /* =========================
     GRAPH DRAW
  ========================= */
  function drawGraph() {
    const canvas = document.getElementById("wpm-graph");
    if (!canvas || graphData.length < 2) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;

    ctx.clearRect(0, 0, w, h);

    const maxWpm = Math.max(...graphData.map(d => d.wpm), 10);
    const maxT = graphData[graphData.length - 1].t || 1;

    // GRID
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i <= 4; i++) {
      const y = pad + (i / 4) * (h - pad * 2);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    // LINE
    ctx.strokeStyle = "#9fe0d6";
    ctx.lineWidth = 3;
    ctx.beginPath();

    graphData.forEach((d, i) => {
      const x = pad + (d.t / maxT) * (w - pad * 2);
      const y = h - pad - (d.wpm / maxWpm) * (h - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ERROR DOTS
    ctx.fillStyle = "#ef4444";
    graphData.forEach(d => {
      if (d.errors > 0) {
        const x = pad + (d.t / maxT) * (w - pad * 2);
        const y = h - pad - (d.wpm / maxWpm) * (h - pad * 2);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* =========================
     CONTROL
  ========================= */
  function resetTest() {
    clearInterval(timer);

    started = false;
    charIndex = 0;
    correct = 0;
    incorrect = 0;
    wordsTyped = 0;
    startTime = null;
    graphData = [];

    if (config.mode === "time") {
      timeLeft = config.duration;
      topTimer.textContent = `${timeLeft}s`;
      initTimeMode();
      wordSelect.classList.add("hidden");
      timeSelect.classList.remove("hidden");
    } else {
      topTimer.textContent = `0 / ${config.wordCount} words`;
      initWordsMode();
      timeSelect.classList.add("hidden");
      wordSelect.classList.remove("hidden");
    }

    typingText.focus();
  }

  function startTest() {
    if (started) return;
    started = true;
    startTime = Date.now();
    if (config.mode === "time") startTimer();
  }

  function endTest() {
    clearInterval(timer);

    const elapsedMs = Date.now() - startTime;
    const mins = elapsedMs / 60000 || 0.01;

    resultWpm.textContent = Math.round((correct / 5) / mins);
    resultAccuracy.textContent =
      Math.round((correct / Math.max(1, correct + incorrect)) * 100) + "%";
    charSummary.textContent = `${correct} / ${incorrect}`;
    resultTime.textContent = `${Math.round(elapsedMs / 1000)}s`;

    app.classList.add("hidden");
    resultPage.classList.remove("hidden");

    setTimeout(drawGraph, 100);
  }

  /* =========================
     INPUT (SPACE SAFE)
  ========================= */
  window.addEventListener("keydown", e => {

    if (e.key === " " || e.key === "Backspace") e.preventDefault();

    if (!started) startTest();
    if (e.key !== "Backspace" && e.key.length !== 1) return;

    const chars =
      config.mode === "time"
        ? getCurrentLineChars()
        : typingText.querySelectorAll(".char");

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

    if (config.mode === "words" && e.key === " ") {
      wordsTyped++;
      topTimer.textContent = `${wordsTyped} / ${config.wordCount} words`;
    }

    charIndex++;

    if (config.mode === "time" && charIndex >= chars.length) {
      slideLine();
      return;
    }

    setCaret(chars);

    if (config.mode === "words" && charIndex >= chars.length) endTest();
  });

  /* =========================
     UI EVENTS
  ========================= */
  modeButtons.forEach(btn => {
    btn.onclick = () => {
      modeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      config.mode = btn.dataset.mode;
      resetTest();
    };
  });

  wordSelect.onchange = () => {
    config.wordCount = +wordSelect.value;
    resetTest();
  };

  timeSelect.onchange = () => {
    config.duration = +timeSelect.value;
    resetTest();
  };

  restartBtn.onclick = () => {
    resultPage.classList.add("hidden");
    app.classList.remove("hidden");
    resetTest();
  };

  /* =========================
     INIT
  ========================= */
  resetTest();
});
