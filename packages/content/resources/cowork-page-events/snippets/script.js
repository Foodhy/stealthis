(function () {
  "use strict";

  // June 2026 starts on a Monday — clean grid alignment.
  var MONTH = "Jun";
  var TODAY = 18;

  var TYPE_LABEL = {
    workshop: "Workshop",
    networking: "Networking",
    talk: "Talk",
    social: "Social"
  };

  var events = [
    {
      id: "e1", day: 18, dow: "Thu", type: "workshop",
      title: "Risograph Print Lab",
      time: "18:30 – 20:30", room: "The Press Room",
      host: "Dario Vence", going: false, cap: 14, count: 9,
      desc: "Hands-on intro to two-colour riso printing. Pull a poster from your own artwork — paper, ink and aprons provided. Beginner friendly."
    },
    {
      id: "e2", day: 19, dow: "Fri", type: "social",
      title: "Friday Mill Mixer",
      time: "17:00 – 19:00", room: "Loomhouse Café",
      host: "Mara Quintero", going: false, cap: 60, count: 41,
      desc: "Wind down the week with neighbours from every floor. Local cider, warm bread from the bakery downstairs, and a vinyl set from member DJ Halse."
    },
    {
      id: "e3", day: 20, dow: "Sat", type: "workshop",
      title: "Ceramics: Pinch Pot Basics",
      time: "10:00 – 13:00", room: "Clay Studio B",
      host: "Ines Okafor", going: false, cap: 10, count: 10,
      desc: "Build a small vessel by hand and learn the slip-and-score technique. Clay fired and ready for collection the following week."
    },
    {
      id: "e4", day: 23, dow: "Tue", type: "talk",
      title: "Lunch Talk: Pricing Your Studio Work",
      time: "12:30 – 13:30", room: "The Gallery",
      host: "Tobias Rein", going: false, cap: 40, count: 22,
      desc: "Freelance illustrator Tobias breaks down how he sets day rates and licensing fees. Bring your lunch — coffee is on the house."
    },
    {
      id: "e5", day: 24, dow: "Wed", type: "networking",
      title: "Makers &amp; Founders Roundtable",
      time: "09:00 – 10:30", room: "Boardroom · Mill 2",
      host: "Priya Sundaram", going: false, cap: 16, count: 11,
      desc: "Small-group roundtable for product makers and early founders. Share a current blocker, leave with three concrete intros."
    },
    {
      id: "e6", day: 25, dow: "Thu", type: "talk",
      title: "Type Design in the Wild",
      time: "18:00 – 19:30", room: "The Gallery",
      host: "Lena Brandt", going: false, cap: 50, count: 17,
      desc: "A walk through how a custom typeface goes from sketch to shipped brand. Q&amp;A and a small specimen giveaway to close."
    },
    {
      id: "e7", day: 26, dow: "Fri", type: "social",
      title: "Rooftop Garden Supper",
      time: "19:00 – 22:00", room: "Mill Rooftop",
      host: "Community Team", going: false, cap: 30, count: 28,
      desc: "Long-table dinner cooked with herbs from the rooftop plots. Members +1 welcome. Vegetarian by default — flag dietary needs on RSVP."
    },
    {
      id: "e8", day: 30, dow: "Tue", type: "networking",
      title: "New Members Welcome Coffee",
      time: "08:30 – 09:30", room: "Loomhouse Café",
      host: "Mara Quintero", going: false, cap: 25, count: 6,
      desc: "Joined this month? Come meet the team and other newcomers over flat whites. We&rsquo;ll show you the quiet rooms and the good plug sockets."
    }
  ];

  var activeFilter = "all";

  // ---------- helpers ----------
  function el(id) { return document.getElementById(id); }

  function toast(msg) {
    var wrap = el("toastWrap");
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="tdot"></span>' + msg;
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 280);
    }, 2400);
  }

  function decode(s) {
    var d = document.createElement("textarea");
    d.innerHTML = s;
    return d.value;
  }

  function updateGoingCount() {
    var n = events.filter(function (e) { return e.going; }).length;
    el("goingCount").textContent = n;
  }

  function attendHtml(e) {
    var nearFull = e.cap - e.count <= 3;
    var spots = e.cap - e.count;
    var label = e.count >= e.cap
      ? "Full · waitlist"
      : "<strong>" + e.count + "</strong>/" + e.cap + " going";
    return '<span class="attend ' + (nearFull ? "near-full" : "") + '">' + label +
      (spots > 0 && nearFull ? " · " + spots + " left" : "") + "</span>";
  }

  // ---------- list rendering ----------
  function renderList() {
    var host = el("eventList");
    host.innerHTML = "";
    var shown = events.filter(function (e) {
      return activeFilter === "all" || e.type === activeFilter;
    });

    el("listEmpty").hidden = shown.length > 0;

    shown.forEach(function (e) {
      var card = document.createElement("article");
      card.className = "event-card";
      card.dataset.type = e.type;
      card.innerHTML =
        '<div class="ev-date"><span class="dow">' + e.dow + '</span>' +
          '<span class="day">' + e.day + '</span><span class="mon">' + MONTH + '</span></div>' +
        '<div class="ev-main" role="button" tabindex="0">' +
          '<div class="ev-top">' +
            '<span class="badge" data-type="' + e.type + '">' + TYPE_LABEL[e.type] + '</span>' +
            '<span class="ev-time">' + e.time + '</span>' +
          '</div>' +
          '<h3>' + e.title + '</h3>' +
          '<div class="ev-meta"><span class="pin">' + e.room + '</span>' +
            '<span>Hosted by ' + e.host + '</span></div>' +
        '</div>' +
        '<div class="ev-side">' + attendHtml(e) +
          '<button class="btn btn-primary' + (e.going ? " is-going" : "") + '" type="button" data-rsvp="' + e.id + '">' +
            (e.going ? "Going ✓" : "RSVP") + '</button>' +
        '</div>';

      var main = card.querySelector(".ev-main");
      main.addEventListener("click", function () { openModal(e.id); });
      main.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openModal(e.id); }
      });
      host.appendChild(card);
    });
  }

  // ---------- calendar rendering ----------
  function renderCalendar() {
    var grid = el("calGrid");
    grid.innerHTML = "";
    // June 2026: 30 days, day 1 = Monday (index 0)
    var byDay = {};
    events.forEach(function (e) { (byDay[e.day] = byDay[e.day] || []).push(e); });

    for (var d = 1; d <= 30; d++) {
      var cell = document.createElement("div");
      cell.className = "cal-cell" + (d === TODAY ? " is-today" : "");
      var html = '<span class="cal-num">' + d + "</span>";
      (byDay[d] || []).forEach(function (e) {
        var hidden = activeFilter !== "all" && e.type !== activeFilter;
        html += '<button class="cal-ev' + (hidden ? " is-hidden" : "") +
          '" data-type="' + e.type + '" data-open="' + e.id + '" title="' + decode(e.title) +
          '">' + e.title + "</button>";
      });
      cell.innerHTML = html;
      grid.appendChild(cell);
    }

    grid.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { openModal(b.dataset.open); });
    });
  }

  // ---------- modal ----------
  function findEvent(id) {
    for (var i = 0; i < events.length; i++) if (events[i].id === id) return events[i];
    return null;
  }

  function openModal(id) {
    var e = findEvent(id);
    if (!e) return;
    el("modalBadge").textContent = TYPE_LABEL[e.type];
    el("modalBadge").setAttribute("data-type", e.type);
    el("modalTitle").innerHTML = e.title;
    el("modalMeta").innerHTML =
      "<span>" + e.dow + " " + e.day + " " + MONTH + "</span><span>" + e.time + "</span>";
    el("modalDesc").innerHTML = e.desc;
    el("modalHost").textContent = e.host;
    el("modalHostAv").textContent = e.host.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    el("modalRoom").textContent = e.room;
    el("modalAttend").outerHTML = attendHtml(e).replace('class="attend', 'id="modalAttend" class="attend');
    el("modalPhoto").style.background =
      "linear-gradient(135deg, var(--c-" + e.type + "), rgba(28,27,25,0.35))";

    var rsvp = el("modalRsvp");
    rsvp.className = "btn btn-primary" + (e.going ? " is-going" : "");
    rsvp.textContent = e.going ? "Going ✓" : "RSVP";
    rsvp.onclick = function () { toggleRsvp(e.id, true); };

    el("modal").hidden = false;
    rsvp.focus();
  }

  function closeModal() { el("modal").hidden = true; }

  // ---------- RSVP ----------
  function toggleRsvp(id, fromModal) {
    var e = findEvent(id);
    if (!e) return;
    if (!e.going && e.count >= e.cap) {
      toast("Event is full — you&rsquo;ve joined the waitlist for " + decode(e.title));
      e.going = true;
    } else {
      e.going = !e.going;
      e.count += e.going ? 1 : -1;
      toast(e.going
        ? "You&rsquo;re going to " + decode(e.title) + " 🎉"
        : "RSVP cancelled for " + decode(e.title));
    }
    updateGoingCount();
    renderList();
    if (fromModal) openModal(id);
  }

  // ---------- view toggle ----------
  function setView(view) {
    var isList = view === "list";
    el("listView").hidden = !isList;
    el("calendarView").hidden = isList;
    document.querySelectorAll(".toggle-btn").forEach(function (b) {
      var on = b.dataset.view === view;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (!isList) renderCalendar();
  }

  // ---------- wiring ----------
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      activeFilter = c.dataset.filter;
      document.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("is-on", x === c); });
      renderList();
      if (!el("calendarView").hidden) renderCalendar();
    });
  });

  document.querySelectorAll(".toggle-btn").forEach(function (b) {
    b.addEventListener("click", function () { setView(b.dataset.view); });
  });

  document.addEventListener("click", function (ev) {
    var rsvpBtn = ev.target.closest("[data-rsvp]");
    if (rsvpBtn) { toggleRsvp(rsvpBtn.dataset.rsvp, false); return; }
    if (ev.target.hasAttribute("data-close")) closeModal();
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !el("modal").hidden) closeModal();
  });

  el("proposeBtn").addEventListener("click", function () {
    toast("Thanks! The community team will review your event idea.");
  });

  // ---------- init ----------
  updateGoingCount();
  renderList();
})();
