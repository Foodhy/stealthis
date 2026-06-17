(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 280);
    }, 2800);
  }

  /* ---------- Number formatting ---------- */
  function fmtCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return String(n);
  }
  function fmtComma(n) { return n.toLocaleString("en-US"); }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var compact = el.getAttribute("data-format") === "compact";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = (compact ? fmtCompact(val) : fmtComma(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Campaign thermometer ---------- */
  var raised = 148200, goal = 240000;
  var pct = Math.min(Math.round((raised / goal) * 100), 100);
  var thermo = document.getElementById("thermo");
  var pctEl = document.getElementById("pct");
  function fillThermo() {
    if (thermo) thermo.style.width = pct + "%";
    if (pctEl) {
      var s = performance.now();
      (function step(now) {
        var p = Math.min((now - s) / 1400, 1);
        if (pctEl) pctEl.textContent = Math.round(pct * (1 - Math.pow(1 - p, 3))) + "%";
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
  }
  if (thermo && "IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fillThermo(); tio.disconnect(); }
    }, { threshold: 0.3 });
    tio.observe(thermo);
  } else { fillThermo(); }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Story carousel ---------- */
  var track = document.getElementById("track");
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var dotsWrap = document.getElementById("dots");
  var idx = 0, autoTimer;

  function buildDots() {
    if (!dotsWrap) return;
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Story " + (i + 1));
      d.addEventListener("click", function () { go(i); resetAuto(); });
      dotsWrap.appendChild(d);
    });
  }
  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.hidden = i !== idx;
      if (i === idx) { s.classList.remove("anim"); void s.offsetWidth; s.style.animation = "none"; s.style.animation = ""; }
    });
    if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle("active", i === idx); });
  }
  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { go(idx + 1); }, 6000);
  }
  if (slides.length) {
    buildDots();
    document.querySelectorAll("[data-car]").forEach(function (b) {
      b.addEventListener("click", function () {
        go(idx + (b.getAttribute("data-car") === "next" ? 1 : -1));
        resetAuto();
      });
    });
    resetAuto();
  }

  /* ---------- Donate quick picker ---------- */
  var modal = document.getElementById("donateModal");
  var amountGrid = document.getElementById("amountGrid");
  var customAmt = document.getElementById("customAmt");
  var impactLine = document.getElementById("impactLine");
  var giveBtn = document.getElementById("giveBtn");
  var freqBtns = document.querySelectorAll(".freq");
  var presets = { once: [25, 50, 100, 250, 500, 1000], monthly: [10, 25, 50, 75, 100, 150] };
  var freq = "once";
  var amount = 50;
  var lastFocus = null;

  var impactCopy = [
    { min: 0, txt: "Every dollar funds pipes, pumps, and clean mornings." },
    { min: 25, txt: "$AMT keeps a hand pump maintained for months." },
    { min: 50, txt: "$AMT funds clean water for one family for a year." },
    { min: 100, txt: "$AMT trains a local technician to keep wells flowing." },
    { min: 250, txt: "$AMT helps survey and prep a new well site." },
    { min: 1000, txt: "$AMT funds an entire village hand-pump well." }
  ];
  function impactFor(a) {
    var pick = impactCopy[0];
    for (var i = 0; i < impactCopy.length; i++) { if (a >= impactCopy[i].min) pick = impactCopy[i]; }
    var per = freq === "monthly" ? "/mo" : "";
    return pick.txt.replace("$AMT", "$" + fmtComma(a) + per);
  }
  function renderAmounts() {
    if (!amountGrid) return;
    amountGrid.innerHTML = "";
    presets[freq].forEach(function (v) {
      var b = document.createElement("button");
      b.className = "amt-btn" + (v === amount ? " active" : "");
      b.type = "button";
      b.textContent = "$" + v + (freq === "monthly" ? "/mo" : "");
      b.addEventListener("click", function () {
        amount = v;
        if (customAmt) customAmt.value = "";
        syncUI();
      });
      amountGrid.appendChild(b);
    });
  }
  function syncUI() {
    if (amountGrid) Array.prototype.forEach.call(amountGrid.children, function (b, i) {
      b.classList.toggle("active", presets[freq][i] === amount);
    });
    if (impactLine) impactLine.textContent = impactFor(amount);
    if (giveBtn) giveBtn.textContent = "Give $" + fmtComma(amount) + (freq === "monthly" ? "/month" : "");
  }
  freqBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      freq = b.getAttribute("data-freq");
      freqBtns.forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("active"); b.setAttribute("aria-selected", "true");
      if (presets[freq].indexOf(amount) === -1) amount = presets[freq][1];
      renderAmounts(); syncUI();
    });
  });
  if (customAmt) {
    customAmt.addEventListener("input", function () {
      var v = parseInt(customAmt.value, 10);
      if (v > 0) { amount = v; syncUI(); }
    });
  }
  if (giveBtn) {
    giveBtn.addEventListener("click", function () {
      closeModal();
      toast("Thank you! Your $" + fmtComma(amount) + (freq === "monthly" ? "/mo " : " ") + "gift is illustrative — no charge made.");
    });
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    renderAmounts(); syncUI();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var first = modal.querySelector(".freq");
    if (first) first.focus();
    document.addEventListener("keydown", onKey);
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      var f = modal.querySelectorAll("button, input, [href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  document.querySelectorAll("[data-amount-trigger]").forEach(function (t) {
    t.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
  });
  document.querySelectorAll("[data-close]").forEach(function (c) {
    c.addEventListener("click", closeModal);
  });

  /* ---------- Generic toast triggers + share ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });
  document.querySelectorAll("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({ title: "Highlands Water Project", text: "Help fund 12 wells before the dry season." }).catch(function () {});
      } else {
        toast("Campaign link copied — thanks for spreading the word!");
      }
    });
  });

  /* ---------- Newsletter ---------- */
  var form = document.getElementById("newsForm");
  var msg = document.getElementById("newsMsg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        if (msg) { msg.textContent = "Please enter a valid email address."; msg.classList.add("err"); }
        form.email.focus();
        return;
      }
      if (msg) { msg.classList.remove("err"); msg.textContent = "You're in — watch for our next field note."; }
      form.reset();
      toast("Subscribed! Welcome to Brightwater.");
    });
  }
})();
