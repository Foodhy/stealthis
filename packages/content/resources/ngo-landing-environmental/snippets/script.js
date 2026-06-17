(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, ok) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle("ok", !!ok);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.getElementById("navLinks").addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated count-up stats ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = Math.round(target * easeOut(p));
      el.textContent = val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counts.forEach(function (el) { cio.observe(el); });
  } else {
    counts.forEach(animateCount);
  }

  /* ---------- Transparency bars + thermometer (animate on view) ---------- */
  var thermoFill = document.getElementById("thermoFill");
  // bars carry their target width inline in markup; reset to 0 then restore on view
  var transBars = document.querySelectorAll(".bar-fill");
  var widths = [];
  transBars.forEach(function (b) { widths.push(b.style.width); b.style.width = "0%"; });
  function runBars() {
    transBars.forEach(function (b, i) { b.style.width = widths[i]; });
  }
  if ("IntersectionObserver" in window && transBars.length) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runBars(); bio.disconnect(); }
      });
    }, { threshold: 0.3 });
    bio.observe(transBars[0].closest(".alloc"));
  } else { runBars(); }

  /* Thermometer animates toward signature ratio */
  var PLEDGE_GOAL = 500000;
  var pledgeCount = 341902;
  var pledgeCountEl = document.getElementById("pledgeCount");
  function updateThermo() {
    var pct = Math.min((pledgeCount / PLEDGE_GOAL) * 100, 100);
    if (thermoFill) thermoFill.style.width = pct.toFixed(1) + "%";
    if (pledgeCountEl) pledgeCountEl.textContent = pledgeCount.toLocaleString("en-US");
  }
  if (thermoFill) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { updateThermo(); tio.disconnect(); }
      });
    }, { threshold: 0.3 });
    tio.observe(thermoFill.closest(".thermo"));
  }

  /* ---------- Impact map pins ---------- */
  var SITES = {
    atlantic: {
      name: "Atlantic Forest Corridor",
      place: "Bahia, Brazil",
      desc: "Reconnecting jungle fragments for jaguars and tapirs.",
      hectares: "8,420 ha", canopy: "+41%", lead: "Crew lead: Beatriz Mendes"
    },
    sundarbans: {
      name: "Sundarbans Mangrove Shield",
      place: "Bay of Bengal",
      desc: "Storm-buffering mangroves protecting coastal villages.",
      hectares: "1,840 ha", canopy: "+33%", lead: "Crew lead: Rafiq Hossain"
    },
    rift: {
      name: "Rift Valley Soil Renewal",
      place: "Nakuru, Kenya",
      desc: "Agroforestry restoring eroded smallholder farmland.",
      hectares: "5,610 ha", canopy: "+22%", lead: "Crew lead: Wanjiru Kamau"
    },
    carpathia: {
      name: "Carpathian Old-Growth",
      place: "Romania",
      desc: "Protecting Europe's last temperate rainforest.",
      hectares: "3,200 ha", canopy: "+29%", lead: "Crew lead: Andrei Popescu"
    }
  };
  var detail = document.getElementById("mapDetail");
  var pins = document.querySelectorAll(".pin");
  pins.forEach(function (pin) {
    pin.setAttribute("aria-label", "View restoration site");
    pin.addEventListener("click", function () {
      pins.forEach(function (p) { p.classList.remove("active"); });
      pin.classList.add("active");
      var s = SITES[pin.getAttribute("data-site")];
      if (!s || !detail) return;
      detail.classList.add("active");
      detail.innerHTML =
        '<strong>' + s.name + '</strong>' +
        '<span>' + s.place + ' — ' + s.desc + '</span>' +
        '<span class="meta"><span>Restored <b>' + s.hectares + '</b></span>' +
        '<span>Canopy <b>' + s.canopy + '</b></span></span>' +
        '<span class="meta"><span>' + s.lead + '</span></span>';
    });
  });

  /* ---------- Donate widget ---------- */
  var freqBtns = document.querySelectorAll(".freq-btn");
  var amtBtns = document.querySelectorAll(".amt[data-amt]");
  var customAmt = document.getElementById("customAmt");
  var impactLine = document.getElementById("impactLine");
  var donateAmtLabel = document.getElementById("donateAmtLabel");
  var donateForm = document.getElementById("donateForm");
  var state = { freq: "once", amount: 60 };

  function renderDonate() {
    var trees = Math.max(1, Math.round(state.amount));
    var per = state.freq === "monthly" ? "/mo" : "";
    if (donateAmtLabel) donateAmtLabel.textContent = "$" + state.amount + per;
    if (impactLine) {
      impactLine.innerHTML = "Your $" + state.amount +
        (state.freq === "monthly" ? " monthly" : "") +
        " plants about <strong>" + trees.toLocaleString("en-US") + " trees</strong> 🌱";
    }
  }
  freqBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      freqBtns.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("is-active"); b.setAttribute("aria-selected", "true");
      state.freq = b.getAttribute("data-freq");
      renderDonate();
    });
  });
  amtBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      amtBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      if (customAmt) customAmt.value = "";
      state.amount = parseInt(b.getAttribute("data-amt"), 10);
      renderDonate();
    });
  });
  if (customAmt) {
    customAmt.addEventListener("input", function () {
      var v = parseInt(customAmt.value, 10);
      if (v > 0) {
        amtBtns.forEach(function (x) { x.classList.remove("is-active"); });
        state.amount = v;
        renderDonate();
      }
    });
  }
  if (donateForm) {
    donateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!state.amount || state.amount < 1) { toast("Please choose a donation amount."); return; }
      toast("Thank you! Your $" + state.amount + (state.freq === "monthly" ? "/mo" : "") + " gift is illustrative only 🌍", true);
    });
  }
  renderDonate();

  /* ---------- Pledge form ---------- */
  var pledgeForm = document.getElementById("pledgeForm");
  if (pledgeForm) {
    pledgeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("pName");
      var email = document.getElementById("pEmail");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var nameOk = name.value.trim().length >= 2;
      name.classList.toggle("invalid", !nameOk);
      email.classList.toggle("invalid", !emailOk);
      if (!nameOk || !emailOk) { toast("Please add your name and a valid email."); return; }
      pledgeCount += 1;
      updateThermo();
      toast("Pledge signed — thank you, " + name.value.trim().split(" ")[0] + "! 🌱", true);
      pledgeForm.reset();
    });
    ["pName", "pEmail"].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", function () { el.classList.remove("invalid"); });
    });
  }

  /* ---------- Footer subscribe ---------- */
  var subForm = document.getElementById("subForm");
  if (subForm) {
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = document.getElementById("subEmail");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { toast("Enter a valid email to subscribe."); return; }
      toast("You're on the list! Welcome to the movement 🌍", true);
      subForm.reset();
    });
  }
})();
