(function () {
  "use strict";

  /* ---------- State ---------- */
  var keys = [
    { id: "k1", name: "Production server", prefix: "vk_live", tail: "8fA2", scopes: ["read", "write", "billing"], created: "Mar 12, 2026", lastUsed: "2 hours ago" },
    { id: "k2", name: "Analytics reader", prefix: "vk_live", tail: "q4Lp", scopes: ["read"], created: "Feb 28, 2026", lastUsed: "Yesterday" },
    { id: "k3", name: "Staging CI", prefix: "vk_test", tail: "Zr19", scopes: ["read", "write"], created: "Jan 09, 2026", lastUsed: null }
  ];

  var hooks = [
    { id: "h1", url: "https://api.helixlabs.dev/hooks/stripe", events: ["invoice.paid", "subscription.updated"], status: "active", lastResp: 200, lastAt: "5 min ago" },
    { id: "h2", url: "https://hooks.helixlabs.dev/audit-log", events: ["customer.created"], status: "paused", lastResp: null, lastAt: null }
  ];

  var pendingRevoke = null;

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var toastHost = $("#toastHost");
  function toast(msg, type) {
    var t = el("div", "toast" + (type === "err" ? " toast-err" : ""));
    t.appendChild(el("span", "tdot"));
    t.appendChild(document.createTextNode(msg));
    toastHost.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  function genSecret(prefix) {
    var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var body = "";
    for (var i = 0; i < 32; i++) body += alpha[Math.floor(Math.random() * alpha.length)];
    return (prefix || "vk_live") + "_" + body;
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || "Copied to clipboard"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else { fallback(); }
    function fallback() {
      var ta = el("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed", "err"); }
      ta.remove();
    }
  }

  /* ---------- Render: keys ---------- */
  var keysBody = $("#keysBody");
  var keysEmpty = $("#keysEmpty");

  function renderKeys() {
    keysBody.innerHTML = "";
    $("#keyCount").textContent = keys.length;
    keysEmpty.hidden = keys.length > 0;

    keys.forEach(function (k) {
      var tr = el("tr");
      tr.dataset.id = k.id;

      var tdName = el("td", "", '<span class="key-name">' + esc(k.name) + "</span>");
      tdName.setAttribute("data-label", "Name");

      var masked = k.prefix + "_" + "••••••••" + k.tail;
      var tdKey = el("td");
      tdKey.setAttribute("data-label", "Key");
      var wrap = el("span", "key-mask");
      var code = el("code", "key-mono");
      code.textContent = masked;
      code.dataset.revealed = "0";
      var revealBtn = el("button", "icon-btn", "👁");
      revealBtn.title = "Reveal key";
      revealBtn.setAttribute("aria-label", "Reveal key");
      revealBtn.addEventListener("click", function () {
        if (code.dataset.revealed === "0") {
          code.textContent = genStableReveal(k);
          code.dataset.revealed = "1";
          revealBtn.textContent = "🙈";
          revealBtn.title = "Hide key";
        } else {
          code.textContent = masked;
          code.dataset.revealed = "0";
          revealBtn.textContent = "👁";
          revealBtn.title = "Reveal key";
        }
      });
      var copyBtn = el("button", "icon-btn", "⧉");
      copyBtn.title = "Copy key";
      copyBtn.setAttribute("aria-label", "Copy key");
      copyBtn.addEventListener("click", function () { copyText(genStableReveal(k), "Key copied"); });
      wrap.appendChild(code); wrap.appendChild(revealBtn); wrap.appendChild(copyBtn);
      tdKey.appendChild(wrap);

      var tdScopes = el("td");
      tdScopes.setAttribute("data-label", "Scopes");
      var chips = el("div", "scope-chips");
      k.scopes.forEach(function (s) {
        var c = el("span", "scope-chip", esc(s));
        c.dataset.s = s;
        chips.appendChild(c);
      });
      tdScopes.appendChild(chips);

      var tdCreated = el("td", "cell-dim", esc(k.created));
      tdCreated.setAttribute("data-label", "Created");
      var tdUsed = el("td", "cell-dim", k.lastUsed ? esc(k.lastUsed) : '<span class="never">Never</span>');
      tdUsed.setAttribute("data-label", "Last used");

      var tdAct = el("td");
      tdAct.setAttribute("data-label", "");
      var acts = el("div", "row-actions");
      var revoke = el("button", "icon-btn", "🗑");
      revoke.title = "Revoke key";
      revoke.setAttribute("aria-label", "Revoke key " + k.name);
      revoke.addEventListener("click", function () { askRevoke(k.id); });
      acts.appendChild(revoke);
      tdAct.appendChild(acts);

      tr.append(tdName, tdKey, tdScopes, tdCreated, tdUsed, tdAct);
      keysBody.appendChild(tr);
    });
  }

  // Deterministic full value per key for reveal/copy demo
  var revealCache = {};
  function genStableReveal(k) {
    if (!revealCache[k.id]) {
      var pad = "";
      var seed = (k.id + k.name).split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
      var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 28; i++) { seed = (seed * 33 + i) % alpha.length; pad += alpha[seed]; }
      revealCache[k.id] = k.prefix + "_" + pad + k.tail;
    }
    return revealCache[k.id];
  }

  /* ---------- Render: webhooks ---------- */
  var hooksGrid = $("#hooksGrid");
  var hooksEmpty = $("#hooksEmpty");

  function renderHooks() {
    hooksGrid.innerHTML = "";
    $("#hookCount").textContent = hooks.length;
    hooksEmpty.hidden = hooks.length > 0;

    hooks.forEach(function (h) {
      var card = el("div", "hook-card");
      card.dataset.id = h.id;

      var top = el("div", "hook-top");
      top.appendChild(el("div", "hook-url", esc(h.url)));
      var statusCls = h.status === "active" ? "status-active" : "status-paused";
      top.appendChild(el("span", "status-dot " + statusCls, h.status === "active" ? "Active" : "Paused"));
      card.appendChild(top);

      var ev = el("div", "hook-events");
      h.events.forEach(function (e) { ev.appendChild(el("span", "event-chip", esc(e))); });
      card.appendChild(ev);

      var foot = el("div", "hook-foot");
      var meta = el("div", "hook-meta");
      if (h.lastResp) {
        meta.innerHTML = "Last delivery <span class=\"resp-200\">" + h.lastResp + " OK</span> · " + esc(h.lastAt);
      } else {
        meta.textContent = "No deliveries yet";
      }
      foot.appendChild(meta);

      var actions = el("div", "hook-actions");
      var testBtn = el("button", "btn btn-soft btn-xs", "Send test");
      testBtn.addEventListener("click", function () { testSend(h, testBtn, meta); });
      var delBtn = el("button", "btn btn-ghost btn-xs", "Delete");
      delBtn.addEventListener("click", function () {
        hooks = hooks.filter(function (x) { return x.id !== h.id; });
        renderHooks();
        toast("Endpoint deleted");
      });
      actions.append(testBtn, delBtn);
      foot.appendChild(actions);
      card.appendChild(foot);

      hooksGrid.appendChild(card);
    });
  }

  function testSend(h, btn, meta) {
    btn.disabled = true;
    var orig = btn.textContent;
    btn.textContent = "Sending…";
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = orig;
      h.lastResp = 200;
      h.lastAt = "just now";
      meta.innerHTML = "Last delivery <span class=\"resp-200\">200 OK</span> · just now";
      toast("Test event delivered — 200 OK");
    }, 850);
  }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var name = tab.dataset.tab;
      document.querySelectorAll(".panel").forEach(function (p) {
        var match = p.id === "panel-" + name;
        p.classList.toggle("is-active", match);
        p.hidden = !match;
      });
    });
  });

  /* ---------- Modal plumbing ---------- */
  var lastFocus = null;
  function openModal(id) {
    lastFocus = document.activeElement;
    var m = document.getElementById(id);
    m.hidden = false;
    var focusable = m.querySelector("input, button, [tabindex]");
    if (focusable) focusable.focus();
  }
  function closeModal(id) {
    document.getElementById(id).hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () { closeModal(b.dataset.close); });
  });
  document.querySelectorAll(".modal-scrim").forEach(function (s) {
    s.addEventListener("click", function (e) { if (e.target === s) s.hidden = true; });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-scrim:not([hidden])").forEach(function (s) { s.hidden = true; });
    }
  });

  /* ---------- Create key ---------- */
  $("#newKeyBtn").addEventListener("click", function () {
    $("#keyForm").reset();
    openModal("keyModal");
  });

  $("#keyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#keyName").value.trim();
    if (!name) { toast("Give your key a name", "err"); return; }
    var scopes = Array.prototype.map.call(
      document.querySelectorAll('#keyForm input[name="scope"]:checked'),
      function (c) { return c.value; }
    );
    if (!scopes.length) scopes = ["read"];

    var prefix = "vk_live";
    var secret = genSecret(prefix);
    var tail = secret.slice(-4);
    var newKey = {
      id: "k" + Date.now(),
      name: name,
      prefix: prefix,
      tail: tail,
      scopes: scopes,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      lastUsed: null
    };
    revealCache[newKey.id] = secret; // reveal/copy will show the real secret
    keys.unshift(newKey);
    renderKeys();
    closeModal("keyModal");

    // Show secret ONCE
    $("#secretValue").textContent = secret;
    openModal("secretModal");
  });

  $("#copySecret").addEventListener("click", function () {
    copyText($("#secretValue").textContent, "Secret copied — store it safely");
  });
  $("#secretDone").addEventListener("click", function () {
    closeModal("secretModal");
    toast("Key created");
  });

  /* ---------- Revoke ---------- */
  function askRevoke(id) {
    pendingRevoke = id;
    var k = keys.find(function (x) { return x.id === id; });
    $("#confirmText").textContent = "Revoking “" + k.name + "” immediately disables it. Any request using it will fail with 401.";
    openModal("confirmModal");
  }
  $("#confirmRevoke").addEventListener("click", function () {
    if (pendingRevoke) {
      keys = keys.filter(function (x) { return x.id !== pendingRevoke; });
      renderKeys();
      toast("Key revoked");
      pendingRevoke = null;
    }
    closeModal("confirmModal");
  });

  /* ---------- Add webhook ---------- */
  $("#newHookBtn").addEventListener("click", function () {
    $("#hookForm").reset();
    openModal("hookModal");
  });
  $("#hookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var url = $("#hookUrl").value.trim();
    if (!/^https?:\/\/.+/.test(url)) { toast("Enter a valid URL", "err"); return; }
    var events = Array.prototype.map.call(
      document.querySelectorAll('#hookForm input[name="event"]:checked'),
      function (c) { return c.value; }
    );
    if (!events.length) events = ["invoice.paid"];
    hooks.unshift({
      id: "h" + Date.now(),
      url: url,
      events: events,
      status: "active",
      lastResp: null,
      lastAt: null
    });
    renderHooks();
    closeModal("hookModal");
    toast("Endpoint added");
  });

  /* ---------- Theme ---------- */
  var themeBtn = $("#themeToggle");
  themeBtn.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    themeBtn.setAttribute("aria-pressed", String(!dark));
  });

  /* ---------- Init ---------- */
  renderKeys();
  renderHooks();
})();
