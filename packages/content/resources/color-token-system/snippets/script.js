(function () {
  var toggleBtn = document.getElementById("theme-toggle");
  var themeLabel = document.getElementById("theme-label");
  var body = document.body;

  // ── Token values for each theme ──
  var tokens = {
    dark: {
      "--color-text-primary": "#e5e5e5",
      "--color-text-secondary": "#a3a3a3",
      "--color-text-muted": "#737373",
      "--color-text-inverse": "#0a0a0a",
      "--color-bg-base": "#0a0a0a",
      "--color-bg-surface": "#141414",
      "--color-bg-elevated": "#1a1a1a",
      "--color-bg-overlay": "#262626",
      "--color-border-default": "#262626",
      "--color-border-strong": "#404040",
      "--color-accent": "#3b82f6",
      "--color-accent-text": "#ffffff",
      "--color-success": "#4ade80",
      "--color-warning": "#fbbf24",
      "--color-error": "#f87171",
      "--color-info": "#60a5fa",
    },
    light: {
      "--color-text-primary": "#111111",
      "--color-text-secondary": "#525252",
      "--color-text-muted": "#737373",
      "--color-text-inverse": "#ffffff",
      "--color-bg-base": "#ffffff",
      "--color-bg-surface": "#f5f5f5",
      "--color-bg-elevated": "#fafafa",
      "--color-bg-overlay": "#e5e5e5",
      "--color-border-default": "#e5e5e5",
      "--color-border-strong": "#d4d4d4",
      "--color-accent": "#2563eb",
      "--color-accent-text": "#ffffff",
      "--color-success": "#16a34a",
      "--color-warning": "#d97706",
      "--color-error": "#dc2626",
      "--color-info": "#2563eb",
    },
  };

  var textTokens = [
    "--color-text-primary",
    "--color-text-secondary",
    "--color-text-muted",
    "--color-text-inverse",
    "--color-accent",
    "--color-success",
    "--color-warning",
    "--color-error",
    "--color-info",
  ];

  var bgTokens = [
    "--color-bg-base",
    "--color-bg-surface",
    "--color-bg-elevated",
    "--color-bg-overlay",
  ];

  var currentTheme = "dark";

  // ── WCAG helpers ──
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

  function luminance(rgb) {
    return 0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
  }

  function contrastRatio(hex1, hex2) {
    var l1 = luminance(hexToRgb(hex1));
    var l2 = luminance(hexToRgb(hex2));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function shortName(token) {
    return token.replace("--color-", "");
  }

  // ── Update token swatches ──
  function updateSwatches() {
    var t = tokens[currentTheme];
    var rows = document.querySelectorAll(".token-row[data-token]");
    rows.forEach(function (row) {
      var name = row.getAttribute("data-token");
      var val = t[name];
      if (!val) return;
      row.querySelector(".token-swatch").style.background = val;
      row.querySelector(".token-value").textContent = val;
    });
  }

  // ── Build contrast matrix ──
  function buildMatrix() {
    var t = tokens[currentTheme];
    var thead = document.getElementById("matrix-head");
    var tbody = document.getElementById("matrix-body");

    // Header row
    var headerHtml = "<tr><th></th>";
    bgTokens.forEach(function (bg) {
      headerHtml += "<th>" + shortName(bg) + "</th>";
    });
    headerHtml += "</tr>";
    thead.innerHTML = headerHtml;

    // Body rows
    tbody.innerHTML = "";
    textTokens.forEach(function (fg) {
      var tr = document.createElement("tr");
      var rowHtml = "<td>" + shortName(fg) + "</td>";

      bgTokens.forEach(function (bg) {
        var ratio = contrastRatio(t[fg], t[bg]);
        var cls, label;
        if (ratio >= 7) {
          cls = "cell-aaa";
          label = ratio.toFixed(1) + " AAA";
        } else if (ratio >= 4.5) {
          cls = "cell-aa";
          label = ratio.toFixed(1) + " AA";
        } else {
          cls = "cell-fail";
          label = ratio.toFixed(1);
        }
        rowHtml += '<td class="' + cls + '">' + label + "</td>";
      });

      tr.innerHTML = rowHtml;
      tbody.appendChild(tr);
    });
  }

  // ── Apply theme ──
  function applyTheme(theme) {
    currentTheme = theme;
    if (theme === "light") {
      body.classList.add("light");
    } else {
      body.classList.remove("light");
    }
    themeLabel.textContent = theme === "light" ? "Dark" : "Light";
    updateSwatches();
    buildMatrix();
  }

  // ── Events ──
  toggleBtn.addEventListener("click", function () {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // ── Init ──
  applyTheme("dark");
})();
