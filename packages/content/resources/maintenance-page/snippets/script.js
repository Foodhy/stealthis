// Set target date: 2 hours from now for demo purposes
const targetDate = new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000);

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  document.getElementById("countDays").textContent = pad(days);
  document.getElementById("countHours").textContent = pad(hours);
  document.getElementById("countMins").textContent = pad(mins);
  document.getElementById("countSecs").textContent = pad(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Animated progress bar (simulated at 74%)
const fill = document.getElementById("progressFill");
const label = document.getElementById("progressLabel");
const progress = 74;
setTimeout(() => {
  fill.style.width = `${progress}%`;
  label.textContent = `${progress}% complete`;
}, 300);

// Notify form
const form = document.getElementById("notifyForm");
const success = document.getElementById("notifySuccess");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.classList.add("hidden");
  success.classList.add("visible");
});
