(function () {
  "use strict";

  /* ---------- Data: honest, fictional ---------- */
  // level: 1-5 proficiency  |  years: hands-on experience
  var CATS = {
    design: { label: "Design", className: "design" },
    code: { label: "Code", className: "code" },
    tools: { label: "Tools", className: "tools" },
  };

  var SKILLS = [
    { name: "Product & UX design", cat: "design", level: 5, years: 9, note: "End-to-end flows, IA and prototyping — where I'm most at home." },
    { name: "Design systems", cat: "design", level: 5, years: 6, note: "Tokens, components and docs that scale across teams." },
    { name: "Interaction & motion", cat: "design", level: 4, years: 5, note: "Micro-interactions and transitions that aid comprehension." },
    { name: "Visual & type", cat: "design", level: 4, years: 8, note: "Grids, hierarchy and restrained, legible typography." },
    { name: "User research", cat: "design", level: 3, years: 4, note: "Interviews and usability tests; I lean on partners for stats." },
    { name: "Accessibility (WCAG)", cat: "design", level: 4, years: 5, note: "Contrast, focus order and screen-reader passes baked in early." },

    { name: "HTML & semantic markup", cat: "code", level: 5, years: 10, note: "Accessible, landmark-driven structure by default." },
    { name: "CSS & layout", cat: "code", level: 5, years: 10, note: "Grid, flexbox, custom props and fluid responsive systems." },
    { name: "JavaScript (vanilla)", cat: "code", level: 4, years: 7, note: "Comfortable shipping framework-free interaction." },
    { name: "TypeScript", cat: "code", level: 3, years: 4, note: "Typed components; still leveling up on advanced generics." },
    { name: "React", cat: "code", level: 4, years: 6, note: "Hooks, composition and design-system component work." },
    { name: "Node tooling", cat: "code", level: 3, years: 4, note: "Build scripts and small APIs; not my deepest area." },

    { name: "Figma", cat: "tools", level: 5, years: 7, note: "Auto-layout, variables and component libraries daily." },
    { name: "Git & GitHub", cat: "tools", level: 4, years: 9, note: "Branching, reviews and clean, readable history." },
    { name: "Storybook", cat: "tools", level: 4, years: 5, note: "Component docs and visual regression coverage." },
    { name: "Linear & Jira", cat: "tools", level: 3, years: 6, note: "Planning and triage — a means, not a craft." },
    { name: "Framer", cat: "tools", level: 3, years: 3, note: "High-fidelity prototypes for stakeholder reviews." },
    { name: "Notion", cat: "tools", level: 4, years: 5, note: "Specs, research repos and lightweight handoff." },
  ];

  var LEVEL_LABEL = { 1: "Learning", 2: "Working", 3: "Confident", 4: "Strong", 5: "Expert" };

  /* ---------- Refs ---------- */
  var barsPanel = document.querySelector('[data-view-panel="bars"]');
  var cloudPanel = document.querySelector('[data-view-panel="cloud"]');
  var cloudEl = cloudPanel.querySelector(".cloud");
  var srList = cloudPanel.querySelector(".cloud-sr-list");
  var readout = document.querySelector(".readout");
  var emptyState = document.querySelector(".empty-state");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll(".toggle-btn"));
  var toastEl = document.querySelector(".toast");

  var currentFilter = "all";
  var currentView = "bars";

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 240);
    }, 1900);
  }

  /* ---------- Build dot indicator ---------- */
  function dotsHtml(level) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html += '<i class="' + (i <= level ? "on" : "") + '"></i>';
    }
    return html;
  }

  /* ---------- Render bars view ---------- */
  function renderBars() {
    var order = ["design", "code", "tools"];
    var frag = document.createDocumentFragment();

    order.forEach(function (cat) {
      var items = SKILLS.filter(function (s) { return s.cat === cat; });
      var group = document.createElement("section");
      group.className = "group";
      group.setAttribute("data-cat", cat);

      var head = document.createElement("div");
      head.className = "group-head";
      head.innerHTML =
        '<span class="group-dot"></span>' +
        "<h2>" + CATS[cat].label + "</h2>" +
        '<span class="group-n">' + items.length + " skills</span>";
      group.appendChild(head);

      items.forEach(function (s) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "skill";
        btn.setAttribute("data-cat", cat);
        btn.setAttribute("data-name", s.name);
        var pct = (s.level / 5) * 100;
        btn.setAttribute(
          "aria-label",
          s.name + ", " + LEVEL_LABEL[s.level] + ", " + s.years + " years"
        );
        btn.innerHTML =
          '<span class="skill-top">' +
          '<span class="skill-name">' + s.name + "</span>" +
          '<span class="skill-meta">' + s.years + "y · " + LEVEL_LABEL[s.level] + "</span>" +
          "</span>" +
          '<span class="bar"><span class="bar-fill" data-pct="' + pct + '"></span></span>';
        bindSkill(btn, s);
        group.appendChild(btn);
      });

      frag.appendChild(group);
    });

    barsPanel.innerHTML = "";
    barsPanel.appendChild(frag);
    // animate fills after paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        barsPanel.querySelectorAll(".bar-fill").forEach(function (f) {
          f.style.width = f.getAttribute("data-pct") + "%";
        });
      });
    });
  }

  /* ---------- Render cloud view ---------- */
  function renderCloud() {
    cloudEl.innerHTML = "";
    srList.innerHTML = "";
    // sort by level desc so bigger chips cluster — feels like a cloud
    var sorted = SKILLS.slice().sort(function (a, b) { return b.level - a.level || b.years - a.years; });

    sorted.forEach(function (s, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "cloud-chip";
      chip.setAttribute("data-cat", s.cat);
      chip.setAttribute("data-name", s.name);
      // size scales with level (honest: never identical, capped sensibly)
      var size = 0.82 + (s.level - 1) * 0.13; // 0.82rem .. 1.34rem
      chip.style.fontSize = size.toFixed(2) + "rem";
      chip.style.animationDelay = Math.min(i * 28, 500) + "ms";
      chip.textContent = s.name;
      chip.setAttribute(
        "aria-label",
        s.name + ", " + CATS[s.cat].label + ", " + LEVEL_LABEL[s.level] + ", " + s.years + " years"
      );
      bindSkill(chip, s);
      cloudEl.appendChild(chip);

      var li = document.createElement("li");
      li.textContent = s.name + " — " + CATS[s.cat].label + ", " + LEVEL_LABEL[s.level] + ", " + s.years + " years";
      srList.appendChild(li);
    });
  }

  /* ---------- Skill interaction (hover / focus / click) ---------- */
  function bindSkill(el, skill) {
    var enter = function () { showReadout(skill, el); };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("focus", enter);
    el.addEventListener("mouseleave", clearActive);
    el.addEventListener("blur", clearActive);
    el.addEventListener("click", function () {
      // jump filter to this category for quick exploration
      setFilter(skill.cat);
      toast("Filtered to " + CATS[skill.cat].label);
    });
  }

  function clearActive() {
    document.querySelectorAll(".skill.active, .cloud-chip.active").forEach(function (n) {
      n.classList.remove("active");
    });
  }

  function showReadout(skill, el) {
    clearActive();
    if (el) el.classList.add("active");
    readout.innerHTML =
      '<div class="readout-card">' +
      '<span class="readout-tag" data-cat="' + skill.cat + '">' + CATS[skill.cat].label + "</span>" +
      '<span class="readout-name">' + skill.name + "</span>" +
      '<span class="readout-stats">' +
      "<span><b>" + skill.years + "</b> yrs</span>" +
      "<span><b>" + LEVEL_LABEL[skill.level] + "</b></span>" +
      "</span>" +
      '<span class="readout-note">' + skill.note + "</span>" +
      "</div>";
  }

  function resetReadout() {
    readout.innerHTML = '<span class="readout-default">Hover or focus a skill to see the detail.</span>';
  }

  /* ---------- Filtering ---------- */
  function applyFilter() {
    var anyVisible = false;

    // bars: dim non-matching groups
    barsPanel.querySelectorAll(".group").forEach(function (g) {
      var match = currentFilter === "all" || g.getAttribute("data-cat") === currentFilter;
      g.classList.toggle("dimmed", !match);
      if (match) anyVisible = true;
    });

    // cloud: dim non-matching chips
    cloudEl.querySelectorAll(".cloud-chip").forEach(function (c) {
      var match = currentFilter === "all" || c.getAttribute("data-cat") === currentFilter;
      c.classList.toggle("dimmed", !match);
      if (match) anyVisible = true;
    });

    emptyState.hidden = anyVisible;
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(function (b) {
      var on = b.getAttribute("data-filter") === filter;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    applyFilter();
  }

  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setFilter(b.getAttribute("data-filter"));
    });
  });

  /* ---------- View toggle ---------- */
  function setView(view) {
    currentView = view;
    viewBtns.forEach(function (b) {
      var on = b.getAttribute("data-view") === view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var bars = view === "bars";
    barsPanel.hidden = !bars;
    cloudPanel.hidden = bars;
    resetReadout();
    applyFilter();
    if (bars) {
      requestAnimationFrame(function () {
        barsPanel.querySelectorAll(".bar-fill").forEach(function (f) {
          f.style.width = f.getAttribute("data-pct") + "%";
        });
      });
    }
  }

  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setView(b.getAttribute("data-view"));
    });
  });

  /* ---------- Legend dots (decorative samples) ---------- */
  document.querySelectorAll(".legend .dots").forEach(function (d) {
    var lvl = parseInt(d.getAttribute("data-level"), 10) || 0;
    d.innerHTML = dotsHtml(lvl);
  });

  /* ---------- Init ---------- */
  renderBars();
  renderCloud();
  setFilter("all");
  setView("bars");
})();
