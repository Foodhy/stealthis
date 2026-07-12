(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---- Feature detection ---------------------------------------------------
  const supportsMix = CSS.supports("color", "color-mix(in oklch, red, blue)");
  const supportsOklch = CSS.supports("color", "oklch(0.7 0.1 200)");
  const supportsRelative = CSS.supports("color", "oklch(from red l c h)");
  // Fall back to sRGB interpolation when oklch mixing isn't available.
  const mixSpace = supportsMix && supportsOklch ? "oklch" : "srgb";

  // ---- Token recipes -------------------------------------------------------
  // Each token = { mix: [colorA-percent], relative: {l,c,h adjust} }
  // `p` is scaled by the intensity multiplier at build time.
  const RECIPES = [
    { key: "tint-strong", label: "Tint strong", mixWith: "white", mixPct: 88, rel: { l: "* 1.9", c: "* 0.35" } },
    { key: "tint", label: "Tint", mixWith: "white", mixPct: 80, rel: { l: "* 1.7", c: "* 0.5" } },
    { key: "soft", label: "Soft surface", mixWith: "black", mixPct: 90, rel: { l: "* 0.5", c: "* 0.7" } },
    { key: "base", label: "Base", mixWith: null, mixPct: 0, rel: null },
    { key: "hover", label: "Hover", mixWith: "white", mixPct: 18, rel: { l: "+ 0.06", c: "* 1" } },
    { key: "active", label: "Active", mixWith: "black", mixPct: 22, rel: { l: "- 0.07", c: "* 1" } },
    { key: "shade", label: "Shade", mixWith: "black", mixPct: 45, rel: { l: "* 0.55", c: "* 0.9" } },
  ];

  // ---- Elements ------------------------------------------------------------
  const scope = $("#scope");
  const baseColor = $("#baseColor");
  const basePreview = $("#basePreview");
  const baseHex = $("#baseHex");
  const hue = $("#hue");
  const hueVal = $("#hueVal");
  const intensity = $("#intensity");
  const intensityVal = $("#intensityVal");
  const codeOut = $("#codeOut");
  const codeEngine = $("#codeEngine");
  const copyBtn = $("#copyBtn");
  const supportEl = $("#support");
  const engineSeg = $("#engineSeg");

  let engine = "mix"; // default engine: color-mix()
  let base = "#8b5cf6";

  // ---- Color helpers -------------------------------------------------------
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex({ r, g, b }) {
    return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return { h, s, l };
  }
  function hslToRgb({ h, s, l }) {
    h /= 360;
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
  }

  // Relative luminance for choosing readable text on the base color.
  function readableText(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lin = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.45 ? "#0c0d10" : "#ffffff";
  }

  // ---- CSS value builders --------------------------------------------------
  // Intensity multiplier: 100 => 1.0
  function scaledPct(pct, mult) {
    return Math.max(0, Math.min(100, Math.round(pct * mult)));
  }

  function mixValue(recipe, mult) {
    if (!recipe.mixWith) return "var(--base)";
    const pct = scaledPct(recipe.mixPct, recipe.mixWith === "white" ? mult : mult);
    // color-mix(in <space>, var(--base) X%, white)
    const basePct = 100 - pct;
    return `color-mix(in ${mixSpace}, var(--base) ${basePct}%, ${recipe.mixWith})`;
  }

  function relativeValue(recipe) {
    if (!recipe.rel) return "var(--base)";
    const { l, c } = recipe.rel;
    return `oklch(from var(--base) calc(l ${l}) calc(c ${c}) h)`;
  }

  function tokenValue(recipe, mult) {
    if (engine === "relative" && supportsRelative) {
      return relativeValue(recipe);
    }
    return mixValue(recipe, mult);
  }

  // ---- Apply ---------------------------------------------------------------
  function apply() {
    const mult = parseInt(intensity.value, 10) / 100;
    scope.style.setProperty("--base", base);
    scope.style.setProperty("--on-base", readableText(base));

    RECIPES.forEach((r) => {
      if (r.key === "base") {
        scope.style.setProperty("--base", base);
        return;
      }
      scope.style.setProperty("--" + r.key, tokenValue(r, mult));
    });

    // Border + ring derived from tint / base
    scope.style.setProperty(
      "--border",
      `color-mix(in ${mixSpace}, var(--base) 55%, transparent)`
    );
    scope.style.setProperty(
      "--ring",
      `color-mix(in ${mixSpace}, var(--base) 40%, transparent)`
    );

    // root swatch preview uses --base too
    document.documentElement.style.setProperty("--base", base);

    renderCode(mult);
  }

  // ---- Generated code panel ------------------------------------------------
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function highlight(line) {
    let s = esc(line);
    s = s.replace(/(\/\*.*?\*\/)/g, '<span class="tok-comment">$1</span>');
    s = s.replace(/(--[\w-]+)(?=\s*:)/g, '<span class="tok-prop">$1</span>');
    s = s.replace(/\b(color-mix|oklch|calc)\b/g, '<span class="tok-fn">$1</span>');
    s = s.replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="tok-val">$1</span>');
    return s;
  }

  function renderCode(mult) {
    const useRel = engine === "relative" && supportsRelative;
    const lines = [];
    lines.push(":root {");
    lines.push(`  --base: ${base};`);
    if (!useRel) lines.push(`  /* palette mixed in ${mixSpace} */`);
    else lines.push(`  /* relative color syntax in oklch */`);

    RECIPES.forEach((r) => {
      if (r.key === "base") return;
      const val = useRel ? relativeValue(r) : mixValue(r, mult);
      lines.push(`  --${r.key}: ${val};`);
    });
    lines.push(`  --border: color-mix(in ${mixSpace}, var(--base) 55%, transparent);`);
    lines.push(`  --ring: color-mix(in ${mixSpace}, var(--base) 40%, transparent);`);
    lines.push("}");

    codeOut.innerHTML = lines.map(highlight).join("\n");
    codeOut.dataset.raw = lines.join("\n");
    codeEngine.textContent = useRel ? "oklch(from …)" : "color-mix()";
  }

  // ---- Sync base <-> hue ---------------------------------------------------
  function setBase(hex, { syncHue = true, syncPicker = true } = {}) {
    base = hex.toLowerCase();
    baseHex.textContent = base;
    if (syncPicker) baseColor.value = base;
    if (syncHue) {
      const { h } = rgbToHsl(hexToRgb(base));
      hue.value = Math.round(h);
      hueVal.innerHTML = Math.round(h) + "&deg;";
    }
    updatePresetActive();
    apply();
  }

  function setHue(deg) {
    hueVal.innerHTML = deg + "&deg;";
    const { s, l } = rgbToHsl(hexToRgb(base));
    // keep saturation/lightness, rotate hue; guard low-sat greys
    const sat = s < 0.12 ? 0.6 : s;
    const lig = l < 0.15 || l > 0.85 ? 0.6 : l;
    const hex = rgbToHex(hslToRgb({ h: deg, s: sat, l: lig }));
    setBase(hex, { syncHue: false });
  }

  function updatePresetActive() {
    $$(".preset").forEach((p) => {
      p.classList.toggle("is-on", p.dataset.color.toLowerCase() === base);
      p.setAttribute("aria-pressed", p.classList.contains("is-on") ? "true" : "false");
    });
  }

  // ---- Wire events ---------------------------------------------------------
  baseColor.addEventListener("input", (e) => setBase(e.target.value, { syncPicker: false }));

  hue.addEventListener("input", (e) => setHue(parseInt(e.target.value, 10)));

  intensity.addEventListener("input", (e) => {
    intensityVal.textContent = e.target.value + "%";
    apply();
  });

  $$(".preset").forEach((p) => {
    p.addEventListener("click", () => setBase(p.dataset.color));
  });

  engineSeg.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg__btn");
    if (!btn) return;
    engine = btn.dataset.engine;
    $$(".seg__btn", engineSeg).forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (engine === "relative" && !supportsRelative) {
      supportEl.textContent =
        "Relative color syntax (oklch(from …)) isn't supported by this browser — the preview keeps mixing, but the generated CSS shows the modern form.";
      supportEl.classList.add("warn");
    } else {
      updateSupportNote();
    }
    apply();
  });

  copyBtn.addEventListener("click", async () => {
    const text = codeOut.dataset.raw || codeOut.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("is-done");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("is-done");
    }, 1400);
  });

  function updateSupportNote() {
    supportEl.classList.remove("warn");
    if (!supportsMix) {
      supportEl.textContent =
        "Your browser lacks color-mix() — the palette falls back to static values. Update to a 2023+ browser for the full effect.";
      supportEl.classList.add("warn");
    } else if (mixSpace === "srgb") {
      supportEl.textContent =
        "color-mix() is supported, but oklch interpolation is not — falling back to gentler sRGB mixing.";
      supportEl.classList.add("warn");
    } else {
      supportEl.innerHTML =
        "Live palette derived in <b>oklch</b> via color-mix()" +
        (supportsRelative ? " — relative color syntax also available." : ".");
    }
  }

  // ---- Init ----------------------------------------------------------------
  updateSupportNote();
  setBase(base);
})();
