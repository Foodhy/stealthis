/* Nova Reel — Videographer Portfolio Grid
   Vanilla JS. Renders cards, filters by type, hover-scrubs preview frames,
   and opens a letterboxed detail lightbox with a scrubbable timeline. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Data (fictional) ---------------------------------------------- */
  var CATS = {
    all: "All",
    commercial: "Commercial",
    music: "Music Video",
    doc: "Documentary",
    short: "Short Film"
  };

  // Each project carries a set of gradient "frames" the hover-scrub cycles
  // through, plus metadata for the detail lightbox.
  var PROJECTS = [
    {
      id: "p-atlas", cat: "commercial", title: "Atlas — Electric",
      client: "Atlas Motors", role: "Director / DP", year: "2026",
      camera: "Sony FX6 · 24mm", dur: "02:41", durMs: 161000,
      tags: ["4K DCI", "Anamorphic"],
      syn: "A dusk-lit hero spot for the Atlas EV — long dolly moves over wet asphalt, amber street reflections, cut to a driving synth pulse.",
      frames: ["#3a2a12", "#5c3d10", "#8a5a12", "#c07c14", "#5c3d10"]
    },
    {
      id: "p-neon", cat: "music", title: "Neon Tide",
      client: "Kova (feat. Lys)", role: "Director", year: "2026",
      camera: "RED Komodo · 35mm", dur: "03:58", durMs: 238000,
      tags: ["6K", "Strobe"],
      syn: "A one-take performance video drenched in magenta haze, practical neon rigs, and a slow 360° orbit that locks to the drop.",
      frames: ["#2a1030", "#4a1250", "#7a1470", "#b0208a", "#4a1250"]
    },
    {
      id: "p-shore", cat: "doc", title: "The Last Shore",
      client: "Meridian Films", role: "Cinematographer", year: "2025",
      camera: "ARRI Amira · 50mm", dur: "12:07", durMs: 727000,
      tags: ["Verité", "Handheld"],
      syn: "A short documentary following coastal fishers at first light — natural grade, salt-worn faces, and the sea doing the talking.",
      frames: ["#0d2430", "#124050", "#186278", "#2a8299", "#124050"]
    },
    {
      id: "p-ember", cat: "short", title: "Ember Room",
      client: "Independent", role: "Writer / Director", year: "2025",
      camera: "Blackmagic 6K · 85mm", dur: "08:22", durMs: 502000,
      tags: ["Narrative", "Low-key"],
      syn: "A two-hander drama shot almost entirely by firelight — warm falloff, close coverage, tension held in the silences.",
      frames: ["#301505", "#4c2208", "#70330c", "#a04a10", "#4c2208"]
    },
    {
      id: "p-flux", cat: "commercial", title: "Flux Skincare",
      client: "Flux Labs", role: "DP", year: "2026",
      camera: "Sony FX3 · 90mm macro", dur: "00:45", durMs: 45000,
      tags: ["Macro", "Highspeed"],
      syn: "Glossy product film — 1000fps droplet macros, seamless white cyc, and a clean minty grade for a launch campaign.",
      frames: ["#123028", "#164a3a", "#1c6a52", "#28926f", "#164a3a"]
    },
    {
      id: "p-pulse", cat: "music", title: "Pulsewave",
      client: "Distant Rooms", role: "Director / Editor", year: "2025",
      camera: "RED Komodo · 18mm", dur: "02:57", durMs: 177000,
      tags: ["Projection", "In-camera"],
      syn: "In-camera projection mapping across a live band — geometric light spilling over instruments, no post comps.",
      frames: ["#101a3a", "#14245c", "#1a3488", "#2a4ab0", "#14245c"]
    },
    {
      id: "p-north", cat: "doc", title: "North of Quiet",
      client: "Boreal Trust", role: "DP", year: "2025",
      camera: "ARRI Amira · 28mm", dur: "09:41", durMs: 581000,
      tags: ["Aerial", "Timelapse"],
      syn: "Landscape doc on a rewilding project — drone glides over frost, day-to-night timelapses, an unhurried, cold-blue palette.",
      frames: ["#12222c", "#1a3644", "#245262", "#367888", "#1a3644"]
    },
    {
      id: "p-solace", cat: "short", title: "Solace",
      client: "Nightfall Collective", role: "Cinematographer", year: "2024",
      camera: "Blackmagic 6K · 35mm", dur: "06:14", durMs: 374000,
      tags: ["Rain rig", "Night ext"],
      syn: "A rain-soaked night exterior piece — sodium streetlamps, reflective puddles, a lone figure and a slow push-in.",
      frames: ["#241028", "#3a1642", "#54205e", "#7a3084", "#3a1642"]
    },
    {
      id: "p-crest", cat: "commercial", title: "Crest Coffee",
      client: "Crest Roasters", role: "Director / DP", year: "2026",
      camera: "Sony FX6 · 50mm", dur: "01:12", durMs: 72000,
      tags: ["Tabletop", "Slider"],
      syn: "A cozy morning brand film — steam catching window light, tactile slider moves, and a golden, grain-kissed grade.",
      frames: ["#2c1a08", "#48280c", "#6a3c12", "#985a18", "#48280c"]
    },
    {
      id: "p-vertigo", cat: "music", title: "Vertigo Lights",
      client: "Halcyon", role: "Director", year: "2024",
      camera: "RED Komodo · 24mm", dur: "04:03", durMs: 243000,
      tags: ["Gimbal", "Long-lens"],
      syn: "A rooftop performance at blue hour — sweeping gimbal orbits, city bokeh, and a cool teal-to-amber contrast grade.",
      frames: ["#0e2830", "#123c44", "#185462", "#c07c14", "#123c44"]
    },
    {
      id: "p-relay", cat: "doc", title: "Relay",
      client: "Field & Signal", role: "DP", year: "2024",
      camera: "ARRI Amira · 40mm", dur: "10:58", durMs: 658000,
      tags: ["Interview", "Archival"],
      syn: "A documentary on amateur radio operators — warm interview coverage intercut with grainy archival transfers.",
      frames: ["#2a1e0c", "#443210", "#634a16", "#8c6a1e", "#443210"]
    },
    {
      id: "p-hollow", cat: "short", title: "Hollow Hour",
      client: "Independent", role: "Writer / Director", year: "2024",
      camera: "Blackmagic 6K · 100mm", dur: "07:36", durMs: 456000,
      tags: ["Thriller", "Steadicam"],
      syn: "A slow-burn thriller short — long Steadicam corridors, cold key light, and a desaturated, high-contrast look.",
      frames: ["#141820", "#1e2632", "#2c3848", "#465468", "#1e2632"]
    }
  ];

  /* ---- Helpers -------------------------------------------------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  function frameBg(color) {
    // Layer a soft vignette + directional light over the base tone.
    return (
      "radial-gradient(120% 90% at 30% 15%, rgba(255,255,255,.12), transparent 55%)," +
      "radial-gradient(90% 80% at 85% 100%, rgba(0,0,0,.5), transparent 60%)," +
      "linear-gradient(160deg, " + color + ", #0a0a0b)"
    );
  }

  function msToTc(ms) {
    var t = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(t / 60);
    var s = t % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---- Card rendering ------------------------------------------------- */
  var grid = $("#grid");
  var countEl = $("#count");
  var emptyEl = $("#empty");

  function buildCard(p, i) {
    var card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.setAttribute("role", "listitem");
    card.dataset.id = p.id;
    card.dataset.cat = p.cat;
    card.style.animationDelay = (reduceMotion ? 0 : Math.min(i, 8) * 45) + "ms";
    card.setAttribute("aria-label", p.title + " — " + CATS[p.cat] + ", " + p.dur);

    var framesHtml = p.frames
      .map(function (c, fi) {
        return '<div class="thumb-frame' + (fi === 0 ? " is-on" : "") +
          '" style="background:' + frameBg(c) + '"></div>';
      })
      .join("");

    var tagsHtml = p.tags
      .map(function (t) { return '<span class="tag">' + t + "</span>"; })
      .join("");

    card.innerHTML =
      '<div class="thumb">' +
        framesHtml +
        '<span class="cat">' + CATS[p.cat] + "</span>" +
        '<span class="dur">' + p.dur + "</span>" +
        '<span class="play-hint"><span></span></span>' +
        '<span class="scrub"></span>' +
      "</div>" +
      '<div class="card-body">' +
        '<h3 class="card-title">' + p.title + "</h3>" +
        '<p class="card-sub">' + p.client + " · " + p.year + "</p>" +
        '<div class="card-tags">' + tagsHtml + "</div>" +
      "</div>";

    attachScrub(card, p);
    card.addEventListener("click", function () { openLightbox(p.id); });
    return card;
  }

  /* ---- Hover scrub ---------------------------------------------------- */
  function attachScrub(card, p) {
    if (reduceMotion) return;
    var frames = card.querySelectorAll(".thumb-frame");
    var scrub = $(".scrub", card);
    var idx = 0;
    var timer = null;

    function step() {
      frames[idx].classList.remove("is-on");
      idx = (idx + 1) % frames.length;
      frames[idx].classList.add("is-on");
      scrub.style.width = ((idx / (frames.length - 1)) * 100) + "%";
    }
    function start() {
      if (timer) return;
      timer = setInterval(step, 520);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      frames.forEach(function (f, i) { f.classList.toggle("is-on", i === 0); });
      idx = 0;
      scrub.style.width = "0";
    }
    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focus", start);
    card.addEventListener("blur", stop);
  }

  /* ---- Filtering ------------------------------------------------------ */
  var current = "all";

  function render() {
    grid.innerHTML = "";
    var list = PROJECTS.filter(function (p) {
      return current === "all" || p.cat === current;
    });
    list.forEach(function (p, i) { grid.appendChild(buildCard(p, i)); });

    var n = list.length;
    countEl.textContent = n + (n === 1 ? " project" : " projects");
    emptyEl.hidden = n !== 0;
  }

  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      current = chip.dataset.filter;
      render();
    });
  });

  /* ---- Lightbox ------------------------------------------------------- */
  var lb = $("#lightbox");
  var lbFrame = $("#lb-frame");
  var lbCat = $("#lb-cat");
  var lbTitle = $("#lb-title");
  var lbSyn = $("#lb-syn");
  var lbClient = $("#lb-client");
  var lbRole = $("#lb-role");
  var lbYear = $("#lb-year");
  var lbCam = $("#lb-cam");
  var lbScrub = $("#lb-scrub");
  var lbCur = $("#lb-cur");
  var lbDur = $("#lb-dur");
  var lastFocus = null;
  var activeProject = null;

  function paintScrubFrame(p, ratio) {
    // Map the 0..1 playhead onto the project's frame palette.
    var fi = Math.min(p.frames.length - 1, Math.floor(ratio * p.frames.length));
    lbFrame.style.background = frameBg(p.frames[fi]);
    lbCur.textContent = msToTc(ratio * p.durMs);
  }

  function fillLightbox(p) {
    activeProject = p;
    lbCat.textContent = CATS[p.cat];
    lbTitle.textContent = p.title;
    lbSyn.textContent = p.syn;
    lbClient.textContent = p.client;
    lbRole.textContent = p.role;
    lbYear.textContent = p.year;
    lbCam.textContent = p.camera;
    lbDur.textContent = p.dur;
    lbScrub.value = 0;
    paintScrubFrame(p, 0);
  }

  function openLightbox(id) {
    var p = PROJECTS.find(function (x) { return x.id === id; });
    if (!p) return;
    lastFocus = document.activeElement;
    fillLightbox(p);
    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeProject = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Visible (filtered) order, so prev/next respects the active filter.
  function visibleList() {
    return PROJECTS.filter(function (p) {
      return current === "all" || p.cat === current;
    });
  }
  function step(dir) {
    if (!activeProject) return;
    var list = visibleList();
    var i = list.findIndex(function (p) { return p.id === activeProject.id; });
    if (i === -1) list = PROJECTS, i = PROJECTS.findIndex(function (p) { return p.id === activeProject.id; });
    var next = (i + dir + list.length) % list.length;
    fillLightbox(list[next]);
  }

  lbScrub.addEventListener("input", function () {
    if (!activeProject) return;
    paintScrubFrame(activeProject, lbScrub.value / 1000);
  });

  lb.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") { closeLightbox(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "Tab") {
      // Simple focus trap within the panel.
      var f = lb.querySelectorAll("button, input, a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---- Global click actions (copy / scroll / open) -------------------- */
  document.addEventListener("click", function (e) {
    var copyEl = e.target.closest("[data-copy]");
    if (copyEl) {
      var text = copyEl.getAttribute("data-copy");
      if (activeProject && text.slice(-1) === "/") text += activeProject.id.replace(/^p-/, "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { toast("Copied: " + text); },
          function () { toast(text); }
        );
      } else {
        toast(text);
      }
      return;
    }
    var scrollEl = e.target.closest("[data-scroll]");
    if (scrollEl) {
      var target = $(scrollEl.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    var openEl = e.target.closest("[data-open]");
    if (openEl) openLightbox(openEl.getAttribute("data-open"));
  });

  /* ---- Footer timecode ticker ---------------------------------------- */
  var footTc = $(".foot-tc");
  if (footTc && !reduceMotion) {
    var frame = 0;
    setInterval(function () {
      frame = (frame + 1) % 24;
      var d = new Date();
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      footTc.textContent =
        "TC " + pad(d.getHours()) + ":" + pad(d.getMinutes()) +
        ":" + pad(d.getSeconds()) + ":" + pad(frame);
    }, 1000 / 24);
  }

  /* ---- Init ----------------------------------------------------------- */
  render();
})();
