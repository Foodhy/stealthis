/* =========================================================
   Compendia — Encyclopedia Landing
   Vanilla JS: toast, date stamp, search preview dropdown,
   rotating featured article + did-you-know facts.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* Wire any element with data-toast */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) {
      e.preventDefault();
      toast(t.getAttribute("data-toast"));
    }
  });

  /* ---------- date stamp ---------- */
  var now = new Date();
  var longDate = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  var shortDate = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  var otdDate = document.getElementById("otdDate");
  if (otdDate) otdDate.textContent = shortDate;

  /* "today" stat — deterministic-ish edits count from the date */
  var statToday = document.getElementById("statToday");
  if (statToday) {
    var base = 9000 + (now.getDate() * 137 + now.getHours() * 53) % 4000;
    statToday.textContent = base.toLocaleString("en-US");
  }

  /* ---------- search preview ---------- */
  var INDEX = [
    { title: "The Verdant Empire", snip: "Confederated agrarian state, fl. 412–1089." },
    { title: "Aurora DB", snip: "Early column-store ledger system." },
    { title: "Project Nimbus", snip: "Sub-orbital relay programme." },
    { title: "Lumen Observatory", snip: "High-altitude astronomical station." },
    { title: "The Marble Concordat", snip: "Multilateral trade treaty of the seven leagues." },
    { title: "Codex Viridis", snip: "Foundational agronomic manuscript." },
    { title: "Glass Aqueduct of Lethe", snip: "Gravity-fed meltwater channel, 180 km." },
    { title: "Halcyon-IX", snip: "Ringed gas giant of the outer system." },
    { title: "Library of Saltmarsh", snip: "Rediscovered estuarine archive." },
    { title: "Mira Solveig", snip: "Cartographer of the Inner Sea atlas." },
    { title: "Great Silt Drought", snip: "Climatic event preceding the empire's decline." },
    { title: "Council of Stewards", snip: "Governing assembly of the Verdant Empire." },
    { title: "Verdant Assembly", snip: "First chartered parliament of the river basins." },
    { title: "Terraced hydro-gardens", snip: "Signature irrigation architecture." },
    { title: "Inner Sea", snip: "Enclosed body of water at the continental core." },
  ];

  var input = document.getElementById("searchInput");
  var preview = document.getElementById("searchPreview");
  var form = document.getElementById("topSearch");
  var activeIdx = -1;
  var currentMatches = [];

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return escapeHtml(text);
    return (
      escapeHtml(text.slice(0, i)) +
      "<b>" + escapeHtml(text.slice(i, i + q.length)) + "</b>" +
      escapeHtml(text.slice(i + q.length))
    );
  }

  function openPreview() {
    preview.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  function closePreview() {
    preview.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIdx = -1;
  }

  function renderPreview() {
    var q = input.value.trim();
    if (q.length < 1) { closePreview(); return; }

    currentMatches = INDEX.filter(function (a) {
      return (a.title + " " + a.snip).toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }).slice(0, 7);

    activeIdx = -1;
    var html = "";
    if (currentMatches.length === 0) {
      html =
        '<div class="search-preview__empty">No articles match “' +
        escapeHtml(q) + '”. Try a different term.</div>';
    } else {
      currentMatches.forEach(function (a, idx) {
        html +=
          '<a class="search-preview__item" role="option" data-idx="' + idx + '" href="#">' +
          highlight(a.title, q) +
          '<span class="sp-snip">' + escapeHtml(a.snip) + "</span></a>";
      });
      html +=
        '<div class="search-preview__hint"><kbd>↑</kbd><kbd>↓</kbd> navigate · ' +
        "<kbd>Enter</kbd> open · <kbd>Esc</kbd> close</div>";
    }
    preview.innerHTML = html;
    openPreview();
  }

  function setActive(idx) {
    var items = preview.querySelectorAll(".search-preview__item");
    if (!items.length) return;
    activeIdx = (idx + items.length) % items.length;
    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === activeIdx);
    });
    items[activeIdx].scrollIntoView({ block: "nearest" });
  }

  if (input) {
    input.addEventListener("input", renderPreview);
    input.addEventListener("focus", function () {
      if (input.value.trim()) renderPreview();
    });

    input.addEventListener("keydown", function (e) {
      var items = preview.querySelectorAll(".search-preview__item");
      if (e.key === "ArrowDown") { e.preventDefault(); if (items.length) setActive(activeIdx + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (items.length) setActive(activeIdx - 1); }
      else if (e.key === "Escape") { closePreview(); }
      else if (e.key === "Enter") {
        if (activeIdx >= 0 && currentMatches[activeIdx]) {
          e.preventDefault();
          toast("Opening “" + currentMatches[activeIdx].title + "” (illustrative).");
          closePreview();
        }
      }
    });

    preview.addEventListener("click", function (e) {
      var item = e.target.closest(".search-preview__item");
      if (!item) return;
      e.preventDefault();
      var idx = parseInt(item.getAttribute("data-idx"), 10);
      toast("Opening “" + currentMatches[idx].title + "” (illustrative).");
      closePreview();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) { toast("Type something to search."); return; }
      toast("Searching for “" + q + "” (illustrative).");
      closePreview();
    });
  }

  document.addEventListener("click", function (e) {
    if (form && !form.contains(e.target)) closePreview();
  });

  /* Keyboard shortcut: "/" focuses search */
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input &&
        !/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || "")) {
      e.preventDefault();
      input && input.focus();
    }
  });

  /* ---------- rotating featured article ---------- */
  var FEATURED = [
    {
      art: "thumb-art--aurora",
      cap: "Aurora over the Verdant Empire's northern reach",
      title: "The Verdant Empire",
      body:
        "The <b>Verdant Empire</b> (fl. 412–1089) was a confederated agrarian state spanning the river basins of the central continent. Renowned for its terraced hydro-gardens and the <a href=\"#\" data-toast=\"Illustrative link.\">Codex Viridis</a>, the empire pioneered a system of canal-borne courier networks that linked over four hundred chartered townships. Its decline followed the <a href=\"#\" data-toast=\"Illustrative link.\">Great Silt Drought</a>, after which the ruling Council of Stewards dissolved into rival city-leagues. ",
      more:
        "At its height the empire's <a href=\"#\" data-toast=\"Illustrative link.\">grain reserves</a> were said to feed a population of nine million across three climatic zones. <em>(Full article…)</em>",
    },
    {
      art: "thumb-art--news",
      cap: "Schematic of an Aurora DB column segment",
      title: "Aurora DB",
      body:
        "<b>Aurora DB</b> was an early column-store ledger system first demonstrated in 1969. By storing each attribute contiguously rather than by row, it allowed analysts to scan a single field across millions of records without reading whole entries. The design influenced a generation of <a href=\"#\" data-toast=\"Illustrative link.\">analytic engines</a> and remains a touchstone in the study of storage layouts. ",
      more:
        "Surviving documentation suggests Aurora DB could compress repetitive columns by a factor of forty, a figure not matched commercially for two decades. <em>(Full article…)</em>",
    },
    {
      art: "thumb-art--aurora",
      cap: "Idealised view of a Project Nimbus relay craft",
      title: "Project Nimbus",
      body:
        "<b>Project Nimbus</b> is a civilian programme to establish a constellation of sub-orbital relay craft providing low-latency links between remote townships. Each craft loiters at the edge of the mesosphere, handing off signals as it drifts. The first relay completed a successful demonstration flight this season, carried aloft by a reusable lifting body. ",
      more:
        "Engineers estimate a full constellation of <a href=\"#\" data-toast=\"Illustrative link.\">two hundred craft</a> would blanket the inhabited continent. <em>(Full article…)</em>",
    },
  ];

  var faContainer = document.getElementById("featuredArticle");
  var faRotor = document.getElementById("faRotor");
  var faIdx = 0;

  function renderFeatured(i) {
    var f = FEATURED[i];
    faContainer.innerHTML =
      '<figure class="fa__thumb" aria-hidden="true">' +
        '<div class="thumb-art ' + f.art + '"></div>' +
        "<figcaption>" + f.cap + "</figcaption>" +
      "</figure>" +
      '<h3 class="fa__title"><a href="#" data-toast="Article view is illustrative.">' + f.title + "</a></h3>" +
      '<p class="fa__text">' + f.body +
        '<span class="fa__more">' + f.more + "</span></p>" +
      '<p class="fa__meta">Recently featured: ' +
        '<a href="#" data-toast="Illustrative link.">Project Nimbus</a> · ' +
        '<a href="#" data-toast="Illustrative link.">Aurora DB</a> · ' +
        '<a href="#" data-toast="Illustrative link.">The Marble Concordat</a></p>';
    // reveal-more on title click
    var titleLink = faContainer.querySelector(".fa__title a");
    titleLink.addEventListener("click", function (e) {
      e.preventDefault();
      faContainer.classList.toggle("is-expanded");
      toast(faContainer.classList.contains("is-expanded") ? "Expanded article preview." : "Collapsed article preview.");
    });
  }

  if (faContainer && faRotor) {
    renderFeatured(faIdx);
    faRotor.addEventListener("click", function () {
      faIdx = (faIdx + 1) % FEATURED.length;
      renderFeatured(faIdx);
      faRotor.classList.remove("is-spin");
      void faRotor.offsetWidth;
      faRotor.classList.add("is-spin");
    });
  }

  /* ---------- rotating "did you know" facts ---------- */
  var DYK = [
    "… that the <a href=\"#\" data-toast=\"Illustrative link.\">Glass Aqueduct of Lethe</a> carried meltwater for over <b>180 kilometres</b> without a single pump?",
    "… that scribes of the <a href=\"#\" data-toast=\"Illustrative link.\">Codex Viridis</a> used a colour-coded ink to denote crop rotations across <b>twelve seasons</b>?",
    "… that <a href=\"#\" data-toast=\"Illustrative link.\">Aurora DB</a> could compress a repetitive column by a factor of <b>forty</b>, decades before commercial systems matched it?",
    "… that the ringed giant <a href=\"#\" data-toast=\"Illustrative link.\">Halcyon-IX</a> hosts a sixth ring made almost entirely of water ice?",
    "… that the <a href=\"#\" data-toast=\"Illustrative link.\">Library of Saltmarsh</a> was preserved because the estuary that flooded it also sealed it in airless silt?",
    "… that cartographer <a href=\"#\" data-toast=\"Illustrative link.\">Mira Solveig</a> mapped the entire Inner Sea using only a sun-staff and a knotted line?",
  ];

  var dykList = document.getElementById("dykList");
  var dykRotor = document.getElementById("dykRotor");
  var dykIdx = 0;

  function renderDyk(i) {
    if (!dykList) return;
    dykList.innerHTML = "<li>" + DYK[i] + "</li>";
  }

  if (dykList && dykRotor) {
    renderDyk(dykIdx);
    dykRotor.addEventListener("click", function () {
      dykIdx = (dykIdx + 1) % DYK.length;
      renderDyk(dykIdx);
      dykRotor.classList.remove("is-spin");
      void dykRotor.offsetWidth;
      dykRotor.classList.add("is-spin");
    });
    /* auto-rotate gently */
    setInterval(function () {
      dykIdx = (dykIdx + 1) % DYK.length;
      renderDyk(dykIdx);
    }, 9000);
  }

  /* ---------- animated article-count tick on load ---------- */
  var statArticles = document.getElementById("statArticles");
  if (statArticles) {
    var target = 6481003;
    var startVal = target - 1400;
    var dur = 900;
    var t0 = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(startVal + (target - startVal) * eased);
      statArticles.textContent = val.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      requestAnimationFrame(tick);
    } else {
      statArticles.textContent = target.toLocaleString("en-US");
    }
  }

  /* friendly first-load nudge */
  setTimeout(function () { toast("Welcome to Compendia — press “/” to search."); }, 700);
})();
