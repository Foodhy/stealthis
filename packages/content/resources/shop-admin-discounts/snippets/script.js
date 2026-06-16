(() => {
  "use strict";

  /* ---------- Seed data ---------- */
  let codes = [
    { id: "c1", code: "SUMMER20", type: "percent", value: 20, min: 40, used: 312, limit: 500, start: "2026-06-01", end: "2026-08-31", paused: false },
    { id: "c2", code: "FREESHIP", type: "shipping", value: 0, min: 35, used: 1840, limit: 0, start: "2026-01-15", end: "", paused: false },
    { id: "c3", code: "WELCOME10", type: "fixed", value: 10, min: 0, used: 96, limit: 1000, start: "2026-05-10", end: "2026-12-31", paused: false },
    { id: "c4", code: "FLASH50", type: "percent", value: 50, min: 80, used: 200, limit: 200, start: "2026-06-20", end: "2026-06-22", paused: false },
    { id: "c5", code: "SPRING15", type: "percent", value: 15, min: 0, used: 540, limit: 600, start: "2026-03-01", end: "2026-05-31", paused: false },
    { id: "c6", code: "VIPNIGHT", type: "fixed", value: 25, min: 120, used: 0, limit: 300, start: "2026-09-01", end: "2026-09-02", paused: true }
  ];

  const TODAY = new Date("2026-06-14");
  let activeFilter = "all";
  let query = "";

  /* ---------- DOM refs ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const rowsEl = $("#rows");
  const emptyEl = $("#empty");
  const searchEl = $("#search");
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const form = $("#codeForm");
  const toastEl = $("#toast");

  /* ---------- Helpers ---------- */
  const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function fmtDate(d) {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // Derived lifecycle status from schedule + paused flag.
  function statusOf(c) {
    if (c.paused) return "paused";
    const start = c.start ? new Date(c.start + "T00:00:00") : null;
    const end = c.end ? new Date(c.end + "T23:59:59") : null;
    if (end && end < TODAY) return "expired";
    if (start && start > TODAY) return "scheduled";
    if (c.limit > 0 && c.used >= c.limit) return "expired";
    return "active";
  }

  const STATUS_LABEL = { active: "Active", paused: "Paused", scheduled: "Scheduled", expired: "Expired" };

  const TYPE_META = {
    percent: { ico: "%", label: "Percent off" },
    fixed: { ico: "$", label: "Fixed amount" },
    shipping: { ico: "⛟", label: "Free shipping" }
  };

  function valueText(c) {
    if (c.type === "percent") return { main: c.value + "% off", sub: c.min ? "min " + money(c.min) : "no minimum" };
    if (c.type === "fixed") return { main: money(c.value) + " off", sub: c.min ? "min " + money(c.min) : "no minimum" };
    return { main: "Free shipping", sub: c.min ? "min " + money(c.min) : "no minimum" };
  }

  function describe(c) {
    if (c.type === "percent") return `${c.value}% off orders`;
    if (c.type === "fixed") return `${money(c.value)} off orders`;
    return "Free shipping on orders";
  }

  function toast(msg, ok = true) {
    toastEl.innerHTML = `<span class="dot" style="background:${ok ? "var(--ok)" : "var(--sale)"}"></span>${esc(msg)}`;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => { toastEl.hidden = true; }, 250);
    }, 2400);
  }

  /* ---------- Rendering ---------- */
  function counts() {
    const c = { all: codes.length, active: 0, scheduled: 0, expired: 0, paused: 0 };
    codes.forEach((x) => { c[statusOf(x)]++; });
    return c;
  }

  function updateStats() {
    const c = counts();
    const totalUsed = codes.reduce((s, x) => s + x.used, 0);
    // Rough est. discount: percent ~ value% of an avg $60 order; fixed ~ value; shipping ~ $6.
    const spend = codes.reduce((s, x) => {
      if (x.type === "percent") return s + x.used * (x.value / 100) * 60;
      if (x.type === "fixed") return s + x.used * x.value;
      return s + x.used * 6;
    }, 0);
    const limited = codes.filter((x) => x.limit > 0);
    const rate = limited.length
      ? Math.round(limited.reduce((s, x) => s + Math.min(1, x.used / x.limit), 0) / limited.length * 100)
      : 0;

    $("#statActive").textContent = c.active;
    $("#statRedeem").textContent = totalUsed.toLocaleString("en-US");
    $("#statSpend").textContent = money(Math.round(spend));
    $("#statRate").textContent = rate + "%";

    Object.entries(c).forEach(([k, v]) => {
      const el = $(`.tab-count[data-count="${k}"]`);
      if (el) el.textContent = v;
    });
  }

  function rowHTML(c) {
    const st = statusOf(c);
    const tm = TYPE_META[c.type];
    const vt = valueText(c);
    const unlimited = c.limit <= 0;
    const pct = unlimited ? 100 : Math.min(100, Math.round((c.used / c.limit) * 100));
    const high = !unlimited && pct >= 85;

    const schedStart = fmtDate(c.start) || "—";
    const schedEnd = c.end ? fmtDate(c.end) : "No end date";

    const usageHTML = unlimited
      ? `<div class="usage unlimited">
           <div class="usage-meta"><span><b>${c.used.toLocaleString("en-US")}</b> used</span><span>Unlimited</span></div>
           <div class="bar"><span></span></div>
         </div>`
      : `<div class="usage">
           <div class="usage-meta"><span><b>${c.used.toLocaleString("en-US")}</b> / ${c.limit.toLocaleString("en-US")}</span><span>${pct}%</span></div>
           <div class="bar${high ? " is-high" : ""}"><span style="width:${pct}%"></span></div>
         </div>`;

    // Active toggle only meaningful while not expired.
    const canToggle = st !== "expired";
    const isOn = !c.paused;

    return `<tr data-id="${c.id}" class="${st === "expired" || st === "paused" ? "row-dim" : ""}">
      <td>
        <div class="code-cell">
          <span class="code-chip">${esc(c.code)}</span>
          <button class="copy-btn" type="button" data-act="copy" aria-label="Copy code ${esc(c.code)}" title="Copy">⧉</button>
        </div>
      </td>
      <td>
        <span class="type-cell t-${c.type}"><span class="type-ico" aria-hidden="true">${tm.ico}</span>${tm.label}</span>
      </td>
      <td class="num"><span class="val">${vt.main}</span><span class="val-sub">${vt.sub}</span></td>
      <td>${usageHTML}</td>
      <td><div class="sched"><b>${schedStart}</b><br>→ ${schedEnd}</div></td>
      <td><span class="status s-${st}">${STATUS_LABEL[st]}</span></td>
      <td>
        <div class="row-actions">
          <label class="switch" title="${canToggle ? (isOn ? "Deactivate" : "Activate") : "Expired"}">
            <input type="checkbox" data-act="toggle" ${isOn ? "checked" : ""} ${canToggle ? "" : "disabled"} aria-label="Activate ${esc(c.code)}">
            <span class="track" aria-hidden="true"><span class="thumb"></span></span>
          </label>
          <button class="icon-btn" type="button" data-act="edit" aria-label="Edit ${esc(c.code)}" title="Edit">✎</button>
          <button class="icon-btn danger" type="button" data-act="delete" aria-label="Delete ${esc(c.code)}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }

  function render() {
    const q = query.trim().toLowerCase();
    const list = codes.filter((c) => {
      const matchFilter = activeFilter === "all" || statusOf(c) === activeFilter;
      const matchQuery = !q || c.code.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });

    rowsEl.innerHTML = list.map(rowHTML).join("");
    emptyEl.hidden = list.length > 0;
    updateStats();
  }

  /* ---------- Row interactions (delegated) ---------- */
  rowsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const tr = btn.closest("tr");
    const id = tr && tr.dataset.id;
    const c = codes.find((x) => x.id === id);
    if (!c) return;
    const act = btn.dataset.act;

    if (act === "copy") {
      copyText(c.code);
      toast(`Copied “${c.code}”`);
    } else if (act === "edit") {
      openDrawer(c);
    } else if (act === "delete") {
      codes = codes.filter((x) => x.id !== id);
      render();
      toast(`Deleted “${c.code}”`, false);
    }
  });

  rowsEl.addEventListener("change", (e) => {
    const input = e.target.closest('input[data-act="toggle"]');
    if (!input) return;
    const tr = input.closest("tr");
    const c = codes.find((x) => x.id === tr.dataset.id);
    if (!c) return;
    c.paused = !input.checked;
    render();
    toast(c.paused ? `“${c.code}” paused` : `“${c.code}” is now live`, !c.paused);
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
  }

  /* ---------- Filters + search ---------- */
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active"); tab.setAttribute("aria-selected", "true");
      activeFilter = tab.dataset.filter;
      render();
    });
  });

  searchEl.addEventListener("input", () => { query = searchEl.value; render(); });

  $("#clearFilters").addEventListener("click", () => {
    query = ""; searchEl.value = "";
    activeFilter = "all";
    $$(".tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
    const allTab = $('.tab[data-filter="all"]');
    allTab.classList.add("is-active"); allTab.setAttribute("aria-selected", "true");
    render();
  });

  /* ---------- Drawer / form ---------- */
  let lastFocused = null;

  function openDrawer(c) {
    lastFocused = document.activeElement;
    form.reset();
    clearErrors();

    const isEdit = !!c;
    $("#editId").value = isEdit ? c.id : "";
    $("#drawer-title").textContent = isEdit ? "Edit promo code" : "New promo code";
    $("#saveBtn").textContent = isEdit ? "Save changes" : "Create code";

    if (isEdit) {
      $("#fCode").value = c.code;
      form.querySelector(`input[name="type"][value="${c.type}"]`).checked = true;
      $("#fValue").value = c.value;
      $("#fMin").value = c.min;
      $("#fLimit").value = c.limit;
      $("#fStart").value = c.start || "";
      $("#fEnd").value = c.end || "";
      $("#fActive").checked = !c.paused;
    } else {
      $("#fStart").value = "2026-06-14";
    }

    syncTypeUI();
    updatePreview();

    scrim.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    setTimeout(() => $("#fCode").focus(), 60);
    document.addEventListener("keydown", onKeydown);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown);
    setTimeout(() => { scrim.hidden = true; }, 260);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { closeDrawer(); return; }
    if (e.key === "Tab") trapFocus(e);
  }

  function trapFocus(e) {
    const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  $("#newCodeBtn").addEventListener("click", () => openDrawer(null));
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#cancelBtn").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  /* ---------- Code generator ---------- */
  const WORDS = ["SAVE", "DEAL", "SHOP", "MEGA", "VIP", "BONUS", "EXTRA", "TREAT", "GIFT", "JOY"];
  $("#genCode").addEventListener("click", () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    const n = Math.floor(Math.random() * 90 + 10);
    $("#fCode").value = w + n;
    clearError("fCode", "codeErr");
    updatePreview();
  });

  /* ---------- Type-dependent UI ---------- */
  function currentType() {
    const r = form.querySelector('input[name="type"]:checked');
    return r ? r.value : "percent";
  }

  function syncTypeUI() {
    const t = currentType();
    const valueField = $("#valueField");
    const valueInput = $("#fValue");
    const valueLabel = $("#valueLabel");
    const wrap = valueInput.closest(".prefixed");

    if (t === "shipping") {
      valueField.style.display = "none";
      valueInput.removeAttribute("required");
    } else {
      valueField.style.display = "";
      if (t === "percent") {
        valueLabel.textContent = "Percentage off";
        wrap.dataset.prefix = "%";
        valueInput.max = "100";
        if (Number(valueInput.value) > 100) valueInput.value = "100";
      } else {
        valueLabel.textContent = "Amount off";
        wrap.dataset.prefix = "$";
        valueInput.removeAttribute("max");
      }
    }
  }

  form.querySelectorAll('input[name="type"]').forEach((r) =>
    r.addEventListener("change", () => { syncTypeUI(); updatePreview(); })
  );

  ["#fCode", "#fValue"].forEach((sel) =>
    $(sel).addEventListener("input", updatePreview)
  );

  function updatePreview() {
    const code = ($("#fCode").value || "PROMO").toUpperCase();
    const t = currentType();
    const v = Number($("#fValue").value) || 0;
    let desc;
    if (t === "percent") desc = `${v}% off orders`;
    else if (t === "fixed") desc = `${money(v)} off orders`;
    else desc = "Free shipping on orders";
    $("#previewCode").textContent = code;
    $("#previewDesc").textContent = desc;
  }

  /* ---------- Validation ---------- */
  function setError(inputId, errId, msg) {
    const input = $("#" + inputId);
    const err = $("#" + errId);
    if (input) input.setAttribute("aria-invalid", "true");
    if (err) { err.textContent = msg; err.hidden = false; }
  }
  function clearError(inputId, errId) {
    const input = $("#" + inputId);
    const err = $("#" + errId);
    if (input) input.removeAttribute("aria-invalid");
    if (err) { err.textContent = ""; err.hidden = true; }
  }
  function clearErrors() {
    ["fCode:codeErr", "fValue:valueErr", "fEnd:endErr"].forEach((p) => {
      const [i, e] = p.split(":"); clearError(i, e);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    let ok = true;

    const id = $("#editId").value;
    const codeRaw = $("#fCode").value.trim().toUpperCase();
    const type = currentType();
    const value = Number($("#fValue").value);
    const min = Math.max(0, Number($("#fMin").value) || 0);
    const limit = Math.max(0, Number($("#fLimit").value) || 0);
    const start = $("#fStart").value;
    const end = $("#fEnd").value;

    // Code: required, alphanumeric, unique.
    if (!codeRaw) { setError("fCode", "codeErr", "Enter a code."); ok = false; }
    else if (!/^[A-Z0-9]+$/.test(codeRaw)) { setError("fCode", "codeErr", "Use letters and numbers only."); ok = false; }
    else if (codes.some((c) => c.code === codeRaw && c.id !== id)) { setError("fCode", "codeErr", "That code already exists."); ok = false; }

    // Value: required + ranged unless free shipping.
    if (type !== "shipping") {
      if (!Number.isFinite(value) || value <= 0) { setError("fValue", "valueErr", "Enter a value above 0."); ok = false; }
      else if (type === "percent" && value > 100) { setError("fValue", "valueErr", "Percentage can’t exceed 100."); ok = false; }
    }

    // Dates: end must be after start.
    if (start && end && new Date(end) < new Date(start)) {
      setError("fEnd", "endErr", "End date is before the start date."); ok = false;
    }

    if (!ok) return;

    const record = {
      code: codeRaw,
      type,
      value: type === "shipping" ? 0 : value,
      min,
      limit,
      start,
      end,
      paused: !$("#fActive").checked
    };

    if (id) {
      const c = codes.find((x) => x.id === id);
      Object.assign(c, record);
      render();
      toast(`Saved “${codeRaw}”`);
    } else {
      codes.unshift(Object.assign({ id: "c" + Date.now(), used: 0 }, record));
      // Show the new code regardless of current filter.
      activeFilter = "all"; query = ""; searchEl.value = "";
      $$(".tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      const allTab = $('.tab[data-filter="all"]');
      allTab.classList.add("is-active"); allTab.setAttribute("aria-selected", "true");
      render();
      toast(`Created “${codeRaw}”`);
    }

    closeDrawer();
  });

  /* ---------- Init ---------- */
  render();
})();
