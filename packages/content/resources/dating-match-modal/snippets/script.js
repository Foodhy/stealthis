(function () {
  "use strict";

  const overlay = document.getElementById("overlay");
  const confetti = document.getElementById("confetti");
  const replayBtn = document.getElementById("replayBtn");
  const sendBtn = document.getElementById("sendBtn");
  const keepBtn = document.getElementById("keepBtn");
  const toastEl = document.getElementById("toast");
  const match = overlay.querySelector(".match");

  const MATCH_NAME = "Maya";
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let toastTimer = null;
  let lastFocus = null;

  /* ---- Toast helper ---- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---- Confetti + heart burst ---- */
  const COLORS = ["#ff5e6c", "#8b5cf6", "#ff8fb1", "#ffd166", "#7c3aed"];

  function burst() {
    if (reduceMotion) return;
    confetti.innerHTML = "";
    const total = 46;
    for (let i = 0; i < total; i++) {
      const isHeart = i % 4 === 0;
      const p = document.createElement("span");
      p.className = "piece" + (isHeart ? " piece--heart" : "");
      p.style.left = Math.random() * 100 + "%";
      const dur = 2.2 + Math.random() * 1.8;
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = Math.random() * 0.4 + "s";
      if (isHeart) {
        p.textContent = "♥";
        p.style.color = COLORS[i % COLORS.length];
        p.style.fontSize = 12 + Math.random() * 14 + "px";
      } else {
        p.style.background = COLORS[i % COLORS.length];
        p.style.height = 10 + Math.random() * 12 + "px";
        p.style.opacity = "0.95";
      }
      confetti.appendChild(p);
    }
    // Clean up finished pieces
    setTimeout(() => (confetti.innerHTML = ""), 4600);
  }

  /* ---- Open / replay the match animation ---- */
  function openMatch() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    // Re-trigger CSS entrance animations by reflow
    overlay.style.animation = "none";
    void overlay.offsetWidth;
    overlay.style.animation = "";
    reflowChildren();
    burst();
    // Focus primary action once avatars have met
    setTimeout(() => sendBtn.focus(), reduceMotion ? 0 : 700);
  }

  function reflowChildren() {
    const animated = match.querySelectorAll(
      ".match__eyebrow, .match__title, .match__desc, .match__actions, " +
        ".avatar--left, .avatar--right, .heart-badge"
    );
    animated.forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  function closeMatch() {
    overlay.hidden = true;
    confetti.innerHTML = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    } else {
      replayBtn.focus();
    }
  }

  /* ---- Focus trap while modal is open ---- */
  function focusables() {
    return Array.from(
      overlay.querySelectorAll("button:not([disabled])")
    ).filter((el) => el.offsetParent !== null);
  }

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMatch();
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Backdrop click closes (but not clicks on the card itself)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMatch();
  });

  /* ---- Wire up controls ---- */
  replayBtn.addEventListener("click", openMatch);

  sendBtn.addEventListener("click", () => {
    closeMatch();
    toast("Chat opened with " + MATCH_NAME + " 💬");
  });

  keepBtn.addEventListener("click", () => {
    closeMatch();
    toast("Back to discovering ✨");
  });

  /* ---- Auto-play once on load for the demo ---- */
  window.addEventListener("load", () => {
    setTimeout(openMatch, 450);
  });
})();
