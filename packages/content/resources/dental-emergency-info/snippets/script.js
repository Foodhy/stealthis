(function () {
  "use strict";

  /* ---------- data ---------- */
  // openMin / closeMin in minutes from midnight; null = closed
  var SCHEDULE = [
    { day: "Sun", open: 9 * 60, close: 15 * 60 },      // 0
    { day: "Mon", open: 8 * 60, close: 20 * 60 },      // 1
    { day: "Tue", open: 8 * 60, close: 20 * 60 },      // 2
    { day: "Wed", open: 8 * 60, close: 20 * 60 },      // 3
    { day: "Thu", open: 8 * 60, close: 20 * 60 },      // 4
    { day: "Fri", open: 8 * 60, close: 18 * 60 },      // 5
    { day: "Sat", open: 10 * 60, close: 16 * 60 }      // 6
  ];

  var TIPS = [
    {
      emoji: "🦷",
      label: "Knocked-out tooth",
      lead: "Fast action in the first 30 minutes greatly improves the chance of saving it.",
      steps: [
        "Pick the tooth up by the <b>crown</b> — never touch the root.",
        "Gently rinse with milk or saline; do <b>not</b> scrub or dry it.",
        "Try to reinsert it into the socket and bite on gauze to hold it.",
        "If it won't go back, keep it in <b>milk</b> and call us immediately."
      ]
    },
    {
      emoji: "😣",
      label: "Severe swelling or abscess",
      lead: "Swelling with fever can signal a spreading infection that needs urgent care.",
      steps: [
        "Rinse with warm salt water (½ tsp salt in a cup of water).",
        "Apply a <b>cold compress</b> to the outside of the cheek, 15 min on/off.",
        "Do not place aspirin directly on the gum — it burns tissue.",
        "Call the emergency line; seek the ER if breathing is affected."
      ]
    },
    {
      emoji: "🩸",
      label: "Bleeding that won't stop",
      lead: "Most oral bleeding slows with steady, direct pressure.",
      steps: [
        "Fold clean gauze and bite down firmly for <b>15 minutes</b> without peeking.",
        "Keep your head elevated and stay calm.",
        "Avoid rinsing, spitting or hot drinks for a few hours.",
        "If bleeding continues past 30 minutes, call us right away."
      ]
    },
    {
      emoji: "🔧",
      label: "Lost filling or crown",
      lead: "Usually uncomfortable rather than dangerous — protect the tooth until you're seen.",
      steps: [
        "Save the crown if you have it and keep it clean.",
        "Cover the gap with dental wax or sugar-free gum to shield it.",
        "Avoid chewing on that side and skip very hot or cold foods.",
        "Book a same-day walk-in to have it re-cemented."
      ]
    }
  ];

  var DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ---------- helpers ---------- */
  function fmt(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    var ap = h >= 12 ? "pm" : "am";
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return hh + (m ? ":" + String(m).padStart(2, "0") : "") + ap;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Copied: " + text); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied: " + text); }
    catch (e) { toast("Press Ctrl/Cmd+C to copy"); }
    document.body.removeChild(ta);
  }

  /* ---------- open-now status ---------- */
  function renderStatus() {
    var now = new Date();
    var dow = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = SCHEDULE[dow];
    var pill = document.getElementById("statusPill");
    var label = document.getElementById("statusLabel");
    var sub = document.getElementById("statusSub");
    var todayHours = document.getElementById("todayHours");

    var isOpen = today && today.open != null && mins >= today.open && mins < today.close;

    pill.classList.remove("is-open", "is-closed");
    if (isOpen) {
      pill.classList.add("is-open");
      label.textContent = "Open now";
      sub.textContent = "Walk-ins accepted until " + fmt(today.close);
    } else {
      pill.classList.add("is-closed");
      label.textContent = "Closed now";
      // find next opening
      var nxt = nextOpen(dow, mins);
      sub.textContent = nxt
        ? "Call the 24/7 line · opens " + nxt
        : "Call the 24/7 emergency line";
    }
    todayHours.textContent = today && today.open != null
      ? fmt(today.open) + " – " + fmt(today.close)
      : "Closed";
  }

  function nextOpen(dow, mins) {
    for (var i = 0; i < 7; i++) {
      var d = (dow + i) % 7;
      var s = SCHEDULE[d];
      if (s.open == null) continue;
      if (i === 0 && mins < s.open) return "today " + fmt(s.open);
      if (i === 1) return "tomorrow " + fmt(s.open);
      if (i > 1) return DAY_LABELS[d] + " " + fmt(s.open);
    }
    return null;
  }

  /* ---------- weekly hours grid ---------- */
  function renderHours() {
    var grid = document.getElementById("hoursGrid");
    var todayIdx = new Date().getDay();
    var frag = document.createDocumentFragment();
    SCHEDULE.forEach(function (s, i) {
      var cell = document.createElement("div");
      cell.className = "hcell";
      if (i === todayIdx) cell.classList.add("is-today");
      if (s.open == null) cell.classList.add("is-closed");
      var val = s.open == null ? "Closed" : fmt(s.open).replace("am", "").replace("pm", "") + "–" + fmt(s.close);
      cell.innerHTML =
        '<div class="hcell__day">' + s.day + "</div>" +
        '<div class="hcell__val">' + val + "</div>";
      frag.appendChild(cell);
    });
    grid.appendChild(frag);
  }

  /* ---------- accordion ---------- */
  function renderAccordion() {
    var acc = document.getElementById("accordion");
    TIPS.forEach(function (tip, i) {
      var item = document.createElement("div");
      item.className = "acc";
      var panelId = "acc-panel-" + i;
      var btnId = "acc-btn-" + i;

      var ol = tip.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("");

      item.innerHTML =
        '<button class="acc__btn" type="button" id="' + btnId + '" aria-expanded="false" aria-controls="' + panelId + '">' +
          '<span class="acc__emoji" aria-hidden="true">' + tip.emoji + "</span>" +
          '<span class="acc__label">' + tip.label + "</span>" +
          '<svg class="acc__chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        "</button>" +
        '<div class="acc__panel" id="' + panelId + '" role="region" aria-labelledby="' + btnId + '">' +
          '<div class="acc__inner">' +
            '<p class="acc__lead">' + tip.lead + "</p>" +
            "<ol>" + ol + "</ol>" +
          "</div>" +
        "</div>";
      acc.appendChild(item);
    });

    acc.addEventListener("click", function (e) {
      var btn = e.target.closest(".acc__btn");
      if (!btn) return;
      var item = btn.closest(".acc");
      var panel = item.querySelector(".acc__panel");
      var isOpen = item.classList.contains("is-open");

      // close all
      acc.querySelectorAll(".acc").forEach(function (el) {
        el.classList.remove("is-open");
        el.querySelector(".acc__btn").setAttribute("aria-expanded", "false");
        el.querySelector(".acc__panel").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  /* ---------- copy wiring ---------- */
  function wireCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (el) {
      // buttons/ghost/copy trigger copy; the tel link should still dial,
      // so only intercept non-anchor elements plus ghost/copy buttons.
      var isDial = el.tagName === "A" && el.getAttribute("href") &&
        el.getAttribute("href").indexOf("tel:") === 0;
      var isMapLink = el.tagName === "A" && el.getAttribute("target") === "_blank";
      if (isDial || isMapLink) return;
      el.addEventListener("click", function (e) {
        e.preventDefault();
        copy(el.getAttribute("data-copy"));
      });
    });
  }

  /* ---------- init ---------- */
  renderStatus();
  renderHours();
  renderAccordion();
  wireCopy();
  // keep the open/closed pill fresh
  setInterval(renderStatus, 60 * 1000);
})();
