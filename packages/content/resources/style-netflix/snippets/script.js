/* Netflix Cinematic — Showcase interactions */

// ── Hero card: hover scale + brightness ──────────────────────
const heroCard = document.getElementById('hero-card');

if (heroCard) {
  heroCard.addEventListener('mouseenter', () => {
    heroCard.style.transform = 'scale(1.015)';
    heroCard.style.transition = 'transform 0.3s ease';
    heroCard.style.zIndex = '10';
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
    heroCard.style.zIndex = '';
  });
}

// ── Continue watching card: hover lift ───────────────────────
const continueCard = document.getElementById('continue-card');

if (continueCard) {
  continueCard.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
  continueCard.addEventListener('mouseenter', () => {
    continueCard.style.transform = 'translateY(-2px)';
    continueCard.style.boxShadow = '0 12px 40px rgba(0,0,0,0.7)';
  });
  continueCard.addEventListener('mouseleave', () => {
    continueCard.style.transform = '';
    continueCard.style.boxShadow = '';
  });
}

// ── Progress bar: animate on page load ───────────────────────
window.addEventListener('load', () => {
  const fill = document.querySelector('.progress-fill');
  if (fill) {
    const target = fill.style.width;
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => {
        fill.style.width = target;
      }, 200);
    });
  }
});

// ── Nav: active state toggle ──────────────────────────────────
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Search input: instant feedback ───────────────────────────
const searchInput = document.getElementById('search-input');
const searchHint = searchInput?.nextElementSibling;

if (searchInput && searchHint) {
  const suggestions = [
    'Try "dark sci-fi" or "award-winning"',
    'Searching for "' + '' + '"...',
  ];

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    if (val.length > 0) {
      searchHint.textContent = `Searching for "${val}"...`;
      searchHint.style.color = '#B3B3B3';
    } else {
      searchHint.textContent = suggestions[0];
      searchHint.style.color = '';
    }
  });
}

// ── Button active feedback ────────────────────────────────────
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.style.transition = 'transform 0.08s';
    btn.style.transform = 'scale(0.96)';
    setTimeout(() => { btn.style.transform = ''; }, 100);
  });
});
