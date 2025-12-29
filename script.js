console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     DOM ELEMENTS
  ========================= */
  const appContainer = document.querySelector(".app-container");
  const resultPage = document.getElementById("result-page");

  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const timeDisplay = document.getElementById("time");
  const typingText = document.getElementById("typing-text");

  const resultWpm = document.getElementById("result-wpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const charSummary = document.getElementById("char-summary");
  const resultTime = document.getElementById("result-time");
  const retryBtn = document.getElementById("retry-btn");
  const newTestBtn = document.getElementById("newtest-btn");

  /* =========================
     FORCE INITIAL STATE (FIX)
  ========================= */
  resultPage.classList.add("hidden");
  appContainer.classList.remove("hidden");

  /* =========================
     WORD POOL
  ========================= */
  const WORD_POOL = [
  "the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at",
  "this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there",
  "their","is","are","was","were","been","being","had","has","did","done","can","could","should","may","might",

  "make","know","think","take","see","come","want","use","find","give","tell","work","seem","feel","try","leave",
  "call","ask","need","become","show","hear","play","run","move","live","believe","bring","happen","write",
  "provide","sit","stand","lose","pay","meet","include","continue","set","learn","change","lead","understand",
  "watch","follow","stop","create","speak","read","allow","add","spend","grow","open","walk","win","offer",
  "remember","love","consider","appear","buy","wait","serve","die","send","expect","build","stay","fall","cut",
  "reach","kill","remain","suggest","raise","pass","sell","require","report","decide","pull","return","explain",

  "good","new","first","last","long","great","little","own","other","old","right","big","high","different",
  "small","large","next","early","young","important","few","public","bad","same","able","best","better","certain",
  "clear","major","real","strong","whole","free","true","full","special","easy","hard","early","late","close",
  "common","simple","serious","personal","local","national","international","political","economic","social",

  "time","year","people","way","day","man","woman","child","world","school","state","family","student","group",
  "country","problem","hand","part","place","case","week","company","system","program","question","work","government",
  "number","night","point","home","water","room","mother","area","money","story","fact","month","lot","right",
  "study","book","eye","job","word","business","issue","side","kind","head","house","service","friend","father",
  "power","hour","game","line","end","member","law","car","city","community","name","president","team","minute",
  "idea","kid","body","information","back","parent","face","others","level","office","door","health","person",

  "because","while","where","when","although","before","after","since","until","unless","whether","however",
  "therefore","meanwhile","instead","otherwise","besides","although","though","yet","still","already","almost",
  "always","never","often","sometimes","usually","quickly","slowly","carefully","easily","clearly","exactly",

  "about","above","across","against","along","among","around","behind","below","beneath","beside","between",
  "beyond","during","inside","outside","through","toward","under","within","without"
];


  /* =========================
     STATE
  ========================= */
  let timer = null;
  let timeLeft = 60;
  let isRunning = false;
  let currentIndex = 0;

  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;

  /* =========================
     TEXT GENERATORS
  ========================= */
  function getRandomWord() {
    return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  }

  function generateSentence() {
    const length = Math.floor(Math.random() * 6) + 8;
    return Array.from({ length }, getRandomWord).join(" ");
  }

  /* =========================
     LOAD TEXT
  ========================= */
  function loadText() {
    typingText.innerHTML = "";
    currentIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    extraChars = 0;

    const text = generateSentence();

    text.split("").forEach((char, i) => {
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
    clearInterval(timer);
    loadText();

    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    startBtn.disabled = true;
    restartBtn.disabled = false;

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

    const totalTyped = correctChars + incorrectChars;
    const accuracy = totalTyped === 0 ? 0 : Math.round((correctChars / totalTyped) * 100);
    const timeSpent = 60 - timeLeft;
    const wpm = timeSpent === 0 ? 0 : Math.round((correctChars / 5) / (timeSpent / 60));

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correctChars} / ${incorrectChars} / ${extraChars} / 0`;
    resultTime.textContent = "60s";

    appContainer.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     TYPING ENGINE
  ========================= */
  window.addEventListener("keydown", (e) => {
    if (!isRunning) return;
    e.preventDefault();

    const chars = typingText.querySelectorAll(".char");
    const currentChar = chars[currentIndex];

    if (e.key === "Backspace") {
      if (currentIndex === 0) return;
      currentIndex--;
      chars[currentIndex].classList.remove("correct","incorrect");
      chars.forEach(c => c.classList.remove("current"));
      chars[currentIndex].classList.add("current");
      return;
    }

    if (e.key.length !== 1) return;
    if (!currentChar) { extraChars++; return; }

    if (e.key === currentChar.textContent) {
      currentChar.classList.add("correct");
      correctChars++;
    } else {
      currentChar.classList.add("incorrect");
      incorrectChars++;
    }

    currentChar.classList.remove("current");
    currentIndex++;
    if (chars[currentIndex]) chars[currentIndex].classList.add("current");
  });

  /* =========================
     EVENTS
  ========================= */
  startBtn.addEventListener("click", startTest);

  retryBtn.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    appContainer.classList.remove("hidden");
    startTest();
  });

  newTestBtn.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    appContainer.classList.remove("hidden");
  });
});
