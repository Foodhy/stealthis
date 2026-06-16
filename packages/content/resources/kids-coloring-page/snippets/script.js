(function () {
  "use strict";

  // ---- Crayon set (soft storybook palette) ----
  var CRAYONS = [
    { name: "Pumpkin orange", color: "#ff8a3d" },
    { name: "Bubblegum pink", color: "#ff6f9c" },
    { name: "Sunny yellow", color: "#ffd23f" },
    { name: "Leafy green", color: "#7bd389" },
    { name: "Sky blue", color: "#5ec5d6" },
    { name: "Grape purple", color: "#a98bff" },
    { name: "Cherry red", color: "#ff5a5a" },
    { name: "Chocolate brown", color: "#a4673a" },
    { name: "Snowy white", color: "#ffffff" },
    { name: "Storm gray", color: "#9aa0b5" },
  ];

  var RAINBOW = [
    "#ff6f9c",
    "#ff8a3d",
    "#ffd23f",
    "#7bd389",
    "#5ec5d6",
    "#a98bff",
  ];

  // ---- DOM ----
  var crayonsEl = document.getElementById("crayons");
  var rainbowBtn = document.getElementById("rainbowBtn");
  var art = document.getElementById("art");
  var undoBtn = document.getElementById("undoBtn");
  var clearBtn = document.getElementById("clearBtn");
  var saveBtn = document.getElementById("saveBtn");
  var activeDot = document.getElementById("activeDot");
  var activeName = document.getElementById("activeName");
  var toastEl = document.getElementById("toast");

  var regions = Array.prototype.slice.call(
    art.querySelectorAll(".fillable")
  );

  // ---- State ----
  var activeIndex = 0;
  var rainbowOn = false;
  var rainbowStep = 0;
  // history of { region, prevFill } so undo restores exactly
  var history = [];
  var BLANK = "#ffffff";

  // ---- Toast helper ----
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1700);
  }

  // ---- Build the crayon palette ----
  CRAYONS.forEach(function (cr, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "crayon";
    btn.style.setProperty("--crayon", cr.color);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", i === 0 ? "true" : "false");
    btn.setAttribute("aria-label", cr.name);
    btn.title = cr.name;
    btn.dataset.index = String(i);
    btn.tabIndex = i === 0 ? 0 : -1;

    var check = document.createElement("span");
    check.className = "check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    btn.appendChild(check);

    crayonsEl.appendChild(btn);
  });

  var crayonBtns = Array.prototype.slice.call(
    crayonsEl.querySelectorAll(".crayon")
  );

  function selectCrayon(i, focusIt) {
    activeIndex = i;
    rainbowOn = false;
    rainbowBtn.setAttribute("aria-pressed", "false");

    crayonBtns.forEach(function (b, idx) {
      var on = idx === i;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });

    var cr = CRAYONS[i];
    activeDot.style.background = cr.color;
    activeName.textContent = cr.name;
    if (focusIt) crayonBtns[i].focus();
  }

  // Palette: click + keyboard (radiogroup arrow navigation)
  crayonsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".crayon");
    if (!btn) return;
    selectCrayon(Number(btn.dataset.index), false);
  });

  crayonsEl.addEventListener("keydown", function (e) {
    var idx = activeIndex;
    var next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % CRAYONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + CRAYONS.length) % CRAYONS.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = CRAYONS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    selectCrayon(next, true);
  });

  // ---- Rainbow mode ----
  rainbowBtn.addEventListener("click", function () {
    rainbowOn = !rainbowOn;
    rainbowBtn.setAttribute("aria-pressed", rainbowOn ? "true" : "false");
    if (rainbowOn) {
      crayonBtns.forEach(function (b) {
        b.setAttribute("aria-checked", "false");
      });
      activeName.textContent = "Rainbow!";
      activeDot.style.background =
        "conic-gradient(#ff6f9c,#ff8a3d,#ffd23f,#7bd389,#5ec5d6,#a98bff,#ff6f9c)";
      toast("🌈 Rainbow mode on — every fill cycles colors");
    } else {
      selectCrayon(activeIndex, false);
    }
  });

  // ---- Which color to apply right now ----
  function pickColor() {
    if (rainbowOn) {
      var c = RAINBOW[rainbowStep % RAINBOW.length];
      rainbowStep++;
      return c;
    }
    return CRAYONS[activeIndex].color;
  }

  // ---- Fill a region ----
  function fillRegion(region) {
    if (!region || !region.classList.contains("fillable")) return;
    var color = pickColor();
    var prev = region.getAttribute("fill") || BLANK;
    if (prev === color) return; // nothing to change

    history.push({ region: region, prev: prev });
    if (history.length > 60) history.shift();

    region.setAttribute("fill", color);

    // pop animation
    region.classList.remove("pop");
    // force reflow so the animation can restart
    void region.getBoundingClientRect();
    region.classList.add("pop");
  }

  // ---- Pointer painting (click + drag flood by region) ----
  var painting = false;
  var lastRegion = null;

  function regionFromEvent(e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains("fillable")) return t;
    // when dragging, target may be the SVG itself — resolve via point
    var x = e.clientX,
      y = e.clientY;
    if (x == null) return null;
    var el = document.elementFromPoint(x, y);
    if (el && el.classList && el.classList.contains("fillable")) return el;
    return null;
  }

  art.addEventListener("pointerdown", function (e) {
    var region = regionFromEvent(e);
    if (!region) return;
    painting = true;
    lastRegion = region;
    fillRegion(region);
    if (art.setPointerCapture) {
      try {
        art.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
    }
  });

  art.addEventListener("pointermove", function (e) {
    if (!painting) return;
    var region = regionFromEvent(e);
    if (region && region !== lastRegion) {
      lastRegion = region;
      fillRegion(region);
    }
  });

  function stopPaint() {
    painting = false;
    lastRegion = null;
  }
  art.addEventListener("pointerup", stopPaint);
  art.addEventListener("pointercancel", stopPaint);
  window.addEventListener("blur", stopPaint);

  // ---- Keyboard fill on focused region (a11y) ----
  regions.forEach(function (r) {
    r.setAttribute("tabindex", "0");
    r.setAttribute("role", "button");
    var label = r.getAttribute("data-name") || "region";
    r.setAttribute("aria-label", "Color the " + label);
  });

  art.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var region = e.target;
    if (region && region.classList.contains("fillable")) {
      e.preventDefault();
      fillRegion(region);
    }
  });

  // ---- Undo ----
  undoBtn.addEventListener("click", function () {
    var last = history.pop();
    if (!last) {
      toast("Nothing to undo yet");
      return;
    }
    last.region.setAttribute("fill", last.prev);
    if (rainbowOn && rainbowStep > 0) rainbowStep--;
    toast("Undone");
  });

  // ---- Clear ----
  clearBtn.addEventListener("click", function () {
    regions.forEach(function (r) {
      r.setAttribute("fill", BLANK);
    });
    history = [];
    rainbowStep = 0;
    toast("Cleared — fresh page!");
  });

  // ---- Save as PNG ----
  saveBtn.addEventListener("click", function () {
    try {
      var clone = art.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      // inline a white backdrop so saved PNG isn't transparent
      var serialized = new XMLSerializer().serializeToString(clone);
      var svgData =
        '<?xml version="1.0" encoding="UTF-8"?>' + serialized;
      var blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      var url = URL.createObjectURL(blob);

      var img = new Image();
      img.onload = function () {
        var scale = 2;
        var canvas = document.createElement("canvas");
        canvas.width = 480 * scale;
        canvas.height = 360 * scale;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob(function (pngBlob) {
          if (!pngBlob) {
            toast("Couldn't save here — try another browser");
            return;
          }
          var a = document.createElement("a");
          a.href = URL.createObjectURL(pngBlob);
          a.download = "my-coloring-page.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () {
            URL.revokeObjectURL(a.href);
          }, 1000);
          toast("🖼️ Saved your masterpiece!");
        }, "image/png");
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        toast("Couldn't save here — try another browser");
      };
      img.src = url;
    } catch (err) {
      toast("Couldn't save here — try another browser");
    }
  });

  // init
  selectCrayon(0, false);
})();
