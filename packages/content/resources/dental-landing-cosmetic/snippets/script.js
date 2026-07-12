(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- Sticky topbar shadow ---------- */
  var topbar = document.getElementById("topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-stuck", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll + stat counters ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll
          ? e.target.querySelectorAll("[data-count]").forEach(function (c) {
              if (!c.dataset.done) { c.dataset.done = "1"; animateCount(c); }
            })
          : null;
        io.unobserve(e.target);
      });
    }, { threshold: 0.16 });
    reveals.forEach(function (r) { io.observe(r); });
    // counters may sit inside a reveal already observed; also observe directly
    counters.forEach(function (c) {
      if (!c.dataset.done) io.observe(c.closest(".reveal") || c);
    });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
    counters.forEach(animateCount);
  }

  /* ---------- Services tabs ---------- */
  var SVC = {
    veneers: {
      title: "Porcelain veneers",
      badge: "3–4 weeks",
      lead: "Hand-crafted porcelain veneers bonded to the front of your teeth for a natural, durable result.",
      steps: [
        ["Digital design", "3D preview of your future smile."],
        ["Gentle prep", "Minimal enamel shaping under numbing."],
        ["Temporaries", "Wear a natural test-drive smile."],
        ["Final bond", "Custom porcelain placed & polished."]
      ]
    },
    whitening: {
      title: "Professional whitening",
      badge: "1 visit · 60 min",
      lead: "In-chair Zoom whitening lifts stains up to eight shades in a single, comfortable appointment.",
      steps: [
        ["Shade match", "Record your starting shade."],
        ["Gum shield", "Protect soft tissue before gel."],
        ["Light activation", "Three gentle whitening cycles."],
        ["Home top-up", "Custom trays to keep it bright."]
      ]
    },
    makeover: {
      title: "Smile makeover",
      badge: "6–10 weeks",
      lead: "A complete, staged plan blending alignment, whitening and veneers into one cohesive result.",
      steps: [
        ["Full consult", "Photos, scans & smile goals."],
        ["Align & level", "Aligners tidy the foundation."],
        ["Whiten", "Brighten before final shade lock."],
        ["Finish & review", "Veneers, polish, 12-month check."]
      ]
    }
  };

  var tabs = document.querySelectorAll(".svc[role='tab']");
  var pTitle = document.getElementById("panel-title");
  var pBadge = document.getElementById("panel-badge");
  var pLead = document.getElementById("panel-lead");
  var pSteps = document.getElementById("panel-steps");
  var panel = document.getElementById("svc-panel");

  function renderSvc(key, focusPanel) {
    var d = SVC[key];
    if (!d) return;
    pTitle.textContent = d.title;
    pBadge.textContent = d.badge;
    pLead.textContent = d.lead;
    pSteps.innerHTML = "";
    d.steps.forEach(function (s, i) {
      var li = document.createElement("li");
      li.style.animationDelay = (i * 70) + "ms";
      li.innerHTML = '<span class="num">' + (i + 1) + '</span><span><strong>' +
        s[0] + '</strong>' + s[1] + '</span>';
      pSteps.appendChild(li);
    });
    if (panel) panel.setAttribute("aria-labelledby", "tab-" + key);
    if (focusPanel && panel) panel.focus();
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
      tab.setAttribute("aria-selected", "true");
      renderSvc(tab.getAttribute("data-svc"), false);
    });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
  renderSvc("veneers", false);

  /* ---------- Before / after slider ---------- */
  var range = document.getElementById("ba-range");
  var before = document.getElementById("ba-before");
  var handle = document.getElementById("ba-handle");
  function setBA(v) {
    if (before) before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    if (handle) handle.style.left = v + "%";
    if (range) range.setAttribute("aria-valuetext", Math.round(v) + "% after");
  }
  if (range) {
    range.addEventListener("input", function () { setBA(+range.value); });
    setBA(+range.value);
  }

  /* ---------- Financing calculator ---------- */
  var finSlider = document.getElementById("fin-slider");
  var finAmount = document.getElementById("fin-amount");
  var finMonthly = document.getElementById("fin-monthly");
  var moBtns = document.querySelectorAll(".fin-mo");
  var months = 12;

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function calcFinance() {
    if (!finSlider) return;
    var total = +finSlider.value;
    finAmount.textContent = money(total);
    // 0% interest promo — simple even split
    finMonthly.textContent = money(total / months);
  }
  if (finSlider) {
    finSlider.addEventListener("input", calcFinance);
  }
  moBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      moBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      months = +b.getAttribute("data-mo");
      calcFinance();
    });
  });
  calcFinance();

  /* ---------- Consult sheet ---------- */
  var sheet = document.getElementById("sheet");
  var form = document.getElementById("consult-form");
  var lastFocus = null;

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var first = sheet.querySelector("input, select, button");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeSheet() {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-open-consult]").forEach(function (b) {
    b.addEventListener("click", openSheet);
  });
  document.querySelectorAll("[data-close-consult]").forEach(function (b) {
    b.addEventListener("click", closeSheet);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = (form.elements.name.value || "there").trim().split(" ")[0];
      closeSheet();
      form.reset();
      toast("Thanks " + name + " — we'll confirm your consult soon.");
    });
  }
})();
