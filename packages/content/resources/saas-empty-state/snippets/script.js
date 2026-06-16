(function () {
  "use strict";

  var STATES = ["no-projects", "no-results", "no-data", "error", "populated"];
  var panels = {};
  document.querySelectorAll("[data-panel]").forEach(function (el) {
    panels[el.getAttribute("data-panel")] = el;
  });
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var stage = document.getElementById("stage");

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });

  /* ---------- Show a panel ---------- */
  function show(name) {
    Object.keys(panels).forEach(function (k) {
      panels[k].hidden = k !== name;
    });
    // sync chips only for the canonical states
    chips.forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-state") === name);
    });
    // reset transient form on leaving no-projects
    if (name !== "no-projects") closeForm();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      show(chip.getAttribute("data-state"));
    });
  });

  /* ---------- Cycle button ---------- */
  document.getElementById("cycleBtn").addEventListener("click", function () {
    var active = chips.find(function (c) { return c.classList.contains("is-active"); });
    var idx = active ? STATES.indexOf(active.getAttribute("data-state")) : -1;
    show(STATES[(idx + 1) % STATES.length]);
  });

  /* ---------- Inline create form ---------- */
  var createBtn = document.getElementById("createBtn");
  var createForm = document.getElementById("createForm");
  var nameInput = document.getElementById("projName");
  var chosenColor = "#6366f1";

  function openForm() {
    createForm.hidden = false;
    createBtn.setAttribute("aria-expanded", "true");
    nameInput.value = "";
    nameInput.focus();
  }
  function closeForm() {
    if (createForm) createForm.hidden = true;
    if (createBtn) createBtn.setAttribute("aria-expanded", "false");
  }
  createBtn.addEventListener("click", openForm);
  document.getElementById("cancelCreate").addEventListener("click", closeForm);

  // color swatches
  document.querySelectorAll(".swatch").forEach(function (sw) {
    sw.addEventListener("click", function () {
      document.querySelectorAll(".swatch").forEach(function (s) {
        s.classList.remove("is-active");
        s.setAttribute("aria-checked", "false");
      });
      sw.classList.add("is-active");
      sw.setAttribute("aria-checked", "true");
      chosenColor = sw.getAttribute("data-color");
    });
  });

  /* ---------- Project store + rendering ---------- */
  function initial(name) {
    var p = name.trim().split(/\s+/);
    return ((p[0][0] || "") + (p[1] ? p[1][0] : "")).toUpperCase();
  }

  var projects = [
    { name: "Q3 Launch", color: "#6366f1", tasks: "18 tasks", progress: 64, updated: "2h ago", team: ["AM", "TR", "JK"] },
    { name: "Brand Refresh", color: "#16a34a", tasks: "9 tasks", progress: 38, updated: "yesterday", team: ["LN", "PS"] },
    { name: "Mobile Beta", color: "#d97706", tasks: "27 tasks", progress: 82, updated: "3d ago", team: ["RK", "DV", "MC"] }
  ];
  var grid = document.getElementById("projGrid");
  var countEl = document.getElementById("projCount");

  function renderProjects() {
    grid.innerHTML = "";
    projects.forEach(function (p, i) {
      var card = document.createElement("article");
      card.className = "proj";
      card.style.animationDelay = (i * 0.05) + "s";
      var avatars = p.team.map(function (t, j) {
        var hues = ["#6366f1", "#0ea5e9", "#16a34a", "#d97706"];
        return '<span style="background:' + hues[j % hues.length] + '">' + t + "</span>";
      }).join("");
      card.innerHTML =
        '<div class="proj__top">' +
          '<span class="proj__dot" style="background:' + p.color + '">' + initial(p.name) + "</span>" +
          '<div><div class="proj__name">' + escapeHtml(p.name) + "</div>" +
          '<div class="proj__meta">' + p.tasks + " · updated " + p.updated + "</div></div>" +
        "</div>" +
        '<div class="proj__bar"><i style="width:' + p.progress + "%;background:" + p.color + '"></i></div>' +
        '<div class="proj__foot">' +
          '<div class="proj__avatars">' + avatars + "</div>" +
          "<span>" + p.progress + "% done</span>" +
        "</div>";
      grid.appendChild(card);
    });
    countEl.textContent = String(projects.length);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  createForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    projects.unshift({
      name: name, color: chosenColor, tasks: "0 tasks",
      progress: 0, updated: "just now", team: ["YOU"]
    });
    renderProjects();
    closeForm();
    show("populated");
    toast("Project “" + name + "” created.");
  });

  /* ---------- No results: clear search ---------- */
  document.getElementById("clearSearch").addEventListener("click", function () {
    show("populated");
    toast("Search cleared.");
  });

  /* ---------- No data: connect ---------- */
  document.getElementById("connectBtn").addEventListener("click", function () {
    show("loading");
    setTimeout(function () {
      renderProjects();
      show("populated");
      toast("Source connected — data synced.");
    }, 1300);
  });

  /* ---------- Error: retry → loading → populated ---------- */
  document.getElementById("retryBtn").addEventListener("click", function () {
    show("loading");
    setTimeout(function () {
      renderProjects();
      show("populated");
      toast("Loaded successfully.");
    }, 1300);
  });

  /* ---------- Init ---------- */
  renderProjects();
  show("no-projects");
})();
