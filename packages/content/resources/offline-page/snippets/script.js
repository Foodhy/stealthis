const retryBtn = document.getElementById("retryBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
let polling = null;

function setOnline() {
  statusDot.className = "status-dot online";
  statusText.textContent = "Back online! Redirecting…";
  clearInterval(polling);
  setTimeout(() => {
    // In a real PWA: window.location.reload();
    statusText.textContent = "Connected";
  }, 1500);
}

function checkConnection() {
  // Demo: simulate reconnect after a few seconds
  fetch("/", { method: "HEAD", cache: "no-store" })
    .then(() => setOnline())
    .catch(() => {});
}

retryBtn.addEventListener("click", () => {
  retryBtn.classList.add("spinning");
  retryBtn.disabled = true;
  setTimeout(() => {
    retryBtn.classList.remove("spinning");
    retryBtn.disabled = false;
    // In a real app: window.location.reload();
  }, 1500);
});

// Poll every 5 seconds
polling = setInterval(checkConnection, 5000);

window.addEventListener("online", setOnline);
