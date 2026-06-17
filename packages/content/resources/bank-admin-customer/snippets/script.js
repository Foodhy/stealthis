(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, variant) {
    var el = document.createElement("div");
    el.className = "toast" + (variant ? " " + variant : "");
    el.setAttribute("role", "status");
    var dot = document.createElement("span");
    dot.className = "toast-dot";
    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(dot);
    el.appendChild(text);
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 3200);
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      }
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---------- Risk ring fill ---------- */
  var ring = document.getElementById("riskRing");
  var scoreEl = document.getElementById("riskScore");
  if (ring && scoreEl) {
    var score = parseInt(scoreEl.textContent, 10) || 0;
    var circ = 2 * Math.PI * 52; // 326.7
    requestAnimationFrame(function () {
      ring.style.strokeDashoffset = String(circ * (1 - score / 100));
    });
  }

  /* ---------- Action toolbar ---------- */
  var statePill = document.getElementById("acctStatePill");
  var riskWidget = document.getElementById("riskWidget");
  var riskTag = document.getElementById("riskTag");

  function handleAction(btn) {
    var action = btn.getAttribute("data-action");

    if (action === "message") {
      // jump to notes tab as a quick compose surface
      var notesTab = document.getElementById("tab-notes");
      if (notesTab) { selectTab(notesTab); notesTab.focus(); }
      toast("Compose a message to Amara Okonkwo");
      return;
    }

    if (action === "kyc") {
      toast("KYC re-run queued — results in ~2 min");
      return;
    }

    if (action === "flag") {
      var flagged = btn.getAttribute("aria-pressed") === "true";
      var now = !flagged;
      btn.setAttribute("aria-pressed", now ? "true" : "false");
      btn.querySelector("span:last-child") || null;
      btn.lastChild.textContent = now ? " Flagged" : " Flag review";
      if (now) {
        bumpRisk(true);
        toast("Customer flagged for manual review", "warn");
      } else {
        bumpRisk(false);
        toast("Review flag cleared");
      }
      return;
    }

    if (action === "freeze") {
      var frozen = btn.getAttribute("aria-pressed") === "true";
      var nowF = !frozen;
      btn.setAttribute("aria-pressed", nowF ? "true" : "false");
      btn.lastChild.textContent = nowF ? " Unfreeze account" : " Freeze account";
      if (statePill) {
        statePill.setAttribute("data-state", nowF ? "frozen" : "active");
        statePill.textContent = nowF ? "Frozen" : "Active";
      }
      // reflect on account cards
      document.querySelectorAll(".account:not(.is-closed) .status-pill").forEach(function (p) {
        p.setAttribute("data-state", nowF ? "frozen" : "active");
        p.textContent = nowF ? "Frozen" : "Active";
      });
      toast(nowF ? "All accounts frozen — outbound payments blocked" : "Accounts unfrozen", nowF ? "danger" : null);
      return;
    }
  }

  // risk escalation when flagged
  var baseScore = 24;
  function bumpRisk(up) {
    if (!ring || !scoreEl || !riskWidget) return;
    var s = up ? 61 : baseScore;
    scoreEl.textContent = String(s);
    var c = 2 * Math.PI * 52;
    ring.style.strokeDashoffset = String(c * (1 - s / 100));
    var level = s >= 60 ? "high" : s >= 35 ? "medium" : "low";
    riskWidget.setAttribute("data-level", level);
    if (riskTag) {
      riskTag.textContent = level === "high" ? "Elevated risk" : level === "medium" ? "Watch" : "Low risk";
    }
  }

  document.querySelectorAll("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () { handleAction(btn); });
  });

  /* ---------- Activity filters ---------- */
  var filters = document.querySelectorAll(".filter");
  var txns = Array.prototype.slice.call(document.querySelectorAll("#txnList .txn"));
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      filters.forEach(function (x) { x.classList.remove("is-active"); });
      f.classList.add("is-active");
      var kind = f.getAttribute("data-filter");
      var shown = 0;
      txns.forEach(function (t) {
        var match = kind === "all" || t.getAttribute("data-kind") === kind;
        t.style.display = match ? "" : "none";
        if (match) shown++;
      });
      toast(shown + (shown === 1 ? " entry" : " entries") + " shown");
    });
  });

  /* ---------- Notes ---------- */
  var noteForm = document.getElementById("noteForm");
  var noteInput = document.getElementById("noteInput");
  var noteList = document.getElementById("noteList");
  var noteCount = document.getElementById("noteCount");

  if (noteForm) {
    noteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = noteInput.value.trim();
      if (!val) { toast("Note is empty", "warn"); noteInput.focus(); return; }

      var li = document.createElement("li");
      li.className = "note is-new";
      var head = document.createElement("div");
      head.className = "note-head";
      var who = document.createElement("strong");
      who.textContent = "L. Brandt";
      var when = document.createElement("time");
      when.textContent = "Just now";
      head.appendChild(who);
      head.appendChild(when);
      var p = document.createElement("p");
      p.textContent = val;
      li.appendChild(head);
      li.appendChild(p);
      noteList.insertBefore(li, noteList.firstChild);

      noteInput.value = "";
      if (noteCount) noteCount.textContent = String(noteList.querySelectorAll(".note").length);
      toast("Note added to customer record");
    });
  }

  /* ---------- Search (decorative) ---------- */
  var searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      toast("Search is disabled in this sandbox demo");
    });
  }
})();
