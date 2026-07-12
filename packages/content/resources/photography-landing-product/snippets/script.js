(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Hero rotator ---------- */
  var words = ["sneakers", "fragrance", "ceramics", "eyewear", "skincare"];
  var rotEl = document.getElementById("rotWord");
  var ri = 0;
  if (rotEl) {
    setInterval(function () {
      rotEl.classList.add("out");
      setTimeout(function () {
        ri = (ri + 1) % words.length;
        rotEl.textContent = words[ri];
        rotEl.classList.remove("out");
      }, 300);
    }, 2400);
  }

  /* ---------- Work grid data ---------- */
  var shade = function (a, b) {
    return "linear-gradient(150deg," + a + "," + b + ")";
  };
  var shots = [
    { cat: "ecom", tag: "E-commerce", title: "Aria Runner", sub: "Pure-white packshot", g: shade("#2a2a30", "#0f0f12"), size: "" },
    { cat: "lifestyle", tag: "Lifestyle", title: "Morning Pour", sub: "Ceramics · natural light", g: shade("#3a2f24", "#14100b"), size: "wide" },
    { cat: "spin", tag: "360° spin", title: "Halo Bottle", sub: "36-frame turntable", g: shade("#20303a", "#0b1116"), size: "" },
    { cat: "ecom", tag: "E-commerce", title: "Field Watch 04", sub: "Ghost-mount detail", g: shade("#2d2b26", "#111014"), size: "tall" },
    { cat: "lifestyle", tag: "Lifestyle", title: "Golden Hour Set", sub: "Eyewear editorial", g: shade("#3a2e2c", "#130f0e"), size: "" },
    { cat: "spin", tag: "360° spin", title: "Terra Mug", sub: "24-frame spin", g: shade("#25302b", "#0d110f"), size: "" },
    { cat: "ecom", tag: "E-commerce", title: "Silk Serum", sub: "Reflection-free glass", g: shade("#2c2733", "#100e15"), size: "" },
    { cat: "lifestyle", tag: "Lifestyle", title: "Studio Flatlay", sub: "Skincare props", g: shade("#332a2a", "#120e0e"), size: "wide" },
  ];

  var grid = document.getElementById("grid");
  var gridEmpty = document.getElementById("gridEmpty");

  shots.forEach(function (s, i) {
    var card = document.createElement("button");
    card.className = "card" + (s.size ? " " + s.size : "");
    card.type = "button";
    card.setAttribute("role", "listitem");
    card.dataset.cat = s.cat;
    card.dataset.index = i;
    card.setAttribute("aria-label", "View " + s.title + ", " + s.tag);
    card.innerHTML =
      '<div class="card-img" style="background:' + s.g + '"></div>' +
      '<div class="card-shade"></div>' +
      '<div class="card-meta">' +
      '<span class="card-cat">' + s.tag + "</span>" +
      '<h3 class="card-title">' + s.title + "</h3>" +
      '<p class="card-sub">' + s.sub + "</p>" +
      "</div>";
    card.addEventListener("click", function () {
      openLightbox(i);
    });
    grid.appendChild(card);
  });

  /* ---------- Filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var f = chip.dataset.filter;
      var visible = 0;
      Array.prototype.slice.call(grid.children).forEach(function (card) {
        var show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hide", !show);
        if (show) visible++;
      });
      gridEmpty.hidden = visible !== 0;
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = 0;
  var lastFocused = null;

  function visibleIndices() {
    return shots
      .map(function (_, i) { return i; })
      .filter(function (i) {
        return !grid.children[i].classList.contains("hide");
      });
  }

  function renderLb(i) {
    var s = shots[i];
    lbImg.style.background = s.g;
    lbCap.textContent = s.title + " — " + s.tag;
    current = i;
  }

  function openLightbox(i) {
    lastFocused = document.activeElement;
    renderLb(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }
  function step(dir) {
    var vis = visibleIndices();
    if (!vis.length) return;
    var pos = vis.indexOf(current);
    pos = (pos + dir + vis.length) % vis.length;
    renderLb(vis[pos]);
  }

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Tab") {
      // simple focus trap
      var f = [lbClose, lbPrev, lbNext];
      var idx = f.indexOf(document.activeElement);
      e.preventDefault();
      var nextIdx = e.shiftKey ? (idx - 1 + f.length) % f.length : (idx + 1) % f.length;
      f[nextIdx].focus();
    }
  });

  /* ---------- Client marquee ---------- */
  var brands = [
    "Northwind", "Lumen&Co", "Fjordlæ", "Atlas Goods", "Verano",
    "Kettle&Fern", "Osmo", "Marlowe", "Basalt", "Suniva",
  ];
  var track = document.getElementById("marqueeTrack");
  function fillTrack() {
    var html = brands
      .map(function (b) { return '<span class="logo">' + b + "</span>"; })
      .join("");
    track.innerHTML = html + html; // duplicate for seamless loop
  }
  fillTrack();

  /* ---------- Reveal on scroll + stat counters ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var statsDone = false;

  function runStats() {
    if (statsDone) return;
    statsDone = true;
    document.querySelectorAll(".stat dd").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
      var start = performance.now();
      var dur = 1400;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    var statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runStats(); statsIo.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    var statsSec = document.getElementById("stats");
    if (statsSec) statsIo.observe(statsSec);
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    runStats();
  }

  /* ---------- Quote form: steps + budget + validation ---------- */
  var form = document.getElementById("quoteForm");
  var panels = form.querySelectorAll(".q-panel");
  var stepDots = form.querySelectorAll(".step");
  var budget = document.getElementById("budget");
  var budgetOut = document.getElementById("budgetOut");

  function euro(n) {
    return "€" + Number(n).toLocaleString("en-US");
  }
  budget.addEventListener("input", function () {
    budgetOut.textContent = euro(budget.value);
  });

  function showPanel(n) {
    panels.forEach(function (p) {
      p.classList.toggle("is-active", p.dataset.panel === String(n));
    });
    stepDots.forEach(function (d) {
      d.classList.toggle("is-active", Number(d.dataset.step) <= n);
    });
  }

  function validatePanel(n) {
    var panel = form.querySelector('.q-panel[data-panel="' + n + '"]');
    var ok = true;
    panel.querySelectorAll("input[required], select[required]").forEach(function (el) {
      var field = el.closest(".field");
      var valid = el.value.trim() !== "" && (el.type !== "email" || /\S+@\S+\.\S+/.test(el.value));
      field.classList.toggle("invalid", !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    return ok;
  }

  form.querySelector("[data-next]").addEventListener("click", function () {
    if (validatePanel(1)) showPanel(2);
    else toast("Please complete the highlighted fields.");
  });
  form.querySelector("[data-back]").addEventListener("click", function () {
    showPanel(1);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validatePanel(2)) { toast("Please complete the highlighted fields."); return; }
    var name = document.getElementById("name").value.trim().split(" ")[0] || "there";
    form.reset();
    budgetOut.textContent = euro(2500);
    showPanel(1);
    toast("Thanks " + name + " — we'll reply within one business day.");
  });

  // Clear invalid state as the user types
  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      var field = el.closest(".field");
      if (field) field.classList.remove("invalid");
    });
  });
})();
