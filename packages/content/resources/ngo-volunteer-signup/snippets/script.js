(function () {
  "use strict";

  /* ---------- Data ---------- */
  var CAUSE_META = {
    hunger:      { label: "Hunger",      g: "linear-gradient(135deg,#e8743b,#cc5d28)" },
    education:   { label: "Education",   g: "linear-gradient(135deg,#3d8bcf,#2a6aa3)" },
    environment: { label: "Environment", g: "linear-gradient(135deg,#1f7a6d,#155e54)" },
    housing:     { label: "Housing",     g: "linear-gradient(135deg,#9a6b3d,#7a522d)" },
    health:      { label: "Health",      g: "linear-gradient(135deg,#b8506b,#8f3b53)" }
  };

  var COMMIT_LABEL = {
    "one-time": "One-time",
    "weekly": "Weekly",
    "flexible": "Flexible hrs"
  };

  var OPPS = [
    { id: "o1", title: "Community Kitchen Cook", org: "Riverline Hope Kitchen", cause: "hunger",
      commitment: "weekly", location: "onsite", area: "Riverside Hall", remote: false,
      hours: "Sat mornings · 4 hrs", skills: ["Cooking", "Teamwork"], capacity: 12, filled: 9,
      photoCap: "Volunteers plating 300 meals",
      desc: "Help prepare and serve free hot meals to neighbors facing food insecurity. No professional experience needed — our chefs guide every shift.",
      tasks: ["Chop, prep and cook from a set menu", "Plate and serve with our front-of-house team", "Wipe down and reset the kitchen for the next crew"] },

    { id: "o2", title: "After-School Reading Buddy", org: "Eastvale Learning Center", cause: "education",
      commitment: "weekly", location: "onsite", area: "Eastvale Library", remote: false,
      hours: "Tue & Thu · 3–5pm", skills: ["Tutoring", "Patience"], capacity: 20, filled: 14,
      photoCap: "1:1 tutoring with grade-2 readers",
      desc: "Sit one-on-one with a child and build their confidence through 30-minute reading sessions. Training and books provided.",
      tasks: ["Read aloud and listen with young learners", "Log progress on a simple sheet", "Cheer on small wins"] },

    { id: "o3", title: "Riverbank Cleanup Crew", org: "Green Riverline Project", cause: "environment",
      commitment: "one-time", location: "onsite", area: "North Bend Trail", remote: false,
      hours: "Sun · 9am–1pm", skills: ["Outdoors", "Stamina"], capacity: 40, filled: 38,
      photoCap: "Clearing 2 miles of shoreline",
      desc: "Spend a morning outdoors pulling litter and invasive growth from the river’s edge. Gloves, bags and snacks are on us.",
      tasks: ["Collect and sort litter into recycling streams", "Tag invasive plants for the restoration team", "Plant native grasses along bare banks"] },

    { id: "o4", title: "Move-In Day Helper", org: "Doorway Home Partners", cause: "housing",
      commitment: "one-time", location: "onsite", area: "Maple District", remote: false,
      hours: "Flexible · 5 hrs", skills: ["Heavy lifting", "Driving"], capacity: 8, filled: 8,
      photoCap: "Welcoming a family into their first home",
      desc: "Help a family settle into permanent housing — carry boxes, build basic furniture and set up a warm welcome.",
      tasks: ["Load, transport and unload belongings", "Assemble beds and shelving", "Stock a welcome-home pantry box"] },

    { id: "o5", title: "Remote Grant Writer", org: "Riverline Hope HQ", cause: "education",
      commitment: "flexible", location: "remote", area: "Remote", remote: true,
      hours: "~5 hrs / week", skills: ["Writing", "Research"], capacity: 5, filled: 2,
      photoCap: "Funding the next 1,000 meals",
      desc: "Use your words from anywhere. Research funders and draft compelling grant applications that keep our programs running.",
      tasks: ["Research aligned foundations and deadlines", "Draft and edit grant narratives", "Track submissions in our shared tracker"] },

    { id: "o6", title: "Wellness Check Caller", org: "Neighbors Care Line", cause: "health",
      commitment: "weekly", location: "remote", area: "Remote", remote: true,
      hours: "2 evenings / week", skills: ["Listening", "Empathy"], capacity: 16, filled: 7,
      photoCap: "Friendly calls to isolated elders",
      desc: "Phone older neighbors living alone for a friendly chat and a safety check. Training, scripts and a coordinator support you.",
      tasks: ["Make scheduled wellness calls", "Note any needs for our care team", "Brighten someone’s day with conversation"] },

    { id: "o7", title: "Mobile Pantry Driver", org: "Riverline Hope Kitchen", cause: "hunger",
      commitment: "flexible", location: "onsite", area: "9 neighborhoods", remote: false,
      hours: "Choose your route", skills: ["Driving", "Logistics"], capacity: 10, filled: 6,
      photoCap: "Groceries delivered door to door",
      desc: "Deliver boxes of fresh groceries to homebound families on a route that fits your week. A valid license is required.",
      tasks: ["Pick up packed boxes from the depot", "Follow a delivery route with our app", "Confirm deliveries with a friendly hello"] },

    { id: "o8", title: "Community Garden Mentor", org: "Green Riverline Project", cause: "environment",
      commitment: "weekly", location: "onsite", area: "Southgate Lot", remote: false,
      hours: "Wed mornings · 3 hrs", skills: ["Gardening", "Teaching"], capacity: 14, filled: 4,
      photoCap: "Growing food and confidence together",
      desc: "Share your green thumb with families learning to grow their own food in our shared plots. Beginners welcome to mentor beginners.",
      tasks: ["Guide planting, watering and harvesting", "Maintain shared tools and compost", "Host short ‘grow your own’ chats"] },

    { id: "o9", title: "Event Photographer", org: "Riverline Hope HQ", cause: "education",
      commitment: "one-time", location: "onsite", area: "Riverside Hall", remote: false,
      hours: "Gala night · 4 hrs", skills: ["Photography", "Editing"], capacity: 4, filled: 1,
      photoCap: "Telling our story in pictures",
      desc: "Capture the warmth of our spring gala so we can share the impact with donors and the community.",
      tasks: ["Shoot candid and posed moments", "Deliver edited highlights within a week", "Tag photos for our media library"] }
  ];

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var toastStack = $("#toastStack");
  function toast(msg, kind) {
    var t = el("div", "toast" + (kind ? " " + kind : ""));
    var ico = kind === "ok" ? "✓" : kind === "warn" ? "!" : "♡";
    t.innerHTML = '<span class="t-ico" aria-hidden="true">' + ico + "</span><span>" + msg + "</span>";
    toastStack.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 280);
    }, 3200);
  }

  var ICON = {
    pin: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'
  };

  /* ---------- Filter state ---------- */
  var state = { cause: "all", commitment: "all", location: "all", q: "" };
  var grid = $("#cardGrid");
  var emptyState = $("#emptyState");
  var resultCount = $("#resultCount");
  var clearBtn = $("#clearFilters");

  function matches(o) {
    if (state.cause !== "all" && o.cause !== state.cause) return false;
    if (state.commitment !== "all" && o.commitment !== state.commitment) return false;
    if (state.location !== "all" && o.location !== state.location) return false;
    if (state.q) {
      var hay = (o.title + " " + o.org + " " + o.area + " " + o.skills.join(" ")).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function spotsClass(o) {
    var left = o.capacity - o.filled;
    if (left <= 0) return "full";
    if (left <= Math.max(2, Math.ceil(o.capacity * 0.2))) return "low";
    return "";
  }

  function cardHTML(o) {
    var meta = CAUSE_META[o.cause];
    var left = o.capacity - o.filled;
    var pct = Math.round((o.filled / o.capacity) * 100);
    var sc = spotsClass(o);
    var card = el("article", "card");
    card.dataset.id = o.id;

    var spotsText = left <= 0
      ? '<span style="color:var(--danger);font-weight:700">Fully staffed — join the waitlist</span>'
      : "<b>" + left + " spot" + (left === 1 ? "" : "s") + " left</b> of " + o.capacity;

    card.innerHTML =
      '<div class="card-photo" style="background:' + meta.g + '">' +
        '<span class="cause-tag">' + meta.label + "</span>" +
        (o.remote ? '<span class="remote-tag">Remote</span>' : "") +
        '<span class="photo-cap">' + o.photoCap + "</span>" +
      "</div>" +
      '<div class="card-body">' +
        "<h3>" + o.title + "</h3>" +
        '<p class="card-org">' + o.org + "</p>" +
        '<div class="card-meta">' +
          "<span>" + ICON.pin + o.area + "</span>" +
          "<span>" + ICON.clock + o.hours + "</span>" +
          "<span>" + ICON.repeat + COMMIT_LABEL[o.commitment] + "</span>" +
        "</div>" +
        '<div class="skills">' + o.skills.map(function (s) { return '<span class="skill-pill">' + s + "</span>"; }).join("") + "</div>" +
        '<div class="spots">' +
          '<div class="spots-bar ' + sc + '"><i style="width:' + pct + '%"></i></div>' +
          '<p class="spots-text">' + spotsText + "</p>" +
        "</div>" +
        '<div class="card-actions">' +
          '<button class="btn btn-brand btn-block" data-open="' + o.id + '">' +
            (left <= 0 ? "View &amp; join waitlist" : "View &amp; apply") +
          "</button>" +
        "</div>" +
      "</div>";
    return card;
  }

  function render() {
    var list = OPPS.filter(matches);
    grid.innerHTML = "";
    list.forEach(function (o) { grid.appendChild(cardHTML(o)); });

    emptyState.hidden = list.length !== 0;
    resultCount.textContent = list.length === 0
      ? "No roles found"
      : "Showing " + list.length + " of " + OPPS.length + " open roles";

    var active = state.cause !== "all" || state.commitment !== "all" || state.location !== "all" || state.q !== "";
    clearBtn.hidden = !active;
  }

  /* ---------- Filter wiring ---------- */
  document.querySelectorAll(".filter-group").forEach(function (group) {
    var key = group.dataset.filter;
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state[key] = chip.dataset.value;
      render();
    });
  });

  $("#searchInput").addEventListener("input", function (e) {
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  function resetFilters() {
    state = { cause: "all", commitment: "all", location: "all", q: "" };
    $("#searchInput").value = "";
    document.querySelectorAll(".filter-group").forEach(function (group) {
      group.querySelectorAll(".chip").forEach(function (c, i) { c.classList.toggle("is-active", i === 0); });
    });
    render();
  }
  clearBtn.addEventListener("click", resetFilters);
  $("#emptyReset").addEventListener("click", function (e) { e.preventDefault(); resetFilters(); });

  /* ---------- Drawer ---------- */
  var scrim = $("#scrim");
  var drawer = $("#drawer");
  var drawerBody = $("#drawerBody");
  var lastFocus = null;

  function openDrawer(id) {
    var o = OPPS.find(function (x) { return x.id === id; });
    if (!o) return;
    lastFocus = document.activeElement;
    var meta = CAUSE_META[o.cause];
    var left = o.capacity - o.filled;
    var isFull = left <= 0;

    drawerBody.innerHTML =
      '<div class="drawer-photo" style="background:' + meta.g + '">' +
        '<span class="cause-tag d-cause">' + meta.label + "</span>" +
      "</div>" +
      '<div class="drawer-content">' +
        '<h2 id="drawerTitle">' + o.title + "</h2>" +
        '<p class="drawer-org">' + o.org + "</p>" +
        '<div class="d-grid">' +
          fact("Where", o.remote ? "Remote" : o.area) +
          fact("When", o.hours) +
          fact("Commitment", COMMIT_LABEL[o.commitment]) +
          fact("Openings", isFull ? "Waitlist only" : left + " of " + o.capacity) +
        "</div>" +
        '<p class="d-desc">' + o.desc + "</p>" +
        "<h3 style=\"font-family:var(--serif);font-size:1.05rem;margin-bottom:.4rem\">What you'll do</h3>" +
        '<ul class="d-list">' + o.tasks.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
        '<div class="skills" style="margin-bottom:1.3rem">' + o.skills.map(function (s) { return '<span class="skill-pill">' + s + "</span>"; }).join("") + "</div>" +
        applyFormHTML(o, isFull) +
      "</div>";

    wireForm(o, isFull);

    scrim.hidden = false;
    drawer.hidden = false;
    requestAnimationFrame(function () {
      scrim.classList.add("show");
      drawer.classList.add("show");
    });
    document.body.style.overflow = "hidden";
    setTimeout(function () { $("#drawerTitle").setAttribute("tabindex", "-1"); $("#drawerTitle").focus(); }, 60);
  }

  function fact(k, v) {
    return '<div class="d-fact"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>";
  }

  function applyFormHTML(o, isFull) {
    return '<div class="apply-card">' +
      "<h3>" + (isFull ? "Join the waitlist" : "Apply for this role") + "</h3>" +
      '<p class="form-sub">' + (isFull
        ? "This role is full — we’ll reach out the moment a spot opens."
        : "Tell us a little about you. We’ll confirm within 2 working days.") + "</p>" +
      '<form id="applyForm" novalidate>' +
        field("vName", "text", "Full name", true) +
        field("vEmail", "email", "Email address", true) +
        field("vPhone", "tel", "Phone (optional)", false) +
        '<div class="field" id="f-avail">' +
          '<label>Availability <span class="req">*</span></label>' +
          '<div class="checks" role="group" aria-label="Availability">' +
            availBox("Weekday mornings") + availBox("Weekday evenings") +
            availBox("Weekends") + availBox("Flexible / on-call") +
          "</div>" +
          '<p class="field-error">Pick at least one time you can help.</p>' +
        "</div>" +
        '<div class="field">' +
          '<label for="vWhy">Why this role? (optional)</label>' +
          '<textarea id="vWhy" placeholder="A sentence or two about what draws you in…"></textarea>' +
        "</div>" +
        '<button type="submit" class="btn btn-accent btn-block">' +
          (isFull ? "Add me to the waitlist" : "Submit application") +
        "</button>" +
      "</form>" +
    "</div>";
  }

  function field(id, type, label, required) {
    return '<div class="field" id="f-' + id + '">' +
      '<label for="' + id + '">' + label + (required ? ' <span class="req">*</span>' : "") + "</label>" +
      '<input id="' + id + '" type="' + type + '" />' +
      '<p class="field-error">Please enter a valid ' + label.toLowerCase().replace(" (optional)", "") + ".</p>" +
    "</div>";
  }

  function availBox(label) {
    return '<label class="check"><input type="checkbox" value="' + label + '" />' + label + "</label>";
  }

  function wireForm(o, isFull) {
    var form = $("#applyForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      var name = $("#vName");
      var fName = $("#f-vName");
      if (!name.value.trim()) { fName.classList.add("invalid"); ok = false; } else { fName.classList.remove("invalid"); }

      var email = $("#vEmail");
      var fEmail = $("#f-vEmail");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { fEmail.classList.add("invalid"); ok = false; } else { fEmail.classList.remove("invalid"); }

      var avail = form.querySelectorAll('#f-avail input:checked');
      var fAvail = $("#f-avail");
      if (avail.length === 0) { fAvail.classList.add("invalid"); ok = false; } else { fAvail.classList.remove("invalid"); }

      if (!ok) {
        toast("Please fix the highlighted fields.", "warn");
        var firstBad = form.querySelector(".invalid input");
        if (firstBad) firstBad.focus();
        return;
      }

      // success — update capacity if a real spot
      if (!isFull) {
        o.filled = Math.min(o.capacity, o.filled + 1);
        render();
      }

      var first = name.value.trim().split(" ")[0];
      $(".apply-card").innerHTML =
        '<div class="form-success">' +
          '<div class="tick"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
          "<h3>Thank you, " + first + "!</h3>" +
          "<p>" + (isFull
            ? "You’re on the waitlist for <strong>" + o.title + "</strong>. We’ll email you the moment a spot opens."
            : "Your application for <strong>" + o.title + "</strong> is in. A coordinator will confirm within 2 working days.") + "</p>" +
        "</div>";
      toast(isFull ? "Added to the waitlist — thank you!" : "Application submitted — welcome aboard!", "ok");
    });

    // clear error on input
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f) f.classList.remove("invalid");
    });
  }

  function closeDrawer() {
    scrim.classList.remove("show");
    drawer.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function () {
      scrim.hidden = true;
      drawer.hidden = true;
      drawerBody.innerHTML = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 320);
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-open]");
    if (btn) openDrawer(btn.dataset.open);
  });
  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  /* ---------- Animated counters ---------- */
  function animateCount(node) {
    var target = parseInt(node.dataset.count, 10);
    var prefix = node.dataset.prefix || "";
    var suffix = node.dataset.suffix || "";
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      node.textContent = prefix + val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Init ---------- */
  render();
})();
