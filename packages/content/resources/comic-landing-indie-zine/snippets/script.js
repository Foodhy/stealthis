/* SMUDGE & STAPLE — indie zine / webcomic landing
   Vanilla JS only. Intentionally scrappy & charming. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2400);
  }

  /* ---------- slight random rotation/jitter on cards ---------- */
  function jitter() {
    if (reduceMotion) return;
    var nodes = document.querySelectorAll("[data-jitter]");
    nodes.forEach(function (el) {
      var deg = (Math.random() * 3 - 1.5).toFixed(2); // -1.5°..1.5°
      var tx = (Math.random() * 4 - 2).toFixed(1);
      el.style.transform = "rotate(" + deg + "deg) translate(" + tx + "px, 0)";
    });
  }

  /* ---------- latest strips data + render ---------- */
  var strips = [
    { no: 207, title: "the dishwasher is haunted (again)", sfx: "CLUNK", isNew: true },
    { no: 206, title: "Mop unionizes the dust bunnies", sfx: "POOF", isNew: true },
    { no: 205, title: "Bracket refuses to fold the linen ghosts", sfx: "FWUMP", isNew: false },
    { no: 204, title: "a haunting, but make it tidy", sfx: "SWIP", isNew: false },
    { no: 203, title: "the fridge keeps a list of our regrets", sfx: "HMMM", isNew: false },
    { no: 202, title: "spectral laundry day, part two", sfx: "DRIP", isNew: false }
  ];

  var grid = document.getElementById("stripGrid");

  function buildStrip(s) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "strip";
    card.dataset.new = s.isNew ? "1" : "0";
    card.setAttribute(
      "aria-label",
      "Read strip number " + s.no + ": " + s.title
    );

    var html =
      '<span class="strip__tape" aria-hidden="true"></span>' +
      '<div class="strip__art"><span class="sfx">' + s.sfx + "</span></div>" +
      '<p class="strip__no"><span>#' + s.no + "</span>" +
      (s.isNew ? '<span class="strip__badge">new</span>' : "") +
      "</p>" +
      '<h3 class="strip__title">' + s.title + "</h3>";
    card.innerHTML = html;

    // scrappy resting tilt
    if (!reduceMotion) {
      var deg = (Math.random() * 4 - 2).toFixed(2);
      card.style.transform = "rotate(" + deg + "deg)";
    }

    card.addEventListener("click", function () {
      toast('opening #' + s.no + ' — "' + s.title + '" …');
    });
    return card;
  }

  if (grid) {
    strips.forEach(function (s) {
      grid.appendChild(buildStrip(s));
    });
  }

  /* ---------- "new strip" toggle ---------- */
  var newOnly = document.getElementById("newOnly");
  function applyFilter() {
    if (!grid) return;
    var showNewOnly = newOnly && newOnly.checked;
    var visible = 0;
    var cards = grid.querySelectorAll(".strip");
    cards.forEach(function (c) {
      var hide = showNewOnly && c.dataset.new !== "1";
      c.hidden = hide;
      if (!hide) visible++;
    });

    var existingEmpty = grid.querySelector(".strip-grid__empty");
    if (visible === 0 && !existingEmpty) {
      var empty = document.createElement("p");
      empty.className = "strip-grid__empty";
      empty.textContent = "no fresh strips right now — toner's drying.";
      grid.appendChild(empty);
    } else if (visible > 0 && existingEmpty) {
      existingEmpty.remove();
    }
  }
  if (newOnly) {
    newOnly.addEventListener("change", function () {
      applyFilter();
      toast(newOnly.checked ? "showing new strips only" : "showing everything");
    });
  }

  /* ---------- read latest (scroll to grid) ---------- */
  var readLatest = document.getElementById("readLatest");
  if (readLatest) {
    readLatest.addEventListener("click", function () {
      var target = document.getElementById("strips");
      if (target) {
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      }
      toast('loading #207 — "the dishwasher is haunted (again)"');
    });
  }

  /* ---------- tip jar ---------- */
  var tipBtns = document.querySelectorAll(".tip");
  var tipAmountEl = document.getElementById("tipAmount");
  var tipBtn = document.getElementById("tipBtn");
  var selectedTip = 7;

  function selectTip(value, btn) {
    selectedTip = value;
    tipBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    if (tipAmountEl) tipAmountEl.textContent = "$" + value;
  }

  tipBtns.forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      selectTip(parseInt(b.dataset.tip, 10), b);
    });
  });

  if (tipBtn) {
    tipBtn.addEventListener("click", function () {
      if (selectedTip === 0) {
        toast("vibes received. thank you, truly ♡");
      } else {
        toast("clink! $" + selectedTip + " in the jar — you legend ♡");
      }
    });
  }

  /* ---------- mailing list cut-out form ---------- */
  var mailForm = document.getElementById("mailForm");
  var emailInput = document.getElementById("email");
  var mailError = document.getElementById("mailError");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (mailForm) {
    mailForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (emailInput.value || "").trim();
      if (!emailRe.test(value)) {
        if (mailError) mailError.hidden = false;
        emailInput.setAttribute("aria-invalid", "true");
        emailInput.focus();
        return;
      }
      if (mailError) mailError.hidden = true;
      emailInput.removeAttribute("aria-invalid");
      mailForm.reset();
      toast("taped in! check your inbox when toner permits.");
    });

    if (emailInput) {
      emailInput.addEventListener("input", function () {
        if (mailError && !mailError.hidden) {
          mailError.hidden = true;
          emailInput.removeAttribute("aria-invalid");
        }
      });
    }
  }

  /* ---------- run jitter on load (after layout) ---------- */
  if (!reduceMotion) {
    requestAnimationFrame(jitter);
  }
})();
