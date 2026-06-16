/* Hollow Reign — Press Kit interactions (illustrative demo, no real downloads) */
(() => {
  "use strict";

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  /* ---------- Copy-to-clipboard (contact + asset links) ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  document.querySelectorAll(".copy-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.copy;
      copyText(value).then(() => {
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 1200);
        toast(`Copied: ${value}`);
      });
    });
  });

  /* ---------- Asset filter chips ---------- */
  const chips = document.querySelectorAll(".chip[data-filter]");
  const assets = Array.from(document.querySelectorAll(".asset"));
  const assetEmpty = document.getElementById("assetEmpty");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });

      const filter = chip.dataset.filter;
      let visible = 0;
      assets.forEach((card) => {
        const show = filter === "all" || card.dataset.type === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      assetEmpty.hidden = visible > 0;
      syncSelectAllState();
    });
  });

  /* ---------- Selection: per-card, select-all, bulk count ---------- */
  const selectAll = document.getElementById("selectAll");
  const bulkBtn = document.getElementById("downloadSelected");
  const bulkCount = document.getElementById("bulkCount");
  const checks = Array.from(document.querySelectorAll(".asset-select"));

  function visibleChecks() {
    return checks.filter((cb) => !cb.closest(".asset").classList.contains("is-hidden"));
  }

  function selectedChecks() {
    return checks.filter((cb) => cb.checked);
  }

  function syncSelectAllState() {
    const vis = visibleChecks();
    const visChecked = vis.filter((cb) => cb.checked);
    selectAll.checked = vis.length > 0 && visChecked.length === vis.length;
    selectAll.indeterminate = visChecked.length > 0 && visChecked.length < vis.length;
    updateBulkBar();
  }

  function updateBulkBar() {
    const n = selectedChecks().length;
    bulkCount.textContent = `(${n})`;
    bulkBtn.disabled = n === 0;
  }

  checks.forEach((cb) => {
    cb.addEventListener("change", () => {
      cb.closest(".asset").classList.toggle("is-selected", cb.checked);
      syncSelectAllState();
    });
  });

  selectAll.addEventListener("change", () => {
    visibleChecks().forEach((cb) => {
      cb.checked = selectAll.checked;
      cb.closest(".asset").classList.toggle("is-selected", cb.checked);
    });
    syncSelectAllState();
  });

  /* ---------- Single download simulation ---------- */
  function simulateDownload(btn, name, size, done) {
    const original = btn.textContent;
    btn.classList.add("is-busy");
    btn.setAttribute("aria-busy", "true");

    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(100, pct + 12 + Math.floor(Math.random() * 18));
      btn.textContent = `${pct}%`;
      if (pct >= 100) {
        clearInterval(tick);
        btn.classList.remove("is-busy");
        btn.classList.add("is-done");
        btn.removeAttribute("aria-busy");
        btn.textContent = "Saved ✓";
        toast(`Downloaded ${name} (${size}) — demo only`);
        setTimeout(() => {
          btn.classList.remove("is-done");
          btn.textContent = original;
        }, 1800);
        if (done) done();
      }
    }, 140);
  }

  document.querySelectorAll(".dl-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-busy")) return;
      simulateDownload(btn, btn.dataset.name, btn.dataset.size);
    });
  });

  /* ---------- Download selected (bulk simulation) ---------- */
  bulkBtn.addEventListener("click", () => {
    const queue = selectedChecks().map((cb) => cb.closest(".asset").querySelector(".dl-btn"));
    if (!queue.length) return;

    bulkBtn.disabled = true;
    const originalLabel = bulkBtn.firstChild.textContent;
    toast(`Bundling ${queue.length} asset${queue.length > 1 ? "s" : ""}…`);

    let i = 0;
    function next() {
      if (i >= queue.length) {
        bulkBtn.firstChild.textContent = originalLabel;
        toast("All selected assets downloaded — demo only");
        // Clear selection
        checks.forEach((cb) => {
          cb.checked = false;
          cb.closest(".asset").classList.remove("is-selected");
        });
        syncSelectAllState();
        return;
      }
      const btn = queue[i++];
      bulkBtn.firstChild.textContent = `Downloading ${i}/${queue.length} `;
      simulateDownload(btn, btn.dataset.name, btn.dataset.size, next);
    }
    next();
  });

  /* ---------- Review copy form ---------- */
  const form = document.getElementById("reviewForm");
  const outletInput = document.getElementById("outletInput");
  const emailInput = document.getElementById("emailInput");
  const submitBtn = document.getElementById("reviewSubmit");

  function flagInvalid(input) {
    input.classList.add("is-invalid");
    input.addEventListener("input", () => input.classList.remove("is-invalid"), { once: true });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const outlet = outletInput.value.trim();
    const email = emailInput.value.trim();
    let ok = true;

    if (!outlet) {
      flagInvalid(outletInput);
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      flagInvalid(emailInput);
      ok = false;
    }
    if (!ok) {
      toast("Add your outlet and a valid work email");
      return;
    }

    submitBtn.classList.add("is-busy");
    submitBtn.textContent = "Sending…";
    setTimeout(() => {
      submitBtn.classList.remove("is-busy");
      submitBtn.textContent = "Request Review Copy";
      form.reset();
      toast(`Request received for ${outlet} — keys ship in the next wave`);
    }, 900);
  });

  /* ---------- Header CTA scrolls to the form ---------- */
  document.getElementById("reviewCopyTop").addEventListener("click", () => {
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => outletInput.focus({ preventScroll: true }), 450);
  });

  /* Initial state */
  syncSelectAllState();
})();
