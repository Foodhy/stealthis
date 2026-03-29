(function () {
  "use strict";

  const grid = document.getElementById("grid");
  const btnShuffle = document.getElementById("btn-shuffle");
  const filterBtns = document.querySelectorAll("[data-filter]");

  const items = [
    {
      id: 1,
      label: "Figma",
      emoji: "🎨",
      cat: "design",
      bg: "rgba(168,85,247,0.2)",
      border: "rgba(168,85,247,0.4)",
    },
    {
      id: 2,
      label: "React",
      emoji: "⚛️",
      cat: "dev",
      bg: "rgba(59,130,246,0.2)",
      border: "rgba(59,130,246,0.4)",
    },
    {
      id: 3,
      label: "D3.js",
      emoji: "📊",
      cat: "data",
      bg: "rgba(16,185,129,0.2)",
      border: "rgba(16,185,129,0.4)",
    },
    {
      id: 4,
      label: "Sketch",
      emoji: "💎",
      cat: "design",
      bg: "rgba(236,72,153,0.2)",
      border: "rgba(236,72,153,0.4)",
    },
    {
      id: 5,
      label: "Node",
      emoji: "🟢",
      cat: "dev",
      bg: "rgba(34,197,94,0.2)",
      border: "rgba(34,197,94,0.4)",
    },
    {
      id: 6,
      label: "SQL",
      emoji: "🗄️",
      cat: "data",
      bg: "rgba(245,158,11,0.2)",
      border: "rgba(245,158,11,0.4)",
    },
    {
      id: 7,
      label: "Color",
      emoji: "🌈",
      cat: "design",
      bg: "rgba(239,68,68,0.2)",
      border: "rgba(239,68,68,0.4)",
    },
    {
      id: 8,
      label: "TS",
      emoji: "📘",
      cat: "dev",
      bg: "rgba(14,165,233,0.2)",
      border: "rgba(14,165,233,0.4)",
    },
    {
      id: 9,
      label: "Charts",
      emoji: "📈",
      cat: "data",
      bg: "rgba(168,85,247,0.2)",
      border: "rgba(168,85,247,0.4)",
    },
    {
      id: 10,
      label: "Proto",
      emoji: "🖼️",
      cat: "design",
      bg: "rgba(109,40,217,0.2)",
      border: "rgba(109,40,217,0.4)",
    },
    {
      id: 11,
      label: "Rust",
      emoji: "🦀",
      cat: "dev",
      bg: "rgba(239,68,68,0.2)",
      border: "rgba(239,68,68,0.4)",
    },
    {
      id: 12,
      label: "ML",
      emoji: "🤖",
      cat: "data",
      bg: "rgba(59,130,246,0.2)",
      border: "rgba(59,130,246,0.4)",
    },
  ];

  let currentFilter = "all";
  let order = items.map((_, i) => i);

  function renderGrid() {
    grid.innerHTML = "";
    order.forEach((idx) => {
      const item = items[idx];
      const el = document.createElement("div");
      el.className = "grid-item";
      el.dataset.id = item.id;
      el.dataset.cat = item.cat;
      el.style.background = item.bg;
      el.style.borderColor = item.border;
      if (currentFilter !== "all" && item.cat !== currentFilter) {
        el.classList.add("hidden");
      }
      el.innerHTML = `<div class="item-label"><span class="item-emoji">${item.emoji}</span>${item.label}</div>`;
      grid.appendChild(el);
    });
  }

  // ── FLIP ──
  function flipAnimate(callback) {
    // FIRST: capture positions
    const firstRects = {};
    grid.querySelectorAll(".grid-item:not(.hidden)").forEach((el) => {
      firstRects[el.dataset.id] = el.getBoundingClientRect();
    });

    // Execute the DOM change
    callback();

    // LAST: capture new positions
    const els = grid.querySelectorAll(".grid-item:not(.hidden)");
    els.forEach((el) => {
      const id = el.dataset.id;
      const first = firstRects[id];
      const last = el.getBoundingClientRect();

      if (first) {
        // INVERT
        const dx = first.left - last.left;
        const dy = first.top - last.top;

        if (dx === 0 && dy === 0) return;

        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "none";

        // PLAY
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = "";
            el.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      } else {
        // New element appearing — fade in
        el.style.opacity = "0";
        el.style.transform = "scale(0.8)";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.35s, transform 0.35s cubic-bezier(0.22,1,0.36,1)";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      }
    });
  }

  // ── Shuffle ──
  function shuffle() {
    flipAnimate(() => {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      renderGrid();
    });
  }

  // ── Filter ──
  function filter(cat) {
    flipAnimate(() => {
      currentFilter = cat;
      renderGrid();
    });

    filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === cat);
    });
  }

  // ── Events ──
  btnShuffle.addEventListener("click", shuffle);
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => filter(btn.dataset.filter));
  });

  // Initial render
  renderGrid();
})();
