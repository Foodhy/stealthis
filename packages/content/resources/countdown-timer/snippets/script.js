let countdownInterval;

function startCountdown() {
  const targetDateInput = document.getElementById("target-date");
  const targetTime = new Date(targetDateInput.value).getTime();

  if (isNaN(targetTime)) {
    updateStatus("Please select a valid date and time.");
    return;
  }

  if (targetTime <= new Date().getTime()) {
    updateStatus("Target date must be in the future.");
    return;
  }

  // Clear existing interval if any
  if (countdownInterval) clearInterval(countdownInterval);

  updateStatus("Countdown active...");

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      updateDisplay(0, 0, 0, 0);
      updateStatus("Countdown finished!");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateDisplay(days, hours, minutes, seconds);
  }, 1000);
}

function updateDisplay(days, hours, minutes, seconds) {
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

function updateStatus(msg) {
  const statusEl = document.getElementById("countdown-status");
  if (statusEl) statusEl.textContent = msg;
}

// Event Listeners
const startBtn = document.getElementById("start-timer");
if (startBtn) {
  startBtn.addEventListener("click", startCountdown);
}

// Set default target to 24 hours from now
const defaultTarget = new Date();
defaultTarget.setHours(defaultTarget.getHours() + 24);
const targetInput = document.getElementById("target-date");
if (targetInput) {
  // Format for datetime-local: YYYY-MM-DDTHH:MM
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(defaultTarget.getTime() - tzoffset).toISOString().slice(0, 16);
  targetInput.value = localISOTime;
}
