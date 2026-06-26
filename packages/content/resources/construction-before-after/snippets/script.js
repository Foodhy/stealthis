(function () {
  "use strict";

  var ba = document.getElementById("ba");
  var beforeLayer = document.getElementById("beforeLayer");
  var divider = document.getElementById("divider");
  var handle = document.getElementById("handle");
  var readout = document.getElementById("readout");
  var labelToggle = document.getElementById("labelToggle");
  var gallery = document.getElementById("gallery");
  var projTitle = document.getElementById("projTitle");
  var projDesc = document.getElementById("projDesc");
  var projBadge = document.getElementById("projBadge");

  if (!ba || !handle) return;

  /* ---- Project data (CSS gradient placeholders for real photos) ---- */
  var projects = [
    {
      name: "Kitchen",
      title: "Kitchen Remodel",
      desc: "Cabinet refit, quartz worktops & new splashback — 9 days.",
      badge: "Completed",
      before: "linear-gradient(160deg, #6f6a60, #4c4944 55%, #35332f)",
      after: "linear-gradient(160deg, #f6efe2, #cdd6dd 60%, #a9b6c0)"
    },
    {
      name: "Deck",
      title: "Deck Rebuild",
      desc: "Rotten boards stripped, new pressure-treated cedar — 4 days.",
      badge: "Completed",
      before: "linear-gradient(160deg, #5a4f42, #3a342b)",
      after: "linear-gradient(160deg, #c79a5b, #8a5a2e 70%, #6b4322)"
    },
    {
      name: "Driveway",
      title: "Driveway Pour",
      desc: "Cracked tarmac removed, fresh 100mm concrete slab — 3 days.",
      badge: "Completed",
      before: "linear-gradient(160deg, #4d4a45, #2c2a27)",
      after: "linear-gradient(160deg, #d9d6cf, #aeaba3 65%, #8c8980)"
    },
    {
      name: "Roof",
      title: "Roof Replacement",
      desc: "Stripped to battens, re-felted & re-tiled — 6 days.",
      badge: "In progress",
      before: "linear-gradient(160deg, #57514a, #322e2a)",
      after: "linear-gradient(160deg, #8a3b2e, #5e2620 70%, #431915)"
    }
  ];

  var pos = 50; // current reveal percentage
  var dragging = false;
  var activeIndex = 0;

  /* ---- Core: apply a position 0..100 ---- */
  function setPos(value) {
    pos = Math.max(0, Math.min(100, Math.round(value)));
    var pct = pos + "%";
    ba.style.setProperty("--pos", pct);
    if (beforeLayer) beforeLayer.style.setProperty("--pos", pct);
    ba.dataset.pos = String(pos);
    handle.setAttribute("aria-valuenow", String(pos));
    handle.setAttribute("aria-valuetext", pos + "% revealed");
    if (readout) readout.textContent = pos + "%";
  }

  function posFromClientX(clientX) {
    var rect = ba.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  /* ---- Pointer drag (mouse + touch via Pointer Events) ---- */
  function startDrag(e) {
    dragging = true;
    if (ba.setPointerCapture && e.pointerId != null) {
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
    }
    setPos(posFromClientX(e.clientX));
  }

  function moveDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    setPos(posFromClientX(e.clientX));
  }

  function endDrag() {
    dragging = false;
  }

  ba.addEventListener("pointerdown", startDrag);
  ba.addEventListener("pointermove", moveDrag);
  ba.addEventListener("pointerup", endDrag);
  ba.addEventListener("pointercancel", endDrag);
  // Keep the handle from also firing a click-jump on pointerdown.
  handle.addEventListener("pointerdown", function (e) { e.stopPropagation(); startDrag(e); });

  /* ---- Keyboard support ---- */
  handle.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 2;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        setPos(pos - step);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        setPos(pos + step);
        break;
      case "Home":
        e.preventDefault();
        setPos(0);
        break;
      case "End":
        e.preventDefault();
        setPos(100);
        break;
      default:
        break;
    }
  });

  /* ---- Label toggle ---- */
  if (labelToggle) {
    labelToggle.addEventListener("click", function () {
      var on = labelToggle.getAttribute("aria-pressed") === "true";
      on = !on;
      labelToggle.setAttribute("aria-pressed", String(on));
      ba.classList.toggle("labels-off", !on);
      labelToggle.querySelector(".toggle__txt").textContent = on ? "Labels on" : "Labels off";
    });
  }

  /* ---- Build gallery + project switching ---- */
  function loadProject(i) {
    var p = projects[i];
    if (!p) return;
    activeIndex = i;

    document.getElementById("afterLayer").style.background = p.after;
    document.getElementById("beforeLayer").style.background =
      "radial-gradient(circle at 30% 70%, rgba(0,0,0,0.25), transparent 50%)," +
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0 14px, transparent 14px 28px)," +
      p.before;

    if (projTitle) projTitle.textContent = p.title;
    if (projDesc) projDesc.textContent = p.desc;
    if (projBadge) {
      projBadge.textContent = p.badge;
      var inProgress = p.badge.toLowerCase().indexOf("progress") !== -1;
      projBadge.style.color = inProgress ? "#8a4d12" : "#1c5b32";
      projBadge.style.background = inProgress ? "#fbe6c8" : "#d6f0dd";
      projBadge.style.borderColor = inProgress ? "#f0c98c" : "#aed9bd";
    }

    var thumbs = gallery.querySelectorAll(".thumb");
    thumbs.forEach(function (t, idx) {
      t.setAttribute("aria-current", idx === i ? "true" : "false");
    });

    setPos(50);
  }

  if (gallery) {
    projects.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb";
      btn.style.setProperty("--thumb-after", p.after);
      btn.setAttribute("aria-current", i === 0 ? "true" : "false");
      btn.setAttribute("aria-label", "Show " + p.title);

      var name = document.createElement("span");
      name.className = "thumb__name";
      name.textContent = p.name;
      btn.appendChild(name);

      btn.addEventListener("click", function () { loadProject(i); });
      gallery.appendChild(btn);
    });
  }

  /* ---- Init ---- */
  loadProject(0);
})();
