const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
const statusEl = document.getElementById("rmSysStatus");
const override = document.getElementById("rmOverride");

function updateStatus(reduced) {
  if (reduced) {
    statusEl.textContent = "System preference: Reduced motion ON";
    statusEl.className = "rm-sys-status active";
  } else {
    statusEl.textContent = "System preference: Reduced motion OFF";
    statusEl.className = "rm-sys-status inactive";
  }
}

function applyMotion(reduced) {
  document.body.dataset.reduced = String(reduced);
}

mq.addEventListener("change", (e) => {
  updateStatus(e.matches);
  if (!override.checked) applyMotion(e.matches);
});

updateStatus(mq.matches);
applyMotion(mq.matches);

override.addEventListener("change", () => {
  applyMotion(override.checked || mq.matches);
});

// Parallax on hover
const card = document.getElementById("parallaxCard");
if (card) {
  card.addEventListener("mousemove", (e) => {
    if (document.body.dataset.reduced === "true") return;
    const rect = card.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    card.querySelector(".pc-layer--mid").style.transform = `translate(${cx * 6}px, ${cy * 6}px)`;
    card.querySelector(".pc-layer--front").style.transform =
      `translate(${cx * 12}px, ${cy * 12}px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.querySelectorAll(".pc-layer").forEach((l) => (l.style.transform = ""));
  });
}

// Replay slide/fade animation
document.getElementById("replayBtn").addEventListener("click", () => {
  const reduced = document.body.dataset.reduced === "true";
  const slide = document.getElementById("slideDemo");
  const fade = document.getElementById("fadeFallback");

  if (reduced) {
    fade.querySelectorAll(".fade-item").forEach((el) => {
      el.style.animation = "none";
      requestAnimationFrame(() => {
        el.style.animation = "";
      });
    });
  } else {
    slide.querySelectorAll(".slide-item").forEach((el) => {
      el.style.animation = "none";
      requestAnimationFrame(() => {
        el.style.animation = "";
      });
    });
  }
});
