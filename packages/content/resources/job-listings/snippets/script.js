(function () {
  "use strict";

  // ---- fictional data ----
  var JOBS = [
    { id: 1, title: "Senior Frontend Engineer", company: "Lumen Labs", logo: "L", color: "#2563eb", role: "Engineering", location: "Berlin", remote: true, salaryMin: 95, salaryMax: 125, type: "Full-time", level: "Senior", posted: 1, tags: ["React", "TypeScript", "Design Systems"] },
    { id: 2, title: "Product Designer", company: "Fernweh", logo: "F", color: "#9333ea", role: "Design", location: "Lisbon", remote: true, salaryMin: 70, salaryMax: 90, type: "Full-time", level: "Mid", posted: 2, tags: ["Figma", "UX", "Prototyping"] },
    { id: 3, title: "Data Analyst", company: "Brightwater", logo: "B", color: "#0891b2", role: "Data", location: "London", remote: false, salaryMin: 55, salaryMax: 72, type: "Full-time", level: "Junior", posted: 0, tags: ["SQL", "Python", "Tableau"] },
    { id: 4, title: "Engineering Lead", company: "Northwind", logo: "N", color: "#16a34a", role: "Engineering", location: "Austin", remote: true, salaryMin: 150, salaryMax: 190, type: "Full-time", level: "Lead", posted: 5, tags: ["Go", "AWS", "Leadership"] },
    { id: 5, title: "Growth Marketing Manager", company: "Pixelpush", logo: "P", color: "#db2777", role: "Marketing", location: "Toronto", remote: false, salaryMin: 78, salaryMax: 98, type: "Full-time", level: "Mid", posted: 3, tags: ["SEO", "Lifecycle", "Analytics"] },
    { id: 6, title: "Product Manager, Payments", company: "Cohort", logo: "C", color: "#ea580c", role: "Product", location: "London", remote: true, salaryMin: 110, salaryMax: 140, type: "Full-time", level: "Senior", posted: 1, tags: ["Fintech", "Roadmaps", "B2B"] },
    { id: 7, title: "Backend Engineer (Contract)", company: "Meridian", logo: "M", color: "#4f46e5", role: "Engineering", location: "Berlin", remote: true, salaryMin: 80, salaryMax: 110, type: "Contract", level: "Mid", posted: 6, tags: ["Node.js", "Postgres", "GraphQL"] },
    { id: 8, title: "UX Research Intern", company: "Fernweh", logo: "F", color: "#9333ea", role: "Design", location: "Lisbon", remote: false, salaryMin: 40, salaryMax: 48, type: "Internship", level: "Junior", posted: 4, tags: ["Interviews", "Surveys"] },
    { id: 9, title: "Machine Learning Engineer", company: "Brightwater", logo: "B", color: "#0891b2", role: "Data", location: "Toronto", remote: true, salaryMin: 120, salaryMax: 160, type: "Full-time", level: "Senior", posted: 2, tags: ["PyTorch", "MLOps", "NLP"] },
    { id: 10, title: "Brand Designer", company: "Pixelpush", logo: "P", color: "#db2777", role: "Design", location: "Austin", remote: true, salaryMin: 65, salaryMax: 85, type: "Part-time", level: "Mid", posted: 8, tags: ["Branding", "Illustration"] },
    { id: 11, title: "Junior Frontend Developer", company: "Lumen Labs", logo: "L", color: "#2563eb", role: "Engineering", location: "Berlin", remote: false, salaryMin: 48, salaryMax: 62, type: "Full-time", level: "Junior", posted: 7, tags: ["JavaScript", "CSS", "Vue"] },
    { id: 12, title: "Director of Product", company: "Cohort", logo: "C", color: "#ea580c", role: "Product", location: "London", remote: true, salaryMin: 170, salaryMax: 200, type: "Full-time", level: "Lead", posted: 10, tags: ["Strategy", "Hiring", "OKRs"] },
    { id: 13, title: "Content Marketer", company: "Northwind", logo: "N", color: "#16a34a", role: "Marketing", location: "Lisbon", remote: true, salaryMin: 52, salaryMax: 68, type: "Full-time", level: "Mid", posted: 0, tags: ["Copywriting", "Editorial"] },
    { id: 14, title: "Platform Engineer", company: "Meridian", logo: "M", color: "#4f46e5", role: "Engineering", location: "Toronto", remote: true, salaryMin: 105, salaryMax: 135, type: "Full-time", level: "Senior", posted: 3, tags: ["Kubernetes", "Terraform", "CI/CD"] },
    { id: 15, title: "Analytics Engineer", company: "Brightwater", logo: "B", color: "#0891b2", role: "Data", location: "London", remote: false, salaryMin: 82, salaryMax: 102, type: "Full-time", level: "Mid", posted: 5, tags: ["dbt", "Snowflake", "SQL"] },
    { id: 16, title: "Associate Product Manager", company: "Cohort", logo: "C", color: "#ea580c", role: "Product", location: "Austin", remote: false, salaryMin: 70, salaryMax: 88, type: "Full-time", level: "Junior", posted: 2, tags: ["Discovery", "Metrics"] }
  ];

  var PAGE_SIZE = 6;
  var saved = {};
  var currentPage = 1;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var listEl = $("#jobList");
  var countEl = $("#countLabel");
  var pagerEl = $("#pager");
  var emptyEl = $("#emptyState");
  var form = $("#filterForm");
  var searchInput = $("#searchInput");
  var sortSelect = $("#sortSelect");
  var salaryRange = $("#fSalary");
  var salaryOut = $("#salaryOut");

  // ---- toast ----
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2200);
  }

  function postedLabel(d) {
    if (d === 0) return "Today";
    if (d === 1) return "1 day ago";
    return d + " days ago";
  }

  function getFilters() {
    var fd = new FormData(form);
    return {
      role: fd.get("role") || "",
      location: fd.get("location") || "",
      remote: !!fd.get("remote"),
      salary: parseInt(salaryRange.value, 10),
      types: fd.getAll("type"),
      levels: fd.getAll("level"),
      q: searchInput.value.trim().toLowerCase()
    };
  }

  function matches(job, f) {
    if (f.role && job.role !== f.role) return false;
    if (f.location && job.location !== f.location) return false;
    if (f.remote && !job.remote) return false;
    if (f.salary > 40 && job.salaryMax < f.salary) return false;
    if (f.types.length && f.types.indexOf(job.type) === -1) return false;
    if (f.levels.length && f.levels.indexOf(job.level) === -1) return false;
    if (f.q) {
      var hay = (job.title + " " + job.company + " " + job.tags.join(" ")).toLowerCase();
      if (hay.indexOf(f.q) === -1) return false;
    }
    return true;
  }

  function sortJobs(arr, mode) {
    var a = arr.slice();
    if (mode === "newest") a.sort(function (x, y) { return x.posted - y.posted; });
    else if (mode === "salary-desc") a.sort(function (x, y) { return y.salaryMax - x.salaryMax; });
    else if (mode === "salary-asc") a.sort(function (x, y) { return x.salaryMin - y.salaryMin; });
    return a;
  }

  function bookmarkIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  function cardHTML(job) {
    var isSaved = !!saved[job.id];
    var isNew = job.posted <= 1;
    var badges = "";
    if (isNew) badges += '<span class="badge badge--new">New</span>';
    if (job.remote) badges += '<span class="badge badge--remote">Remote</span>';

    var tags = job.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");

    return (
      '<li class="jobcard">' +
        '<div class="logo" style="background:' + job.color + '">' + job.logo + "</div>" +
        '<div class="jobcard__body">' +
          '<div class="jobcard__top">' +
            '<h3 class="jobcard__title">' + job.title + "</h3>" + badges +
          "</div>" +
          '<p class="jobcard__company"><b>' + job.company + "</b> · " + job.location + "</p>" +
          '<div class="jobcard__meta">' +
            '<span class="metachip metachip--salary">$' + job.salaryMin + "k–$" + job.salaryMax + "k</span>" +
            '<span class="metachip">' + job.type + "</span>" +
            '<span class="metachip">' + job.level + "</span>" +
            '<span class="metachip">' + (job.remote ? "Remote / " : "") + job.location + "</span>" +
          "</div>" +
          '<div class="jobcard__tags">' + tags + "</div>" +
        "</div>" +
        '<div class="jobcard__side">' +
          '<button class="save' + (isSaved ? " is-saved" : "") + '" type="button" data-id="' + job.id +
            '" aria-pressed="' + isSaved + '" aria-label="' + (isSaved ? "Remove bookmark" : "Save job") + '">' +
            bookmarkIcon() +
          "</button>" +
          '<span class="jobcard__posted">' + postedLabel(job.posted) + "</span>" +
        "</div>" +
      "</li>"
    );
  }

  function render() {
    var f = getFilters();
    var filtered = JOBS.filter(function (j) { return matches(j, f); });
    var sorted = sortJobs(filtered, sortSelect.value);
    var total = sorted.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > pages) currentPage = pages;

    countEl.innerHTML = total === 0
      ? "No jobs found"
      : "<strong>" + total + "</strong> job" + (total === 1 ? "" : "s") + " found";

    if (total === 0) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      pagerEl.innerHTML = "";
      return;
    }
    emptyEl.hidden = true;

    var start = (currentPage - 1) * PAGE_SIZE;
    var slice = sorted.slice(start, start + PAGE_SIZE);
    listEl.innerHTML = slice.map(cardHTML).join("");

    renderPager(pages);
  }

  function renderPager(pages) {
    if (pages <= 1) { pagerEl.innerHTML = ""; return; }
    var html = "";
    html += '<button type="button" data-page="' + (currentPage - 1) + '"' + (currentPage === 1 ? " disabled" : "") + ' aria-label="Previous page">‹</button>';
    for (var p = 1; p <= pages; p++) {
      html += '<button type="button" data-page="' + p + '" class="' + (p === currentPage ? "is-active" : "") +
        '"' + (p === currentPage ? ' aria-current="page"' : "") + ">" + p + "</button>";
    }
    html += '<button type="button" data-page="' + (currentPage + 1) + '"' + (currentPage === pages ? " disabled" : "") + ' aria-label="Next page">›</button>';
    pagerEl.innerHTML = html;
  }

  // ---- events ----
  function resetToFirstAndRender() { currentPage = 1; render(); }

  form.addEventListener("change", resetToFirstAndRender);

  salaryRange.addEventListener("input", function () {
    var v = parseInt(salaryRange.value, 10);
    salaryOut.textContent = v <= 40 ? "Any salary" : "$" + v + "k+";
  });

  var searchTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(resetToFirstAndRender, 180);
  });
  $("#searchBtn").addEventListener("click", resetToFirstAndRender);
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); resetToFirstAndRender(); }
  });

  sortSelect.addEventListener("change", function () {
    currentPage = 1;
    render();
    toast("Sorted by " + sortSelect.options[sortSelect.selectedIndex].text.toLowerCase());
  });

  function clearAll() {
    form.reset();
    searchInput.value = "";
    salaryOut.textContent = "Any salary";
    sortSelect.value = "relevance";
    currentPage = 1;
    render();
  }
  $("#clearFilters").addEventListener("click", function () { clearAll(); toast("Filters cleared"); });
  $("#emptyReset").addEventListener("click", function () { clearAll(); });

  // save toggle (event delegation)
  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".save");
    if (!btn) return;
    var id = parseInt(btn.getAttribute("data-id"), 10);
    var job = JOBS.filter(function (j) { return j.id === id; })[0];
    if (saved[id]) {
      delete saved[id];
      btn.classList.remove("is-saved");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Save job");
      toast("Removed from saved jobs");
    } else {
      saved[id] = true;
      btn.classList.add("is-saved");
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "Remove bookmark");
      toast("Saved: " + (job ? job.title : "job"));
    }
  });

  // pagination (event delegation)
  pagerEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    var p = parseInt(btn.getAttribute("data-page"), 10);
    if (p >= 1) {
      currentPage = p;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  render();
})();
