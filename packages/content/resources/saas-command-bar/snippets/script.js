(function () {
  "use strict";

  // ---------- Command registry ----------
  // group, title, subtitle, icon (emoji), keywords, shortcut keys, action
  var COMMANDS = [
    // Navigation
    { id: "nav-dashboard", group: "Navigation", title: "Go to Dashboard", sub: "Overview & metrics", icon: "📊", keys: ["G", "D"], kw: "home overview metrics" },
    { id: "nav-customers", group: "Navigation", title: "Go to Customers", sub: "Accounts & seats", icon: "👥", keys: ["G", "C"], kw: "accounts users people" },
    { id: "nav-billing", group: "Navigation", title: "Go to Billing", sub: "Plans, invoices, usage", icon: "💳", keys: ["G", "B"], kw: "invoices payments plan subscription" },
    { id: "nav-analytics", group: "Navigation", title: "Go to Analytics", sub: "Funnels & retention", icon: "📈", keys: ["G", "A"], kw: "reports charts funnel retention" },
    { id: "nav-integrations", group: "Navigation", title: "Go to Integrations", sub: "Webhooks & API keys", icon: "🔌", keys: ["G", "I"], kw: "api webhooks connections" },

    // Actions
    { id: "act-invite", group: "Actions", title: "Invite teammate", sub: "Send a seat invitation", icon: "✉️", keys: ["⌘", "I"], kw: "add member user seat email" },
    { id: "act-new-project", group: "Actions", title: "Create new project", sub: "Spin up a workspace", icon: "✨", keys: ["⌘", "N"], kw: "add create workspace" },
    { id: "act-export", group: "Actions", title: "Export data as CSV", sub: "Download current view", icon: "⬇️", keys: ["⌘", "E"], kw: "download csv report data" },
    { id: "act-key", group: "Actions", title: "Generate API key", sub: "Create a new secret key", icon: "🔑", keys: [], kw: "token secret api credentials" },
    { id: "act-status", group: "Actions", title: "View system status", sub: "Uptime & incidents", icon: "🟢", keys: [], kw: "uptime incident health" },

    // Settings
    { id: "set-theme", group: "Settings", title: "Toggle dark theme", sub: "Switch appearance", icon: "🌗", keys: ["⌘", "."], kw: "dark light appearance mode color" },
    { id: "set-profile", group: "Settings", title: "Edit profile", sub: "Name, avatar, email", icon: "🙍", keys: [], kw: "account name avatar me" },
    { id: "set-notifications", group: "Settings", title: "Notification preferences", sub: "Email & in-app alerts", icon: "🔔", keys: [], kw: "alerts email push" },
    { id: "set-security", group: "Settings", title: "Security & 2FA", sub: "Sessions and MFA", icon: "🛡️", keys: [], kw: "password mfa two factor sessions" }
  ];

  var GROUP_ORDER = ["Recent", "Navigation", "Actions", "Settings"];

  // ---------- DOM ----------
  var overlay = document.getElementById("cmdk");
  var panel = overlay.querySelector(".cmdk__panel");
  var input = document.getElementById("cmdkInput");
  var list = document.getElementById("cmdkList");
  var empty = document.getElementById("cmdkEmpty");
  var emptyTerm = document.getElementById("cmdkEmptyTerm");
  var openBtn = document.getElementById("openBar");
  var toastEl = document.getElementById("toast");

  var recentIds = ["nav-billing", "act-invite"]; // seed recents
  var visible = []; // flat list of currently rendered command objects (in order)
  var activeIndex = 0;
  var lastFocused = null;
  var dark = false;

  // ---------- Fuzzy matching ----------
  // Returns { score, ranges } where ranges are [start,end) over the title, or null.
  function fuzzy(query, cmd) {
    if (!query) return { score: 0, ranges: [] };
    var q = query.toLowerCase();
    var title = cmd.title;
    var lt = title.toLowerCase();
    var hay = (lt + " " + cmd.kw).toLowerCase();

    // substring in title -> best, with highlight ranges
    var sub = lt.indexOf(q);
    if (sub !== -1) {
      return { score: 1000 - sub + (sub === 0 ? 50 : 0), ranges: [[sub, sub + q.length]] };
    }
    // substring anywhere in keywords -> good, no title highlight
    if (hay.indexOf(q) !== -1) {
      return { score: 500, ranges: [] };
    }
    // subsequence over title -> fuzzy, collect char ranges
    var ti = 0, qi = 0, ranges = [], runStart = -1, gaps = 0;
    while (ti < lt.length && qi < q.length) {
      if (lt[ti] === q[qi]) {
        if (runStart === -1) runStart = ti;
        qi++;
        ti++;
        if (qi === q.length || lt[ti] !== q[qi]) {
          ranges.push([runStart, ti]);
          runStart = -1;
        }
      } else {
        if (runStart !== -1) { ranges.push([runStart, ti]); runStart = -1; }
        ti++;
        gaps++;
      }
    }
    if (qi === q.length) return { score: 200 - gaps, ranges: ranges };
    return null;
  }

  function highlight(title, ranges) {
    if (!ranges || !ranges.length) return escapeHtml(title);
    var out = "";
    var cur = 0;
    ranges.forEach(function (r) {
      out += escapeHtml(title.slice(cur, r[0]));
      out += "<mark>" + escapeHtml(title.slice(r[0], r[1])) + "</mark>";
      cur = r[1];
    });
    out += escapeHtml(title.slice(cur));
    return out;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---------- Render ----------
  function render(query) {
    var results = [];

    if (!query) {
      // default view: recents first, then everything by group order
      recentIds.forEach(function (id) {
        var c = COMMANDS.find(function (x) { return x.id === id; });
        if (c) results.push({ cmd: c, group: "Recent", ranges: [], score: 0 });
      });
      COMMANDS.forEach(function (c) {
        results.push({ cmd: c, group: c.group, ranges: [], score: 0 });
      });
    } else {
      COMMANDS.forEach(function (c) {
        var m = fuzzy(query, c);
        if (m) results.push({ cmd: c, group: c.group, ranges: m.ranges, score: m.score });
      });
      results.sort(function (a, b) { return b.score - a.score; });
    }

    list.innerHTML = "";
    visible = [];

    if (!results.length) {
      emptyTerm.textContent = query;
      empty.hidden = false;
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      return;
    }
    empty.hidden = true;
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");

    // group while preserving sort order: when searching keep score order but
    // still label groups; for default view, bucket by GROUP_ORDER.
    var rendered = [];
    if (!query) {
      GROUP_ORDER.forEach(function (g) {
        results.filter(function (r) { return r.group === g; })
          .forEach(function (r) { rendered.push(r); });
      });
    } else {
      rendered = results;
    }

    var lastGroup = null;
    rendered.forEach(function (r) {
      if (r.group !== lastGroup) {
        var head = document.createElement("li");
        head.className = "cmdk__group";
        head.setAttribute("role", "presentation");
        head.textContent = r.group;
        list.appendChild(head);
        lastGroup = r.group;
      }
      var idx = visible.length;
      visible.push(r.cmd);

      var li = document.createElement("li");
      li.className = "cmdk__item";
      li.id = "cmdk-opt-" + idx;
      li.setAttribute("role", "option");
      li.dataset.index = String(idx);

      var keysHtml = r.cmd.keys.map(function (k) {
        return '<kbd class="kbd kbd--ghost">' + escapeHtml(k) + "</kbd>";
      }).join("");

      li.innerHTML =
        '<span class="cmdk__icon" aria-hidden="true">' + r.cmd.icon + "</span>" +
        '<span class="cmdk__body">' +
          '<span class="cmdk__title">' + highlight(r.cmd.title, r.ranges) + "</span>" +
          '<span class="cmdk__sub">' + escapeHtml(r.cmd.sub) + "</span>" +
        "</span>" +
        (keysHtml ? '<span class="cmdk__shortcut">' + keysHtml + "</span>" : "") +
        '<span class="cmdk__go" aria-hidden="true">↵</span>';

      li.addEventListener("click", function () { runCommand(idx); });
      li.addEventListener("mousemove", function () { setActive(idx, false); });
      list.appendChild(li);
    });

    activeIndex = 0;
    setActive(0, true);
  }

  function setActive(i, scroll) {
    if (!visible.length) return;
    activeIndex = (i + visible.length) % visible.length;
    var items = list.querySelectorAll(".cmdk__item");
    items.forEach(function (el) { el.setAttribute("aria-selected", "false"); });
    var el = list.querySelector('.cmdk__item[data-index="' + activeIndex + '"]');
    if (el) {
      el.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", el.id);
      if (scroll) el.scrollIntoView({ block: "nearest" });
    }
  }

  function move(delta) {
    setActive(activeIndex + delta, true);
  }

  // ---------- Actions ----------
  function runCommand(i) {
    var cmd = visible[i];
    if (!cmd) return;

    // bump recents (max 4, dedupe)
    recentIds = [cmd.id].concat(recentIds.filter(function (x) { return x !== cmd.id; })).slice(0, 4);

    if (cmd.id === "set-theme") {
      toggleTheme();
    } else if (cmd.group === "Navigation") {
      toast("Navigated → " + cmd.title.replace(/^Go to /, ""));
    } else {
      toast(cmd.icon + "  " + cmd.title);
    }
    close();
  }

  function toggleTheme() {
    dark = !dark;
    var root = document.documentElement;
    if (dark) {
      root.style.setProperty("--bg", "#0d0f1a");
      root.style.setProperty("--surface", "#161a2b");
      root.style.setProperty("--surface-2", "#1e2236");
      root.style.setProperty("--ink", "#f3f4fb");
      root.style.setProperty("--muted", "#9aa1bd");
      root.style.setProperty("--faint", "#6e7593");
      root.style.setProperty("--line", "rgba(255,255,255,.12)");
      root.style.setProperty("--line-2", "rgba(255,255,255,.07)");
      root.style.setProperty("--brand-soft", "rgba(99,102,241,.2)");
      toast("🌙  Dark theme on");
    } else {
      ["--bg", "--surface", "--surface-2", "--ink", "--muted", "--faint", "--line", "--line-2", "--brand-soft"]
        .forEach(function (p) { root.style.removeProperty(p); });
      toast("☀️  Light theme on");
    }
  }

  // ---------- Open / close ----------
  function open() {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    input.value = "";
    render("");
    requestAnimationFrame(function () { input.focus(); });
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    input.removeAttribute("aria-activedescendant");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // ---------- Focus trap ----------
  function trap(e) {
    if (e.key !== "Tab") return;
    var focusables = panel.querySelectorAll("input, button, [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ---------- Toast ----------
  var toastTimer;
  function toast(msg) {
    clearTimeout(toastTimer);
    toastEl.innerHTML = '<span class="toast__dot" aria-hidden="true"></span><span>' + escapeHtml(msg) + "</span>";
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 220);
    }, 2200);
  }

  // ---------- Events ----------
  input.addEventListener("input", function () { render(input.value.trim()); });

  document.addEventListener("keydown", function (e) {
    // global open: ⌘K / Ctrl-K
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      overlay.hidden ? open() : close();
      return;
    }
    if (overlay.hidden) return;

    trap(e);

    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); runCommand(activeIndex); }
    else if (e.key === "Home" && document.activeElement === input) { /* let caret move */ }
  });

  openBtn.addEventListener("click", open);

  overlay.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });

})();
