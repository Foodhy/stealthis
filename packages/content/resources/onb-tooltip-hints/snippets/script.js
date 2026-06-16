(function () {
  "use strict";

  // --- hint definitions, each anchored to a control in the workspace mock ---
  var HINTS = [
    {
      id: "search",
      pos: "inline-end",
      title: "Universal search",
      tip: "Jump to any project, person, or file. Press ⌘K from anywhere to open it instantly.",
    },
    {
      id: "newtask",
      pos: "default",
      title: "Create a task",
      tip: "Add work to this board. Tasks inherit the board owner and current sprint automatically.",
    },
    {
      id: "notify",
      pos: "default",
      title: "Notifications",
      tip: "Mentions, assignments, and review requests collect here. The badge shows unread items.",
    },
    {
      id: "invite",
      pos: "cta",
      title: "Invite your team",
      tip: "Bring teammates in to co-own boards and get assigned tasks. Up to 10 seats on the free plan.",
    },
    {
      id: "nav",
      pos: "inline-end",
      title: "Workspace home",
      tip: "Your overview — recent boards, activity, and what needs your attention today.",
    },
  ];

  var workspace = document.querySelector(".workspace");
  var popover = document.getElementById("popover");
  var popTitle = document.getElementById("popTitle");
  var popDesc = document.getElementById("popDesc");
  var popStep = document.getElementById("popStep");
  var popGot = document.getElementById("popGot");
  var popSkip = document.getElementById("popSkip");
  var seenCountEl = document.getElementById("seenCount");
  var totalCountEl = document.getElementById("totalCount");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");

  var openMode = "click"; // or "hover"
  var dismissed = Object.create(null);
  var activeBeacon = null;
  var hoverTimer = null;

  totalCountEl.textContent = String(HINTS.length);

  // --- toast helper ---
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 220);
    }, 2200);
  }

  // --- build a beacon for each hint ---
  function buildBeacons() {
    HINTS.forEach(function (hint, i) {
      var anchor = workspace.querySelector('[data-hint-anchor="' + hint.id + '"]');
      if (!anchor) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "beacon";
      btn.setAttribute("data-pos", hint.pos);
      btn.setAttribute("data-beacon", hint.id);
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-label", "Hint: " + hint.title);
      btn.innerHTML =
        '<span class="beacon__pulse"></span>' +
        '<span class="beacon__core"><span class="beacon__qmark">?</span></span>';

      btn._hint = hint;
      btn._index = i;
      anchor.appendChild(btn);

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (activeBeacon === btn) {
          closePopover();
        } else {
          openPopover(btn);
        }
      });

      btn.addEventListener("mouseenter", function () {
        if (openMode !== "hover") return;
        clearTimeout(hoverTimer);
        openPopover(btn);
      });
      btn.addEventListener("mouseleave", function () {
        if (openMode !== "hover") return;
        scheduleHoverClose();
      });
    });
  }

  function scheduleHoverClose() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(closePopover, 220);
  }

  // keep popover open while hovering it (hover mode)
  popover.addEventListener("mouseenter", function () {
    if (openMode === "hover") clearTimeout(hoverTimer);
  });
  popover.addEventListener("mouseleave", function () {
    if (openMode === "hover") scheduleHoverClose();
  });

  // --- positioning relative to anchor ---
  function positionPopover(beacon) {
    // measure beacon center in document coords
    var r = beacon.getBoundingClientRect();
    var scrollX = window.pageXOffset;
    var scrollY = window.pageYOffset;
    var centerX = r.left + r.width / 2 + scrollX;
    var anchorBottom = r.bottom + scrollY;
    var anchorTop = r.top + scrollY;

    // make it measurable
    popover.hidden = false;
    var pw = popover.offsetWidth;
    var ph = popover.offsetHeight;
    var gap = 12;
    var margin = 10;

    // decide side: prefer below, flip above if not enough room
    var spaceBelow = window.innerHeight - r.bottom;
    var side = spaceBelow > ph + gap + 16 || r.top < ph + gap ? "bottom" : "top";

    var top = side === "bottom" ? anchorBottom + gap : anchorTop - ph - gap;

    // horizontally center, then clamp into viewport
    var left = centerX - pw / 2;
    var minLeft = scrollX + margin;
    var maxLeft = scrollX + window.innerWidth - pw - margin;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    popover.style.top = top + "px";
    popover.style.left = left + "px";
    popover.setAttribute("data-side", side);

    // place arrow under/over the beacon center
    var arrow = popover.querySelector(".popover__arrow");
    var arrowLeft = centerX - left - 6;
    arrowLeft = Math.max(14, Math.min(pw - 26, arrowLeft));
    arrow.style.left = arrowLeft + "px";
  }

  function openPopover(beacon) {
    if (activeBeacon && activeBeacon !== beacon) {
      activeBeacon.setAttribute("aria-expanded", "false");
    }
    activeBeacon = beacon;
    var hint = beacon._hint;

    popStep.textContent = "Hint " + (beacon._index + 1) + " / " + HINTS.length;
    popTitle.textContent = hint.title;
    popDesc.textContent = hint.tip;
    beacon.setAttribute("aria-expanded", "true");

    positionPopover(beacon);
    // animate in
    requestAnimationFrame(function () {
      popover.classList.add("is-open");
    });
    popGot.focus({ preventScroll: true });
  }

  function closePopover() {
    if (!activeBeacon) return;
    activeBeacon.setAttribute("aria-expanded", "false");
    popover.classList.remove("is-open");
    var beacon = activeBeacon;
    activeBeacon = null;
    setTimeout(function () {
      if (!activeBeacon) popover.hidden = true;
    }, 150);
    return beacon;
  }

  function updateCount() {
    var n = Object.keys(dismissed).length;
    seenCountEl.textContent = String(n);
  }

  function dismissActive() {
    if (!activeBeacon) return;
    var hint = activeBeacon._hint;
    activeBeacon.classList.add("is-dismissed");
    if (!dismissed[hint.id]) {
      dismissed[hint.id] = true;
      updateCount();
    }
    closePopover();
    if (Object.keys(dismissed).length === HINTS.length) {
      toast("All hints seen — nice! ✨");
    } else {
      toast("“" + hint.title + "” dismissed");
    }
  }

  // --- got it / skip / reset ---
  popGot.addEventListener("click", dismissActive);

  popSkip.addEventListener("click", function () {
    closePopover();
    var added = 0;
    HINTS.forEach(function (hint) {
      var b = workspace.querySelector('[data-beacon="' + hint.id + '"]');
      if (b && !b.classList.contains("is-dismissed")) {
        b.classList.add("is-dismissed");
        dismissed[hint.id] = true;
        added++;
      }
    });
    updateCount();
    if (added) toast("Skipped all remaining hints");
  });

  resetBtn.addEventListener("click", function () {
    closePopover();
    dismissed = Object.create(null);
    var all = workspace.querySelectorAll(".beacon");
    all.forEach(function (b) {
      b.classList.remove("is-dismissed");
      b.setAttribute("aria-expanded", "false");
    });
    updateCount();
    toast("Hints reset — all beacons restored");
  });

  // --- close on Esc / outside click ---
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeBeacon) {
      var b = closePopover();
      if (b) b.focus({ preventScroll: true });
    }
  });

  document.addEventListener("click", function (e) {
    if (!activeBeacon) return;
    if (popover.contains(e.target) || e.target.closest(".beacon")) return;
    closePopover();
  });

  // reposition while open if layout shifts
  window.addEventListener("resize", function () {
    if (activeBeacon) positionPopover(activeBeacon);
  });
  window.addEventListener(
    "scroll",
    function () {
      if (activeBeacon) positionPopover(activeBeacon);
    },
    true
  );

  // --- variant switchers ---
  function wireSegment(group, attr, onChange) {
    var btns = Array.prototype.slice.call(group.querySelectorAll(".seg"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) {
          b.setAttribute("aria-checked", "false");
        });
        btn.setAttribute("aria-checked", "true");
        onChange(btn.getAttribute(attr));
      });
    });
  }

  var styleGroup = document.querySelector('[aria-label="Beacon style"]');
  var openGroup = document.querySelector('[aria-label="Open behaviour"]');

  wireSegment(styleGroup, "data-style", function (val) {
    workspace.setAttribute("data-style", val);
  });

  wireSegment(openGroup, "data-open", function (val) {
    openMode = val;
    closePopover();
  });

  // --- init ---
  workspace.setAttribute("data-style", "beacon");
  buildBeacons();
  updateCount();
})();
