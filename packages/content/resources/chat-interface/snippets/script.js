const messages = document.getElementById('chatMessages');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

const RESPONSES = [
  "Sure! Here's a brief explanation:\n\nThis pattern is commonly used in React to manage state across multiple components without prop drilling. The key benefit is that it keeps your component tree clean.",
  "Great question. The difference comes down to execution timing:\n\n- `async/await` pauses execution within the function\n- Promises chain callbacks without blocking\n\nFor most cases, `async/await` is more readable.",
  "I'd recommend using a `Map` here instead of a plain object. Maps preserve insertion order and have better performance for frequent additions/deletions.\n\n```js\nconst cache = new Map();\ncache.set('key', value);\n```",
  "The short answer is yes — CSS Grid handles this layout pattern better than Flexbox in this case. Use `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` for a responsive card grid.",
  "There are a few options depending on your stack:\n\n1. **NextAuth.js** — easiest for Next.js apps\n2. **Lucia** — lightweight, framework-agnostic\n3. **Clerk** — hosted, zero-config\n\nFor a quick prototype, I'd start with Clerk.",
];

let responseIndex = 0;
let streaming = false;

function addMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = `msg msg-${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? 'You' : 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (text) bubble.innerHTML = `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function showTyping() {
  const msg = document.createElement('div');
  msg.className = 'msg msg-assistant';
  msg.id = 'typingMsg';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble typing-bubble';
  bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  document.getElementById('typingMsg')?.remove();
}

function streamText(bubble, text, callback) {
  // Convert newlines to <br> and **bold** to <strong>
  const lines = text.split('\n');
  let charIndex = 0;
  let allChars = text.split('');

  bubble.innerHTML = '';
  let p = document.createElement('p');
  bubble.appendChild(p);

  function tick() {
    if (charIndex >= allChars.length) {
      // Final format
      bubble.innerHTML = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .split('\n').map(l => l ? `<p>${l}</p>` : '<br>').join('');
      callback?.();
      return;
    }
    const char = allChars[charIndex++];
    if (char === '\n') {
      p = document.createElement('p');
      bubble.appendChild(p);
    } else {
      p.textContent += char;
    }
    messages.scrollTop = messages.scrollHeight;
    setTimeout(tick, 12 + Math.random() * 6);
  }
  tick();
}

function send() {
  const text = input.value.trim();
  if (!text || streaming) return;

  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
  streaming = true;

  showTyping();

  setTimeout(() => {
    removeTyping();
    const response = RESPONSES[responseIndex % RESPONSES.length];
    responseIndex++;
    const bubble = addMessage('assistant', '');
    streamText(bubble, response, () => {
      streaming = false;
      sendBtn.disabled = false;
    });
  }, 900 + Math.random() * 400);
}

sendBtn.addEventListener('click', send);

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// Auto-resize textarea
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 160) + 'px';
});
