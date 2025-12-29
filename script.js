console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     DOM ELEMENTS
  ========================= */
  const appContainer = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");
  const typingText = document.getElementById("typing-text");
  const timeDisplay = document.getElementById("time");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");

  /* =========================
     INITIAL STATE
  ========================= */
  resultPage.classList.add("hidden");
  appContainer.classList.remove("hidden");

  /* =========================
     WORD POOL (SMALL FOR NOW)
  ========================= */
  const WORD_POOL = [
    "the","and","to","of","is","you","that","it","in","for",
    "on","with","as","are","this","but","be","have","not"
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

  /* =========================
     HELPERS
  ========================= */
  function randomSentence() {
    const length = 10;
    return Array.from({ length }, () =>
      WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    ).join(" ");
  }

  function loadText() {
    typingText.innerHTML = "";
    currentIndex = 0;
    correct = 0;
    incorrect = 0;

    const text = randomSentence();

    text.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("char");
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  function startTest() {
    if (isRunning) return;

    isRunning = true;
    loadText();

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    timer = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;

      if (timeLeft <= 0) endTest();
    }, 1000);
  }

  function endTest() {
    clearInterval(timer);
    isRunning = false;

    const total = correct + incorrect;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const wpm = Math.round((correct / 5) / 1);

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect} / 0 / 0`;
    resultTime.textContent = "60s";

    appContainer.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     TYPING ENGINE (AUTO START)
  ========================= */
  window.addEventListener("keydown", (e) => {
    if (!isRunning) startTest();

    e.preventDefault();

    const chars = typingText.querySelectorAll(".char");
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

    if (chars[currentIndex]) {
      chars[currentIndex].classList.add("current");
    }
  });
});
