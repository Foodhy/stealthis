(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- hero plan: self-drawing SVG ---------- */
  var plan = document.querySelector(".plan");
  var svg = document.getElementById("planSvg");
  if (svg) {
    var strokes = svg.querySelectorAll(".draw path, .draw circle, .dim path");
    Array.prototype.forEach.call(strokes, function (el, i) {
      var len = 400;
      try { len = Math.ceil(el.getTotalLength()) || 400; } catch (e) { /* jsdom */ }
      el.style.setProperty("--len", len);
      el.style.animationDelay = (reduced ? 0 : i * 55) + "ms";
    });
    if (reduced) {
      plan.classList.add("drawn");
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { plan.classList.add("drawn"); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(plan);
    } else {
      plan.classList.add("drawn");
    }
  }

  /* ---------- species state (shared with calculator) ---------- */
  var species = {
    name: "Black Walnut",
    price: 14.6,
    hard: 1010
  };
  var MAX_JANKA = 1600;

  var swatches = document.querySelectorAll(".sw");
  var grain = document.getElementById("grain");
  var spName = document.getElementById("spName");
  var spDesc = document.getElementById("spDesc");
  var spHard = document.getElementById("spHard");
  var spPrice = document.getElementById("spPrice");
  var hardBar = document.getElementById("hardBar");
  var outSpecies = document.getElementById("outSpecies");

  function selectSpecies(btn, announce) {
    Array.prototype.forEach.call(swatches, function (b) {
      b.setAttribute("aria-checked", String(b === btn));
      b.tabIndex = b === btn ? 0 : -1;
    });
    species.name = btn.dataset.label;
    species.price = parseFloat(btn.dataset.price);
    species.hard = parseInt(btn.dataset.hard, 10);

    if (grain) {
      grain.style.setProperty("--t", btn.dataset.tone);
      grain.style.setProperty("--t2", btn.dataset.tone2);
    }
    spName.textContent = species.name;
    spDesc.textContent = btn.dataset.desc;
    spHard.textContent = species.hard + " lbf";
    spPrice.textContent = "$" + species.price.toFixed(2);
    hardBar.style.width = Math.min(100, (species.hard / MAX_JANKA) * 100).toFixed(1) + "%";
    hardBar.parentNode.setAttribute("aria-label", "Janka hardness " + species.hard + " of " + MAX_JANKA);
    if (outSpecies) outSpecies.textContent = species.name.split(" ").pop();
    compute();
    if (announce) toast(species.name + " · $" + species.price.toFixed(2) + " per board foot");
  }

  Array.prototype.forEach.call(swatches, function (btn, i) {
    btn.tabIndex = btn.getAttribute("aria-checked") === "true" ? 0 : -1;
    btn.addEventListener("click", function () { selectSpecies(btn, true); });
    btn.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
            : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = swatches[(i + d + swatches.length) % swatches.length];
      next.focus();
      selectSpecies(next, true);
    });
  });

  /* ---------- cut-list calculator ---------- */
  var form = document.getElementById("calcForm");
  var wEl = document.getElementById("w");
  var lEl = document.getElementById("l");
  var qEl = document.getElementById("q");
  var tEl = document.getElementById("thick");
  var outBf = document.getElementById("outBf");
  var outCost = document.getElementById("outCost");

  function num(el, fallback) {
    var v = parseFloat(el.value);
    return isFinite(v) && v > 0 ? v : fallback;
  }

  function compute() {
    if (!form) return 0;
    var t = parseFloat(tEl.value);
    var bf = (t * num(wEl, 0) * num(lEl, 0) * num(qEl, 0)) / 144;
    outBf.textContent = bf ? bf.toFixed(2) : "—";
    outCost.textContent = bf ? "$" + (bf * species.price).toFixed(2) : "—";
    return bf;
  }

  if (form) {
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, compute);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bf = compute();
      if (!bf) { toast("Enter a width, length and quantity first."); return; }
      toast(
        num(qEl, 1) + " × " + species.name + " — " + bf.toFixed(2) +
        " bd ft added to your cut list ($" + (bf * species.price).toFixed(2) + ")"
      );
    });
  }

  /* ---------- tool strip ---------- */
  var note = document.getElementById("toolNote");
  var tools = document.querySelectorAll(".tool-strip li");
  function showNote(li) {
    Array.prototype.forEach.call(tools, function (t) { t.classList.toggle("on", t === li); });
    note.textContent = li.dataset.note;
  }
  Array.prototype.forEach.call(tools, function (li) {
    li.addEventListener("mouseenter", function () { showNote(li); });
    li.addEventListener("focus", function () { showNote(li); });
    li.addEventListener("click", function () { showNote(li); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showNote(li); }
    });
  });

  /* ---------- classes: seat meters ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".klass"), function (card) {
    var seats = parseInt(card.dataset.seats, 10);
    var cap = parseInt(card.dataset.cap, 10);
    var box = card.querySelector(".seats");
    var bar = box.querySelector("span");
    var label = box.querySelector("small");
    var btn = card.querySelector(".book");

    function render() {
      var taken = cap - seats;
      bar.style.width = ((taken / cap) * 100).toFixed(1) + "%";
      box.classList.toggle("low", seats > 0 && seats <= 2);
      label.textContent = seats > 0
        ? seats + " of " + cap + " seats left"
        : "Waitlist only";
      if (seats === 0) {
        card.classList.add("full");
        btn.textContent = "Join waitlist";
        btn.disabled = true;
      }
    }
    render();

    btn.addEventListener("click", function () {
      if (seats <= 0) return;
      seats -= 1;
      card.dataset.seats = seats;
      render();
      toast("Seat held for " + card.querySelector("h3").textContent + " — 15 minutes to confirm.");
    });
  });

  /* ---------- newsletter ---------- */
  var news = document.getElementById("newsForm");
  var email = document.getElementById("email");
  var err = document.getElementById("newsErr");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      if (!ok) {
        err.textContent = "That address doesn't look right — check it and try again.";
        email.setAttribute("aria-invalid", "true");
        email.focus();
        return;
      }
      err.textContent = "";
      email.removeAttribute("aria-invalid");
      email.value = "";
      toast("You're on the list. The Offcut ships the first Tuesday of the month.");
    });
  }

  /* ---------- smooth anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });

  compute();
})();
