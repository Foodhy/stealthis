(function () {
  "use strict";

  var PLAN = 240;
  var state = {
    remaining: 172,
    used: 68,
    bundle: { credits: 100, price: 72 },
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---- Toast helper ---- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---- Animated circular meter ---- */
  var CIRC = 2 * Math.PI * 84; // r=84
  var fillEl = $("#meterFill");
  var numEl = $("#meterNum");
  var usedValEl = $("#usedVal");
  var remainValEl = $("#remainVal");
  var meterImg = $(".meter");

  function setMeter(remaining, animate) {
    state.remaining = remaining;
    state.used = PLAN - remaining;
    var pct = Math.max(0, Math.min(1, remaining / PLAN));
    var offset = CIRC * (1 - pct);

    // color shifts toward warning/danger as balance drops
    var color = pct > 0.4 ? "var(--amber)" : pct > 0.15 ? "var(--warn)" : "var(--danger)";
    fillEl.style.stroke = color;

    if (animate) {
      // force reflow so the dash transition re-runs
      fillEl.style.strokeDashoffset = CIRC;
      void fillEl.getBoundingClientRect();
    }
    fillEl.style.strokeDashoffset = offset;

    usedValEl.textContent = state.used;
    remainValEl.textContent = remaining;
    if (meterImg) meterImg.setAttribute("aria-label", remaining + " of " + PLAN + " monthly credits remaining");
    animateNumber(remaining);
  }

  function animateNumber(target) {
    var start = parseInt(numEl.textContent, 10) || 0;
    var dur = 1100, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      numEl.textContent = Math.round(start + (target - start) * eased);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Usage history ---- */
  var history = [
    { type: "spend", icon: "▤", title: "Boardroom — 2 hrs", sub: "Yesterday · 14:00", amt: -8 },
    { type: "topup", icon: "＋", title: "Top-up · 100 credits", sub: "Jun 14 · Card •••• 4821", amt: 100 },
    { type: "spend", icon: "⎙", title: "Color print batch", sub: "Jun 13 · 22 pages", amt: -11 },
    { type: "spend", icon: "☻", title: "Guest pass — D. Vance", sub: "Jun 12 · Front desk", amt: -6 },
    { type: "spend", icon: "▤", title: "Focus pod — 90 min", sub: "Jun 10 · 09:30", amt: -5 },
    { type: "topup", icon: "＋", title: "Monthly plan reset", sub: "Jun 1 · Flex Studio", amt: 240 },
    { type: "spend", icon: "▦", title: "Locker hold — overnight", sub: "May 30 · 16 hrs", amt: -4 },
  ];

  var listEl = $("#histList");
  function renderHistory(filter) {
    listEl.innerHTML = "";
    history
      .filter(function (h) { return filter === "all" || filter === h.type; })
      .forEach(function (h) {
        var li = document.createElement("li");
        li.className = "hist-row";
        var pos = h.amt > 0;
        li.innerHTML =
          '<span class="hist-ico' + (pos ? " is-topup" : "") + '" aria-hidden="true">' + h.icon + "</span>" +
          '<div class="hist-main">' +
            '<p class="hist-title">' + h.title + "</p>" +
            '<p class="hist-sub">' + h.sub + "</p>" +
          "</div>" +
          '<span class="hist-amt ' + (pos ? "pos" : "neg") + '">' + (pos ? "+" : "") + h.amt + "</span>";
        listEl.appendChild(li);
      });
    if (!listEl.children.length) {
      var empty = document.createElement("li");
      empty.className = "hist-row";
      empty.innerHTML = '<div class="hist-main"><p class="hist-sub">No entries for this filter.</p></div>';
      listEl.appendChild(empty);
    }
  }

  $$(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderHistory(btn.dataset.filter);
    });
  });

  /* ---- Top-up modal ---- */
  var modal = $("#topupModal");
  var confirmBtn = $("#confirmTopup");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    var sel = $(".bundle.is-sel", modal) || $(".bundle", modal);
    if (sel) sel.focus();
    document.addEventListener("keydown", onKeydown);
  }
  function closeModal() {
    modal.hidden = true;
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus) lastFocus.focus();
  }
  function onKeydown(e) { if (e.key === "Escape") closeModal(); }

  $("#topupBtn").addEventListener("click", openModal);
  $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeModal); });

  function updateConfirm() {
    confirmBtn.textContent = "Add " + state.bundle.credits + " credits · $" + state.bundle.price;
  }

  $$(".bundle", modal).forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".bundle", modal).forEach(function (o) {
        o.classList.remove("is-sel");
        o.setAttribute("aria-checked", "false");
      });
      b.classList.add("is-sel");
      b.setAttribute("aria-checked", "true");
      state.bundle = { credits: parseInt(b.dataset.credits, 10), price: parseInt(b.dataset.price, 10) };
      updateConfirm();
    });
  });

  confirmBtn.addEventListener("click", function () {
    var added = state.bundle.credits;
    var capped = Math.min(PLAN, state.remaining + added);
    closeModal();

    history.unshift({
      type: "topup",
      icon: "＋",
      title: "Top-up · " + added + " credits",
      sub: "Just now · Card •••• 4821",
      amt: added,
    });
    var active = $(".seg-btn.is-active");
    renderHistory(active ? active.dataset.filter : "all");

    setMeter(capped, true);
    toast("Added " + added + " credits — balance " + capped + "/" + PLAN);
  });

  /* ---- Init ---- */
  updateConfirm();
  renderHistory("all");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { setMeter(state.remaining, true); });
  });
})();
