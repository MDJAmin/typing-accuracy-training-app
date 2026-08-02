let totalScore = 0;
const STORAGE_SCORE = "keybrStyleScorePersian";

function loadScoreFromStorage() {
  const saved = localStorage.getItem(STORAGE_SCORE);
  if (saved !== null && !isNaN(parseInt(saved))) {
    totalScore = parseInt(saved);
  } else {
    totalScore = 0;
  }
  updateScoreUI();
}

function updateScoreUI() {
  document.getElementById("globalScoreSpan").innerText = totalScore;
}

function addScore(points) {
  totalScore += points;
  localStorage.setItem(STORAGE_SCORE, totalScore);
  updateScoreUI();
}

function resetScore() {
  if (confirm("آیا امتیاز کل را به صفر بازنشانی می‌کنید؟")) {
    totalScore = 0;
    localStorage.setItem(STORAGE_SCORE, totalScore);
    updateScoreUI();
    setStatusMessage("✅ امتیاز ریست شد! ادامه بده و امتیاز بگیر ✅", "#c0e0c0");
  }
}

const challengeList = [
  "The quick brown fox jumps over 123 lazy dogs!",
  "Typing is fun @#$%^&*()_+ special characters!",
  "Hello world! How's your speed? 99% perfect? Yes!",
  "Challenge: $1000 discount? Contact@example.com",
  "Mix of symbols: ~!@#$%^&*()_+{}|:<>? include space",
  "JavaScript rules: let x = 5 + 2; // comment",
  "Lorem ipsum ? dolor sit amet, consectetur ! adipiscing elit.",
  "Race condition: a^2 + b^2 = c^2 100% correct!",
  "Type carefully: backslash \\, forward /, pipe |, underscore _",
  "Email regex: \\w+@[a-z]+\\.com is tricky?",
  "Password: P@ssw0rd!? includes digits & symbols",
  "Aliens? Maybe! But let's type: (a+b)*c = a*c + b*c",
  "The rain in Spain stays mainly in the plain. 007 agent!",
  "Special blend: `~!@#$%^&*()_+-=[]{};:'\",.<>/?",
  "Coding is life: <div>Content</div> 2025 ©",
  "Amazing speed: 90% accuracy + bonus 5 points!",
  "Space   multiple spaces   and challenging    tabs?",
  "Have you tried: alt+ctrl ? No, just type @ and #",
  "Quote test: 'single' \"double\" `backtick`",
  "Final boss: !@#$%^&*()_+{}|:<>?~ every key matters",
];

let currentChallengeString = "";
let currentInputState = ""; //
let completedFlag = false; //
let earnedForCurrent = false;

const challengeZone = document.getElementById("challengeRenderZone");
const ghostInput = document.getElementById("ghostInput");

function getRandomChallengeText() {
  const idx = Math.floor(Math.random() * challengeList.length);
  return challengeList[idx];
}

function renderHighlightedChallenge(inputStr, targetStr) {
  if (!targetStr) return;
  let html = "";
  const inputLen = inputStr.length;
  const targetLen = targetStr.length;

  for (let i = 0; i < targetLen; i++) {
    const targetChar = targetStr[i];
    let charState = "pending"; //
    if (i < inputLen) {
      if (inputStr[i] === targetChar) {
        charState = "correct";
      } else {
        charState = "error";
      }
    } else {
      charState = "pending";
    }

    const isActive = i === inputLen && !completedFlag;
    let spanClass = "";
    if (charState === "correct") spanClass = "char-correct";
    else if (charState === "error") spanClass = "char-error";
    else if (charState === "pending") spanClass = "char-pending";

    let additionalActiveClass = isActive && !completedFlag ? "char-active" : "";
    // کاراکترهای خاص باید به نحو امن نمایش داده شوند
    let displayChar = targetChar;
    if (targetChar === " ") displayChar = "&nbsp;";
    else if (targetChar === "<") displayChar = "&lt;";
    else if (targetChar === ">") displayChar = "&gt;";
    else if (targetChar === "&") displayChar = "&amp;";

    const classAttr = `class="${spanClass} ${additionalActiveClass}"`;
    if (targetChar === " ") {
      html += `<span ${classAttr} style="display:inline-block; min-width: 0.5em;">&nbsp;</span>`;
    } else {
      html += `<span ${classAttr}>${displayChar}</span>`;
    }
  }

  if (inputLen > targetLen) {
    const extraChars = inputStr.slice(targetLen);
    for (let i = 0; i < extraChars.length; i++) {
      html += `<span class="char-error" style="background:#7a2e2e;">${escapeHtml(extraChars[i])}</span>`;
    }
  }
  challengeZone.innerHTML = html;

  const progressElem = document.getElementById("progressCounter");
  if (!completedFlag) {
    const correctCount = countCorrectChars(inputStr, targetStr);
    progressElem.innerText = `✔️ ${correctCount} / ${targetLen} کاراکتر درست`;
  } else {
    progressElem.innerText = `🎉 تکمیل شده! 🎉`;
  }
}

function escapeHtml(ch) {
  if (ch === " ") return "&nbsp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  if (ch === "&") return "&amp;";
  return ch;
}

function countCorrectChars(input, target) {
  let correct = 0;
  const minLen = Math.min(input.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (input[i] === target[i]) correct++;
  }
  return correct;
}

function evaluateCompletion() {
  if (completedFlag) return true;
  const userText = currentInputState;
  const target = currentChallengeString;
  if (userText === target) {
    if (!earnedForCurrent) {
      let points = Math.max(18, Math.floor(target.length / 1.8) + 12);
      addScore(points);
      earnedForCurrent = true;
      completedFlag = true;
      setStatusMessage(`🎉 کامل شد! +${points} امتیاز! چالش بعدی رو شروع کن 🎉`, "#b3ffcf");

      renderHighlightedChallenge(currentInputState, currentChallengeString);
      ghostInput.blur();

      document.getElementById("progressCounter").innerHTML = `✅ چالش کامل شد! ✅`;
      return true;
    } else {
      if (!completedFlag) completedFlag = true;
      renderHighlightedChallenge(currentInputState, currentChallengeString);
      setStatusMessage("🏆 این چالش قبلاً امتیازش رو گرفتی! برو چالش بعدی 🏆", "#dddd99");
      return true;
    }
  }
  return false;
}

function updateTyping(newInputValue) {
  if (completedFlag) {
    ghostInput.value = currentInputState;
    setStatusMessage("این چالش قبلاً کامل شده! دکمه 'چالش جدید' رو بزن.", "#ffb56e");
    return;
  }

  const maxAllowed = currentChallengeString.length + 3;
  let trimmedInput = newInputValue;
  if (trimmedInput.length > maxAllowed) {
    trimmedInput = trimmedInput.slice(0, maxAllowed);
    ghostInput.value = trimmedInput;
  }
  currentInputState = trimmedInput;

  renderHighlightedChallenge(currentInputState, currentChallengeString);

  const finished = evaluateCompletion();
  if (!finished) {
    const corr = countCorrectChars(currentInputState, currentChallengeString);
    setStatusMessage(
      `⌨️ در حال تایپ... ${corr}/${currentChallengeString.length} کاراکتر صحیح. دقت کن!`,
      "#bcbcbc",
    );
  } else {
    ghostInput.value = currentInputState;
  }
}

function setStatusMessage(msg, color = "#b0b0b0") {
  const msgDiv = document.getElementById("liveMessage");
  msgDiv.innerHTML = msg;
  msgDiv.style.color = color;
  setTimeout(() => {
    if (!completedFlag && document.getElementById("liveMessage").innerHTML === msg) {
      if (!completedFlag) msgDiv.style.color = "#aaa";
    }
  }, 2000);
}

function loadNewChallenge() {
  currentChallengeString = getRandomChallengeText();
  currentInputState = "";
  completedFlag = false;
  earnedForCurrent = false;
  ghostInput.value = "";
  ghostInput.focus();
  renderHighlightedChallenge("", currentChallengeString);
  setStatusMessage(
    "✨ چالش جدید! شروع کن به تایپ (حروف و علائم خاص مثل @ # ! ؟) ✨",
    "#bbd9ff",
  );
  document.getElementById("progressCounter").innerHTML =
    "🖊️ 0 / " + currentChallengeString.length + " کاراکتر";
}

function onGhostInput(e) {
  if (completedFlag) {
    ghostInput.value = currentInputState;
    return;
  }
  const rawValue = e.target.value;
  updateTyping(rawValue);
}

function resetGlobalScoreHandler() {
  resetScore();
}

function nextChallengeHandler() {
  loadNewChallenge();

  setTimeout(() => {
    ghostInput.focus();
  }, 20);
}

function focusInputZone() {
  if (!completedFlag) {
    ghostInput.focus();
  } else {
    setStatusMessage("این چالش تمام شده! دکمه چالش جدید رو بزن.", "#f3b3a0");
  }
}

function init() {
  loadScoreFromStorage();

  currentChallengeString = getRandomChallengeText();
  currentInputState = "";
  completedFlag = false;
  earnedForCurrent = false;
  renderHighlightedChallenge("", currentChallengeString);
  ghostInput.value = "";
  ghostInput.focus();

  ghostInput.addEventListener("input", onGhostInput);
  document.getElementById("nextChallengeBtn").addEventListener("click", nextChallengeHandler);
  document.getElementById("resetGlobalBtn").addEventListener("click", resetGlobalScoreHandler);

  const phraseZone = document.getElementById("phraseClickZone");
  phraseZone.addEventListener("click", focusInputZone);

  ghostInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (!completedFlag && document.activeElement !== ghostInput) {
        ghostInput.focus();
      }
    }, 10);
  });

  setStatusMessage(
    "🔵 شبیه keybr: کاراکتر آبی = موقعیت فعلی | سبز = درست | قرمز = اشتباه | تمام کلیدها پشتیبانی می‌شوند",
    "#9cc9ff",
  );
  document.getElementById("progressCounter").innerHTML =
    `0 / ${currentChallengeString.length} کاراکتر`;
}

init();
