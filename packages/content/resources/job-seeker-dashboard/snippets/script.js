(function () {
  "use strict";

  // ---------- Data (fictional) ----------
  var STATUS = {
    applied:   { label: "Applied",    cls: "applied" },
    review:    { label: "In review",  cls: "review" },
    interview: { label: "Interview",  cls: "interview" },
    offer:     { label: "Offer",      cls: "offer" },
    rejected:  { label: "Rejected",   cls: "rejected" }
  };

  function logoColor(seed) {
    var palette = ["#2563eb", "#7c3aed", "#0891b2", "#db2777", "#ea580c", "#16a34a", "#475569"];
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  var apps = [
    { id: "a1", role: "Senior Frontend Engineer", company: "Helio Labs", location: "Berlin, DE", remote: true, salary: "€85k–105k", status: "interview", when: "Applied 9 days ago", note: "Round 2 · Tue 3:00pm" },
    { id: "a2", role: "UI Engineer, Design Systems", company: "Mapleview", location: "Remote (EU)", remote: true, salary: "€70k–90k", status: "review", when: "Applied 4 days ago", note: "Recruiter viewed your profile" },
    { id: "a3", role: "Lead Product Engineer", company: "Quill & Co.", location: "London, UK", remote: false, salary: "£90k–110k", status: "offer", when: "Applied 21 days ago", note: "Offer expires in 5 days" },
    { id: "a4", role: "Frontend Developer", company: "Brightside", location: "Amsterdam, NL", remote: true, salary: "€60k–78k", status: "applied", when: "Applied 2 days ago", note: "Application received" },
    { id: "a5", role: "React Engineer", company: "Tidepool", location: "Remote (Global)", remote: true, salary: "$95k–120k", status: "rejected", when: "Applied 18 days ago", note: "Position filled internally" },
    { id: "a6", role: "Staff Web Engineer", company: "Northstar", location: "Munich, DE", remote: false, salary: "€100k–125k", status: "review", when: "Applied 6 days ago", note: "Take-home in progress" }
  ];

  var saved = [
    { id: "s1", role: "Frontend Architect", company: "Lumen Studio", location: "Remote (EU)", remote: true, salary: "€95k+" },
    { id: "s2", role: "Senior React Engineer", company: "Cobalt", location: "Lisbon, PT", remote: true, salary: "€72k–88k" },
    { id: "s3", role: "Design Engineer", company: "Foxglove", location: "Paris, FR", remote: false, salary: "€68k–82k" }
  ];

  var recommended = [
    { id: "r1", role: "Principal Frontend Engineer", company: "Aerial", location: "Remote", remote: true, salary: "€110k+", match: "94% match" },
    { id: "r2", role: "UI Platform Engineer", company: "Vellum", location: "Rotterdam, NL", remote: true, salary: "€80k–96k", match: "89% match" }
  ];

  var withdrawn = {};
  var activeFilter = "all";

  // ---------- Toast ----------
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    var ic = kind === "warn"
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 9v4m0 4h.01M10.3 4.3 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" stroke="#fff" stroke-width="1.8"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="m5 13 4 4L19 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    el.innerHTML = ic + "<span></span>";
    el.querySelector("span").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("hide");
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  // ---------- Logo helper ----------
  function logoEl(company, sizeClass) {
    return '<span class="logo' + (sizeClass ? " " + sizeClass : "") +
      '" style="background:' + logoColor(company) + '">' + initials(company) + "</span>";
  }
  function chips(item) {
    var out = '<span class="chip">' +
      '<svg viewBox="0 0 24 24" width="11" height="11" fill="none"><path d="M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>' +
      item.location + "</span>";
    if (item.remote) out += '<span class="chip remote">Remote</span>';
    if (item.salary) out += '<span class="chip salary">' + item.salary + "</span>";
    return out;
  }

  // ---------- Render application list ----------
  var appList = document.getElementById("appList");
  var emptyState = document.getElementById("emptyState");

  function renderApps() {
    appList.innerHTML = "";
    var visible = apps.filter(function (a) {
      var st = withdrawn[a.id] ? "withdrawn" : a.status;
      if (activeFilter === "all") return true;
      return st === activeFilter;
    });

    emptyState.hidden = visible.length > 0;

    visible.forEach(function (a) {
      var isW = !!withdrawn[a.id];
      var st = STATUS[a.status];
      var card = document.createElement("article");
      card.className = "app" + (isW ? " withdrawn" : "");

      var statusHtml = isW
        ? '<span class="status rejected">Withdrawn</span>'
        : '<span class="status ' + st.cls + '">' + st.label + "</span>";

      var actions = isW
        ? '<button class="btn sm" type="button" data-act="reapply" data-id="' + a.id + '">Re-apply</button>'
        : '<button class="btn sm ghost" type="button" data-act="withdraw" data-id="' + a.id + '">Withdraw</button>';

      card.innerHTML =
        logoEl(a.company) +
        '<div class="app-main">' +
          '<h3 class="app-title">' + a.role + "</h3>" +
          '<span class="app-co">' + a.company + "</span>" +
          '<div class="app-meta">' + chips(a) + "</div>" +
          '<div class="app-sub"><span>' + a.when + "</span>" +
            '<span class="dotsep" aria-hidden="true"></span><span>' + a.note + "</span></div>" +
        "</div>" +
        '<div class="app-side">' + statusHtml +
          '<div class="app-actions">' + actions + "</div>" +
        "</div>";

      appList.appendChild(card);
    });
  }

  appList.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var app = apps.find(function (a) { return a.id === id; });
    if (!app) return;

    if (btn.getAttribute("data-act") === "withdraw") {
      withdrawn[id] = true;
      toast("Withdrew application to " + app.company, "warn");
    } else {
      delete withdrawn[id];
      toast("Re-applied to " + app.company, "ok");
    }
    renderApps();
    renderFilters();
    renderStats();
  });

  // ---------- Filters ----------
  var filterBar = document.getElementById("filterBar");
  var FILTERS = [
    { key: "all", label: "All" },
    { key: "applied", label: "Applied" },
    { key: "review", label: "In review" },
    { key: "interview", label: "Interview" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
    { key: "withdrawn", label: "Withdrawn" }
  ];

  function countFor(key) {
    return apps.filter(function (a) {
      var st = withdrawn[a.id] ? "withdrawn" : a.status;
      if (key === "all") return true;
      return st === key;
    }).length;
  }

  function renderFilters() {
    filterBar.innerHTML = "";
    FILTERS.forEach(function (f) {
      var n = countFor(f.key);
      if (f.key === "withdrawn" && n === 0) return;
      var b = document.createElement("button");
      b.className = "fbtn";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(activeFilter === f.key));
      b.innerHTML = f.label + ' <span class="pill-n">' + n + "</span>";
      b.addEventListener("click", function () {
        activeFilter = f.key;
        renderApps();
        renderFilters();
      });
      filterBar.appendChild(b);
    });
  }

  // ---------- Stats ----------
  var statStrip = document.getElementById("statStrip");
  var totalApps = document.getElementById("totalApps");
  function renderStats() {
    var active = apps.filter(function (a) { return !withdrawn[a.id]; }).length;
    totalApps.textContent = active;
    var data = [
      { n: countFor("interview"), l: "Interviews" },
      { n: countFor("offer"), l: "Offers" },
      { n: countFor("review"), l: "In review" }
    ];
    statStrip.innerHTML = data.map(function (d) {
      return '<div class="stat"><b>' + d.n + "</b><span>" + d.l + "</span></div>";
    }).join("");
  }

  // ---------- Saved jobs ----------
  var savedList = document.getElementById("savedList");
  var savedCount = document.getElementById("savedCount");
  function renderSaved() {
    savedList.innerHTML = "";
    savedCount.textContent = saved.length;
    saved.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "mini";
      li.innerHTML =
        '<div class="mini-top">' + logoEl(s.company) +
          '<div><div class="mini-title">' + s.role + '</div><div class="mini-co">' + s.company + "</div></div>" +
          '<button class="bookmark" type="button" aria-pressed="true" aria-label="Remove from saved" data-id="' + s.id + '">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>' +
          "</button></div>" +
        '<div class="mini-meta">' + chips(s) + "</div>" +
        '<div class="mini-actions">' +
          '<button class="btn primary sm" type="button" data-resume="' + s.id + '">Resume application</button>' +
        "</div>";
      savedList.appendChild(li);
    });
  }

  savedList.addEventListener("click", function (e) {
    var bm = e.target.closest(".bookmark");
    if (bm) {
      var rid = bm.getAttribute("data-id");
      saved = saved.filter(function (s) { return s.id !== rid; });
      renderSaved();
      toast("Removed from saved jobs", "warn");
      return;
    }
    var rb = e.target.closest("button[data-resume]");
    if (rb) {
      var sid = rb.getAttribute("data-resume");
      var job = saved.find(function (s) { return s.id === sid; });
      if (!job) return;
      // Move saved -> applications as a fresh "applied"
      apps.unshift({
        id: "n" + Date.now(),
        role: job.role, company: job.company, location: job.location,
        remote: job.remote, salary: job.salary, status: "applied",
        when: "Applied just now", note: "Resumed from saved jobs"
      });
      saved = saved.filter(function (s) { return s.id !== sid; });
      renderSaved(); renderApps(); renderFilters(); renderStats();
      activeFilter = "all";
      renderFilters();
      toast("Application submitted to " + job.company, "ok");
    }
  });

  // ---------- Recommended ----------
  var recList = document.getElementById("recList");
  function renderRec() {
    recList.innerHTML = "";
    recommended.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "mini";
      li.innerHTML =
        '<div class="mini-top">' + logoEl(r.company) +
          '<div><div class="mini-title">' + r.role + '</div><div class="mini-co">' + r.company + "</div></div>" +
          '<button class="bookmark" type="button" aria-pressed="false" aria-label="Save job" data-rec="' + r.id + '">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>' +
          "</button></div>" +
        '<div class="mini-meta"><span class="chip salary">' + r.match + "</span>" + chips(r) + "</div>";
      recList.appendChild(li);
    });
  }

  recList.addEventListener("click", function (e) {
    var bm = e.target.closest(".bookmark");
    if (!bm) return;
    var pressed = bm.getAttribute("aria-pressed") === "true";
    if (pressed) return;
    var rid = bm.getAttribute("data-rec");
    var rec = recommended.find(function (r) { return r.id === rid; });
    if (!rec) return;
    bm.setAttribute("aria-pressed", "true");
    bm.setAttribute("aria-label", "Saved");
    bm.querySelector("svg").setAttribute("fill", "currentColor");
    bm.querySelector("svg").removeAttribute("stroke");
    saved.push({ id: "sv" + Date.now(), role: rec.role, company: rec.company, location: rec.location, remote: rec.remote, salary: rec.salary });
    renderSaved();
    toast("Saved " + rec.role, "ok");
  });

  // ---------- Profile completeness nudges ----------
  var pct = 78;
  var pctBar = document.getElementById("pctBar");
  var pctLabel = document.getElementById("pctLabel");
  var bar = pctBar.parentElement;
  var nudgeList = document.getElementById("nudgeList");
  var GAIN = { portfolio: 8, skills: 9, photo: 5 };

  nudgeList.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-nudge]");
    if (!btn) return;
    var li = btn.parentElement;
    if (li.classList.contains("done")) return;
    var key = btn.getAttribute("data-nudge");
    pct = Math.min(100, pct + (GAIN[key] || 0));
    li.classList.add("done");
    pctBar.style.width = pct + "%";
    pctLabel.textContent = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
    toast("Profile updated · " + pct + "% complete", "ok");
  });

  // ---------- Init ----------
  renderApps();
  renderFilters();
  renderStats();
  renderSaved();
  renderRec();
})();
