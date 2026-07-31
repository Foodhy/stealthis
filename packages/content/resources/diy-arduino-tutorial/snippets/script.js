/* Lesson 03 — Blink + Button · interactions */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- breadboard hole grid (generated) ---------- */
  var holes = document.getElementById("holes");
  if (holes) {
    var frag = document.createDocumentFragment();
    var ns = "http://www.w3.org/2000/svg";
    for (var col = 0; col < 30; col++) {
      for (var row = 0; row < 10; row++) {
        var c = document.createElementNS(ns, "circle");
        var x = 322 + col * 12.1;
        var y = row < 5 ? 78 + row * 18 : 194 + (row - 5) * 18;
        c.setAttribute("cx", x.toFixed(1));
        c.setAttribute("cy", String(y));
        c.setAttribute("r", "2.4");
        frag.appendChild(c);
      }
    }
    holes.appendChild(frag);
  }

  /* ---------- wiring diagram <-> table cross-highlight ---------- */
  var svg = document.getElementById("wiring-svg");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".conn-row"));
  var svgParts = svg
    ? Array.prototype.slice.call(svg.querySelectorAll("[data-wire]"))
    : [];

  function setHighlight(wireId) {
    if (!svg) return;
    if (wireId) {
      svg.classList.add("has-hl");
    } else {
      svg.classList.remove("has-hl");
    }
    svgParts.forEach(function (el) {
      el.classList.toggle("hl", el.getAttribute("data-wire") === wireId);
    });
    rows.forEach(function (r) {
      r.classList.toggle("hl", r.getAttribute("data-wire") === wireId);
    });
  }

  rows.forEach(function (row) {
    var id = row.getAttribute("data-wire");
    row.addEventListener("mouseenter", function () { setHighlight(id); });
    row.addEventListener("mouseleave", function () { setHighlight(null); });
    row.addEventListener("focus", function () { setHighlight(id); });
    row.addEventListener("blur", function () { setHighlight(null); });
  });

  svgParts.forEach(function (part) {
    var id = part.getAttribute("data-wire");
    part.addEventListener("mouseenter", function () { setHighlight(id); });
    part.addEventListener("mouseleave", function () { setHighlight(null); });
  });

  /* ---------- copy sketch ---------- */
  var copyBtn = document.getElementById("copy-btn");
  var codeBody = document.getElementById("code-body");
  if (copyBtn && codeBody) {
    copyBtn.addEventListener("click", function () {
      var text = Array.prototype.map
        .call(codeBody.querySelectorAll(".cl"), function (line) {
          return line.textContent;
        })
        .join("\n");

      function done() {
        copyBtn.classList.add("copied");
        var label = copyBtn.querySelector("span");
        if (label) label.textContent = "Copied!";
        toast("Sketch copied — paste it into the IDE");
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      toast("Copy failed — select the code manually");
    }
    document.body.removeChild(ta);
  }

  /* ---------- upload & test checklist ---------- */
  var checklist = document.getElementById("checklist");
  var checkBar = document.getElementById("check-bar");
  var checkCount = document.getElementById("check-count");
  var celebrated = false;

  if (checklist && checkBar && checkCount) {
    var boxes = Array.prototype.slice.call(
      checklist.querySelectorAll('input[type="checkbox"]')
    );
    function updateProgress() {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      var pct = Math.round((done / boxes.length) * 100);
      checkBar.style.width = pct + "%";
      checkCount.textContent = done + " / " + boxes.length + " steps done";
      if (done === boxes.length && !celebrated) {
        celebrated = true;
        toast("QC PASS — circuit verified. On to Lesson 04!");
      }
      if (done < boxes.length) celebrated = false;
    }
    boxes.forEach(function (b) {
      b.addEventListener("change", updateProgress);
    });
    updateProgress();
  }

  /* ---------- troubleshooting accordion ---------- */
  var accButtons = Array.prototype.slice.call(
    document.querySelectorAll(".acc-btn")
  );
  accButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      /* close others (single-open behavior) */
      accButtons.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          var p = document.getElementById(other.getAttribute("aria-controls"));
          if (p) p.hidden = true;
        }
      });
      btn.setAttribute("aria-expanded", String(!expanded));
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ---------- smooth in-page anchors ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll('a[href^="#"]'),
    function (a) {
      a.addEventListener("click", function (ev) {
        var target = document.querySelector(a.getAttribute("href"));
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  );
})();
