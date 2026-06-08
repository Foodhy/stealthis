// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Call timer (counts up mm:ss) ─────────────────────────────────────────────
const timerEl = document.getElementById("timer");
let seconds = 0;
let callLive = true;

function fmt(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
const timerId = setInterval(() => {
  if (!callLive) return;
  seconds += 1;
  timerEl.textContent = fmt(seconds);
}, 1000);

// ── Control toggles ──────────────────────────────────────────────────────────
const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const shareBtn = document.getElementById("shareBtn");
const handBtn = document.getElementById("handBtn");
const svMute = document.getElementById("svMute");
const svCamOff = document.getElementById("svCamOff");

micBtn.addEventListener("click", () => {
  const on = micBtn.dataset.on === "true";
  micBtn.dataset.on = on ? "false" : "true";
  micBtn.classList.toggle("is-off", on);
  micBtn.setAttribute("aria-pressed", String(on));
  micBtn.setAttribute("aria-label", on ? "Unmute microphone" : "Mute microphone");
  micBtn.querySelector(".ctl-lbl").textContent = on ? "Unmute" : "Mute";
  svMute.hidden = !on;
  showToast(on ? "Microphone muted" : "Microphone on");
});

camBtn.addEventListener("click", () => {
  const on = camBtn.dataset.on === "true";
  camBtn.dataset.on = on ? "false" : "true";
  camBtn.classList.toggle("is-off", on);
  camBtn.setAttribute("aria-pressed", String(on));
  camBtn.setAttribute("aria-label", on ? "Turn camera on" : "Turn camera off");
  svCamOff.hidden = !on;
  showToast(on ? "Camera turned off" : "Camera turned on");
});

shareBtn.addEventListener("click", () => {
  const active = shareBtn.classList.toggle("is-active");
  shareBtn.setAttribute("aria-pressed", String(active));
  showToast(active ? "You started sharing your screen" : "You stopped sharing");
});

handBtn.addEventListener("click", () => {
  const active = handBtn.classList.toggle("is-active");
  handBtn.setAttribute("aria-pressed", String(active));
  showToast(active ? "Hand raised ✋" : "Hand lowered");
});

// ── Side tabs ────────────────────────────────────────────────────────────────
const tabs = document.querySelectorAll(".tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.tab;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll(".tabpanel").forEach((p) => {
      const on = p.id === `panel-${name}`;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  });
});

// ── Chat: send + simulated reply with typing indicator ───────────────────────
const thread = document.getElementById("thread");
const typing = document.getElementById("typing");
const composer = document.getElementById("composer");
const chatInput = document.getElementById("chatInput");

const REPLIES = [
  "Thanks, that's helpful.",
  "Understood — let's keep monitoring that.",
  "Good. I'll add a note to your chart.",
  "Sounds reasonable. Any other symptoms?",
];
let replyIdx = 0;

function addMessage(text, dir, who) {
  const msg = document.createElement("div");
  msg.className = `msg ${dir}`;
  msg.innerHTML = `<span class="msg-who">${who}</span><p class="bubble"></p>`;
  msg.querySelector(".bubble").textContent = text;
  thread.appendChild(msg);
  thread.scrollTop = thread.scrollHeight;
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !callLive) return;
  addMessage(text, "out", "You");
  chatInput.value = "";

  typing.hidden = false;
  thread.scrollTop = thread.scrollHeight;
  setTimeout(() => {
    typing.hidden = true;
    addMessage(REPLIES[replyIdx % REPLIES.length], "in", "Dr. Okafor");
    replyIdx += 1;
  }, 1800);
});

// ── End call ─────────────────────────────────────────────────────────────────
const endBtn = document.getElementById("endBtn");
const endedOverlay = document.getElementById("endedOverlay");
const endedDuration = document.getElementById("endedDuration");
const rejoinBtn = document.getElementById("rejoinBtn");

endBtn.addEventListener("click", () => {
  if (!callLive) return;
  callLive = false;
  clearInterval(timerId);
  endedDuration.textContent = `Duration ${fmt(seconds)}`;
  endedOverlay.hidden = false;
  chatInput.disabled = true;
  showToast("Call ended");
});

rejoinBtn.addEventListener("click", () => {
  showToast("Returning to the patient portal…");
});
