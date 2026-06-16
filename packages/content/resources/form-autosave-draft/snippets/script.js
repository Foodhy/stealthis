(function () {
  "use strict";

  /* ---------------- Config & elements ---------------- */
  var STORAGE_KEY = "stealthis:autosave-draft:v1";
  var DEBOUNCE_MS = 900;

  var form = document.getElementById("editorForm");
  var titleEl = document.getElementById("title");
  var bodyEl = document.getElementById("body");
  var titleHelp = document.getElementById("titleHelp");
  var bodyHelp = document.getElementById("bodyHelp");
  var counterEl = document.getElementById("counter");
  var statusPill = document.getElementById("statusPill");
  var statusText = document.getElementById("statusText");
  var saveNowBtn = document.getElementById("saveNowBtn");
  var publishBtn = document.getElementById("publishBtn");
  var lastSavedHint = document.getElementById("lastSavedHint");

  var restoreBanner = document.getElementById("restoreBanner");
  var restoreBtn = document.getElementById("restoreBtn");
  var discardBtn = document.getElementById("discardBtn");
  var restoreAgo = document.getElementById("restoreAgo");

  var toastWrap = document.getElementById("toastWrap");

  var titleDefaultHelp = titleHelp.textContent;
  var bodyDefaultHelp = bodyHelp.textContent;

  /* ---------------- State ---------------- */
  var debounceTimer = null;
  var agoTimer = null;
  var lastSavedAt = null; // epoch ms of last successful save
  var pendingDraft = null; // draft found on load, awaiting restore decision

  /* Feature-detect localStorage so the demo degrades gracefully. */
  var storageOK = (function () {
    try {
      var k = "__as_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })();

  /* ---------------- Helpers ---------------- */
  function timeAgo(ms) {
    var diff = Math.max(0, Date.now() - ms);
    var s = Math.round(diff / 1000);
    if (s < 5) return "just now";
    if (s < 60) return s + "s ago";
    var m = Math.round(s / 60);
    if (m < 60) return m + (m === 1 ? " minute ago" : " minutes ago");
    var h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
    var d = Math.round(h / 24);
    return d + (d === 1 ? " day ago" : " days ago");
  }

  function countWords(text) {
    var trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function updateCounter() {
    var text = bodyEl.value;
    var words = countWords(text);
    var chars = text.length;
    counterEl.textContent =
      words +
      (words === 1 ? " word · " : " words · ") +
      chars +
      (chars === 1 ? " character" : " characters");
  }

  function setStatus(state, text) {
    statusPill.setAttribute("data-state", state);
    statusText.textContent = text;
  }

  function refreshSavedLabel() {
    if (lastSavedAt == null) return;
    var label = "Saved " + timeAgo(lastSavedAt);
    setStatus("saved", label);
    lastSavedHint.textContent =
      "Last saved " +
      timeAgo(lastSavedAt) +
      " · drafts stay on this device.";
  }

  function startAgoTicker() {
    if (agoTimer) window.clearInterval(agoTimer);
    agoTimer = window.setInterval(function () {
      if (statusPill.getAttribute("data-state") === "saved") {
        refreshSavedLabel();
      }
    }, 15000);
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, variant) {
    var el = document.createElement("div");
    el.className = "toast" + (variant ? " toast--" + variant : "");
    el.setAttribute("role", "status");

    var icon = document.createElement("span");
    icon.className = "toast__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      variant === "warn"
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

    var label = document.createElement("span");
    label.textContent = msg;

    el.appendChild(icon);
    el.appendChild(label);
    toastWrap.appendChild(el);

    window.setTimeout(function () {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }, 2600);
  }

  /* ---------------- Persistence ---------------- */
  function readDraft() {
    if (!storageOK) return null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && typeof data === "object") return data;
      return null;
    } catch (e) {
      return null;
    }
  }

  function writeDraft() {
    var payload = {
      title: titleEl.value,
      body: bodyEl.value,
      savedAt: Date.now(),
    };
    if (!storageOK) {
      setStatus("error", "Can't save — storage unavailable");
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      lastSavedAt = payload.savedAt;
      return true;
    } catch (e) {
      setStatus("error", "Couldn't save draft");
      toast("Couldn't save your draft.", "warn");
      return false;
    }
  }

  function clearDraft() {
    if (!storageOK) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function hasContent() {
    return titleEl.value.trim() !== "" || bodyEl.value.trim() !== "";
  }

  /* ---------------- Save flow ---------------- */
  function performSave(announce) {
    // Nothing meaningful to save yet — keep it quiet.
    if (!hasContent()) {
      setStatus("idle", "All changes saved");
      lastSavedHint.textContent = "Not saved yet.";
      clearDraft();
      return;
    }

    setStatus("saving", "Saving…");

    // Simulate a brief write so the "Saving…" state is perceptible,
    // mirroring how a real network/IO save would feel.
    window.setTimeout(function () {
      var ok = writeDraft();
      if (ok) {
        refreshSavedLabel();
        if (announce) toast("Draft saved.", "ok");
      }
    }, 350);
  }

  function scheduleSave() {
    setStatus("dirty", "Unsaved changes");
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      performSave(false);
    }, DEBOUNCE_MS);
  }

  function saveNow() {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    if (!hasContent()) {
      toast("Nothing to save yet — start writing.", "warn");
      return;
    }
    performSave(true);
  }

  /* ---------------- Validation ---------------- */
  function setError(input, helpEl, defaultHelp, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.classList.remove("is-valid");
      helpEl.textContent = message;
      helpEl.classList.add("is-error");
      helpEl.setAttribute("role", "alert");
    } else {
      input.removeAttribute("aria-invalid");
      helpEl.textContent = defaultHelp;
      helpEl.classList.remove("is-error");
      helpEl.removeAttribute("role");
    }
  }

  function validate(focusFirst) {
    var firstInvalid = null;
    var titleVal = titleEl.value.trim();
    var bodyVal = bodyEl.value.trim();

    if (!titleVal) {
      setError(titleEl, titleHelp, titleDefaultHelp, "Add a title before publishing.");
      firstInvalid = firstInvalid || titleEl;
    } else {
      setError(titleEl, titleHelp, titleDefaultHelp, null);
      titleEl.classList.add("is-valid");
    }

    if (bodyVal.length < 10) {
      setError(
        bodyEl,
        bodyHelp,
        bodyDefaultHelp,
        "Write at least 10 characters before publishing."
      );
      firstInvalid = firstInvalid || bodyEl;
    } else {
      setError(bodyEl, bodyHelp, bodyDefaultHelp, null);
      bodyEl.classList.add("is-valid");
    }

    if (firstInvalid && focusFirst) firstInvalid.focus();
    return !firstInvalid;
  }

  /* ---------------- Restore banner ---------------- */
  function showRestore(draft) {
    pendingDraft = draft;
    restoreAgo.textContent = draft.savedAt ? timeAgo(draft.savedAt) : "earlier";
    restoreBanner.hidden = false;
    // Move focus into the dialog for keyboard users.
    restoreBtn.focus();
  }

  function hideRestore() {
    restoreBanner.hidden = true;
    pendingDraft = null;
  }

  function doRestore() {
    if (!pendingDraft) return;
    titleEl.value = pendingDraft.title || "";
    bodyEl.value = pendingDraft.body || "";
    lastSavedAt = pendingDraft.savedAt || Date.now();
    updateCounter();
    refreshSavedLabel();
    hideRestore();
    toast("Draft restored.", "ok");
    titleEl.focus();
  }

  function doDiscard() {
    clearDraft();
    lastSavedAt = null;
    hideRestore();
    setStatus("idle", "All changes saved");
    lastSavedHint.textContent = "Not saved yet.";
    toast("Draft discarded.", "warn");
    titleEl.focus();
  }

  /* ---------------- Publish ---------------- */
  function handlePublish(e) {
    e.preventDefault();
    if (!validate(true)) {
      toast("Fix the highlighted fields first.", "warn");
      return;
    }
    if (debounceTimer) window.clearTimeout(debounceTimer);

    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing…";

    window.setTimeout(function () {
      clearDraft();
      lastSavedAt = null;
      titleEl.value = "";
      bodyEl.value = "";
      titleEl.classList.remove("is-valid");
      bodyEl.classList.remove("is-valid");
      setError(titleEl, titleHelp, titleDefaultHelp, null);
      setError(bodyEl, bodyHelp, bodyDefaultHelp, null);
      updateCounter();
      setStatus("idle", "All changes saved");
      lastSavedHint.textContent = "Published. Draft cleared from this device.";
      publishBtn.disabled = false;
      publishBtn.textContent = "Publish note";
      toast("Note published — draft cleared.", "ok");
      titleEl.focus();
    }, 650);
  }

  /* ---------------- Wire up ---------------- */
  function onInput() {
    updateCounter();
    scheduleSave();
  }

  titleEl.addEventListener("input", onInput);
  bodyEl.addEventListener("input", onInput);

  saveNowBtn.addEventListener("click", saveNow);
  form.addEventListener("submit", handlePublish);

  restoreBtn.addEventListener("click", doRestore);
  discardBtn.addEventListener("click", doDiscard);

  // Esc inside the restore dialog keeps the draft but dismisses the prompt.
  restoreBanner.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      hideRestore();
      titleEl.focus();
    }
  });

  // Flush a pending debounced save before the page unloads.
  window.addEventListener("beforeunload", function () {
    if (debounceTimer && hasContent()) {
      window.clearTimeout(debounceTimer);
      writeDraft();
    }
  });

  /* ---------------- Boot ---------------- */
  function init() {
    updateCounter();
    startAgoTicker();

    var existing = readDraft();
    if (existing && (existing.title || existing.body)) {
      showRestore(existing);
    } else {
      setStatus("idle", "All changes saved");
    }
  }

  init();
})();
