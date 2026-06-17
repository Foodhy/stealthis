(function () {
  "use strict";

  var TOTAL_LESSONS = 20;

  // ---- Toast helper ----
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function clamp(n) { return Math.max(0, Math.min(100, n)); }

  // ---- Hero ring ----
  var HERO_CIRC = 2 * Math.PI * 52; // r=52
  var heroFill = document.getElementById("heroFill");
  var heroPct = document.getElementById("heroPct");
  var statLessons = document.getElementById("statLessons");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-set]"));
  var heroValue = 0;

  function renderHero(pct) {
    heroValue = clamp(Math.round(pct));
    heroFill.style.strokeDashoffset = HERO_CIRC * (1 - heroValue / 100);
    // count-up the centre number
    animateNumber(heroPct, heroValue, function (v) {
      heroPct.innerHTML = v + '<span class="unit">%</span>';
    });
    var lessons = Math.round((heroValue / 100) * TOTAL_LESSONS);
    statLessons.textContent = lessons + "/" + TOTAL_LESSONS;
    chips.forEach(function (c) {
      c.classList.toggle("active", parseInt(c.dataset.set, 10) === heroValue);
    });
  }

  function animateNumber(el, target, render) {
    var start = parseInt(el.textContent, 10) || 0;
    if (start === target) { render(target); return; }
    var dur = 600, t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      render(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var v = parseInt(chip.dataset.set, 10);
      renderHero(v);
      toast(v === 100 ? "Course complete — nice work!" : "Progress set to " + v + "%");
    });
  });

  document.getElementById("addLesson").addEventListener("click", function () {
    var next = Math.min(100, heroValue + Math.round((1 / TOTAL_LESSONS) * 100) + (heroValue % 5 === 0 ? 0 : 0));
    var lessons = Math.min(TOTAL_LESSONS, Math.round((heroValue / 100) * TOTAL_LESSONS) + 1);
    next = Math.round((lessons / TOTAL_LESSONS) * 100);
    renderHero(next);
    if (lessons >= TOTAL_LESSONS) toast("All " + TOTAL_LESSONS + " lessons done!");
    else toast("Lesson " + lessons + " checked off · +1");
  });

  // ---- XP / level meter ----
  var XP_PER_LEVEL = 2400;
  var xpFill = document.getElementById("xpFill");
  var xpText = document.getElementById("xpText");
  var xpNext = document.getElementById("xpNext");
  var xpLevel = document.getElementById("xpLevel");
  var level = 7;
  var xp = 1850;

  function fmt(n) { return n.toLocaleString("en-US").replace(/,/g, " "); }

  function renderXp() {
    var pct = clamp((xp / XP_PER_LEVEL) * 100);
    xpFill.style.width = pct + "%";
    xpText.textContent = fmt(xp) + " / " + fmt(XP_PER_LEVEL) + " XP";
    xpNext.textContent = fmt(XP_PER_LEVEL - xp) + " XP to Level " + (level + 1);
    xpLevel.textContent = "Lv " + level;
  }

  document.getElementById("earnXp").addEventListener("click", function () {
    xp += 120;
    if (xp >= XP_PER_LEVEL) {
      xp -= XP_PER_LEVEL;
      level += 1;
      renderXp();
      toast("Level up! You reached Level " + level + " 🎉");
      return;
    }
    renderXp();
    toast("+120 XP earned");
  });

  // ---- Module rings ----
  var MODULES = [
    { name: "HTML & Semantics", lessons: 4, done: 4, pct: 100 },
    { name: "CSS Layout", lessons: 5, done: 5, pct: 100 },
    { name: "Flexbox & Grid", lessons: 4, done: 3, pct: 75 },
    { name: "JavaScript Basics", lessons: 4, done: 2, pct: 50 },
    { name: "DOM & Events", lessons: 3, done: 0, pct: 12 }
  ];
  var MR_CIRC = 2 * Math.PI * 23; // r=23

  function colorFor(pct) {
    if (pct >= 100) return "var(--accent)";
    if (pct >= 50) return "var(--brand)";
    return "var(--amber)";
  }

  function buildModules() {
    var grid = document.getElementById("modGrid");
    MODULES.forEach(function (m, i) {
      var col = colorFor(m.pct);
      var pillClass = m.pct >= 100 ? "done-pill" : "in-pill";
      var pillText = m.pct >= 100 ? "Completed" : "In progress";
      var el = document.createElement("article");
      el.className = "mod";
      el.innerHTML =
        '<div class="mod-top">' +
          '<div class="mod-ring">' +
            '<svg viewBox="0 0 56 56" aria-hidden="true">' +
              '<circle class="mr-track" cx="28" cy="28" r="23"></circle>' +
              '<circle class="mr-fill" cx="28" cy="28" r="23" style="stroke:' + col + '"></circle>' +
            '</svg>' +
            '<span class="mr-pct" style="color:' + col + '">' + m.pct + '%</span>' +
          '</div>' +
          '<div class="mod-info">' +
            '<h3>' + m.name + '</h3>' +
            '<div class="meta">Module ' + (i + 1) + ' · ' + m.lessons + ' lessons</div>' +
          '</div>' +
        '</div>' +
        '<div class="mod-bar"><span style="background:' + col + '"></span></div>' +
        '<div class="mod-foot">' +
          '<span class="' + pillClass + '">' + pillText + '</span>' +
          '<span class="lsn">' + m.done + '/' + m.lessons + ' lessons</span>' +
        '</div>';
      grid.appendChild(el);

      // animate in on next frame
      requestAnimationFrame(function () {
        var fill = el.querySelector(".mr-fill");
        var bar = el.querySelector(".mod-bar span");
        setTimeout(function () {
          fill.style.strokeDashoffset = MR_CIRC * (1 - m.pct / 100);
          bar.style.width = m.pct + "%";
        }, 80 + i * 90);
      });
    });
  }

  // ---- Init ----
  buildModules();
  renderXp();
  // kick off hero animation shortly after load
  setTimeout(function () { renderHero(70); }, 200);
})();
