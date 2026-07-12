(function () {
  "use strict";

  // --- Feature detection: does the engine support the CSS @scope at-rule? ---
  // CSS.supports("at-rule") isn't broadly available, so probe by injecting a
  // scoped rule into a real stylesheet and reading back whether a scoped
  // element actually receives the declaration.
  function detectScope() {
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
      try {
        // Some engines expose at-rule support directly.
        if (CSS.supports("at-rule(@scope)")) return true;
      } catch (_) {
        /* fall through to runtime probe */
      }
    }
    try {
      var probe = document.createElement("div");
      probe.setAttribute("data-scope-probe", "");
      probe.style.position = "absolute";
      probe.style.opacity = "0";
      probe.style.pointerEvents = "none";
      var inner = document.createElement("span");
      probe.appendChild(inner);
      document.body.appendChild(probe);

      var style = document.createElement("style");
      style.textContent =
        "@scope ([data-scope-probe]) { :scope span { --scope-ok: 1; outline-width: 3px; } }";
      document.head.appendChild(style);

      var val = getComputedStyle(inner).outlineWidth;
      var ok = val === "3px";

      document.head.removeChild(style);
      document.body.removeChild(probe);
      return ok;
    } catch (_) {
      return false;
    }
  }

  var NATIVE = detectScope();

  // --- Support badge ---
  var support = document.getElementById("support");
  var supportLabel = support.querySelector(".support__label");
  if (NATIVE) {
    support.classList.add("is-native");
    supportLabel.innerHTML = "Native <code>@scope</code> active";
  } else {
    support.classList.add("is-fallback");
    supportLabel.innerHTML = "Fallback: attribute scoping";
  }

  // --- Live theme state, per brand ---
  var brands = {
    a: { hue: 266, sat: 78 },
    b: { hue: 18, sat: 82 },
  };

  // One <style> element that holds the generated @scope (native) or
  // :root-var (fallback) rules for both brands.
  var themeStyle = document.createElement("style");
  themeStyle.id = "scope-theme";
  document.head.appendChild(themeStyle);

  function hsl(h, s, l) {
    return "hsl(" + h + " " + s + "% " + l + "%)";
  }

  // Build the tokens object for a brand from its hue/sat.
  function tokensFor(b) {
    var h = b.hue;
    var s = b.sat;
    return {
      accent: hsl(h, s, 62),
      accentSoft: "hsl(" + h + " " + s + "% 62% / 0.16)",
      line: "hsl(" + h + " " + s + "% 62% / 0.35)",
      title: hsl(h, Math.min(s + 6, 100), 82),
      glow: "hsl(" + h + " " + s + "% 55% / 0.55)",
      ink: "#0b0b10",
    };
  }

  // Produce the actual CSS text. In native mode we emit real @scope blocks so
  // the .card / .badge / .cta classes are re-styled ONLY inside .brand-a and
  // .brand-b — proving there's no leakage even though both use the same names.
  function buildCSS() {
    var out = "";
    ["a", "b"].forEach(function (key) {
      var t = tokensFor(brands[key]);
      var sel = ".brand-" + key;
      if (NATIVE) {
        out +=
          "@scope (" + sel + ") {\n" +
          "  .swatch { background: " + t.accent + "; border-color: " + t.line + "; }\n" +
          "  .card { border-color: " + t.line + "; box-shadow: 0 22px 55px -34px " + t.glow + "; }\n" +
          "  .card:hover { border-color: " + t.accent + "; box-shadow: 0 26px 60px -30px " + t.glow + "; }\n" +
          "  .card__title, .price { color: " + t.title + "; }\n" +
          "  .badge { background: " + t.accentSoft + "; color: " + t.title + "; }\n" +
          "  .tick { background: " + t.accent + "; color: " + t.ink + "; }\n" +
          "  .cta { background: " + t.accent + "; color: " + t.ink + "; box-shadow: 0 10px 26px -12px " + t.glow + "; }\n" +
          "  .cta:hover { filter: brightness(1.08); }\n" +
          "  .ghost:hover { border-color: " + t.accent + "; color: " + t.title + "; }\n" +
          "}\n";
      } else {
        out +=
          sel + " {\n" +
          "  --brand-accent: " + t.accent + ";\n" +
          "  --brand-line: " + t.line + ";\n" +
          "  --brand-title: " + t.title + ";\n" +
          "  --brand-glow: " + t.glow + ";\n" +
          "  --brand-ink: " + t.ink + ";\n" +
          "}\n";
      }
    });
    return out;
  }

  function applyTheme() {
    themeStyle.textContent = buildCSS();
    // keep swatches in sync in fallback mode too
    updateSwatches();
    renderSource();
  }

  function updateSwatches() {
    ["a", "b"].forEach(function (key) {
      var region = document.querySelector('[data-brand="' + key + '"]');
      if (!region) return;
      var t = tokensFor(brands[key]);
      var sw = region.querySelector(".swatch");
      if (sw && !NATIVE) sw.style.background = t.accent;
    });
  }

  // --- Syntax-highlighted preview of the generated rule for brand A ---
  var cssOut = document.getElementById("cssOut");

  function esc(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderSource() {
    var t = tokensFor(brands.a);
    var raw;
    if (NATIVE) {
      raw =
        "/* Brand A — same class names, fenced by @scope */\n" +
        "@scope (.brand-a) {\n" +
        "  .card { border-color: " + t.line + "; }\n" +
        "  .badge { background: " + t.accentSoft + "; }\n" +
        "  .cta  { background: " + t.accent + "; }\n" +
        "}\n\n" +
        "@scope (.brand-b) {\n" +
        "  .cta  { background: " + tokensFor(brands.b).accent + "; }\n" +
        "}\n\n" +
        "/* Donut: theme the thread but stop at the quote */\n" +
        "@scope (.thread) to (.quote) {\n" +
        "  .note__link { color: var(--accent-2); }\n" +
        "}";
    } else {
      raw =
        "/* @scope not supported — attribute fallback */\n" +
        ".brand-a { --brand-accent: " + t.accent + "; }\n" +
        ".brand-b { --brand-accent: " + tokensFor(brands.b).accent + "; }\n\n" +
        "[data-brand] .cta { background: var(--brand-accent); }";
    }

    // lightweight tokenizer for display only
    var html = esc(raw)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>')
      .replace(/(@scope|to)\b/g, '<span class="k">$1</span>')
      .replace(/(hsl\([^)]*\))/g, '<span class="s">$1</span>')
      .replace(/(\.[a-z][\w-]*|:scope|\[data-brand\])/g, '<span class="p">$1</span>');
    cssOut.innerHTML = html;
  }

  // --- Wire up hue sliders ---
  document.querySelectorAll(".hue__input").forEach(function (input) {
    var key = input.getAttribute("data-hue");
    input.addEventListener("input", function () {
      brands[key].hue = Number(input.value);
      applyTheme();
    });
  });

  // --- Donut hole toggle ---
  var donutToggle = document.getElementById("donutToggle");
  var thread = document.getElementById("thread");
  // Style element that supplies the donut-scoped theme.
  var donutStyle = document.createElement("style");
  donutStyle.id = "donut-theme";
  document.head.appendChild(donutStyle);

  function applyDonut() {
    var on = donutToggle.checked;
    thread.setAttribute("data-hole", on ? "on" : "off");
    if (NATIVE) {
      if (on) {
        // Donut scope: applies to .thread down to (but not including) .quote.
        donutStyle.textContent =
          "@scope (#thread) to (.quote) {\n" +
          "  .note { border-color: rgba(34,211,238,0.4); box-shadow: 0 0 0 1px rgba(34,211,238,0.12) inset; }\n" +
          "  .note__link { color: var(--accent-2); border-bottom-color: rgba(34,211,238,0.6); }\n" +
          "  .note__body { color: #dff6fb; }\n" +
          "}\n";
      } else {
        // No lower boundary => the quote gets themed too (hole closed).
        donutStyle.textContent =
          "@scope (#thread) {\n" +
          "  .note, .quote { border-color: rgba(34,211,238,0.4); }\n" +
          "  .note__link { color: var(--accent-2); border-bottom-color: rgba(34,211,238,0.6); }\n" +
          "  .note__body { color: #dff6fb; }\n" +
          "}\n";
      }
    } else {
      // Fallback: emulate donut with :not() descendant selectors.
      if (on) {
        donutStyle.textContent =
          "#thread .note > .note__link, #thread .note > .note__body { }\n" +
          "#thread > .note { border-color: rgba(34,211,238,0.4); }\n" +
          "#thread > .note > .note__link { color: var(--accent-2); border-bottom-color: rgba(34,211,238,0.6); }\n" +
          "#thread > .note > .note__body { color: #dff6fb; }\n";
      } else {
        donutStyle.textContent =
          "#thread .note__link { color: var(--accent-2); border-bottom-color: rgba(34,211,238,0.6); }\n" +
          "#thread .note__body { color: #dff6fb; }\n" +
          "#thread .note, #thread .quote { border-color: rgba(34,211,238,0.4); }\n";
      }
    }
  }

  donutToggle.addEventListener("change", applyDonut);

  // --- Card CTA feedback ---
  document.querySelectorAll(".cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var original = btn.textContent;
      btn.textContent = "Selected ✓";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1400);
    });
  });

  // --- Bookmark ghost toggle ---
  document.querySelectorAll(".ghost").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      btn.textContent = on ? "☆" : "★";
    });
  });

  // --- Init ---
  applyTheme();
  applyDonut();
})();
