(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var app = $("#app");
  var STORE = "saas-shell";

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2400);
  }

  /* ---------- Persisted prefs ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(p) { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) {} }
  var prefs = load();

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    prefs.theme = t; save(prefs);
  }
  applyTheme(prefs.theme || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#themeBtn").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    toast(next === "dark" ? "Dark theme on" : "Light theme on");
  });

  /* ---------- Sidebar collapse (persisted, desktop) ---------- */
  if (prefs.collapsed) app.classList.add("is-collapsed");
  $("#collapseBtn").addEventListener("click", function () {
    var c = app.classList.toggle("is-collapsed");
    prefs.collapsed = c; save(prefs);
    this.setAttribute("aria-label", c ? "Expand sidebar" : "Collapse sidebar");
  });

  /* ---------- Mobile off-canvas ---------- */
  var burger = $("#burger"), scrim = $("#scrim");
  function openNav() { app.classList.add("nav-open"); scrim.hidden = false; burger.setAttribute("aria-expanded", "true"); }
  function closeNav() { app.classList.remove("nav-open"); scrim.hidden = true; burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () { app.classList.contains("nav-open") ? closeNav() : openNav(); });
  scrim.addEventListener("click", closeNav);

  /* ---------- Nav active state ---------- */
  $$(".nav__item").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav__item").forEach(function (n) { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      item.classList.add("is-active");
      item.setAttribute("aria-current", "page");
      toast(item.dataset.nav + " — page would load here.");
      if (window.innerWidth <= 860) closeNav();
    });
  });

  /* ---------- Dropdown menus (workspace, notifications, avatar) ---------- */
  var openMenu = null;
  function shutMenu() {
    if (!openMenu) return;
    openMenu.menu.hidden = true;
    openMenu.btn.setAttribute("aria-expanded", "false");
    openMenu = null;
  }
  $$("[data-menu]").forEach(function (wrap) {
    var btn = $("button[aria-haspopup]", wrap);
    var menu = $(".menu", wrap);
    if (!btn || !menu) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = !menu.hidden;
      shutMenu();
      if (!isOpen) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        openMenu = { btn: btn, menu: menu };
        var first = $(".menu__item, .notif__item", menu);
        if (first) first.focus();
      }
    });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });
  });
  document.addEventListener("click", shutMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openMenu) { var b = openMenu.btn; shutMenu(); b.focus(); }
  });

  /* ---------- Workspace switcher ---------- */
  $$('#wsMenu [role="menuitemradio"]').forEach(function (it) {
    it.addEventListener("click", function () {
      $$('#wsMenu [role="menuitemradio"]').forEach(function (x) {
        x.classList.remove("is-active"); x.setAttribute("aria-checked", "false");
        var c = $(".check", x); if (c) c.remove();
      });
      it.classList.add("is-active"); it.setAttribute("aria-checked", "true");
      if (!$(".check", it)) {
        var c = document.createElement("span");
        c.className = "check"; c.setAttribute("aria-hidden", "true"); c.textContent = "✓";
        it.appendChild(c);
      }
      var name = it.textContent.replace("✓", "").trim();
      $(".ws__name").textContent = name;
      shutMenu();
      toast("Switched to " + name);
    });
  });
  $('#wsMenu .menu__item--muted').addEventListener("click", function () { shutMenu(); toast("Create workspace dialog would open."); });

  /* ---------- Notifications ---------- */
  function updateBadge() {
    var unread = $$("#notifList .is-unread").length;
    var dot = $("#notifBtn .dot");
    var btn = $("#notifBtn");
    if (unread) { dot.textContent = unread; dot.style.display = ""; btn.setAttribute("aria-label", "Notifications, " + unread + " unread"); }
    else { dot.style.display = "none"; btn.setAttribute("aria-label", "Notifications, none unread"); }
  }
  $$("#notifList .notif__item").forEach(function (n) {
    n.addEventListener("click", function () { n.classList.remove("is-unread"); updateBadge(); });
  });
  $("#clearNotif").addEventListener("click", function () {
    $$("#notifList .is-unread").forEach(function (n) { n.classList.remove("is-unread"); });
    updateBadge(); toast("All notifications marked read.");
  });

  /* ---------- Avatar / user menu actions ---------- */
  $$("#avatarMenu .menu__item").forEach(function (it) {
    it.addEventListener("click", function () { shutMenu(); toast(it.textContent.trim() + " — coming soon."); });
  });

  /* ---------- Misc CTAs ---------- */
  $$("[data-toast]").forEach(function (b) { b.addEventListener("click", function () { toast(b.dataset.toast); }); });
  $("[data-upgrade]").addEventListener("click", function () { toast("Upgrade flow would open here."); });

  /* ---------- Command palette (⌘K) ---------- */
  var COMMANDS = [
    { icon: "🏠", label: "Go to Dashboard", hint: "G then D", run: function () { goto("Dashboard"); } },
    { icon: "📁", label: "Go to Projects", hint: "G then P", run: function () { goto("Projects"); } },
    { icon: "＋", label: "Create new project", hint: "C", run: function () { toast("New project draft created."); } },
    { icon: "👥", label: "Invite teammate", hint: "I", run: function () { toast("Invite dialog would open."); } },
    { icon: "🌓", label: "Toggle theme", hint: "T", run: function () { $("#themeBtn").click(); } },
    { icon: "💳", label: "Open billing", hint: "", run: function () { goto("Billing"); } },
    { icon: "⚙", label: "Open settings", hint: "", run: function () { goto("Settings"); } }
  ];
  function goto(name) {
    var t = $$(".nav__item").filter(function (n) { return n.dataset.nav === name; })[0];
    if (t) t.click(); else toast("Opening " + name);
  }

  var cmdk = $("#cmdk"), cmdkInput = $("#cmdkInput"), cmdkList = $("#cmdkList"), sel = 0, lastFocus = null;
  function renderCmd(q) {
    q = (q || "").toLowerCase().trim();
    var items = COMMANDS.filter(function (c) { return c.label.toLowerCase().indexOf(q) > -1; });
    cmdkList.innerHTML = "";
    if (!items.length) { cmdkList.innerHTML = '<li class="cmdk__empty">No commands match “' + q + '”.</li>'; return; }
    sel = Math.min(sel, items.length - 1);
    items.forEach(function (c, i) {
      var li = document.createElement("li");
      li.className = "cmdk__item" + (i === sel ? " is-sel" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === sel ? "true" : "false");
      li.innerHTML = '<span class="ci-ico">' + c.icon + '</span><span>' + c.label + '</span>' + (c.hint ? '<span class="ci-hint">' + c.hint + '</span>' : "");
      li.addEventListener("click", function () { closeCmdk(); c.run(); });
      li.addEventListener("mousemove", function () { sel = i; mark(); });
      cmdkList.appendChild(li);
    });
  }
  function mark() {
    $$(".cmdk__item", cmdkList).forEach(function (el, i) {
      var on = i === sel; el.classList.toggle("is-sel", on); el.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  function currentItems() { return COMMANDS.filter(function (c) { return c.label.toLowerCase().indexOf(cmdkInput.value.toLowerCase().trim()) > -1; }); }
  function openCmdk() {
    lastFocus = document.activeElement;
    cmdk.hidden = false; sel = 0; cmdkInput.value = ""; renderCmd("");
    cmdkInput.focus();
  }
  function closeCmdk() { cmdk.hidden = true; if (lastFocus) lastFocus.focus(); }
  $("#searchBtn").addEventListener("click", openCmdk);
  cmdk.addEventListener("click", function (e) { if (e.target === cmdk) closeCmdk(); });
  cmdkInput.addEventListener("input", function () { sel = 0; renderCmd(cmdkInput.value); });
  cmdkInput.addEventListener("keydown", function (e) {
    var items = currentItems();
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(items.length, 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(items.length, 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); if (items[sel]) { closeCmdk(); items[sel].run(); } }
    else if (e.key === "Escape") { e.preventDefault(); closeCmdk(); }
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      cmdk.hidden ? openCmdk() : closeCmdk();
    }
  });
})();
