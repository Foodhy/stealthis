(function () {
  "use strict";

  /* ---------- Tour step definitions (each points at a target element) ---------- */
  var STEPS = [
    {
      target: "#t-search",
      title: "Find anything, fast",
      body: "Jump to any project, person, or document. Press ⌘K from anywhere to open search instantly.",
      prefer: "bottom"
    },
    {
      target: "#t-nav",
      title: "Your workspace, organized",
      body: "Switch between Overview, Tasks, and Projects here. The badge shows how many tasks need you.",
      prefer: "right"
    },
    {
      target: "#t-stats",
      title: "Track what matters",
      body: "These live metrics update as your team ships. Cycle time trending down means you're moving faster.",
      prefer: "bottom"
    },
    {
      target: "#t-activity",
      title: "Stay in the loop",
      body: "Recent activity streams in real time so you never miss a comment, close, or new issue.",
      prefer: "left"
    },
    {
      target: "#t-create",
      title: "Create in one click",
      body: "When you're ready, hit New to spin up a task, project, or doc. That's the whole tour — enjoy!",
      prefer: "bottom"
    }
  ];

  var PAD = 8;          // breathing room around the highlight
  var GAP = 14;         // space between target and coachmark
  var EDGE = 12;        // viewport edge margin for the coachmark

  /* ---------- Element refs ---------- */
  var tour = document.getElementById("tour");
  var maskHole = document.getElementById("maskHole");
  var ring = document.getElementById("tourRing");
  var coach = document.getElementById("coach");
  var arrow = document.getElementById("coachArrow");
  var elStep = document.getElementById("coachStep");
  var elTitle = document.getElementById("coachTitle");
  var elBody = document.getElementById("coachBody");
  var elDots = document.getElementById("coachDots");
  var btnBack = document.getElementById("coachBack");
  var btnNext = document.getElementById("coachNext");
  var btnSkip = document.getElementById("coachSkip");
  var toastEl = document.getElementById("toast");

  /* a pulse ring element for the spotlight variant */
  var pulse = document.createElement("div");
  pulse.className = "tour-pulse";
  tour.appendChild(pulse);

  /* ---------- State ---------- */
  var idx = 0;
  var active = false;
  var styleVariant = "spotlight"; // 'spotlight' | 'border'
  var placeVariant = "auto";      // 'auto' | 'bottom'
  var lastFocus = null;

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Build progress dots once ---------- */
  (function buildDots() {
    var html = "";
    for (var i = 0; i < STEPS.length; i++) html += "<i></i>";
    elDots.innerHTML = html;
  })();

  /* ---------- Measure a target's rect (viewport coords) ---------- */
  function targetRect(sel) {
    var el = document.querySelector(sel);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return {
      x: r.left - PAD,
      y: r.top - PAD,
      w: r.width + PAD * 2,
      h: r.height + PAD * 2
    };
  }

  /* ---------- Position the highlight (mask hole or ring) ---------- */
  function paintHighlight(rect) {
    // spotlight cut-out via SVG mask
    maskHole.setAttribute("x", rect.x);
    maskHole.setAttribute("y", rect.y);
    maskHole.setAttribute("width", rect.w);
    maskHole.setAttribute("height", rect.h);

    // bordered-variant ring
    ring.style.top = rect.y + "px";
    ring.style.left = rect.x + "px";
    ring.style.width = rect.w + "px";
    ring.style.height = rect.h + "px";

    // pulse follows the hole edge
    pulse.style.top = rect.y + "px";
    pulse.style.left = rect.x + "px";
    pulse.style.width = rect.w + "px";
    pulse.style.height = rect.h + "px";
  }

  /* ---------- Choose a placement side that fits in the viewport ---------- */
  function resolveSide(rect, cw, ch) {
    if (placeVariant === "bottom") return "bottom";
    var vw = window.innerWidth, vh = window.innerHeight;
    var below = vh - (rect.y + rect.h);
    var above = rect.y;
    var rightSpace = vw - (rect.x + rect.w);
    var leftSpace = rect.x;
    var prefer = STEPS[idx].prefer;

    var fits = {
      bottom: below >= ch + GAP + EDGE,
      top: above >= ch + GAP + EDGE,
      right: rightSpace >= cw + GAP + EDGE,
      left: leftSpace >= cw + GAP + EDGE
    };
    if (fits[prefer]) return prefer;
    var order = ["bottom", "top", "right", "left"];
    for (var i = 0; i < order.length; i++) if (fits[order[i]]) return order[i];
    // nothing fits cleanly — fall back to wherever there is the most room
    return below >= above ? "bottom" : "top";
  }

  /* ---------- Position the coachmark relative to the rect ---------- */
  function placeCoach(rect) {
    var cw = coach.offsetWidth || 308;
    var ch = coach.offsetHeight || 180;
    var side = resolveSide(rect, cw, ch);
    coach.setAttribute("data-side", side);

    var top, left;
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + rect.h / 2;

    if (side === "bottom") { top = rect.y + rect.h + GAP; left = cx - cw / 2; }
    else if (side === "top") { top = rect.y - GAP - ch; left = cx - cw / 2; }
    else if (side === "right") { left = rect.x + rect.w + GAP; top = cy - ch / 2; }
    else { left = rect.x - GAP - cw; top = cy - ch / 2; }

    // clamp to viewport
    var vw = window.innerWidth, vh = window.innerHeight;
    left = Math.max(EDGE, Math.min(left, vw - cw - EDGE));
    top = Math.max(EDGE, Math.min(top, vh - ch - EDGE));

    coach.style.top = top + "px";
    coach.style.left = left + "px";

    // point the arrow at the target center along the relevant axis
    if (side === "bottom" || side === "top") {
      var ax = Math.max(14, Math.min(cx - left, cw - 14));
      arrow.style.left = ax + "px";
      arrow.style.top = "";
    } else {
      var ay = Math.max(14, Math.min(cy - top, ch - 14));
      arrow.style.top = ay + "px";
      arrow.style.left = "";
    }
  }

  /* ---------- Render the current step ---------- */
  function render() {
    var step = STEPS[idx];
    var rect = targetRect(step.target);
    if (!rect) { endTour(true); return; }

    // scroll target into view if it's off-screen, then re-measure on next frame
    var el = document.querySelector(step.target);
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      requestAnimationFrame(function () {
        requestAnimationFrame(render);
      });
      return;
    }

    paintHighlight(rect);

    elStep.textContent = (idx + 1) + " of " + STEPS.length;
    elTitle.textContent = step.title;
    elBody.textContent = step.body;

    var dots = elDots.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].className = i === idx ? "on" : "";
    }

    btnBack.disabled = idx === 0;
    btnNext.textContent = idx === STEPS.length - 1 ? "Finish" : "Next";

    placeCoach(rect);
  }

  /* ---------- Open / advance / close ---------- */
  function startTour() {
    idx = 0;
    active = true;
    lastFocus = document.activeElement;
    tour.hidden = false;
    applyStyleClasses();
    render();
    // focus the primary action for keyboard users
    btnNext.focus();
  }

  function next() {
    if (idx < STEPS.length - 1) {
      idx++;
      render();
    } else {
      endTour(false);
      toast("Tour complete — you're all set! 🎉");
    }
  }

  function back() {
    if (idx > 0) { idx--; render(); }
  }

  function endTour(silent) {
    active = false;
    tour.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (!silent && idx < STEPS.length - 1) toast("Tour skipped — replay it anytime.");
  }

  function applyStyleClasses() {
    tour.classList.toggle("is-spotlight", styleVariant === "spotlight");
    tour.classList.toggle("is-border", styleVariant === "border");
  }

  /* ---------- Wire controls ---------- */
  document.getElementById("startTour").addEventListener("click", startTour);
  document.getElementById("replay").addEventListener("click", startTour);
  btnNext.addEventListener("click", next);
  btnBack.addEventListener("click", back);
  btnSkip.addEventListener("click", function () { endTour(false); });

  /* dim/ring backdrop click advances (common tour UX); ignore clicks on the coach */
  tour.addEventListener("click", function (e) {
    if (e.target.closest(".coach")) return;
    next();
  });

  /* ---------- Variant switcher ---------- */
  document.querySelectorAll(".seg-btn[data-style]").forEach(function (b) {
    b.addEventListener("click", function () {
      styleVariant = b.getAttribute("data-style");
      document.querySelectorAll(".seg-btn[data-style]").forEach(function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (active) { applyStyleClasses(); render(); }
    });
  });

  document.querySelectorAll(".seg-btn[data-place]").forEach(function (b) {
    b.addEventListener("click", function () {
      placeVariant = b.getAttribute("data-place");
      document.querySelectorAll(".seg-btn[data-place]").forEach(function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (active) render();
    });
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (!active) return;
    if (e.key === "Escape") { e.preventDefault(); endTour(false); }
    else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    else if (e.key === "Tab") {
      // trap focus within the coachmark controls
      var f = [btnSkip, btnBack, btnNext].filter(function (x) { return !x.disabled; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (f.indexOf(document.activeElement) === -1) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Recompute on resize / scroll ---------- */
  var rafId;
  function recompute() {
    if (!active) return;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(render);
  }
  window.addEventListener("resize", recompute);
  window.addEventListener("scroll", recompute, true);
})();
