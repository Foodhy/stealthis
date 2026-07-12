(function () {
  "use strict";

  /* ---------- Data (fictional but realistic) ---------- */
  var CASES = [
    {
      id: 1,
      name: "Maya R.",
      where: "Composite veneers · 2 visits",
      treatment: "veneers",
      tlabel: "Porcelain veneers",
      visits: 2,
      rating: "5.0",
      shadeFrom: "#cbbf9a",
      shadeTo: "#f3ece0",
      quote: "I finally stopped hiding my smile in photos — the shape looks completely natural.",
      before: "linear-gradient(160deg,#b9a888,#8f7f63)",
      after: "linear-gradient(160deg,#f6f0e6,#e2d9c8)"
    },
    {
      id: 2,
      name: "Dev P.",
      where: "In-office whitening · 1 visit",
      treatment: "whitening",
      tlabel: "Whitening",
      visits: 1,
      rating: "4.9",
      shadeFrom: "#d8c79f",
      shadeTo: "#f7f2ea",
      quote: "One appointment and my teeth were several shades brighter. Zero sensitivity.",
      before: "linear-gradient(160deg,#cbb98d,#a99a70)",
      after: "linear-gradient(160deg,#faf6ee,#eae2d2)"
    },
    {
      id: 3,
      name: "Aisha K.",
      where: "Clear aligners · 9 months",
      treatment: "aligners",
      tlabel: "Clear aligners",
      visits: 7,
      rating: "5.0",
      shadeFrom: "#e6ddc9",
      shadeTo: "#f2ebdd",
      quote: "The crowding on my lower teeth is gone. Nobody even noticed I was wearing them.",
      before: "linear-gradient(160deg,#d9cdb2,#c0b391)",
      after: "linear-gradient(160deg,#f4eedf,#e6ddc7)"
    },
    {
      id: 4,
      name: "Liam O.",
      where: "Edge bonding · 1 visit",
      treatment: "bonding",
      tlabel: "Composite bonding",
      visits: 1,
      rating: "4.8",
      shadeFrom: "#e2d6bd",
      shadeTo: "#f4efe4",
      quote: "They filled the little chip on my front tooth in an hour — you can't tell at all.",
      before: "linear-gradient(160deg,#ddceac,#c4b48d)",
      after: "linear-gradient(160deg,#f5f0e6,#e7ded0)"
    },
    {
      id: 5,
      name: "Sofia M.",
      where: "Single implant + crown · 3 visits",
      treatment: "implants",
      tlabel: "Dental implant",
      visits: 3,
      rating: "5.0",
      shadeFrom: "#d3c4a2",
      shadeTo: "#f1eadd",
      quote: "The gap from my missing molar is filled and it feels just like a real tooth.",
      before: "linear-gradient(160deg,#cebf9a,#b0a179)",
      after: "linear-gradient(160deg,#f2ece0,#e3dac8)"
    },
    {
      id: 6,
      name: "Noah T.",
      where: "Whitening + bonding · 2 visits",
      treatment: "whitening",
      tlabel: "Whitening",
      visits: 2,
      rating: "4.9",
      shadeFrom: "#d6c69c",
      shadeTo: "#f6f1e8",
      quote: "Coffee had really dulled my smile. This brought back the brightness instantly.",
      before: "linear-gradient(160deg,#c9b787,#a7976d)",
      after: "linear-gradient(160deg,#f9f4ec,#e9e0d0)"
    }
  ];

  var TREATMENT_LABELS = {
    all: "all cases",
    whitening: "whitening",
    veneers: "veneers",
    aligners: "clear aligners",
    bonding: "bonding",
    implants: "implants"
  };

  var grid = document.getElementById("grid");
  var chipsWrap = document.getElementById("chips");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");
  var current = "all";
  var toastTimer;

  /* ---------- Toast helper ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Card template ---------- */
  function cardMarkup(c) {
    return (
      '<article class="card" data-treatment="' + c.treatment + '">' +
        '<div class="compare" style="--pos:50%">' +
          '<div class="compare__img compare__after" style="background:' + c.after + '"></div>' +
          '<div class="compare__before" data-before style="background:' + c.before + '"></div>' +
          '<span class="tag"><span class="tag__dot"></span>' + esc(c.tlabel) + "</span>" +
          '<span class="label label--before">Before</span>' +
          '<span class="label label--after">After</span>' +
          '<div class="handle" data-handle>' +
            '<button class="handle__grip" type="button" role="slider" ' +
              'aria-label="Reveal ' + esc(c.name) + ' after photo" ' +
              'aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 3 12l6 6M15 6l6 6-6 6"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<div class="card__body">' +
          '<div class="card__top">' +
            "<div>" +
              '<h3 class="card__name">' + esc(c.name) + "</h3>" +
              '<p class="card__where">' + esc(c.where) + "</p>" +
            "</div>" +
            '<span class="rating">★ ' + esc(c.rating) + "</span>" +
          "</div>" +
          '<div class="meta">' +
            '<span class="badge badge--mint">' + c.visits + " visit" + (c.visits > 1 ? "s" : "") + "</span>" +
            '<span class="shade">' +
              '<span class="swatch" style="background:' + c.shadeFrom + '"></span>' +
              '<span class="shade__arrow">→</span>' +
              '<span class="swatch" style="background:' + c.shadeTo + '"></span>' +
              "Shade" +
            "</span>" +
          "</div>" +
          '<p class="quote">' + esc(c.quote) + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Render ---------- */
  function render(list) {
    grid.innerHTML = list.map(cardMarkup).join("");
    if (list.length === 0) {
      grid.hidden = true;
      emptyEl.hidden = false;
    } else {
      grid.hidden = false;
      emptyEl.hidden = true;
      wireSliders();
    }
    countEl.textContent = "Showing " + list.length + " of " + CASES.length + " cases";
  }

  function filterBy(treatment) {
    current = treatment;
    var list = treatment === "all"
      ? CASES.slice()
      : CASES.filter(function (c) { return c.treatment === treatment; });
    render(list);

    Array.prototype.forEach.call(chipsWrap.querySelectorAll(".chip"), function (chip) {
      var active = chip.getAttribute("data-treatment") === treatment;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (list.length === 0) {
      toast("No " + TREATMENT_LABELS[treatment] + " cases yet");
    } else {
      toast("Showing " + list.length + " " + TREATMENT_LABELS[treatment] + " case" + (list.length > 1 ? "s" : ""));
    }
  }

  /* ---------- Slider wiring ---------- */
  function setPos(compare, pct) {
    pct = Math.max(0, Math.min(100, pct));
    compare.style.setProperty("--pos", pct + "%");
    var grip = compare.querySelector(".handle__grip");
    if (grip) grip.setAttribute("aria-valuenow", Math.round(pct));
  }

  function wireSliders() {
    Array.prototype.forEach.call(grid.querySelectorAll(".compare"), function (compare) {
      var dragging = false;

      function pctFromEvent(e) {
        var rect = compare.getBoundingClientRect();
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        return (x / rect.width) * 100;
      }

      function onMove(e) {
        if (!dragging) return;
        if (e.cancelable) e.preventDefault();
        setPos(compare, pctFromEvent(e));
      }

      function start(e) {
        dragging = true;
        setPos(compare, pctFromEvent(e));
      }

      function end() { dragging = false; }

      compare.addEventListener("pointerdown", function (e) {
        start(e);
        compare.setPointerCapture && compare.setPointerCapture(e.pointerId);
      });
      compare.addEventListener("pointermove", onMove);
      compare.addEventListener("pointerup", end);
      compare.addEventListener("pointercancel", end);

      /* keyboard on the grip */
      var grip = compare.querySelector(".handle__grip");
      grip.addEventListener("keydown", function (e) {
        var cur = parseFloat(compare.style.getPropertyValue("--pos")) || 50;
        var step = e.shiftKey ? 10 : 4;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setPos(compare, cur - step); e.preventDefault(); }
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") { setPos(compare, cur + step); e.preventDefault(); }
        else if (e.key === "Home") { setPos(compare, 0); e.preventDefault(); }
        else if (e.key === "End") { setPos(compare, 100); e.preventDefault(); }
      });
      /* prevent the button click from also moving the slider awkwardly */
      grip.addEventListener("pointerdown", function (e) { e.stopPropagation(); dragging = true; });
    });
  }

  /* ---------- Events ---------- */
  chipsWrap.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var t = chip.getAttribute("data-treatment");
    if (t !== current) filterBy(t);
  });

  resetBtn.addEventListener("click", function () { filterBy("all"); });

  /* ---------- Init ---------- */
  render(CASES.slice());
})();
