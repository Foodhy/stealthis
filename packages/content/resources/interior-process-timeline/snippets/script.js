(function () {
  "use strict";

  var STEPS = [
    {
      phase: "Phase 01",
      title: "Discovery",
      duration: "1–2 weeks",
      desc: "We begin with a home visit and a long conversation about how you actually live. We measure the space, photograph every wall, and build a brief around your routines, your budget, and the feeling you want to walk into each day.",
      deliverables: ["Site survey & measurements", "Client questionnaire & brief", "Budget framework", "Signed letter of engagement"]
    },
    {
      phase: "Phase 02",
      title: "Concept",
      duration: "2–3 weeks",
      desc: "A direction takes shape. We present a curated mood board, a rough spatial plan, and a material story — warm oak, unlacquered brass, plaster, and linen — so we agree on the mood before a single item is specified.",
      deliverables: ["Mood boards & palette", "Preliminary floor plan", "Material direction", "Concept presentation"]
    },
    {
      phase: "Phase 03",
      title: "Design Development",
      duration: "4–6 weeks",
      desc: "We resolve the details. Furniture layouts, joinery drawings, lighting schemes, and finish schedules are drawn to scale and pressure-tested against your budget, then walked through with you room by room.",
      deliverables: ["Scaled layouts & elevations", "Lighting & electrical plan", "Joinery & millwork drawings", "Finish & fixture schedule"]
    },
    {
      phase: "Phase 04",
      title: "Sourcing",
      duration: "4–8 weeks",
      desc: "Now we procure. Every piece is ordered, tracked, and quality-checked as it arrives at our receiving warehouse. Custom upholstery and cabinetry are commissioned with our trusted makers and inspected before delivery.",
      deliverables: ["Purchase orders placed", "Lead-time tracking", "Warehouse receiving & QC", "Delivery scheduling"]
    },
    {
      phase: "Phase 05",
      title: "Installation",
      duration: "3–5 days",
      desc: "Installation day. Our team places every piece, hangs the art, dresses the beds, and styles the shelves down to the last stack of books — then we do the final walkthrough and hand you the keys to a finished home.",
      deliverables: ["White-glove delivery & placement", "Art hanging & styling", "Snag list & touch-ups", "Final walkthrough & handover"]
    }
  ];

  var CHECK = '<svg class="marker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  var timeline = document.getElementById("timeline");
  var progressBar = document.getElementById("progressBar");
  var progressPct = document.getElementById("progressPct");
  var phaseNum = document.getElementById("phaseNum");
  var phaseName = document.getElementById("phaseName");
  var compactBtn = document.getElementById("compactBtn");
  var resetBtn = document.getElementById("resetBtn");
  var toastEl = document.getElementById("toast");

  var active = 0;
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function render() {
    STEPS.forEach(function (s, i) {
      var li = document.createElement("li");
      li.className = "step";
      li.dataset.index = String(i);

      var deliverables = s.deliverables
        .map(function (d) {
          return "<li>" + d + "</li>";
        })
        .join("");

      li.innerHTML =
        '<span class="connector" aria-hidden="true"></span>' +
        '<button class="marker" type="button" aria-expanded="false" aria-controls="body-' + i + '" ' +
        'aria-label="Step ' + (i + 1) + ": " + s.title + '">' +
        '<span class="marker__num">' + (i + 1) + "</span>" + CHECK +
        "</button>" +
        '<article class="card">' +
        '<div class="card__head">' +
        "<div>" +
        '<span class="card__phase">' + s.phase + "</span>" +
        '<h2 class="card__title">' + s.title + "</h2>" +
        "</div>" +
        '<span class="badge">' + s.duration + "</span>" +
        "</div>" +
        '<div class="card__body" id="body-' + i + '">' +
        '<p class="card__desc">' + s.desc + "</p>" +
        '<ul class="deliverables">' + deliverables + "</ul>" +
        "</div>" +
        "</article>";

      timeline.appendChild(li);
    });

    timeline.querySelectorAll(".marker").forEach(function (m) {
      m.addEventListener("click", function () {
        var idx = parseInt(m.closest(".step").dataset.index, 10);
        setActive(idx, true);
      });
    });
  }

  function setActive(idx, announce) {
    active = idx;
    var steps = timeline.querySelectorAll(".step");
    steps.forEach(function (li, i) {
      li.classList.toggle("step--active", i === idx);
      li.classList.toggle("step--done", i < idx);
      var marker = li.querySelector(".marker");
      marker.setAttribute("aria-expanded", i === idx ? "true" : "false");
    });

    var pct = Math.round(((idx + 1) / STEPS.length) * 100);
    progressBar.style.width = pct + "%";
    progressPct.textContent = pct + "%";
    phaseNum.textContent = idx + 1;
    phaseName.textContent = STEPS[idx].title;

    if (announce) {
      var activeStep = steps[idx];
      if (activeStep.scrollIntoView) {
        activeStep.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      toast("Phase " + (idx + 1) + " — " + STEPS[idx].title);
    }
  }

  compactBtn.addEventListener("click", function () {
    var on = timeline.classList.toggle("is-compact");
    compactBtn.setAttribute("aria-pressed", on ? "true" : "false");
    compactBtn.textContent = on ? "Detailed view" : "Compact view";
    toast(on ? "Compact overview" : "Detailed view");
  });

  resetBtn.addEventListener("click", function () {
    if (timeline.classList.contains("is-compact")) {
      timeline.classList.remove("is-compact");
      compactBtn.setAttribute("aria-pressed", "false");
      compactBtn.textContent = "Compact view";
    }
    setActive(0, false);
    timeline.querySelector(".step").scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Timeline reset");
  });

  render();
  setActive(0, false);
})();
