/* Dark Mode — Showcase interactions */

// ── Button ripple effect ──────────────────────────────────────
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      transform: translate(-50%, -50%);
      animation: ripple 0.5s ease-out forwards;
      pointer-events: none;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// Inject ripple keyframes once
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to { width: 200px; height: 200px; opacity: 0; }
  }
`;
document.head.appendChild(style);

// ── Input — live validation feedback ─────────────────────────
const input = document.getElementById('demo-input');
const hint = input?.nextElementSibling;

if (input && hint) {
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (val.startsWith('https://github.com/')) {
      hint.textContent = '✓ Valid GitHub URL';
      hint.style.color = '#22C55E';
    } else if (val.length > 0) {
      hint.textContent = 'URL should start with https://github.com/';
      hint.style.color = '#EF4444';
    } else {
      hint.textContent = 'Paste a public GitHub URL to clone.';
      hint.style.color = '';
    }
  });
}

// ── Nav link active state ─────────────────────────────────────
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Card hover elevation ──────────────────────────────────────
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.style.borderColor = '#3A3A3A';
    card.style.transition = 'border-color 0.2s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.borderColor = '';
  });
});
