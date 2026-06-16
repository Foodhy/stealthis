(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  /* ---------------- Theme toggle (persisted) ---------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var STORE = "aurora-docs-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  var stored;
  try { stored = localStorage.getItem(STORE); } catch (e) {}
  if (!stored) {
    stored = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  applyTheme(stored);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORE, next); } catch (e) {}
      toast(next === "dark" ? "Dark theme enabled" : "Light theme enabled");
    });
  }

  /* ---------------- Copy-to-clipboard ---------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) { reject(err); }
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!target) return;
      copyText(target.textContent.replace(/^\$\s*/, "")).then(
        function () {
          btn.classList.add("copied");
          var label = btn.querySelector(".copy-label");
          var prev = label ? label.textContent : null;
          if (label) label.textContent = "Copied";
          toast("Copied to clipboard");
          setTimeout(function () {
            btn.classList.remove("copied");
            if (label && prev !== null) label.textContent = prev;
          }, 1500);
        },
        function () { toast("Copy failed — select manually"); }
      );
    });
  });

  /* ---------------- Install package-manager tabs ---------------- */
  var installCmd = document.getElementById("installCmd");
  var installCmds = {
    npm: "npm install @aurora/client",
    pnpm: "pnpm add @aurora/client",
    bun: "bun add @aurora/client",
    yarn: "yarn add @aurora/client"
  };
  document.querySelectorAll(".install-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".install-tab").forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      var pm = tab.getAttribute("data-pm");
      if (installCmd && installCmds[pm]) {
        installCmd.innerHTML =
          '<span class="tok-prompt">$</span> ' + installCmds[pm];
      }
    });
  });

  /* ---------------- Code-sample language tabs ---------------- */
  var sampleCode = document.getElementById("sampleCode");
  var samples = {
    ts: [
      ['<span class="tok-kw">import</span> { createClient } <span class="tok-kw">from</span> <span class="tok-str">"@aurora/client"</span>;'],
      [''],
      ['<span class="tok-kw">const</span> db <span class="tok-punc">=</span> <span class="tok-fn">createClient</span>({ region<span class="tok-punc">:</span> <span class="tok-str">"auto"</span> });'],
      [''],
      ['<span class="tok-com">// fully typed result</span>'],
      ['<span class="tok-kw">const</span> users <span class="tok-punc">=</span> <span class="tok-kw">await</span> db'],
      ['  .<span class="tok-fn">from</span>(<span class="tok-str">"users"</span>)'],
      ['  .<span class="tok-fn">where</span>({ active<span class="tok-punc">:</span> <span class="tok-kw">true</span> })'],
      ['  .<span class="tok-fn">limit</span>(<span class="tok-num">25</span>);']
    ],
    py: [
      ['<span class="tok-kw">from</span> aurora <span class="tok-kw">import</span> create_client'],
      [''],
      ['db <span class="tok-punc">=</span> <span class="tok-fn">create_client</span>(region<span class="tok-punc">=</span><span class="tok-str">"auto"</span>)'],
      [''],
      ['<span class="tok-com"># streamed cursor, async iterable</span>'],
      ['users <span class="tok-punc">=</span> <span class="tok-kw">await</span> db.<span class="tok-fn">table</span>(<span class="tok-str">"users"</span>) \\'],
      ['    .<span class="tok-fn">where</span>(active<span class="tok-punc">=</span><span class="tok-kw">True</span>) \\'],
      ['    .<span class="tok-fn">limit</span>(<span class="tok-num">25</span>) \\'],
      ['    .<span class="tok-fn">fetch</span>()']
    ],
    go: [
      ['<span class="tok-kw">package</span> main'],
      [''],
      ['<span class="tok-kw">import</span> <span class="tok-str">"github.com/aurora/client"</span>'],
      [''],
      ['db, _ <span class="tok-punc">:=</span> client.<span class="tok-fn">New</span>(client.Region(<span class="tok-str">"auto"</span>))'],
      [''],
      ['<span class="tok-com">// typed struct scan</span>'],
      ['users, err <span class="tok-punc">:=</span> db.<span class="tok-fn">From</span>(<span class="tok-str">"users"</span>).'],
      ['    <span class="tok-fn">Where</span>(<span class="tok-str">"active"</span>, <span class="tok-kw">true</span>).<span class="tok-fn">Limit</span>(<span class="tok-num">25</span>).<span class="tok-fn">Scan</span>()']
    ],
    rs: [
      ['<span class="tok-kw">use</span> aurora<span class="tok-punc">::</span>Client;'],
      [''],
      ['<span class="tok-kw">let</span> db <span class="tok-punc">=</span> Client<span class="tok-punc">::</span><span class="tok-fn">connect</span>(<span class="tok-str">"auto"</span>).<span class="tok-fn">await</span>?;'],
      [''],
      ['<span class="tok-com">// zero-copy typed rows</span>'],
      ['<span class="tok-kw">let</span> users <span class="tok-punc">=</span> db'],
      ['    .<span class="tok-fn">from</span>(<span class="tok-str">"users"</span>)'],
      ['    .<span class="tok-fn">filter</span>(<span class="tok-str">"active"</span>, <span class="tok-kw">true</span>)'],
      ['    .<span class="tok-fn">limit</span>(<span class="tok-num">25</span>).<span class="tok-fn">all</span>().<span class="tok-fn">await</span>?;']
    ]
  };
  var samplesPlain = {
    ts: 'import { createClient } from "@aurora/client";\n\nconst db = createClient({ region: "auto" });\n\n// fully typed result\nconst users = await db\n  .from("users")\n  .where({ active: true })\n  .limit(25);',
    py: 'from aurora import create_client\n\ndb = create_client(region="auto")\n\n# streamed cursor, async iterable\nusers = await db.table("users") \\\n    .where(active=True) \\\n    .limit(25) \\\n    .fetch()',
    go: 'package main\n\nimport "github.com/aurora/client"\n\ndb, _ := client.New(client.Region("auto"))\n\n// typed struct scan\nusers, err := db.From("users").\n    Where("active", true).Limit(25).Scan()',
    rs: 'use aurora::Client;\n\nlet db = Client::connect("auto").await?;\n\n// zero-copy typed rows\nlet users = db\n    .from("users")\n    .filter("active", true)\n    .limit(25).all().await?;'
  };

  function renderSample(lang) {
    if (!sampleCode || !samples[lang]) return;
    sampleCode.innerHTML = samples[lang].map(function (l) { return l[0]; }).join("\n");
    sampleCode.setAttribute("data-plain", samplesPlain[lang]);
  }
  document.querySelectorAll(".lang-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".lang-tab").forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      renderSample(tab.getAttribute("data-lang"));
    });
  });
  renderSample("ts");

  /* ---------------- ⌘K command palette ---------------- */
  var overlay = document.getElementById("kbarOverlay");
  var input = document.getElementById("kbarInput");
  var results = document.getElementById("kbarResults");
  var activeIndex = -1;
  var lastFocused = null;

  var INDEX = [
    { title: "Quickstart", kind: "guide", ic: "⚡", meta: "Get running in 5 minutes", href: "#guide-quickstart" },
    { title: "Authentication & tokens", kind: "guide", ic: "⚿", meta: "Scoped tokens, key rotation", href: "#guide-auth" },
    { title: "Realtime sync", kind: "guide", ic: "≈", meta: "Delta streams & live queries", href: "#guide-realtime" },
    { title: "Deploy to the edge", kind: "guide", ic: "☁", meta: "Workers, Deno, serverless", href: "#guide-edge" },
    { title: "Schema migrations", kind: "guide", ic: "⛁", meta: "Zero-downtime migrations", href: "#guide-migrations" },
    { title: "Observability & tracing", kind: "guide", ic: "∿", meta: "Latency budgets, logs", href: "#guide-observability" },
    { title: "Client API reference", kind: "api", ic: "{}", meta: "Queries, mutations, batching", href: "#topic-client" },
    { title: "Data modeling", kind: "api", ic: "⛁", meta: "Tables, relations, indexes", href: "#topic-data" },
    { title: "Row-level security", kind: "api", ic: "⚿", meta: "Access policies & rules", href: "#topic-auth" },
    { title: "aurora CLI reference", kind: "api", ic: "⌘", meta: "Local dev, codegen, CI", href: "#topic-cli" },
    { title: "Webhooks & events", kind: "api", ic: "⇄", meta: "Triggers, retries, replay", href: "#topic-webhooks" },
    { title: "TypeScript SDK", kind: "sdk", ic: "TS", meta: "Typed client for Node & edge", href: "#sdks" },
    { title: "Python SDK", kind: "sdk", ic: "Py", meta: "Async client & query builder", href: "#sdks" },
    { title: "Go SDK", kind: "sdk", ic: "Go", meta: "Struct-scan typed results", href: "#sdks" },
    { title: "Rust SDK", kind: "sdk", ic: "Rs", meta: "Zero-copy typed rows", href: "#sdks" },
    { title: "Query examples", kind: "example", ic: "</>", meta: "One client, every runtime", href: "#samples" },
    { title: "Changelog v4.2", kind: "page", ic: "✦", meta: "What's new in this release", href: "#changelog" }
  ];

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) +
      "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>" +
      escapeHtml(text.slice(idx + q.length));
  }

  function search(q) {
    q = q.trim();
    if (!q) return INDEX.slice(0, 7);
    var lc = q.toLowerCase();
    return INDEX.filter(function (it) {
      return it.title.toLowerCase().indexOf(lc) !== -1 ||
        it.meta.toLowerCase().indexOf(lc) !== -1 ||
        it.kind.indexOf(lc) !== -1;
    });
  }

  function renderResults(q) {
    var items = search(q);
    activeIndex = items.length ? 0 : -1;
    if (!items.length) {
      results.innerHTML =
        '<li class="kbar-empty">No results for “' + escapeHtml(q) + '”. Try “auth”, “deploy”, or “cli”.</li>';
      return;
    }
    results.innerHTML = items.map(function (it, i) {
      return '<li class="kbar-result" role="option" data-href="' + it.href +
        '" aria-selected="' + (i === 0 ? "true" : "false") + '">' +
        '<span class="kbar-result-ic">' + escapeHtml(it.ic) + '</span>' +
        '<span class="kbar-result-main">' +
        '<span class="kbar-result-title">' + highlight(it.title, q) + '</span>' +
        '<span class="kbar-result-meta">' + escapeHtml(it.meta) + '</span>' +
        '</span>' +
        '<span class="kbar-result-kind">' + escapeHtml(it.kind) + '</span>' +
        '</li>';
    }).join("");
  }

  function getResultEls() {
    return Array.prototype.slice.call(results.querySelectorAll(".kbar-result"));
  }
  function setActive(i) {
    var els = getResultEls();
    if (!els.length) return;
    activeIndex = (i + els.length) % els.length;
    els.forEach(function (el, idx) {
      el.setAttribute("aria-selected", idx === activeIndex ? "true" : "false");
      if (idx === activeIndex) el.scrollIntoView({ block: "nearest" });
    });
  }

  function openKbar() {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    renderResults("");
    setTimeout(function () { input.focus(); }, 0);
  }
  function closeKbar() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function activate(el) {
    var href = el.getAttribute("data-href");
    closeKbar();
    if (href) {
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (document.getElementById(href.slice(1))) {
        location.hash = href;
      }
    }
    toast("Opening " + el.querySelector(".kbar-result-title").textContent);
  }

  ["kbarTrigger", "kbarHero"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", openKbar);
  });
  document.querySelectorAll("[data-kbar-close]").forEach(function (el) {
    el.addEventListener("click", closeKbar);
  });

  if (input) {
    input.addEventListener("input", function () { renderResults(input.value); });
  }
  if (results) {
    results.addEventListener("click", function (e) {
      var li = e.target.closest(".kbar-result");
      if (li) activate(li);
    });
    results.addEventListener("mousemove", function (e) {
      var li = e.target.closest(".kbar-result");
      if (!li) return;
      var els = getResultEls();
      var i = els.indexOf(li);
      if (i !== -1 && i !== activeIndex) setActive(i);
    });
  }

  document.addEventListener("keydown", function (e) {
    // Global ⌘K / Ctrl+K and "/" to open
    var isK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
    if (isK) {
      e.preventDefault();
      overlay.hidden ? openKbar() : closeKbar();
      return;
    }
    if (e.key === "/" && overlay.hidden) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        openKbar();
      }
      return;
    }
    if (overlay.hidden) return;

    if (e.key === "Escape") { e.preventDefault(); closeKbar(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      var els = getResultEls();
      if (els[activeIndex]) activate(els[activeIndex]);
    }
  });

  /* ---------------- Card hover micro-feedback (accessible focus) ---------------- */
  document.querySelectorAll(".guide-card, .topic-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      // allow normal anchor jump but announce
      var h3 = card.querySelector("h3");
      if (h3) toast("Opening " + h3.textContent);
    });
  });

  /* ---------------- SDK chip feedback ---------------- */
  document.querySelectorAll(".sdk-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      toast(chip.textContent.trim() + " SDK — docs coming up");
    });
  });
})();
