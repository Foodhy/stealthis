(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    var ico = kind === "danger" ? "✕" : kind === "success" ? "✓" : "›";
    el.innerHTML = '<span class="t-ico">' + ico + "</span><span></span>";
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var ink = document.querySelector(".tab-ink");

  function positionInk(tab) {
    if (!tab) return;
    ink.style.width = tab.offsetWidth + "px";
    ink.style.transform = "translateX(" + tab.offsetLeft + "px)";
  }

  function activateTab(tab, focusPanel) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".tabpanel").forEach(function (p) {
      var on = p.id === "tp-" + tab.dataset.tab;
      p.classList.toggle("is-active", on);
      if (on) { p.hidden = false; } else { p.hidden = true; }
    });
    positionInk(tab);
    if (focusPanel) {
      var panel = document.getElementById("tp-" + tab.dataset.tab);
      if (panel) panel.focus();
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      activateTab(next);
    });
  });

  // Initial ink position (after layout)
  requestAnimationFrame(function () {
    positionInk(document.querySelector(".tab.is-active"));
  });
  window.addEventListener("resize", function () {
    positionInk(document.querySelector(".tab.is-active"));
  });

  /* ---------- Sliders (live value labels + fill) ---------- */
  var sliderMap = {
    resScale: "resScaleVal", gamma: "gammaVal", master: "masterVal",
    music: "musicVal", sfx: "sfxVal", voice: "voiceVal", sens: "sensVal"
  };

  function fmt(slider) {
    var v = parseFloat(slider.value);
    var suffix = slider.dataset.suffix || "";
    if (suffix) return Math.round(v) + suffix;
    return v.toFixed(1);
  }

  function paintSlider(slider) {
    var min = parseFloat(slider.min), max = parseFloat(slider.max);
    var pct = ((parseFloat(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty("--fill", pct + "%");
    var out = document.getElementById(sliderMap[slider.id]);
    if (out) out.textContent = fmt(slider);
  }

  Object.keys(sliderMap).forEach(function (id) {
    var s = document.getElementById(id);
    if (!s) return;
    paintSlider(s);
    s.addEventListener("input", function () { paintSlider(s); });
  });

  /* ---------- Toggles ---------- */
  document.querySelectorAll(".toggle").forEach(function (tg) {
    tg.addEventListener("click", function () {
      var on = !tg.classList.contains("is-on");
      tg.classList.toggle("is-on", on);
      tg.setAttribute("aria-checked", on ? "true" : "false");
    });
  });

  /* ---------- Key rebinding ---------- */
  var listening = null; // currently capturing keycap button

  function labelForKey(e) {
    if (e.code === "Space") return "Space";
    if (e.key === " ") return "Space";
    if (e.code && e.code.indexOf("Arrow") === 0) return e.key.replace("Arrow", "") + " Arrow";
    if (e.key.length === 1) return e.key.toUpperCase();
    // Normalize modifier names
    if (e.key === "Control") return "Ctrl";
    return e.key;
  }

  function stopListening(restore) {
    if (!listening) return;
    listening.cap.classList.remove("is-listening");
    if (restore) listening.cap.textContent = listening.prev;
    listening = null;
  }

  document.querySelectorAll("[data-rebind]").forEach(function (cap) {
    cap.addEventListener("click", function () {
      // If another is listening, cancel it first
      stopListening(true);
      listening = { cap: cap, prev: cap.textContent };
      cap.classList.add("is-listening");
      cap.textContent = "Press a key…";
    });
  });

  function captureRebind(e) {
    if (!listening) return false;
    // Esc cancels the rebind without resuming the game
    if (e.key === "Escape") {
      stopListening(true);
      toast("Rebind cancelled", "danger");
      return true;
    }
    // Ignore lone modifier presses except as final bind
    var label = labelForKey(e);
    var row = listening.cap.closest(".rebind");

    // Detect conflicts with other bindings
    var conflict = null;
    document.querySelectorAll(".rebind").forEach(function (r) {
      if (r !== row && r.dataset.key === label) conflict = r;
    });
    if (conflict) {
      // swap: give the conflicting binding the old key
      conflict.dataset.key = listening.prev;
      conflict.querySelector(".keycap").textContent = listening.prev;
    }

    row.dataset.key = label;
    listening.cap.textContent = label;
    listening.cap.classList.remove("is-listening");
    var name = row.dataset.binding;
    listening = null;
    toast(name + " bound to " + label + (conflict ? " (swapped)" : ""), "success");
    return true;
  }

  /* ---------- Primary actions ---------- */
  var overlay = document.getElementById("overlay");
  var statusText = document.getElementById("statusText");

  function resume() {
    overlay.classList.add("is-hidden");
    toast("Resuming — good luck, Vanguard", "success");
    statusText.textContent = "Running";
    setTimeout(function () {
      overlay.classList.remove("is-hidden");
      statusText.textContent = "Game Suspended";
    }, 1600); // demo: re-show the overlay so it stays explorable
  }

  document.querySelectorAll(".act").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.dataset.action;
      switch (action) {
        case "resume":
          resume();
          break;
        case "settings":
          document.getElementById("tab-graphics").focus();
          toast("Settings open");
          break;
        case "restart":
          toast("Restarting at Checkpoint 04 — The Ash Gate");
          break;
        case "quit":
          toast("Quitting to main menu… progress saved", "danger");
          break;
      }
    });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    var defaults = { resScale: 100, gamma: 1, master: 80, music: 55, sfx: 90, voice: 75, sens: 5 };
    Object.keys(defaults).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) { s.value = defaults[id]; paintSlider(s); }
    });
    document.querySelectorAll(".toggle").forEach(function (tg) {
      var on = tg.id === "vsync" || tg.id === "subtitles";
      tg.classList.toggle("is-on", on);
      tg.setAttribute("aria-checked", on ? "true" : "false");
    });
    toast("Settings reset to defaults", "danger");
  });

  document.getElementById("applyBtn").addEventListener("click", function () {
    toast("Changes applied", "success");
  });

  /* ---------- Global keyboard: Esc resumes (unless rebinding) ---------- */
  document.addEventListener("keydown", function (e) {
    // During a rebind, swallow the key as the new binding (incl. Esc to cancel)
    if (listening) {
      e.preventDefault();
      captureRebind(e);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      resume();
    }
  });

  // Clicking outside the rebind area cancels listening
  document.addEventListener("click", function (e) {
    if (listening && !e.target.closest("[data-rebind]")) {
      stopListening(true);
    }
  });

  // Stamp the save slot with a plausible-looking time
  var stamp = document.getElementById("saveStamp");
  if (stamp) {
    var t = new Date();
    var hh = String(t.getHours()).padStart(2, "0");
    var mm = String(t.getMinutes()).padStart(2, "0");
    stamp.textContent = "Slot 3 · Hollow Reign · " + hh + ":" + mm;
  }
})();
