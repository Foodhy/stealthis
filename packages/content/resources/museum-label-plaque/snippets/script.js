/* Object Label / Wall Plaque — demo data + interactions (vanilla JS) */
(function () {
  "use strict";

  /* ---------------- demo collection ---------------- */
  var WORKS = [
    {
      id: "MC.1971.214",
      artist: "Esme Caldarone",
      life: "Italian, 1889–1974",
      title: "The Tidewater Letters",
      year: "1937",
      medium: "Oil and gold leaf on linen",
      dims: "146 × 112 cm (57 1/2 × 44 1/8 in.)",
      credit: "Gift of the Lindqvist Family Foundation, 1971",
      kind: "Painting",
      grad: "linear-gradient(150deg,#c9a14a 0%,#9d6b3f 48%,#3b2f2a 100%)",
      shape: "circle",
      tags: ["On view", "Gallery 14"],
      onView: true,
      interp:
        "Caldarone painted this estuary scene from memory after fleeing the coast of her childhood. The flecks of gold leaf — applied last, against the artist's usual practice — catch raking gallery light, so the water appears to shift as visitors move past.",
      kidsTitle: "Can you find the shiny water?",
      kids:
        "This painting glows because the artist pressed tiny pieces of real gold onto it. Walk side to side and watch the river sparkle. What sounds do you think this place would make?"
    },
    {
      id: "MC.1989.007",
      artist: "Joren Vasco",
      life: "Brazilian, b. 1952",
      title: "Counterweight (No. 3)",
      year: "1988",
      medium: "Welded steel and patinated bronze",
      dims: "204 × 90 × 90 cm (80 5/16 × 35 7/16 × 35 7/16 in.)",
      credit: "Museum purchase with funds from the Acquisitions Circle, 1989",
      kind: "Sculpture",
      grad: "linear-gradient(135deg,#6f7479 0%,#3c4044 55%,#1c1b19 100%)",
      shape: "bars",
      tags: ["On view", "Fragile"],
      onView: true,
      fragile: true,
      interp:
        "Three cantilevered arms hold one another in tension; remove any single member and the whole composition would collapse. Vasco, trained as a bridge engineer, described the piece as 'a structure arguing with itself.'",
      kidsTitle: "How does it stand up?",
      kids:
        "Each metal arm is leaning on the others — like friends holding hands in a circle so nobody falls. The artist used to build real bridges! Which arm do you think is working hardest?"
    },
    {
      id: "MC.2004.118",
      artist: "Hana Okuýama",
      life: "Japanese, b. 1968",
      title: "Field Notes, Winter",
      year: "2002",
      medium: "Sumi ink and mineral pigment on kozo paper",
      dims: "Each sheet 38 × 27 cm; installation variable",
      credit: "Promised gift of the artist in honor of Dr. Imelda Roan",
      kind: "Works on Paper",
      grad: "linear-gradient(160deg,#eef0f2 0%,#cdd2d6 50%,#8c9398 100%)",
      shape: "grid",
      tags: ["On view", "Light sensitive"],
      onView: true,
      fragile: true,
      interp:
        "Okuýama records a single hillside across forty winter mornings. Because the pigments fade under prolonged exposure, the museum rotates which sheets are shown — no visitor sees the same field twice.",
      kidsTitle: "Forty cold mornings",
      kids:
        "The artist drew the same hill again and again on snowy days. We can only show a few drawings at a time so the colors stay bright. If you drew outside your window every morning, what would change?"
    },
    {
      id: "MC.1958.402",
      artist: "Unknown",
      life: "Workshop of the Lower Vey, active c. 1610–1650",
      title: "Ewer with Heron Frieze",
      year: "c. 1630",
      medium: "Tin-glazed earthenware (faience)",
      dims: "H. 34.3 cm (13 1/2 in.)",
      credit: "Bequest of Cornelia P. Marsh, 1958",
      kind: "Decorative Arts",
      grad: "linear-gradient(145deg,#e7e2d4 0%,#b9bcd0 50%,#5b6c86 100%)",
      shape: "vessel",
      tags: ["In storage"],
      onView: false,
      interp:
        "The herons circling this ewer's shoulder were a workshop signature, repeated across surviving pieces with slight variation. Conservators recently identified a hidden potter's mark beneath the foot, suggesting an apprentice's hand.",
      kidsTitle: "Count the birds",
      kids:
        "This jug is almost 400 years old! Tall birds called herons march around the top. Long ago a young helper may have painted them. How many birds can you count going all the way around?"
    }
  ];

  /* ---------------- placeholder artwork (inline SVG) ---------------- */
  function artSvg(w) {
    var s = '<svg viewBox="0 0 240 180" role="img" aria-label="' +
      esc(w.title) + ' by ' + esc(w.artist) + '" preserveAspectRatio="xMidYMid slice">';
    s += '<defs><linearGradient id="g-' + w.id.replace(/\W/g, "") +
      '" x1="0" y1="0" x2="1" y2="1">';
    s += '<stop offset="0" stop-color="' + gradStop(w.grad, 0) + '"/>';
    s += '<stop offset="1" stop-color="' + gradStop(w.grad, 1) + '"/>';
    s += "</linearGradient></defs>";
    s += '<rect width="240" height="180" fill="url(#g-' + w.id.replace(/\W/g, "") + ')"/>';

    if (w.shape === "circle") {
      s += '<circle cx="120" cy="92" r="52" fill="rgba(255,255,255,0.16)"/>';
      s += '<path d="M30 140 Q120 110 210 140" stroke="rgba(255,255,255,0.5)" stroke-width="3" fill="none"/>';
    } else if (w.shape === "bars") {
      s += '<rect x="96" y="30" width="14" height="120" fill="rgba(255,255,255,0.28)"/>';
      s += '<rect x="118" y="56" width="14" height="94" fill="rgba(255,255,255,0.16)"/>';
      s += '<rect x="74" y="70" width="14" height="80" fill="rgba(0,0,0,0.18)"/>';
    } else if (w.shape === "grid") {
      for (var gy = 0; gy < 3; gy++)
        for (var gx = 0; gx < 4; gx++)
          s += '<rect x="' + (28 + gx * 48) + '" y="' + (24 + gy * 48) +
            '" width="36" height="36" rx="3" fill="rgba(28,27,25,' +
            (0.06 + ((gx + gy) % 3) * 0.07).toFixed(2) + ')"/>';
    } else if (w.shape === "vessel") {
      s += '<path d="M120 36 q-26 18 -22 60 q4 40 22 48 q18 -8 22 -48 q4 -42 -22 -60 z" fill="rgba(255,255,255,0.2)"/>';
      s += '<circle cx="102" cy="78" r="5" fill="rgba(28,27,25,0.4)"/>';
      s += '<circle cx="138" cy="86" r="5" fill="rgba(28,27,25,0.4)"/>';
    }
    s += "</svg>";
    return s;
  }
  function gradStop(g, i) {
    var m = g.match(/#[0-9a-f]{6}/gi) || ["#999999", "#333333"];
    return i === 0 ? m[0] : m[m.length - 1];
  }

  /* ---------------- render ---------------- */
  var wall = document.getElementById("wall");
  var currentStyle = "standard";
  var showMat = true;

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tombstone(w) {
    return (
      '<p class="work"><em>' + esc(w.title) + "</em>, " +
      '<span class="year">' + esc(w.year) + "</span></p>" +
      '<p class="specs"><span class="medium">' + esc(w.medium) + "</span><br>" +
      esc(w.dims) + "</p>" +
      '<p class="credit">' + esc(w.credit) + "</p>" +
      '<span class="accession">' + esc(w.id) + "</span>"
    );
  }

  function tagHtml(w) {
    var html = '<div class="tags">';
    (w.tags || []).forEach(function (t) {
      var cls = "tag";
      if (t === "On view") cls += " on-view";
      if (t === "Fragile" || t === "Light sensitive") cls += " fragile";
      html += '<span class="' + cls + '">' + esc(t) + "</span>";
    });
    html += "</div>";
    return html;
  }

  function labelBody(w, style) {
    var head =
      '<p class="artist">' + esc(w.artist) + "</p>" +
      '<p class="life">' + esc(w.life) + "</p>";

    if (style === "kids") {
      return (
        head +
        '<p class="work"><em>' + esc(w.title) + "</em></p>" +
        '<div class="kids-q"><strong>' + esc(w.kidsTitle) + "</strong>" +
        esc(w.kids) + "</div>" +
        tagHtml(w)
      );
    }
    if (style === "extended") {
      return (
        head +
        tombstone(w) +
        '<p class="interp">' + esc(w.interp) + "</p>" +
        tagHtml(w)
      );
    }
    // standard
    return head + tombstone(w) + tagHtml(w);
  }

  function actions() {
    var copyIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
    var printIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 17H3v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5h-3"/></svg>';
    return (
      '<div class="actions">' +
      '<button class="act" type="button" data-action="copy">' + copyIcon + "Copy label</button>" +
      '<button class="act" type="button" data-action="print">' + printIcon + "Print label</button>" +
      "</div>"
    );
  }

  function render() {
    wall.innerHTML = "";
    WORKS.forEach(function (w) {
      var card = document.createElement("article");
      card.className = "piece" + (currentStyle === "kids" ? " is-kids" : "");
      card.setAttribute("data-id", w.id);
      card.innerHTML =
        '<div class="art' + (showMat ? "" : " no-mat") + '">' +
        '<span class="medium-tag">' + esc(w.kind) + "</span>" +
        '<div class="art-canvas" style="background:' + w.grad + '">' + artSvg(w) + "</div>" +
        "</div>" +
        '<div class="label">' + labelBody(w, currentStyle) + "</div>" +
        actions();
      wall.appendChild(card);
    });
  }

  /* ---------------- plain-text label for clipboard ---------------- */
  function plainLabel(w) {
    var lines = [
      w.artist,
      w.life,
      "",
      w.title + ", " + w.year,
      w.medium,
      w.dims,
      "",
      w.credit,
      w.id
    ];
    if (currentStyle === "extended") lines.push("", w.interp);
    if (currentStyle === "kids") lines = [w.artist, w.title, "", w.kidsTitle, w.kids];
    return lines.join("\n");
  }

  /* ---------------- toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast(okMsg); },
        function () { fallbackCopy(text, okMsg); }
      );
    } else {
      fallbackCopy(text, okMsg);
    }
  }
  function fallbackCopy(text, okMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast(okMsg);
    } catch (e) {
      toast("Copy not supported");
    }
    document.body.removeChild(ta);
  }

  /* ---------------- single-label print ---------------- */
  function printOnly(id) {
    var cards = wall.querySelectorAll(".piece");
    cards.forEach(function (c) {
      if (c.getAttribute("data-id") !== id) c.classList.add("print-hide");
    });
    var clear = function () {
      cards.forEach(function (c) { c.classList.remove("print-hide"); });
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
    // safety net for browsers that don't fire afterprint
    setTimeout(clear, 1500);
  }

  /* ---------------- events ---------------- */
  // style switcher
  var tabs = document.querySelectorAll(".seg");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      currentStyle = tab.getAttribute("data-style");
      render();
      toast(
        currentStyle === "kids"
          ? "Kids labels — written for ages 6–10"
          : currentStyle === "extended"
          ? "Extended interpretive labels"
          : "Standard tombstone labels"
      );
    });
    // arrow-key navigation between tabs
    tab.addEventListener("keydown", function (e) {
      var list = Array.prototype.slice.call(tabs);
      var i = list.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        list[(i + 1) % list.length].focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length].focus();
      }
    });
  });

  // mat toggle
  document.getElementById("mat-toggle").addEventListener("change", function (e) {
    showMat = e.target.checked;
    wall.querySelectorAll(".art").forEach(function (a) {
      a.classList.toggle("no-mat", !showMat);
    });
  });

  // print all visible
  document.getElementById("print-all").addEventListener("click", function () {
    window.print();
  });

  // delegated card actions
  wall.addEventListener("click", function (e) {
    var btn = e.target.closest(".act");
    if (!btn) return;
    var card = btn.closest(".piece");
    var id = card.getAttribute("data-id");
    var w = WORKS.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    var action = btn.getAttribute("data-action");
    if (action === "copy") {
      copyText(plainLabel(w), "Label text copied · " + w.id);
    } else if (action === "print") {
      printOnly(id);
    }
  });

  render();
})();
