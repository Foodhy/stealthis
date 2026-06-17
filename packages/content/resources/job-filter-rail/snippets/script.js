(function () {
  "use strict";

  // ---------- Fictional job data ----------
  var JOBS = [
    { id: 1, title: "Senior Frontend Engineer", company: "Lumen Labs", color: "#2563eb", role: "Engineering", type: "Full-time", exp: "Senior", remote: "Remote", salary: 165, loc: "San Francisco", days: 1, isNew: true },
    { id: 2, title: "Product Designer", company: "Maple & Co", color: "#9333ea", role: "Design", type: "Full-time", exp: "Mid", remote: "Hybrid", salary: 120, loc: "Berlin", days: 2, isNew: true },
    { id: 3, title: "Data Engineer", company: "Driftwood AI", color: "#0891b2", role: "Data", type: "Full-time", exp: "Senior", remote: "Remote", salary: 150, loc: "Austin", days: 4 },
    { id: 4, title: "Growth Marketing Lead", company: "Brightpath", color: "#d97706", role: "Marketing", type: "Full-time", exp: "Lead", remote: "On-site", salary: 135, loc: "London", days: 3 },
    { id: 5, title: "Junior Backend Developer", company: "Northgate", color: "#16a34a", role: "Engineering", type: "Full-time", exp: "Junior", remote: "Hybrid", salary: 85, loc: "Austin", days: 6 },
    { id: 6, title: "UX Researcher", company: "Maple & Co", color: "#9333ea", role: "Design", type: "Contract", exp: "Mid", remote: "Remote", salary: 95, loc: "Berlin", days: 5 },
    { id: 7, title: "Staff Platform Engineer", company: "Lumen Labs", color: "#2563eb", role: "Engineering", type: "Full-time", exp: "Lead", remote: "Remote", salary: 205, loc: "San Francisco", days: 8 },
    { id: 8, title: "Product Manager", company: "Driftwood AI", color: "#0891b2", role: "Product", type: "Full-time", exp: "Senior", remote: "Hybrid", salary: 158, loc: "London", days: 2, isNew: true },
    { id: 9, title: "Data Analyst Intern", company: "Brightpath", color: "#d97706", role: "Data", type: "Internship", exp: "Junior", remote: "On-site", salary: 55, loc: "Austin", days: 9 },
    { id: 10, title: "Senior UI Engineer", company: "Northgate", color: "#16a34a", role: "Engineering", type: "Full-time", exp: "Senior", remote: "Remote", salary: 170, loc: "Remote", days: 7 },
    { id: 11, title: "Content Marketing Specialist", company: "Maple & Co", color: "#9333ea", role: "Marketing", type: "Part-time", exp: "Mid", remote: "Remote", salary: 70, loc: "Berlin", days: 11 },
    { id: 12, title: "Machine Learning Engineer", company: "Driftwood AI", color: "#0891b2", role: "Data", type: "Full-time", exp: "Senior", remote: "Hybrid", salary: 190, loc: "San Francisco", days: 1, isNew: true },
    { id: 13, title: "Associate Product Designer", company: "Brightpath", color: "#d97706", role: "Design", type: "Full-time", exp: "Junior", remote: "Hybrid", salary: 88, loc: "London", days: 5 },
    { id: 14, title: "Backend Engineer (Contract)", company: "Lumen Labs", color: "#2563eb", role: "Engineering", type: "Contract", exp: "Mid", remote: "Remote", salary: 130, loc: "Remote", days: 10 },
    { id: 15, title: "Lead Product Manager", company: "Northgate", color: "#16a34a", role: "Product", type: "Full-time", exp: "Lead", remote: "On-site", salary: 180, loc: "Austin", days: 4 },
  ];

  // ---------- State ----------
  var state = {
    keyword: "",
    role: [], type: [], exp: [],
    remote: "any",
    salary: 0,
    locations: [],
    sort: "relevance",
    saved: {},
  };

  // ---------- DOM ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var form = $("#filterForm");
  var jobList = $("#jobList");
  var countEl = $("#count");
  var subEl = $("#sub");
  var activeBar = $("#activeBar");
  var activeChips = $("#activeChips");
  var emptyEl = $("#empty");
  var toggleCount = $("#toggleCount");
  var rail = $("#rail");
  var scrim = $("#scrim");

  // ---------- Toast ----------
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
  }

  // ---------- Filtering ----------
  function matches(job) {
    var k = state.keyword.trim().toLowerCase();
    if (k) {
      var hay = (job.title + " " + job.company + " " + job.role).toLowerCase();
      if (hay.indexOf(k) === -1) return false;
    }
    if (state.role.length && state.role.indexOf(job.role) === -1) return false;
    if (state.type.length && state.type.indexOf(job.type) === -1) return false;
    if (state.exp.length && state.exp.indexOf(job.exp) === -1) return false;
    if (state.remote !== "any" && job.remote !== state.remote) return false;
    if (state.salary > 0 && job.salary < state.salary) return false;
    if (state.locations.length) {
      var hit = state.locations.some(function (l) {
        return job.loc.toLowerCase() === l.toLowerCase();
      });
      if (!hit) return false;
    }
    return true;
  }

  function sortJobs(list) {
    var arr = list.slice();
    if (state.sort === "salary") arr.sort(function (a, b) { return b.salary - a.salary; });
    else if (state.sort === "recent") arr.sort(function (a, b) { return a.days - b.days; });
    else arr.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.days - b.days; });
    return arr;
  }

  // ---------- Render ----------
  function icon(name) {
    var p = {
      pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/>',
      cash: '<path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>',
      clock: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
      wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a5.5 5.5 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor"/>',
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p[name] + "</svg>";
  }

  function initials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function render() {
    var filtered = JOBS.filter(matches);
    var sorted = sortJobs(filtered);

    countEl.textContent = sorted.length;
    var n = activeCount();
    subEl.textContent = n
      ? n + " filter" + (n === 1 ? "" : "s") + " applied"
      : "Showing all open roles";

    jobList.innerHTML = "";
    sorted.forEach(function (job) {
      var li = document.createElement("li");
      var isSaved = !!state.saved[job.id];
      li.className = "jobcard";
      li.innerHTML =
        '<div class="logo" style="background:' + job.color + '">' + initials(job.company) + "</div>" +
        '<div class="job__main">' +
          '<div class="job__title">' + esc(job.title) +
            (job.isNew ? '<span class="tag-new">New</span>' : "") +
          "</div>" +
          '<div class="job__company">' + esc(job.company) + " · " + esc(job.exp) + "-level</div>" +
          '<div class="chips">' +
            '<span class="chip chip--salary">' + icon("cash") + "$" + job.salary + "k</span>" +
            '<span class="chip">' + icon("pin") + esc(job.loc) + "</span>" +
            '<span class="chip chip--remote">' + icon("wifi") + esc(job.remote) + "</span>" +
            '<span class="chip">' + esc(job.type) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="job__side">' +
          '<button class="save" type="button" aria-pressed="' + isSaved + '" aria-label="Save ' + esc(job.title) + '" data-save="' + job.id + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
          "</button>" +
          '<span class="job__age">' + icon("clock") + " " + (job.days === 1 ? "1 day" : job.days + " days") + " ago</span>" +
        "</div>";
      jobList.appendChild(li);
    });

    emptyEl.hidden = sorted.length !== 0;
    jobList.hidden = sorted.length === 0;

    renderActiveChips();
    toggleCount.textContent = n;
    toggleCount.setAttribute("data-empty", n === 0);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---------- Active filter chips ----------
  function activeChipDefs() {
    var defs = [];
    if (state.keyword.trim()) defs.push({ label: "Search", val: state.keyword.trim(), kind: "keyword" });
    state.role.forEach(function (v) { defs.push({ label: "Role", val: v, kind: "role" }); });
    state.type.forEach(function (v) { defs.push({ label: "Type", val: v, kind: "type" }); });
    state.exp.forEach(function (v) { defs.push({ label: "Level", val: v, kind: "exp" }); });
    if (state.remote !== "any") defs.push({ label: "Mode", val: state.remote, kind: "remote" });
    if (state.salary > 0) defs.push({ label: "Min", val: "$" + state.salary + "k", kind: "salary" });
    state.locations.forEach(function (v) { defs.push({ label: "City", val: v, kind: "loc" }); });
    return defs;
  }
  function activeCount() { return activeChipDefs().length; }

  function renderActiveChips() {
    var defs = activeChipDefs();
    activeBar.hidden = defs.length === 0;
    activeChips.innerHTML = "";
    defs.forEach(function (d) {
      var chip = document.createElement("span");
      chip.className = "achip";
      chip.innerHTML = "<b>" + d.label + ":</b> " + esc(d.val) +
        '<button type="button" aria-label="Remove ' + esc(d.label + " " + d.val) + '">✕</button>';
      chip.querySelector("button").addEventListener("click", function () {
        removeFilter(d.kind, d.val);
      });
      activeChips.appendChild(chip);
    });
  }

  function removeFilter(kind, val) {
    if (kind === "keyword") { state.keyword = ""; $("#keyword").value = ""; }
    else if (kind === "remote") { state.remote = "any"; $('input[name="remote"][value="any"]').checked = true; }
    else if (kind === "salary") { state.salary = 0; $("#salary").value = 0; updateSalaryOut(); }
    else if (kind === "loc") {
      state.locations = state.locations.filter(function (l) { return l !== val; });
      renderLocChips();
    } else {
      var arr = state[kind];
      var i = arr.indexOf(val);
      if (i > -1) arr.splice(i, 1);
      var cb = $('input[name="' + kind + '"][value="' + cssEsc(val) + '"]');
      if (cb) cb.checked = false;
    }
    render();
  }

  function cssEsc(v) { return v.replace(/"/g, '\\"'); }

  // ---------- Salary ----------
  var salary = $("#salary");
  var salaryOut = $("#salaryOut");
  function updateSalaryOut() {
    var v = +salary.value;
    salaryOut.textContent = v >= 220 ? "$220k+" : "$" + v + "k+";
  }
  salary.addEventListener("input", function () {
    state.salary = +salary.value;
    updateSalaryOut();
    render();
  });

  // ---------- Checkboxes & radios ----------
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.type === "checkbox") {
      var name = t.name;
      if (!state[name]) return;
      if (t.checked) state[name].push(t.value);
      else state[name] = state[name].filter(function (v) { return v !== t.value; });
      render();
    } else if (t.type === "radio" && t.name === "remote") {
      state.remote = t.value;
      render();
    }
  });

  // ---------- Keyword ----------
  $("#keyword").addEventListener("input", function (e) {
    state.keyword = e.target.value;
    render();
  });

  // ---------- Sort ----------
  $("#sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render();
  });

  // ---------- Location ----------
  var locField = $("#locField");
  var locChips = $("#locChips");
  function addLocation(raw) {
    var v = raw.trim();
    if (!v) return;
    var exists = state.locations.some(function (l) { return l.toLowerCase() === v.toLowerCase(); });
    if (exists) { toast(v + " already added"); return; }
    state.locations.push(v);
    renderLocChips();
    render();
  }
  function renderLocChips() {
    locChips.innerHTML = "";
    state.locations.forEach(function (loc) {
      var c = document.createElement("span");
      c.className = "locchip";
      c.innerHTML = esc(loc) + '<button type="button" aria-label="Remove ' + esc(loc) + '">✕</button>';
      c.querySelector("button").addEventListener("click", function () {
        state.locations = state.locations.filter(function (l) { return l !== loc; });
        renderLocChips();
        render();
      });
      locChips.appendChild(c);
    });
    // hide suggestion buttons already chosen
    $$(".locsugg button").forEach(function (b) {
      var chosen = state.locations.some(function (l) { return l.toLowerCase() === b.dataset.loc.toLowerCase(); });
      b.hidden = chosen;
    });
  }
  locField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addLocation(locField.value); locField.value = ""; }
  });
  $("#locAdd").addEventListener("click", function () { addLocation(locField.value); locField.value = ""; });
  $$(".locsugg button").forEach(function (b) {
    b.addEventListener("click", function () { addLocation(b.dataset.loc); });
  });

  // ---------- Collapsible groups ----------
  $$(".fgroup__head").forEach(function (head) {
    head.addEventListener("click", function () {
      var group = head.closest(".fgroup");
      var open = group.getAttribute("data-open") === "true";
      group.setAttribute("data-open", String(!open));
      head.setAttribute("aria-expanded", String(!open));
    });
  });

  // ---------- Save toggle (delegated) ----------
  jobList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-save]");
    if (!btn) return;
    var id = +btn.dataset.save;
    state.saved[id] = !state.saved[id];
    btn.setAttribute("aria-pressed", String(state.saved[id]));
    toast(state.saved[id] ? "Saved to your shortlist" : "Removed from shortlist");
  });

  // ---------- Clear all ----------
  function clearAll() {
    state.keyword = ""; state.role = []; state.type = []; state.exp = [];
    state.remote = "any"; state.salary = 0; state.locations = [];
    form.reset();
    $("#keyword").value = "";
    $('input[name="remote"][value="any"]').checked = true;
    updateSalaryOut();
    renderLocChips();
    render();
    toast("Filters cleared");
  }
  $("#clearAll").addEventListener("click", clearAll);
  $("#clearAllRail").addEventListener("click", clearAll);
  $("#emptyClear").addEventListener("click", clearAll);

  // ---------- Drawer ----------
  function openDrawer() {
    rail.classList.add("open");
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("show"); });
    document.body.style.overflow = "hidden";
    rail.focus();
  }
  function closeDrawer() {
    rail.classList.remove("open");
    scrim.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function () { scrim.hidden = true; }, 240);
  }
  $("#openDrawer").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#applyDrawer").addEventListener("click", function () {
    closeDrawer();
    toast(JOBS.filter(matches).length + " jobs match");
  });
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && rail.classList.contains("open")) closeDrawer();
  });

  // ---------- Init ----------
  updateSalaryOut();
  renderLocChips();
  render();
})();
