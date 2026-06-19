(function () {
  "use strict";

  var GRADIENTS = [
    "linear-gradient(135deg,#3b4049,#141518)",
    "linear-gradient(135deg,#5b6470,#1f2127)",
    "linear-gradient(135deg,#7a4a2a,#2a1d12)",
    "linear-gradient(135deg,#2a4a55,#10242b)",
    "linear-gradient(135deg,#4a3a55,#1a1024)",
    "linear-gradient(135deg,#55482a,#241d10)"
  ];

  var customers = [
    {
      id: "c1", name: "Marisol Vega", since: "2019", phone: "(503) 555-0142",
      email: "m.vega@example.com", advisor: "T. Okafor",
      flags: ["vip"], lastVisit: "2026-06-04", lifetime: 14820, visits: 31, openRO: false, due: false,
      vehicles: [
        { yr: 2021, make: "Toyota", model: "Tacoma TRD", plate: "JKR-4471", vin: "5TFCZ5AN1MX012834", odo: 61240, color: "Cement", nextSvc: "2026-09", dueWarn: false, g: 2 },
        { yr: 2017, make: "Subaru", model: "Outback", plate: "BNV-2203", vin: "4S4BSANC3H3210945", odo: 118930, color: "Slate", nextSvc: "2026-07", dueWarn: true, g: 3 }
      ],
      history: [
        { date: "2026-06-04", ro: "RO-20418", title: "Brake pads + rotors, front", veh: "21 Tacoma", amt: 642.18, dtc: "", done: true },
        { date: "2026-03-11", ro: "RO-19880", title: "60k major service", veh: "21 Tacoma", amt: 1184.5, dtc: "", done: true },
        { date: "2025-12-02", ro: "RO-19112", title: "Misfire diagnosis cyl 3", veh: "17 Outback", amt: 388.0, dtc: "P0303", done: true }
      ],
      notes: [{ t: "Prefers OEM parts only. Texts before noon.", who: "T. Okafor", when: "Mar 2026" }]
    },
    {
      id: "c2", name: "Dwayne Pruitt", since: "2022", phone: "(503) 555-0188",
      email: "dpruitt@example.com", advisor: "L. Hassan",
      flags: ["open"], lastVisit: "2026-06-16", lifetime: 5210, visits: 9, openRO: true, due: false,
      vehicles: [
        { yr: 2019, make: "Ford", model: "F-250 Super Duty", plate: "HWL-9920", vin: "1FT7W2BT4KEC55120", odo: 88410, color: "Oxford White", nextSvc: "2026-06", dueWarn: false, g: 0 }
      ],
      history: [
        { date: "2026-06-16", ro: "RO-20502", title: "Turbo boost leak — in progress", veh: "19 F-250", amt: 0, dtc: "P0299", done: false },
        { date: "2026-01-20", ro: "RO-19340", title: "Oil + fuel filter service", veh: "19 F-250", amt: 410.7, dtc: "", done: true }
      ],
      notes: []
    },
    {
      id: "c3", name: "Priya Anand", since: "2020", phone: "(503) 555-0119",
      email: "priya.a@example.com", advisor: "T. Okafor",
      flags: ["vip", "overdue"], lastVisit: "2025-11-28", lifetime: 9640, visits: 18, openRO: false, due: true,
      vehicles: [
        { yr: 2023, make: "Tesla", model: "Model Y LR", plate: "EVX-1188", vin: "7SAYGDEE0PA110233", odo: 29870, color: "Midnight", nextSvc: "2026-05", dueWarn: true, g: 4 },
        { yr: 2015, make: "Honda", model: "CR-V EX", plate: "MTR-6604", vin: "5J6RM4H53FL045761", odo: 142005, color: "Silver", nextSvc: "2026-04", dueWarn: true, g: 1 }
      ],
      history: [
        { date: "2025-11-28", ro: "RO-18990", title: "Tire rotation + alignment", veh: "23 Model Y", amt: 215.0, dtc: "", done: true },
        { date: "2025-08-09", ro: "RO-18221", title: "Timing belt + water pump", veh: "15 CR-V", amt: 1320.0, dtc: "", done: true }
      ],
      notes: [{ t: "Both vehicles overdue for service — send reminder.", who: "System", when: "Jun 2026" }]
    },
    {
      id: "c4", name: "Hollow Creek Plumbing", since: "2018", phone: "(503) 555-0301",
      email: "fleet@hollowcreek.example", advisor: "L. Hassan",
      flags: ["vip", "open"], lastVisit: "2026-06-12", lifetime: 41250, visits: 64, openRO: true, due: false,
      vehicles: [
        { yr: 2020, make: "Ram", model: "ProMaster 2500", plate: "FLT-0021", vin: "3C6TRVDG1LE110456", odo: 102330, color: "Bright White", nextSvc: "2026-08", dueWarn: false, g: 5 },
        { yr: 2020, make: "Ram", model: "ProMaster 2500", plate: "FLT-0022", vin: "3C6TRVDG8LE110489", odo: 97640, color: "Bright White", nextSvc: "2026-07", dueWarn: true, g: 5 },
        { yr: 2018, make: "Chevrolet", model: "Express 3500", plate: "FLT-0014", vin: "1GCWGAFG2J1234567", odo: 161200, color: "Summit White", nextSvc: "2026-09", dueWarn: false, g: 1 }
      ],
      history: [
        { date: "2026-06-12", ro: "RO-20470", title: "Fleet brake inspection (3 units)", veh: "Fleet", amt: 0, dtc: "", done: false },
        { date: "2026-02-28", ro: "RO-19590", title: "Transmission service — FLT-0014", veh: "18 Express", amt: 980.4, dtc: "P0700", done: true }
      ],
      notes: [{ t: "Net-30 billing. PO required on every RO.", who: "L. Hassan", when: "2024" }]
    },
    {
      id: "c5", name: "Beto Salcedo", since: "2024", phone: "(503) 555-0177",
      email: "beto.s@example.com", advisor: "T. Okafor",
      flags: [], lastVisit: "2026-05-22", lifetime: 1180, visits: 3, openRO: false, due: false,
      vehicles: [
        { yr: 2016, make: "Mazda", model: "MX-5 Miata", plate: "ZIP-0101", vin: "JM1NDAB75G0123980", odo: 44120, color: "Soul Red", nextSvc: "2026-10", dueWarn: false, g: 2 }
      ],
      history: [
        { date: "2026-05-22", ro: "RO-20210", title: "Synthetic oil change", veh: "16 MX-5", amt: 96.0, dtc: "", done: true }
      ],
      notes: []
    },
    {
      id: "c6", name: "Greer & Sons Landscaping", since: "2021", phone: "(503) 555-0260",
      email: "ops@greersons.example", advisor: "L. Hassan",
      flags: ["overdue"], lastVisit: "2025-10-04", lifetime: 18760, visits: 27, openRO: false, due: true,
      vehicles: [
        { yr: 2014, make: "GMC", model: "Sierra 2500HD", plate: "DRT-7788", vin: "1GT220CG4EZ334120", odo: 198450, color: "Onyx", nextSvc: "2026-03", dueWarn: true, g: 0 },
        { yr: 2019, make: "Isuzu", model: "NPR-HD", plate: "BOX-4502", vin: "JALC4W164K7000981", odo: 76900, color: "White", nextSvc: "2026-05", dueWarn: true, g: 3 }
      ],
      history: [
        { date: "2025-10-04", ro: "RO-18540", title: "Glow plug replacement", veh: "14 Sierra", amt: 540.0, dtc: "P0671", done: true },
        { date: "2025-06-17", ro: "RO-17720", title: "DPF regen + diagnostics", veh: "19 NPR-HD", amt: 720.0, dtc: "P2463", done: true }
      ],
      notes: [{ t: "Seasonal — busiest spring/summer. Off-hours drop-off OK.", who: "L. Hassan", when: "May 2025" }]
    }
  ];

  // ---- helpers ----
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function initials(name) {
    var p = name.replace(/[&]/g, "").trim().split(/\s+/);
    return ((p[0] || "")[0] + (p[1] || "")[0] || (p[0] || "?")[0]).toUpperCase();
  }
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function fmtDate(s) {
    var d = new Date(s + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function relDays(s) {
    var diff = Math.round((Date.now() - new Date(s + "T00:00:00")) / 86400000);
    if (diff <= 0) return "today";
    if (diff === 1) return "yesterday";
    if (diff < 45) return diff + "d ago";
    return Math.round(diff / 30) + "mo ago";
  }

  var toastWrap = $("#toastWrap");
  function toast(msg) {
    var t = el("div", "toast", msg);
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("leaving");
      setTimeout(function () { t.remove(); }, 260);
    }, 2200);
  }

  // ---- list rendering ----
  var custBody = $("#custBody");
  var resultCount = $("#resultCount");
  var emptyState = $("#emptyState");
  var emptyTerm = $("#emptyTerm");
  var searchInput = $("#searchInput");
  var activeFilter = "all";
  var term = "";

  function matchesFilter(c) {
    if (activeFilter === "all") return true;
    if (activeFilter === "vip") return c.flags.indexOf("vip") > -1;
    if (activeFilter === "open") return c.openRO;
    if (activeFilter === "overdue") return c.due;
    return true;
  }
  function matchesTerm(c) {
    if (!term) return true;
    var hay = [c.name, c.phone, c.email];
    c.vehicles.forEach(function (v) {
      hay.push(v.plate, v.vin, v.make, v.model, String(v.yr));
    });
    return hay.join(" ").toLowerCase().indexOf(term) > -1;
  }

  function statusTag(c) {
    if (c.openRO) return '<span class="tag open">Open RO</span>';
    if (c.due) return '<span class="tag overdue">Service due</span>';
    if (c.flags.indexOf("vip") > -1) return '<span class="tag vip">VIP</span>';
    return '<span class="tag ok">Active</span>';
  }

  function render() {
    var list = customers.filter(function (c) { return matchesFilter(c) && matchesTerm(c); });
    custBody.innerHTML = "";
    list.forEach(function (c) {
      var primary = c.vehicles[0];
      var tr = el("tr");
      tr.tabIndex = 0;
      tr.setAttribute("role", "button");
      tr.setAttribute("aria-label", "Open record for " + c.name);
      tr.innerHTML =
        '<td><div class="cust-cell">' +
          '<span class="avatar" style="background:' + GRADIENTS[initials(c.name).charCodeAt(0) % GRADIENTS.length] + '">' + initials(c.name) + '</span>' +
          '<span class="cust-name"><strong>' + c.name + '</strong><span>' + c.phone + ' · cust. since ' + c.since + '</span></span>' +
        '</div></td>' +
        '<td class="hide-sm"><div class="veh-mini"><b>' + primary.yr + ' ' + primary.make + ' ' + primary.model + '</b>' +
          '<small>' + primary.plate + (c.vehicles.length > 1 ? ' · +' + (c.vehicles.length - 1) + ' more' : '') + '</small></div></td>' +
        '<td class="hide-sm tnum">' + relDays(c.lastVisit) + '</td>' +
        '<td class="num"><span class="lifetime">' + money0(c.lifetime) + '</span></td>' +
        '<td class="num">' + statusTag(c) + '</td>';
      tr.addEventListener("click", function () { openDrawer(c.id); });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(c.id); }
      });
      custBody.appendChild(tr);
    });

    var n = list.length;
    resultCount.textContent = n + (n === 1 ? " customer" : " customers");
    if (n === 0 && term) {
      emptyState.hidden = false;
      emptyTerm.textContent = term;
    } else {
      emptyState.hidden = true;
    }
  }

  searchInput.addEventListener("input", function () {
    term = searchInput.value.trim().toLowerCase();
    render();
  });
  Array.prototype.forEach.call(document.querySelectorAll(".filter"), function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  // ---- drawer ----
  var drawer = $("#drawer");
  var drawerInner = $("#drawerInner");
  var scrim = $("#scrim");
  var lastFocus = null;

  function byId(id) {
    for (var i = 0; i < customers.length; i++) if (customers[i].id === id) return customers[i];
    return null;
  }

  function drawerHTML(c) {
    var vehCount = c.vehicles.length;
    var tags = "";
    if (c.flags.indexOf("vip") > -1) tags += '<span class="tag vip">VIP</span>';
    if (c.openRO) tags += '<span class="tag open">Open RO</span>';
    if (c.due) tags += '<span class="tag overdue">Service due</span>';
    if (!tags) tags = '<span class="tag ok">Active</span>';

    var vehicles = c.vehicles.map(function (v) {
      return '' +
        '<div class="veh-card">' +
          '<div class="veh-photo" style="background:' + GRADIENTS[v.g % GRADIENTS.length] + '">' +
            '<span class="yr">' + v.yr + '</span>' +
          '</div>' +
          '<div class="veh-meta">' +
            '<h4>' + v.make + ' ' + v.model + '</h4>' +
            '<div class="veh-grid">' +
              '<div><span class="k">Plate</span><br><span class="vv">' + v.plate + '</span></div>' +
              '<div><span class="k">Odometer</span><br><span class="vv">' + v.odo.toLocaleString("en-US") + ' mi</span></div>' +
              '<div style="grid-column:1/-1"><span class="k">VIN</span><br><span class="vv">' + v.vin + '</span></div>' +
              '<div><span class="k">Color</span><br><span class="vv">' + v.color + '</span></div>' +
              '<div><span class="k">Next service</span><br><span class="vv">' + v.nextSvc + '</span></div>' +
            '</div>' +
            '<div class="veh-foot">' +
              '<span class="svc-due ' + (v.dueWarn ? 'warn' : 'ok') + '">' + (v.dueWarn ? '⚠ Service due' : '✓ Up to date') + '</span>' +
              '<button class="btn btn-ghost btn-hist" data-veh="' + v.plate + '" type="button">View history</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join("");

    var history = c.history.map(function (h) {
      return '' +
        '<li class="hist-item ' + (h.done ? 'done' : '') + '" data-veh="' + h.veh + '">' +
          '<div class="hist-head"><b>' + h.title + '</b><span class="date">' + fmtDate(h.date) + '</span></div>' +
          '<div class="hist-sub"><span class="ro">' + h.ro + '</span> · ' + h.veh +
            (h.dtc ? '<span class="dtc">' + h.dtc + '</span>' : '') + '</div>' +
          (h.done ? '<div class="hist-amt">' + money(h.amt) + '</div>' : '<div class="hist-amt" style="color:var(--inprogress)">In progress</div>') +
        '</li>';
    }).join("");

    var notes = c.notes.length
      ? c.notes.map(function (nt) {
          return '<div class="note">' + nt.t + '<span class="meta">' + nt.who + ' · ' + nt.when + '</span></div>';
        }).join("")
      : '<div class="note" style="border-left-color:var(--steel);color:var(--muted)">No notes yet.</div>';

    return '' +
      '<div class="dr-head">' +
        '<div class="dr-head-top">' +
          '<div class="dr-cust">' +
            '<span class="avatar" style="background:' + GRADIENTS[initials(c.name).charCodeAt(0) % GRADIENTS.length] + '">' + initials(c.name) + '</span>' +
            '<div><h2>' + c.name + '</h2><div class="sub">' + c.phone + ' · ' + c.email + '</div></div>' +
          '</div>' +
          '<button class="dr-close" id="drClose" aria-label="Close record" type="button">×</button>' +
        '</div>' +
        '<div class="dr-tags">' + tags + '</div>' +
        '<div class="dr-stats">' +
          '<div class="dr-stat"><div class="k">Lifetime</div><div class="v">' + money0(c.lifetime) + '</div></div>' +
          '<div class="dr-stat"><div class="k">Visits</div><div class="v">' + c.visits + '</div></div>' +
          '<div class="dr-stat"><div class="k">Vehicles</div><div class="v">' + vehCount + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="dr-body">' +
        '<div class="section-title">Vehicles <span class="count">' + vehCount + '</span></div>' +
        vehicles +
        '<div class="section-title">Service history <span class="count">' + c.history.length + '</span></div>' +
        '<ul class="history">' + history + '</ul>' +
        '<div class="section-title">Notes <span class="count">' + c.notes.length + '</span></div>' +
        '<div class="notes" id="noteList">' + notes + '</div>' +
        '<div class="note-add">' +
          '<input id="noteInput" type="text" placeholder="Add a note (e.g. prefers OEM parts)…" aria-label="Add a note" />' +
          '<button class="btn btn-primary" id="noteSave" type="button">Add</button>' +
        '</div>' +
      '</div>';
  }

  function openDrawer(id) {
    var c = byId(id);
    if (!c) return;
    lastFocus = document.activeElement;
    drawerInner.innerHTML = drawerHTML(c);
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    $("#drClose").addEventListener("click", closeDrawer);

    // vehicle history -> scroll & highlight matching rows
    Array.prototype.forEach.call(drawerInner.querySelectorAll(".btn-hist"), function (b) {
      b.addEventListener("click", function () {
        var plate = b.dataset.veh;
        var v = c.vehicles.filter(function (x) { return x.plate === plate; })[0];
        var label = v.yr + " " + v.make + " " + v.model;
        var hist = drawerInner.querySelector(".history");
        var matched = 0;
        Array.prototype.forEach.call(drawerInner.querySelectorAll(".hist-item"), function (li) {
          var hit = li.dataset.veh && (li.dataset.veh.indexOf(String(v.yr).slice(-2)) > -1 ||
            li.dataset.veh.toLowerCase().indexOf(v.make.toLowerCase()) > -1 ||
            li.dataset.veh.toLowerCase().indexOf("fleet") > -1);
          li.style.opacity = hit ? "1" : "0.3";
          if (hit) matched++;
        });
        if (hist) hist.scrollIntoView({ behavior: "smooth", block: "start" });
        toast(matched + " record" + (matched === 1 ? "" : "s") + " for " + label);
      });
    });

    // add note
    var noteInput = $("#noteInput");
    var noteSave = $("#noteSave");
    function addNote() {
      var val = noteInput.value.trim();
      if (!val) { noteInput.focus(); return; }
      c.notes.unshift({ t: val, who: c.advisor, when: "Just now" });
      // refresh notes section in place
      var list = $("#noteList");
      var placeholder = list.querySelector(".note[style]");
      if (placeholder) placeholder.remove();
      var node = el("div", "note", val + '<span class="meta">' + c.advisor + ' · Just now</span>');
      list.insertBefore(node, list.firstChild);
      // bump count badge
      var badges = drawerInner.querySelectorAll(".section-title .count");
      if (badges[2]) badges[2].textContent = c.notes.length;
      noteInput.value = "";
      noteInput.focus();
      toast("Note added to " + c.name.split(" ")[0] + "’s record");
    }
    noteSave.addEventListener("click", addNote);
    noteInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); addNote(); }
    });

    setTimeout(function () { drawer.focus(); }, 60);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  $("#addCustomerBtn").addEventListener("click", function () {
    toast("New customer intake — opens the registration form");
  });

  render();
})();
