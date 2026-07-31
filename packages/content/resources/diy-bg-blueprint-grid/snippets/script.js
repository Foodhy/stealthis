(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const THEMES = {
    navy:  { label: "Navy blueprint", base: "#0f2a4a", base2: "#0a1e36", rgb: "140, 180, 220" },
    kraft: { label: "Kraft paper",    base: "#d9c7a7", base2: "#c9b48f", rgb: "90, 66, 38" },
    dark:  { label: "Dark shop",      base: "#0b0d10", base2: "#06080a", rgb: "90, 220, 235" },
    cyan:  { label: "Cyan-print",     base: "#0a6d8f", base2: "#075a77", rgb: "255, 255, 255" }
  };

  const state = {
    theme: "navy",
    fine: 8,
    major: 80,
    opacity: 0.14,
    vignette: true,
    drift: false,
    grain: true
  };

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- render ---------- */
  function majorOpacity() {
    return Math.min(0.9, +(state.opacity * 1.9).toFixed(3));
  }

  function apply() {
    const t = THEMES[state.theme];
    root.style.setProperty("--g-fine", state.fine + "px");
    root.style.setProperty("--g-major", state.major + "px");
    root.style.setProperty("--g-op", String(state.opacity));
    root.style.setProperty("--g-op-major", String(majorOpacity()));
    root.style.setProperty("--g-rgb", t.rgb);
    root.style.setProperty("--g-base", t.base);
    root.style.setProperty("--g-base-2", t.base2);
    root.style.setProperty("--g-vignette", state.vignette ? "1" : "0");
    root.style.setProperty("--g-grain", state.grain ? "0.5" : "0");

    const driftOn = state.drift && !reduceMotion.matches;
    root.style.setProperty("--g-drift", driftOn ? "running" : "paused");

    body.dataset.theme = state.theme;

    $$("[data-theme-btn]").forEach((b) =>
      b.setAttribute("aria-checked", String(b.dataset.themeBtn === state.theme))
    );

    $("#fineOut").value = state.fine + "px";
    $("#majorOut").value = state.major + "px";
    $("#opacityOut").value = state.opacity.toFixed(2);

    $$('[data-out="fine"]').forEach((n) => (n.textContent = state.fine + "px"));
    $$('[data-out="major"]').forEach((n) => (n.textContent = state.major + "px"));
    $$('[data-out="opacity"]').forEach((n) => (n.textContent = state.opacity.toFixed(2)));
    const multi = $('[data-out="major-multi"]');
    if (multi) multi.textContent = (state.major / state.fine).toFixed(state.major % state.fine ? 1 : 0);

    renderCode();
  }

  function buildCSS() {
    const t = THEMES[state.theme];
    const mo = majorOpacity();
    const lines = [
      "/* " + t.label + " — Hollowbrook blueprint grid */",
      ".blueprint {",
      "  --g-fine: " + state.fine + "px;",
      "  --g-major: " + state.major + "px;",
      "  --g-op: " + state.opacity.toFixed(2) + ";",
      "  --g-op-major: " + mo + ";",
      "  --g-rgb: " + t.rgb + ";",
      "",
      "  background-color: " + t.base2 + ";",
      "  background-image:",
      "    linear-gradient(to right,  rgba(var(--g-rgb), var(--g-op-major)) 1px, transparent 1px),",
      "    linear-gradient(to bottom, rgba(var(--g-rgb), var(--g-op-major)) 1px, transparent 1px),",
      "    linear-gradient(to right,  rgba(var(--g-rgb), var(--g-op)) 1px, transparent 1px),",
      "    linear-gradient(to bottom, rgba(var(--g-rgb), var(--g-op)) 1px, transparent 1px),",
      "    radial-gradient(120% 90% at 50% -10%, " + t.base + " 0%, " + t.base2 + " 72%);",
      "  background-size:",
      "    var(--g-major) var(--g-major), var(--g-major) var(--g-major),",
      "    var(--g-fine) var(--g-fine),  var(--g-fine) var(--g-fine),",
      "    cover;",
      "}"
    ];

    if (state.grain) {
      lines.push(
        "",
        ".blueprint::after { /* paper grain */",
        "  content: \"\"; position: absolute; inset: 0; opacity: .5;",
        "  mix-blend-mode: overlay;",
        "  background-image:",
        "    radial-gradient(rgba(var(--g-rgb), .10) .5px, transparent .6px),",
        "    radial-gradient(rgba(var(--g-rgb), .07) .5px, transparent .6px);",
        "  background-size: 3px 3px, 7px 7px;",
        "}"
      );
    }

    if (state.vignette) {
      lines.push(
        "",
        ".blueprint::before { /* vignette */",
        "  content: \"\"; position: absolute; inset: 0;",
        "  background: radial-gradient(120% 85% at 50% 40%, transparent 40%, rgba(0,0,0,.5) 100%);",
        "}"
      );
    }

    if (state.drift) {
      lines.push(
        "",
        "@media (prefers-reduced-motion: no-preference) {",
        "  .blueprint { animation: drift 40s linear infinite; }",
        "  @keyframes drift { to { background-position:",
        "    var(--g-major) var(--g-major), var(--g-major) var(--g-major),",
        "    var(--g-major) var(--g-major), var(--g-major) var(--g-major), 0 0; } }",
        "}"
      );
    }

    return lines.join("\n");
  }

  function renderCode() {
    $("#codeOut").textContent = buildCSS();
  }

  /* ---------- wiring ---------- */
  $$("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.theme = btn.dataset.themeBtn;
      apply();
      toast(THEMES[state.theme].label + " applied");
    });
    btn.addEventListener("keydown", (e) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const btns = $$("[data-theme-btn]");
      const i = btns.indexOf(btn);
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      const next = btns[(i + dir + btns.length) % btns.length];
      next.focus();
      next.click();
    });
  });

  const bind = (id, key, parse) => {
    const el = $(id);
    el.addEventListener("input", () => {
      state[key] = parse(el.value);
      apply();
    });
  };
  bind("#fine", "fine", (v) => parseInt(v, 10));
  bind("#major", "major", (v) => parseInt(v, 10));
  bind("#opacity", "opacity", (v) => parseFloat(v));

  const bindToggle = (id, key, msg) => {
    const el = $(id);
    el.addEventListener("change", () => {
      state[key] = el.checked;
      apply();
      toast(msg + (el.checked ? " on" : " off"));
    });
  };
  bindToggle("#tVignette", "vignette", "Vignette");
  bindToggle("#tGrain", "grain", "Paper grain");
  bindToggle("#tDrift", "drift", "Drift");

  function syncMotion() {
    const drift = $("#tDrift");
    const hint = $("#motionHint");
    drift.disabled = reduceMotion.matches;
    hint.hidden = !reduceMotion.matches;
    apply();
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", syncMotion);

  /* copy */
  $("#copyBtn").addEventListener("click", async () => {
    const css = buildCSS();
    try {
      await navigator.clipboard.writeText(css);
      toast("CSS copied to clipboard");
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = css;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? "CSS copied to clipboard" : "Copy blocked — select the code manually");
    }
  });

  /* shuffle */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  $("#randomize").addEventListener("click", () => {
    state.theme = pick(Object.keys(THEMES));
    state.fine = 4 + Math.floor(Math.random() * 13);
    state.major = 40 + Math.floor(Math.random() * 16) * 8;
    state.opacity = +(0.06 + Math.random() * 0.3).toFixed(2);
    state.vignette = Math.random() > 0.35;
    state.grain = Math.random() > 0.4;

    $("#fine").value = state.fine;
    $("#major").value = state.major;
    $("#opacity").value = state.opacity;
    $("#tVignette").checked = state.vignette;
    $("#tGrain").checked = state.grain;

    apply();
    toast("Shuffled — " + THEMES[state.theme].label + " @ " + state.fine + "px");
  });

  /* smooth scroll buttons */
  $$("[data-scroll]").forEach((b) => {
    b.addEventListener("click", () => {
      const target = $(b.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });

  syncMotion();
})();
