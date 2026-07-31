/* DIY — Graph Paper Background
   Vanilla JS. Drives CSS custom properties on the paper layer,
   redraws an SVG ruler, and emits copyable CSS. */
(function () {
  "use strict";

  var paper = document.getElementById("paper");
  var root = document.documentElement;
  var toastEl = document.getElementById("toast");
  var rulerEl = document.getElementById("ruler");
  var rulerSvg = document.getElementById("rulerSvg");
  var cssOut = document.getElementById("cssOut");
  var SVG_NS = "http://www.w3.org/2000/svg";

  var DEFAULTS = {
    scale: 5,
    tint: "white",
    unit: 4,
    ink: 100,
    margin: true,
    marks: true,
    holes: false,
    grain: true,
    iso: false,
    ruler: true
  };

  var state = Object.assign({}, DEFAULTS);

  var SCALE_HINTS = {
    1: "Fine 1 mm lines dominate — dense millimetre paper.",
    5: "Medium 5 mm lines dominate; fine 1 mm stays visible.",
    10: "Bold 10 cm-style lines dominate — sketching weight."
  };

  var SCALE_LABEL = {
    1: "1 mm dominant",
    5: "5 mm dominant",
    10: "10 mm dominant"
  };

  /* Per-preset ink multipliers + stroke widths for the three tiers */
  var SCALE_TUNE = {
    1:  { fine: 0.34, med: 0.30, bold: 0.42, wFine: 1,   wMed: 1,   wBold: 1.2 },
    5:  { fine: 0.16, med: 0.34, bold: 0.62, wFine: 1,   wMed: 1,   wBold: 1.6 },
    10: { fine: 0.07, med: 0.16, bold: 0.72, wFine: 1,   wMed: 1,   wBold: 2.2 }
  };

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2000);
  }

  function inkColors() {
    var t = SCALE_TUNE[state.scale];
    var m = state.ink / 100;
    var base = { white: "43, 92, 150", blue: "43, 92, 150", cream: "150, 110, 60", green: "46, 108, 74" }[state.tint];
    var boldBase = { white: "30, 70, 120", blue: "30, 70, 120", cream: "126, 88, 44", green: "32, 84, 56" }[state.tint];
    return {
      fine: "rgba(" + base + ", " + (t.fine * m).toFixed(3) + ")",
      med: "rgba(" + base + ", " + (t.med * m).toFixed(3) + ")",
      bold: "rgba(" + boldBase + ", " + (t.bold * m).toFixed(3) + ")",
      wFine: t.wFine + "px",
      wMed: t.wMed + "px",
      wBold: t.wBold + "px"
    };
  }

  function apply() {
    var c = inkColors();
    paper.dataset.tint = state.tint;
    paper.dataset.scale = String(state.scale);

    paper.style.setProperty("--unit", state.unit + "px");
    paper.style.setProperty("--c-fine", c.fine);
    paper.style.setProperty("--c-med", c.med);
    paper.style.setProperty("--c-bold", c.bold);
    paper.style.setProperty("--w-fine", c.wFine);
    paper.style.setProperty("--w-med", c.wMed);
    paper.style.setProperty("--w-bold", c.wBold);

    paper.classList.toggle("is-margin", state.margin);
    paper.classList.toggle("is-marks", state.marks);
    paper.classList.toggle("is-holes", state.holes);
    paper.classList.toggle("is-grain", state.grain);
    paper.classList.toggle("is-iso", state.iso);

    rulerEl.classList.toggle("is-hidden", !state.ruler);
    root.style.setProperty("--ruler-h", state.ruler ? "30px" : "0px");

    document.getElementById("specScale").innerHTML =
      state.iso ? "Isometric 60°" : SCALE_LABEL[state.scale];
    document.getElementById("scaleHint").innerHTML = SCALE_HINTS[state.scale];
    document.getElementById("unitVal").textContent = state.unit + " px / mm";
    document.getElementById("inkVal").textContent = state.ink + "%";

    syncControls();
    drawRuler();
    writeCss(c);
  }

  function syncControls() {
    Array.prototype.forEach.call(
      document.querySelectorAll("#scaleGroup button"),
      function (b) { b.setAttribute("aria-checked", String(Number(b.dataset.scale) === state.scale)); }
    );
    Array.prototype.forEach.call(
      document.querySelectorAll("#tintGroup button"),
      function (b) { b.setAttribute("aria-checked", String(b.dataset.tint === state.tint)); }
    );
    document.getElementById("tMargin").checked = state.margin;
    document.getElementById("tMarks").checked = state.marks;
    document.getElementById("tHoles").checked = state.holes;
    document.getElementById("tGrain").checked = state.grain;
    document.getElementById("tIso").checked = state.iso;
    document.getElementById("tRuler").checked = state.ruler;
    document.getElementById("unit").value = String(state.unit);
    document.getElementById("ink").value = String(state.ink);
  }

  /* ── Ruler ─────────────────────────────────────────────────── */
  function drawRuler() {
    if (!state.ruler) return;
    var w = Math.max(320, rulerEl.clientWidth);
    var h = 30;
    rulerSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (rulerSvg.firstChild) rulerSvg.removeChild(rulerSvg.firstChild);

    var u = state.unit;                 // px per mm
    var step = state.scale === 1 ? u : u; // fine tick every mm
    var major = u * 10;                 // bold every 10 mm
    var medium = u * 5;

    // Skip fine ticks if they'd be denser than 3px
    var drawFine = step >= 3;

    for (var x = 0; x <= w; x += step) {
      var isMajor = Math.abs((x / major) - Math.round(x / major)) < 0.001;
      var isMed = Math.abs((x / medium) - Math.round(x / medium)) < 0.001;
      if (!isMajor && !isMed && !drawFine) continue;

      var line = document.createElementNS(SVG_NS, "line");
      var len = isMajor ? 13 : isMed ? 8 : 4;
      line.setAttribute("x1", x.toFixed(2));
      line.setAttribute("x2", x.toFixed(2));
      line.setAttribute("y1", String(h));
      line.setAttribute("y2", String(h - len));
      line.setAttribute("class", isMajor ? "tick tick--major" : isMed ? "tick" : "tick tick--fine");
      rulerSvg.appendChild(line);

      if (isMajor && major >= 26) {
        var mm = Math.round(x / u);
        var txt = document.createElementNS(SVG_NS, "text");
        txt.setAttribute("x", (x + 3).toFixed(2));
        txt.setAttribute("y", "11");
        txt.setAttribute("class", "num");
        txt.textContent = String(mm);
        rulerSvg.appendChild(txt);
      }
    }

    var base = document.createElementNS(SVG_NS, "line");
    base.setAttribute("x1", "0");
    base.setAttribute("x2", String(w));
    base.setAttribute("y1", String(h - 0.5));
    base.setAttribute("y2", String(h - 0.5));
    base.setAttribute("class", "tick");
    rulerSvg.appendChild(base);
  }

  /* ── CSS output ────────────────────────────────────────────── */
  function writeCss(c) {
    var u = state.unit;
    var lines;

    if (state.iso) {
      lines = [
        ".paper {",
        "  --unit: " + u + "px;",
        "  --med: calc(var(--unit) * 5);",
        "  background-color: " + paperHex() + ";",
        "  background-image:",
        "    repeating-linear-gradient(0deg,   " + c.med + " 0 " + c.wMed + ", transparent " + c.wMed + " var(--med)),",
        "    repeating-linear-gradient(60deg,  " + c.fine + " 0 " + c.wFine + ", transparent " + c.wFine + " var(--med)),",
        "    repeating-linear-gradient(-60deg, " + c.fine + " 0 " + c.wFine + ", transparent " + c.wFine + " var(--med));",
        "}"
      ];
    } else {
      lines = [
        ".paper {",
        "  --unit: " + u + "px;              /* px per mm */",
        "  --fine: var(--unit);",
        "  --med:  calc(var(--unit) * 5);",
        "  --bold: calc(var(--unit) * 10);",
        "  background-color: " + paperHex() + ";",
        "  background-image:",
        "    linear-gradient(to right,  " + c.bold + " " + c.wBold + ", transparent " + c.wBold + "),",
        "    linear-gradient(to bottom, " + c.bold + " " + c.wBold + ", transparent " + c.wBold + "),",
        "    linear-gradient(to right,  " + c.med + " " + c.wMed + ", transparent " + c.wMed + "),",
        "    linear-gradient(to bottom, " + c.med + " " + c.wMed + ", transparent " + c.wMed + "),",
        "    linear-gradient(to right,  " + c.fine + " " + c.wFine + ", transparent " + c.wFine + "),",
        "    linear-gradient(to bottom, " + c.fine + " " + c.wFine + ", transparent " + c.wFine + ");",
        "  background-size:",
        "    var(--bold) var(--bold), var(--bold) var(--bold),",
        "    var(--med) var(--med),   var(--med) var(--med),",
        "    var(--fine) var(--fine), var(--fine) var(--fine);",
        "}"
      ];
    }

    if (state.margin) {
      lines.push("");
      lines.push(".paper::before { /* red margin rule */");
      lines.push("  content: \"\"; position: absolute; inset: 0 auto 0 44px;");
      lines.push("  width: 3px; background: rgba(212, 80, 62, 0.55);");
      lines.push("}");
    }

    cssOut.textContent = lines.join("\n");
  }

  function paperHex() {
    return { white: "#ffffff", cream: "#f7f0e1", green: "#e9f3e7", blue: "#e7effa" }[state.tint];
  }

  /* ── Events ────────────────────────────────────────────────── */
  function wireRadioGroup(id, key, cast) {
    var group = document.getElementById(id);
    var buttons = Array.prototype.slice.call(group.querySelectorAll("button"));

    group.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      state[key] = cast(btn.dataset[key]);
      apply();
    });

    group.addEventListener("keydown", function (e) {
      var i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = buttons[(i + 1) % buttons.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = buttons[(i - 1 + buttons.length) % buttons.length];
      if (!next) return;
      e.preventDefault();
      next.focus();
      next.click();
    });
  }

  wireRadioGroup("scaleGroup", "scale", Number);
  wireRadioGroup("tintGroup", "tint", String);

  [["tMargin", "margin"], ["tMarks", "marks"], ["tHoles", "holes"],
   ["tGrain", "grain"], ["tIso", "iso"], ["tRuler", "ruler"]].forEach(function (pair) {
    document.getElementById(pair[0]).addEventListener("change", function (e) {
      state[pair[1]] = e.target.checked;
      apply();
      if (pair[1] === "iso") toast(e.target.checked ? "Isometric 60° grid on" : "Back to square grid");
    });
  });

  document.getElementById("unit").addEventListener("input", function (e) {
    state.unit = Number(e.target.value);
    apply();
  });

  document.getElementById("ink").addEventListener("input", function (e) {
    state.ink = Number(e.target.value);
    apply();
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    var text = cssOut.textContent;
    var done = function () { toast("CSS copied to clipboard"); };
    var fail = function () {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (err) {
        toast("Copy failed — select the code manually");
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else {
      fail();
    }
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    state = Object.assign({}, DEFAULTS);
    apply();
    toast("Sheet reset to defaults");
  });

  var raf = 0;
  window.addEventListener("resize", function () {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(drawRuler);
  });

  apply();
})();
