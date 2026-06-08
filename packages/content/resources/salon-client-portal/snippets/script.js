(function () {
  "use strict";

  /* ----- Data ----- */
  var upcoming = [
    {
      id: "u1", month: "Jun", day: "11", time: "4:30 PM", weekday: "Thursday",
      service: "Balayage + Gloss", stylist: "Aria Vance",
      duration: "2h 15m", price: 245, tags: ["Colour", "Confirmed"],
    },
    {
      id: "u2", month: "Jun", day: "27", time: "11:00 AM", weekday: "Saturday",
      service: "Silk Press & Trim", stylist: "Noor Halabi",
      duration: "1h 30m", price: 120, tags: ["Styling", "Confirmed"],
    },
  ];

  var past = [
    { id: "p1", date: "May 22", service: "Root Touch-Up", stylist: "Aria Vance", price: 95, dur: "1h" },
    { id: "p2", date: "Apr 30", service: "Hydrating Mask Treatment", stylist: "Noor Halabi", price: 65, dur: "45m" },
    { id: "p3", date: "Apr 09", service: "Balayage + Gloss", stylist: "Aria Vance", price: 245, dur: "2h 15m" },
    { id: "p4", date: "Mar 18", service: "Cut & Blow-Dry", stylist: "Léa Moreau", price: 85, dur: "1h" },
    { id: "p5", date: "Feb 27", service: "Keratin Smoothing", stylist: "Noor Halabi", price: 210, dur: "2h 30m" },
    { id: "p6", date: "Feb 06", service: "Silk Press & Trim", stylist: "Noor Halabi", price: 120, dur: "1h 30m" },
    { id: "p7", date: "Jan 15", service: "Brow Shape & Tint", stylist: "Léa Moreau", price: 48, dur: "30m" },
  ];

  var favServices = [
    { id: "fs1", name: "Balayage + Gloss", sub: "Signature colour · 2h 15m", price: 245, saved: true },
    { id: "fs2", name: "Hydrating Mask", sub: "Treatment · 45m", price: 65, saved: true },
    { id: "fs3", name: "Cut & Blow-Dry", sub: "Styling · 1h", price: 85, saved: true },
  ];

  var favStylists = [
    { id: "ft1", name: "Aria Vance", sub: "Colour Director", initials: "AV", saved: true },
    { id: "ft2", name: "Noor Halabi", sub: "Senior Stylist", initials: "NH", saved: true },
  ];

  var recommends = [
    { svc: "Bond-Repair Add-On", why: "Pairs with your balayage", price: 35 },
    { svc: "Scalp Detox Ritual", why: "You're due — last one in March", price: 55 },
    { svc: "Glaze Refresh", why: "Keeps tone bright between visits", price: 45 },
  ];

  /* ----- Helpers ----- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2600);
  }

  /* ----- Live counts ----- */
  function refreshCounts() {
    var up = upcoming.filter(function (a) { return !a.cancelled; }).length;
    var fv = favServices.filter(function (f) { return f.saved; }).length +
             favStylists.filter(function (f) { return f.saved; }).length;
    $("#countUpcoming").textContent = up;
    $("#countPast").textContent = past.length;
    $("#countFavs").textContent = fv;
    $("#statUpcoming").textContent = up;
    $("#statPast").textContent = past.length;
    $("#statFavs").textContent = fv;
  }

  /* ----- Tabs ----- */
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$(".panel").forEach(function (p) {
        var on = p.id === "panel-" + tab.dataset.tab;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    });
  });

  /* ----- Render upcoming ----- */
  function renderUpcoming() {
    var list = $("#upcomingList");
    var active = upcoming.filter(function (a) { return !a.cancelled; });
    $("#upcomingEmpty").hidden = active.length !== 0;

    list.innerHTML = upcoming.map(function (a) {
      var tags = a.tags.map(function (t, i) {
        return '<span class="pill' + (i ? " pill--soft" : "") + '">' + esc(t) + "</span>";
      }).join("");
      return '' +
        '<article class="appt' + (a.cancelled ? " is-cancelled" : "") + '" data-id="' + a.id + '">' +
          '<div class="datechip">' +
            '<div class="m">' + esc(a.month) + '</div>' +
            '<div class="d">' + esc(a.day) + '</div>' +
            '<div class="t">' + esc(a.time) + '</div>' +
          '</div>' +
          '<div class="appt__body">' +
            '<div class="appt__svc">' + esc(a.service) + '</div>' +
            '<div class="appt__meta">' + esc(a.weekday) + ' · with <b>' + esc(a.stylist) + '</b> · ' + esc(a.duration) + '</div>' +
            '<div class="appt__tags">' + tags + '</div>' +
          '</div>' +
          (a.cancelled
            ? '<div class="appt__actions"><span class="pill pill--soft">Cancelled</span></div>'
            : '<div class="appt__actions">' +
                '<button class="btn btn--sm" data-act="reschedule">Reschedule</button>' +
                '<button class="btn btn--ghost btn--sm" data-act="cancel">Cancel</button>' +
              '</div>') +
        '</article>';
    }).join("");
  }

  // delegated actions for upcoming
  $("#upcomingList").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var card = btn.closest(".appt");
    var id = card.dataset.id;
    var appt = upcoming.find(function (a) { return a.id === id; });
    if (!appt) return;

    if (btn.dataset.act === "reschedule") {
      toast("Reschedule link sent for " + appt.service + ".");
      return;
    }

    if (btn.dataset.act === "cancel") {
      if ($(".confirm", card)) return;
      var c = document.createElement("div");
      c.className = "confirm";
      c.innerHTML =
        '<p>Cancel <strong>' + esc(appt.service) + '</strong> on ' + esc(appt.month) + " " + esc(appt.day) + '?</p>' +
        '<div class="confirm__btns">' +
          '<button class="btn btn--sm" data-confirm="no">Keep it</button>' +
          '<button class="btn btn--danger btn--sm" data-confirm="yes">Yes, cancel</button>' +
        '</div>';
      card.appendChild(c);
      $('[data-confirm="yes"]', c).focus();

      c.addEventListener("click", function (ev) {
        var cb = ev.target.closest("button[data-confirm]");
        if (!cb) return;
        if (cb.dataset.confirm === "yes") {
          appt.cancelled = true;
          renderUpcoming();
          refreshCounts();
          toast(appt.service + " cancelled. We hope to see you soon.");
        } else {
          c.remove();
        }
      });
    }
  });

  /* ----- Render past ----- */
  function renderPast(filter) {
    var q = (filter || "").trim().toLowerCase();
    var rows = past.filter(function (p) {
      return !q || p.service.toLowerCase().indexOf(q) > -1 || p.stylist.toLowerCase().indexOf(q) > -1;
    });
    $("#pastEmpty").hidden = rows.length !== 0;
    $("#pastList").innerHTML = rows.map(function (p) {
      return '' +
        '<div class="row" data-id="' + p.id + '">' +
          '<div class="row__date">' + esc(p.date) + '</div>' +
          '<div>' +
            '<div class="row__svc">' + esc(p.service) + '</div>' +
            '<div class="row__meta">with ' + esc(p.stylist) + ' · ' + esc(p.dur) + '</div>' +
          '</div>' +
          '<div class="row__right">' +
            '<span class="row__price">$' + p.price + '</span>' +
            '<button class="btn btn--gold btn--sm" data-rebook="' + p.id + '">Rebook</button>' +
          '</div>' +
        '</div>';
    }).join("");
  }

  $("#pastList").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-rebook]");
    if (!btn) return;
    var p = past.find(function (x) { return x.id === btn.dataset.rebook; });
    if (!p) return;
    toast("Rebooking " + p.service + " with " + p.stylist + " — details pre-filled.");
  });

  $("#pastSearch").addEventListener("input", function (e) {
    renderPast(e.target.value);
  });

  /* ----- Render favorites ----- */
  function heartSvg() {
    return '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 20.5 4.4 13a4.6 4.6 0 1 1 6.5-6.5l1.1 1.1 1.1-1.1A4.6 4.6 0 1 1 19.6 13z"/></svg>';
  }

  function renderFavServices() {
    $("#favServices").innerHTML = favServices.map(function (f) {
      return '' +
        '<div class="fav" data-id="' + f.id + '">' +
          '<div class="fav__head">' +
            '<div><div class="fav__name">' + esc(f.name) + '</div><div class="fav__sub">' + esc(f.sub) + '</div></div>' +
            '<button class="heart" data-fav="service" aria-pressed="' + (f.saved ? "true" : "false") +
              '" aria-label="' + (f.saved ? "Remove" : "Save") + " " + esc(f.name) + '">' + heartSvg() + '</button>' +
          '</div>' +
          '<div class="fav__head" style="align-items:center">' +
            '<span class="fav__price">$' + f.price + '</span>' +
            '<button class="btn btn--gold btn--sm" data-book="' + f.id + '">Book</button>' +
          '</div>' +
        '</div>';
    }).join("");
  }

  function renderFavStylists() {
    $("#favStylists").innerHTML = favStylists.map(function (f) {
      return '' +
        '<div class="fav" data-id="' + f.id + '">' +
          '<div class="fav__head">' +
            '<div class="person">' +
              '<span class="avatar">' + esc(f.initials) + '</span>' +
              '<div><div class="fav__name">' + esc(f.name) + '</div><div class="fav__sub">' + esc(f.sub) + '</div></div>' +
            '</div>' +
            '<button class="heart" data-fav="stylist" aria-pressed="' + (f.saved ? "true" : "false") +
              '" aria-label="' + (f.saved ? "Remove" : "Save") + " " + esc(f.name) + '">' + heartSvg() + '</button>' +
          '</div>' +
        '</div>';
    }).join("");
  }

  function bindFavToggle(container, store, kind) {
    container.addEventListener("click", function (e) {
      var heart = e.target.closest('.heart[data-fav]');
      var book = e.target.closest("button[data-book]");
      if (book) {
        var bi = store.find(function (x) { return x.id === book.dataset.book; });
        if (bi) toast("Booking " + bi.name + " — choose a time to confirm.");
        return;
      }
      if (!heart) return;
      var card = heart.closest(".fav");
      var item = store.find(function (x) { return x.id === card.dataset.id; });
      if (!item) return;
      item.saved = !item.saved;
      heart.setAttribute("aria-pressed", item.saved ? "true" : "false");
      heart.setAttribute("aria-label", (item.saved ? "Remove " : "Save ") + item.name);
      refreshCounts();
      toast(item.saved ? item.name + " saved to favorites." : item.name + " removed from favorites.");
    });
  }

  /* ----- Recommendations ----- */
  function renderRecs() {
    $("#recList").innerHTML = recommends.map(function (r) {
      return '' +
        '<li class="rec__item">' +
          '<div><div class="rec__svc">' + esc(r.svc) + '</div><div class="rec__why">' + esc(r.why) + '</div></div>' +
          '<button class="btn btn--sm rec__add" data-rec="' + esc(r.svc) + '">+ $' + r.price + '</button>' +
        '</li>';
    }).join("");
  }
  $("#recList").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-rec]");
    if (!btn) return;
    toast("Added " + btn.dataset.rec + " to your next visit.");
  });

  /* ----- Init ----- */
  renderUpcoming();
  renderPast("");
  renderFavServices();
  renderFavStylists();
  renderRecs();
  bindFavToggle($("#favServices"), favServices, "service");
  bindFavToggle($("#favStylists"), favStylists, "stylist");
  refreshCounts();
})();
