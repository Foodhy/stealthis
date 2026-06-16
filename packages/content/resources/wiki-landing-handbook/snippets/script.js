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
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Time-of-day greeting (simulated) ---------- */
  var greetingEl = document.getElementById("greeting");
  var NAME = "Maya";
  function refreshGreeting() {
    // Simulate "company time" — drifts so the demo shows different greetings.
    var h = new Date().getHours();
    var word, emoji;
    if (h < 5) { word = "Working late"; emoji = "🌙"; }
    else if (h < 12) { word = "Good morning"; emoji = "👋"; }
    else if (h < 17) { word = "Good afternoon"; emoji = "☀️"; }
    else if (h < 21) { word = "Good evening"; emoji = "🌆"; }
    else { word = "Working late"; emoji = "🌙"; }
    if (greetingEl) greetingEl.textContent = word + ", " + NAME + " " + emoji;
  }
  refreshGreeting();
  setInterval(refreshGreeting, 60000);

  /* ---------- Search index + preview ---------- */
  var INDEX = [
    { title: "First week checklist", cat: "Onboarding", emoji: "🚀", kw: "onboarding start new hire checklist first week" },
    { title: "Setting up your laptop & SSO", cat: "Onboarding", emoji: "💻", kw: "laptop sso login setup device" },
    { title: "Onboarding buddy program v2", cat: "Onboarding", emoji: "🤝", kw: "buddy mentor onboarding match" },
    { title: "Code of conduct", cat: "Policies", emoji: "📐", kw: "conduct behavior policy ethics" },
    { title: "Remote & hybrid work", cat: "Policies", emoji: "🏠", kw: "remote hybrid work from home wfh" },
    { title: "Expense & reimbursement", cat: "Policies", emoji: "🧾", kw: "expense reimbursement travel money receipt per diem" },
    { title: "Security & data handling", cat: "Policies", emoji: "🔐", kw: "security data handling privacy vpn" },
    { title: "VPN & SSO setup guide", cat: "Engineering", emoji: "🔌", kw: "vpn network connect setup sso access" },
    { title: "Health & dental coverage", cat: "Benefits", emoji: "🩺", kw: "health dental insurance coverage medical benefits" },
    { title: "Parental leave & family support", cat: "Benefits", emoji: "👶", kw: "parental maternity paternity leave family baby time off" },
    { title: "Learning & growth stipend", cat: "Benefits", emoji: "📚", kw: "learning growth stipend education course budget" },
    { title: "401(k) & equity basics", cat: "Benefits", emoji: "📈", kw: "401k equity stock retirement benefits" },
    { title: "Dev environment setup", cat: "Engineering", emoji: "🛠️", kw: "dev environment setup local engineering" },
    { title: "On-call & incident response", cat: "Engineering", emoji: "🚨", kw: "on-call oncall incident pager nimbus rotation" },
    { title: "Code review guidelines", cat: "Engineering", emoji: "🔎", kw: "code review pull request guidelines engineering" },
    { title: "Deploying to Nimbus", cat: "Engineering", emoji: "🚀", kw: "deploy nimbus release ship production" },
    { title: "How to request time off", cat: "People Ops", emoji: "🌴", kw: "time off pto vacation leave request holiday" },
    { title: "Performance & growth cycles", cat: "People Ops", emoji: "🌱", kw: "performance review growth promotion cycle" },
    { title: "Internal transfers", cat: "People Ops", emoji: "🔁", kw: "internal transfer move team role change" },
    { title: "Org chart & teams", cat: "People Ops", emoji: "🗂️", kw: "org chart teams structure people" }
  ];

  var heroInput = document.getElementById("heroSearch");
  var resultsBox = document.getElementById("searchResults");
  var activeIndex = -1;
  var currentMatches = [];

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(title, q) {
    var safe = escapeHtml(title);
    if (!q) return safe;
    var i = title.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return safe;
    var pre = escapeHtml(title.slice(0, i));
    var mid = escapeHtml(title.slice(i, i + q.length));
    var post = escapeHtml(title.slice(i + q.length));
    return pre + "<mark>" + mid + "</mark>" + post;
  }

  function search(q) {
    var query = q.trim().toLowerCase();
    if (!query) return [];
    return INDEX.filter(function (item) {
      return (item.title + " " + item.cat + " " + item.kw).toLowerCase().indexOf(query) > -1;
    }).slice(0, 7);
  }

  function renderResults(q) {
    currentMatches = search(q);
    activeIndex = -1;
    if (!q.trim()) {
      closeResults();
      return;
    }
    if (!currentMatches.length) {
      resultsBox.innerHTML = '<div class="sr-empty">No pages match “' + escapeHtml(q) + '”. Try a broader term.</div>';
    } else {
      var html = '<div class="sr-group-label">' + currentMatches.length + ' result' + (currentMatches.length > 1 ? "s" : "") + "</div>";
      html += currentMatches.map(function (item, idx) {
        return '<div class="sr-item" role="option" data-idx="' + idx + '">' +
          '<span class="sr-emoji" aria-hidden="true">' + item.emoji + "</span>" +
          '<span class="sr-text"><span class="sr-title">' + highlight(item.title, q) + "</span>" +
          '<span class="sr-cat">' + escapeHtml(item.cat) + "</span></span>" +
          '<span class="sr-arrow" aria-hidden="true">↵</span></div>';
      }).join("");
      resultsBox.innerHTML = html;
    }
    openResults();
  }

  function openResults() {
    resultsBox.hidden = false;
    heroInput.setAttribute("aria-expanded", "true");
  }
  function closeResults() {
    resultsBox.hidden = true;
    heroInput.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function setActive(idx) {
    var items = resultsBox.querySelectorAll(".sr-item");
    if (!items.length) return;
    activeIndex = (idx + items.length) % items.length;
    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === activeIndex);
    });
    items[activeIndex].scrollIntoView({ block: "nearest" });
  }

  function pick(idx) {
    if (idx < 0 || idx >= currentMatches.length) return;
    var item = currentMatches[idx];
    toast("Opening “" + item.title + "” · " + item.cat);
    closeResults();
  }

  if (heroInput) {
    heroInput.addEventListener("input", function () {
      renderResults(heroInput.value);
    });
    heroInput.addEventListener("focus", function () {
      if (heroInput.value.trim()) renderResults(heroInput.value);
    });
    heroInput.addEventListener("keydown", function (e) {
      if (resultsBox.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        pick(activeIndex >= 0 ? activeIndex : 0);
      } else if (e.key === "Escape") { closeResults(); }
    });
    resultsBox.addEventListener("mousedown", function (e) {
      var item = e.target.closest(".sr-item");
      if (item) { e.preventDefault(); pick(parseInt(item.dataset.idx, 10)); }
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".hero-search")) closeResults();
  });

  /* ---------- Popular-search chips ---------- */
  document.querySelectorAll(".chip[data-q]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      heroInput.value = chip.dataset.q;
      heroInput.focus();
      renderResults(chip.dataset.q);
    });
  });

  /* ---------- Top search → focuses hero ---------- */
  var topSearch = document.getElementById("topSearch");
  if (topSearch) {
    topSearch.addEventListener("focus", function () {
      topSearch.blur();
      heroInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { heroInput.focus(); }, 240);
    });
  }

  /* ---------- "/" keyboard shortcut ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== heroInput &&
        !/^(input|textarea)$/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      heroInput.focus();
    }
  });

  /* ---------- Collapsible quick-link sections ---------- */
  document.querySelectorAll(".ql-toggle").forEach(function (btn) {
    var card = btn.closest(".ql-card");
    var accent = card.getAttribute("data-accent");
    if (accent) card.style.setProperty("--accent-c", accent);
    btn.addEventListener("click", function () {
      var collapsed = card.classList.toggle("is-collapsed");
      btn.setAttribute("aria-expanded", String(!collapsed));
    });
  });

  /* ---------- Set quick-link card accents (CTA + cards) ---------- */
  document.querySelectorAll(".ql-card[data-accent]").forEach(function (card) {
    card.style.setProperty("--accent-c", card.getAttribute("data-accent"));
  });

  /* ---------- Avatar hue ---------- */
  document.querySelectorAll(".avatar[data-hue]").forEach(function (av) {
    av.style.setProperty("--hue", av.getAttribute("data-hue"));
  });

  /* ---------- Mobile sidebar drawer ---------- */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  function setDrawer(open) {
    sidebar.classList.toggle("open", open);
    scrim.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
  }
  if (navToggle) navToggle.addEventListener("click", function () {
    setDrawer(!sidebar.classList.contains("open"));
  });
  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });

  /* ---------- Sidebar active link via scroll spy ---------- */
  var sideLinks = Array.prototype.slice.call(document.querySelectorAll(".side-nav a[href^='#']"));
  var sections = sideLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  sideLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.innerWidth <= 820) setDrawer(false);
    });
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          sideLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- User chip + contact channel copy ---------- */
  var userChip = document.getElementById("userChip");
  if (userChip) userChip.addEventListener("click", function () {
    toast("Signed in as Maya Okafor · Engineering");
  });

  document.querySelectorAll(".contact").forEach(function (c) {
    c.addEventListener("click", function () {
      var name = c.querySelector("strong").textContent;
      var ch = c.querySelector(".contact-meta").textContent;
      toast("Say hi to " + name + " in " + ch);
    });
  });

  /* ---------- Update + popular link clicks ---------- */
  document.querySelectorAll(".update-list a, .popular-list a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Opening “" + a.textContent.trim() + "”");
    });
  });

})();
