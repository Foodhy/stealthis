const html = document.documentElement;

function getThemes() {
  return new Set(html.dataset.theme.trim().split(/\s+/).filter(Boolean));
}

function setTheme(themes) {
  html.dataset.theme = [...themes].join(' ') || 'default';
}

function bindToggle(id, themeName) {
  const btn = document.getElementById(id);
  btn.addEventListener('click', () => {
    const themes = getThemes();
    themes.delete('default');
    if (themes.has(themeName)) {
      themes.delete(themeName);
      btn.setAttribute('aria-checked', 'false');
    } else {
      themes.add(themeName);
      btn.setAttribute('aria-checked', 'true');
    }
    if (themes.size === 0) themes.add('default');
    setTheme(themes);
  });
}

bindToggle('contrastToggle', 'high-contrast');
bindToggle('dyslexiaToggle', 'dyslexia');
bindToggle('largeTextToggle', 'large-text');

// Persist to sessionStorage
const stored = sessionStorage.getItem('a11y-theme');
if (stored) {
  const themes = new Set(stored.split(' ').filter(Boolean));
  setTheme(themes);
  themes.forEach(t => {
    const map = { 'high-contrast': 'contrastToggle', 'dyslexia': 'dyslexiaToggle', 'large-text': 'largeTextToggle' };
    if (map[t]) document.getElementById(map[t]).setAttribute('aria-checked', 'true');
  });
}

const observer = new MutationObserver(() => {
  sessionStorage.setItem('a11y-theme', html.dataset.theme);
});
observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
