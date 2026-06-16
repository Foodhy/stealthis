(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var dark = theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.querySelector(".theme-ico").textContent = dark ? "☀️" : "🌙";
    themeBtn.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";
  }
  var stored = null;
  try { stored = localStorage.getItem("cadence-theme"); } catch (e) {}
  applyTheme(stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("cadence-theme", next); } catch (e) {}
  });

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Scrollspy ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".spy-list a[data-spy]"));
  var spyTargets = spyLinks
    .map(function (l) { return document.getElementById(l.getAttribute("data-spy")); })
    .filter(Boolean);

  function setActiveSpy(id) {
    spyLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("data-spy") === id);
    });
  }

  if ("IntersectionObserver" in window && spyTargets.length) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      // pick the most-visible section
      var best = null, bestRatio = 0;
      spyTargets.forEach(function (t) {
        var r = visible[t.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = t.id; }
      });
      if (best) setActiveSpy(best);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] });
    spyTargets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- Automation tabs (swap mock) ---------- */
  var FLOWS = {
    route: {
      title: "Rule · Smart routing",
      nodes: [
        { cls: "fn-trigger", ico: "📥", t: "When an issue is created", s: "Trigger" },
        { cls: "fn-cond", ico: "🔀", t: "If label is “billing”", s: "Condition" },
        { cls: "fn-action", ico: "🎯", t: "Assign to Payments squad", s: "Action" }
      ]
    },
    notify: {
      title: "Rule · Notifications",
      nodes: [
        { cls: "fn-trigger", ico: "🔔", t: "When status → In review", s: "Trigger" },
        { cls: "fn-cond", ico: "🕘", t: "Unless it’s quiet hours", s: "Condition" },
        { cls: "fn-action", ico: "💬", t: "Post to #eng-reviews", s: "Action" }
      ]
    },
    sla: {
      title: "Rule · SLA guardrails",
      nodes: [
        { cls: "fn-trigger", ico: "⏱️", t: "When due in < 4 hours", s: "Trigger" },
        { cls: "fn-cond", ico: "🚧", t: "If still unassigned", s: "Condition" },
        { cls: "fn-action", ico: "🚨", t: "Escalate + log breach", s: "Action" }
      ]
    }
  };

  var flowEl = document.getElementById("flow");
  var flowTitle = document.getElementById("flowTitle");

  function renderFlow(key) {
    var spec = FLOWS[key] || FLOWS.route;
    if (flowTitle) flowTitle.textContent = spec.title;
    var html = "";
    spec.nodes.forEach(function (n, i) {
      html +=
        '<div class="flow-node ' + n.cls + '">' +
          '<span class="fn-ico" aria-hidden="true">' + n.ico + "</span>" +
          "<span>" + n.t + "<small>" + n.s + "</small></span>" +
        "</div>";
      if (i < spec.nodes.length - 1) html += '<div class="flow-arrow" aria-hidden="true">↓</div>';
    });
    flowEl.innerHTML = html;
  }
  renderFlow("route");

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      }
    });
    renderFlow(tab.getAttribute("data-mock"));
  }
  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(idx + dir + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- CTA form ---------- */
  var form = document.getElementById("ctaForm");
  var input = document.getElementById("email");
  var note = document.getElementById("ctaNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = input.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      input.classList.add("invalid");
      note.classList.add("err");
      note.textContent = "Please enter a valid work email.";
      input.focus();
      return;
    }
    input.classList.remove("invalid");
    note.classList.remove("err");
    note.textContent = "Trial ready — check " + val + " to confirm.";
    toast("Welcome aboard! 14-day trial started.");
    form.reset();
  });
  input.addEventListener("input", function () {
    if (input.classList.contains("invalid")) {
      input.classList.remove("invalid");
      note.textContent = "";
      note.classList.remove("err");
    }
  });
})();
