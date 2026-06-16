(function () {
  "use strict";

  var body = document.body;
  var leaves = Array.prototype.slice.call(
    document.querySelectorAll(".leaf")
  );
  var total = leaves.length;

  var nextBtn = document.getElementById("nextSpread");
  var prevBtn = document.getElementById("prevSpread");
  var gridBtn = document.getElementById("gridToggle");
  var issueLabel = document.getElementById("issueLabel");
  var toastEl = document.getElementById("toast");

  var current = 0; // index into leaves
  var gridOn = false;

  var spreadNames = ["The Long Read", "The Vanishing Coast, cont."];

  /* ---- toast helper ---- */
  var toastTimer = null;
  function toast(msg, accent) {
    if (!toastEl) return;
    toastEl.innerHTML = accent
      ? '<span class="toast__accent">' + accent + "</span> " + msg
      : msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---- show a given spread ---- */
  function showSpread(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;

    leaves.forEach(function (leaf, i) {
      var active = i === current;
      leaf.hidden = !active;
      leaf.classList.toggle("leaf--active", active);
      if (active) {
        // restart entrance animation
        leaf.style.animation = "none";
        // force reflow
        void leaf.offsetWidth;
        leaf.style.animation = "";
        applyGrid(leaf);
      }
    });

    body.setAttribute("data-spread", String(current + 1));
    if (issueLabel) {
      issueLabel.textContent =
        "Issue 214 — " + (spreadNames[current] || "The Long Read");
    }
    updateNav();
  }

  function updateNav() {
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) {
      nextBtn.firstChild &&
        (nextBtn.childNodes[0].nodeValue =
          current === total - 1 ? "Back to start " : "Flip spread ");
    }
  }

  /* ---- grid overlay ---- */
  function applyGrid(leaf) {
    if (!leaf) return;
    leaf.classList.toggle("show-grid", gridOn);
  }

  function toggleGrid() {
    gridOn = !gridOn;
    gridBtn.setAttribute("aria-pressed", String(gridOn));
    leaves.forEach(applyGrid);
    toast(gridOn ? "showing column grid & margins" : "guides hidden", "Layout");
  }

  /* ---- next / prev ---- */
  function goNext() {
    var atEnd = current === total - 1;
    showSpread(current + 1);
    toast(
      atEnd
        ? "returned to the opening spread"
        : "pages " + (current * 2 + 38) + "–" + (current * 2 + 39),
      atEnd ? "Wrapped" : "Spread " + (current + 1)
    );
  }

  function goPrev() {
    showSpread(current - 1);
    toast(
      "pages " + (current * 2 + 38) + "–" + (current * 2 + 39),
      "Spread " + (current + 1)
    );
  }

  /* ---- wire up ---- */
  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (gridBtn) gridBtn.addEventListener("click", toggleGrid);

  /* ---- keyboard navigation ---- */
  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "g" || e.key === "G") {
      toggleGrid();
    }
  });

  /* ---- init ---- */
  showSpread(0);
  setTimeout(function () {
    toast("use ‹ › or the arrow keys · press G for guides", "The Meridian Review");
  }, 600);
})();
