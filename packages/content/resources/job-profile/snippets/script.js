(function () {
  "use strict";

  /* ---------------- State ---------------- */
  var state = {
    name: "Mara Velez",
    title: "Senior Product Designer",
    location: "Lisbon, Portugal",
    email: "mara.velez@inboxly.io",
    summary:
      "Product designer with 8 years shaping fintech and marketplace experiences. I turn fuzzy problems into shippable, measurable interfaces — and bring engineers and PMs along for the ride.",
    visible: true,
    experience: [
      {
        id: uid(),
        role: "Senior Product Designer",
        org: "Northwind Pay",
        start: "2021",
        end: "Present",
        desc: "Lead designer for the merchant dashboard. Cut onboarding drop-off 34% with a redesigned KYC flow.",
      },
      {
        id: uid(),
        role: "Product Designer",
        org: "Marketplace Labs",
        start: "2018",
        end: "2021",
        desc: "Owned the seller experience across web and mobile. Built the first shared component library.",
      },
    ],
    education: [
      {
        id: uid(),
        role: "BFA, Interaction Design",
        org: "Lisbon School of Design",
        start: "2012",
        end: "2016",
        desc: "Graduated with honors. Thesis on accessible color systems.",
      },
    ],
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "HTML/CSS", "Accessibility"],
    links: [
      { id: uid(), label: "Portfolio", url: "maravelez.design" },
      { id: uid(), label: "LinkedIn", url: "linkedin.com/in/maravelez" },
    ],
  };

  var LIST_FIELDS = {
    experience: [
      { key: "role", label: "Role / title", placeholder: "Senior Product Designer" },
      { key: "org", label: "Company", placeholder: "Northwind Pay" },
      { key: "start", label: "Start", placeholder: "2021", half: true },
      { key: "end", label: "End", placeholder: "Present", half: true },
      { key: "desc", label: "Highlights", placeholder: "What you achieved…", area: true, full: true },
    ],
    education: [
      { key: "role", label: "Degree / program", placeholder: "BFA, Interaction Design" },
      { key: "org", label: "School", placeholder: "Lisbon School of Design" },
      { key: "start", label: "Start", placeholder: "2012", half: true },
      { key: "end", label: "End", placeholder: "2016", half: true },
      { key: "desc", label: "Notes", placeholder: "Honors, thesis…", area: true, full: true },
    ],
    links: [
      { key: "label", label: "Label", placeholder: "Portfolio", half: true },
      { key: "url", label: "URL", placeholder: "maravelez.design", half: true },
    ],
  };

  function uid() {
    return "x" + Math.random().toString(36).slice(2, 9);
  }

  /* ---------------- Toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------- Basics binding ---------------- */
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    el.addEventListener("input", function () {
      state[el.getAttribute("data-bind")] = el.value;
      renderPreview();
      renderMeter();
    });
  });

  /* ---------------- Entry editors ---------------- */
  function renderList(type) {
    var wrap = document.querySelector('[data-list="' + type + '"]');
    var fields = LIST_FIELDS[type];
    var items = state[type];
    wrap.innerHTML = "";

    items.forEach(function (item, idx) {
      var entry = document.createElement("div");
      entry.className = "entry";
      entry.setAttribute("draggable", "true");
      entry.dataset.id = item.id;

      var gridHtml = fields
        .map(function (f) {
          var cls = "field" + (f.full ? " full" : "");
          var control = f.area
            ? '<textarea rows="2" data-key="' + f.key + '" placeholder="' + f.placeholder + '"></textarea>'
            : '<input type="text" data-key="' + f.key + '" placeholder="' + f.placeholder + '" />';
          return '<label class="' + cls + '"><span>' + f.label + "</span>" + control + "</label>";
        })
        .join("");

      entry.innerHTML =
        '<div class="entry-head">' +
        '<button type="button" class="entry-drag" title="Drag to reorder" aria-hidden="true">⠿</button>' +
        '<span class="entry-label">' + labelFor(type) + " " + (idx + 1) + "</span>" +
        '<div class="entry-move">' +
        '<button type="button" class="icon-btn" data-move="up" title="Move up"' + (idx === 0 ? " disabled" : "") + ">↑</button>" +
        '<button type="button" class="icon-btn" data-move="down" title="Move down"' + (idx === items.length - 1 ? " disabled" : "") + ">↓</button>" +
        '<button type="button" class="icon-btn danger" data-remove title="Remove">✕</button>' +
        "</div></div>" +
        '<div class="entry-grid">' + gridHtml + "</div>";

      // populate values
      entry.querySelectorAll("[data-key]").forEach(function (ctrl) {
        ctrl.value = item[ctrl.getAttribute("data-key")] || "";
        ctrl.addEventListener("input", function () {
          item[ctrl.getAttribute("data-key")] = ctrl.value;
          renderPreview();
          renderMeter();
        });
      });

      // move / remove
      entry.querySelector('[data-move="up"]').addEventListener("click", function () {
        move(type, idx, -1);
      });
      entry.querySelector('[data-move="down"]').addEventListener("click", function () {
        move(type, idx, 1);
      });
      entry.querySelector("[data-remove]").addEventListener("click", function () {
        state[type].splice(idx, 1);
        renderList(type);
        renderPreview();
        renderMeter();
        toast(labelFor(type) + " removed");
      });

      attachDrag(entry, type);
      wrap.appendChild(entry);
    });

    var countEl = document.querySelector('[data-count="' + type + '"]');
    if (countEl) countEl.textContent = items.length;
  }

  function labelFor(type) {
    return { experience: "Experience", education: "Education", links: "Link" }[type];
  }

  function move(type, idx, dir) {
    var arr = state[type];
    var t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    var tmp = arr[idx];
    arr[idx] = arr[t];
    arr[t] = tmp;
    renderList(type);
    renderPreview();
  }

  /* ---------------- Drag & drop reorder ---------------- */
  var dragId = null;
  var dragType = null;
  function attachDrag(entry, type) {
    entry.addEventListener("dragstart", function () {
      dragId = entry.dataset.id;
      dragType = type;
      entry.classList.add("dragging");
    });
    entry.addEventListener("dragend", function () {
      entry.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach(function (e) {
        e.classList.remove("drag-over");
      });
      dragId = null;
      dragType = null;
    });
    entry.addEventListener("dragover", function (e) {
      if (dragType !== type) return;
      e.preventDefault();
      entry.classList.add("drag-over");
    });
    entry.addEventListener("dragleave", function () {
      entry.classList.remove("drag-over");
    });
    entry.addEventListener("drop", function (e) {
      if (dragType !== type) return;
      e.preventDefault();
      entry.classList.remove("drag-over");
      var arr = state[type];
      var from = arr.findIndex(function (i) { return i.id === dragId; });
      var to = arr.findIndex(function (i) { return i.id === entry.dataset.id; });
      if (from < 0 || to < 0 || from === to) return;
      var moved = arr.splice(from, 1)[0];
      arr.splice(to, 0, moved);
      renderList(type);
      renderPreview();
      toast("Reordered");
    });
  }

  /* ---------------- Add entry buttons ---------------- */
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-add");
      var blank = { id: uid() };
      LIST_FIELDS[type].forEach(function (f) {
        blank[f.key] = "";
      });
      state[type].push(blank);
      renderList(type);
      renderPreview();
      renderMeter();
      // focus first input of new entry
      var entries = document.querySelector('[data-list="' + type + '"]').children;
      var last = entries[entries.length - 1];
      if (last) last.querySelector("input,textarea").focus();
    });
  });

  /* ---------------- Skills ---------------- */
  var skillEntry = document.getElementById("skillEntry");
  function addSkill() {
    var v = skillEntry.value.trim();
    if (!v) return;
    if (state.skills.some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) {
      toast("Already added");
      skillEntry.value = "";
      return;
    }
    state.skills.push(v);
    skillEntry.value = "";
    renderSkills();
    renderPreview();
    renderMeter();
  }
  document.getElementById("skillAdd").addEventListener("click", addSkill);
  skillEntry.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  });

  function renderSkills() {
    var wrap = document.getElementById("skillChips");
    wrap.innerHTML = "";
    state.skills.forEach(function (s, i) {
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = esc(s) + '<button type="button" aria-label="Remove ' + esc(s) + '">×</button>';
      chip.querySelector("button").addEventListener("click", function () {
        state.skills.splice(i, 1);
        renderSkills();
        renderPreview();
        renderMeter();
      });
      wrap.appendChild(chip);
    });
  }

  /* ---------------- Preview ---------------- */
  function initials(name) {
    return (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("") || "?";
  }

  function renderPreview() {
    document.getElementById("rName").textContent = state.name || "Your name";
    document.getElementById("rTitle").textContent = state.title || "Your headline";
    document.getElementById("rLocation").textContent = state.location || "Location";
    var emailEl = document.getElementById("rEmail");
    emailEl.textContent = state.email || "email@example.com";
    document.getElementById("rAvatar").textContent = initials(state.name);
    document.getElementById("rSummary").textContent = state.summary || "";

    // experience
    var exp = document.getElementById("rExp");
    exp.innerHTML = state.experience
      .filter(function (e) { return e.role || e.org; })
      .map(itemHtml)
      .join("");
    toggleBlock("rExpBlock", exp.innerHTML);

    var edu = document.getElementById("rEdu");
    edu.innerHTML = state.education
      .filter(function (e) { return e.role || e.org; })
      .map(itemHtml)
      .join("");
    toggleBlock("rEduBlock", edu.innerHTML);

    var sk = document.getElementById("rSkills");
    sk.innerHTML = state.skills.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
    toggleBlock("rSkillBlock", sk.innerHTML);

    var ln = document.getElementById("rLinks");
    ln.innerHTML = state.links
      .filter(function (l) { return l.label || l.url; })
      .map(function (l) {
        return '<a href="#" title="' + esc(l.url) + '">' + esc(l.label || l.url) + "</a>";
      })
      .join("");
    toggleBlock("rLinkBlock", ln.innerHTML);
  }

  function itemHtml(e) {
    var dates = [e.start, e.end].filter(Boolean).join(" – ");
    return (
      '<div class="r-item">' +
      '<div class="r-item-top">' +
      '<span class="r-role">' + esc(e.role || "Untitled") + "</span>" +
      (dates ? '<span class="r-dates">' + esc(dates) + "</span>" : "") +
      "</div>" +
      (e.org ? '<div class="r-org">' + esc(e.org) + "</div>" : "") +
      (e.desc ? '<p class="r-desc">' + esc(e.desc) + "</p>" : "") +
      "</div>"
    );
  }

  function toggleBlock(id, html) {
    document.getElementById(id).classList.toggle("empty", !html.trim());
  }

  /* ---------------- Completeness meter ---------------- */
  var CHECKS = [
    { label: "Headline", ok: function () { return !!state.title.trim(); } },
    { label: "Summary", ok: function () { return state.summary.trim().length >= 40; } },
    { label: "Experience", ok: function () { return state.experience.some(function (e) { return e.role && e.org; }); } },
    { label: "Education", ok: function () { return state.education.some(function (e) { return e.role; }); } },
    { label: "5+ skills", ok: function () { return state.skills.length >= 5; } },
    { label: "Links", ok: function () { return state.links.some(function (l) { return l.url; }); } },
  ];

  function renderMeter() {
    var done = CHECKS.filter(function (c) { return c.ok(); }).length;
    var pct = Math.round((done / CHECKS.length) * 100);
    document.getElementById("meterPct").textContent = pct + "%";
    document.getElementById("meterFill").style.width = pct + "%";
    var wrap = document.getElementById("meterBarWrap");
    wrap.setAttribute("aria-valuenow", String(pct));

    var hint = document.getElementById("meterHint");
    if (pct === 100) hint.textContent = "Looking sharp — your profile is recruiter-ready.";
    else hint.textContent = "A complete profile gets 3× more recruiter views.";

    var ul = document.getElementById("meterChecks");
    ul.innerHTML = CHECKS.map(function (c) {
      return '<li class="' + (c.ok() ? "done" : "") + '">' + c.label + "</li>";
    }).join("");
  }

  /* ---------------- Visibility ---------------- */
  var visToggle = document.getElementById("visibilityToggle");
  visToggle.addEventListener("change", function () {
    state.visible = visToggle.checked;
    var label = document.getElementById("visState");
    var resume = document.getElementById("resume");
    var status = document.getElementById("previewVis");
    if (state.visible) {
      label.textContent = "Visible to recruiters";
      resume.classList.remove("is-hidden");
      status.textContent = "● Visible";
      status.classList.remove("hidden");
      toast("Profile is now visible to recruiters");
    } else {
      label.textContent = "Hidden from recruiters";
      resume.classList.add("is-hidden");
      status.textContent = "● Hidden";
      status.classList.add("hidden");
      toast("Profile hidden — recruiters can't find you");
    }
  });

  /* ---------------- Download ---------------- */
  document.getElementById("downloadBtn").addEventListener("click", function () {
    var lines = [];
    lines.push(state.name);
    lines.push(state.title);
    lines.push([state.location, state.email].filter(Boolean).join(" · "));
    lines.push("");
    if (state.summary) { lines.push(state.summary, ""); }

    function block(heading, arr) {
      var rows = arr.filter(function (e) { return e.role || e.org; });
      if (!rows.length) return;
      lines.push("== " + heading.toUpperCase() + " ==");
      rows.forEach(function (e) {
        var dates = [e.start, e.end].filter(Boolean).join(" - ");
        lines.push((e.role || "") + (e.org ? " · " + e.org : "") + (dates ? "  (" + dates + ")" : ""));
        if (e.desc) lines.push("  " + e.desc);
      });
      lines.push("");
    }
    block("Experience", state.experience);
    block("Education", state.education);
    if (state.skills.length) { lines.push("== SKILLS ==", state.skills.join(", "), ""); }
    var links = state.links.filter(function (l) { return l.url; });
    if (links.length) {
      lines.push("== LINKS ==");
      links.forEach(function (l) { lines.push((l.label ? l.label + ": " : "") + l.url); });
    }

    var blob = new Blob([lines.join("\n")], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (state.name || "resume").toLowerCase().replace(/\s+/g, "-") + "-resume.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("Resume downloaded");
  });

  /* ---------------- Init ---------------- */
  renderList("experience");
  renderList("education");
  renderList("links");
  renderSkills();
  renderPreview();
  renderMeter();
})();
