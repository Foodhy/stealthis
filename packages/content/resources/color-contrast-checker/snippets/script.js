(function () {
  // ── Elements ──
  var fgPicker = document.getElementById("fg-picker");
  var fgInput = document.getElementById("fg-color");
  var bgPicker = document.getElementById("bg-picker");
  var bgInput = document.getElementById("bg-color");
  var swapBtn = document.getElementById("swap-btn");
  var preview = document.getElementById("preview");
  var ratioEl = document.getElementById("ratio-value");
  var presetList = document.getElementById("preset-list");

  var badges = {
    aaNormal: document.getElementById("aa-normal-badge"),
    aaLarge: document.getElementById("aa-large-badge"),
    aaaNormal: document.getElementById("aaa-normal-badge"),
    aaaLarge: document.getElementById("aaa-large-badge"),
  };

  var cards = {
    aaNormal: document.getElementById("aa-normal"),
    aaLarge: document.getElementById("aa-large"),
    aaaNormal: document.getElementById("aaa-normal"),
    aaaLarge: document.getElementById("aaa-large"),
  };

  // ── Presets ──
  var presets = [
    { name: "White / Black", fg: "#ffffff", bg: "#000000" },
    { name: "Cream / Navy", fg: "#faf7f2", bg: "#1a1a2e" },
    { name: "Green / Dark", fg: "#22c55e", bg: "#0a0a0a" },
    { name: "Sky / Slate", fg: "#38bdf8", bg: "#0f172a" },
    { name: "Amber / Brown", fg: "#fbbf24", bg: "#1c1917" },
    { name: "Gray / White", fg: "#6b7280", bg: "#ffffff" },
    { name: "Red / Dark", fg: "#ef4444", bg: "#0a0a0a" },
    { name: "Purple / Deep", fg: "#a78bfa", bg: "#0c0a1a" },
  ];

  // ── WCAG luminance helpers ──
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function linearize(c) {
    var s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(rgb) {
    var r = linearize(rgb[0]);
    var g = linearize(rgb[1]);
    var b = linearize(rgb[2]);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(hex1, hex2) {
    var l1 = relativeLuminance(hexToRgb(hex1));
    var l2 = relativeLuminance(hexToRgb(hex2));
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function isValidHex(val) {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val);
  }

  // ── Update UI ──
  function update() {
    var fg = fgInput.value;
    var bg = bgInput.value;

    if (!isValidHex(fg) || !isValidHex(bg)) return;

    // Sync pickers
    fgPicker.value = fg.length === 4 ? "#" + fg[1] + fg[1] + fg[2] + fg[2] + fg[3] + fg[3] : fg;
    bgPicker.value = bg.length === 4 ? "#" + bg[1] + bg[1] + bg[2] + bg[2] + bg[3] + bg[3] : bg;

    // Preview
    preview.style.backgroundColor = bg;
    preview.style.color = fg;
    var links = preview.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) links[i].style.color = fg;

    // Ratio
    var ratio = contrastRatio(fg, bg);
    ratioEl.textContent = ratio.toFixed(2) + " : 1";

    // Color the ratio based on quality
    if (ratio >= 7) ratioEl.style.color = "#22c55e";
    else if (ratio >= 4.5) ratioEl.style.color = "#facc15";
    else if (ratio >= 3) ratioEl.style.color = "#f97316";
    else ratioEl.style.color = "#ef4444";

    // Check levels
    var checks = {
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };

    for (var key in checks) {
      var pass = checks[key];
      badges[key].textContent = pass ? "\u2713 Pass" : "\u2717 Fail";
      badges[key].className = "result-badge " + (pass ? "pass" : "fail");
      cards[key].className = "result-card " + (pass ? "pass" : "fail");
    }
  }

  // ── Copy / Paste helpers ──
  function showTooltip(btn, text) {
    var tip = btn.querySelector(".tooltip");
    if (!tip) {
      tip = document.createElement("span");
      tip.className = "tooltip";
      btn.appendChild(tip);
    }
    tip.textContent = text;
    tip.classList.add("show");
    btn.classList.add("copied");
    setTimeout(function () {
      tip.classList.remove("show");
      btn.classList.remove("copied");
    }, 1200);
  }

  function copyColor(btn, input) {
    navigator.clipboard.writeText(input.value).then(function () {
      showTooltip(btn, "Copied!");
    });
  }

  function pasteColor(btn, input) {
    navigator.clipboard
      .readText()
      .then(function (text) {
        text = text.trim();
        if (!text.startsWith("#")) text = "#" + text;
        if (isValidHex(text)) {
          input.value = text;
          update();
          showTooltip(btn, "Pasted!");
        } else {
          showTooltip(btn, "Invalid hex");
        }
      })
      .catch(function () {
        showTooltip(btn, "No access");
      });
  }

  var fgCopy = document.getElementById("fg-copy");
  var fgPaste = document.getElementById("fg-paste");
  var bgCopy = document.getElementById("bg-copy");
  var bgPaste = document.getElementById("bg-paste");

  fgCopy.addEventListener("click", function () {
    copyColor(fgCopy, fgInput);
  });
  fgPaste.addEventListener("click", function () {
    pasteColor(fgPaste, fgInput);
  });
  bgCopy.addEventListener("click", function () {
    copyColor(bgCopy, bgInput);
  });
  bgPaste.addEventListener("click", function () {
    pasteColor(bgPaste, bgInput);
  });

  // ── Events ──
  fgPicker.addEventListener("input", function () {
    fgInput.value = fgPicker.value;
    update();
  });
  bgPicker.addEventListener("input", function () {
    bgInput.value = bgPicker.value;
    update();
  });
  fgInput.addEventListener("input", update);
  bgInput.addEventListener("input", update);

  swapBtn.addEventListener("click", function () {
    var tmp = fgInput.value;
    fgInput.value = bgInput.value;
    bgInput.value = tmp;
    update();
  });

  // ── Build presets ──
  presets.forEach(function (p) {
    var btn = document.createElement("button");
    btn.className = "preset-btn";
    btn.innerHTML =
      '<span class="preset-swatch"><span class="preset-swatch-inner">' +
      '<span class="preset-swatch-fg" style="background:' +
      p.fg +
      '"></span>' +
      '<span class="preset-swatch-bg" style="background:' +
      p.bg +
      '"></span>' +
      "</span></span>" +
      p.name;
    btn.addEventListener("click", function () {
      fgInput.value = p.fg;
      bgInput.value = p.bg;
      update();
    });
    presetList.appendChild(btn);
  });

  // ── Init ──
  update();
})();
