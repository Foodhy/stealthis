(function () {
  "use strict";

  var PHASES = ["Intake", "Discovery", "Negotiation", "Trial", "Closed"];

  var MATTERS = [
    {
      no: "2026-CV-0481",
      name: "Vance Robotics v. Nexa Systems",
      area: "Commercial Litigation · Trade Secrets",
      phase: "Discovery",
      attorney: "Dana Calloway",
      role: "Lead Counsel",
      deadline: "Jun 30, 2026",
      deadlineLabel: "Document production due",
      due: true,
      client: "Vance Robotics, Inc.",
      court: "N.D. Cal., Hon. P. Ruiz",
      opened: "Feb 11, 2026",
      timeline: [
        { date: "Feb 11", title: "Complaint filed", note: "Filed in N.D. Cal.; jury demand included.", key: true },
        { date: "Mar 04", title: "Answer & counterclaims served", note: "Nexa asserted two counterclaims." },
        { date: "Apr 22", title: "Rule 26(f) conference", note: "Discovery plan submitted to the court." },
        { date: "Jun 09", title: "First set of interrogatories", note: "Served 18 interrogatories on defendant.", key: true },
        { date: "Jun 30", title: "Document production due", note: "Outstanding — paralegal preparing privilege log." }
      ]
    },
    {
      no: "2026-FAM-0337",
      name: "Estate of Harriet Lindqvist",
      area: "Estate Planning · Probate",
      phase: "Negotiation",
      attorney: "Marcus Reed",
      role: "Partner",
      deadline: "Jul 14, 2026",
      deadlineLabel: "Mediation session",
      due: false,
      client: "Lindqvist Family Trust",
      court: "Probate Div., Hon. A. Bell",
      opened: "Jan 28, 2026",
      timeline: [
        { date: "Jan 28", title: "Petition for probate", note: "Will admitted; executor appointed.", key: true },
        { date: "Mar 16", title: "Heir notification", note: "Statutory notice mailed to four beneficiaries." },
        { date: "May 02", title: "Asset inventory filed", note: "Appraisal of real property completed." },
        { date: "Jul 14", title: "Mediation session", note: "Scheduled to resolve distribution dispute." }
      ]
    },
    {
      no: "2026-CV-0512",
      name: "Okafor v. Brightline Freight Co.",
      area: "Personal Injury · Negligence",
      phase: "Trial",
      attorney: "Priya Anand",
      role: "Trial Counsel",
      deadline: "Jun 26, 2026",
      deadlineLabel: "Pre-trial conference",
      due: true,
      client: "Daniel Okafor",
      court: "Superior Ct., Hon. R. Tan",
      opened: "Sep 09, 2025",
      timeline: [
        { date: "Sep 09 '25", title: "Claim opened", note: "Intake interview and medical records request." },
        { date: "Nov 20 '25", title: "Demand letter sent", note: "Settlement demand rejected by insurer." },
        { date: "Feb 18", title: "Depositions completed", note: "Defendant driver and two witnesses deposed.", key: true },
        { date: "May 30", title: "Expert reports exchanged", note: "Biomechanical and economic experts disclosed." },
        { date: "Jun 26", title: "Pre-trial conference", note: "Jury instructions and exhibit list to be finalized.", key: true }
      ]
    },
    {
      no: "2026-CORP-0190",
      name: "Meridian Labs — Series B Financing",
      area: "Corporate · Venture Finance",
      phase: "Intake",
      attorney: "Dana Calloway",
      role: "Lead Counsel",
      deadline: "Jul 02, 2026",
      deadlineLabel: "Term sheet review",
      due: false,
      client: "Meridian Labs, Inc.",
      court: "Transactional (no court)",
      opened: "Jun 15, 2026",
      timeline: [
        { date: "Jun 15", title: "Engagement signed", note: "Conflict check cleared; matter opened.", key: true },
        { date: "Jun 19", title: "Cap table reviewed", note: "Existing convertible notes catalogued." },
        { date: "Jul 02", title: "Term sheet review", note: "Lead investor term sheet under negotiation." }
      ]
    },
    {
      no: "2025-CV-0904",
      name: "Sandoval v. Cedar Ridge HOA",
      area: "Real Property · Easement",
      phase: "Closed",
      attorney: "Marcus Reed",
      role: "Partner",
      deadline: "May 19, 2026",
      deadlineLabel: "Matter closed",
      due: false,
      client: "Elena Sandoval",
      court: "Superior Ct., Hon. K. Owens",
      opened: "Mar 03, 2025",
      timeline: [
        { date: "Mar 03 '25", title: "Complaint filed", note: "Sought declaratory relief on easement.", key: true },
        { date: "Oct 11 '25", title: "Summary judgment granted", note: "Court ruled easement enforceable." },
        { date: "Apr 30", title: "Settlement executed", note: "HOA agreed to recorded access terms." },
        { date: "May 19", title: "Matter closed", note: "File archived; final invoice issued.", key: true }
      ]
    },
    {
      no: "2026-EMP-0273",
      name: "Tran v. Hollis Marketing Group",
      area: "Employment · Wrongful Termination",
      phase: "Discovery",
      attorney: "Priya Anand",
      role: "Associate",
      deadline: "Jul 09, 2026",
      deadlineLabel: "Deposition of plaintiff",
      due: false,
      client: "Kevin Tran",
      court: "Superior Ct., Hon. J. Mercer",
      opened: "Apr 07, 2026",
      timeline: [
        { date: "Apr 07", title: "EEOC right-to-sue received", note: "Complaint filed within 90-day window.", key: true },
        { date: "May 12", title: "Answer filed", note: "Defendant denied retaliation allegations." },
        { date: "Jun 18", title: "Written discovery served", note: "Requests for production exchanged." },
        { date: "Jul 09", title: "Deposition of plaintiff", note: "Noticed by defense counsel." }
      ]
    }
  ];

  var docket = document.getElementById("docket");
  var emptyEl = document.getElementById("empty");
  var visibleCountEl = document.getElementById("visibleCount");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  /* ---- helpers ---- */
  function initials(name) {
    return name
      .split(" ")
      .map(function (p) {
        return p.charAt(0);
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function stepperMarkup(currentPhase) {
    var idx = PHASES.indexOf(currentPhase);
    var items = PHASES.map(function (phase, i) {
      var cls = i < idx ? "done" : i === idx ? "current" : "";
      // Closed matters: mark every prior phase done and Closed as current.
      return '<li class="' + cls + '"><span>' + phase + "</span></li>";
    }).join("");
    return '<ol class="stepper" aria-label="Case phase">' + items + "</ol>";
  }

  function phaseBadge(m) {
    if (m.phase === "Closed") {
      return '<span class="badge badge--closed">Closed</span>';
    }
    if (m.due) {
      return '<span class="badge badge--due">Due ' + m.deadline + "</span>";
    }
    return '<span class="badge badge--ok">On track</span>';
  }

  /* ---- render cards ---- */
  function renderCards() {
    docket.innerHTML = MATTERS.map(function (m, i) {
      return (
        '<li class="matter" data-phase="' +
        m.phase +
        '">' +
        '<div class="matter__top">' +
        "<div>" +
        '<p class="matter__no">Matter ' +
        m.no +
        "</p>" +
        '<h3 class="matter__name">' +
        m.name +
        "</h3>" +
        '<p class="matter__area">' +
        m.area +
        "</p>" +
        "</div>" +
        phaseBadge(m) +
        "</div>" +
        stepperMarkup(m.phase) +
        '<div class="matter__foot">' +
        '<div class="matter__person">' +
        '<span class="avatar" aria-hidden="true">' +
        initials(m.attorney) +
        "</span>" +
        "<span>" +
        "<small>" +
        m.role +
        "</small>" +
        "<strong>" +
        m.attorney +
        "</strong>" +
        "</span>" +
        "</div>" +
        '<button class="matter__view" type="button" data-open="' +
        i +
        '">View matter</button>' +
        "</div>" +
        "</li>"
      );
    }).join("");
  }

  /* ---- filtering ---- */
  function applyFilter(filter) {
    var cards = docket.querySelectorAll(".matter");
    var visible = 0;
    cards.forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-phase") === filter;
      card.hidden = !show;
      if (show) visible++;
    });
    visibleCountEl.textContent = visible;
    emptyEl.hidden = visible !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("chip--on");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("chip--on");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---- drawer ---- */
  var drawer = document.getElementById("drawer");
  var panel = drawer.querySelector(".drawer__panel");
  var lastFocused = null;

  function openDrawer(index) {
    var m = MATTERS[index];
    if (!m) return;
    lastFocused = document.activeElement;

    document.getElementById("drawerNo").textContent = "Matter " + m.no;
    document.getElementById("drawerTitle").textContent = m.name;

    document.getElementById("drawerMeta").innerHTML =
      "<div><dt>Client</dt><dd>" +
      m.client +
      "</dd></div>" +
      "<div><dt>Practice area</dt><dd>" +
      m.area +
      "</dd></div>" +
      "<div><dt>Assigned attorney</dt><dd>" +
      m.attorney +
      "</dd></div>" +
      "<div><dt>Venue</dt><dd>" +
      m.court +
      "</dd></div>" +
      "<div><dt>Opened</dt><dd>" +
      m.opened +
      "</dd></div>" +
      "<div><dt>Next deadline</dt><dd>" +
      m.deadlineLabel +
      " — " +
      m.deadline +
      "</dd></div>";

    document.getElementById("drawerPhase").innerHTML = stepperMarkup(m.phase);

    document.getElementById("timeline").innerHTML = m.timeline
      .map(function (ev) {
        return (
          '<li class="' +
          (ev.key ? "event--key" : "") +
          '">' +
          "<time>" +
          ev.date +
          "</time>" +
          "<strong>" +
          ev.title +
          "</strong>" +
          "<p>" +
          ev.note +
          "</p>" +
          "</li>"
        );
      })
      .join("");

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    panel.focus();
  }

  function closeDrawer() {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  docket.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-open]");
    if (btn) openDrawer(parseInt(btn.getAttribute("data-open"), 10));
  });

  drawer.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---- boot ---- */
  renderCards();
  applyFilter("all");
})();
