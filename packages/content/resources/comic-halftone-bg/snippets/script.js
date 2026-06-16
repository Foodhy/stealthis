(function () {
  "use strict";

  var root = document.documentElement;

  var els = {
    dotSize: document.getElementById("dotSize"),
    spacing: document.getElementById("spacing"),
    angle: document.getElementById("angle"),
    dotColor: document.getElementById("dotColor"),
    paperColor: document.getElementById("paperColor"),
    dotSizeOut: document.getElementById("dotSizeOut"),
    spacingOut: document.getElementById("spacingOut"),
    angleOut: document.getElementById("angleOut"),
    cssOut: document.getElementById("cssOut"),
    copyBtn: document.getElementById("copyBtn"),
    preview: document.getElementById("preview"),
  };

  /* ----- toast helper ----- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2000);
  }

  /* ----- build the CSS the dots are made of ----- */
  function buildCss() {
    var dot = els.dotColor.value;
    var paper = els.paperColor.value;
    var size = parseFloat(els.dotSize.value);
    var gap = parseFloat(els.spacing.value);
    var angle = parseInt(els.angle.value, 10);

    // Angle is expressed by rotating the gradient's positional grid.
    // For a true axis-aligned dot grid we keep gradient radial and rotate the
    // whole layer via background-position trickery is limited, so we expose the
    // angle as a CSS custom prop used by a transform on the preview layer.
    var radius = (size / 2).toFixed(2);
    var image =
      "radial-gradient(circle at center, " +
      dot +
      " " +
      radius +
      "px, transparent " +
      (parseFloat(radius) + 0.5).toFixed(2) +
      "px)";

    var css =
      "background-color: " +
      paper +
      ";\n" +
      "background-image: " +
      image +
      ";\n" +
      "background-size: " +
      gap +
      "px " +
      gap +
      "px;\n" +
      "background-position: 0 0;\n" +
      "transform: rotate(" +
      angle +
      "deg);";

    return css;
  }

  /* ----- push current state into CSS vars + readouts ----- */
  function apply() {
    var size = parseFloat(els.dotSize.value);
    var gap = parseFloat(els.spacing.value);
    var angle = parseInt(els.angle.value, 10);

    root.style.setProperty("--dot", els.dotColor.value);
    root.style.setProperty("--bg", els.paperColor.value);
    root.style.setProperty("--dot-size", size + "px");
    root.style.setProperty("--gap", gap + "px");
    root.style.setProperty("--angle", angle + "deg");

    // rotate the live preview's dot layer
    if (els.preview) {
      els.preview.style.transform = "rotate(" + angle + "deg)";
    }

    els.dotSizeOut.textContent = size + "px";
    els.spacingOut.textContent = gap + "px";
    els.angleOut.textContent = angle + "°";

    els.cssOut.textContent = "background-image: " + buildCss().split("\n")[1].replace("background-image: ", "");
  }

  /* ----- presets ----- */
  var presets = {
    flat: { dotSize: 5, spacing: 14, angle: 0, dot: "#0e0e12", paper: "#ffd23f" },
    fine: { dotSize: 2.5, spacing: 8, angle: 0, dot: "#0e0e12", paper: "#fdfcf7" },
    bold: { dotSize: 9, spacing: 22, angle: 45, dot: "#ff2e4d", paper: "#2e6bff" },
  };

  function applyPreset(name) {
    var p = presets[name];
    if (!p) return;
    els.dotSize.value = p.dotSize;
    els.spacing.value = p.spacing;
    els.angle.value = p.angle;
    els.dotColor.value = p.dot;
    els.paperColor.value = p.paper;
    apply();
    toast("Preset: " + name + " applied");
  }

  /* ----- copy CSS ----- */
  function copyCss() {
    var css = buildCss();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(
        function () {
          toast("CSS copied to clipboard");
        },
        function () {
          fallbackCopy(css);
        }
      );
    } else {
      fallbackCopy(css);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("CSS copied to clipboard");
    } catch (e) {
      toast("Copy failed — select manually");
    }
    document.body.removeChild(ta);
  }

  /* ----- wire up ----- */
  ["dotSize", "spacing", "angle", "dotColor", "paperColor"].forEach(function (id) {
    els[id].addEventListener("input", apply);
  });

  document.querySelectorAll(".chip[data-preset]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyPreset(chip.getAttribute("data-preset"));
    });
  });

  els.copyBtn.addEventListener("click", copyCss);

  // keyboard activation for gallery cards
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var name = card.querySelector("h3");
        toast((name ? name.textContent : "Swatch") + " — copy its idea from the docs");
      }
    });
  });

  apply();
})();
