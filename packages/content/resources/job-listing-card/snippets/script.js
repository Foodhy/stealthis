// Job Board — Job Listing Card (vanilla JS, no deps)
(function () {
  "use strict";

  var JOBS = [
    {
      id: "j1", title: "Senior Frontend Engineer", company: "Lumio Health",
      logo: "LH", color: "#2563eb", location: "Berlin, DE", remote: true,
      salary: "€78k–96k", type: "Full-time", posted: "2h ago",
      skills: ["React", "TypeScript"], new: true, urgent: false, saved: false
    },
    {
      id: "j2", title: "Product Designer", company: "Fernway Studio",
      logo: "FS", color: "#7c3aed", location: "Lisbon, PT", remote: true,
      salary: "€55k–70k", type: "Full-time", posted: "5h ago",
      skills: ["Figma", "Design Systems"], new: true, urgent: false, saved: false
    },
    {
      id: "j3", title: "DevOps Engineer", company: "Northgate Cloud",
      logo: "NC", color: "#0891b2", location: "Remote · EU", remote: true,
      salary: "€85k–110k", type: "Contract", posted: "1d ago",
      skills: ["Kubernetes", "AWS"], new: false, urgent: true, saved: false
    },
    {
      id: "j4", title: "Customer Success Lead", company: "Brightloop",
      logo: "BL", color: "#d97706", location: "Madrid, ES", remote: false,
      salary: "€48k–60k", type: "Full-time", posted: "1d ago",
      skills: ["SaaS", "Onboarding"], new: false, urgent: false, saved: true
    },
    {
      id: "j5", title: "Data Analyst", company: "Quantia Labs",
      logo: "QL", color: "#16a34a", location: "Amsterdam, NL", remote: true,
      salary: "€52k–68k", type: "Full-time", posted: "2d ago",
      skills: ["SQL", "Python"], new: false, urgent: false, saved: false
    },
    {
      id: "j6", title: "Backend Engineer (Go)", company: "Orbital Pay",
      logo: "OP", color: "#dc2626", location: "Remote · Global", remote: true,
      salary: "€90k–120k", type: "Full-time", posted: "3d ago",
      skills: ["Go", "PostgreSQL"], new: false, urgent: true, saved: false
    },
    {
      id: "j7", title: "Marketing Manager", company: "Velda & Co",
      logo: "VC", color: "#db2777", location: "Paris, FR", remote: false,
      salary: "€50k–65k", type: "Full-time", posted: "4d ago",
      skills: ["Growth", "SEO"], new: false, urgent: false, saved: false
    },
    {
      id: "j8", title: "Junior QA Tester", company: "Pinecrest Apps",
      logo: "PA", color: "#0f766e", location: "Dublin, IE", remote: true,
      salary: "€34k–42k", type: "Part-time", posted: "6d ago",
      skills: ["Cypress", "Manual QA"], new: false, urgent: false, saved: false
    }
  ];

  var listEl = document.getElementById("results");
  var emptyEl = document.getElementById("empty");
  var savedNumEl = document.getElementById("savedNum");
  var resultLabel = document.getElementById("resultLabel");
  var toastEl = document.getElementById("toast");
  var qInput = document.getElementById("q");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));

  var activeFilter = "all";
  var query = "";
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function pinIcon() {
    return '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  }
  function moneyIcon() {
    return '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  }
  function clockIcon() {
    return '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  }
  function bookmarkIcon() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  }

  function cardHTML(j) {
    var badges = "";
    if (j.new) badges += '<span class="badge new">New</span>';
    if (j.urgent) badges += '<span class="badge urgent">Urgent</span>';
    if (j.remote) badges += '<span class="badge remote">Remote</span>';

    var skills = j.skills.map(function (s) {
      return '<span class="tag skill">' + esc(s) + "</span>";
    }).join("");

    return (
      '<article class="job-card' + (j.urgent ? " is-urgent" : "") + '" data-id="' + j.id + '">' +
        '<div class="logo" style="background:' + j.color + '">' + esc(j.logo) + "</div>" +
        '<div class="body">' +
          '<div class="title-row"><h2 class="job-title">' + esc(j.title) + "</h2>" + badges + "</div>" +
          '<p class="company">' + esc(j.company) +
            '<span class="dot">·</span><span class="posted">' + esc(j.posted) + "</span></p>" +
        "</div>" +
        '<div class="meta">' +
          '<span class="tag salary">' + moneyIcon() + esc(j.salary) + "</span>" +
          '<span class="tag">' + pinIcon() + esc(j.location) + "</span>" +
          '<span class="tag">' + clockIcon() + esc(j.type) + "</span>" +
          skills +
        "</div>" +
        '<div class="apply">' +
          '<button class="save-btn" data-act="save" aria-pressed="' + (j.saved ? "true" : "false") +
            '" aria-label="' + (j.saved ? "Remove bookmark" : "Save job") + '" title="Save job">' +
            bookmarkIcon() +
          "</button>" +
          '<button class="apply-btn" data-act="apply">Quick apply</button>' +
        "</div>" +
      "</article>"
    );
  }

  function matches(j) {
    if (activeFilter === "new" && !j.new) return false;
    if (activeFilter === "remote" && !j.remote) return false;
    if (activeFilter === "urgent" && !j.urgent) return false;
    if (activeFilter === "saved" && !j.saved) return false;
    if (query) {
      var hay = (j.title + " " + j.company + " " + j.location + " " + j.skills.join(" ")).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function render() {
    var visible = JOBS.filter(matches);
    listEl.innerHTML = visible.map(cardHTML).join("");
    emptyEl.hidden = visible.length !== 0;
    var n = visible.length;
    resultLabel.textContent = n + (n === 1 ? " position" : " positions") + " · updated moments ago";
    updateSavedCount();
  }

  function updateSavedCount() {
    var c = JOBS.filter(function (j) { return j.saved; }).length;
    savedNumEl.textContent = c;
  }

  // Event delegation for save / apply
  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var card = e.target.closest(".job-card");
    if (!card) return;
    var job = JOBS.find(function (j) { return j.id === card.dataset.id; });
    if (!job) return;

    if (btn.dataset.act === "save") {
      job.saved = !job.saved;
      btn.setAttribute("aria-pressed", job.saved ? "true" : "false");
      btn.setAttribute("aria-label", job.saved ? "Remove bookmark" : "Save job");
      updateSavedCount();
      toast(job.saved ? "Saved “" + job.title + "”" : "Removed from saved");
      if (activeFilter === "saved" && !job.saved) {
        setTimeout(render, 180);
      }
    } else if (btn.dataset.act === "apply") {
      if (btn.classList.contains("is-applied")) return;
      btn.classList.add("is-applied");
      btn.textContent = "Applied ✓";
      toast("Application sent to " + job.company);
    }
  });

  // Filters
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filterBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      activeFilter = b.dataset.filter;
      render();
    });
  });

  // Search (debounced)
  var searchTimer = null;
  qInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      query = qInput.value.trim().toLowerCase();
      render();
    }, 140);
  });

  // Reset link inside empty state
  document.getElementById("clearFilter").addEventListener("click", function () {
    activeFilter = "all";
    query = "";
    qInput.value = "";
    filterBtns.forEach(function (x) {
      var on = x.dataset.filter === "all";
      x.classList.toggle("is-active", on);
      x.setAttribute("aria-selected", on ? "true" : "false");
    });
    render();
  });

  render();
})();
