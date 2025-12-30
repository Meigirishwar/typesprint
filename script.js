console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const config = {
    mode: "time",                 // time | words
    textType: "words",            // words | punctuation | numbers | mixed
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

  const modeButtons = document.querySelectorAll(".mode-btn");
  const textTypeSelect = document.getElementById("text-type");
  const wordSelect = document.getElementById("word-count");
  const timeSelect = document.getElementById("time-count");
  const difficultySelect = document.getElementById("difficulty");
  const topTimer = document.getElementById("top-timer");

  /* =========================
     WORD POOLS (BIG)
  ========================= */
  /* =========================
   WORD POOLS (VERY BIG)
========================= */

const EASY = [
  "the","and","to","of","is","you","that","it","in","for","on","with","as",
  "are","this","but","be","have","not","by","from","at","or","an","if",
  "we","they","he","she","can","will","do","does","did","make","see","go",
  "say","get","give","find","think","know","work","try","leave","call",
  "feel","put","bring","start","show","hear","play","run","move","live",
  "believe","hold","turn","help","talk","change","write","read","use",
  "learn","ask","need","become","leave","seem","keep","let","begin",
  "walk","watch","follow","stop","create","speak","listen","open","close",
  "win","lose","pay","meet","include","continue","set","stand","grow",
  "remember","wait","stay","fall","cut","reach","kill","remain","suggest",
  "raise","pass","sell","require","report","decide","pull","return","explain",
  "hope","develop","carry","break","receive","agree","support","hit","eat",
  "cover","catch","draw","choose","cause","point","build","share","check"
];

const MEDIUM = [
  "people","system","process","support","develop","control","important",
  "experience","understand","information","technology","community",
  "education","business","creative","analysis","performance","solution",
  "design","strategy","practice","improve","function","structure",
  "management","operation","professional","communication","organization",
  "research","application","environment","relationship","development",
  "efficiency","opportunity","responsibility","decision","collaboration",
  "evaluation","implementation","optimization","innovation","integration",
  "framework","perspective","resource","network","initiative","capacity",
  "interaction","methodology","concept","context","objective","priority",
  "approach","workflow","mechanism","assessment","coordination","adaptation",
  "iteration","alignment","feedback","scalability","consistency","accuracy",
  "reliability","maintainability","usability","documentation","architecture",
  "deployment","testing","debugging","validation","configuration","interface",
  "dependency","automation","monitoring","performance","security","privacy",
  "compliance","optimization","throughput","latency","bandwidth","protocol"
];

 const HARD = [
  "phenomenon","ubiquitous","meticulous","paradigmatic","idiosyncratic",
  "juxtaposition","conscientious","counterintuitive","sustainability",
  "epistemology","cryptographic","multidimensional","interoperability",
  "heterogeneous","transcendental","infrastructure","abstraction",
  "synchronization","quantitative","qualitative","deterministic",
  "nonlinear","stochastic","heuristic","asymptotic","computational",
  "algorithmic","theoretical","optimization","normalization","regularization",
  "concurrency","parallelism","serialization","deserialization",
  "immutability","encapsulation","polymorphism","inheritance","composition",
  "refactoring","idempotent","orthogonality","granularity","cohesion",
  "decoupling","virtualization","containerization","orchestration",
  "observability","telemetry","instrumentation","backpropagation",
  "vectorization","matrix","tensor","eigenvalue","eigenvector",
  "differentiation","integration","manifold","topology","probabilistic",
  "bayesian","frequentist","likelihood","distribution","entropy",
  "optimization","constraint","objective","feasible","infeasible",
  "approximation","convergence","divergence","stability","instability",
  "robustness","resilience","scalability","fault tolerance","redundancy"
];

  const NUMBERS = ["0","1","2","3","4","5","6","7","8","9"];
  const PUNCT = [",",".","?","!",";"];

  /* =========================
     STATE
  ========================= */
  let text = "";
  let index = 0;
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

    if (config.difficulty === "easy") {
      return r < 0.8 ? pick(EASY) : pick(MEDIUM);
    }
    if (config.difficulty === "medium") {
      return r < 0.4 ? pick(EASY) : r < 0.8 ? pick(MEDIUM) : pick(HARD);
    }
    return r < 0.2 ? pick(EASY) : r < 0.5 ? pick(MEDIUM) : pick(HARD);
  }

  function getToken() {
    const r = Math.random();

    const weights = {
      easy:   { w: 0.9, p: 0.1, n: 0 },
      medium: { w: 0.6, p: 0.25, n: 0.15 },
      hard:   { w: 0.4, p: 0.3, n: 0.3 }
    }[config.difficulty];

    if (config.textType === "numbers") {
      return pick(NUMBERS);
    }

    if (config.textType === "punctuation") {
      return r < 0.15 ? pick(PUNCT) : getBaseWord();
    }

    if (config.textType === "mixed") {
      if (r < weights.w) return getBaseWord();
      if (r < weights.w + weights.p) return pick(PUNCT);
      return pick(NUMBERS);
    }

    return getBaseWord(); // words
  }

  function generateSentence(count = 12) {
    let arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(getToken());
    }
    return arr.join(" ");
  }

  function generateText() {
    if (config.mode === "time") {
      return Array.from({ length: 3 }, () => generateSentence()).join("\n");
    }
    return generateSentence(config.wordCount);
  }

  function buildText() {
    typingText.innerHTML = "";
    text.split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.classList.add("char");
      if (i === 0) span.classList.add("current");
      typingText.appendChild(span);
    });
  }

  function setCaret() {
    document.querySelectorAll(".char").forEach(c => c.classList.remove("current"));
    if (typingText.children[index]) {
      typingText.children[index].classList.add("current");
    }
  }

  /* =========================
     TIMER / STOPWATCH
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
        const t = ((Date.now() - startTime) / 1000).toFixed(1);
        topTimer.textContent = `${t}s`;
      }, 100);
    }
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

    timeLeft = config.duration;
    topTimer.textContent = config.mode === "time" ? `${timeLeft}s` : "0.0s";

    text = generateText();
    buildText();

    wordSelect.classList.toggle("hidden", config.mode === "time");
    timeSelect.classList.toggle("hidden", config.mode === "words");
  }

  function startTest() {
    if (started) return;
    started = true;
    startTimer();
  }

  function endTest() {
    clearInterval(timer);

    const total = correct + incorrect;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const minutes = (Date.now() - startTime) / 60000;
    const wpm = minutes ? Math.round((correct / 5) / minutes) : 0;

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + "%";
    charSummary.textContent = `${correct} / ${incorrect}`;
    resultTime.textContent = `${Math.round(minutes * 60)}s`;

    app.classList.add("hidden");
    resultPage.classList.remove("hidden");
  }

  /* =========================
     INPUT
  ========================= */
  window.addEventListener("keydown", e => {
    if (!started) startTest();

    const chars = typingText.children;

    if (e.key === "Backspace") {
      if (index === 0) return;
      index--;
      const prev = chars[index];
      if (prev.classList.contains("correct")) correct--;
      if (prev.classList.contains("incorrect")) incorrect--;
      prev.classList.remove("correct", "incorrect");
      setCaret();
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

    index++;

    if (config.mode === "words" && index >= text.length) {
      endTest();
      return;
    }

    setCaret();
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

  textTypeSelect.onchange = () => {
    config.textType = textTypeSelect.value;
    resetTest();
  };

  wordSelect.onchange = () => {
    config.wordCount = +wordSelect.value;
    resetTest();
  };

  timeSelect.onchange = () => {
    config.duration = +timeSelect.value;
    resetTest();
  };

  difficultySelect.onchange = () => {
    config.difficulty = difficultySelect.value;
    resetTest();
  };

  retryBtn.onclick = () => {
    resultPage.classList.add("hidden");
    app.classList.remove("hidden");
    resetTest();
  };

  /* =========================
     INIT
  ========================= */
  resetTest();
});
