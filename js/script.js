let totalScore = 0;
const STORAGE_KEY = "typing_accuracy_score_v2";

function loadTotalScore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null && !isNaN(parseInt(saved))) {
    totalScore = parseInt(saved);
  } else {
    totalScore = 0;
  }
  document.getElementById("totalScoreDisplay").innerText = totalScore;
}

function saveTotalScore() {
  localStorage.setItem(STORAGE_KEY, totalScore);
  document.getElementById("totalScoreDisplay").innerText = totalScore;
}

function addPoints(points) {
  if (points > 0) {
    totalScore += points;
    saveTotalScore();
  }
}

function resetGlobalScore() {
  if (confirm("آیا امتیاز کل را به صفر بازنشانی می‌کنید؟")) {
    totalScore = 0;
    saveTotalScore();
    showTempMessage("امتیاز کل ریست شد!", "#ccc");
  }
}

const sentenceBank = [
  "Hello world! How's your typing speed? 123",
  "The quick brown fox jumps over 99 lazy dogs @#$%",
  "Typing challenge: include ~!@#$%^&*()_+{}|:<>?",
  "Email test: user@example.com & pass: 123!@#",
  "JavaScript is fun! console.log('code'); // comment",
  "Lorem ipsum @ dolor sit ? Amet consectetur !",
  "Password: P@ssw0rd!? includes digits & symbols",
  "Aliens? Maybe! Let's type: (a+b)^2 = a^2 + b^2",
  "Special chars: `~!@#$%^&*()_+-=[]{};:'\",.<>/?",
  "Coding rules: 100% focus + 0% distraction!",
  "Win 50% discount + extra 10% off! Contact?",
  "Mixed Case: ThIs Is A tYpInG cHaLlEnGe witH @ and ?",
  "Numbers & symbols: 3.14, 2.718, 0.001, #hashTag",
  "$currency & percentage 99.9% complete! Great? Yes!",
  "Type carefully: backslash \\, forward slash /, pipe |",
];

let currentSentence = "";
let currentUserInput = "";
let sentenceCompleted = false; //
let errorCountForCurrent = 0; //
let correctCountForCurrent = 0; //
let totalCharsInSentence = 0;

const renderZone = document.getElementById("renderZone");
const ghostInput = document.getElementById("ghostInput");
const statusMsgDiv = document.getElementById("statusMsg");
const liveErrorMsgSpan = document.getElementById("liveErrorMsg");
const progressTextSpan = document.getElementById("progressText");

function showTempMessage(msg, color = "#b8d8fc") {
  const original = statusMsgDiv.innerHTML;
  statusMsgDiv.innerHTML = msg;
  statusMsgDiv.style.color = color;
  setTimeout(() => {
    if (statusMsgDiv.innerHTML === msg) {
      if (!sentenceCompleted) {
        statusMsgDiv.innerHTML =
          "⌨️ تایپ کن... بعد از اتمام جمله، خطاهات رو میبینی و امتیاز میگیری";
        statusMsgDiv.style.color = "#b0b0bc";
      } else {
      }
    }
  }, 2000);
}

function getRandomSentence() {
  const randomIndex = Math.floor(Math.random() * sentenceBank.length);
  return sentenceBank[randomIndex];
}

function computeStats(input, target) {
  let errors = 0;
  let correct = 0;
  const minLen = Math.min(input.length, target.length);
  for (let i = 0; i < minLen; i++) {
    if (input[i] === target[i]) correct++;
    else errors++;
  }

  if (input.length > target.length) {
    errors += input.length - target.length;
  }
  return { errors, correct };
}

function renderWithHighlight(inputStr, targetStr, isCompleted = false) {
  if (!targetStr) return;
  let html = "";
  const inputLen = inputStr.length;
  const targetLen = targetStr.length;

  for (let i = 0; i < targetLen; i++) {
    const targetChar = targetStr[i];
    let state = "pending"; //
    if (i < inputLen) {
      if (inputStr[i] === targetChar) state = "correct";
      else state = "error";
    } else {
      state = "pending";
    }

    const isActive = !isCompleted && i === inputLen;
    let className = "";
    if (state === "correct") className = "char-correct";
    else if (state === "error") className = "char-error";
    else className = "char-pending";

    if (isActive) className += " char-active";

    let displayChar = targetChar;
    if (targetChar === " ") displayChar = "&nbsp;";
    else if (targetChar === "<") displayChar = "&lt;";
    else if (targetChar === ">") displayChar = "&gt;";
    else if (targetChar === "&") displayChar = "&amp;";

    if (targetChar === " ") {
      html += `<span class="${className}" style="display:inline-block; min-width: 0.5em;">&nbsp;</span>`;
    } else {
      html += `<span class="${className}">${displayChar}</span>`;
    }
  }

  if (inputLen > targetLen && !isCompleted) {
    const extraPart = inputStr.slice(targetLen);
    for (let i = 0; i < extraPart.length; i++) {
      html += `<span class="char-error" style="background:#7a2e2e;">${escapeHtmlChar(extraPart[i])}</span>`;
    }
  }
  renderZone.innerHTML = html;
}

function escapeHtmlChar(ch) {
  if (ch === " ") return "&nbsp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  if (ch === "&") return "&amp;";
  return ch;
}

function updateLiveStats() {
  if (sentenceCompleted) return;
  const stats = computeStats(currentUserInput, currentSentence);
  const totalTargetLen = currentSentence.length;
  const typedSoFar = currentUserInput.length;
  liveErrorMsgSpan.innerHTML = `⚠️ خطاهای فعلی: ${stats.errors}  |  ✅ صحیح: ${stats.correct} / ${totalTargetLen}`;
  if (typedSoFar >= totalTargetLen && !sentenceCompleted) {
    if (currentUserInput !== currentSentence) {
      progressTextSpan.innerHTML = `📝 تایپ شده: ${typedSoFar}/${totalTargetLen} کاراکتر | برای تکمیل باید دقیقاً برابر شود`;
    } else {
      progressTextSpan.innerHTML = `🟢 در حال اتمام...`;
    }
  } else {
    progressTextSpan.innerHTML = `⌨️ پیشرفت: ${typedSoFar}/${totalTargetLen} کاراکتر`;
  }
}

function finalizeSentenceAndGiveScore() {
  if (sentenceCompleted) return;

  if (currentUserInput !== currentSentence) {
    return;
  }

  const finalStats = computeStats(currentUserInput, currentSentence);
  const totalErrors = finalStats.errors;
  const totalCorrect = finalStats.correct;
  const totalLength = currentSentence.length;

  let accuracy = totalLength > 0 ? (totalCorrect / totalLength) * 100 : 100;
  accuracy = Math.min(100, Math.max(0, accuracy));

  let basePoints = 15;
  let accuracyBonus = Math.floor(accuracy * 0.45); //
  let penaltyForErrors = Math.floor(totalErrors * 0.8); //

  let finalPoints = basePoints + accuracyBonus - penaltyForErrors;
  finalPoints = Math.max(5, finalPoints); //

  const errorMessage = `📊 جمله کامل شد! ❌ تعداد کل خطاها: ${totalErrors}  |  ✅ کاراکترهای درست: ${totalCorrect}/${totalLength}  |  دقت: ${accuracy.toFixed(1)}%`;
  liveErrorMsgSpan.innerHTML = errorMessage;
  progressTextSpan.innerHTML = `🎉 تکمیل شد! امتیاز این جمله: +${finalPoints} (بر اساس دقت و خطاها) 🎉`;

  addPoints(finalPoints);

  sentenceCompleted = true;

  renderWithHighlight(currentUserInput, currentSentence, true);
  statusMsgDiv.innerHTML = `✅ جمله تمام شد! ${errorMessage} ✅ برای ادامه جمله بعدی رو بزن`;
  statusMsgDiv.style.color = "#c3ffb2";
  ghostInput.blur();

  ghostInput.disabled = true;
}

function handleTyping(e) {
  if (sentenceCompleted) {
    ghostInput.value = currentUserInput;
    return;
  }

  let rawInput = e.target.value;

  const maxAllowed = currentSentence.length + 5;
  if (rawInput.length > maxAllowed) {
    rawInput = rawInput.slice(0, maxAllowed);
    ghostInput.value = rawInput;
  }
  currentUserInput = rawInput;

  renderWithHighlight(currentUserInput, currentSentence, false);

  const liveStats = computeStats(currentUserInput, currentSentence);
  liveErrorMsgSpan.innerHTML = `⚠️ خطاهای فعلی: ${liveStats.errors}  |  ✅ صحیح: ${liveStats.correct} / ${currentSentence.length}`;
  progressTextSpan.innerHTML = `⌨️ پیشرفت: ${currentUserInput.length}/${currentSentence.length} کاراکتر`;

  if (currentUserInput === currentSentence && !sentenceCompleted) {
    finalizeSentenceAndGiveScore();
  } else if (currentUserInput.length > currentSentence.length && !sentenceCompleted) {
    if (currentUserInput !== currentSentence) {
    }
  }
}

function startNewSentence() {
  currentSentence = getRandomSentence();
  currentUserInput = "";
  sentenceCompleted = false;
  errorCountForCurrent = 0;
  correctCountForCurrent = 0;
  totalCharsInSentence = currentSentence.length;

  ghostInput.disabled = false;
  ghostInput.value = "";
  ghostInput.focus();

  renderWithHighlight("", currentSentence, false);

  liveErrorMsgSpan.innerHTML =
    "✨ جمله جدید! تایپ کن، بعد از اتمام خطاها و امتیاز نمایش داده می‌شوند ✨";
  progressTextSpan.innerHTML = `📝 جمله شامل ${totalCharsInSentence} کاراکتر (شامل فاصله و علائم)`;
  statusMsgDiv.innerHTML =
    "🔥 جمله جدید رو کامل تایپ کن، هرچقدر خطا داشته باشی بعد از اتمام بهت نشون داده میشه 🔥";
  statusMsgDiv.style.color = "#c3e2fc";
}

function handleResetScore() {
  resetGlobalScore();
  showTempMessage("امتیاز کل صفر شد، خطاهای جاری روی امتیاز جدید تاثیر دارد", "#ffcf9a");
}

function forceNewSentence() {
  if (
    !sentenceCompleted &&
    currentUserInput !== currentSentence &&
    currentUserInput.length > 0
  ) {
    if (
      confirm("جمله فعلی کامل نشده! با شروع جمله جدید، پیشرفت فعلی از دست می‌رود. ادامه میدی؟")
    ) {
      startNewSentence();
    } else {
      ghostInput.focus();
    }
  } else {
    startNewSentence();
  }
}

function refocusInput() {
  if (!sentenceCompleted) {
    ghostInput.focus();
  } else {
    showTempMessage("این جمله کامل شده، دکمه جمله بعدی رو بزن", "#f5bc70");
  }
}

function init() {
  loadTotalScore();
  currentSentence = getRandomSentence();
  currentUserInput = "";
  sentenceCompleted = false;
  totalCharsInSentence = currentSentence.length;
  renderWithHighlight("", currentSentence, false);
  ghostInput.value = "";
  ghostInput.disabled = false;
  ghostInput.focus();
  liveErrorMsgSpan.innerHTML = "✨ شروع کن! بعد از تکمیل جمله خطاها و امتیاز رو میبینی ✨";
  progressTextSpan.innerHTML = `🎯 جمله شامل ${totalCharsInSentence} کاراکتر ویژه و حروف`;

  ghostInput.addEventListener("input", handleTyping);
  document.getElementById("nextSentenceBtn").addEventListener("click", forceNewSentence);
  document.getElementById("resetScoreBtn").addEventListener("click", handleResetScore);
  document.getElementById("clickToFocus").addEventListener("click", refocusInput);

  ghostInput.addEventListener("blur", () => {
    if (!sentenceCompleted && document.activeElement !== ghostInput) {
      setTimeout(() => ghostInput.focus(), 10);
    }
  });
}

init();
