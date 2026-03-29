(function () {
  "use strict";

  /**
   * TextRotate — cycles through words using fade, slide, or typewriter animation.
   * @param {HTMLElement} el  — .text-rotate element
   */
  function TextRotate(el) {
    const words = JSON.parse(el.dataset.words || "[]");
    const mode = el.dataset.mode || "fade";
    const interval = parseInt(el.dataset.interval || "2500", 10);

    if (words.length < 2) return;

    let index = 0;
    let timer = null;
    let typing = false;

    if (mode === "type") {
      initTypewriter();
    } else {
      initSwap();
    }

    /* ── Fade / Slide ──────────────────────────────── */
    function initSwap() {
      // Render first word
      el.innerHTML = `<span class="tr-word">${words[0]}</span>`;
      if (mode === "slide") setSlideHeight();

      timer = setInterval(nextSwap, interval);
    }

    function setSlideHeight() {
      const span = el.querySelector(".tr-word");
      if (span) el.style.height = span.offsetHeight + "px";
    }

    function nextSwap() {
      const next = (index + 1) % words.length;
      const current = el.querySelector(".tr-word:not(.tr-exit)");

      if (!current) return;

      // Exit the current word
      current.classList.add("tr-exit");
      current.addEventListener("animationend", () => current.remove(), { once: true });

      // Enter the next word
      const entering = document.createElement("span");
      entering.className = "tr-word tr-enter";
      entering.textContent = words[next];
      el.appendChild(entering);
      entering.addEventListener("animationend", () => entering.classList.remove("tr-enter"), {
        once: true,
      });

      index = next;
    }

    /* ── Typewriter ────────────────────────────────── */
    function initTypewriter() {
      const textNode = document.createElement("span");
      textNode.className = "tr-text";
      const cursor = document.createElement("span");
      cursor.className = "tr-cursor";
      cursor.setAttribute("aria-hidden", "true");

      el.innerHTML = "";
      el.appendChild(textNode);
      el.appendChild(cursor);

      typeWord(words[0], textNode, () => {
        setTimeout(scheduleNext, interval - words[0].length * 60 - 600);
      });
    }

    function typeWord(word, node, onDone) {
      node.textContent = "";
      typing = true;
      let i = 0;
      const speed = Math.max(40, Math.min(90, Math.floor(interval / (word.length * 3))));

      const t = setInterval(() => {
        node.textContent = word.slice(0, ++i);
        if (i >= word.length) {
          clearInterval(t);
          typing = false;
          onDone && onDone();
        }
      }, speed);
    }

    function eraseWord(node, onDone) {
      typing = true;
      const erase = setInterval(() => {
        const cur = node.textContent;
        if (cur.length === 0) {
          clearInterval(erase);
          typing = false;
          onDone && onDone();
          return;
        }
        node.textContent = cur.slice(0, -1);
      }, 40);
    }

    function scheduleNext() {
      const textNode = el.querySelector(".tr-text");
      if (!textNode) return;

      eraseWord(textNode, () => {
        index = (index + 1) % words.length;
        const word = words[index];

        setTimeout(() => {
          typeWord(textNode, word, () => {
            setTimeout(scheduleNext, interval - word.length * 60 - 600);
          });
        }, 120);
      });
    }
  }

  // Initialise all instances on the page
  document.querySelectorAll(".text-rotate").forEach((el) => new TextRotate(el));
})();
