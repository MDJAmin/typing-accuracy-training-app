let currentScore = 0;
const SCORE_KEY = "typingMasterScorePersian";

function loadScore() {
  const saved = localStorage.getItem(SCORE_KEY);
  if (saved !== null && !isNaN(parseInt(saved))) {
    currentScore = parseInt(saved);
  } else {
    currentScore = 0;
  }
  updateScoreUI();
}

function updateScoreUI() {
  document.getElementById("totalScoreDisplay").innerText = currentScore;
}

function addPoints(points) {
  currentScore += points;
  localStorage.setItem(SCORE_KEY, currentScore);
  updateScoreUI();
}

function resetGlobalScore() {
  if (confirm("آیا امتیاز کل را به صفر بازنشانی می‌کنید؟")) {
    currentScore = 0;
    localStorage.setItem(SCORE_KEY, currentScore);
    updateScoreUI();
    showTemporaryMessage("امتیاز با موفقیت ریست شد!", "#b0b0b0");
  }
}

const challengeBank = [
  "Hello world! How's your typing speed? 123 🚀",
  "The quick brown fox jumps over the lazy dog @#$%^&*()",
  "Typing challenge: include symbols ~!@#$%^&*()_+{}|:<>?",
  "Future dev: $1000 or 1000$? It's a question? 99% sure.",
  "Email test: user@example.com & pass: 123!@#",
  "JavaScript is fun! console.log('Hello'); // comment",
  "Lorem ipsum @ dolor sit ? Amet consectetur ! adipisicing elit.",
  "Password: P@ssw0rd!? شامل کاراکترهای ویژه",
  "The rain in Spain stays mainly in the plain, said 007.",
  "Aliens? Maybe! But let's type: (a+b)^2 = a^2 + 2ab + b^2",
  "Special chars: `~!@#$%^&*()_+-=[]{};:'\",.<>/?\\|",
  "Space   multiple spaces   and tabs\t simulator test.",
  "Coding keyboard use: <div>Hello</div> 2024 ©",
  "Win a prize: 50% discount + extra 10% off! Contact?",
  ": ) Emoji not needed but: ;) :D  ??? and !!!! wow",
  "Qwerty uiop asdfgh jkl; zxcvbnm 1234567890",
  "Mixed case: ThIs Is A tYpInG cHaLlEnGe witH @ and ? yes!",
  "Numbers & symbols: 3.14, 2.718, 0.001, #hashTag",
  "$currency & percentage 99.9% complete! Great? Yes!",
  "Type carefully: backslash \\, forward slash /, pipe |, underscore _",
];

let currentChallengeText = "";
let currentIsCompleted = false;

function getRandomChallenge() {
  const randomIndex = Math.floor(Math.random() * challengeBank.length);
  return challengeBank[randomIndex];
}

function loadNewChallenge() {
  currentChallengeText = getRandomChallenge();
  renderChallengeText(currentChallengeText);

  const inputField = document.getElementById("userInput");
  inputField.value = "";
  inputField.focus();
  currentIsCompleted = false;

  const msgDiv = document.getElementById("statusMsg");
  msgDiv.innerHTML = "✏️ متن جدید رو تایپ کن، بعد از تطابق کامل امتیاز میگیری ✏️";
  msgDiv.style.color = "#bcbcbc";

  const challengeElem = document.getElementById("challengeText");
  challengeElem.style.borderColor = "#404042";
}

function renderChallengeText(text) {
  const container = document.getElementById("challengeText");
  container.innerText = text;
}

function isExactMatch(input, target) {
  return input === target;
}

let alreadyScoredForCurrent = false;

function handleTyping() {
  if (currentIsCompleted) return;

  const userInputElem = document.getElementById("userInput");
  const userText = userInputElem.value;
  const targetText = currentChallengeText;

  const statusMsgDiv = document.getElementById("statusMsg");

  if (isExactMatch(userText, targetText)) {
    if (!alreadyScoredForCurrent) {
      let basePoints = Math.max(15, Math.floor(targetText.length / 2) + 10);

      addPoints(basePoints);
      alreadyScoredForCurrent = true;
      currentIsCompleted = true;
      statusMsgDiv.innerHTML = `✅ عالی! تطابق کامل ✅ +${basePoints} امتیاز! دکمه "چالش جدید" رو بزن یا ادامه بده! ✅`;
      statusMsgDiv.style.color = "#a3e4a3";

      document.getElementById("challengeText").style.borderColor = "#5fad5f";
    } else {
      statusMsgDiv.innerHTML =
        "🏁 قبلاً این چالش رو کامل کردی و امتیاز گرفتی! چالش بعدی رو شروع کن 🏁";
      statusMsgDiv.style.color = "#d4d4aa";
    }
  } else {
    if (alreadyScoredForCurrent) {
      statusMsgDiv.innerHTML = "⚠️ این چالش قبلاً کامل شد! لطفا چالش بعدی رو انتخاب کن ⚠️";
      statusMsgDiv.style.color = "#e3a0a0";
    } else {
      const matchPercent = getMatchPercentage(userText, targetText);
      statusMsgDiv.innerHTML = `⌨️ در حال تایپ... ${matchPercent}% همخوانی. باید دقیقاً برابر باشد (حساس به بزرگ/کوچکی و فاصله و کاراکترها) ⌨️`;
      statusMsgDiv.style.color = "#cbcbcb";
      document.getElementById("challengeText").style.borderColor = "#404042";
    }
  }
}

function getMatchPercentage(input, target) {
  if (target.length === 0) return 100;
  let correctChars = 0;
  const minLen = Math.min(input.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (input[i] === target[i]) correctChars++;
  }
  let percent = (correctChars / target.length) * 100;
  return Math.floor(percent);
}

function nextChallenge() {
  loadNewChallenge();
  alreadyScoredForCurrent = false;
  currentIsCompleted = false;
  const inputField = document.getElementById("userInput");
  inputField.value = "";
  inputField.focus();
  const statusMsgDiv = document.getElementById("statusMsg");
  statusMsgDiv.innerHTML = "🌟 چالش جدید! متن رو تایپ کن و امتیاز بگیر 🌟";
  statusMsgDiv.style.color = "#bcbcbc";
  document.getElementById("challengeText").style.borderColor = "#404042";
}

function showTemporaryMessage(msg, color) {
  const msgDiv = document.getElementById("statusMsg");
  const originalText = msgDiv.innerHTML;
  const originalColor = msgDiv.style.color;
  msgDiv.innerHTML = msg;
  msgDiv.style.color = color || "#dddddd";
  setTimeout(() => {
    if (!currentIsCompleted && !alreadyScoredForCurrent) {
      if (msgDiv.innerHTML.includes("ریست") || msgDiv.innerHTML.includes("امتیاز")) {
        msgDiv.innerHTML = "✨ آماده‌ای؟ متن را تایپ کن و همسان سازی کن ✨";
        msgDiv.style.color = "#bcbcbc";
      } else {
        msgDiv.innerHTML = originalText;
        msgDiv.style.color = originalColor;
      }
    } else if (currentIsCompleted) {
    }
  }, 1800);
}

window.addEventListener("DOMContentLoaded", () => {
  loadScore();
  currentChallengeText = getRandomChallenge();
  renderChallengeText(currentChallengeText);
  const inputElement = document.getElementById("userInput");
  inputElement.value = "";
  inputElement.focus();
  alreadyScoredForCurrent = false;
  currentIsCompleted = false;

  inputElement.addEventListener("input", handleTyping);

  const nextBtn = document.getElementById("nextChallengeBtn");
  nextBtn.addEventListener("click", () => {
    nextChallenge();
  });

  const resetBtn = document.getElementById("resetScoreBtn");
  resetBtn.addEventListener("click", () => {
    resetGlobalScore();

    if (!currentIsCompleted && !alreadyScoredForCurrent) {
    } else if (currentIsCompleted) {
      showTemporaryMessage("امتیاز صفر شد! برای چالش بعدی امتیاز جدید میگیری.", "#f3b3b3");
    }
  });

  inputElement.addEventListener("blur", () => {
    setTimeout(() => inputElement.focus(), 10);
  });

  document.body.addEventListener("click", (e) => {
    if (e.target !== inputElement && !inputElement.contains(e.target)) {
      inputElement.focus();
    }
  });
});
