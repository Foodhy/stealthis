const textarea = document.getElementById('piInput');
const limitFill = document.getElementById('limitFill');
const tokenCount = document.getElementById('tokenCount');
const sendBtn = document.getElementById('piSend');
const piSent = document.getElementById('piSent');
const MAX_TOKENS = 4096;

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

textarea.addEventListener('input', () => {
  // Auto-resize
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 260) + 'px';

  const tokens = estimateTokens(textarea.value);
  const pct = Math.min((tokens / MAX_TOKENS) * 100, 100);

  limitFill.style.width = pct + '%';
  limitFill.className = 'pi-limit-fill' + (pct >= 100 ? ' over' : pct >= 75 ? ' warn' : '');

  tokenCount.textContent = `~${tokens} / ${MAX_TOKENS}`;
  tokenCount.className = 'pi-token-count' + (pct >= 100 ? ' over' : pct >= 75 ? ' warn' : '');

  sendBtn.disabled = !textarea.value.trim() || tokens > MAX_TOKENS;
  piSent.hidden = true;
});

function doSend() {
  if (sendBtn.disabled) return;
  piSent.hidden = false;
  textarea.value = '';
  textarea.style.height = 'auto';
  limitFill.style.width = '0%';
  tokenCount.textContent = '0 / 4096';
  sendBtn.disabled = true;
}

sendBtn.addEventListener('click', doSend);

textarea.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    doSend();
  }
});
