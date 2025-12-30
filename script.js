console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const testConfig = {
    type: "time",        // time | words
    duration: 60,        // seconds
    wordCount: 10,       // words
    difficulty: "easy",
    punctuation: false
  };

  /* =========================
     DOM
  ========================= */
  const app = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");
  const typingText = document.getElementById("typing-text");

  const timerSection = document.getElementById("timer");
  const timeEl = document.getElementById("time");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");
  const retryBtn = document.getElementById("retry-btn");

  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const wordSelect = document.getElementById("word-count");
  const timeSelect = document.getElementById("time-count");
  const difficultySelect = document.getElementById("difficulty");

  const wordCountBox = document.querySelector(".word-count");
  const timeCountBox = document.querySelector(".time-count");

  /* =========================
     WORD POOLS
  ========================= */
  const WORD_POOLS = {
    easy: [
      "the","and","to","of","is","you","that","it","in","for",
      "on","with","as","are","this","but","be","have","not"
    ],
    medium: [
      "people","govern","interest","system","process",
      "require","develop","support","control","public"
    ],
    hard: [
      "phenomenon","ubiquitous","conscientious","meticulous",
      "paradigmatic","juxtaposition","idiosyncratic"
    ]
  };

  /* =========================
     STATE
  ========================= */
  let text = "";
  let index = 0;
  let correct = 0;
  let incorrect = 0;
  let started = false;

  let timer = null;
  let timeLeft = testConfig.duration;
  let startTime = 0;

  /* =========================
     TEXT ENGINE
  ========================= */
  function randomWord() {
    const pool = WORD_POOLS[testConfig.difficulty];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function generateWords(count) {
    return Array.from({ length: count }, randomWord).join(" ");
  }

  function generateText() {
    if (testConfig.type === "words") {
      return generateWords(testConfig.wordCount);
    }
    return generateWords(200);
  }

  function renderText() {
    typingText.innerHTML = "";
    text.split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = "char";
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  /* =========================
     TIMER ENGINE
  ========================= */
  function startTimer() {
    if (testConfig.type !== "time") return;

    timer = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  /* =========================
     TEST CONTROL
  ========================= */
  function resetTest() {
    clearInterval(timer);
    started = false;

    index = 0;
    correct = 0;
    incorrect = 0;

    timeLeft = testConfig.duration;
    timeEl.textContent = timeLeft;

    text = generateText();
    renderText();

    /* UI TOGGLES */
    timerSection.style.display =
      testConfig.type === "time" ? "block" : "none";

    timeCountBox.style.display =
      testConfig.type === "time" ? "block" : "none";

    wordCountBox.style.display =
      testConfig.type === "words" ? "block" : "none";
  }

  function startTest() {
    if (started) return;
    started = true;
    startTime = Date.now();
    startTimer();
  }

  function endTest() {
    clearInterval(timer);
    started = false;

    const total = correct + incorrect;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const minutes = (Date.now() - startTime) / 60000;
    const wpm = minutes ? Math.round((correct / 5) / minutes) : 0;

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect}`;
    resultTime.textContent =
      testConfig.type === "time"
        ? `${testConfig.duration}s`
        : `${Math.round(minutes * 60)}s`;

    app.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     INPUT ENGINE
  ========================= */
  window.addEventListener("keydown", e => {
    if (!started) startTest();

    const chars = typingText.querySelectorAll(".char");

    if (e.key === "Backspace") {
      if (index === 0) return;

      index--;
      chars.forEach(c => c.classList.remove("current"));
      chars[index].classList.add("current");

      /* visual only – mistake still counts */
      chars[index].classList.remove("correct","incorrect");
      return;
    }

    if (e.key.length !== 1) return;

    const current = chars[index];
    if (!current) return;

    if (e.key === current.textContent) {
      current.classList.add("correct");
      correct++;
    } else {
      current.classList.add("incorrect");
      incorrect++;
    }

    current.classList.remove("current");
    index++;

    if (testConfig.type === "words" && index === text.length) {
      endTest();
      return;
    }

    if (chars[index]) chars[index].classList.add("current");
  });

  /* =========================
     UI → CONFIG
  ========================= */
  modeRadios.forEach(r =>
    r.addEventListener("change", () => {
      testConfig.type = r.value;
      resetTest();
    })
  );

  wordSelect.addEventListener("change", () => {
    testConfig.wordCount = +wordSelect.value;
    resetTest();
  });

  timeSelect.addEventListener("change", () => {
    testConfig.duration = +timeSelect.value;
    resetTest();
  });

  difficultySelect.addEventListener("change", () => {
    testConfig.difficulty = difficultySelect.value;
    resetTest();
  });

  retryBtn.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    app.classList.remove("hidden");
    resetTest();
  });

  /* =========================
     INIT
  ========================= */
  resetTest();
});
