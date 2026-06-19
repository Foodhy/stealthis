(function () {
  "use strict";

  var AVATAR_COLORS = ["#5f7a52", "#e8902b", "#3c5a6e", "#a16b3f", "#6b5f8c", "#a8392b"];

  function initials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function avColor(name) {
    var s = 0;
    for (var i = 0; i < name.length; i++) s += name.charCodeAt(i);
    return AVATAR_COLORS[s % AVATAR_COLORS.length];
  }

  // --- Seed data: fictional Loomyard studio equipment ---
  var devices = [
    {
      id: "px-01", name: "RICOH IM C3010", type: "print", kind: "Print · Scan · Copy",
      icon: "🖨", status: "online",
      supplies: [{ label: "Toner (black)", pct: 74 }, { label: "Paper · Tray 1", pct: 88 }],
      queue: [
        { name: "Mara Velez", doc: "Q3-pitch-deck.pdf", pages: 12, done: false },
        { name: "Theo Nakamura", doc: "lease-addendum.docx", pages: 3, done: false }
      ]
    },
    {
      id: "px-02", name: "Brother HL-L8360", type: "print", kind: "Color laser",
      icon: "🖨", status: "low",
      supplies: [{ label: "Toner (cyan)", pct: 9 }, { label: "Paper · Tray 2", pct: 41 }],
      queue: [{ name: "Priya Anand", doc: "moodboard-A3.pdf", pages: 6, done: false }]
    },
    {
      id: "sc-01", name: "Fujitsu fi-8170", type: "scan", kind: "Document scanner",
      icon: "🗂", status: "busy",
      supplies: [{ label: "Roller life", pct: 63 }],
      queue: [{ name: "Devon Hart", doc: "receipts-batch", pages: 40, done: false }]
    },
    {
      id: "cf-01", name: "La Marzocco Linea", type: "coffee", kind: "Espresso · Studio bar",
      icon: "☕", status: "online",
      supplies: [{ label: "Bean hopper", pct: 56 }, { label: "Water tank", pct: 82 }],
      queue: []
    },
    {
      id: "av-01", name: "Epson PowerLite — Loft", type: "av", kind: "Projector · Room Loft",
      icon: "📽", status: "error",
      supplies: [{ label: "Lamp hours", pct: 18 }],
      queue: [],
      issue: "No signal on HDMI 1"
    },
    {
      id: "av-02", name: "Poly Studio X52 — Atrium", type: "av", kind: "Conf cam · Room Atrium",
      icon: "🎥", status: "busy",
      supplies: [{ label: "Firmware", pct: 100 }],
      queue: []
    }
  ];

  var STATUS_META = {
    online: { cls: "s-online", label: "Online" },
    busy: { cls: "s-busy", label: "In use" },
    low: { cls: "s-low", label: "Low supply" },
    error: { cls: "s-error", label: "Needs help" }
  };

  var grid = document.getElementById("deviceGrid");
  var modal = document.getElementById("modal");
  var activeDeviceId = null;

  function meterClass(pct) { return pct <= 15 ? "bad" : pct <= 40 ? "warn" : ""; }

  function render() {
    grid.innerHTML = "";
    devices.forEach(function (d) {
      grid.appendChild(buildCard(d));
    });
    updateSummary();
  }

  function buildCard(d) {
    var meta = STATUS_META[d.status];
    var card = document.createElement("article");
    card.className = "card";
    card.dataset.status = d.status;
    card.dataset.id = d.id;

    var queueCount = d.queue.filter(function (q) { return !q.done; }).length;

    var suppliesHtml = d.supplies.map(function (s) {
      return '<div class="meter-row">' +
        '<div class="meter-label"><span>' + s.label + '</span><strong>' + s.pct + '%</strong></div>' +
        '<div class="meter ' + meterClass(s.pct) + '"><i style="width:' + s.pct + '%"></i></div>' +
        '</div>';
    }).join("");

    var queueHtml;
    if (d.type === "print" || d.type === "scan") {
      var items = d.queue.length
        ? '<ul>' + d.queue.map(function (q) {
            return '<li class="' + (q.done ? "done" : "") + '">' +
              '<span class="q-av" style="background:' + avColor(q.name) + '">' + initials(q.name) + '</span>' +
              '<span class="q-name">' + q.name + '<small>' + q.doc + '</small></span>' +
              '<span class="q-pages">' + q.pages + 'p</span></li>';
          }).join("") + '</ul>'
        : '<div class="empty">Queue is clear ✓</div>';
      queueHtml = '<div class="queue">' +
        '<div class="queue-head"><span>Print queue</span>' +
        '<span class="count">' + queueCount + ' waiting</span></div>' + items + '</div>';
    } else if (d.issue) {
      queueHtml = '<div class="note-low">⚠ ' + d.issue + '</div>';
    } else if (d.status === "low") {
      queueHtml = '<div class="note-low">Refill needed soon — flagged to ops.</div>';
    } else {
      queueHtml = "";
    }

    var clearBtn = (d.type === "print" || d.type === "scan") && queueCount > 0
      ? '<button class="btn btn-ghost" data-act="next">Mark next done</button>'
      : '';

    card.innerHTML =
      '<div class="card-top">' +
        '<div class="thumb t-' + d.type + '">' + d.icon + '</div>' +
        '<div class="card-id"><h3>' + d.name + '</h3><p>' + d.kind + ' · ' + d.id.toUpperCase() + '</p></div>' +
      '</div>' +
      '<span class="pill ' + meta.cls + '"><span class="led"></span>' + meta.label + '</span>' +
      suppliesHtml +
      queueHtml +
      '<div class="card-actions">' +
        clearBtn +
        '<button class="btn btn-ghost" data-act="report">Report issue</button>' +
      '</div>';

    card.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.dataset.act;
        if (act === "report") openModal(d);
        else if (act === "next") markNext(d);
      });
    });

    return card;
  }

  function updateSummary() {
    var c = { online: 0, busy: 0, low: 0, error: 0 };
    devices.forEach(function (d) { c[d.status]++; });
    document.getElementById("cOnline").textContent = c.online;
    document.getElementById("cBusy").textContent = c.busy;
    document.getElementById("cLow").textContent = c.low;
    document.getElementById("cError").textContent = c.error;
  }

  function markNext(d) {
    var next = d.queue.find(function (q) { return !q.done; });
    if (!next) return;
    next.done = true;
    var remaining = d.queue.filter(function (q) { return !q.done; }).length;
    if (remaining === 0 && d.status === "busy") d.status = "online";
    render();
    toast(next.doc + " finished on " + d.name, "ok");
  }

  // --- Modal ---
  function openModal(d) {
    activeDeviceId = d.id;
    document.getElementById("modalDevice").textContent = d.name + " · " + d.id.toUpperCase();
    document.getElementById("issueNotes").value = "";
    document.getElementById("issueType").selectedIndex = 0;
    modal.hidden = false;
    document.getElementById("issueType").focus();
    document.addEventListener("keydown", onEsc);
  }
  function closeModal() {
    modal.hidden = true;
    activeDeviceId = null;
    document.removeEventListener("keydown", onEsc);
  }
  function onEsc(e) { if (e.key === "Escape") closeModal(); }

  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.getElementById("submitIssue").addEventListener("click", function () {
    var d = devices.find(function (x) { return x.id === activeDeviceId; });
    var type = document.getElementById("issueType").value;
    if (d && d.status !== "error") {
      d.status = "error";
      d.issue = type;
    }
    closeModal();
    render();
    toast("Issue reported — ops notified", "warn");
  });

  // --- Refresh: simulate live status drift ---
  var refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.addEventListener("click", function () {
    if (refreshBtn.classList.contains("is-spinning")) return;
    refreshBtn.classList.add("is-spinning");

    setTimeout(function () {
      devices.forEach(function (d) {
        // supplies drift slightly down
        d.supplies.forEach(function (s) {
          if (s.label.indexOf("Firmware") === -1) {
            s.pct = Math.max(0, Math.min(100, s.pct + (Math.random() < 0.6 ? -1 : 1) * Math.floor(Math.random() * 5)));
          }
        });
        // a busy scanner/printer may free up
        if (d.status === "busy" && Math.random() < 0.4) {
          d.queue.forEach(function (q) { q.done = true; });
          d.status = "online";
        }
        // low supply auto-flag from meters
        if (d.status !== "error") {
          var critical = d.supplies.some(function (s) { return s.pct <= 12; });
          if (critical && d.status !== "low") d.status = "low";
        }
      });
      render();
      stamp();
      refreshBtn.classList.remove("is-spinning");
      toast("Status synced across the floor", "ok");
    }, 650);
  });

  function stamp() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, "0");
    var mm = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("updated").textContent = "Updated " + hh + ":" + mm;
  }

  // --- Toast helper ---
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind === "warn" ? " warn" : kind === "bad" ? " bad" : "");
    t.innerHTML = '<span class="tled"></span>' + msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 250);
    }, 2600);
  }

  render();
  stamp();
})();
