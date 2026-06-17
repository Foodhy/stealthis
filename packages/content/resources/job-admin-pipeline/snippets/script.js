(function () {
  "use strict";

  /* ---------- Data ---------- */
  var STAGES = [
    { id: "applied", name: "Applied", color: "var(--c-applied)" },
    { id: "screening", name: "Screening", color: "var(--c-screening)" },
    { id: "interview", name: "Interview", color: "var(--c-interview)" },
    { id: "offer", name: "Offer", color: "var(--c-offer)" },
    { id: "hired", name: "Hired", color: "var(--c-hired)" }
  ];
  var STAGE_MAP = {};
  STAGES.forEach(function (s) { STAGE_MAP[s.id] = s; });

  var AVATAR_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#16a34a", "#d97706", "#db2777", "#0d9488", "#4f46e5"];

  var candidates = [
    { id: "c1", name: "Amara Okafor", role: "Frontend Engineer", rating: 5, stage: "interview", loc: "Lisbon, PT", remote: true, salary: "€72k", source: "Referral", applied: "5 days ago", tags: ["React", "TypeScript", "Design systems"], note: "Strong portfolio, led a component library migration at her last role. Scored well on the take-home." },
    { id: "c2", name: "Diego Marin", role: "Backend Engineer", rating: 4, stage: "screening", loc: "Bogotá, CO", remote: true, salary: "$68k", source: "LinkedIn", applied: "2 days ago", tags: ["Go", "Postgres", "AWS"], note: "Recruiter screen went well. Pushing for a systems-design round next week." },
    { id: "c3", name: "Priya Raman", role: "Product Designer", rating: 5, stage: "offer", loc: "Berlin, DE", remote: false, salary: "€65k", source: "Dribbble", applied: "12 days ago", tags: ["Figma", "Prototyping", "UX research"], note: "Verbal offer extended Tuesday. Awaiting signed paperwork." },
    { id: "c4", name: "Tobias Lindqvist", role: "Frontend Engineer", rating: 3, stage: "applied", loc: "Stockholm, SE", remote: true, salary: "€70k", source: "Career page", applied: "Just now", tags: ["Vue", "CSS", "a11y"], note: "Fresh application — needs an initial resume review." },
    { id: "c5", name: "Naomi Bennett", role: "Data Analyst", rating: 4, stage: "applied", loc: "Manchester, UK", remote: true, salary: "£48k", source: "Referral", applied: "1 day ago", tags: ["SQL", "Looker", "Python"], note: "Internal referral from the analytics team. Looks like a solid fit." },
    { id: "c6", name: "Hugo Almeida", role: "Backend Engineer", rating: 5, stage: "interview", loc: "Porto, PT", remote: true, salary: "€74k", source: "GitHub", applied: "8 days ago", tags: ["Rust", "gRPC", "Kubernetes"], note: "Crushed the systems round. Scheduling the final panel." },
    { id: "c7", name: "Mei-Ling Chen", role: "Product Designer", rating: 4, stage: "screening", loc: "Singapore, SG", remote: false, salary: "$70k", source: "Portfolio", applied: "3 days ago", tags: ["Brand", "Motion", "Figma"], note: "Excellent motion work. Portfolio review scheduled with design lead." },
    { id: "c8", name: "Lucas Moreau", role: "Frontend Engineer", rating: 2, stage: "applied", loc: "Lyon, FR", remote: true, salary: "€60k", source: "Career page", applied: "4 days ago", tags: ["jQuery", "PHP"], note: "Stack mismatch — likely not a fit for this req." },
    { id: "c9", name: "Sofia Rossi", role: "Data Analyst", rating: 5, stage: "offer", loc: "Milan, IT", remote: true, salary: "€58k", source: "LinkedIn", applied: "10 days ago", tags: ["dbt", "BigQuery", "Stats"], note: "Top candidate in the analyst pool. Offer sent, very enthusiastic." },
    { id: "c10", name: "Kwame Asante", role: "Backend Engineer", rating: 4, stage: "hired", loc: "Accra, GH", remote: true, salary: "$66k", source: "Referral", applied: "21 days ago", tags: ["Node", "Redis", "DevOps"], note: "Signed and starting next month. Onboarding kicked off." },
    { id: "c11", name: "Elena Petrova", role: "Frontend Engineer", rating: 4, stage: "screening", loc: "Tallinn, EE", remote: true, salary: "€69k", source: "GitHub", applied: "6 days ago", tags: ["Svelte", "WebGL", "Perf"], note: "Impressive open-source contributions. Booking a tech screen." },
    { id: "c12", name: "James Whitfield", role: "Product Designer", rating: 3, stage: "applied", loc: "Austin, US", remote: true, salary: "$78k", source: "Dribbble", applied: "2 days ago", tags: ["Figma", "Design ops"], note: "Solid but generalist profile. Worth a screening call." },
    { id: "c13", name: "Yuki Tanaka", role: "Frontend Engineer", rating: 5, stage: "interview", loc: "Tokyo, JP", remote: false, salary: "¥9.2M", source: "Referral", applied: "9 days ago", tags: ["React", "Three.js", "Animation"], note: "Outstanding interactive demos. Final round with the design team next." }
  ];

  /* ---------- Helpers ---------- */
  var board = document.getElementById("board");
  var toastWrap = document.getElementById("toastWrap");

  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function avatarColor(id) {
    var sum = 0;
    for (var i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var ICON = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 17.3-6.18 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73L18.18 21z"/></svg>',
    remote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.7-2.5 2s1.1 1.8 2.5 2 2.5.7 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 16M12 6v1.5M12 16.5V18"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  function starHtml(rating, big) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<span class="' + (i <= rating ? "on" : "") + '">' + ICON.star + "</span>";
    }
    return out;
  }

  function toast(msg, type) {
    var t = el("div", "toast");
    var dot = el("span", "dot");
    if (type === "warn") dot.style.background = "var(--warn)";
    if (type === "info") dot.style.background = "var(--brand)";
    t.appendChild(dot);
    t.appendChild(document.createTextNode(msg));
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("leaving");
      setTimeout(function () { t.remove(); }, 200);
    }, 2600);
  }

  /* ---------- Filters ---------- */
  var searchInput = document.getElementById("search");
  var roleFilter = document.getElementById("roleFilter");
  var ratingFilter = document.getElementById("ratingFilter");
  var clearBtn = document.getElementById("clearBtn");
  var resultNote = document.getElementById("resultNote");

  function passesFilter(c) {
    var q = searchInput.value.trim().toLowerCase();
    if (q) {
      var hay = (c.name + " " + c.role + " " + c.tags.join(" ") + " " + c.loc).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (roleFilter.value && c.role !== roleFilter.value) return false;
    if (c.rating < parseInt(ratingFilter.value, 10)) return false;
    return true;
  }

  /* ---------- Card ---------- */
  function buildCard(c) {
    var card = el("article", "card");
    card.tabIndex = 0;
    card.dataset.id = c.id;
    if (c.isNew) card.dataset.new = "1";
    card.setAttribute("draggable", "true");
    card.setAttribute("aria-label", c.name + ", " + c.role + ", " + STAGE_MAP[c.stage].name + " stage");

    var top = el("div", "card-top");
    var av = el("div", "card-avatar");
    av.style.background = avatarColor(c.id);
    av.textContent = initials(c.name);
    var idBox = el("div", "card-id");
    idBox.appendChild(el("div", "card-name", c.name));
    idBox.appendChild(el("div", "card-role", c.role));
    top.appendChild(av);
    top.appendChild(idBox);
    card.appendChild(top);

    var stars = el("div", "card-stars", starHtml(c.rating));
    stars.setAttribute("aria-label", c.rating + " of 5 stars");
    card.appendChild(stars);

    var chips = el("div", "card-chips");
    chips.appendChild(el("span", "chip", ICON.pin + c.loc));
    chips.appendChild(el("span", "chip", ICON.money + c.salary));
    if (c.remote) chips.appendChild(el("span", "chip remote", ICON.remote + "Remote"));
    card.appendChild(chips);

    var tags = el("div", "card-tags");
    c.tags.slice(0, 3).forEach(function (tg) { tags.appendChild(el("span", "tag", tg)); });
    card.appendChild(tags);

    var foot = el("div", "card-foot");
    foot.appendChild(el("span", "card-meta", c.applied));
    var moveWrap = el("div", "card-move");
    var idx = STAGES.findIndex(function (s) { return s.id === c.stage; });

    var prev = el("button", "mv", ICON.left);
    prev.type = "button";
    prev.title = "Move left";
    prev.setAttribute("aria-label", "Move " + c.name + " to previous stage");
    prev.disabled = idx === 0;
    prev.addEventListener("click", function (e) { e.stopPropagation(); moveCandidate(c.id, idx - 1); });

    var next = el("button", "mv", ICON.right);
    next.type = "button";
    next.title = "Move right";
    next.setAttribute("aria-label", "Move " + c.name + " to next stage");
    next.disabled = idx === STAGES.length - 1;
    next.addEventListener("click", function (e) { e.stopPropagation(); moveCandidate(c.id, idx + 1); });

    moveWrap.appendChild(prev);
    moveWrap.appendChild(next);
    foot.appendChild(moveWrap);
    card.appendChild(foot);

    card.addEventListener("click", function () { openDrawer(c.id); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(c.id); }
    });

    /* drag */
    card.addEventListener("dragstart", function (e) {
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", c.id);
    });
    card.addEventListener("dragend", function () { card.classList.remove("dragging"); });

    return card;
  }

  /* ---------- Render board ---------- */
  function render() {
    board.innerHTML = "";
    var totalShown = 0;

    STAGES.forEach(function (stage) {
      var inStage = candidates.filter(function (c) { return c.stage === stage.id; });
      var visible = inStage.filter(passesFilter);
      totalShown += visible.length;

      var col = el("section", "col");
      col.dataset.stage = stage.id;
      col.setAttribute("aria-label", stage.name + " column");
      col.style.setProperty("--accent", stage.color);

      var head = el("div", "col-head");
      var dot = el("span", "col-dot");
      dot.style.setProperty("--accent", stage.color);
      head.appendChild(dot);
      head.appendChild(el("span", "col-name", stage.name));
      var count = el("span", "col-count", String(visible.length));
      count.setAttribute("aria-label", visible.length + " candidates");
      head.appendChild(count);
      col.appendChild(head);

      var body = el("div", "col-body");
      if (visible.length === 0) {
        body.appendChild(el("div", "col-empty", inStage.length ? "No matches in this stage" : "Drop a candidate here"));
      } else {
        visible.forEach(function (c) { body.appendChild(buildCard(c)); });
      }
      col.appendChild(body);

      /* drop target */
      col.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        col.classList.add("drag-over");
      });
      col.addEventListener("dragleave", function (e) {
        if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
      });
      col.addEventListener("drop", function (e) {
        e.preventDefault();
        col.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        moveCandidateToStage(id, stage.id);
      });

      board.appendChild(col);
    });

    var anyFilter = searchInput.value.trim() || roleFilter.value || ratingFilter.value !== "0";
    resultNote.textContent = anyFilter
      ? "Showing " + totalShown + " of " + candidates.length + " candidates"
      : candidates.length + " candidates across " + STAGES.length + " stages";
  }

  /* ---------- Move logic ---------- */
  function moveCandidate(id, newIdx) {
    if (newIdx < 0 || newIdx >= STAGES.length) return;
    moveCandidateToStage(id, STAGES[newIdx].id);
  }

  function moveCandidateToStage(id, stageId) {
    var c = candidates.find(function (x) { return x.id === id; });
    if (!c || c.stage === stageId) return;
    var fromName = STAGE_MAP[c.stage].name;
    c.stage = stageId;
    c.isNew = false;
    render();
    syncDrawerStage(c);
    toast(c.name + " moved from " + fromName + " to " + STAGE_MAP[stageId].name, "info");
  }

  /* ---------- Drawer / quick view ---------- */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var drawerClose = document.getElementById("drawerClose");
  var qvStageSelect = document.getElementById("qvStageSelect");
  var qvMoveBtn = document.getElementById("qvMoveBtn");
  var currentId = null;
  var lastFocused = null;

  STAGES.forEach(function (s) {
    var o = el("option");
    o.value = s.id;
    o.textContent = s.name;
    qvStageSelect.appendChild(o);
  });

  function openDrawer(id) {
    var c = candidates.find(function (x) { return x.id === id; });
    if (!c) return;
    currentId = id;
    lastFocused = document.activeElement;

    document.getElementById("qvAvatar").textContent = initials(c.name);
    document.getElementById("qvAvatar").style.background = avatarColor(c.id);
    document.getElementById("qvName").textContent = c.name;
    document.getElementById("qvRole").textContent = c.role;
    document.getElementById("qvStars").innerHTML = starHtml(c.rating);
    document.getElementById("qvLoc").textContent = c.loc + (c.remote ? " · Remote OK" : "");
    document.getElementById("qvSalary").textContent = c.salary;
    document.getElementById("qvSource").textContent = c.source;
    document.getElementById("qvApplied").textContent = c.applied;
    document.getElementById("qvNote").textContent = c.note;

    var tagBox = document.getElementById("qvTags");
    tagBox.innerHTML = "";
    c.tags.forEach(function (tg) { tagBox.appendChild(el("span", "tag", tg)); });

    syncDrawerStage(c);
    qvStageSelect.value = c.stage;

    scrim.hidden = false;
    drawer.hidden = false;
    drawerClose.focus();
    document.addEventListener("keydown", onEsc);
  }

  function syncDrawerStage(c) {
    if (currentId !== c.id) return;
    var stageEl = document.getElementById("qvStage");
    var s = STAGE_MAP[c.stage];
    stageEl.innerHTML = '<span class="pill" style="--accent:' + s.color + '">' + s.name + "</span>";
    qvStageSelect.value = c.stage;
  }

  function closeDrawer() {
    drawer.hidden = true;
    scrim.hidden = true;
    currentId = null;
    document.removeEventListener("keydown", onEsc);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onEsc(e) { if (e.key === "Escape") closeDrawer(); }

  drawerClose.addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  qvMoveBtn.addEventListener("click", function () {
    if (currentId) moveCandidateToStage(currentId, qvStageSelect.value);
  });

  /* ---------- Add candidate (demo) ---------- */
  var SAMPLE_NEW = [
    { name: "Ravi Suresh", role: "Backend Engineer", rating: 4, loc: "Pune, IN", remote: true, salary: "$60k", source: "Career page", tags: ["Java", "Spring", "Kafka"], note: "Newly sourced — pending first review." },
    { name: "Clara Nilsson", role: "Product Designer", rating: 5, loc: "Oslo, NO", remote: true, salary: "€67k", source: "Referral", tags: ["Figma", "Systems", "Research"], note: "Newly sourced — pending first review." },
    { name: "Marcus Webb", role: "Data Analyst", rating: 3, loc: "Toronto, CA", remote: true, salary: "$62k", source: "LinkedIn", tags: ["SQL", "Tableau"], note: "Newly sourced — pending first review." },
    { name: "Aisha Haddad", role: "Frontend Engineer", rating: 4, loc: "Tunis, TN", remote: true, salary: "€55k", source: "GitHub", tags: ["React", "Next.js", "a11y"], note: "Newly sourced — pending first review." }
  ];
  var addCount = 0;
  document.getElementById("addBtn").addEventListener("click", function () {
    var tpl = SAMPLE_NEW[addCount % SAMPLE_NEW.length];
    addCount++;
    var c = {
      id: "n" + Date.now(),
      name: tpl.name,
      role: tpl.role,
      rating: tpl.rating,
      stage: "applied",
      loc: tpl.loc,
      remote: tpl.remote,
      salary: tpl.salary,
      source: tpl.source,
      applied: "Just now",
      tags: tpl.tags,
      note: tpl.note,
      isNew: true
    };
    candidates.unshift(c);
    /* reset filters so the new card is visible */
    searchInput.value = "";
    roleFilter.value = "";
    ratingFilter.value = "0";
    render();
    toast(c.name + " added to Applied");
  });

  /* ---------- Wire filters ---------- */
  searchInput.addEventListener("input", render);
  roleFilter.addEventListener("change", render);
  ratingFilter.addEventListener("change", render);
  clearBtn.addEventListener("click", function () {
    searchInput.value = "";
    roleFilter.value = "";
    ratingFilter.value = "0";
    render();
    toast("Filters cleared", "info");
  });

  /* ---------- Init ---------- */
  render();
})();
