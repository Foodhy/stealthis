(function () {
  "use strict";

  /* ---------- data ---------- */
  var PHASES = {
    prep:  { name: "Preparation", color: "var(--p-prep)" },
    treat: { name: "Treatment",   color: "var(--p-treat)" },
    meas:  { name: "Measurement", color: "var(--p-meas)" },
    ana:   { name: "Analysis",    color: "var(--p-ana)" }
  };

  // mins = wall-clock minutes; active = hands-on minutes
  var STEPS = [
    {
      phase: "prep", status: "done", title: "Synthesise PNIPAM–Au nanocomposite hydrogel",
      mins: 95, active: 40,
      tags: ["NIPAM 1.2 M", "MBAA crosslinker", "HAuCl₄"],
      instr: ["UV reactor λ=365 nm", "N₂ glovebox"],
      desc: "Free-radical polymerisation of N-isopropylacrylamide in the presence of 4 nm citrate-capped gold seeds. Degas under N₂ for 20 min before initiation to suppress O₂ inhibition.",
      params: [
        ["Monomer (NIPAM)", "1.20 mol L⁻¹"],
        ["Crosslinker (MBAA)", "2.0 mol % (rel. NIPAM)"],
        ["Photoinitiator (I-2959)", "0.50 wt %"],
        ["Au seed loading", "0.18 mg mL⁻¹"],
        ["Cure time / dose", "60 min @ 8.0 mW cm⁻²"]
      ]
    },
    {
      phase: "prep", status: "done", title: "Purify & equilibrate gels in PBS",
      mins: 720, active: 25,
      tags: ["PBS pH 7.4", "dialysis MWCO 12 kDa"],
      instr: ["Orbital shaker 60 rpm"],
      desc: "Dialyse against 4 × 2 L PBS over 12 h to remove unreacted monomer and free initiator. Confirm equilibrium swelling gravimetrically before proceeding.",
      params: [
        ["Buffer", "1× PBS, pH 7.40 ± 0.02"],
        ["Exchanges", "4 × (every 3 h)"],
        ["Equilib. swelling ratio Q", "8.6 ± 0.4"],
        ["Temperature", "21.0 °C"]
      ]
    },
    {
      phase: "prep", status: "done", title: "Load model drug (rhodamine-B surrogate)",
      mins: 180, active: 30,
      tags: ["RhB 0.5 mM", "passive soak"],
      instr: ["UV-Vis NanoDrop"],
      desc: "Passive loading by immersion in 0.5 mM rhodamine-B (fluorescein-class surrogate for hydrophilic small-molecule API). Loading capacity quantified by absorbance depletion at 554 nm.",
      params: [
        ["Loading conc.", "0.50 mmol L⁻¹"],
        ["Soak time", "3.0 h"],
        ["λ_abs (RhB)", "554 nm"],
        ["Loading efficiency", "72.4 % ± 3.1"]
      ]
    },
    {
      phase: "treat", status: "active", title: "Apply NIR photothermal trigger",
      mins: 30, active: 30,
      tags: ["λ=808 nm", "1.5 W cm⁻²", "ΔT → 41 °C"],
      instr: ["808 nm diode laser", "IR thermal camera"],
      desc: "Irradiate hydrogel discs to drive plasmonic heating above the lower critical solution temperature (LCST ≈ 32 °C), collapsing the network and expelling loaded drug. Surface temperature tracked at 5 Hz.",
      params: [
        ["Wavelength", "808 nm"],
        ["Power density", "1.50 W cm⁻²"],
        ["Pulse schedule", "5 min ON / 5 min OFF × 3"],
        ["Peak surface T", "41.3 °C"],
        ["LCST (DSC)", "31.8 °C"]
      ],
      eqn: { body: "&Delta;C/C&#8320; = 1 &minus; e<sup class='num'>&minus;k t</sup>", k: "k = 0.038 min⁻¹", no: "(1)" }
    },
    {
      phase: "treat", status: "pending", title: "Sham (no-NIR) control hold",
      mins: 30, active: 5,
      tags: ["dark control", "37 °C bath"],
      instr: ["Thermostatic bath"],
      desc: "Matched control discs held at body temperature without irradiation to isolate passive diffusion from triggered release. Identical sampling cadence.",
      params: [
        ["Bath temperature", "37.0 °C"],
        ["Irradiation", "none (n = 12)"],
        ["Sampling cadence", "every 5 min"]
      ]
    },
    {
      phase: "meas", status: "pending", title: "Sample release supernatant (kinetics)",
      mins: 40, active: 35,
      tags: ["aliquot 100 µL", "t = 0–35 min"],
      instr: ["Microplate reader", "96-well plate"],
      desc: "Withdraw 100 µL aliquots at fixed intervals, replacing with fresh PBS to maintain sink conditions. Quantify cumulative release fluorometrically.",
      params: [
        ["Aliquot volume", "100 µL"],
        ["Time points", "0,2,5,10,15,20,30,35 min"],
        ["λ_ex / λ_em", "554 / 576 nm"],
        ["Sink correction", "applied (replacement)"]
      ]
    },
    {
      phase: "meas", status: "pending", title: "Rheology & swelling re-measurement",
      mins: 55, active: 45,
      tags: ["G′ / G″", "frequency sweep"],
      instr: ["Rheometer 20 mm plate", "Analytical balance"],
      desc: "Oscillatory frequency sweep (0.1–10 Hz) at 1 % strain to capture network stiffening post-collapse; re-weigh discs to compute deswelling ratio.",
      params: [
        ["Geometry", "20 mm parallel plate"],
        ["Strain (LVR)", "1.0 %"],
        ["Frequency range", "0.1 – 10 Hz"],
        ["G′ (1 Hz, post-NIR)", "4.7 kPa"],
        ["Deswelling ratio", "0.41"]
      ]
    },
    {
      phase: "ana", status: "pending", title: "Fit release kinetics (Korsmeyer–Peppas)",
      mins: 60, active: 30,
      tags: ["n exponent", "R² ≥ 0.98"],
      instr: ["Python 3.12 / SciPy"],
      desc: "Non-linear least-squares fit of fractional release to the Korsmeyer–Peppas power law; the diffusional exponent n classifies transport regime (Fickian vs anomalous).",
      params: [
        ["Model", "Mₜ/M∞ = k·tⁿ"],
        ["n (NIR group)", "0.62 ± 0.04"],
        ["k", "0.21 min⁻ⁿ"],
        ["R²", "0.991"],
        ["Software", "SciPy 1.13 curve_fit"]
      ],
      eqn: { body: "M&#8348;/M&#8734; = <span class='op'>k</span> &middot; t<sup class='num'>n</sup>", k: "n = 0.62 (anomalous)", no: "(2)" }
    },
    {
      phase: "ana", status: "pending", title: "Statistics & figure export",
      mins: 45, active: 25,
      tags: ["two-way ANOVA", "α = 0.05"],
      instr: ["JASP 0.19", "Matplotlib"],
      desc: "Two-way ANOVA (trigger × time) with Holm–Bonferroni correction; export publication figures at 600 dpi. Pre-registered primary endpoint: 30-min cumulative release.",
      params: [
        ["Test", "2-way ANOVA + Holm"],
        ["α", "0.05"],
        ["Effect (NIR vs sham, 30 min)", "p = 0.003"],
        ["Cohen's d", "1.42"],
        ["Export DPI", "600"]
      ]
    }
  ];

  /* ---------- helpers ---------- */
  var track = document.getElementById("track");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function fmtDur(m) {
    if (m < 60) return m + " min";
    var h = Math.floor(m / 60), mm = m % 60;
    return h + " h" + (mm ? " " + String(mm).padStart(2, "0") + " min" : "");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------- render ---------- */
  function paramRows(rows) {
    return rows.map(function (r) {
      return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>";
    }).join("");
  }

  function render() {
    var html = "";
    var lastPhase = null;
    STEPS.forEach(function (s, i) {
      if (s.phase !== lastPhase) {
        lastPhase = s.phase;
        var ph = PHASES[s.phase];
        var phaseSteps = STEPS.filter(function (x) { return x.phase === s.phase; });
        var phaseMins = phaseSteps.reduce(function (a, x) { return a + x.mins; }, 0);
        html +=
          '<li class="phase-head" data-phase="' + s.phase + '" style="color:' + ph.color + '">' +
            '<span class="phase-head__dot"></span>' +
            '<span class="phase-head__name">' + ph.name + '</span>' +
            '<span class="phase-head__meta">' + phaseSteps.length + ' steps · ' + fmtDur(phaseMins) + '</span>' +
          "</li>";
      }

      var no = i + 1;
      var tags = s.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
      var instr = s.instr.map(function (t) {
        return '<span class="tag tag--instr">⚙ ' + esc(t) + "</span>";
      }).join("");

      var eqn = "";
      if (s.eqn) {
        eqn =
          '<div class="eqn"><div class="eqn__body">' + s.eqn.body +
          ' <span class="mono" style="font-size:12px;color:var(--muted)">&nbsp;&nbsp;' + esc(s.eqn.k) + "</span></div>" +
          '<div class="eqn__no">' + s.eqn.no + "</div></div>";
      }

      html +=
        '<li class="step" data-phase="' + s.phase + '" data-status="' + s.status + '" data-idx="' + i + '">' +
          '<span class="step__dot"></span>' +
          '<div class="step__card">' +
            '<button class="step__head" aria-expanded="false" id="head-' + i + '" aria-controls="body-' + i + '">' +
              '<span class="step__no">' + no + "</span>" +
              '<span class="step__titlewrap">' +
                '<span class="step__title">' + esc(s.title) + "</span>" +
                '<span class="step__tags">' + tags + instr + "</span>" +
              "</span>" +
              '<span class="step__right">' +
                '<span class="step__dur">' + fmtDur(s.mins) + '<small>' + fmtDur(s.active) + ' hands-on</small></span>' +
                '<span class="step__caret" aria-hidden="true">▾</span>' +
              "</span>" +
            "</button>" +
            '<div class="step__detail"><div class="step__detail-inner"><div class="step__body" id="body-' + i + '" role="region" aria-labelledby="head-' + i + '">' +
              '<p class="step__desc">' + esc(s.desc) + "</p>" +
              '<table class="params"><caption>Recorded parameters</caption><tbody>' + paramRows(s.params) + "</tbody></table>" +
              eqn +
            "</div></div></div>" +
          "</div>" +
        "</li>";
    });
    track.innerHTML = html;
    bindSteps();
    renderPhaseBar();
    updateProgress();
  }

  function bindSteps() {
    track.querySelectorAll(".step__head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = btn.closest(".step");
        var open = step.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ---------- phase bar figure ---------- */
  function renderPhaseBar() {
    var bar = document.getElementById("phasebar");
    var total = STEPS.reduce(function (a, s) { return a + s.mins; }, 0);
    var byPhase = {};
    STEPS.forEach(function (s) {
      if (!byPhase[s.phase]) byPhase[s.phase] = { mins: 0, idle: 0 };
      byPhase[s.phase].mins += s.mins;
      byPhase[s.phase].idle += (s.mins - s.active);
    });
    var html = "";
    Object.keys(PHASES).forEach(function (key) {
      var d = byPhase[key];
      if (!d) return;
      var ph = PHASES[key];
      var pct = (d.mins / total) * 100;
      var idlePct = d.mins ? Math.round((d.idle / d.mins) * 100) : 0;
      html +=
        '<div class="phaseseg' + (idlePct > 50 ? " phaseseg--idle" : "") +
        '" style="width:' + pct.toFixed(2) + "%;background:" + ph.color +
        '" title="' + ph.name + " — " + fmtDur(d.mins) + " (" + pct.toFixed(0) + "% of run, " + idlePct + '% idle)">' +
        (pct > 8 ? ph.name : "") + "</div>";
    });
    bar.innerHTML = html;
  }

  /* ---------- progress ---------- */
  function updateProgress() {
    var steps = STEPS;
    var done = steps.filter(function (s) { return s.status === "done"; }).length;
    var pct = Math.round((done / steps.length) * 100);
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-pct").textContent = pct + "%";

    track.querySelectorAll(".step").forEach(function (el) {
      var idx = +el.dataset.idx;
      el.dataset.status = steps[idx].status;
      el.classList.toggle("is-current", steps[idx].status === "active");
    });
  }

  /* ---------- filtering ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("chip--active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("chip--active");
      chip.setAttribute("aria-pressed", "true");
      var phase = chip.dataset.phase;
      track.querySelectorAll(".step").forEach(function (el) {
        el.classList.toggle("is-hidden", phase !== "all" && el.dataset.phase !== phase);
      });
      track.querySelectorAll(".phase-head").forEach(function (el) {
        el.style.display = (phase === "all" || el.dataset.phase === phase) ? "" : "none";
      });
    });
  });

  /* ---------- expand all ---------- */
  var expandBtn = document.getElementById("expand-all");
  var allOpen = false;
  expandBtn.addEventListener("click", function () {
    allOpen = !allOpen;
    track.querySelectorAll(".step").forEach(function (el) {
      el.classList.toggle("is-open", allOpen);
      var head = el.querySelector(".step__head");
      if (head) head.setAttribute("aria-expanded", allOpen ? "true" : "false");
    });
    expandBtn.textContent = allOpen ? "Collapse all" : "Expand all";
  });

  /* ---------- play / reset ---------- */
  var playBtn = document.getElementById("play");
  var playLabel = document.getElementById("play-label");
  var resetBtn = document.getElementById("reset");
  var playing = false;
  var playIdx = 0;
  var playTimer;

  function setAllPending() {
    STEPS.forEach(function (s) { s.status = "pending"; });
    updateProgress();
  }

  function stopPlay() {
    playing = false;
    clearTimeout(playTimer);
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.querySelector(".btn__icon").textContent = "▶";
    playLabel.textContent = "Play protocol";
  }

  function advance() {
    if (playIdx >= STEPS.length) {
      STEPS[STEPS.length - 1].status = "done";
      updateProgress();
      stopPlay();
      toast("Protocol complete — all 9 steps logged.");
      return;
    }
    // mark previous done
    if (playIdx > 0) STEPS[playIdx - 1].status = "done";
    STEPS[playIdx].status = "active";
    updateProgress();

    var current = track.querySelector('.step[data-idx="' + playIdx + '"]');
    if (current) current.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Step " + (playIdx + 1) + ": " + STEPS[playIdx].title);

    playIdx++;
    playTimer = setTimeout(advance, 1400);
  }

  playBtn.addEventListener("click", function () {
    if (playing) {
      stopPlay();
      return;
    }
    playing = true;
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.querySelector(".btn__icon").textContent = "❚❚";
    playLabel.textContent = "Pause";
    if (playIdx >= STEPS.length) playIdx = 0;
    if (playIdx === 0) setAllPending();
    advance();
  });

  resetBtn.addEventListener("click", function () {
    stopPlay();
    playIdx = 0;
    // restore original statuses (first 3 done, step 4 active)
    STEPS.forEach(function (s, i) {
      s.status = i < 3 ? "done" : (i === 3 ? "active" : "pending");
    });
    updateProgress();
    toast("Timeline reset to recorded state.");
  });

  /* ---------- init ---------- */
  render();
})();
