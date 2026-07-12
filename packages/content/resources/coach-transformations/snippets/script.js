(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
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

  /* ---------- Before / After sliders ---------- */
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function setPos(ba, pct) {
    pct = clamp(pct, 0, 100);
    ba.style.setProperty("--pos", pct + "%");
    ba.setAttribute("aria-valuenow", Math.round(pct));
  }

  function posFromEvent(ba, clientX) {
    var rect = ba.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  document.querySelectorAll(".ba").forEach(function (ba) {
    var dragging = false;

    function start(clientX) {
      dragging = true;
      setPos(ba, posFromEvent(ba, clientX));
    }
    function move(clientX) {
      if (!dragging) return;
      setPos(ba, posFromEvent(ba, clientX));
    }
    function end() {
      dragging = false;
    }

    ba.addEventListener("pointerdown", function (e) {
      ba.setPointerCapture(e.pointerId);
      start(e.clientX);
    });
    ba.addEventListener("pointermove", function (e) {
      move(e.clientX);
    });
    ba.addEventListener("pointerup", end);
    ba.addEventListener("pointercancel", end);

    // Keyboard support
    ba.addEventListener("keydown", function (e) {
      var cur = parseFloat(ba.getAttribute("aria-valuenow")) || 50;
      var step = e.shiftKey ? 20 : 5;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          setPos(ba, cur - step);
          e.preventDefault();
          break;
        case "ArrowRight":
        case "ArrowUp":
          setPos(ba, cur + step);
          e.preventDefault();
          break;
        case "Home":
          setPos(ba, 0);
          e.preventDefault();
          break;
        case "End":
          setPos(ba, 100);
          e.preventDefault();
          break;
      }
    });
  });

  /* ---------- Filtering ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var grid = document.getElementById("grid");

  function animateCount(target) {
    var start = parseInt(countEl.textContent, 10) || 0;
    var diff = target - start;
    var steps = Math.min(Math.abs(diff), 12);
    if (steps === 0) {
      countEl.textContent = String(target);
      return;
    }
    var i = 0;
    var timer = setInterval(function () {
      i++;
      countEl.textContent = String(Math.round(start + (diff * i) / steps));
      if (i >= steps) {
        clearInterval(timer);
        countEl.textContent = String(target);
      }
    }, 30);
  }

  function applyFilter(filter) {
    var visible = 0;
    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-goal") === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) {
        visible++;
        // retrigger entrance animation
        card.style.animation = "none";
        // force reflow
        void card.offsetWidth;
        card.style.animation = "";
      }
    });
    animateCount(visible);
    emptyEl.hidden = visible !== 0;
    grid.hidden = visible === 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- CTA ---------- */
  var book = document.getElementById("book");
  if (book) {
    book.addEventListener("click", function () {
      toast("Nice — check your inbox to pick a time.");
    });
  }

  // Initial count
  animateCount(cards.length);
})();
