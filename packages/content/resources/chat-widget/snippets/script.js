const launcher = document.getElementById("chatLauncher");
const chatWindow = document.getElementById("chatWindow");
const minBtn = document.getElementById("chatMinBtn");
const messages = document.getElementById("chatMessages");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const emojiGrid = document.getElementById("emojiGrid");
const badge = document.getElementById("launcherBadge");

const EMOJIS = [
  "😊",
  "👍",
  "🎉",
  "🔥",
  "❤️",
  "✨",
  "🚀",
  "💡",
  "🤝",
  "😂",
  "🙏",
  "👏",
  "🎁",
  "⚡",
  "💎",
  "🛠️",
];
const BOT_REPLIES = [
  "Thanks for reaching out! How can I help today?",
  "Great question! Let me look into that for you.",
  "Sure thing! I can help with that.",
  "Got it! I'll check that and get back to you.",
  "You're welcome! Is there anything else I can help with?",
];
let opened = false,
  replyIdx = 0;

// Populate emoji grid
EMOJIS.forEach((e) => {
  const btn = document.createElement("button");
  btn.className = "emoji-btn";
  btn.textContent = e;
  btn.type = "button";
  btn.addEventListener("click", () => {
    input.value += e;
    input.focus();
  });
  emojiGrid.appendChild(btn);
});

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage(text, isUser) {
  const msg = document.createElement("div");
  msg.className = "msg " + (isUser ? "msg--user" : "msg--bot");
  msg.innerHTML = `
    ${!isUser ? '<div class="msg-av">SH</div>' : ""}
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <span class="msg-time">${formatTime()}</span>
    </div>
    ${isUser ? '<div class="msg-av" style="background:#4b5563">You</div>' : ""}
  `;
  messages.appendChild(msg);
  scrollToBottom();
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "msg msg--bot";
  el.id = "typing";
  el.innerHTML =
    '<div class="msg-av">SH</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  messages.appendChild(el);
  scrollToBottom();
}
function hideTyping() {
  document.getElementById("typing")?.remove();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  emojiPicker.hidden = true;
  input.value = "";
  input.style.height = "auto";
  addMessage(text, true);

  setTimeout(() => {
    showTyping();
    setTimeout(
      () => {
        hideTyping();
        addMessage(BOT_REPLIES[replyIdx % BOT_REPLIES.length], false);
        replyIdx++;
      },
      800 + Math.random() * 800
    );
  }, 400);
}

sendBtn?.addEventListener("click", sendMessage);
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto resize textarea
input?.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 100) + "px";
});

// Emoji toggle
emojiToggle?.addEventListener("click", () => {
  emojiPicker.hidden = !emojiPicker.hidden;
});

// Launcher
launcher?.addEventListener("click", () => {
  const isOpen = !chatWindow.hidden;
  chatWindow.hidden = isOpen;
  launcher.setAttribute("aria-expanded", String(!isOpen));
  launcher.querySelector(".open-icon").hidden = !isOpen;
  launcher.querySelector(".close-icon").hidden = isOpen;
  badge.hidden = true;
  if (!opened && !isOpen) {
    opened = true;
    setTimeout(
      () => addMessage("Hi! 👋 Welcome to StealthHelp. How can I assist you today?", false),
      300
    );
  }
});
minBtn?.addEventListener("click", () => {
  chatWindow.hidden = true;
  launcher.setAttribute("aria-expanded", "false");
  launcher.querySelector(".open-icon").hidden = false;
  launcher.querySelector(".close-icon").hidden = true;
});
