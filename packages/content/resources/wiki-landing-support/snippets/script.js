(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------- Article index (fictional) ---------------- */
  var ARTICLES = [
    { title: "How to reset your password and recover a locked account", cat: "Account", read: "3 min", kw: "reset password forgot login locked recover account" },
    { title: "Create, scope and rotate an API key", cat: "API", read: "4 min", kw: "api key token rotate bearer developer aurora" },
    { title: "Download invoices and update billing details", cat: "Billing", read: "2 min", kw: "invoice billing receipt pdf payment card tax" },
    { title: "Invite teammates and manage workspace roles", cat: "Getting Started", read: "3 min", kw: "invite team member teammate role workspace seat" },
    { title: "Why is my deploy stuck on Queued?", cat: "Troubleshooting", read: "5 min", kw: "deploy stuck queued build error troubleshoot slow" },
    { title: "Enable two-factor authentication and recovery codes", cat: "Security", read: "4 min", kw: "2fa two factor authentication mfa recovery codes security" },
    { title: "Export all of your workspace data", cat: "Account", read: "3 min", kw: "export data download archive backup json csv" },
    { title: "Upgrade, downgrade or cancel your plan", cat: "Billing", read: "3 min", kw: "upgrade downgrade cancel plan subscription billing" },
    { title: "Set up single sign-on (SSO) with SAML", cat: "Security", read: "6 min", kw: "sso saml single sign on identity provider okta security" },
    { title: "Configure webhooks for project events", cat: "API", read: "5 min", kw: "webhook event api integration payload endpoint" },
    { title: "Understand rate limits on the Aurora API", cat: "API", read: "4 min", kw: "rate limit api throttle 429 quota aurora" },
    { title: "Add a custom domain to your workspace", cat: "Getting Started", read: "4 min", kw: "custom domain dns cname workspace setup" },
    { title: "Fix sync errors between devices", cat: "Troubleshooting", read: "4 min", kw: "sync error devices conflict offline troubleshoot" },
    { title: "Change your account email address", cat: "Account", read: "2 min", kw: "change email address account profile login" },
    { title: "Apply a tax ID or VAT number to invoices", cat: "Billing", read: "2 min", kw: "tax vat id invoice billing eu number" },
  ];

  /* ---------------- Live search ---------------- */
  var form = document.getElementById("searchForm");
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var clearBtn = document.getElementById("searchClear");
  var activeIndex = -1;
  var currentMatches = [];

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(title, query) {
    var safe = escapeHtml(title);
    var terms = query.trim().split(/\s+/).filter(Boolean);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      safe = safe.replace(re, "<mark>$1</mark>");
    });
    return safe;
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/).filter(Boolean);
    return ARTICLES.map(function (a) {
      var hay = (a.title + " " + a.kw + " " + a.cat).toLowerCase();
      var score = 0;
      terms.forEach(function (t) {
        if (hay.indexOf(t) !== -1) score += 1;
        if (a.title.toLowerCase().indexOf(t) !== -1) score += 1;
      });
      return { a: a, score: score };
    })
      .filter(function (m) { return m.score > 0; })
      .sort(function (x, y) { return y.score - x.score; })
      .slice(0, 6)
      .map(function (m) { return m.a; });
  }

  function renderResults(query) {
    currentMatches = search(query);
    activeIndex = -1;

    if (!query.trim()) {
      hideResults();
      return;
    }

    if (currentMatches.length === 0) {
      results.innerHTML =
        '<div class="result result--empty">No articles match “' +
        escapeHtml(query) +
        "”. Try different keywords or contact support.</div>";
    } else {
      results.innerHTML = currentMatches
        .map(function (a, i) {
          return (
            '<div class="result" role="option" id="result-' + i + '" tabindex="-1">' +
            '<span class="result__title">' + highlight(a.title, query) + "</span>" +
            '<span class="result__meta">' + a.cat + " · " + a.read + " read</span>" +
            "</div>"
          );
        })
        .join("");
    }
    showResults();
  }

  function showResults() {
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  function hideResults() {
    results.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function openArticle(a) {
    if (a) toast("Opening: " + a.title);
    hideResults();
  }

  function setActive(i) {
    var nodes = results.querySelectorAll(".result");
    nodes.forEach(function (n) { n.classList.remove("is-active"); });
    if (i >= 0 && i < nodes.length) {
      nodes[i].classList.add("is-active");
      input.setAttribute("aria-activedescendant", "result-" + i);
      nodes[i].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  if (input) {
    input.addEventListener("input", function () {
      clearBtn.hidden = input.value.length === 0;
      renderResults(input.value);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) renderResults(input.value);
    });

    input.addEventListener("keydown", function (e) {
      var max = currentMatches.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!max) return;
        activeIndex = (activeIndex + 1) % max;
        setActive(activeIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!max) return;
        activeIndex = (activeIndex - 1 + max) % max;
        setActive(activeIndex);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0) {
          e.preventDefault();
          openArticle(currentMatches[activeIndex]);
        }
      } else if (e.key === "Escape") {
        hideResults();
      }
    });

    results.addEventListener("click", function (e) {
      var node = e.target.closest(".result");
      if (!node || node.classList.contains("result--empty")) return;
      var nodes = Array.prototype.slice.call(results.querySelectorAll(".result"));
      var i = nodes.indexOf(node);
      openArticle(currentMatches[i]);
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (currentMatches.length) {
        openArticle(currentMatches[activeIndex >= 0 ? activeIndex : 0]);
      } else if (input.value.trim()) {
        toast("Searching for “" + input.value.trim() + "”…");
      }
    });
    form.addEventListener("reset", function () {
      clearBtn.hidden = true;
      hideResults();
      setTimeout(function () { input.focus(); }, 0);
    });
  }

  /* Close dropdown on outside click */
  document.addEventListener("click", function (e) {
    if (form && !form.contains(e.target)) hideResults();
  });

  /* ---------------- Trending chips ---------------- */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var q = chip.getAttribute("data-q") || chip.textContent;
      input.value = q;
      clearBtn.hidden = false;
      input.focus();
      renderResults(q);
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  var faqList = document.getElementById("faqList");
  if (faqList) {
    faqList.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__btn");
      if (!btn) return;
      var panel = btn.parentElement.nextElementSibling;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  }

  /* ---------------- Was this helpful ---------------- */
  var helpful = document.getElementById("helpful");
  if (helpful) {
    helpful.addEventListener("click", function (e) {
      var btn = e.target.closest(".helpful__btn");
      if (!btn || helpful.classList.contains("is-done")) return;
      var vote = btn.getAttribute("data-vote");
      helpful.querySelectorAll(".helpful__btn").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        b.disabled = true;
      });
      helpful.classList.add("is-done");
      var q = helpful.querySelector(".helpful__q");
      if (q) q.textContent = vote === "yes"
        ? "Thanks! Glad this helped."
        : "Thanks for the feedback — we'll improve this page.";
      toast(vote === "yes" ? "Marked as helpful" : "Feedback recorded");
    });
  }

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById("navToggle");
  var topnav = document.querySelector(".topnav");
  if (navToggle && topnav) {
    topnav.id = "topnav";
    navToggle.setAttribute("aria-controls", "topnav");
    navToggle.addEventListener("click", function () {
      var open = topnav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    topnav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        topnav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- Contact actions ---------------- */
  var chatBtn = document.getElementById("chatBtn");
  if (chatBtn) chatBtn.addEventListener("click", function () {
    toast("Connecting you to a support specialist…");
  });
  var emailBtn = document.getElementById("emailBtn");
  if (emailBtn) emailBtn.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Copy help@nimbus.dev to start an email");
  });
})();
