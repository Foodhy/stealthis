(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- live countdown ---------- */
  // Gates open Aug 14, 2026 12:00 (local).
  var target = new Date(2026, 7, 14, 12, 0, 0).getTime();
  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = "00";
      var cd = document.getElementById("countdown");
      if (cd) cd.setAttribute("aria-label", "The festival is live");
      return;
    }
    var s = Math.floor(diff / 1000);
    elDays.textContent = pad(Math.floor(s / 86400));
    elHours.textContent = pad(Math.floor((s % 86400) / 3600));
    elMins.textContent = pad(Math.floor((s % 3600) / 60));
    elSecs.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- artist marquee (seamless scroll) ---------- */
  var marquee = document.getElementById("marquee");
  if (marquee) {
    marquee.innerHTML += marquee.innerHTML; // duplicate for seamless loop
    var mx = 0;
    var half = marquee.scrollWidth / 2;
    var paused = false;
    marquee.parentElement.addEventListener("mouseenter", function () { paused = true; });
    marquee.parentElement.addEventListener("mouseleave", function () { paused = false; });
    function loop() {
      if (!paused) {
        mx -= 0.6;
        if (Math.abs(mx) >= half) mx = 0;
        marquee.style.transform = "translateX(" + mx + "px)";
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- schedule data + day tabs ---------- */
  var SCHEDULE = {
    fri: [
      { stage: "Solaris Main", sets: [
        { t: "9:30 PM", a: "Neon Tides", head: true },
        { t: "7:45 PM", a: "Golden Hour" },
        { t: "6:00 PM", a: "Coral Signal" },
        { t: "4:30 PM", a: "Marigold" }
      ]},
      { stage: "Dune Stage", sets: [
        { t: "10:00 PM", a: "Dusk Machine", head: true },
        { t: "8:15 PM", a: "Hollow Suns" },
        { t: "6:30 PM", a: "Driftwood" }
      ]},
      { stage: "Neon Tent", sets: [
        { t: "11:00 PM", a: "Cobalt Hum", head: true },
        { t: "9:00 PM", a: "Static Bloom" },
        { t: "7:00 PM", a: "Wireframe" }
      ]}
    ],
    sat: [
      { stage: "Solaris Main", sets: [
        { t: "9:45 PM", a: "Velvet Static", head: true },
        { t: "8:00 PM", a: "Paper Lanterns" },
        { t: "6:15 PM", a: "Ember Riot" },
        { t: "4:45 PM", a: "Sun Cult" }
      ]},
      { stage: "Dune Stage", sets: [
        { t: "10:15 PM", a: "Tidal Glass", head: true },
        { t: "8:30 PM", a: "Pale Horizon" },
        { t: "6:45 PM", a: "Nightjar" }
      ]},
      { stage: "Neon Tent", sets: [
        { t: "11:30 PM", a: "Echo Parade", head: true },
        { t: "9:30 PM", a: "Saltwater Choir" },
        { t: "7:30 PM", a: "The Low Frequencies" }
      ]}
    ],
    sun: [
      { stage: "Solaris Main", sets: [
        { t: "9:15 PM", a: "Midnight Reservoir", head: true },
        { t: "7:30 PM", a: "Saltwater Choir" },
        { t: "5:45 PM", a: "Static Bloom" },
        { t: "4:15 PM", a: "Marigold" }
      ]},
      { stage: "Dune Stage", sets: [
        { t: "9:45 PM", a: "Golden Hour", head: true },
        { t: "8:00 PM", a: "Ember Riot" },
        { t: "6:15 PM", a: "Driftwood" }
      ]},
      { stage: "Neon Tent", sets: [
        { t: "10:30 PM", a: "Sun Cult", head: true },
        { t: "8:45 PM", a: "Wireframe" },
        { t: "7:00 PM", a: "Nightjar" }
      ]}
    ]
  };

  var grid = document.getElementById("schedule-grid");
  function renderDay(day) {
    if (!grid) return;
    var data = SCHEDULE[day] || [];
    grid.innerHTML = data.map(function (col) {
      var rows = col.sets.map(function (s) {
        return '<div class="set-row' + (s.head ? " is-headliner" : "") + '">' +
          '<span class="set-act">' + s.a + (s.head ? " ★" : "") + "</span>" +
          '<span class="set-time">' + s.t + "</span></div>";
      }).join("");
      return '<div class="stage-card"><div class="stage-name"><span class="stage-dot"></span>' +
        col.stage + "</div>" + rows + "</div>";
    }).join("");
  }
  renderDay("fri");

  var dayTabs = document.querySelectorAll(".day-tab");
  dayTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      dayTabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderDay(tab.dataset.day);
    });
  });

  /* ---------- ticket tier select ---------- */
  var tickets = document.querySelectorAll(".ticket");
  var selTier = document.getElementById("sel-tier");
  var selPrice = document.getElementById("sel-price");
  function selectTicket(btn) {
    tickets.forEach(function (t) { t.setAttribute("aria-checked", "false"); });
    btn.setAttribute("aria-checked", "true");
    if (selTier) selTier.textContent = btn.querySelector(".t-name").textContent;
    if (selPrice) selPrice.textContent = "$" + btn.dataset.price;
  }
  tickets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectTicket(btn);
      toast(btn.querySelector(".t-name").textContent + " pass selected");
    });
  });

  var checkout = document.getElementById("checkout");
  if (checkout) {
    checkout.addEventListener("click", function () {
      var name = selTier ? selTier.textContent : "your";
      var price = selPrice ? selPrice.textContent : "";
      toast("Heading to checkout — " + name + " " + price + " (demo)");
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var open = q.getAttribute("aria-expanded") === "true";
      var ans = q.nextElementSibling;
      q.setAttribute("aria-expanded", open ? "false" : "true");
      ans.style.maxHeight = open ? "0" : ans.scrollHeight + "px";
    });
  });

  /* ---------- lineup act -> toast ---------- */
  document.querySelectorAll(".act").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Set times for " + a.textContent.trim() + " — see the schedule");
    });
  });

  /* ---------- sticky tickets bar ---------- */
  var bar = document.getElementById("sticky-bar");
  var hero = document.querySelector(".hero");
  var ticketsSection = document.getElementById("tickets");
  function updateBar() {
    if (!bar || !hero) return;
    var pastHero = window.scrollY > hero.offsetHeight - 80;
    var inTickets = false;
    if (ticketsSection) {
      var r = ticketsSection.getBoundingClientRect();
      inTickets = r.top < window.innerHeight && r.bottom > 0;
    }
    if (pastHero && !inTickets) bar.classList.add("is-visible");
    else bar.classList.remove("is-visible");
  }
  window.addEventListener("scroll", updateBar, { passive: true });
  window.addEventListener("resize", updateBar);
  updateBar();
})();
