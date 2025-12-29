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

  /* =========================
     INITIAL STATE
  ========================= */
  resultPage.classList.add("hidden");
  appContainer.classList.remove("hidden");
  restartBtn.style.display = "none";

  /* =========================
     WORD POOL
  ========================= */
  const WORD_POOL = [ "the","be","to","of","and","a",
    "in","that","have","I","it","for","not","on",
    "with","he","as","you","do","at", "this","but",
    "his","by","from","they","we","say","her","she","or",
    "an","will","my","one","all","would","there", "their",
    "is","are","was","were","been","being","had","has","did",
    "done","can","could","should","may","might", "make","know"
    ,"think","take","see","come","want","use","find","give",
    "tell","work","seem","feel","try","leave", "call","ask",
    "need","become","show","hear","play","run","move","live",
    "believe","bring","happen","write", "provide","sit","stand",
    "lose","pay","meet","include","continue","set","learn","change",
    "lead","understand", "watch","follow","stop","create","speak",
    "read","allow","add","spend","grow","open","walk","win","offer",
     "remember","love","consider","appear","buy","wait","serve","die",
     "send","expect","build","stay","fall","cut", "reach","kill","remain",
     "suggest","raise","pass","sell","require","report","decide","pull",
     "return","explain", "good","new","first","last","long","great","little",
     "own","other","old","right","big","high","different", "small","large",
     "next","early","young","important","few","public","bad","same","able",
     "best","better","certain", "clear","major","real","strong","whole","free",
     "true","full","special","easy","hard","early","late","close", "common",
     "simple","serious","personal","local","national","international",
     "political","economic","social", "time","year","people","way","day",
     "man","woman","child","world","school","state","family","student",
     "group", "country","problem","hand","part","place","case","week",
     "company","system","program","question","work","government", "number"
     ,"night","point","home","water","room","mother","area","money","story",
     "fact","month","lot","right", "study","book","eye","job","word","business",
     "issue","side","kind","head","house","service","friend","father", "power",
     "hour","game","line","end","member","law","car","city","community","name"
     ,"president","team","minute", "idea","kid","body","information","back",
     "parent","face","others","level","office","door","health","person", 
     "because","while","where","when","although","before","after","since",
     "until","unless","whether","however", "therefore","meanwhile","instead",
     "otherwise","besides","although","though","yet","still","already","almost",
      "always","never","often","sometimes","usually","quickly","slowly",
      "carefully","easily","clearly","exactly", "about","above","across",
      "against","along","among","around","behind","below","beneath","beside",
      "between", "beyond","during","inside","outside","through","toward","under",
      "within","without" ]; 

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
  function generateSentence() {
    return Array.from({ length: 10 }, () =>
      WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    ).join(" ");
  }

  function loadText() {
    typingText.innerHTML = "";
    currentIndex = 0;
    correct = 0;
    incorrect = 0;

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
     LOAD INITIAL TEXT
  ========================= */
  loadText(); // 👈 THIS IS THE KEY FIX
});
