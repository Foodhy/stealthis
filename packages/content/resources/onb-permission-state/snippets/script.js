(function () {
  "use strict";

  var ICONS = {
    lock:
      '<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" opacity="0.16"/><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/></svg>',
    upgrade:
      '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.3 5.6L20 9.1l-4.4 3.8L17 19l-5-3.3L7 19l1.4-6.1L4 9.1l5.7-.5L12 3z" fill="currentColor" opacity="0.18"/><path d="M12 3l2.3 5.6L20 9.1l-4.4 3.8L17 19l-5-3.3L7 19l1.4-6.1L4 9.1l5.7-.5L12 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    pending:
      '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var VARIANTS = {
    "no-access": {
      tone: "no-access",
      icon: "lock",
      badge: "Restricted",
      title: "You don’t have access to this page",
      desc:
        "The <strong>Q3 Revenue Analytics</strong> dashboard is restricted to members of the Finance team. Request access and the workspace owner will be notified to review it.",
      primary: "Request access",
      primaryDisabled: false,
      hint: "Typical response time is under 2 hours during business days.",
      showApprover: true,
      action: "request"
    },
    upgrade: {
      tone: "upgrade",
      icon: "upgrade",
      badge: "Pro feature",
      title: "Upgrade to unlock this page",
      desc:
        "<strong>Revenue forecasting</strong> is part of the Northwind <strong>Business</strong> plan. Ask <strong>Devon Khoury</strong> to upgrade your workspace, or request it below.",
      primary: "Request upgrade",
      primaryDisabled: false,
      hint: "Billing is managed by the workspace owner.",
      showApprover: true,
      action: "request"
    },
    pending: {
      tone: "pending",
      icon: "pending",
      badge: "Awaiting review",
      title: "Your access request is pending",
      desc:
        "You requested access to <strong>Q3 Revenue Analytics</strong> on Jun 9. <strong>Devon Khoury</strong> hasn’t responded yet — we’ll email you the moment they do.",
      primary: "Request sent",
      primaryDisabled: true,
      hint: "Requested 12 minutes ago · You can switch accounts meanwhile.",
      showApprover: true,
      action: "request"
    }
  };

  var stateEl = document.getElementById("state");
  var illu = document.getElementById("illu");
  var badge = document.getElementById("badge");
  var titleEl = document.getElementById("state-title");
  var descEl = document.getElementById("state-desc");
  var approver = document.getElementById("approver");
  var primaryBtn = document.getElementById("primaryBtn");
  var switchBtn = document.getElementById("switchBtn");
  var hint = document.getElementById("hint");
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg"));

  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var cancelBtn = document.getElementById("cancelBtn");
  var confirmBtn = document.getElementById("confirmBtn");

  var acctOverlay = document.getElementById("acctOverlay");
  var acctModal = document.getElementById("acctModal");
  var acctCancel = document.getElementById("acctCancel");
  var acctRows = Array.prototype.slice.call(document.querySelectorAll(".acct-row"));

  var toastWrap = document.getElementById("toastWrap");
  var current = "no-access";
  var lastFocused = null;

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML =
      '<span class="t-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span></span>';
    t.lastChild.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 240);
    }, 2600);
  }

  /* ---------- render variant ---------- */
  function render(key) {
    var v = VARIANTS[key];
    if (!v) return;
    current = key;

    illu.dataset.tone = v.tone;
    illu.innerHTML = ICONS[v.icon];
    badge.dataset.tone = v.tone;
    badge.textContent = v.badge;
    titleEl.textContent = v.title;
    descEl.innerHTML = v.desc;
    hint.textContent = v.hint;
    approver.style.display = v.showApprover ? "" : "none";

    primaryBtn.textContent = v.primary;
    primaryBtn.disabled = !!v.primaryDisabled;

    // re-trigger entrance animation
    stateEl.style.animation = "none";
    void stateEl.offsetWidth;
    stateEl.style.animation = "";

    segs.forEach(function (s) {
      var on = s.dataset.variant === key;
      s.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  segs.forEach(function (s, i) {
    s.addEventListener("click", function () {
      render(s.dataset.variant);
    });
    s.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var dir = e.key === "ArrowRight" ? 1 : -1;
        var next = (i + dir + segs.length) % segs.length;
        segs[next].focus();
        render(segs[next].dataset.variant);
      }
    });
  });

  /* ---------- overlay helpers ---------- */
  function openOverlay(ov, firstFocus) {
    lastFocused = document.activeElement;
    ov.hidden = false;
    (firstFocus || ov.querySelector("button")).focus();
  }
  function closeOverlay(ov) {
    ov.hidden = true;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function trapTab(e, container) {
    if (e.key !== "Tab") return;
    var f = container.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- request access flow ---------- */
  primaryBtn.addEventListener("click", function () {
    if (primaryBtn.disabled) return;
    if (current === "upgrade") {
      // tailor the modal copy lightly
      modal.querySelector("#dlg-title").textContent = "Request upgrade?";
      modal.querySelector("#dlg-desc").innerHTML =
        "We’ll ask <strong>Devon Khoury</strong> to upgrade the workspace to the <strong>Business</strong> plan so you can use revenue forecasting.";
      confirmBtn.textContent = "Send request";
    } else {
      modal.querySelector("#dlg-title").textContent = "Request access?";
      modal.querySelector("#dlg-desc").innerHTML =
        "We’ll send <strong>Devon Khoury</strong> a request to grant you access to <strong>Q3 Revenue Analytics</strong>. You’ll be notified when they respond.";
      confirmBtn.textContent = "Send request";
    }
    openOverlay(overlay, confirmBtn);
  });

  cancelBtn.addEventListener("click", function () {
    closeOverlay(overlay);
  });

  confirmBtn.addEventListener("click", function () {
    closeOverlay(overlay);
    toast("Request sent");
    // move into the pending state for a coherent flow
    setTimeout(function () {
      render("pending");
    }, 250);
  });

  overlay.addEventListener("mousedown", function (e) {
    if (e.target === overlay) closeOverlay(overlay);
  });
  overlay.addEventListener("keydown", function (e) {
    trapTab(e, modal);
  });

  /* ---------- switch account flow ---------- */
  switchBtn.addEventListener("click", function () {
    openOverlay(acctOverlay, acctOverlay.querySelector(".acct-row[aria-selected='true']") || acctOverlay.querySelector("button"));
  });
  acctCancel.addEventListener("click", function () {
    closeOverlay(acctOverlay);
  });
  acctOverlay.addEventListener("mousedown", function (e) {
    if (e.target === acctOverlay) closeOverlay(acctOverlay);
  });
  acctOverlay.addEventListener("keydown", function (e) {
    trapTab(e, acctModal);
  });

  acctRows.forEach(function (row) {
    row.addEventListener("click", function () {
      acctRows.forEach(function (r) {
        r.setAttribute("aria-selected", "false");
      });
      row.setAttribute("aria-selected", "true");

      // update topbar identity
      var name = row.dataset.name;
      var initials = row.dataset.initials;
      var color = row.dataset.color;
      var tbAvatar = document.querySelector(".topbar-account .avatar");
      var tbName = document.querySelector(".topbar-name");
      if (tbAvatar) {
        tbAvatar.textContent = initials;
        tbAvatar.style.setProperty("--a", color);
      }
      if (tbName) tbName.textContent = name;

      // update requester in the approver chain
      var reqAvatar = approver.querySelector(".appr-side .avatar");
      var reqName = approver.querySelector(".appr-side .appr-name");
      if (reqAvatar) {
        reqAvatar.textContent = initials;
        reqAvatar.style.setProperty("--a", color);
      }
      if (reqName) reqName.textContent = name;

      closeOverlay(acctOverlay);
      toast("Switched to " + name);
    });
  });

  /* ---------- Esc closes overlays ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!overlay.hidden) closeOverlay(overlay);
    else if (!acctOverlay.hidden) closeOverlay(acctOverlay);
  });

  render("no-access");
})();
