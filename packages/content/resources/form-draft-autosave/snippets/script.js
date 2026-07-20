/* Form Draft Autosave
 * Debounced serialization of a whole form into localStorage, with a
 * "restore vs discard" prompt on load, relative-time stamp, cross-tab sync
 * and a flush on pagehide so nothing is lost when the tab dies.
 */
(() => {
  const KEY = "stealthis:form-draft-autosave";
  const DEBOUNCE = 700;

  const form = document.getElementById("form");
  const statusEl = document.getElementById("status");
  const savedAt = document.getElementById("saved-at");
  const restore = document.getElementById("restore");
  const restoreAge = document.getElementById("restore-age");
  const toast = document.getElementById("toast");

  let timer = null;
  let lastSaved = null;
  let dirty = false;

  /* ---------- storage helpers ---------- */

  const readStore = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.values ? parsed : null;
    } catch {
      return null;
    }
  };

  const serialize = () => {
    const values = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      values[el.name] = el.type === "checkbox" ? el.checked : el.value;
    }
    return values;
  };

  const apply = (values) => {
    for (const el of form.elements) {
      if (!el.name || !(el.name in values)) continue;
      if (el.type === "checkbox") el.checked = Boolean(values[el.name]);
      else el.value = values[el.name];
    }
  };

  const isEmpty = (values) =>
    Object.entries(values).every(([, v]) =>
      typeof v === "boolean" ? v === false : String(v).trim() === "",
    );

  /* ---------- relative time ---------- */

  const relative = (ts) => {
    const secs = Math.round((Date.now() - ts) / 1000);
    if (secs < 5) return "just now";
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const setStatus = (state, label) => {
    statusEl.dataset.state = state;
    statusEl.textContent = label;
  };

  const renderStamp = () => {
    savedAt.textContent = lastSaved
      ? `Draft saved ${relative(lastSaved)}`
      : "No draft saved yet";
  };

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-on"), 2200);
  };

  /* ---------- save ---------- */

  const save = () => {
    const values = serialize();
    if (isEmpty(values)) {
      localStorage.removeItem(KEY);
      lastSaved = null;
      dirty = false;
      setStatus("idle", "Idle");
      renderStamp();
      return;
    }
    setStatus("saving", "Saving…");
    // Simulated async write boundary — swap for a fetch() to your API.
    setTimeout(() => {
      lastSaved = Date.now();
      try {
        localStorage.setItem(KEY, JSON.stringify({ values, savedAt: lastSaved }));
      } catch {
        setStatus("idle", "Storage full");
        return;
      }
      dirty = false;
      setStatus("saved", "Saved");
      renderStamp();
    }, 250);
  };

  const scheduleSave = () => {
    dirty = true;
    setStatus("typing", "Unsaved…");
    clearTimeout(timer);
    timer = setTimeout(save, DEBOUNCE);
  };

  /* ---------- wiring ---------- */

  form.addEventListener("input", scheduleSave);
  form.addEventListener("change", scheduleSave);

  // Flush immediately if the tab is being hidden or closed.
  const flush = () => {
    if (!dirty) return;
    clearTimeout(timer);
    const values = serialize();
    if (isEmpty(values)) return;
    localStorage.setItem(KEY, JSON.stringify({ values, savedAt: Date.now() }));
    dirty = false;
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });

  // Keep other tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || dirty) return;
    const store = readStore();
    if (!store) return;
    apply(store.values);
    lastSaved = store.savedAt;
    setStatus("saved", "Synced");
    renderStamp();
  });

  document.getElementById("clear").addEventListener("click", () => {
    clearTimeout(timer);
    localStorage.removeItem(KEY);
    form.reset();
    lastSaved = null;
    dirty = false;
    restore.hidden = true;
    setStatus("idle", "Idle");
    renderStamp();
    showToast("Draft cleared");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    localStorage.removeItem(KEY);
    form.reset();
    lastSaved = null;
    dirty = false;
    setStatus("idle", "Submitted");
    renderStamp();
    showToast("Ticket submitted — draft discarded");
  });

  /* ---------- restore prompt on load ---------- */

  const existing = readStore();
  if (existing && !isEmpty(existing.values)) {
    restoreAge.textContent = relative(existing.savedAt);
    restore.hidden = false;
    document.getElementById("restore-yes").addEventListener("click", () => {
      apply(existing.values);
      lastSaved = existing.savedAt;
      restore.hidden = true;
      setStatus("saved", "Restored");
      renderStamp();
      showToast("Draft restored");
      form.elements.subject.focus();
    });
    document.getElementById("restore-no").addEventListener("click", () => {
      localStorage.removeItem(KEY);
      restore.hidden = true;
      lastSaved = null;
      renderStamp();
      showToast("Draft discarded");
    });
  }

  renderStamp();
  // Keep the relative timestamp honest without re-saving.
  setInterval(renderStamp, 15000);
})();
