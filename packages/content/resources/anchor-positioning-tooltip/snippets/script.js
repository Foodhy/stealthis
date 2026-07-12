(() => {
  "use strict";

  const NATIVE = CSS.supports("anchor-name: --x") &&
    CSS.supports("position-area: top");

  /* ---------------- Support badge ---------------- */
  const badge = document.getElementById("support");
  if (NATIVE) {
    badge.textContent = "Native CSS anchor positioning — running the real feature";
    badge.classList.add("is-native");
  } else {
    badge.textContent = "No native support — JS fallback polyfill active";
    badge.classList.add("is-poly");
  }

  /* ---------------- Playground refs ---------------- */
  const stage = document.getElementById("stage");
  const anchor = document.getElementById("anchor");
  const pop = document.getElementById("pop");
  const placeSel = document.getElementById("place");
  const fbToggle = document.getElementById("fallbacks");
  const resetBtn = document.getElementById("reset");
  const codeEl = document.getElementById("code");

  // Anchor position as a fraction of the stage (kept in sync for both paths).
  let ax = 0.5;
  let ay = 0.5;

  /* ---------------- Shared placement math ---------------- */
  // Returns [dx, dy] unit-ish direction the popover sits relative to anchor.
  function areaVector(area) {
    const v = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };
    const parts = area.split(" ");
    let dx = 0;
    let dy = 0;
    for (const p of parts) {
      if (v[p]) {
        dx += v[p][0];
        dy += v[p][1];
      }
    }
    return [dx, dy];
  }

  // Flip a placement across whichever axis is clipping.
  function flipArea(area, flipX, flipY) {
    const swap = { top: "bottom", bottom: "top", left: "right", right: "left" };
    return area
      .split(" ")
      .map((p) => {
        if ((flipY && (p === "top" || p === "bottom")) ||
            (flipX && (p === "left" || p === "right"))) {
          return swap[p];
        }
        return p;
      })
      .join(" ");
  }

  /* ---------------- Native path ---------------- */
  function applyNative() {
    const area = placeSel.value;
    pop.style.setProperty("--pa", area);
    stage.dataset.fallbacks = fbToggle.checked ? "on" : "off";
  }

  /* ---------------- Polyfill path ---------------- */
  function positionManually() {
    const sr = stage.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const gap = 10;

    let area = placeSel.value;

    // Anchor box relative to stage.
    const aLeft = ar.left - sr.left;
    const aTop = ar.top - sr.top;
    const aCx = aLeft + ar.width / 2;
    const aCy = aTop + ar.height / 2;

    function coords(a) {
      const [dx, dy] = areaVector(a);
      let x = aCx - pr.width / 2 + dx * (ar.width / 2 + pr.width / 2 + gap);
      let y = aCy - pr.height / 2 + dy * (ar.height / 2 + pr.height / 2 + gap);
      return [x, y];
    }

    let [x, y] = coords(area);

    // Edge-flip when fallbacks are on.
    if (fbToggle.checked) {
      const overRight = x + pr.width > sr.width;
      const overLeft = x < 0;
      const overBottom = y + pr.height > sr.height;
      const overTop = y < 0;
      const flipX = overRight || overLeft;
      const flipY = overBottom || overTop;
      if (flipX || flipY) {
        const flipped = flipArea(area, flipX, flipY);
        const [fx, fy] = coords(flipped);
        // Only adopt the flip if it actually improves fit on that axis.
        if (fx >= 0 && fx + pr.width <= sr.width) x = fx;
        if (fy >= 0 && fy + pr.height <= sr.height) y = fy;
        area = flipped;
      }
    }

    // Clamp so it never leaves the stage.
    x = Math.max(4, Math.min(x, sr.width - pr.width - 4));
    y = Math.max(4, Math.min(y, sr.height - pr.height - 4));

    pop.style.margin = "0";
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
  }

  /* ---------------- Code readout ---------------- */
  function renderCode() {
    const area = placeSel.value;
    const fb = fbToggle.checked;
    const lines = [
      ['.anchor', "sel"],
      ["  anchor-name", "--play-anchor", "prop"],
      ["", "", "gap"],
      ['.popover', "sel"],
      ["  position-anchor", "--play-anchor", "prop"],
      ["  position-area", area, "prop"],
    ];
    if (fb) {
      lines.push(["  position-try-fallbacks", "flip-block, flip-inline", "prop"]);
    }
    if (!NATIVE) {
      lines.push(["", "", "gap"]);
      lines.push(["/* no native support -> JS positioning */", "", "com"]);
    }

    let html = "";
    for (const ln of lines) {
      if (ln[1] === "sel") {
        html += `<span class="tok-sel">${ln[0]}</span> {\n`;
      } else if (ln[1] === "gap") {
        html += "}\n\n";
      } else if (ln[2] === "com") {
        html += `<span class="tok-com">${escapeHtml(ln[0])}</span>\n`;
      } else {
        html += `  <span class="tok-prop">${ln[0].trim()}</span>: <span class="tok-val">${escapeHtml(ln[1])}</span>;\n`;
      }
    }
    html += "}";
    codeEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  /* ---------------- Update loop ---------------- */
  function place() {
    // Position the anchor from ax/ay fractions.
    const sr = stage.getBoundingClientRect();
    const px = ax * sr.width;
    const py = ay * sr.height;
    anchor.style.left = `${px}px`;
    anchor.style.top = `${py}px`;

    if (NATIVE) {
      applyNative();
      pop.classList.remove("tip--js");
    } else {
      pop.classList.add("tip--js");
      positionManually();
    }
    renderCode();
  }

  /* ---------------- Drag (pointer) ---------------- */
  let dragging = false;
  function startDrag(e) {
    dragging = true;
    anchor.classList.add("is-drag");
    anchor.setPointerCapture?.(e.pointerId);
  }
  function moveDrag(e) {
    if (!dragging) return;
    const sr = stage.getBoundingClientRect();
    ax = clamp((e.clientX - sr.left) / sr.width, 0.08, 0.92);
    ay = clamp((e.clientY - sr.top) / sr.height, 0.1, 0.9);
    place();
  }
  function endDrag() {
    dragging = false;
    anchor.classList.remove("is-drag");
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  anchor.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);

  // Keyboard nudging for accessibility.
  anchor.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    let handled = true;
    if (e.key === "ArrowLeft") ax = clamp(ax - step, 0.08, 0.92);
    else if (e.key === "ArrowRight") ax = clamp(ax + step, 0.08, 0.92);
    else if (e.key === "ArrowUp") ay = clamp(ay - step, 0.1, 0.9);
    else if (e.key === "ArrowDown") ay = clamp(ay + step, 0.1, 0.9);
    else handled = false;
    if (handled) {
      e.preventDefault();
      place();
    }
  });

  /* ---------------- Controls ---------------- */
  placeSel.addEventListener("change", place);
  fbToggle.addEventListener("change", place);
  resetBtn.addEventListener("click", () => {
    ax = 0.5;
    ay = 0.5;
    place();
  });

  window.addEventListener("resize", place);

  /* ---------------- Grid polyfill ---------------- */
  // In non-supporting browsers, position the .tip elements manually on hover/focus.
  if (!NATIVE) {
    document.querySelectorAll(".dot").forEach((dot) => {
      const tip = dot.querySelector(".tip");
      tip.classList.add("tip--js");
      const area = dot.dataset.area;

      function pos() {
        // Position relative to the dot (tip is absolutely placed inside it).
        const [dx, dy] = areaVector(area);
        const dw = dot.offsetWidth;
        const dh = dot.offsetHeight;
        const tw = tip.offsetWidth;
        const th = tip.offsetHeight;
        const gap = 8;
        let x = dw / 2 - tw / 2 + dx * (dw / 2 + tw / 2 + gap);
        let y = dh / 2 - th / 2 + dy * (dh / 2 + th / 2 + gap);
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
        tip.style.margin = "0";
      }
      dot.addEventListener("pointerenter", pos);
      dot.addEventListener("focus", pos);
    });
  }

  /* ---------------- Init ---------------- */
  place();
})();
