(function () {
  "use strict";

  // ── Searchable index (fictional Nimbus knowledge base) ──────────
  var ARTICLES = [
    { t: "Generating and rotating API keys", c: "API & SDKs", i: "🔑", kw: "api keys token auth rotate secret" },
    { t: "Authenticating with bearer tokens", c: "API & SDKs", i: "🔌", kw: "api auth token bearer header" },
    { t: "Paginating large result sets", c: "API & SDKs", i: "🔌", kw: "api pagination cursor limit offset" },
    { t: "Subscribing to webhooks", c: "Integrations", i: "🧩", kw: "webhooks events payload subscribe callback" },
    { t: "Verifying webhook signatures", c: "Integrations", i: "🧩", kw: "webhooks signature hmac security verify" },
    { t: "Understanding usage-based billing", c: "Account & billing", i: "💳", kw: "billing invoice usage pricing cost plan" },
    { t: "Downloading past invoices", c: "Account & billing", i: "💳", kw: "billing invoices receipts download pdf" },
    { t: "Upgrading or downgrading your plan", c: "Account & billing", i: "💳", kw: "billing plan upgrade downgrade seats" },
    { t: "Configuring SAML SSO with Okta", c: "Security & access", i: "🔐", kw: "sso saml okta security login identity" },
    { t: "Provisioning users with SCIM", c: "Security & access", i: "🔐", kw: "sso scim provisioning users access security" },
    { t: "Reading the audit log", c: "Security & access", i: "🔐", kw: "audit log security events access" },
    { t: "Handling 429 rate-limit responses", c: "Troubleshooting", i: "🛠️", kw: "rate limits 429 throttle retry backoff" },
    { t: "Raising your rate limits", c: "API & SDKs", i: "🔌", kw: "rate limits quota increase throughput" },
    { t: "Debugging deploy failures", c: "Troubleshooting", i: "🛠️", kw: "deploy failure error build troubleshoot" },
    { t: "Fixing connection timeouts", c: "Troubleshooting", i: "🛠️", kw: "timeout connection network troubleshoot" },
    { t: "Deploying Aurora DB to a new region", c: "Getting started", i: "🚀", kw: "aurora db deploy region database start" },
    { t: "Creating your first workspace", c: "Getting started", i: "🚀", kw: "workspace org start setup onboarding" },
    { t: "Inviting teammates to your org", c: "Getting started", i: "🚀", kw: "invite team members seats workspace" },
    { t: "Connecting the Slack integration", c: "Integrations", i: "🧩", kw: "slack integration notifications connect" },
    { t: "Linking a GitHub repository", c: "Integrations", i: "🧩", kw: "github repo integration deploy connect" }
  ];

  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var activeIndex = -1;
  var current = [];

  // ── Toast helper ────────────────────────────────────────────────
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function highlight(title, q) {
    var safe = escapeHtml(title);
    if (!q) return safe;
    var idx = title.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return safe;
    var end = idx + q.length;
    return escapeHtml(title.slice(0, idx)) +
      "<mark>" + escapeHtml(title.slice(idx, end)) + "</mark>" +
      escapeHtml(title.slice(end));
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return ARTICLES
      .map(function (a) {
        var hay = (a.t + " " + a.c + " " + a.kw).toLowerCase();
        var score = 0;
        terms.forEach(function (term) {
          if (a.t.toLowerCase().indexOf(term) !== -1) score += 3;
          else if (hay.indexOf(term) !== -1) score += 1;
        });
        return { a: a, score: score };
      })
      .filter(function (r) { return r.score > 0; })
      .sort(function (x, y) { return y.score - x.score; })
      .slice(0, 6)
      .map(function (r) { return r.a; });
  }

  function render(list, q) {
    current = list;
    activeIndex = -1;
    if (!q.trim()) {
      closeResults();
      return;
    }
    if (!list.length) {
      results.innerHTML =
        '<li class="result result--empty" role="option">' +
        "No articles match &ldquo;" + escapeHtml(q.trim()) + "&rdquo;. Try another keyword." +
        "</li>";
      openResults();
      return;
    }
    results.innerHTML = list.map(function (a, i) {
      return '<li role="option" id="result-' + i + '" data-i="' + i + '">' +
        '<div class="result">' +
          '<span class="result__icon" aria-hidden="true">' + a.i + "</span>" +
          '<span class="result__body">' +
            '<span class="result__title">' + highlight(a.t, q.trim()) + "</span>" +
            '<span class="result__cat">' + escapeHtml(a.c) + "</span>" +
          "</span>" +
          '<span class="result__go" aria-hidden="true">↵</span>' +
        "</div>" +
      "</li>";
    }).join("");
    openResults();
  }

  function openResults() {
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  function closeResults() {
    results.hidden = true;
    results.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  }

  function setActive(i) {
    var nodes = results.querySelectorAll(".result");
    nodes.forEach(function (n) { n.classList.remove("is-active"); });
    if (i >= 0 && i < nodes.length) {
      nodes[i].classList.add("is-active");
      input.setAttribute("aria-activedescendant", "result-" + i);
      nodes[i].scrollIntoView({ block: "nearest" });
    }
  }

  function openArticle(a) {
    closeResults();
    toast("Opening: " + a.t);
  }

  // ── Input events ────────────────────────────────────────────────
  input.addEventListener("input", function () {
    render(search(input.value), input.value);
  });

  input.addEventListener("keydown", function (e) {
    if (results.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      render(search(input.value), input.value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!current.length) return;
      activeIndex = (activeIndex + 1) % current.length;
      setActive(activeIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!current.length) return;
      activeIndex = (activeIndex - 1 + current.length) % current.length;
      setActive(activeIndex);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && current[activeIndex]) {
        e.preventDefault();
        openArticle(current[activeIndex]);
      } else if (input.value.trim()) {
        toast("Searching for “" + input.value.trim() + "”…");
      }
    } else if (e.key === "Escape") {
      if (!results.hidden) { closeResults(); }
      else { input.blur(); }
    }
  });

  results.addEventListener("click", function (e) {
    var li = e.target.closest("[data-i]");
    if (!li) return;
    var a = current[parseInt(li.getAttribute("data-i"), 10)];
    if (a) openArticle(a);
  });

  results.addEventListener("mousemove", function (e) {
    var li = e.target.closest("[data-i]");
    if (!li) return;
    var i = parseInt(li.getAttribute("data-i"), 10);
    if (i !== activeIndex) { activeIndex = i; setActive(i); }
  });

  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) closeResults();
  });

  // ── "/" focuses search ──────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input &&
        !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });

  // ── Popular-search chips run a demo search ──────────────────────
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var q = chip.getAttribute("data-query");
      input.value = q;
      input.focus();
      render(search(q), q);
      toast("Running search: “" + q + "”");
    });
  });

  // ── Topic cards ─────────────────────────────────────────────────
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Browsing topic: " + card.querySelector(".card__title").textContent);
    });
  });

  // ── Popular article rows ────────────────────────────────────────
  document.querySelectorAll("[data-article]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Opening: " + a.querySelector(".article__title").textContent);
    });
  });

  // ── Demo links (buttons, channels) ──────────────────────────────
  var DEMO = {
    signin: "Sign-in is disabled in this demo.",
    guide: "Launching the Getting Started guide…",
    chat: "Live chat — a support agent would join here.",
    email: "Opening your mail client to support@nimbus.dev…",
    community: "Heading to the community forum…"
  };
  document.querySelectorAll("[data-demo]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast(DEMO[el.getAttribute("data-demo")] || "Demo action");
    });
  });

  // Contact-us button (no data-demo) → support section anchor already works.
})();
