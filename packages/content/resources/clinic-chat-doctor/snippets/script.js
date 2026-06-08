// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Elements ─────────────────────────────────────────────────────────────────
const thread = document.getElementById("thread");
const typing = document.getElementById("typing");
const composer = document.getElementById("composer");
const input = document.getElementById("input");

// ── Timestamp formatter ──────────────────────────────────────────────────────
// Illustrative: minutes advance from a fixed seed instead of the real clock.
let clockMinutes = 9 * 60 + 12; // 9:12 AM
function nextTime() {
  clockMinutes += 1;
  const h = Math.floor(clockMinutes / 60) % 24;
  const m = clockMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function scrollToBottom() {
  thread.scrollTop = thread.scrollHeight;
}

// ── Append a message bubble ──────────────────────────────────────────────────
function addMessage(text, dir) {
  const msg = document.createElement("div");
  msg.className = `msg ${dir}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = nextTime();
  if (dir === "out") {
    const tick = document.createElement("span");
    tick.className = "tick";
    tick.setAttribute("aria-label", "Read");
    tick.textContent = "✓✓";
    time.append(" ", tick);
  }

  msg.append(bubble, time);
  thread.insertBefore(msg, typing);
  scrollToBottom();
}

// ── Simulated doctor reply ───────────────────────────────────────────────────
const REPLIES = [
  "Thanks for letting me know. Keep me posted if anything changes.",
  "Good to hear. I'll note that in your chart.",
  "Of course — let me explain that a little more clearly.",
  "Sounds good. We can review this again at your next visit.",
  "I'd recommend booking a follow-up so we can monitor it.",
];
let replyIndex = 0;

function doctorReply(patientText) {
  typing.hidden = false;
  scrollToBottom();

  let reply;
  const t = patientText.toLowerCase();
  if (t.includes("clarify") || t.includes("?")) {
    reply = REPLIES[2];
  } else if (t.includes("book")) {
    reply = REPLIES[3];
  } else {
    reply = REPLIES[replyIndex % REPLIES.length];
    replyIndex += 1;
  }

  setTimeout(() => {
    typing.hidden = true;
    addMessage(reply, "in");
  }, 1600);
}

// ── Send flow ────────────────────────────────────────────────────────────────
function send(text) {
  const value = text.trim();
  if (!value) return;
  addMessage(value, "out");
  input.value = "";
  input.style.height = "auto";
  doctorReply(value);
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  send(input.value);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send(input.value);
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
});

// ── Quick replies ────────────────────────────────────────────────────────────
document.getElementById("quickReplies").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  send(chip.dataset.reply);
});

// ── Attachment ───────────────────────────────────────────────────────────────
document.getElementById("attachBtn").addEventListener("click", () => {
  showToast("Attachments are encrypted before upload.");
});

scrollToBottom();
