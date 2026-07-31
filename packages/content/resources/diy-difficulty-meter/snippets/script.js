/* DIY — Difficulty Meter
   Presets swap the data set; the dial arc + criterion blocks animate on every change. */

(function () {
  "use strict";

  // ---------- Data ----------
  var PRESETS = {
    phone: {
      device: "PX-7 FAIRBIT · 2025 REV B",
      score: 9,
      verdict: "Repairable — grab a spudger",
      time: "EST. REPAIR TIME: 25 MIN",
      tools: "TOOLS: PH00 + SPUDGER",
      criteria: [
        { label: "Opening ease", score: 5 },
        { label: "Fasteners", score: 5 },
        { label: "Modularity", score: 4 },
        { label: "Part availability", score: 5 },
        { label: "Docs & guides", score: 4 }
      ]
    },
    laptop: {
      device: "NB-14 CRAFTBOOK · 2024",
      score: 6,
      verdict: "Repairable with patience",
      time: "EST. REPAIR TIME: 1 H 40 MIN",
      tools: "TOOLS: T5 TORX + PRY PICKS",
      criteria: [
        { label: "Opening ease", score: 4 },
        { label: "Fasteners", score: 3 },
        { label: "Modularity", score: 3 },
        { label: "Part availability", score: 3 },
        { label: "Docs & guides", score: 2 }
      ]
    },
    tablet: {
      device: "TB-11 SEALDECK · 2025",
      score: 2,
      verdict: "Glued shut — heat gun territory",
      time: "EST. REPAIR TIME: 3 H+ (RISKY)",
      tools: "TOOLS: HEAT GUN + SUCTION CUPS",
      criteria: [
        { label: "Opening ease", score: 1 },
        { label: "Fasteners", score: 1 },
        { label: "Modularity", score: 2 },
        { label: "Part availability", score: 2 },
        { label: "Docs & guides", score: 1 }
      ]
    }
  };

  var VERDICT_PILL = {
    easy: "Repairable",
    moderate: "Fixable",
    hard: "Hostile"
  };

  // ---------- Elements ----------
  var dialFill = document.getElementById("dial-fill");
  var dialTicks = document.getElementById("dial-ticks");
  var dialScore = document.getElementById("dial-score");
  var dialVerdict = document.getElementById("dial-verdict");
  var verdictPill = document.getElementById("verdict-pill");
  var meterDevice = document.getElementById("meter-device");
  var criteriaList = document.getElementById("criteria-list");
  var footNote = document.getElementById("foot-note");
  var footTools = document.getElementById("foot-tools");
  var toastEl = document.getElementById("toast");
  var presetBtns = Array.prototype.slice.call(
    document.querySelectorAll(".preset-btn")
  );

  var ARC_LEN = dialFill.getTotalLength(); // semicircle path length
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dialFill.style.strokeDasharray = ARC_LEN + " " + ARC_LEN;
  dialFill.style.strokeDashoffset = ARC_LEN;

  // ---------- Helpers ----------
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  function tierFor10(score) {
    if (score >= 7) return "easy";
    if (score >= 4) return "moderate";
    return "hard";
  }

  function tierFor5(score) {
    if (score >= 4) return "ok";
    if (score >= 3) return "warn";
    return "danger";
  }

  function colorForTier(tier) {
    var styles = getComputedStyle(document.documentElement);
    if (tier === "easy") return styles.getPropertyValue("--ok").trim();
    if (tier === "moderate") return styles.getPropertyValue("--warn").trim();
    return styles.getPropertyValue("--danger").trim();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ---------- Dial ticks (11 marks, 0..10) ----------
  (function buildTicks() {
    var cx = 100, cy = 110, rOuter = 96, rInner = 90;
    for (var i = 0; i <= 10; i++) {
      var angle = Math.PI - (Math.PI * i) / 10; // 180° → 0°
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (cx + rInner * Math.cos(angle)).toFixed(2));
      line.setAttribute("y1", (cy - rInner * Math.sin(angle)).toFixed(2));
      line.setAttribute("x2", (cx + rOuter * Math.cos(angle)).toFixed(2));
      line.setAttribute("y2", (cy - rOuter * Math.sin(angle)).toFixed(2));
      dialTicks.appendChild(line);
    }
  })();

  // ---------- Dial animation ----------
  var dialAnim = null;
  function animateDial(targetScore) {
    if (dialAnim) cancelAnimationFrame(dialAnim);

    var fromOffset = parseFloat(dialFill.style.strokeDashoffset) || ARC_LEN;
    var fromScore = parseInt(dialScore.textContent, 10) || 0;
    var toOffset = ARC_LEN * (1 - targetScore / 10);
    var duration = reduceMotion ? 0 : 900;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var t = duration === 0 ? 1 : Math.min((ts - start) / duration, 1);
      var e = easeOutCubic(t);

      dialFill.style.strokeDashoffset =
        fromOffset + (toOffset - fromOffset) * e;
      dialScore.textContent = Math.round(
        fromScore + (targetScore - fromScore) * e
      );

      if (t < 1) {
        dialAnim = requestAnimationFrame(frame);
      } else {
        dialAnim = null;
      }
    }
    dialAnim = requestAnimationFrame(frame);
  }

  // ---------- Criteria rows ----------
  function renderCriteria(criteria) {
    criteriaList.innerHTML = "";
    criteria.forEach(function (crit, rowIdx) {
      var row = document.createElement("div");
      row.className = "crit-row";
      row.setAttribute("data-tier", tierFor5(crit.score));

      var label = document.createElement("span");
      label.className = "crit-label";
      label.textContent = crit.label;

      var blocks = document.createElement("div");
      blocks.className = "crit-blocks";
      blocks.setAttribute("role", "img");
      blocks.setAttribute(
        "aria-label",
        crit.label + ": " + crit.score + " out of 5"
      );

      for (var i = 0; i < 5; i++) {
        var block = document.createElement("span");
        block.className = "crit-block";
        if (i < crit.score) {
          if (reduceMotion) {
            block.classList.add("is-filled");
          } else {
            // stagger: rows cascade, blocks within a row cascade faster
            (function (b, delay) {
              setTimeout(function () {
                b.classList.add("is-filled");
              }, delay);
            })(block, 120 + rowIdx * 90 + i * 55);
          }
        }
        blocks.appendChild(block);
      }

      var score = document.createElement("span");
      score.className = "crit-score mono";
      score.textContent = crit.score + "/5";

      row.appendChild(label);
      row.appendChild(blocks);
      row.appendChild(score);
      criteriaList.appendChild(row);
    });
  }

  // ---------- Preset switching ----------
  function applyPreset(key, opts) {
    var data = PRESETS[key];
    if (!data) return;

    var tier = tierFor10(data.score);

    // text swaps with a light fade
    [meterDevice, dialVerdict, footNote, footTools].forEach(function (el) {
      el.style.opacity = "0";
    });
    setTimeout(function () {
      meterDevice.textContent = data.device;
      dialVerdict.textContent = data.score + " — " + data.verdict;
      footNote.textContent = data.time;
      footTools.textContent = data.tools;
      [meterDevice, dialVerdict, footNote, footTools].forEach(function (el) {
        el.style.opacity = "1";
      });
    }, reduceMotion ? 0 : 180);

    verdictPill.setAttribute("data-tier", tier);
    verdictPill.textContent = VERDICT_PILL[tier];
    dialFill.style.stroke = colorForTier(tier);

    animateDial(data.score);
    renderCriteria(data.criteria);

    presetBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-preset") === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (!opts || !opts.silent) {
      toast("LOADED PROFILE: " + data.device.split(" · ")[0]);
    }
  }

  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      applyPreset(btn.getAttribute("data-preset"));
    });
  });

  // ---------- Wrench ratings ----------
  var WRENCH_PATH =
    "M21.7 6.9a.5.5 0 0 0-.8-.2l-2.9 2.9-2.6-.5-.5-2.6 2.9-2.9a.5.5 0 0 0-.2-.8 5.9 5.9 0 0 0-6.4 1.3 5.9 5.9 0 0 0-1.4 6.2L2.5 17.6a2.4 2.4 0 0 0 0 3.4l.5.5a2.4 2.4 0 0 0 3.4 0l7.3-7.3a5.9 5.9 0 0 0 6.2-1.4 5.9 5.9 0 0 0 1.8-5.9z";

  function wrenchSvg(on) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", on ? "is-on" : "is-off");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", WRENCH_PATH);
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    return svg;
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".wrench-set"),
    function (set) {
      var rating = parseInt(set.getAttribute("data-rating"), 10) || 0;
      for (var i = 1; i <= 5; i++) {
        set.appendChild(wrenchSvg(i <= rating));
      }
    }
  );

  // ---------- Boot ----------
  applyPreset("phone", { silent: true });
})();
