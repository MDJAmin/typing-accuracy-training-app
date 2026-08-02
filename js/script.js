let totalScore = 0;
const STORAGE_SCORE = "keybrStyleScoreEnglish";

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
  document.getElementById("totalScoreDisplay").innerText = totalScore;
}

function addScore(points) {
  totalScore += points;
  localStorage.setItem(STORAGE_SCORE, totalScore);
  updateScoreUI();
}

function resetScore() {
  if (confirm("Are you sure you want to reset the total score to zero?")) {
    totalScore = 0;
    localStorage.setItem(STORAGE_SCORE, totalScore);
    updateScoreUI();
    setStatusMessage("✅ Score reset! Keep typing and earn points ✅", "#c0e0c0");
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
let currentInputState = "";
let completedFlag = false;
let earnedForCurrent = false;

const challengeZone = document.getElementById("renderZone");
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
    let charState = "pending";
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
    // Display special characters safely
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

  const progressElem = document.getElementById("progressText");
  if (!completedFlag) {
    const correctCount = countCorrectChars(inputStr, targetStr);
    progressElem.innerText = `✔️ ${correctCount} / ${targetLen} correct characters`;
  } else {
    progressElem.innerText = `🎉 Completed! 🎉`;
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
      setStatusMessage(`🎉 Completed! +${points} points! Start the next challenge 🎉`, "#b3ffcf");

      renderHighlightedChallenge(currentInputState, currentChallengeString);
      ghostInput.blur();

      document.getElementById("progressText").innerHTML = `✅ Challenge completed! ✅`;
      return true;
    } else {
      if (!completedFlag) completedFlag = true;
      renderHighlightedChallenge(currentInputState, currentChallengeString);
      setStatusMessage("🏆 You've already earned points for this challenge! Move to the next one 🏆", "#dddd99");
      return true;
    }
  }
  return false;
}

function updateTyping(newInputValue) {
  if (completedFlag) {
    ghostInput.value = currentInputState;
    setStatusMessage("This challenge is already complete! Click 'Next Sentence'.", "#ffb56e");
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
      `⌨️ Typing... ${corr}/${currentChallengeString.length} correct characters. Be accurate!`,
      "#bcbcbc",
    );
  } else {
    ghostInput.value = currentInputState;
  }
}

function setStatusMessage(msg, color = "#b0b0b0") {
  const msgDiv = document.getElementById("statusMsg");
  msgDiv.innerHTML = msg;
  msgDiv.style.color = color;
  setTimeout(() => {
    if (!completedFlag && document.getElementById("statusMsg").innerHTML === msg) {
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
    "✨ New challenge! Start typing (letters and special characters like @ # ! ?) ✨",
    "#bbd9ff",
  );
  document.getElementById("progressText").innerHTML =
    "🖊️ 0 / " + currentChallengeString.length + " characters";
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
    setStatusMessage("This challenge is finished! Click 'Next Sentence'.", "#f3b3a0");
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
  document.getElementById("nextSentenceBtn").addEventListener("click", nextChallengeHandler);
  document.getElementById("resetScoreBtn").addEventListener("click", resetGlobalScoreHandler);

  const phraseZone = document.getElementById("clickToFocus");
  phraseZone.addEventListener("click", focusInputZone);

  ghostInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (!completedFlag && document.activeElement !== ghostInput) {
        ghostInput.focus();
      }
    }, 10);
  });

  setStatusMessage(
    "🔵 Keybr-style: Blue character = current position | Green = correct | Red = incorrect | All keys supported",
    "#9cc9ff",
  );
  document.getElementById("progressText").innerHTML =
    `0 / ${currentChallengeString.length} characters`;
}

init();