(function () {
  "use strict";

  var TAX_RATE = 0.086;
  var submitted = false;

  var lines = Array.prototype.slice.call(document.querySelectorAll(".line"));
  var meterFill = document.getElementById("meterFill");
  var decidedCount = document.getElementById("decidedCount");
  var sumLabor = document.getElementById("sumLabor");
  var sumParts = document.getElementById("sumParts");
  var sumTax = document.getElementById("sumTax");
  var sumTotal = document.getElementById("sumTotal");
  var btnTotal = document.getElementById("btnTotal");
  var cApprove = document.getElementById("cApprove");
  var cDecline = document.getElementById("cDecline");
  var cPending = document.getElementById("cPending");
  var submitBtn = document.getElementById("submitBtn");

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---- toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast" + (kind ? " " + kind : "");
    }, 2600);
  }

  /* ---- line breakdown: derive labor vs parts+shop from data ---- */
  function lineParts(li) {
    var amt = parseFloat(li.getAttribute("data-amount")) || 0;
    var txt = li.querySelector(".line-breakdown").textContent;
    var labMatch = txt.match(/\$([\d,]+\.\d{2})/g) || [];
    // first money in breakdown after "Labor" is labor
    var labor = 0;
    var spans = li.querySelectorAll(".line-breakdown span");
    spans.forEach(function (s) {
      var m = s.textContent.match(/\$([\d,]+\.\d{2})/);
      if (m && /Labor/i.test(s.textContent)) labor = parseFloat(m[1].replace(/,/g, ""));
    });
    var rest = Math.max(0, amt - labor);
    return { total: amt, labor: labor, rest: rest };
  }

  /* ---- recompute summary ---- */
  function recompute() {
    var labor = 0, rest = 0, approved = 0, declined = 0, pending = 0;

    lines.forEach(function (li) {
      var state = li.dataset.decided === "false" ? "pending" : li.dataset.state;
      if (state === "pending") {
        pending++;
      } else if (state === "approve") {
        approved++;
        var p = lineParts(li);
        labor += p.labor;
        rest += p.rest;
      } else {
        declined++;
      }
    });

    var pre = labor + rest;
    var tax = pre * TAX_RATE;
    var total = pre + tax;

    sumLabor.textContent = money(labor);
    sumParts.textContent = money(rest);
    sumTax.textContent = money(tax);
    sumTotal.textContent = money(total);
    btnTotal.textContent = money(total);

    cApprove.textContent = approved;
    cDecline.textContent = declined;
    cPending.textContent = pending;

    var decided = lines.length - pending;
    decidedCount.textContent = decided;
    meterFill.style.width = Math.round((decided / lines.length) * 100) + "%";

    updateSubmit(approved);
  }

  /* ---- per-line decisions ---- */
  function setDecision(li, act) {
    if (submitted) return;
    var current = li.dataset.decided === "true" ? li.dataset.state : null;
    if (current === act) {
      // toggle back to pending
      li.dataset.decided = "false";
      li.dataset.state = "pending";
      li.classList.remove("is-approved", "is-declined");
    } else {
      li.dataset.decided = "true";
      li.dataset.state = act;
      li.classList.toggle("is-approved", act === "approve");
      li.classList.toggle("is-declined", act === "decline");
      var label = li.querySelector(".line-state");
      label.textContent = act === "approve" ? "Approved" : "Declined";
    }
    recompute();
  }

  lines.forEach(function (li) {
    li.querySelectorAll(".seg").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setDecision(li, btn.dataset.act);
      });
    });
  });

  document.getElementById("approveAll").addEventListener("click", function () {
    if (submitted) return;
    lines.forEach(function (li) {
      li.dataset.decided = "true";
      li.dataset.state = "approve";
      li.classList.add("is-approved");
      li.classList.remove("is-declined");
      li.querySelector(".line-state").textContent = "Approved";
    });
    recompute();
    toast("All items approved");
  });

  document.getElementById("declineAll").addEventListener("click", function () {
    if (submitted) return;
    lines.forEach(function (li) {
      li.dataset.decided = "true";
      li.dataset.state = "decline";
      li.classList.add("is-declined");
      li.classList.remove("is-approved");
      li.querySelector(".line-state").textContent = "Declined";
    });
    recompute();
    toast("All items declined");
  });

  /* ---- signature pad ---- */
  var canvas = document.getElementById("pad");
  var padWrap = canvas.parentElement;
  var ctx = canvas.getContext("2d");
  var drawing = false;
  var hasInk = false;
  var last = null;

  function fitCanvas() {
    var ratio = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    // preserve drawing
    var prev = hasInk ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#16181c";
    if (prev) {
      try { ctx.putImageData(prev, 0, 0); } catch (e) { /* size changed */ }
    }
  }

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function start(e) {
    if (submitted) return;
    e.preventDefault();
    drawing = true;
    last = pos(e);
    if (!hasInk) { hasInk = true; padWrap.classList.add("has-ink"); }
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    updateSubmit();
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    updateSubmit();
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("clearPad").addEventListener("click", function () {
    if (submitted) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
    padWrap.classList.remove("has-ink");
    updateSubmit();
  });

  /* ---- submit gating ---- */
  function updateSubmit(approvedOverride) {
    if (submitted) return;
    var approved = approvedOverride;
    if (approved === undefined) {
      approved = lines.filter(function (li) {
        return li.dataset.decided === "true" && li.dataset.state === "approve";
      }).length;
    }
    var nameOk = document.getElementById("signName").value.trim().length > 1;
    submitBtn.disabled = !(approved > 0 && hasInk && nameOk);
  }

  document.getElementById("signName").addEventListener("input", function () { updateSubmit(); });

  submitBtn.addEventListener("click", function () {
    if (submitBtn.disabled || submitted) return;
    submitted = true;
    var name = document.getElementById("signName").value.trim();
    var total = sumTotal.textContent;

    submitBtn.classList.add("is-done");
    submitBtn.innerHTML = "Authorized &middot; " + total;
    submitBtn.disabled = true;

    lines.forEach(function (li) {
      li.querySelectorAll(".seg, .line-actions button").forEach(function (b) { b.disabled = true; });
    });
    document.getElementById("approveAll").disabled = true;
    document.getElementById("declineAll").disabled = true;
    document.getElementById("clearPad").disabled = true;
    document.getElementById("signName").readOnly = true;
    canvas.style.cursor = "default";

    toast("Quote authorized by " + name + " · " + total, "ok");
  });

  /* ---- init ---- */
  fitCanvas();
  window.addEventListener("resize", fitCanvas);
  recompute();
})();
