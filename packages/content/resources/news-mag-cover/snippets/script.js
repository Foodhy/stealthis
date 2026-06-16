(function () {
  "use strict";

  /* -------------------------------------------------------------
   * Issue data — three fully art-directed, fictional covers.
   * ----------------------------------------------------------- */
  var ISSUES = [
    {
      id: "night",
      no: "Issue 214",
      name: "Blackout",
      date: "June 2026",
      price: "$9.50 · £7",
      barcode: "7 71289 02140 4",
      tagline: "Culture · Reckoning · The City After Dark",
      heroKicker: "The Cover Story",
      heroTitle: "The Long Night<br />of the City",
      heroDeck:
        "How a single power cut redrew a metropolis — and the people who refused to sleep through it.",
      heroByline: "By Imogen Calloway · Photographs by R. Voss",
      caption:
        "rooftops above the financial district, 03:14.",
      credit: "Photo — R. Voss / Meridian",
      left: [
        { kicker: "Investigation", line: "Who Owns the Grid?", page: "p. 28" },
        { kicker: "Dispatch", line: "Nineteen Hours in the Dark", page: "p. 44" }
      ],
      right: [
        { kicker: "Profile", line: "The Last Switchboard Operator", page: "p. 56" },
        { kicker: "Essay", line: "In Praise of Candlelight", page: "p. 70" }
      ]
    },
    {
      id: "heat",
      no: "Issue 215",
      name: "Heatwave",
      date: "July 2026",
      price: "$9.50 · £7",
      barcode: "7 71289 02157 2",
      tagline: "Climate · Labour · The Summer That Wouldn't End",
      heroKicker: "Special Report",
      heroTitle: "Forty Days<br />of Forty Degrees",
      heroDeck:
        "The summer the asphalt softened, the reservoirs cracked, and a whole city learned to move at night.",
      heroByline: "By Daniel Okafor · Photographs by L. Marchetti",
      caption:
        "the dry bed of the Verdon reservoir at noon.",
      credit: "Photo — L. Marchetti / Meridian",
      left: [
        { kicker: "Frontlines", line: "The Roofers Who Work at Dawn", page: "p. 22" },
        { kicker: "Science", line: "Reading a City's Fever Chart", page: "p. 38" }
      ],
      right: [
        { kicker: "Memoir", line: "My Grandmother's Cold Room", page: "p. 60" },
        { kicker: "Design", line: "Architecture for a Hotter World", page: "p. 74" }
      ]
    },
    {
      id: "tide",
      no: "Issue 216",
      name: "High Tide",
      date: "August 2026",
      price: "$9.50 · £7",
      barcode: "7 71289 02164 0",
      tagline: "Coastlines · Memory · What the Water Takes",
      heroKicker: "The Cover Story",
      heroTitle: "When the Sea<br />Comes Inland",
      heroDeck:
        "On a sinking coast, a fishing town decides what to save, what to move, and what to let the tide have.",
      heroByline: "By Sofia Renaud · Photographs by H. Vance",
      caption:
        "the breakwater at Saint-Cleir, two hours before high water.",
      credit: "Photo — H. Vance / Meridian",
      left: [
        { kicker: "Reportage", line: "The Town That Voted to Leave", page: "p. 30" },
        { kicker: "Oral History", line: "Voices From Below the Line", page: "p. 48" }
      ],
      right: [
        { kicker: "Portfolio", line: "Atlas of a Vanishing Shore", page: "p. 62" },
        { kicker: "Comment", line: "There Is No Higher Ground", page: "p. 78" }
      ]
    }
  ];

  /* -------------------------------------------------------------
   * Element refs
   * ----------------------------------------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var cover = $("cover");
  var photo = $("photo");
  var shine = cover.querySelector(".cover__shine");
  var toastEl = $("toast");

  var refs = {
    flagIssue: $("flagIssue"),
    flagDate: $("flagDate"),
    flagPrice: $("flagPrice"),
    tagline: $("tagline"),
    heroKicker: $("heroKicker"),
    heroTitle: $("heroTitle"),
    heroDeck: $("heroDeck"),
    heroByline: $("heroByline"),
    caption: $("caption"),
    barcodeNum: $("barcodeNum"),
    colLeft: $("colLeft"),
    colRight: $("colRight")
  };

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------
   * Toast helper
   * ----------------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2000);
  }

  /* -------------------------------------------------------------
   * Render a cover line column
   * ----------------------------------------------------------- */
  function renderColumn(ul, items) {
    ul.innerHTML = "";
    items.forEach(function (it) {
      var li = document.createElement("li");
      var k = document.createElement("span");
      k.className = "cl-kicker";
      k.textContent = it.kicker;
      var line = document.createElement("span");
      line.className = "cl-line";
      line.textContent = it.line + " ";
      var pg = document.createElement("span");
      pg.className = "cl-page";
      pg.textContent = it.page;
      line.appendChild(pg);
      li.appendChild(k);
      li.appendChild(line);
      ul.appendChild(li);
    });
  }

  /* -------------------------------------------------------------
   * Apply an issue to the cover
   * ----------------------------------------------------------- */
  function applyIssue(issue, announce) {
    cover.setAttribute("data-issue", issue.id);

    refs.flagIssue.textContent = issue.no;
    refs.flagDate.textContent = issue.date;
    refs.flagPrice.textContent = issue.price;
    refs.tagline.textContent = issue.tagline;
    refs.heroKicker.textContent = issue.heroKicker;
    refs.heroTitle.innerHTML = issue.heroTitle;
    refs.heroDeck.textContent = issue.heroDeck;
    refs.heroByline.textContent = issue.heroByline;
    refs.barcodeNum.textContent = issue.barcode;

    refs.caption.innerHTML =
      '<em>On the cover:</em> ' + issue.caption +
      ' <span class="foot__credit">' + issue.credit + "</span>";

    renderColumn(refs.colLeft, issue.left);
    renderColumn(refs.colRight, issue.right);

    if (announce) {
      toast("Now showing — " + issue.no + ": " + issue.name);
    }
  }

  /* -------------------------------------------------------------
   * Build the switcher
   * ----------------------------------------------------------- */
  var switcher = $("switcher");
  var buttons = [];

  ISSUES.forEach(function (issue, i) {
    var btn = document.createElement("button");
    btn.className = "issue-btn";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.dataset.index = String(i);

    btn.innerHTML =
      '<span class="issue-btn__swatch issue-btn__swatch--' + issue.id + '"></span>' +
      '<span class="issue-btn__meta">' +
      '<span class="issue-btn__no">' + issue.no + "</span>" +
      '<span class="issue-btn__name">' + issue.name + "</span>" +
      "</span>";

    btn.addEventListener("click", function () {
      select(i, true);
    });

    switcher.appendChild(btn);
    buttons.push(btn);
  });

  function select(index, announce) {
    buttons.forEach(function (b, i) {
      b.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    applyIssue(ISSUES[index], announce);
  }

  // keyboard arrow navigation across tabs
  switcher.addEventListener("keydown", function (e) {
    var current = buttons.findIndex(function (b) {
      return b.getAttribute("aria-selected") === "true";
    });
    if (current < 0) current = 0;
    var next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % buttons.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
    if (next !== null) {
      e.preventDefault();
      select(next, true);
      buttons[next].focus();
    }
  });

  /* -------------------------------------------------------------
   * Pointer tilt + gloss parallax
   * ----------------------------------------------------------- */
  if (!prefersReduced) {
    var raf = null;
    var pending = null;

    function onMove(e) {
      var r = cover.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;   // 0..1
      pending = { px: px, py: py };
      if (!raf) raf = requestAnimationFrame(flush);
    }

    function flush() {
      raf = null;
      if (!pending) return;
      var px = Math.max(0, Math.min(1, pending.px));
      var py = Math.max(0, Math.min(1, pending.py));

      var rotY = (px - 0.5) * 12;   // left/right
      var rotX = (0.5 - py) * 9;    // up/down
      cover.style.setProperty("--tx", rotY.toFixed(2) + "deg");
      cover.style.setProperty("--ty", rotX.toFixed(2) + "deg");

      shine.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      shine.style.setProperty("--my", (py * 100).toFixed(1) + "%");

      // gentle counter-parallax on the photo
      photo.style.transform =
        "translate(" + ((px - 0.5) * -10).toFixed(1) + "px," +
        ((py - 0.5) * -10).toFixed(1) + "px) scale(1.06)";
    }

    function reset() {
      cover.style.setProperty("--tx", "0deg");
      cover.style.setProperty("--ty", "0deg");
      shine.style.setProperty("--mx", "30%");
      shine.style.setProperty("--my", "18%");
      photo.style.transform = "translate(0,0) scale(1.04)";
    }

    cover.addEventListener("pointermove", onMove);
    cover.addEventListener("pointerleave", reset);
    reset();
  }

  /* -------------------------------------------------------------
   * Boot
   * ----------------------------------------------------------- */
  applyIssue(ISSUES[0], false);
})();
