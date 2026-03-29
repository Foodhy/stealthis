let swStartTime;
let swElapsedTime = 0;
let swTimerInterval;
let swLaps = [];

const swMinutesEl = document.getElementById("sw-minutes");
const swSecondsEl = document.getElementById("sw-seconds");
const swMsEl = document.getElementById("sw-ms");
const swStartBtn = document.getElementById("sw-start");
const swLapBtn = document.getElementById("sw-lap");
const swResetBtn = document.getElementById("sw-reset");
const swLapsList = document.getElementById("sw-laps-list");

function timeToString(time) {
  let diffInMin = time / (1000 * 60);
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 1000;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(3, "0");

  return `${formattedMM}:${formattedSS}.${formattedMS}`;
}

function print(txt) {
  const parts = txt.split(/[:\.]/);
  if (swMinutesEl) swMinutesEl.innerHTML = parts[0];
  if (swSecondsEl) swSecondsEl.innerHTML = parts[1];
  if (swMsEl) swMsEl.innerHTML = parts[2];
}

function startStopwatch() {
  swStartTime = Date.now() - swElapsedTime;
  swTimerInterval = setInterval(function printTime() {
    swElapsedTime = Date.now() - swStartTime;
    print(timeToString(swElapsedTime));
  }, 10);

  showButton("STOP");
  swLapBtn.disabled = false;
}

function stopStopwatch() {
  clearInterval(swTimerInterval);
  showButton("START");
}

function resetStopwatch() {
  clearInterval(swTimerInterval);
  print("00:00.000");
  swElapsedTime = 0;
  swLaps = [];
  swLapsList.innerHTML = "";
  showButton("START");
  swLapBtn.disabled = true;
}

function recordLap() {
  const lapTime = timeToString(swElapsedTime);
  swLaps.unshift(lapTime);

  const li = document.createElement("li");
  li.innerHTML = `
    <span class="lap-num">Lap ${swLaps.length}</span>
    <span class="lap-time">${lapTime}</span>
  `;
  swLapsList.prepend(li);
}

function showButton(buttonKey) {
  if (buttonKey === "STOP") {
    swStartBtn.innerHTML = "Stop";
    swStartBtn.className = "sw-btn stop";
  } else {
    swStartBtn.innerHTML = "Start";
    swStartBtn.className = "sw-btn start";
  }
}

// Event Listeners
if (swStartBtn) {
  swStartBtn.addEventListener("click", function () {
    if (swStartBtn.innerHTML === "Start") {
      startStopwatch();
    } else {
      stopStopwatch();
    }
  });
}

if (swLapBtn) {
  swLapBtn.addEventListener("click", recordLap);
}

if (swResetBtn) {
  swResetBtn.addEventListener("click", resetStopwatch);
}
