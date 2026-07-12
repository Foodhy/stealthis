(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 2600);
  }

  /* ---------- Hero discipline switcher ---------- */
  var DISCIPLINES = {
    workplace: {
      eyebrow: "Workplace interiors · Est. 2009",
      title: "Offices people choose to come back to.",
      sub: "We shape headquarters and studios where focus, daylight and quiet acoustics do the recruiting for you.",
      tag: "Aperture HQ · Lisbon",
      p1: "linear-gradient(150deg, rgba(255,255,255,0.14), rgba(0,0,0,0.16)), linear-gradient(150deg, var(--clay), var(--walnut))",
      p2: "linear-gradient(150deg, rgba(255,255,255,0.16), rgba(0,0,0,0.12)), linear-gradient(150deg, var(--sage), #7d9269)"
    },
    retail: {
      eyebrow: "Retail interiors · Est. 2009",
      title: "Stores choreographed like a slow walk.",
      sub: "We design flagship and boutique environments where material, light and rhythm turn browsing into buying.",
      tag: "Casa Vela Flagship · Porto",
      p1: "linear-gradient(150deg, rgba(255,255,255,0.14), rgba(0,0,0,0.14)), linear-gradient(150deg, #d8c4ad, var(--clay-d))",
      p2: "linear-gradient(150deg, rgba(255,255,255,0.18), rgba(0,0,0,0.12)), linear-gradient(150deg, #c39a76, var(--walnut))"
    },
    hospitality: {
      eyebrow: "Hospitality interiors · Est. 2009",
      title: "Lobbies that welcome before a word is said.",
      sub: "We craft hotels, bars and restaurants where walnut, linen and low light make guests want to stay another night.",
      tag: "Petra House Hotel · Madrid",
      p1: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(0,0,0,0.2)), linear-gradient(150deg, #6e553f, #2c2620)",
      p2: "linear-gradient(150deg, rgba(255,255,255,0.16), rgba(0,0,0,0.14)), linear-gradient(150deg, var(--clay), var(--walnut))"
    }
  };

  var heroEls = {
    eyebrow: document.querySelector('[data-hero="eyebrow"]'),
    title: document.querySelector('[data-hero="title"]'),
    sub: document.querySelector('[data-hero="sub"]'),
    tag: document.querySelector('[data-hero="tag"]'),
    plate1: document.querySelector('[data-hero="plate1"]'),
    plate2: document.querySelector('[data-hero="plate2"]')
  };

  function setDiscipline(key) {
    var d = DISCIPLINES[key];
    if (!d) return;
    if (heroEls.eyebrow) heroEls.eyebrow.textContent = d.eyebrow;
    if (heroEls.title) heroEls.title.textContent = d.title;
    if (heroEls.sub) heroEls.sub.textContent = d.sub;
    if (heroEls.tag) heroEls.tag.textContent = d.tag;
    if (heroEls.plate1) heroEls.plate1.style.backgroundImage = d.p1;
    if (heroEls.plate2) heroEls.plate2.style.backgroundImage = d.p2;
  }

  var switchBtns = Array.prototype.slice.call(document.querySelectorAll(".switch-btn"));
  switchBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      setDiscipline(btn.dataset.discipline);
    });
  });

  /* ---------- Case metric badges ---------- */
  document.querySelectorAll(".case").forEach(function (card) {
    var m = card.querySelector(".metric");
    if (m && card.dataset.metric) m.textContent = card.dataset.metric;
  });

  /* ---------- Animated counters (IntersectionObserver) ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".count"));
  function runCounter(el) {
    var target = parseFloat(el.dataset.to) || 0;
    var suffix = el.dataset.suffix || "";
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Enquire form chips + summary ---------- */
  var selection = { discipline: "Workplace", budget: "€50–150k" };
  var summaryEl = document.querySelector("[data-summary]");
  var areaInput = document.getElementById("area");

  function renderSummary() {
    if (!summaryEl) return;
    var area = (areaInput && areaInput.value) ? areaInput.value : "—";
    summaryEl.innerHTML =
      "Brief: <strong>" + selection.discipline + "</strong> · <strong>" +
      selection.budget + "</strong> · <strong>" + area + " m²</strong>";
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var group = chip.dataset.chip;
      document.querySelectorAll('.chip[data-chip="' + group + '"]').forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      selection[group] = chip.dataset.value;
      renderSummary();
    });
  });

  if (areaInput) areaInput.addEventListener("input", renderSummary);

  /* ---------- Form submit ---------- */
  var form = document.querySelector(".brief");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      if (!name.value.trim()) {
        name.focus();
        toast("Add your name so we know who to reply to.");
        return;
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.focus();
        toast("Pop in a valid work email.");
        return;
      }
      toast("Brief received — we'll reply within 2 working days.");
      form.reset();
      // reset chip state to defaults
      selection = { discipline: "Workplace", budget: "€50–150k" };
      document.querySelectorAll('.chip[data-chip="discipline"]').forEach(function (c) {
        var on = c.dataset.value === "Workplace";
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      document.querySelectorAll('.chip[data-chip="budget"]').forEach(function (c) {
        var on = c.dataset.value === "€50–150k";
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      if (areaInput) areaInput.value = "600";
      renderSummary();
    });
  }

  renderSummary();
})();
