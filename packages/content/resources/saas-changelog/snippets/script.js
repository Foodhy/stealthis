(function () {
  "use strict";

  /* ---------------- data ---------------- */
  // Fictional release feed. `ts` is an epoch (ms) used for the "new since last visit" marker.
  var RELEASES = [
    {
      v: "2026.6.2", date: "Jun 12, 2026", ts: 1781568000000,
      types: ["new", "improved"],
      summary: "Realtime collaboration cursors and a faster project sidebar.",
      details: [
        ["Live cursors", "See teammates move and select inside any board in realtime."],
        ["Sidebar", "Project list now renders 4× faster on workspaces with 500+ projects."],
        ["Presence", "Avatar stack shows who is currently viewing a document."]
      ]
    },
    {
      v: "2026.6.1", date: "Jun 6, 2026", ts: 1781049600000,
      types: ["new"],
      summary: "Webhooks 2.0 — signed payloads, retries, and a delivery log.",
      details: [
        ["Signed payloads", "Every webhook now ships an HMAC-SHA256 signature header."],
        ["Auto-retry", "Failed deliveries retry up to 5× with exponential backoff."],
        ["Delivery log", "Inspect, filter, and replay the last 30 days of webhook events."]
      ]
    },
    {
      v: "2026.5.4", date: "May 28, 2026", ts: 1780358400000,
      types: ["improved", "fixed"],
      summary: "Export performance overhaul and several CSV edge-case fixes.",
      details: [
        ["CSV exports", "Large exports stream instead of buffering — no more 60s timeouts."],
        ["Fix", "Commas inside quoted fields no longer break column alignment."],
        ["Fix", "Date columns now respect the workspace timezone setting."]
      ]
    },
    {
      v: "2026.5.2", date: "May 19, 2026", ts: 1779580800000,
      types: ["new", "improved"],
      summary: "SAML SSO for Business plans and a redesigned login screen.",
      details: [
        ["SAML SSO", "Connect Okta, Azure AD, or any SAML 2.0 identity provider."],
        ["SCIM", "Automatic user provisioning and deprovisioning."],
        ["Login", "Cleaner, faster sign-in with passkey support."]
      ]
    },
    {
      v: "2026.5.0", date: "May 7, 2026", ts: 1778457600000,
      types: ["fixed"],
      summary: "Stability release — patched 14 reported issues across the editor.",
      details: [
        ["Editor", "Undo history no longer drops the last action after a paste."],
        ["Mobile", "Keyboard no longer obscures the comment box on iOS."],
        ["Search", "Special characters in queries are now escaped correctly."]
      ]
    },
    {
      v: "2026.4.3", date: "Apr 24, 2026", ts: 1777593600000,
      types: ["new"],
      summary: "Dark mode is here — system-aware, per-workspace, fully themed.",
      details: [
        ["Dark mode", "Automatically follows your OS setting, or pin it manually."],
        ["Charts", "All analytics charts re-tuned for low-light contrast."],
        ["API", "New `theme` field on the user preferences endpoint."]
      ]
    }
  ];

  var TYPE_LABEL = { new: "New", improved: "Improved", fixed: "Fixed" };
  var STORAGE_KEY = "nw_changelog_last_visit";

  /* ---------------- state ---------------- */
  var lastVisit = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  var activeType = "all";
  var query = "";

  /* ---------------- elements ---------------- */
  var feed = document.getElementById("feed");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var unreadLede = document.getElementById("unreadLede");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function unreadCount() {
    return RELEASES.filter(function (r) { return r.ts > lastVisit; }).length;
  }

  /* ---------------- render ---------------- */
  function render() {
    var q = query.trim().toLowerCase();
    var matches = RELEASES.filter(function (r) {
      var typeOk = activeType === "all" || r.types.indexOf(activeType) !== -1;
      if (!typeOk) return false;
      if (!q) return true;
      var hay = (r.v + " " + r.summary + " " + r.details.map(function (d) { return d.join(" "); }).join(" ")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    feed.innerHTML = "";
    emptyEl.hidden = matches.length !== 0;

    matches.forEach(function (r, i) {
      var isUnread = r.ts > lastVisit;
      var id = "rel-" + r.v.replace(/\./g, "-");

      var tags = r.types.map(function (t) {
        return '<span class="tag tag-' + t + '">' + TYPE_LABEL[t] + "</span>";
      }).join("");

      var detailItems = r.details.map(function (d) {
        return "<li><strong>" + esc(d[0]) + ":</strong> " + esc(d[1]) + "</li>";
      }).join("");

      var art = document.createElement("article");
      art.className = "release" + (isUnread ? " is-unread" : "");
      art.id = id;
      art.innerHTML =
        '<div class="release-card">' +
          '<div class="release-head">' +
            '<div class="release-meta">' +
              '<div class="release-top">' +
                '<span class="version">v' + esc(r.v) + "</span>" +
                '<span class="release-date">' + esc(r.date) + "</span>" +
                (isUnread ? '<span class="new-badge">New</span>' : "") +
              "</div>" +
              '<div class="tags">' + tags + "</div>" +
              '<p class="release-summary">' + esc(r.summary) + "</p>" +
            "</div>" +
            '<div class="release-actions">' +
              '<button class="mini-btn js-copy" type="button" aria-label="Copy link to v' + esc(r.v) + '" title="Copy link">' +
                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M9 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2"/><path d="M15 5H6a2 2 0 0 0-2 2v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
              "</button>" +
              '<button class="mini-btn js-toggle" type="button" aria-expanded="false" aria-controls="' + id + '-d" aria-label="Show details for v' + esc(r.v) + '">' +
                '<svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              "</button>" +
            "</div>" +
          "</div>" +
          '<div class="release-details" id="' + id + '-d"><div><div class="details-inner"><ul>' + detailItems + "</ul></div></div></div>" +
        "</div>";

      feed.appendChild(art);
    });

    var n = unreadCount();
    if (n > 0) {
      unreadLede.hidden = false;
      unreadLede.textContent = n + (n === 1 ? " release" : " releases") + " new since your last visit.";
    } else {
      unreadLede.hidden = true;
    }
  }

  /* ---------------- toast ---------------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>';
    el.querySelector("span").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 250);
    }, 2400);
  }

  /* ---------------- interactions ---------------- */
  feed.addEventListener("click", function (e) {
    var toggle = e.target.closest(".js-toggle");
    if (toggle) {
      var rel = toggle.closest(".release");
      var open = rel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      return;
    }
    var copy = e.target.closest(".js-copy");
    if (copy) {
      var relC = copy.closest(".release");
      var url = location.origin + location.pathname + "#" + relC.id;
      var done = function () { toast("Link copied to clipboard"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url); done(); });
      } else { fallbackCopy(url); done(); }
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }

  // filter chips
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeType = chip.getAttribute("data-type");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render();
    });
  });

  // search (debounced)
  var t;
  searchEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { query = searchEl.value; render(); }, 120);
  });

  // clear filters from empty state
  document.getElementById("clearFilters").addEventListener("click", function () {
    activeType = "all"; query = ""; searchEl.value = "";
    chips.forEach(function (c) {
      var on = c.getAttribute("data-type") === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    render();
    searchEl.focus();
  });

  // mark all as read
  document.getElementById("markRead").addEventListener("click", function () {
    lastVisit = Date.now();
    localStorage.setItem(STORAGE_KEY, String(lastVisit));
    render();
    toast("All releases marked as read");
  });

  // subscribe / rss CTAs (demo)
  document.getElementById("subscribe").addEventListener("click", function () {
    toast("Subscribed — we'll email you each release");
  });
  document.getElementById("rss").addEventListener("click", function (e) {
    e.preventDefault();
    toast("RSS feed URL copied (demo)");
  });

  // theme toggle
  var themeBtn = document.getElementById("themeToggle");
  var savedTheme = localStorage.getItem("nw_theme");
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeBtn.setAttribute("aria-pressed", "true");
  }
  themeBtn.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("nw_theme", "light"); }
    else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("nw_theme", "dark"); }
    themeBtn.setAttribute("aria-pressed", String(!dark));
  });

  /* ---------------- init ---------------- */
  render();

  // auto-open the release referenced in the URL hash, if any
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("release")) {
      target.classList.add("is-open");
      var tg = target.querySelector(".js-toggle");
      if (tg) tg.setAttribute("aria-expanded", "true");
      target.scrollIntoView({ block: "center" });
    }
  }

  // record this visit (so the "new" markers reflect *next* time) after a short read window
  setTimeout(function () {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, String(RELEASES[2].ts));
    }
  }, 1500);
})();
