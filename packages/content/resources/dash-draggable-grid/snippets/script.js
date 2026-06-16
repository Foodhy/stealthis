/* Northbeam Analytics — Drag-rearrange widget grid
 * Vanilla JS only. Pointer + HTML5 drag, keyboard reorder, localStorage persistence.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "northbeam.widget.order.v1";

  var grid = document.getElementById("grid");
  var resetBtn = document.getElementById("resetBtn");
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.querySelector(".sidebar");
  var liveRegion = document.getElementById("liveRegion");
  var layoutStatus = document.getElementById("layoutStatus");
  var toastEl = document.getElementById("toast");

  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
  var defaultOrder = cards.map(function (c) { return c.dataset.id; });

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- aria-live announcer ---------- */
  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    // force re-announce even if text repeats
    window.requestAnimationFrame(function () {
      liveRegion.textContent = msg;
    });
  }

  /* ---------- Helper: a card's title for messages ---------- */
  function titleOf(card) {
    var t = card.querySelector(".card__title");
    return t ? t.textContent.trim() : (card.dataset.id || "widget");
  }

  function positionLabel(card) {
    var list = currentCards();
    var idx = list.indexOf(card);
    return (idx + 1) + " of " + list.length;
  }

  function currentCards() {
    return Array.prototype.slice.call(grid.querySelectorAll(".card"));
  }

  /* ---------- Persistence ---------- */
  function saveOrder() {
    var order = currentCards().map(function (c) { return c.dataset.id; });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch (e) { /* storage unavailable — ignore */ }
    updateStatus(order);
  }

  function isDefault(order) {
    if (order.length !== defaultOrder.length) return false;
    for (var i = 0; i < order.length; i++) {
      if (order[i] !== defaultOrder[i]) return false;
    }
    return true;
  }

  function updateStatus(order) {
    if (!layoutStatus) return;
    layoutStatus.textContent = isDefault(order) ? "Default layout" : "Custom layout";
  }

  function applyOrder(order) {
    if (!order || !order.length) return;
    order.forEach(function (id) {
      var card = grid.querySelector('.card[data-id="' + id + '"]');
      if (card) grid.appendChild(card);
    });
    updateStatus(order);
  }

  function loadOrder() {
    var saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) { saved = null; }
    if (Array.isArray(saved) && saved.length) {
      applyOrder(saved);
    } else {
      updateStatus(defaultOrder);
    }
  }

  /* ---------- Pointer / HTML5 drag-and-drop ---------- */
  var dragSrc = null;
  var placeholder = null;

  function makePlaceholder(refCard) {
    var ph = document.createElement("div");
    ph.className = "placeholder";
    if (refCard.classList.contains("card--wide")) ph.classList.add("placeholder--wide");
    ph.setAttribute("aria-hidden", "true");
    return ph;
  }

  grid.addEventListener("dragstart", function (e) {
    var card = e.target.closest && e.target.closest(".card");
    if (!card) return;
    dragSrc = card;
    card.classList.add("is-dragging");
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.dataset.id);
    } catch (err) { /* some browsers restrict — fine */ }

    placeholder = makePlaceholder(card);
    // Insert placeholder where the card is, then hide the card from flow visually.
    grid.insertBefore(placeholder, card.nextSibling);
  });

  grid.addEventListener("dragend", function () {
    if (dragSrc) dragSrc.classList.remove("is-dragging");
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.replaceChild(dragSrc, placeholder);
    }
    cleanupDrag();
    saveOrder();
    if (dragSrc) {
      announce(titleOf(dragSrc) + " dropped, position " + positionLabel(dragSrc));
    }
    dragSrc = null;
  });

  function cleanupDrag() {
    placeholder = null;
  }

  // Determine the card we are hovering and whether to drop before/after it.
  grid.addEventListener("dragover", function (e) {
    if (!dragSrc) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "move"; } catch (err) {}

    var over = e.target.closest && e.target.closest(".card");
    if (!over || over === dragSrc || !placeholder) return;

    var rect = over.getBoundingClientRect();
    // Use both axes to feel natural in a 2D grid.
    var horizontal = rect.width >= rect.height;
    var beforeMid = horizontal
      ? (e.clientX < rect.left + rect.width / 2)
      : (e.clientY < rect.top + rect.height / 2);

    if (beforeMid) {
      grid.insertBefore(placeholder, over);
    } else {
      grid.insertBefore(placeholder, over.nextSibling);
    }
  });

  grid.addEventListener("drop", function (e) {
    if (!dragSrc) return;
    e.preventDefault();
  });

  /* ---------- Keyboard reorder ---------- */
  // Focus a card, use arrows to move. Enter/Space optional "grab" hint.
  grid.addEventListener("keydown", function (e) {
    var card = e.target.closest && e.target.closest(".card");
    if (!card || card !== e.target) return; // only when the card itself is focused

    var keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (keys.indexOf(e.key) === -1) return;

    e.preventDefault();
    var list = currentCards();
    var idx = list.indexOf(card);
    var moved = false;

    if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && idx > 0) {
      grid.insertBefore(card, list[idx - 1]);
      moved = true;
    } else if ((e.key === "ArrowRight" || e.key === "ArrowDown") && idx < list.length - 1) {
      grid.insertBefore(card, list[idx + 1].nextSibling);
      moved = true;
    } else if (e.key === "Home" && idx > 0) {
      grid.insertBefore(card, list[0]);
      moved = true;
    } else if (e.key === "End" && idx < list.length - 1) {
      grid.appendChild(card);
      moved = true;
    }

    if (moved) {
      card.focus();
      saveOrder();
      announce(titleOf(card) + " moved to position " + positionLabel(card));
    } else {
      announce(titleOf(card) + " is at the " + (idx === 0 ? "start" : "end") + " of the grid");
    }
  });

  // Subtle "lifted" affordance while a card is focused.
  grid.addEventListener("focusin", function (e) {
    var card = e.target.closest && e.target.closest(".card");
    if (card && card === e.target) card.classList.add("is-lifted");
  });
  grid.addEventListener("focusout", function (e) {
    var card = e.target.closest && e.target.closest(".card");
    if (card) card.classList.remove("is-lifted");
  });

  /* ---------- Reset layout ---------- */
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      applyOrder(defaultOrder);
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      updateStatus(defaultOrder);
      announce("Layout reset to default");
      toast("Layout reset to default");
    });
  }

  /* ---------- Widget menu buttons ---------- */
  grid.addEventListener("click", function (e) {
    var menu = e.target.closest && e.target.closest(".card__menu");
    if (!menu) return;
    var card = menu.closest(".card");
    toast(titleOf(card) + " · menu (demo)");
  });

  /* ---------- Date-range segmented control ---------- */
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg"));
  // Realistic-but-fictional values keyed by range.
  var DATASETS = {
    "7d":  { users: "11,940",  mrr: "$179.8k", churn: "2.1%", deltas: ["▲ 2.7%", "▲ 0.6%", "▼ 0.2%"] },
    "30d": { users: "48,210",  mrr: "$182.4k", churn: "2.3%", deltas: ["▲ 8.4%", "▲ 3.1%", "▼ 0.4%"] },
    "90d": { users: "131,505", mrr: "$176.2k", churn: "2.8%", deltas: ["▲ 19.2%", "▲ 6.5%", "▲ 0.3%"] }
  };

  function setKpi(name, value) {
    var el = grid.querySelector('[data-kpi="' + name + '"]');
    if (el) el.textContent = value;
  }

  function applyRange(range) {
    var d = DATASETS[range];
    if (!d) return;
    setKpi("users", d.users);
    setKpi("mrr", d.mrr);
    setKpi("churn", d.churn);
    // Update KPI deltas (active users, mrr, churn order).
    var deltaEls = grid.querySelectorAll(".card--kpi .delta");
    for (var i = 0; i < deltaEls.length && i < d.deltas.length; i++) {
      var txt = d.deltas[i];
      deltaEls[i].textContent = txt;
      var up = txt.indexOf("▲") === 0;
      // Churn is "lower is better": an up arrow there is bad.
      var isChurn = i === 2;
      var good = isChurn ? !up : up;
      deltaEls[i].classList.toggle("delta--up", good);
      deltaEls[i].classList.toggle("delta--down", !good);
    }
  }

  segs.forEach(function (seg) {
    seg.addEventListener("click", function () {
      segs.forEach(function (s) {
        s.classList.remove("is-active");
        s.removeAttribute("aria-selected");
      });
      seg.classList.add("is-active");
      seg.setAttribute("aria-selected", "true");
      applyRange(seg.dataset.range);
      toast("Range: last " + seg.dataset.range);
    });
  });

  /* ---------- Live traffic tick ---------- */
  var liveEl = grid.querySelector('[data-live="req"]');
  var liveSpark = document.getElementById("liveSpark");
  var liveVal = 1284;
  var sparkData = [20, 16, 22, 14, 18, 12, 16, 10, 14];

  function fmt(n) { return n.toLocaleString("en-US"); }

  function tickLive() {
    // Random walk within a plausible band.
    var delta = Math.round((Math.random() - 0.45) * 120);
    liveVal = Math.max(820, Math.min(1980, liveVal + delta));
    if (liveEl) liveEl.textContent = fmt(liveVal);

    // Shift sparkline: map value into 4..30 range (inverted Y for SVG).
    sparkData.shift();
    var norm = 30 - Math.round(((liveVal - 820) / (1980 - 820)) * 24);
    sparkData.push(Math.max(4, Math.min(30, norm)));
    if (liveSpark) {
      var pts = sparkData.map(function (y, i) {
        return (i * (120 / (sparkData.length - 1))).toFixed(0) + "," + y;
      });
      liveSpark.setAttribute("points", pts.join(" "));
    }
  }
  var liveTimer = setInterval(tickLive, 2400);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearInterval(liveTimer);
    } else {
      liveTimer = setInterval(tickLive, 2400);
    }
  });

  /* ---------- Off-canvas nav (mobile) ---------- */
  if (navToggle && sidebar) {
    navToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (
        sidebar.classList.contains("is-open") &&
        !sidebar.contains(e.target) &&
        e.target !== navToggle
      ) {
        sidebar.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Init ---------- */
  loadOrder();
})();
