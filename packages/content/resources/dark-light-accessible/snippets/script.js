(function () {
  var toggleBtn = document.getElementById("theme-toggle");
  var themeLabel = document.getElementById("theme-label");
  var tbody = document.getElementById("contrast-tbody");
  var body = document.body;

  // ── WCAG contrast helpers ──
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

  // ── Theme definitions ──
  var themes = {
    dark: {
      bg: "#0a0a0a",
      surface: "#141414",
      text: "#e5e5e5",
      textSecondary: "#a3a3a3",
      link: "#60a5fa",
      inputBg: "#171717",
      inputText: "#e5e5e5",
    },
    light: {
      bg: "#ffffff",
      surface: "#f5f5f5",
      text: "#111111",
      textSecondary: "#525252",
      link: "#2563eb",
      inputBg: "#ffffff",
      inputText: "#111111",
    },
  };

  var colorPairs = [
    { name: "Text / Background", fgKey: "text", bgKey: "bg", pairId: "text-bg" },
    { name: "Text / Surface", fgKey: "text", bgKey: "surface", pairId: "text-surface" },
    { name: "Secondary / Background", fgKey: "textSecondary", bgKey: "bg", pairId: "secondary-bg" },
    { name: "Link / Background", fgKey: "link", bgKey: "bg", pairId: "link-bg" },
    { name: "Input text / Input bg", fgKey: "inputText", bgKey: "inputBg", pairId: "input-text" },
  ];

  var currentTheme = "dark";

  // ── Detect OS preference ──
  function getPreferred() {
    var stored = localStorage.getItem("theme-preference");
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
      return "light";
    return "dark";
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
    localStorage.setItem("theme-preference", theme);
    updateRatios();
  }

  // ── Update ratio badges and table ──
  function updateRatios() {
    var t = themes[currentTheme];

    // Update inline badges
    var badges = document.querySelectorAll(".ratio-badge[data-pair]");
    badges.forEach(function (badge) {
      var pair = colorPairs.find(function (p) {
        return p.pairId === badge.getAttribute("data-pair");
      });
      if (pair) {
        var ratio = contrastRatio(t[pair.fgKey], t[pair.bgKey]);
        badge.textContent = ratio.toFixed(1) + ":1";
        badge.style.color = ratio >= 4.5 ? "#22c55e" : "#ef4444";
      }
    });

    // Update table
    tbody.innerHTML = "";
    colorPairs.forEach(function (pair) {
      var fg = t[pair.fgKey];
      var bg = t[pair.bgKey];
      var ratio = contrastRatio(fg, bg);
      var passAA = ratio >= 4.5;
      var passAAA = ratio >= 7;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        pair.name +
        "</td>" +
        '<td><span class="swatch-cell" style="background:' +
        fg +
        '"></span> ' +
        fg +
        "</td>" +
        '<td><span class="swatch-cell" style="background:' +
        bg +
        '"></span> ' +
        bg +
        "</td>" +
        "<td><strong>" +
        ratio.toFixed(2) +
        ":1</strong></td>" +
        '<td class="' +
        (passAA ? "pass-cell" : "fail-cell") +
        '">' +
        (passAA ? "\u2713 Pass" : "\u2717 Fail") +
        "</td>" +
        '<td class="' +
        (passAAA ? "pass-cell" : "fail-cell") +
        '">' +
        (passAAA ? "\u2713 Pass" : "\u2717 Fail") +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  // ── Toggle ──
  toggleBtn.addEventListener("click", function () {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // ── Listen for OS changes ──
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
      if (!localStorage.getItem("theme-preference")) {
        applyTheme(e.matches ? "light" : "dark");
      }
    });
  }

  // ── Init ──
  applyTheme(getPreferred());
})();
