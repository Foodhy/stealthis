(function () {
  "use strict";

  var form = document.getElementById("settingsForm");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".navlink"));
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.dataset.target); })
    .filter(Boolean);
  var saveBar = document.getElementById("saveBar");
  var savePill = document.getElementById("savePill");
  var saveBtn = document.getElementById("saveBtn");
  var resetBtn = document.getElementById("resetBtn");
  var dirtyCount = document.getElementById("dirtyCount");
  var errSummary = document.getElementById("errSummary");
  var errSummaryList = document.getElementById("errSummaryList");
  var toastHost = document.getElementById("toasts");

  /* ---------- Toast helper ---------- */
  var ICONS = {
    success: '<path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    error: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.4" r="1.1" fill="currentColor"/>',
    info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor"/>'
  };

  function toast(msg, tone) {
    tone = tone || "success";
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("data-tone", tone);
    el.setAttribute("role", tone === "error" ? "alert" : "status");
    el.innerHTML =
      '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' +
      (ICONS[tone] || ICONS.info) +
      "</svg><span>" + msg + "</span>";
    toastHost.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () { el.remove(); }, 360);
    }, 3200);
  }

  /* ---------- Dirty tracking ---------- */
  var initial = {};
  var fields = Array.prototype.slice.call(
    form.querySelectorAll("input, textarea, select")
  );

  function valueOf(el) {
    if (el.type === "checkbox") return el.checked ? "1" : "0";
    if (el.type === "radio") return el.checked ? el.value : "";
    return el.value;
  }

  function snapshot() {
    initial = {};
    fields.forEach(function (el) {
      var key = el.type === "radio" ? el.name + ":" + el.value : (el.id || el.name);
      initial[key] = valueOf(el);
    });
  }

  function isDirty() {
    return fields.some(function (el) {
      var key = el.type === "radio" ? el.name + ":" + el.value : (el.id || el.name);
      return initial[key] !== valueOf(el);
    });
  }

  function refreshDirty() {
    var dirty = isDirty();
    saveBar.setAttribute("data-open", dirty ? "true" : "false");
    savePill.setAttribute("data-state", dirty ? "dirty" : "saved");
    savePill.lastChild.textContent = dirty ? " Unsaved changes" : " All changes saved";
    if (dirty) {
      dirtyCount.textContent = "You have unsaved changes";
    }
    return dirty;
  }

  /* ---------- Validation ---------- */
  function fieldEl(input) {
    return input.closest(".field");
  }

  function setError(input, message) {
    var f = fieldEl(input);
    if (!f) return;
    f.classList.add("has-error");
    f.classList.remove("is-valid");
    input.setAttribute("aria-invalid", "true");
    var help = f.querySelector(".help");
    if (help) {
      if (help.dataset.base === undefined) help.dataset.base = help.textContent;
      help.textContent = message;
    }
  }

  function clearError(input, markValid) {
    var f = fieldEl(input);
    if (!f) return;
    f.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    var help = f.querySelector(".help");
    if (help && help.dataset.base !== undefined) {
      help.textContent = help.dataset.base;
    }
    if (markValid) f.classList.add("is-valid");
    else f.classList.remove("is-valid");
  }

  // returns null if valid, or an error message string
  function validateField(input) {
    var v = (input.value || "").trim();
    var id = input.id;

    if (id === "fullName") {
      if (!v) return "Full name is required.";
      if (v.length < 2) return "Please enter your full name.";
    }
    if (id === "displayHandle") {
      if (!v) return "A handle is required.";
      if (!/^[a-z0-9.]{3,20}$/i.test(v)) return "3–20 chars: letters, numbers, dots only.";
    }
    if (id === "email") {
      if (!v) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    }
    if (id === "phone") {
      if (v && !/^[+()\d\s-]{7,20}$/.test(v)) return "Enter a valid phone number.";
    }
    if (id === "cardName") {
      if (!v) return "Name on card is required.";
    }
    if (id === "cardNumber") {
      var digits = v.replace(/\s/g, "");
      if (!digits) return "Card number is required.";
      if (!/^\d{16}$/.test(digits)) return "Card number must be 16 digits.";
    }
    if (id === "cardZip") {
      if (!v) return "Billing ZIP is required.";
      if (!/^\d{5}$/.test(v)) return "Enter a 5-digit ZIP code.";
    }
    if (id === "newPassword") {
      if (v && (v.length < 8 || !/\d/.test(v) || !/[a-zA-Z]/.test(v))) {
        return "Min 8 chars with a letter and a number.";
      }
    }
    if (id === "confirmPassword") {
      var pw = (document.getElementById("newPassword").value || "");
      if (pw && v !== pw) return "Passwords do not match.";
      if (!pw && v) return "Enter the new password above first.";
    }
    return null;
  }

  // Section id -> friendly name, for the error summary
  function sectionOf(input) {
    var sec = input.closest(".section");
    return sec ? sec.id : null;
  }

  function validateAll() {
    var errors = [];
    fields.forEach(function (el) {
      if (el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT") return;
      var msg = validateField(el);
      if (msg) {
        setError(el, msg);
        errors.push({ input: el, msg: msg, section: sectionOf(el) });
      } else if (el.value.trim() || el.hasAttribute("required")) {
        clearError(el, el.value.trim().length > 0);
      } else {
        clearError(el, false);
      }
    });
    return errors;
  }

  function showErrorSummary(errors) {
    errSummaryList.innerHTML = "";
    errors.forEach(function (e) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + e.input.id;
      a.textContent =
        (e.input.previousElementSibling && e.input.previousElementSibling.tagName === "LABEL"
          ? e.input.previousElementSibling.childNodes[0].textContent.trim()
          : e.input.name) +
        " — " + e.msg;
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        focusField(e.input);
      });
      li.appendChild(a);
      errSummaryList.appendChild(li);
    });
    errSummary.hidden = false;
    errSummary.focus();
  }

  function focusField(input) {
    var sec = input.closest(".section");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { input.focus({ preventScroll: true }); }, 220);
  }

  /* ---------- Live field handlers ---------- */
  fields.forEach(function (el) {
    var ev = el.tagName === "SELECT" || el.type === "checkbox" || el.type === "radio"
      ? "change" : "input";
    el.addEventListener(ev, function () {
      refreshDirty();
    });
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.addEventListener("blur", function () {
        if (el.type === "checkbox" || el.type === "radio") return;
        var msg = validateField(el);
        if (msg) setError(el, msg);
        else clearError(el, el.value.trim().length > 0 && el.hasAttribute("required"));
      });
    }
  });

  /* ---------- Card number auto-format ---------- */
  var cardNumber = document.getElementById("cardNumber");
  cardNumber.addEventListener("input", function () {
    var digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  /* ---------- Bio counter ---------- */
  var bio = document.getElementById("bio");
  var bioCount = document.getElementById("bioCount");
  function updateBio() { bioCount.textContent = String(bio.value.length); }
  bio.addEventListener("input", updateBio);
  updateBio();

  /* ---------- Password strength ---------- */
  var pw = document.getElementById("newPassword");
  var meterWrap = document.getElementById("pwMeterWrap");
  var meterFill = document.getElementById("pwMeterFill");
  var meterLabel = document.getElementById("pwStrength");
  pw.addEventListener("input", function () {
    var v = pw.value;
    if (!v) { meterWrap.hidden = true; return; }
    meterWrap.hidden = false;
    var score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    var pct = Math.min(100, (score / 5) * 100);
    var tone, label;
    if (score <= 1) { tone = "var(--danger)"; label = "Weak"; }
    else if (score <= 3) { tone = "var(--warn)"; label = "Fair"; }
    else { tone = "var(--ok)"; label = "Strong"; }
    meterFill.style.width = pct + "%";
    meterFill.style.background = tone;
    meterLabel.textContent = label;
  });

  /* ---------- Scroll spy ---------- */
  function setActive(id) {
    navLinks.forEach(function (l) {
      var on = l.dataset.target === id;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
  }

  var spy = null;
  if ("IntersectionObserver" in window) {
    var visible = {};
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      var best = null, bestRatio = 0;
      sections.forEach(function (s) {
        var r = visible[s.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = s.id; }
      });
      if (best) setActive(best);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // Clicking a nav link: smooth scroll + immediate highlight + focus target
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (ev) {
      ev.preventDefault();
      var id = link.dataset.target;
      var target = document.getElementById(id);
      if (!target) return;
      setActive(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { target.focus({ preventScroll: true }); }, 240);
    });
  });

  /* ---------- Misc buttons ---------- */
  document.getElementById("changePlanBtn").addEventListener("click", function () {
    toast("Plan management opens in billing portal.", "info");
  });
  document.getElementById("signOutAllBtn").addEventListener("click", function () {
    toast("Signed out of all other sessions.", "info");
  });

  /* ---------- Discard ---------- */
  resetBtn.addEventListener("click", function () {
    fields.forEach(function (el) {
      var key = el.type === "radio" ? el.name + ":" + el.value : (el.id || el.name);
      var prev = initial[key];
      if (el.type === "checkbox") el.checked = prev === "1";
      else if (el.type === "radio") { if (prev) el.checked = true; }
      else el.value = prev;
      clearError(el, false);
    });
    errSummary.hidden = true;
    meterWrap.hidden = true;
    updateBio();
    refreshDirty();
    toast("Changes discarded.", "info");
  });

  /* ---------- Submit / Save ---------- */
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var errors = validateAll();
    if (errors.length) {
      showErrorSummary(errors);
      focusField(errors[0].input);
      toast(errors.length + " field" + (errors.length > 1 ? "s" : "") + " need attention.", "error");
      return;
    }
    errSummary.hidden = true;

    // Simulated async save
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    savePill.setAttribute("data-state", "saving");
    savePill.lastChild.textContent = " Saving…";

    setTimeout(function () {
      snapshot();
      saveBtn.disabled = false;
      saveBtn.textContent = "Save changes";
      saveBar.setAttribute("data-open", "false");
      savePill.setAttribute("data-state", "saved");
      savePill.lastChild.textContent = " All changes saved";
      // clear transient password/meter
      pw.value = "";
      document.getElementById("confirmPassword").value = "";
      meterWrap.hidden = true;
      fields.forEach(function (el) { clearError(el, false); });
      toast("Settings saved successfully.", "success");
    }, 900);
  });

  /* ---------- Warn on unload if dirty ---------- */
  window.addEventListener("beforeunload", function (e) {
    if (isDirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* ---------- Init ---------- */
  snapshot();
  refreshDirty();
})();
