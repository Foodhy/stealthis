/* Purple Space — Showcase interactions */

// ── Orbs: inject CSS animations and add mouse parallax ───────
const orbs = [
  document.getElementById("orb-1"),
  document.getElementById("orb-2"),
  document.getElementById("orb-3"),
];

// Subtle mouse parallax on orbs
document.addEventListener("mousemove", (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  orbs.forEach((orb, i) => {
    if (!orb) return;
    const factor = (i + 1) * 12;
    orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

// ── Profile card: pulsing glow on hover ───────────────────────
const profileCard = document.getElementById("profile-card");

if (profileCard) {
  profileCard.addEventListener("mouseenter", () => {
    profileCard.style.boxShadow = "0 8px 32px rgba(139,92,246,0.2), 0 0 50px rgba(139,92,246,0.18)";
  });
  profileCard.addEventListener("mouseleave", () => {
    profileCard.style.boxShadow = "";
  });
}

// ── Primary button: glow pulse on click ──────────────────────
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.style.transition = "box-shadow 0.08s";
    btn.style.boxShadow = "0 0 50px rgba(139,92,246,0.8), 0 0 15px rgba(167,139,250,0.6)";
    setTimeout(() => {
      btn.style.transition = "box-shadow 0.5s";
      btn.style.boxShadow = "0 0 20px rgba(139,92,246,0.45)";
    }, 120);
  });
});

// ── Nav: active state toggle ──────────────────────────────────
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// ── Input: cosmic glow on focus ───────────────────────────────
const input = document.getElementById("signal-input");
const hint = input?.nextElementSibling;

if (input) {
  input.addEventListener("focus", () => {
    input.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15), 0 0 24px rgba(139,92,246,0.2)";
  });
  input.addEventListener("blur", () => {
    input.style.boxShadow = "";
  });
}

if (input && hint) {
  input.addEventListener("input", () => {
    const val = input.value.trim();
    const freq = parseFloat(val);
    if (val === "") {
      hint.textContent = "Specify a valid deep-space frequency in the range 4.2–8.9 GHz.";
      hint.style.color = "";
    } else if (!isNaN(freq) && freq >= 4.2 && freq <= 8.9) {
      hint.textContent = `✦ Signal lock acquired at ${freq} GHz`;
      hint.style.color = "#A78BFA";
    } else {
      hint.textContent = "⚠ Frequency out of range. Try between 4.2 and 8.9 GHz.";
      hint.style.color = "#F87171";
    }
  });
}

// ── Badge hover: floating effect ─────────────────────────────
document.querySelectorAll(".badge").forEach((badge) => {
  badge.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
  badge.style.cursor = "default";
  badge.addEventListener("mouseenter", () => {
    badge.style.transform = "translateY(-2px)";
    if (badge.classList.contains("badge-gradient")) {
      badge.style.boxShadow = "0 4px 16px rgba(139,92,246,0.4)";
    }
  });
  badge.addEventListener("mouseleave", () => {
    badge.style.transform = "";
    badge.style.boxShadow = "";
  });
});
