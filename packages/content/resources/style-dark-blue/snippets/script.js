/* Dark Blue — Showcase interactions */

// ── Card glow on hover ────────────────────────────────────────
const profileCard = document.getElementById('profile-card');

if (profileCard) {
  profileCard.addEventListener('mouseenter', () => {
    profileCard.style.boxShadow =
      '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(56,189,248,0.18)';
  });
  profileCard.addEventListener('mouseleave', () => {
    profileCard.style.boxShadow = '';
  });
}

// ── Button: sky-blue glow pulse on click ──────────────────────
document.querySelectorAll('.btn-primary').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.style.boxShadow = '0 0 30px rgba(56,189,248,0.6)';
    btn.style.transition = 'box-shadow 0.1s';
    setTimeout(() => {
      btn.style.boxShadow = '';
      btn.style.transition = 'box-shadow 0.4s';
    }, 150);
  });
});

// ── Nav link active state ─────────────────────────────────────
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Input: animated glow sweep on focus ───────────────────────
const inputWrap = document.querySelector('.input-wrap');

if (inputWrap) {
  const input = inputWrap.querySelector('.input');
  if (input) {
    input.addEventListener('focus', () => {
      inputWrap.style.boxShadow =
        '0 0 0 3px rgba(56,189,248,0.12), 0 0 20px rgba(56,189,248,0.12)';
    });
    input.addEventListener('blur', () => {
      inputWrap.style.boxShadow = '';
    });
  }
}

// ── Badge hover: subtle lift ──────────────────────────────────
document.querySelectorAll('.badge').forEach((badge) => {
  badge.style.transition = 'transform 0.15s, box-shadow 0.15s';
  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'translateY(-1px)';
    badge.style.boxShadow = '0 4px 12px rgba(56,189,248,0.2)';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.transform = '';
    badge.style.boxShadow = '';
  });
});
