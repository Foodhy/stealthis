(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- animated hero stat counters ---------- */
  var counters = document.querySelectorAll(".stats__num");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = null;
    var dur = 1400;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count"); });
  }

  /* ---------- gallery switching ---------- */
  var stageImg = document.getElementById("stageImg");
  var stageTag = document.getElementById("stageTag");
  var stageText = document.getElementById("stageText");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));

  function selectThumb(btn) {
    thumbs.forEach(function (t) {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    var shot = btn.getAttribute("data-shot");
    stageImg.classList.add("is-swap");
    setTimeout(function () {
      stageImg.setAttribute("data-shot", shot);
      stageTag.textContent = btn.getAttribute("data-tag");
      stageText.textContent = btn.getAttribute("data-text");
      stageImg.classList.remove("is-swap");
    }, 220);
  }

  thumbs.forEach(function (btn, i) {
    btn.addEventListener("click", function () { selectThumb(btn); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var next = thumbs[(i + 1) % thumbs.length];
        next.focus(); selectThumb(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var prev = thumbs[(i - 1 + thumbs.length) % thumbs.length];
        prev.focus(); selectThumb(prev);
      }
    });
  });

  /* ---------- order builder ---------- */
  var PACKAGES = {
    photo:     { name: "Essential Photo", price: 199 },
    drone:     { name: "Drone Aerial",    price: 149 },
    twilight:  { name: "Twilight Session", price: 169 },
    floorplan: { name: "Floorplan + Tour", price: 129 }
  };
  var RUSH_FEE = 79;

  var selected = {};
  var sizeSel = document.getElementById("size");
  var rushChk = document.getElementById("rush");
  var linesEl = document.getElementById("lines");
  var totalEl = document.getElementById("total");
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".toggle"));

  function money(n) { return "$" + Math.round(n).toLocaleString(); }

  function render() {
    var mult = parseFloat(sizeSel.value) || 1;
    var ids = Object.keys(selected);
    linesEl.innerHTML = "";

    if (!ids.length && !rushChk.checked) {
      var empty = document.createElement("li");
      empty.className = "summary__empty";
      empty.textContent = "No packages selected yet — add one to start.";
      linesEl.appendChild(empty);
    }

    var subtotal = 0;
    ids.forEach(function (id) {
      var p = PACKAGES[id];
      var line = p.price * mult;
      subtotal += line;
      var li = document.createElement("li");
      var left = document.createElement("span");
      left.textContent = p.name;
      var right = document.createElement("span");
      right.textContent = money(line);
      li.appendChild(left); li.appendChild(right);
      linesEl.appendChild(li);
    });

    if (mult > 1 && ids.length) {
      var pct = Math.round((mult - 1) * 100);
      var note = document.createElement("li");
      note.className = "summary__empty";
      note.textContent = "Size adjustment of +" + pct + "% applied.";
      linesEl.appendChild(note);
    }

    if (rushChk.checked) {
      subtotal += RUSH_FEE;
      var rli = document.createElement("li");
      var rl = document.createElement("span"); rl.textContent = "Same-day rush";
      var rr = document.createElement("span"); rr.textContent = money(RUSH_FEE);
      rli.appendChild(rl); rli.appendChild(rr);
      linesEl.appendChild(rli);
    }

    totalEl.textContent = money(subtotal);
    totalEl.classList.add("bump");
    setTimeout(function () { totalEl.classList.remove("bump"); }, 260);
    return subtotal;
  }

  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var card = btn.closest(".pkg");
      if (selected[id]) {
        delete selected[id];
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = "Add to order";
        if (card) card.classList.remove("is-on");
      } else {
        selected[id] = true;
        btn.setAttribute("aria-pressed", "true");
        btn.textContent = "Added";
        if (card) card.classList.add("is-on");
        toast(PACKAGES[id].name + " added to your order.");
      }
      render();
    });
  });

  sizeSel.addEventListener("change", render);
  rushChk.addEventListener("change", function () {
    render();
    if (rushChk.checked) toast("Same-day rush selected — delivered by midnight.");
  });

  document.getElementById("checkout").addEventListener("click", function () {
    var count = Object.keys(selected).length;
    if (!count) {
      toast("Add at least one package to request a booking.");
      return;
    }
    var total = render();
    toast("Booking request sent — " + count + " package" + (count > 1 ? "s" : "") + ", " + money(total) + ". We'll confirm within 2 hours.");
  });

  render();
})();
