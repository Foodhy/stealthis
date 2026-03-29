(function () {
  var basePicker = document.getElementById("base-picker");
  var baseInput = document.getElementById("base-color");
  var randomBtn = document.getElementById("randomize-btn");
  var paletteEl = document.getElementById("palette");
  var copyBtn = document.getElementById("copy-css");
  var copyToast = document.getElementById("copy-toast");

  var currentPalette = [];

  // ── Color math ──
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (c) {
          var h = Math.round(Math.max(0, Math.min(255, c))).toString(16);
          return h.length === 1 ? "0" + h : h;
        })
        .join("")
    );
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    var r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function linearize(c) {
    var s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return 0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
  }

  function contrastRatio(hex1, hex2) {
    var l1 = luminance(hexToRgb(hex1));
    var l2 = luminance(hexToRgb(hex2));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  // ── Generate palette ──
  function generatePalette(baseHex) {
    var rgb = hexToRgb(baseHex);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var hue = hsl[0];
    var sat = hsl[1];

    // 7 lightness stops
    var stops = [95, 85, 70, 50, 35, 22, 10];
    var palette = stops.map(function (l, i) {
      // Slightly adjust saturation for extreme lightness
      var adjustedSat = l > 85 ? sat * 0.4 : l < 20 ? sat * 0.6 : sat;
      var c = hslToRgb(hue, adjustedSat, l);
      var hex = rgbToHex(c[0], c[1], c[2]);
      return { hex: hex, lightness: l, index: (i + 1) * 100 };
    });
    return palette;
  }

  function getBadge(ratio) {
    if (ratio >= 7) return { cls: "badge-aaa", text: "AAA" };
    if (ratio >= 4.5) return { cls: "badge-aa", text: "AA" };
    return { cls: "badge-fail", text: "Fail" };
  }

  // ── Render ──
  function render() {
    var baseHex = baseInput.value;
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(baseHex)) return;

    currentPalette = generatePalette(baseHex);
    paletteEl.innerHTML = "";

    currentPalette.forEach(function (swatch) {
      var whiteRatio = contrastRatio(swatch.hex, "#ffffff");
      var darkRatio = contrastRatio(swatch.hex, "#111111");
      var whiteBadge = getBadge(whiteRatio);
      var darkBadge = getBadge(darkRatio);

      // Choose text color for the swatch preview
      var textColor = swatch.lightness > 55 ? "#111111" : "#ffffff";

      var el = document.createElement("div");
      el.className = "swatch";
      el.innerHTML =
        '<div class="swatch-color" style="background:' +
        swatch.hex +
        ";color:" +
        textColor +
        '">' +
        "<span>" +
        swatch.index +
        "</span>" +
        "</div>" +
        '<div class="swatch-info">' +
        '<div class="swatch-hex">' +
        swatch.hex +
        "</div>" +
        '<div class="swatch-row">' +
        '<span class="label" style="color:#fff">\u25CF White</span>' +
        '<span class="badge ' +
        whiteBadge.cls +
        '">' +
        whiteBadge.text +
        " " +
        whiteRatio.toFixed(1) +
        "</span>" +
        "</div>" +
        '<div class="swatch-row">' +
        '<span class="label">\u25CF Dark</span>' +
        '<span class="badge ' +
        darkBadge.cls +
        '">' +
        darkBadge.text +
        " " +
        darkRatio.toFixed(1) +
        "</span>" +
        "</div>" +
        "</div>";
      paletteEl.appendChild(el);
    });
  }

  // ── Copy CSS ──
  function copyCss() {
    var lines = [":root {"];
    currentPalette.forEach(function (s) {
      lines.push("  --color-" + s.index + ": " + s.hex + ";");
    });
    lines.push("}");
    navigator.clipboard.writeText(lines.join("\n")).then(function () {
      copyToast.classList.add("show");
      setTimeout(function () {
        copyToast.classList.remove("show");
      }, 1500);
    });
  }

  // ── Events ──
  basePicker.addEventListener("input", function () {
    baseInput.value = basePicker.value;
    render();
  });

  baseInput.addEventListener("input", function () {
    if (/^#([0-9a-fA-F]{6})$/.test(baseInput.value)) {
      basePicker.value = baseInput.value;
    }
    render();
  });

  randomBtn.addEventListener("click", function () {
    var h = Math.floor(Math.random() * 360);
    var s = 50 + Math.floor(Math.random() * 40);
    var l = 40 + Math.floor(Math.random() * 20);
    var rgb = hslToRgb(h, s, l);
    var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    baseInput.value = hex;
    basePicker.value = hex;
    render();
  });

  copyBtn.addEventListener("click", copyCss);

  // ── Init ──
  render();
})();
