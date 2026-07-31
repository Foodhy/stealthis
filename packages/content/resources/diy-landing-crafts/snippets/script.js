/* Little Loom Studio — crafts landing interactions (vanilla JS) */
(function () {
  "use strict";

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 2600);
  }

  /* ---------- data ---------- */
  var TUTORIALS = [
    { id: "t1", cat: "knitting", title: "Ribbed Beanie in an Evening", maker: "Nora Reyes", ini: "NR", time: "2 h", diff: 1, a: "#f6ded7", b: "#e8bfae" },
    { id: "t2", cat: "knitting", title: "Chunky Blanket, No Needles", maker: "Tomás Ilic", ini: "TI", time: "3 h", diff: 2, a: "#e6ede1", b: "#bccdb0" },
    { id: "t3", cat: "knitting", title: "Colourwork Mittens Primer", maker: "Aiko Lund", ini: "AL", time: "5 h", diff: 3, a: "#faedcd", b: "#e6c88a" },
    { id: "t4", cat: "embroidery", title: "Satin Stitch Wildflowers", maker: "Marta Kell", ini: "MK", time: "90 min", diff: 2, a: "#f6ded7", b: "#d9a898" },
    { id: "t5", cat: "embroidery", title: "Mending Jeans, Visibly", maker: "Josie Brandt", ini: "JB", time: "45 min", diff: 1, a: "#e2e8ee", b: "#adbccc" },
    { id: "t6", cat: "paper", title: "Deckle-Edge Recycled Sheets", maker: "Peter Vance", ini: "PV", time: "2 h", diff: 2, a: "#f4ece2", b: "#dbc7b0" },
    { id: "t7", cat: "paper", title: "Six-Fold Pop-Up Cards", maker: "Suri Nayar", ini: "SN", time: "60 min", diff: 1, a: "#faedcd", b: "#ecd39b" },
    { id: "t8", cat: "candles", title: "Beeswax Tapers, Hand Dipped", maker: "Ola Fenn", ini: "OF", time: "2.5 h", diff: 2, a: "#faedcd", b: "#e0a92e" },
    { id: "t9", cat: "candles", title: "Soy Tins with Cotton Wicks", maker: "Ola Fenn", ini: "OF", time: "70 min", diff: 1, a: "#f0e8e2", b: "#cfbcae" },
    { id: "t10", cat: "pottery", title: "Pinch Pots &amp; Thumb Bowls", maker: "Devin Aoki", ini: "DA", time: "3 h", diff: 2, a: "#e9ddd4", b: "#c39b81" },
    { id: "t11", cat: "pottery", title: "Slab-Built Planter Trio", maker: "Devin Aoki", ini: "DA", time: "4 h", diff: 3, a: "#e6ede1", b: "#a7bb96" },
    { id: "t12", cat: "resin", title: "Pressed-Petal Coasters", maker: "Lena Crisp", ini: "LC", time: "24 h cure", diff: 3, a: "#f2e4ef", b: "#cfa8c6" }
  ];

  var GALLERY = [
    { t: "Sage cardigan, first one!", by: "Nora R.", a: "#e6ede1", b: "#8aa07a" },
    { t: "Hoop of poppies", by: "Marta K.", a: "#f6ded7", b: "#d9755f" },
    { t: "Beeswax tapers, batch 4", by: "Ola F.", a: "#faedcd", b: "#e0a92e" },
    { t: "Speckled breakfast bowl", by: "Devin A.", a: "#efe5dc", b: "#b08e75" },
    { t: "Petal coasters set", by: "Lena C.", a: "#f2e4ef", b: "#b98bb0" },
    { t: "Pop-up birthday card", by: "Suri N.", a: "#e2e8ee", b: "#7f97ae" },
    { t: "Visible mend on denim", by: "Josie B.", a: "#dfe6ee", b: "#5b7188" },
    { t: "Loom weave, week 2", by: "Aiko L.", a: "#f7ece4", b: "#c9a68b" }
  ];

  /* ---------- svg art (all CSS/SVG drawn, no images) ---------- */
  var seedN = 0;
  function art(a, b, seed) {
    var s = seed == null ? seedN++ : seed;
    var r = function (i) { return ((Math.sin((s + 1) * (i + 3) * 12.9898) * 43758.5453) % 1 + 1) % 1; };
    var dots = "";
    for (var i = 0; i < 9; i++) {
      dots += '<circle cx="' + (14 + r(i) * 172).toFixed(1) + '" cy="' + (14 + r(i + 20) * 132).toFixed(1) +
        '" r="' + (2 + r(i + 40) * 4).toFixed(1) + '" fill="' + b + '" opacity="' + (0.25 + r(i + 60) * 0.4).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 200 160" preserveAspectRatio="none" role="presentation">' +
      '<rect width="200" height="160" fill="' + a + '"/>' +
      '<path d="M0 118 Q34 96 68 116 T136 112 T200 122 V160 H0Z" fill="' + b + '" opacity=".45"/>' +
      '<circle cx="' + (46 + r(2) * 100).toFixed(0) + '" cy="62" r="34" fill="' + b + '" opacity=".55"/>' +
      '<path d="M20 66 Q60 24 104 60 T182 52" stroke="' + b + '" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
      dots + "</svg>";
  }

  function yarnIcon(on) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="' + (on ? "" : "off") +
      '"><circle cx="12" cy="12" r="9"/><path d="M4 9c6 1 12 5 15 11M5 16c4-6 9-10 14-11M12 3c-3 5-4 12-2 18"/></svg>';
  }

  /* ---------- state ---------- */
  var state = { cat: "all", savedOnly: false, saved: {} };

  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("tut-count");

  function visible() {
    return TUTORIALS.filter(function (t) {
      if (state.cat !== "all" && t.cat !== state.cat) return false;
      if (state.savedOnly && !state.saved[t.id]) return false;
      return true;
    });
  }

  function render() {
    var list = visible();
    grid.innerHTML = list.map(function (t, i) {
      var yarns = "";
      for (var k = 1; k <= 3; k++) yarns += yarnIcon(k <= t.diff);
      var label = ["", "Beginner", "Comfortable", "Ambitious"][t.diff];
      return '<article class="card-t" style="animation-delay:' + (i * 35) + 'ms">' +
        '<div class="art">' + art(t.a, t.b, i + t.title.length) + "</div>" +
        '<div class="t-body">' +
        '<h3 class="t-title">' + t.title + "</h3>" +
        '<div class="t-meta"><span class="avatar" aria-hidden="true">' + t.ini + "</span>" + t.maker +
        '<span class="badge">' + t.time + "</span></div>" +
        '<div class="t-foot"><span class="yarn" role="img" aria-label="Difficulty: ' + label + '">' + yarns + "</span>" +
        '<span class="diff">' + label + "</span>" +
        '<button class="save" data-save="' + t.id + '" aria-pressed="' + (state.saved[t.id] ? "true" : "false") +
        '" aria-label="Save ' + t.title.replace(/&amp;/g, "and") + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M6 3h12v18l-6-5-6 5z"/></svg></button>' +
        "</div></div></article>";
    }).join("");
    emptyEl.hidden = list.length > 0;
    countEl.textContent = "Showing " + list.length + " tutorial" + (list.length === 1 ? "" : "s");
  }
  render();

  /* saves */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-save]");
    if (!btn) return;
    var id = btn.getAttribute("data-save");
    state.saved[id] = !state.saved[id];
    btn.setAttribute("aria-pressed", state.saved[id] ? "true" : "false");
    toast(state.saved[id] ? "Saved to your basket of ideas" : "Removed from saved");
    if (state.savedOnly) render();
  });

  /* categories */
  var cats = document.getElementById("cats");
  cats.addEventListener("click", function (e) {
    var btn = e.target.closest(".cat");
    if (!btn) return;
    Array.prototype.forEach.call(cats.querySelectorAll(".cat"), function (b) {
      var on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    state.cat = btn.getAttribute("data-cat");
    render();
  });

  var savedBtn = document.getElementById("saved-only");
  savedBtn.addEventListener("click", function () {
    state.savedOnly = !state.savedOnly;
    savedBtn.setAttribute("aria-pressed", state.savedOnly ? "true" : "false");
    savedBtn.textContent = state.savedOnly ? "Show all" : "Saved only";
    render();
  });

  /* ---------- kit basket ---------- */
  var kitList = document.getElementById("kit-list");
  var totalEl = document.getElementById("kit-total");
  var countKit = document.getElementById("kit-count");
  var shipEl = document.getElementById("kit-ship");

  function updateKit(bump) {
    var boxes = kitList.querySelectorAll("input:checked");
    var total = 0;
    Array.prototype.forEach.call(boxes, function (b) { total += parseFloat(b.dataset.price); });
    totalEl.textContent = "$" + total.toFixed(2);
    countKit.textContent = String(boxes.length);
    shipEl.textContent = total >= 40
      ? "Free shipping unlocked"
      : "$" + (40 - total).toFixed(2) + " to free shipping";
    if (bump) {
      countKit.classList.remove("bump");
      void countKit.offsetWidth;
      countKit.classList.add("bump");
    }
  }
  kitList.addEventListener("change", function () { updateKit(true); });
  updateKit(false);

  document.getElementById("kit-add").addEventListener("click", function () {
    var n = kitList.querySelectorAll("input:checked").length;
    toast(n ? n + " item" + (n === 1 ? "" : "s") + " added — " + totalEl.textContent : "Tick at least one supply first");
  });

  /* ---------- progress ring ---------- */
  var ring = document.getElementById("ring-fg");
  var C = 2 * Math.PI * 50;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C;
  function fillRing() { ring.style.strokeDashoffset = C * (1 - 3 / 6); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { fillRing(); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(document.getElementById("makealong"));
  } else { fillRing(); }

  var joinBtn = document.getElementById("join");
  joinBtn.addEventListener("click", function () {
    joinBtn.textContent = "You're in ✓";
    joinBtn.disabled = true;
    toast("Week 3 chapter sent to your inbox");
  });

  /* ---------- gallery + lightbox ---------- */
  var gal = document.getElementById("gal");
  gal.innerHTML = GALLERY.map(function (g, i) {
    return '<button class="gal-item" data-i="' + i + '" aria-label="Expand: ' + g.t + '">' +
      art(g.a, g.b, i * 7 + 3) + '<span class="gal-cap">' + g.t + " · " + g.by + "</span></button>";
  }).join("");

  var lb = document.getElementById("lb");
  var lbArt = document.getElementById("lb-art");
  var lbCap = document.getElementById("lb-cap");
  var lastFocus = null;
  var cur = 0;

  function show(i) {
    cur = (i + GALLERY.length) % GALLERY.length;
    var g = GALLERY[cur];
    lbArt.innerHTML = art(g.a, g.b, cur * 7 + 3);
    lbCap.textContent = g.t + " — by " + g.by;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lb-x").focus();
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  gal.addEventListener("click", function (e) {
    var b = e.target.closest(".gal-item");
    if (b) open(parseInt(b.dataset.i, 10));
  });
  lb.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) close();
  });
  document.getElementById("lb-x").addEventListener("click", close);
  document.getElementById("lb-prev").addEventListener("click", function () { show(cur - 1); });
  document.getElementById("lb-next").addEventListener("click", function () { show(cur + 1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
    if (e.key === "Tab") {
      var f = lb.querySelectorAll("button");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- newsletter ---------- */
  var form = document.getElementById("nl");
  var mail = document.getElementById("nl-mail");
  var msg = document.getElementById("nl-msg");
  var RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function validate(quiet) {
    var v = mail.value.trim();
    mail.classList.remove("bad", "good");
    msg.classList.remove("bad", "good");
    if (!v) { if (!quiet) { msg.textContent = "We need an address to post the letter."; msg.classList.add("bad"); mail.classList.add("bad"); } else { msg.textContent = ""; } return false; }
    if (!RE.test(v)) { msg.textContent = "That doesn't look like an email yet."; msg.classList.add("bad"); mail.classList.add("bad"); return false; }
    msg.textContent = "Looks good."; msg.classList.add("good"); mail.classList.add("good"); return true;
  }
  mail.addEventListener("input", function () { validate(true); });
  mail.addEventListener("blur", function () { if (mail.value.trim()) validate(false); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(false)) { mail.focus(); return; }
    msg.textContent = "Welcome in — first letter lands Thursday.";
    msg.classList.add("good");
    form.reset();
    mail.classList.remove("good");
    toast("Subscribed to the Little Loom letter");
  });
})();
