const input = document.getElementById('tcInput');
const MODELS = [
  { fillId: 'm1fill', limId: 'm1lim', limit: 128000, label: '128K' },
  { fillId: 'm2fill', limId: 'm2lim', limit: 200000, label: '200K' },
  { fillId: 'm3fill', limId: 'm3lim', limit: 1000000, label: '1M' },
];

function estimateTokens(text) { return Math.ceil(text.length / 4); }
function formatK(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n); }

function update() {
  const text = input.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tokens = estimateTokens(text);

  document.getElementById('tcChars').textContent = chars.toLocaleString();
  document.getElementById('tcWords').textContent = words.toLocaleString();
  document.getElementById('tcTokens').textContent = tokens.toLocaleString();

  MODELS.forEach(({ fillId, limId, limit, label }) => {
    const pct = Math.min((tokens / limit) * 100, 100);
    const fill = document.getElementById(fillId);
    const lim = document.getElementById(limId);
    fill.style.width = pct + '%';
    const state = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
    fill.className = 'tc-model-fill' + (state ? ` ${state}` : '');
    lim.textContent = `${formatK(tokens)} / ${label}`;
    lim.className = 'tc-model-limit' + (state ? ` ${state}` : '');
  });
}

input.addEventListener('input', update);

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";

document.querySelectorAll('.preset-btn[data-len]').forEach(btn => {
  btn.addEventListener('click', () => {
    const len = parseInt(btn.dataset.len);
    let text = '';
    while (text.length < len) text += LOREM;
    input.value = text.slice(0, len);
    update();
  });
});

document.getElementById('clearPreset').addEventListener('click', () => {
  input.value = '';
  update();
});
