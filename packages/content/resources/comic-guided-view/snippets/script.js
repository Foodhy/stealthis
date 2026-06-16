/* Neon Ronin — Guided View reader
 * Virtual page camera: a large fixed-size "page" canvas holds panels positioned
 * in canvas coordinates. For each panel we compute a CSS transform that fits the
 * panel's rect into the stage viewport (scale + translate), then animate the camera.
 */
(function () {
  "use strict";

  /* ---- Virtual canvas size (logical units) ---- */
  var CANVAS_W = 1200;
  var CANVAS_H = 1600;
  var PAD = 0.06; // breathing room around a focused panel (fraction)

  /* ---- Fictional issue data: 3 pages of panels ----
   * Each panel rect is in canvas units: {x,y,w,h} on the CANVAS_W x CANVAS_H page.
   */
  var PAGES = [
    {
      bg: "linear-gradient(160deg,#1b2a4a,#0e0e12)",
      panels: [
        {
          x: 40, y: 40, w: 1120, h: 460,
          art: "radial-gradient(120% 120% at 70% 20%,#ff7a3d,#7a1f4d 55%,#1b1030)",
          no: "1", sfx: { t: "VRRMMM", x: "62%", y: "16%", s: 64, c: "#ffd23f" },
          balloon: { t: "Tokyo never sleeps. Tonight, neither do I.", x: "5%", y: "62%" },
          cap: "Page 1 - The Ronin glides over a rain-slick skyline."
        },
        {
          x: 40, y: 540, w: 540, h: 480,
          art: "linear-gradient(135deg,#2e6bff,#0b1430)",
          no: "2", sfx: { t: "BEEP", x: "8%", y: "12%", s: 40, c: "#ff2e4d" },
          balloon: { t: "Signal locked. Cargo bay, sub-level 9.", x: "8%", y: "60%", thought: true },
          cap: "Page 1 - A wrist console pings with a stolen ping."
        },
        {
          x: 620, y: 540, w: 540, h: 480,
          art: "radial-gradient(100% 100% at 30% 30%,#39ffb0,#0f3a2c 60%,#06140f)",
          no: "3", sfx: { t: "TSK", x: "60%", y: "20%", s: 44, c: "#ffd23f" },
          balloon: { t: "They think the firewall stops me.", x: "6%", y: "58%" },
          cap: "Page 1 - Code cascades across her visor."
        },
        {
          x: 40, y: 1060, w: 1120, h: 500,
          art: "linear-gradient(110deg,#ff2e4d,#7a0f24 60%,#1a060d)",
          no: "4", sfx: { t: "KRAKK!", x: "40%", y: "20%", s: 88, c: "#fff" },
          balloon: { t: "Cute. Now it doesn't.", x: "55%", y: "62%" },
          cap: "Page 1 - The barrier shatters in a spray of neon glass."
        }
      ]
    },
    {
      bg: "linear-gradient(160deg,#2a1b4a,#0e0e12)",
      panels: [
        {
          x: 40, y: 40, w: 760, h: 520,
          art: "radial-gradient(120% 120% at 20% 30%,#b14dff,#3a1170 55%,#120824)",
          no: "1", sfx: { t: "HUMMM", x: "55%", y: "14%", s: 56, c: "#39ffb0" },
          balloon: { t: "Iron Vanguard. I should have known.", x: "6%", y: "60%" },
          cap: "Page 2 - A hulking sentinel powers up in the dark."
        },
        {
          x: 840, y: 40, w: 320, h: 520,
          art: "linear-gradient(180deg,#ffd23f,#b8870b 70%,#2a1d04)",
          no: "2", sfx: { t: "CLNK", x: "20%", y: "12%", s: 38, c: "#0e0e12" },
          balloon: { t: "Surrender the drive.", x: "8%", y: "10%" },
          cap: "Page 2 - A gauntlet clenches around a data spike."
        },
        {
          x: 40, y: 600, w: 1120, h: 440,
          art: "radial-gradient(120% 140% at 50% 0%,#2e6bff,#0a1638 55%,#04081a)",
          no: "3", sfx: { t: "WHOOSH", x: "30%", y: "16%", s: 70, c: "#ffd23f" },
          balloon: { t: "Make me.", x: "62%", y: "58%" },
          cap: "Page 2 - She vaults the gap, blade trailing light."
        },
        {
          x: 40, y: 1080, w: 360, h: 480,
          art: "linear-gradient(135deg,#39ffb0,#063a2b)",
          no: "4", sfx: null,
          balloon: { t: "Three... two...", x: "10%", y: "14%", thought: true },
          cap: "Page 2 - A countdown blooms on the floor."
        },
        {
          x: 440, y: 1080, w: 720, h: 480,
          art: "radial-gradient(120% 120% at 70% 70%,#ff2e4d,#5a0d1c 60%,#16050a)",
          no: "5", sfx: { t: "BWOOM!", x: "30%", y: "18%", s: 92, c: "#ffd23f" },
          balloon: { t: "...one.", x: "8%", y: "62%" },
          cap: "Page 2 - The chamber erupts in a shockwave."
        }
      ]
    },
    {
      bg: "linear-gradient(160deg,#0e3a3a,#0e0e12)",
      panels: [
        {
          x: 40, y: 40, w: 1120, h: 620,
          art: "radial-gradient(120% 120% at 40% 20%,#39ffb0,#0e4a40 50%,#04140f)",
          no: "1", sfx: { t: "SHHH", x: "60%", y: "14%", s: 60, c: "#fff" },
          balloon: { t: "Dust settles. So does the score.", x: "6%", y: "70%" },
          cap: "Page 3 - Smoke clears over a ruined data vault."
        },
        {
          x: 40, y: 700, w: 540, h: 420,
          art: "linear-gradient(135deg,#ffd23f,#a86f06)",
          no: "2", sfx: { t: "TAP", x: "60%", y: "16%", s: 40, c: "#0e0e12" },
          balloon: { t: "Drive's mine. Always was.", x: "6%", y: "60%" },
          cap: "Page 3 - The data spike clicks into her glove."
        },
        {
          x: 620, y: 700, w: 540, h: 420,
          art: "radial-gradient(120% 120% at 30% 70%,#b14dff,#2a0f55 60%,#0c0420)",
          no: "3", sfx: null,
          balloon: { t: "We will meet again, Ronin.", x: "8%", y: "12%" },
          cap: "Page 3 - The Vanguard sinks back into shadow."
        },
        {
          x: 40, y: 1160, w: 1120, h: 400,
          art: "linear-gradient(110deg,#ff2e4d,#2e6bff)",
          no: "4", sfx: { t: "TO BE CONTINUED", x: "26%", y: "40%", s: 58, c: "#fff" },
          balloon: { t: "Count on it.", x: "8%", y: "58%" },
          cap: "Page 3 - She vanishes into the neon rain. (End of issue)"
        }
      ]
    }
  ];

  /* ---- Build a flat panel index across all pages ---- */
  var FLAT = [];
  PAGES.forEach(function (pg, pi) {
    pg.panels.forEach(function (p, idx) {
      FLAT.push({ page: pi, idx: idx });
    });
  });

  /* ---- DOM ---- */
  var stage = document.getElementById("stage");
  var camera = document.getElementById("camera");
  var dotsWrap = document.getElementById("dots");
  var captionEl = document.getElementById("caption");
  var pageNumEl = document.getElementById("pageNum");
  var pageTotalEl = document.getElementById("pageTotal");
  var scrubFill = document.getElementById("scrubFill");
  var toastEl = document.getElementById("toast");

  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var prevZone = document.getElementById("prevZone");
  var nextZone = document.getElementById("nextZone");
  var autoplayBtn = document.getElementById("autoplayBtn");
  var resetBtn = document.getElementById("resetBtn");

  var current = 0; // index into FLAT
  var autoplay = false;
  var autoTimer = null;
  var AUTO_MS = 3200;

  /* ---- Render the virtual canvas ---- */
  function buildCanvas() {
    camera.innerHTML = "";
    pageTotalEl.textContent = String(PAGES.length);

    PAGES.forEach(function (pg, pi) {
      var pageEl = document.createElement("div");
      pageEl.className = "page";
      pageEl.dataset.page = String(pi);
      pageEl.style.width = CANVAS_W + "px";
      pageEl.style.height = CANVAS_H + "px";
      pageEl.style.left = "0px";
      pageEl.style.top = "0px";
      pageEl.style.background = pg.bg;

      pg.panels.forEach(function (p, idx) {
        var panel = document.createElement("div");
        panel.className = "panel";
        panel.dataset.page = String(pi);
        panel.dataset.idx = String(idx);
        panel.style.left = p.x + "px";
        panel.style.top = p.y + "px";
        panel.style.width = p.w + "px";
        panel.style.height = p.h + "px";

        var art = document.createElement("div");
        art.className = "panel__art";
        art.style.background = p.art;
        panel.appendChild(art);

        var no = document.createElement("span");
        no.className = "panel__no";
        no.textContent = p.no;
        panel.appendChild(no);

        if (p.sfx) {
          var sfx = document.createElement("span");
          sfx.className = "panel__sfx";
          sfx.textContent = p.sfx.t;
          sfx.style.left = p.sfx.x;
          sfx.style.top = p.sfx.y;
          sfx.style.fontSize = p.sfx.s + "px";
          if (p.sfx.c) sfx.style.color = p.sfx.c;
          panel.appendChild(sfx);
        }

        if (p.balloon) {
          var b = document.createElement("div");
          b.className = "balloon" + (p.balloon.thought ? " balloon--thought" : "");
          b.textContent = p.balloon.t;
          b.style.left = p.balloon.x;
          b.style.top = p.balloon.y;
          panel.appendChild(b);
        }

        pageEl.appendChild(panel);
      });

      camera.appendChild(pageEl);
    });
  }

  /* ---- Build progress dots for a given page ---- */
  function buildDots(pageIdx) {
    dotsWrap.innerHTML = "";
    var count = PAGES[pageIdx].panels.length;
    for (var i = 0; i < count; i++) {
      var d = document.createElement("button");
      d.className = "pdot";
      d.type = "button";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Panel " + (i + 1) + " of " + count);
      (function (panelIdx) {
        d.addEventListener("click", function () {
          var flat = flatIndexOf(pageIdx, panelIdx);
          goTo(flat, true);
        });
      })(i);
      dotsWrap.appendChild(d);
    }
  }

  function flatIndexOf(page, idx) {
    for (var i = 0; i < FLAT.length; i++) {
      if (FLAT[i].page === page && FLAT[i].idx === idx) return i;
    }
    return 0;
  }

  /* ---- Compute & apply camera transform to fit a panel into the stage ---- */
  function focusPanel(page, idx) {
    var p = PAGES[page].panels[idx];
    var vw = stage.clientWidth;
    var vh = stage.clientHeight;
    if (!vw || !vh) return;

    // padded panel rect in canvas units
    var padX = p.w * PAD;
    var padY = p.h * PAD;
    var rx = p.x - padX;
    var ry = p.y - padY;
    var rw = p.w + padX * 2;
    var rh = p.h + padY * 2;

    // scale so the padded rect fits inside the viewport (contain)
    var scale = Math.min(vw / rw, vh / rh);

    // center the rect in the viewport
    var tx = (vw - rw * scale) / 2 - rx * scale;
    var ty = (vh - rh * scale) / 2 - ry * scale;

    camera.style.transform =
      "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
  }

  /* ---- Activate page + highlight panel ---- */
  function render(animate) {
    var info = FLAT[current];
    var page = info.page;
    var idx = info.idx;

    // show only the active page
    var pages = camera.querySelectorAll(".page");
    pages.forEach(function (pe) {
      pe.classList.toggle("is-active", Number(pe.dataset.page) === page);
    });

    // (re)build dots if page changed
    if (dotsWrap.dataset.page !== String(page)) {
      buildDots(page);
      dotsWrap.dataset.page = String(page);
    }

    // dot selection
    var dots = dotsWrap.querySelectorAll(".pdot");
    dots.forEach(function (d, i) {
      d.setAttribute("aria-selected", i === idx ? "true" : "false");
    });

    // panel focus/dim states
    var panels = camera.querySelectorAll(".panel");
    panels.forEach(function (pe) {
      var samePage = Number(pe.dataset.page) === page;
      var isFocus = samePage && Number(pe.dataset.idx) === idx;
      pe.classList.toggle("is-focus", isFocus);
      pe.classList.toggle("is-dim", samePage && !isFocus);
    });

    pageNumEl.textContent = String(page + 1);
    captionEl.textContent = PAGES[page].panels[idx].cap;

    // scrub across whole issue
    var pct = FLAT.length > 1 ? (current / (FLAT.length - 1)) * 100 : 0;
    scrubFill.style.width = pct.toFixed(1) + "%";

    // camera movement
    var prevTransition = camera.style.transition;
    if (!animate) camera.style.transition = "none";
    focusPanel(page, idx);
    if (!animate) {
      // force reflow then restore
      void camera.offsetWidth;
      camera.style.transition = prevTransition || "";
    }

    // edge button availability hints
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === FLAT.length - 1;
    prevZone.disabled = current === 0;
    nextZone.disabled = current === FLAT.length - 1;
  }

  /* ---- Navigation ---- */
  function goTo(flat, fromUser) {
    var max = FLAT.length - 1;
    flat = Math.max(0, Math.min(max, flat));
    var prevPage = FLAT[current].page;
    current = flat;
    render(true);
    if (fromUser && FLAT[current].page !== prevPage) {
      toast("Page " + (FLAT[current].page + 1));
    }
  }

  function next(fromUser) {
    if (current >= FLAT.length - 1) {
      if (autoplay) setAutoplay(false);
      toast("End of issue");
      return;
    }
    goTo(current + 1, fromUser);
  }

  function prev(fromUser) {
    if (current <= 0) {
      toast("Start of issue");
      return;
    }
    goTo(current - 1, fromUser);
  }

  /* ---- Autoplay ---- */
  function setAutoplay(on) {
    autoplay = on;
    autoplayBtn.setAttribute("aria-pressed", on ? "true" : "false");
    autoplayBtn.querySelector(".btn__label").textContent = on ? "Playing" : "Autoplay";
    clearInterval(autoTimer);
    if (on) {
      toast("Autoplay on");
      autoTimer = setInterval(function () {
        if (current >= FLAT.length - 1) {
          setAutoplay(false);
          toast("End of issue");
        } else {
          goTo(current + 1, false);
        }
      }, AUTO_MS);
    } else {
      toast("Autoplay off");
    }
  }

  /* ---- Toast helper ---- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1500);
  }

  /* ---- Events ---- */
  nextBtn.addEventListener("click", function () { next(true); });
  prevBtn.addEventListener("click", function () { prev(true); });
  nextZone.addEventListener("click", function () { next(true); });
  prevZone.addEventListener("click", function () { prev(true); });
  resetBtn.addEventListener("click", function () {
    setAutoplay(false);
    goTo(0, false);
    toast("Restarted");
  });
  autoplayBtn.addEventListener("click", function () {
    setAutoplay(!autoplay);
  });

  stage.addEventListener("keydown", onKey);
  document.addEventListener("keydown", function (e) {
    // global arrows when focus isn't in a text field
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.target === stage) return; // handled by stage listener
    onKey(e);
  });

  function onKey(e) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "Enter":
        e.preventDefault();
        next(true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prev(true);
        break;
      case "Home":
        e.preventDefault();
        goTo(0, true);
        break;
      case "End":
        e.preventDefault();
        goTo(FLAT.length - 1, true);
        break;
      case "p":
      case "P":
        setAutoplay(!autoplay);
        break;
    }
  }

  // recompute transform on resize (no animation jump)
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { render(false); }, 80);
  });

  /* ---- Boot ---- */
  buildCanvas();
  // wait a frame so layout is measured before first focus
  requestAnimationFrame(function () {
    render(false);
    requestAnimationFrame(function () { render(false); });
  });
})();
