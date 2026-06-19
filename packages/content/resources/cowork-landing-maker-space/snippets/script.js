/* ============================================================
   FORGEWORKS — Maker Space landing
   Vanilla JS. No external libraries.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobile();
    });
  });

  /* ---------- data-toast triggers ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- nav: scrolled shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    if (!burger || !mobileNav) return;
    burger.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
  }

  /* ---------- live machine status panel ---------- */
  var machineList = document.getElementById("machineList");
  var refreshBtn = document.getElementById("refreshBtn");

  var fleet = [
    { name: "Prusa XL · Bay 01", icon: "ic-print", metaRun: "PETG · layer 184/620", metaFree: "spool loaded · cleared" },
    { name: "Shapeoko CNC · Bay 04", icon: "ic-cnc", metaRun: "facing pass · 12%", metaFree: "spindle idle · cleared" },
    { name: "Glowforge Pro · Bay 06", icon: "ic-laser", metaRun: "cut 3/8 · 6mm ply", metaFree: "lens clean · ready", metaRes: "booked 14:00 · M. Okafor" },
    { name: "Electronics Bench · 09", icon: "ic-elec", metaRun: "reflow oven · 218°C", metaFree: "bench wiped · stocked" }
  ];
  var states = [
    { key: "running", tag: "RUNNING", cls: "tag-run", bar: true },
    { key: "free", tag: "FREE", cls: "tag-free", bar: false },
    { key: "reserved", tag: "RESERVED", cls: "tag-res", bar: false }
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function renderFleet(first) {
    if (!machineList) return;
    machineList.innerHTML = "";
    var anyRunning = false;
    fleet.forEach(function (m, i) {
      // keep first render deterministic-ish but varied
      var st = first
        ? states[i % states.length]
        : pick(states);
      // reserved only valid where a reserved meta exists
      if (st.key === "reserved" && !m.metaRes) st = states[1];
      var meta = st.key === "running" ? m.metaRun
        : st.key === "reserved" ? m.metaRes
        : m.metaFree;
      if (st.key === "running") anyRunning = true;

      var li = document.createElement("li");
      li.className = "machine";
      li.setAttribute("data-state", st.key);
      var bar = st.bar
        ? '<span class="machine__bar"><i style="width:' + (15 + Math.floor(Math.random() * 80)) + '%"></i></span>'
        : "";
      li.innerHTML =
        '<span class="machine__icon ' + m.icon + '" aria-hidden="true"></span>' +
        '<span class="machine__body">' +
        '<span class="machine__name">' + m.name + "</span>" +
        '<span class="machine__meta">' + meta + "</span>" +
        bar +
        "</span>" +
        '<span class="machine__tag ' + st.cls + '">' + st.tag + "</span>";
      machineList.appendChild(li);
    });
    return anyRunning;
  }
  renderFleet(true);

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshBtn.classList.add("is-spin");
      setTimeout(function () { refreshBtn.classList.remove("is-spin"); }, 520);
      var running = renderFleet(false);
      toast(running ? "Floor synced — machines active now." : "Floor synced — all bays free.");
    });
  }

  /* ---------- workshops (data-driven + filter) ---------- */
  var wsGrid = document.getElementById("wsGrid");
  var workshops = [
    { title: "3D Printing Sign-off", level: "intro", lvlTxt: "INTRO", when: "Tue · 18:30 · 90m", seats: 4, badge: "Print badge" },
    { title: "Fusion 360 → CNC", level: "cert", lvlTxt: "CERT", when: "Wed · 18:00 · 3h", seats: 2, badge: "CNC badge" },
    { title: "Laser Cutter Safety", level: "cert", lvlTxt: "CERT", when: "Thu · 19:00 · 2h", seats: 6, badge: "Laser badge" },
    { title: "SMD Soldering Lab", level: "intro", lvlTxt: "INTRO", when: "Sat · 11:00 · 2h", seats: 0, badge: "Solder badge" },
    { title: "5-Axis Toolpaths", level: "adv", lvlTxt: "ADV", when: "Sat · 14:00 · 4h", seats: 3, badge: "CNC pro" },
    { title: "KiCad to PCB Mill", level: "adv", lvlTxt: "ADV", when: "Sun · 13:00 · 3h", seats: 5, badge: "Fab pro" }
  ];

  function lvlClass(l) {
    return l === "intro" ? "lvl-intro" : l === "cert" ? "lvl-cert" : "lvl-adv";
  }

  function renderWorkshops(level) {
    if (!wsGrid) return;
    wsGrid.innerHTML = "";
    var list = workshops.filter(function (w) {
      return level === "all" || w.level === level;
    });
    if (!list.length) {
      wsGrid.innerHTML = '<p class="ws__empty" style="color:var(--muted);font-family:var(--mono);font-size:.85rem">No sessions on this track this week — check back soon.</p>';
      return;
    }
    list.forEach(function (w, i) {
      var full = w.seats <= 0;
      var card = document.createElement("article");
      card.className = "ws";
      card.style.animationDelay = (i * 45) + "ms";
      card.innerHTML =
        '<div class="ws__top">' +
        '<span class="ws__lvl ' + lvlClass(w.level) + '">' + w.lvlTxt + "</span>" +
        '<span class="ws__seats">' + (full ? "waitlist" : w.seats + " seats left") + "</span>" +
        "</div>" +
        "<h3>" + w.title + "</h3>" +
        '<p class="ws__desc">Unlocks the <b>' + w.badge + "</b> on pass. Bring a laptop; PPE provided.</p>" +
        '<div class="ws__foot">' +
        '<span class="ws__when">' + w.when + "</span>" +
        '<button class="ws__btn' + (full ? " is-full" : "") + '" type="button">' +
        (full ? "Full" : "Reserve") + "</button>" +
        "</div>";
      var btn = card.querySelector(".ws__btn");
      if (!full) {
        btn.addEventListener("click", function () {
          w.seats -= 1;
          toast("Seat reserved · " + w.title + " · " + w.when);
          renderWorkshops(currentLevel);
        });
      }
      wsGrid.appendChild(card);
    });
  }

  var currentLevel = "all";
  var wsTabs = document.querySelectorAll(".ws-tab");
  wsTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      wsTabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      currentLevel = tab.getAttribute("data-level");
      renderWorkshops(currentLevel);
    });
  });
  renderWorkshops("all");

  /* ---------- membership billing toggle ---------- */
  var billSwitch = document.getElementById("billSwitch");
  var lblMo = document.getElementById("lblMo");
  var lblYr = document.getElementById("lblYr");
  var amounts = document.querySelectorAll(".tier__price .amt");
  var perEls = document.querySelectorAll(".tier__price .per");

  function setBilling(yearly) {
    billSwitch.setAttribute("aria-checked", String(yearly));
    if (lblMo) lblMo.classList.toggle("is-dim", yearly);
    if (lblYr) lblYr.classList.toggle("is-dim", !yearly);
    amounts.forEach(function (amt) {
      var v = yearly ? amt.getAttribute("data-yr") : amt.getAttribute("data-mo");
      animateNumber(amt, parseInt(v, 10));
    });
    perEls.forEach(function (p) { p.textContent = yearly ? "/mo billed yearly" : "/mo"; });
  }

  function animateNumber(el, target) {
    var start = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    var dur = 320, t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var ease = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(start + (target - start) * ease);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (billSwitch) {
    billSwitch.addEventListener("click", function () {
      var yearly = billSwitch.getAttribute("aria-checked") !== "true";
      setBilling(yearly);
    });
  }

  /* ---------- CTA form validation ---------- */
  var joinForm = document.getElementById("joinForm");
  var joinEmail = document.getElementById("joinEmail");
  var joinErr = document.getElementById("joinErr");
  if (joinForm) {
    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (joinEmail.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        if (joinErr) joinErr.hidden = false;
        joinEmail.focus();
        return;
      }
      if (joinErr) joinErr.hidden = true;
      joinForm.reset();
      toast("Day pass on the way — check " + val + " for your slot.");
    });
    joinEmail.addEventListener("input", function () {
      if (joinErr && !joinErr.hidden) joinErr.hidden = true;
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }

  /* ---------- hero stat count-up ---------- */
  var statEls = document.querySelectorAll(".hero__stats dt");
  var statTargets = ["42", "318", "1.9k"];
  var started = false;
  function runStats() {
    if (started) return; started = true;
    statEls.forEach(function (el, i) {
      var raw = statTargets[i] || el.textContent;
      var isK = /k$/i.test(raw);
      var target = parseFloat(raw) * (isK ? 1000 : 1);
      var t0 = performance.now(), dur = 1100;
      function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var ease = 1 - Math.pow(1 - k, 3);
        var cur = target * ease;
        el.textContent = isK ? (cur / 1000).toFixed(1) + "k" : Math.round(cur);
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      }
      requestAnimationFrame(step);
    });
  }
  if (statEls.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runStats(); sio.disconnect(); } });
    }, { threshold: 0.4 });
    sio.observe(statEls[0]);
  } else {
    runStats();
  }
})();
