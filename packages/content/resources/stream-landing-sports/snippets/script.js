(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastWrap = document.getElementById("toasts");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- data ---------- */
  var leagues = [
    { abbr: "PL", name: "Premier Division", count: "3 live", color: "#1aff6a", live: true, sport: "Football" },
    { abbr: "LL", name: "Iberia Liga", count: "10 today", color: "#ff7a3c", live: false, sport: "Football" },
    { abbr: "NB", name: "Hoops League", count: "2 live", color: "#ff3b5c", live: true, sport: "Basketball" },
    { abbr: "GT", name: "Grand Tennis", count: "6 today", color: "#3aa0ff", live: false, sport: "Tennis" },
    { abbr: "F1", name: "Apex Racing", count: "Qualy live", color: "#ffd23c", live: true, sport: "Motorsport" },
    { abbr: "NH", name: "Ice Premier", count: "4 today", color: "#9b8cff", live: false, sport: "Hockey" },
    { abbr: "MB", name: "Diamond Pro", count: "8 today", color: "#33e0c3", live: false, sport: "Baseball" },
    { abbr: "RU", name: "Scrum Union", count: "1 live", color: "#ff6fae", live: true, sport: "Rugby" },
    { abbr: "GA", name: "Open Golf", count: "Round 2", color: "#7cd84a", live: false, sport: "Golf" },
    { abbr: "CL", name: "Continental Cup", count: "Tonight", color: "#5ec8ff", live: false, sport: "Football" },
    { abbr: "VB", name: "Spike Series", count: "3 today", color: "#ffa14d", live: false, sport: "Volleyball" },
    { abbr: "MX", name: "Dirt Moto GP", count: "Practice", color: "#ff5151", live: false, sport: "Motorsport" }
  ];

  var features = [
    { ico: "📺", title: "Multi-view", desc: "Watch up to 4 matches at once on one screen, swap the main feed with a tap.", tag: "Up to 4 streams" },
    { ico: "📊", title: "Live stats overlay", desc: "Possession, xG, shot maps and player heatmaps updating in real time.", tag: "Real-time data" },
    { ico: "🔁", title: "Instant replay", desc: "Rewind any moment without missing the live action — pick your camera angle.", tag: "9 angles" },
    { ico: "🎙️", title: "Pick your commentary", desc: "Home, away, tactical or radio-style audio — switch languages on the fly.", tag: "12 languages" },
    { ico: "🔔", title: "Goal alerts", desc: "Push notifications and key-moment jumps so you never miss a goal.", tag: "Smart alerts" },
    { ico: "📱", title: "Stream anywhere", desc: "Cast to TV or keep watching on mobile in crisp 4K with zero contract.", tag: "4K · all devices" }
  ];

  var schedule = [
    { time: "LIVE", sub: "67'", sport: "Football", teams: "North Forge vs Harbor City", league: "Premier Division", live: true },
    { time: "LIVE", sub: "Q2", sport: "Basketball", teams: "Summit Kings vs Bay Surge", league: "Hoops League", live: true },
    { time: "LIVE", sub: "Lap 8", sport: "Motorsport", teams: "Apex Racing — Coastal GP", league: "Apex Racing", live: true },
    { time: "18:30", sport: "Football", teams: "Riverside Athletic vs Crown Rovers", league: "Iberia Liga", live: false },
    { time: "19:00", sport: "Tennis", teams: "Vega vs Holloway — Semi-final", league: "Grand Tennis", live: false },
    { time: "20:15", sport: "Football", teams: "Iron Valley vs Maple United", league: "Continental Cup", live: false },
    { time: "21:00", sport: "Basketball", teams: "Delta Thunder vs Pine Pacers", league: "Hoops League", live: false },
    { time: "21:45", sport: "Hockey", teams: "Glacier Wolves vs Ember Blades", league: "Ice Premier", live: false }
  ];

  var passes = [
    {
      name: "Matchday", desc: "Single sport, casual fan.", m: 9.99,
      feats: ["1 sport of your choice", "Full HD streaming", "Live stats overlay", "Watch on 1 device"], feat: false
    },
    {
      name: "All-Access", desc: "Every league, every screen.", m: 19.99,
      feats: ["All 7 sports + 30 leagues", "4K Ultra HD & multi-view", "Instant replay, 9 angles", "Watch on 3 devices", "Goal alerts & reminders"], feat: true
    },
    {
      name: "Stadium", desc: "For the whole household.", m: 29.99,
      feats: ["Everything in All-Access", "6 simultaneous streams", "Pick-your-commentary audio", "Offline match downloads", "Priority support"], feat: false
    }
  ];

  /* ---------- ticker ---------- */
  var tickerItems = [
    { t: "live", a: "North Forge", b: "Harbor City", x: "2-1 · 67'" },
    { t: "live", a: "Summit Kings", b: "Bay Surge", x: "58-54 · Q2" },
    { t: "soon", a: "Riverside Athletic", b: "Crown Rovers", x: "18:30" },
    { t: "live", a: "Apex Racing", b: "Coastal GP", x: "Lap 8/52" },
    { t: "soon", a: "Vega", b: "Holloway", x: "19:00 SF" },
    { t: "soon", a: "Iron Valley", b: "Maple United", x: "20:15" },
    { t: "live", a: "Scrum Union XI", b: "Cliff Raiders", x: "21-14 · 54'" },
    { t: "soon", a: "Delta Thunder", b: "Pine Pacers", x: "21:00" }
  ];
  var tickerTrack = document.getElementById("tickerTrack");
  if (tickerTrack) {
    var html = "";
    function row(it) {
      var lead = it.t === "live"
        ? '<span class="live"><span class="dot"></span>LIVE</span>'
        : '<span class="soon">' + it.x + '</span>';
      var tail = it.t === "live" ? '<b>' + it.x + '</b>' : '';
      return '<span class="ticker__item">' + lead +
        '<b>' + it.a + '</b> v <b>' + it.b + '</b>' + tail + '</span>';
    }
    tickerItems.forEach(function (it) { html += row(it); });
    // duplicate for seamless marquee loop (50% translate)
    tickerTrack.innerHTML = html + html;
  }

  /* ---------- leagues grid ---------- */
  var grid = document.getElementById("leaguesGrid");
  if (grid) {
    leagues.forEach(function (l) {
      var card = document.createElement("button");
      card.className = "league";
      card.type = "button";
      card.setAttribute("data-toast", "Opening " + l.name + " — " + l.sport + ".");
      card.innerHTML =
        (l.live ? '<span class="league__live" aria-hidden="true"></span>' : "") +
        '<span class="league__logo" style="background:' + l.color + '">' + l.abbr + "</span>" +
        '<span class="league__name">' + l.name + "</span>" +
        '<span class="league__count">' + l.count + "</span>";
      grid.appendChild(card);
    });
  }

  /* ---------- features ---------- */
  var fg = document.getElementById("featGrid");
  if (fg) {
    features.forEach(function (f) {
      var c = document.createElement("article");
      c.className = "feature";
      c.innerHTML =
        '<div class="feature__ico" aria-hidden="true">' + f.ico + "</div>" +
        "<h3>" + f.title + "</h3><p>" + f.desc + "</p>" +
        '<span class="feature__tag">' + f.tag + "</span>";
      fg.appendChild(c);
    });
  }

  /* ---------- schedule + filters ---------- */
  var schedList = document.getElementById("schedList");
  var schedFilters = document.getElementById("schedFilters");
  var sports = ["All"].concat(
    schedule.map(function (m) { return m.sport; })
      .filter(function (s, i, a) { return a.indexOf(s) === i; })
  );

  function renderSchedule(filter) {
    if (!schedList) return;
    schedList.innerHTML = "";
    schedule
      .filter(function (m) { return filter === "All" || m.sport === filter; })
      .forEach(function (m) {
        var li = document.createElement("li");
        li.className = "match" + (m.live ? " is-live" : "");
        var timeHtml = m.live
          ? '<div class="match__time"><span class="now">LIVE</span>' + m.sub + "</div>"
          : '<div class="match__time">' + m.time + "</div>";
        li.innerHTML =
          timeHtml +
          '<div class="match__info">' +
          '<div class="match__teams"><span class="match__sport">' + m.sport + "</span>" + m.teams + "</div>" +
          '<div class="match__league">' + m.league + "</div></div>";
        var btn = document.createElement("button");
        btn.className = "match__btn";
        btn.type = "button";
        if (m.live) {
          btn.textContent = "Watch live";
          btn.addEventListener("click", function () { toast("Joining " + m.teams + " live…"); });
        } else {
          btn.textContent = "Remind me";
          btn.addEventListener("click", function () {
            if (btn.classList.contains("is-set")) {
              btn.classList.remove("is-set");
              btn.textContent = "Remind me";
              toast("Reminder removed for " + m.teams + ".");
            } else {
              btn.classList.add("is-set");
              btn.textContent = "✓ Reminder set";
              toast("We'll alert you before " + m.teams + " (" + m.time + ").");
            }
          });
        }
        li.appendChild(btn);
        schedList.appendChild(li);
      });
  }

  if (schedFilters) {
    sports.forEach(function (s, i) {
      var b = document.createElement("button");
      b.className = "filter" + (i === 0 ? " is-active" : "");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.textContent = s;
      b.addEventListener("click", function () {
        schedFilters.querySelectorAll(".filter").forEach(function (x) {
          x.classList.remove("is-active");
          x.setAttribute("aria-selected", "false");
        });
        b.classList.add("is-active");
        b.setAttribute("aria-selected", "true");
        renderSchedule(s);
      });
      schedFilters.appendChild(b);
    });
  }
  renderSchedule("All");

  /* ---------- passes + billing ---------- */
  var passGrid = document.getElementById("passGrid");
  var billSwitch = document.getElementById("billSwitch");
  var lblMonthly = document.getElementById("lblMonthly");
  var lblAnnual = document.getElementById("lblAnnual");
  var annual = false;

  function fmt(n) { return "$" + n.toFixed(2); }

  function renderPasses() {
    if (!passGrid) return;
    passGrid.innerHTML = "";
    passes.forEach(function (p) {
      var monthly = annual ? +(p.m * 0.75).toFixed(2) : p.m;
      var note = annual ? "Billed " + fmt(monthly * 12) + "/yr · save 25%" : "Billed monthly";
      var card = document.createElement("article");
      card.className = "pass" + (p.feat ? " pass--feat" : "");
      card.innerHTML =
        (p.feat ? '<span class="pass__pop">Most popular</span>' : "") +
        '<div class="pass__name">' + p.name + "</div>" +
        '<div class="pass__desc">' + p.desc + "</div>" +
        '<div class="pass__price"><span class="pass__amt">' + fmt(monthly) + '</span><span class="pass__per">/mo</span></div>' +
        '<div class="pass__note">' + note + "</div>" +
        "<ul>" + p.feats.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>";
      var btn = document.createElement("button");
      btn.className = "btn " + (p.feat ? "btn--brand" : "btn--outline") + " btn--block";
      btn.type = "button";
      btn.textContent = "Choose " + p.name;
      btn.addEventListener("click", function () {
        toast(p.name + " pass selected — " + fmt(monthly) + "/mo. Free week starts now!");
      });
      card.appendChild(btn);
      passGrid.appendChild(card);
    });
  }

  if (billSwitch) {
    billSwitch.addEventListener("click", function () {
      annual = !annual;
      billSwitch.setAttribute("aria-checked", String(annual));
      lblMonthly.classList.toggle("is-on", !annual);
      lblAnnual.classList.toggle("is-on", annual);
      renderPasses();
    });
  }
  renderPasses();

  /* ---------- live score simulation ---------- */
  var clockEl = document.getElementById("matchClock");
  var scoreEl = document.getElementById("scoreLine");
  var minute = 67, home = 2, away = 1;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (clockEl && !prefersReduced) {
    setInterval(function () {
      minute = minute >= 90 ? 90 : minute + 1;
      clockEl.textContent = minute + "'";
      // occasional goal
      if (Math.random() < 0.08 && minute < 90) {
        if (Math.random() < 0.55) home++; else away++;
        if (scoreEl) scoreEl.textContent = home + " — " + away;
        toast("⚽ GOAL! " + (Math.random() < 0.5 ? "North Forge" : "Harbor City") +
          " now " + home + "-" + away + ".");
      }
    }, 3500);
  }

  /* ---------- nav scroll state + mobile menu ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  var burger = document.getElementById("burger");
  var mnav = document.getElementById("mnav");
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = mnav.hasAttribute("hidden");
      if (open) { mnav.removeAttribute("hidden"); }
      else { mnav.setAttribute("hidden", ""); }
      burger.setAttribute("aria-expanded", String(open));
    });
    mnav.querySelectorAll("a, .btn").forEach(function (a) {
      a.addEventListener("click", function () {
        mnav.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }
})();
