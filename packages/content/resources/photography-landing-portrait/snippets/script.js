(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toast-wrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="dot" aria-hidden="true"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated stat counters ---------- */
  var counted = false;
  var statsEl = document.getElementById("stats");
  function runCounters() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat-num").forEach(function (node) {
      var target = parseInt(node.getAttribute("data-count"), 10) || 0;
      var suffix = node.getAttribute("data-suffix") || "";
      var start = null, dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if (statsEl && "IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) runCounters(); });
    }, { threshold: 0.4 });
    statObs.observe(statsEl);
  } else {
    runCounters();
  }

  /* ---------- Studio vs On-location toggle ---------- */
  var MODES = {
    studio: {
      kicker: "Controlled & timeless",
      heading: "The studio room",
      text: "A calm, blacked-out space with shaped light and seamless backdrops. Ideal for headshots, beauty, and clean editorial frames where every shadow is a decision.",
      chips: ["Shaped strobe & softbox", "Wardrobe rail on-site", "Tethered live review", "Seamless + textured sets"],
      meta: "90-minute block · Berlin Mitte studio",
      img: "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=900&q=80"
    },
    location: {
      kicker: "Alive & atmospheric",
      heading: "Out in the world",
      text: "Golden-hour rooftops, quiet courtyards, tram-lit streets. We chase real light and let the city set the mood — relaxed, cinematic, unmistakably yours.",
      chips: ["Scouted locations", "Golden-hour timing", "Available-light craft", "Movement direction"],
      meta: "2-hour window · location of your choice",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80"
    }
  };
  var seg = document.querySelector(".seg");
  var segBtns = document.querySelectorAll(".seg-btn");
  var panel = document.getElementById("exp-panel");
  var mediaEl = panel && panel.querySelector("[data-media]");
  var kickerEl = panel && panel.querySelector("[data-kicker]");
  var headingEl = panel && panel.querySelector("[data-heading]");
  var textEl = panel && panel.querySelector("[data-text]");
  var chipsEl = panel && panel.querySelector("[data-chips]");
  var metaEl = panel && panel.querySelector("[data-meta]");

  function preload(url) { var i = new Image(); i.src = url; }
  preload(MODES.studio.img); preload(MODES.location.img);

  function applyMode(mode, animate) {
    var data = MODES[mode];
    if (!data || !panel) return;
    function paint() {
      mediaEl.style.backgroundImage = "url(" + data.img + ")";
      kickerEl.textContent = data.kicker;
      headingEl.textContent = data.heading;
      textEl.textContent = data.text;
      metaEl.textContent = data.meta;
      chipsEl.innerHTML = "";
      data.chips.forEach(function (c) {
        var li = document.createElement("li");
        li.textContent = c;
        chipsEl.appendChild(li);
      });
    }
    if (animate) {
      panel.classList.add("swapping");
      setTimeout(function () { paint(); panel.classList.remove("swapping"); }, 260);
    } else {
      paint();
    }
  }

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-mode");
      segBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      seg.classList.toggle("at-location", mode === "location");
      applyMode(mode, true);
    });
  });
  applyMode("studio", false);

  /* ---------- Portfolio lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var lbClose = document.getElementById("lb-close");
  var lastFocused = null;

  function openLightbox(tile) {
    lastFocused = tile;
    var bg = getComputedStyle(tile).backgroundImage;
    lbImg.style.backgroundImage = bg;
    lbCap.textContent = tile.getAttribute("data-title") || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lbClose.focus();
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }
  document.querySelectorAll(".tile").forEach(function (tile) {
    tile.addEventListener("click", function () { openLightbox(tile); });
  });
  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  /* ---------- Pricing → prefill booking ---------- */
  var planSelect = document.getElementById("f-plan");
  document.querySelectorAll(".tier-cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan");
      if (planSelect) planSelect.value = plan;
      toast(plan + " selected — finish your enquiry");
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        var name = document.getElementById("f-name");
        if (name) name.focus();
      }, 600);
    });
  });

  /* ---------- Booking form validation ---------- */
  var form = document.getElementById("book-form");
  function setError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]').closest(".field");
    var slot = form.querySelector('[data-err="' + name + '"]');
    if (msg) {
      field.classList.add("invalid");
      if (slot) slot.textContent = msg;
    } else {
      field.classList.remove("invalid");
      if (slot) slot.textContent = "";
    }
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var plan = form.plan.value;
      var ok = true;

      if (name.length < 2) { setError("name", "Please tell me your name."); ok = false; }
      else setError("name", "");

      if (!validEmail(email)) { setError("email", "Enter a valid email address."); ok = false; }
      else setError("email", "");

      if (!plan) { setError("plan", "Pick a session (or “Not sure yet”)."); ok = false; }
      else setError("plan", "");

      if (!ok) { toast("Please check the highlighted fields"); return; }

      var btn = form.querySelector(".form-submit");
      btn.disabled = true;
      var original = btn.textContent;
      btn.textContent = "Sending…";
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = original;
        form.reset();
        toast("Thanks " + name.split(" ")[0] + " — enquiry received!");
      }, 900);
    });

    ["name", "email", "plan"].forEach(function (n) {
      form[n].addEventListener("input", function () { setError(n, ""); });
    });
  }

  /* ---------- Year (footer already static, harmless enhancement) ---------- */
})();
