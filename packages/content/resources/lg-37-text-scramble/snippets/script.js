(function () {
  "use strict";

  const CHARS = "!<>-_\\/[]{}—=+*^?#________";

  const PHRASES = [
    "Steal This →",
    "Build bold motion.",
    "Design with rhythm.",
    "Ship original work.",
    "Open source. Free.",
  ];

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.queue = [];
      this.frame = 0;
      this.frameReq = null;
      this.resolve = null;
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.textContent;
      const len = Math.max(oldText.length, newText.length);
      this.queue = [];

      for (let i = 0; i < len; i++) {
        const from = oldText[i] || "";
        const to   = newText[i] || "";
        const start  = Math.floor(Math.random() * 18);
        const end    = start + Math.floor(Math.random() * 18) + 4;
        this.queue.push({ from, to, start, end, char: "" });
      }

      cancelAnimationFrame(this.frameReq);
      this.frame = 0;
      return new Promise((resolve) => {
        this.resolve = resolve;
        this.update();
      });
    }

    update() {
      let output = "";
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
        const { from, to, start, end } = this.queue[i];
        let { char } = this.queue[i];

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = CHARS[Math.floor(Math.random() * CHARS.length)];
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;
      this.frame++;

      if (complete === this.queue.length) {
        this.resolve && this.resolve();
      } else {
        this.frameReq = requestAnimationFrame(this.update);
      }
    }
  }

  const el = document.getElementById("scramble");
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fx = new TextScramble(el);

  if (reduced) {
    el.textContent = PHRASES[0];
    return;
  }

  let idx = 0;
  const cycle = () => {
    fx.setText(PHRASES[idx]).then(() => {
      setTimeout(cycle, 2800);
    });
    idx = (idx + 1) % PHRASES.length;
  };

  cycle();

  // Hover to re-scramble current phrase
  el.addEventListener("mouseenter", () => {
    cancelAnimationFrame(fx.frameReq);
    fx.setText(PHRASES[(idx - 1 + PHRASES.length) % PHRASES.length]);
  });
})();
