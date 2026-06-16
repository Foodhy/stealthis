/* ===== Flowdesk landing — vanilla JS ===== */
(function () {
  "use strict";

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("open", !open);
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("open");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---- Mockup view templates ---- */
  var AV = {
    JK: "#7c5cff", MR: "#e36bb0", DT: "#4f8af0", LS: "#16a34a", PN: "#d97706"
  };
  function avatar(initials, size) {
    return '<span class="' + (size || "cm-avatar") + '" style="background:' + (AV[initials] || "#4f8af0") + '">' + initials + "</span>";
  }

  var views = {
    board: {
      title: "Q3 Launch Board",
      label: "Kanban board",
      html:
        '<div class="board-cols">' +
          '<div class="board-col"><h5>To do <span class="cnt">2</span></h5>' +
            '<div class="card-mini"><span class="cm-tag tag-design">Design</span><p>Refine onboarding flow</p><div class="cm-foot">' + avatar("MR") + '<span class="cm-bar"><i style="width:20%"></i></span></div></div>' +
            '<div class="card-mini"><span class="cm-tag tag-ops">Ops</span><p>Draft launch checklist</p><div class="cm-foot">' + avatar("PN") + '<span class="cm-bar"><i style="width:10%"></i></span></div></div>' +
          '</div>' +
          '<div class="board-col"><h5>In progress <span class="cnt">2</span></h5>' +
            '<div class="card-mini"><span class="cm-tag tag-eng">Eng</span><p>Build async standups</p><div class="cm-foot">' + avatar("DT") + '<span class="cm-bar"><i style="width:65%"></i></span></div></div>' +
            '<div class="card-mini"><span class="cm-tag tag-design">Design</span><p>Marketing site polish</p><div class="cm-foot">' + avatar("LS") + '<span class="cm-bar"><i style="width:48%"></i></span></div></div>' +
          '</div>' +
          '<div class="board-col"><h5>Done <span class="cnt">1</span></h5>' +
            '<div class="card-mini"><span class="cm-tag tag-eng">Eng</span><p>Set up CI pipeline</p><div class="cm-foot">' + avatar("JK") + '<span class="cm-bar"><i style="width:100%"></i></span></div></div>' +
          '</div>' +
        '</div>'
    },
    list: {
      title: "All tasks · Q3",
      label: "Task list",
      html:
        '<div class="list-rows">' +
          row(true, "Set up CI pipeline", "done", "Done", "JK") +
          row(false, "Build async standups", "prog", "In progress", "DT") +
          row(false, "Marketing site polish", "prog", "In progress", "LS") +
          row(false, "Refine onboarding flow", "todo", "To do", "MR") +
          row(false, "Draft launch checklist", "todo", "To do", "PN") +
        '</div>'
    },
    timeline: {
      title: "Roadmap · Aug–Sep",
      label: "Timeline",
      html:
        '<div class="timeline">' +
          track("Discovery", 0, 35, "#7c5cff") +
          track("Design", 18, 40, "#e36bb0") +
          track("Engineering", 40, 55, "#4f8af0") +
          track("Beta", 70, 28, "#16a34a") +
        '</div>'
    },
    docs: {
      title: "Launch plan.doc",
      label: "Docs",
      html:
        '<div class="docs-view">' +
          '<h4>Q3 Launch Plan</h4>' +
          '<p class="docs-meta">' + avatar("MR", "lr-avatar") + ' Edited by Mara · 2h ago</p>' +
          '<div class="docs-line w90"></div><div class="docs-line w75"></div><div class="docs-line w60"></div>' +
          '<div class="docs-callout">🎯 Goal: ship the async standups beta to 50 teams by Sep 30.</div>' +
          '<div class="docs-check"><span class="box">✓</span> Finalize pricing tiers</div>' +
          '<div class="docs-check"><span class="box">✓</span> Brief the support team</div>' +
          '<div class="docs-line w75" style="margin-top:10px"></div><div class="docs-line w90"></div>' +
        '</div>'
    }
  };

  function row(done, title, pillCls, pillTxt, av) {
    return '<div class="list-row">' +
      '<span class="lr-check ' + (done ? "done" : "") + '"></span>' +
      '<span class="lr-title ' + (done ? "done" : "") + '">' + title + '</span>' +
      '<span class="lr-pill pill-' + pillCls + '">' + pillTxt + '</span>' +
      avatar(av, "lr-avatar") +
    '</div>';
  }
  function track(name, start, width, color) {
    return '<div class="tl-track-head"><span class="tl-name">' + name + '</span>' +
      '<span class="tl-grid"><span class="tl-bar" style="left:' + start + '%;width:' + width + '%;background:' + color + '">' + width + '%</span></span></div>';
  }

  var mockBody = document.getElementById("mock-body");
  var mockTitle = document.getElementById("mock-title");
  var ucCurrent = document.getElementById("uc-current");

  function setView(key) {
    var v = views[key];
    if (!v || !mockBody) return;
    mockBody.style.opacity = "0";
    setTimeout(function () {
      mockBody.innerHTML = v.html;
      if (mockTitle) mockTitle.textContent = v.title;
      if (ucCurrent) ucCurrent.textContent = "Showing: " + v.label;
      mockBody.style.opacity = "1";
    }, 140);
  }
  if (mockBody) {
    mockBody.style.transition = "opacity .2s ease";
    setView("board");
  }

  /* ---- Use-case tabs ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".uc-tab"));
  function activate(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    setView(tab.dataset.view);
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      activate(next);
    });
  });

  /* ---- Email forms ---- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function wireForm(id) {
    var form = document.getElementById(id);
    if (!form) return;
    var input = form.querySelector("input[type=email]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (!isEmail(val)) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
        toast("Please enter a valid work email.");
        return;
      }
      input.removeAttribute("aria-invalid");
      input.value = "";
      toast("🎉 You're in! Check " + val + " to set up your workspace.");
    });
    if (input) {
      input.addEventListener("input", function () { input.removeAttribute("aria-invalid"); });
    }
  }
  wireForm("hero-form");
  wireForm("cta-form");

  /* ---- Scroll reveal ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
