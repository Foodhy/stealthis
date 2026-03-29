(function () {
  // ── Elements ──
  var canvasWrap = document.getElementById("canvas-wrap");
  var gradCanvas = document.getElementById("gradient-canvas");
  var crosshair = document.getElementById("crosshair");
  var hueTrack = document.getElementById("hue-track");
  var hueThumb = document.getElementById("hue-thumb");
  var opTrack = document.getElementById("opacity-track");
  var opThumb = document.getElementById("opacity-thumb");
  var opCanvas = document.getElementById("opacity-canvas");
  var swatch = document.getElementById("swatch");
  var outHex = document.getElementById("out-hex");
  var outRgb = document.getElementById("out-rgb");
  var outRgba = document.getElementById("out-rgba");

  // ── State ──
  var hue = 210; // 0-360
  var sat = 0.7; // 0-1 (x on gradient canvas)
  var light = 0.4; // 0-1 (y on gradient canvas, inverted)
  var alpha = 1; // 0-1

  // ── Helpers ──
  function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi);
  }

  function hslToRgb(h, s, l) {
    // h: 0-360, s: 0-1, l: 0-1
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var r, g, b;
    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  function toHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (v) {
          return ("0" + v.toString(16)).slice(-2);
        })
        .join("")
    );
  }

  // ── Draw gradient canvas ──
  function drawGradient() {
    var ctx = gradCanvas.getContext("2d");
    var w = gradCanvas.width;
    var h = gradCanvas.height;

    // Base hue fill
    ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
    ctx.fillRect(0, 0, w, h);

    // White → transparent (left→right)
    var wGrad = ctx.createLinearGradient(0, 0, w, 0);
    wGrad.addColorStop(0, "rgba(255,255,255,1)");
    wGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wGrad;
    ctx.fillRect(0, 0, w, h);

    // Transparent → black (top→bottom)
    var bGrad = ctx.createLinearGradient(0, 0, 0, h);
    bGrad.addColorStop(0, "rgba(0,0,0,0)");
    bGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Draw opacity canvas ──
  function drawOpacity(rgb) {
    var ctx = opCanvas.getContext("2d");
    var w = opCanvas.offsetWidth || opTrack.offsetWidth;
    var h = opCanvas.offsetHeight || 12;
    opCanvas.width = w;
    opCanvas.height = h;

    // Checkerboard
    var tileSize = 6;
    for (var row = 0; row < Math.ceil(h / tileSize); row++) {
      for (var col = 0; col < Math.ceil(w / tileSize); col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? "#888" : "#555";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }

    // Gradient overlay
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
    grad.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Compute current HSL given canvas sat/light position ──
  // On the canvas: x=0 → white (s=0, l=1), x=1 → pure hue (s=1, l~0.5)
  // y=0 → bright, y=1 → black
  // We map directly: hslS = sat, hslL = 0.5 * (1 - sat) + sat * (1 - light) ... standard formula
  // Simpler: lightness from canvas coords:
  function canvasToHsl(sx, ly) {
    // sx = saturation on x axis (0-1), ly = darkness on y (0-1)
    // Convert from "canvas space" to real HSL:
    // white point at (0,0), black at (x, 1), pure hue at (1, 0)
    var s = sx;
    var l = (1 - ly) * (1 - sx / 2);
    // avoid s=0 when l=0
    return { s: s, l: clamp(l, 0, 1) };
  }

  // ── Update everything ──
  function update() {
    var hslCoords = canvasToHsl(sat, 1 - light);
    var rgb = hslToRgb(hue, hslCoords.s, hslCoords.l);
    var hex = toHex(rgb[0], rgb[1], rgb[2]);

    // Swatch
    swatch.style.background = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";

    // Outputs
    outHex.value = hex;
    outRgb.value = "rgb(" + rgb.join(", ") + ")";
    outRgba.value = "rgba(" + rgb.join(", ") + ", " + alpha.toFixed(2) + ")";

    // Crosshair position (sat on x, light on y, light=1 → top)
    var canvW = gradCanvas.offsetWidth || gradCanvas.width;
    var canvH = gradCanvas.offsetHeight || gradCanvas.height;
    crosshair.style.left = sat * canvW + "px";
    crosshair.style.top = (1 - light) * canvH + "px";

    // Hue thumb
    hueThumb.style.left = (hue / 360) * 100 + "%";

    // Opacity thumb
    opThumb.style.left = alpha * 100 + "%";

    // Redraw opacity strip
    drawOpacity(rgb);
  }

  // ── Canvas drag ──
  function pickFromCanvas(e) {
    var rect = gradCanvas.getBoundingClientRect();
    var x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    sat = x;
    light = 1 - y;
    update();
  }

  var draggingCanvas = false;
  canvasWrap.addEventListener("mousedown", function (e) {
    draggingCanvas = true;
    pickFromCanvas(e);
  });
  document.addEventListener("mousemove", function (e) {
    if (draggingCanvas) pickFromCanvas(e);
  });
  document.addEventListener("mouseup", function () {
    draggingCanvas = false;
  });

  // touch
  canvasWrap.addEventListener(
    "touchstart",
    function (e) {
      draggingCanvas = true;
      pickFromCanvas(e.touches[0]);
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener(
    "touchmove",
    function (e) {
      if (draggingCanvas) {
        pickFromCanvas(e.touches[0]);
        e.preventDefault();
      }
    },
    { passive: false }
  );
  document.addEventListener("touchend", function () {
    draggingCanvas = false;
  });

  // ── Hue slider drag ──
  function pickHue(e) {
    var rect = hueTrack.getBoundingClientRect();
    hue = clamp(((e.clientX - rect.left) / rect.width) * 360, 0, 360);
    drawGradient();
    update();
  }
  var draggingHue = false;
  hueTrack.addEventListener("mousedown", function (e) {
    draggingHue = true;
    pickHue(e);
  });
  document.addEventListener("mousemove", function (e) {
    if (draggingHue) pickHue(e);
  });
  document.addEventListener("mouseup", function () {
    draggingHue = false;
  });

  hueTrack.addEventListener(
    "touchstart",
    function (e) {
      draggingHue = true;
      pickHue(e.touches[0]);
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener(
    "touchmove",
    function (e) {
      if (draggingHue) {
        pickHue(e.touches[0]);
        e.preventDefault();
      }
    },
    { passive: false }
  );
  document.addEventListener("touchend", function () {
    draggingHue = false;
  });

  // ── Opacity slider drag ──
  function pickOpacity(e) {
    var rect = opTrack.getBoundingClientRect();
    alpha = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    update();
  }
  var draggingOp = false;
  opTrack.addEventListener("mousedown", function (e) {
    draggingOp = true;
    pickOpacity(e);
  });
  document.addEventListener("mousemove", function (e) {
    if (draggingOp) pickOpacity(e);
  });
  document.addEventListener("mouseup", function () {
    draggingOp = false;
  });

  opTrack.addEventListener(
    "touchstart",
    function (e) {
      draggingOp = true;
      pickOpacity(e.touches[0]);
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener(
    "touchmove",
    function (e) {
      if (draggingOp) {
        pickOpacity(e.touches[0]);
        e.preventDefault();
      }
    },
    { passive: false }
  );
  document.addEventListener("touchend", function () {
    draggingOp = false;
  });

  // ── Click-to-copy outputs ──
  [outHex, outRgb, outRgba].forEach(function (el) {
    el.addEventListener("click", function () {
      el.select();
      document.execCommand("copy");
    });
  });

  // ── Init ──
  drawGradient();
  update();
})();
