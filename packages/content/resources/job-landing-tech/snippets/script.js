(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Role data ---------- */
  var ROLES = [
    { title: "Staff Platform Engineer", company: "Nimbus", stage: "Series B", logo: "◈", lg: "linear-gradient(135deg,#22d3ee,#3b82f6)", salary: "$185k – $230k", remote: true, fresh: true, cats: ["Backend", "Remote"], tags: ["Rust", "Kubernetes", "Go"] },
    { title: "Senior Frontend Engineer", company: "Forge", stage: "Series A", logo: "⬡", lg: "linear-gradient(135deg,#818cf8,#c084fc)", salary: "$155k – $190k", remote: true, fresh: true, cats: ["Frontend", "Remote"], tags: ["React", "TypeScript", "GraphQL"] },
    { title: "ML Research Engineer", company: "Quanta", stage: "Seed", logo: "⟁", lg: "linear-gradient(135deg,#34d399,#22d3ee)", salary: "$170k – $215k", remote: false, fresh: false, cats: ["AI/ML"], tags: ["PyTorch", "Python", "CUDA"] },
    { title: "Backend Engineer, Payments", company: "Loopback", stage: "Series B", logo: "◍", lg: "linear-gradient(135deg,#fbbf24,#f87171)", salary: "$150k – $185k", remote: true, fresh: false, cats: ["Backend", "Remote"], tags: ["Go", "PostgreSQL", "gRPC"] },
    { title: "Full-Stack Engineer", company: "Vectra", stage: "Series A", logo: "⌬", lg: "linear-gradient(135deg,#38bdf8,#818cf8)", salary: "$140k – $175k", remote: true, fresh: true, cats: ["Frontend", "Backend", "Remote"], tags: ["Node.js", "React", "AWS"] },
    { title: "Infrastructure Engineer", company: "Cobalt", stage: "Series C", logo: "✦", lg: "linear-gradient(135deg,#a78bfa,#22d3ee)", salary: "$165k – $200k", remote: false, fresh: false, cats: ["Backend"], tags: ["Terraform", "Kubernetes", "Go"] },
    { title: "Applied AI Engineer", company: "Relay", stage: "Series A", logo: "⊟", lg: "linear-gradient(135deg,#f472b6,#818cf8)", salary: "$160k – $205k", remote: true, fresh: true, cats: ["AI/ML", "Remote"], tags: ["Python", "PyTorch", "LLMs"] },
    { title: "Senior iOS Engineer", company: "Drift", stage: "Series B", logo: "◐", lg: "linear-gradient(135deg,#fbbf24,#34d399)", salary: "$158k – $195k", remote: false, fresh: false, cats: ["Frontend"], tags: ["Swift", "SwiftUI", "Combine"] }
  ];

  var saved = {};

  function roleCard(r, i) {
    var el = document.createElement("article");
    el.className = "role reveal";
    el.style.setProperty("--lg", r.lg);
    el.dataset.cats = r.cats.join(",");
    el.dataset.idx = i;

    var tagHtml = "";
    if (r.remote) tagHtml += '<span class="tag remote">⬡ Remote</span>';
    if (r.fresh) tagHtml += '<span class="tag new">✦ New</span>';
    r.tags.forEach(function (t) { tagHtml += '<span class="tag">' + t + "</span>"; });

    el.innerHTML =
      '<div class="role-top">' +
        '<span class="role-logo" style="background:' + r.lg + '">' + r.logo + "</span>" +
        '<div class="role-head">' +
          '<div class="role-title">' + r.title + "</div>" +
          '<div class="role-company">' + r.company + ' · <span class="stage">' + r.stage + "</span></div>" +
        "</div>" +
        '<button class="save" aria-label="Save ' + r.title + '" aria-pressed="false">♥</button>' +
      "</div>" +
      '<div class="role-tags">' + tagHtml + "</div>" +
      '<div class="role-foot">' +
        '<div class="role-salary">' + r.salary + ' <span>/ yr</span></div>' +
        '<button class="role-apply">Apply →</button>' +
      "</div>";

    el.querySelector(".save").addEventListener("click", function () {
      saved[i] = !saved[i];
      this.classList.toggle("saved", saved[i]);
      this.setAttribute("aria-pressed", saved[i] ? "true" : "false");
      toast(saved[i] ? "Saved <b>" + r.title + "</b>" : "Removed from saved");
    });
    el.querySelector(".role-apply").addEventListener("click", function () {
      toast("Intro sent to <b>" + r.company + "</b> — good luck!");
    });
    return el;
  }

  var roleList = document.getElementById("roleList");
  var emptyState = document.getElementById("emptyState");
  ROLES.forEach(function (r, i) { roleList.appendChild(roleCard(r, i)); });

  /* ---------- Filters ---------- */
  var filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".fbtn");
      if (!btn) return;
      filters.querySelectorAll(".fbtn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var f = btn.dataset.filter;
      var shown = 0;
      roleList.querySelectorAll(".role").forEach(function (card) {
        var ok = f === "all" || card.dataset.cats.split(",").indexOf(f) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      emptyState.hidden = shown !== 0;
    });
  }

  /* ---------- Search + quick tags ---------- */
  var searchForm = document.getElementById("searchForm");
  var searchInput = document.getElementById("searchInput");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (searchInput.value || "").trim();
      if (!q) { toast("Type a role, stack, or keyword"); return; }
      toast("Searching <b>" + q + "</b> across 1,284 roles…");
      document.getElementById("roles").scrollIntoView({ behavior: "smooth" });
    });
  }
  var quickTags = document.getElementById("quickTags");
  if (quickTags) {
    quickTags.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      c.classList.toggle("on");
      searchInput.value = c.dataset.tag;
      toast("Filter: <b>" + c.dataset.tag + "</b>");
    });
  }

  /* ---------- Salary slider ---------- */
  var levels = [
    { name: "Junior", range: "$95k – $125k", base: "$110k", eq: "0.08%", bonus: "5%", w: [38, 18, 14] },
    { name: "Mid", range: "$130k – $160k", base: "$145k", eq: "0.18%", bonus: "8%", w: [55, 28, 20] },
    { name: "Senior", range: "$165k – $205k", base: "$185k", eq: "0.35%", bonus: "12%", w: [72, 46, 30] },
    { name: "Staff", range: "$200k – $250k", base: "$225k", eq: "0.55%", bonus: "16%", w: [86, 64, 40] },
    { name: "Principal", range: "$235k – $310k", base: "$272k", eq: "0.85%", bonus: "20%", w: [98, 82, 52] }
  ];
  var range = document.getElementById("salaryRange");
  function paintSalary() {
    var L = levels[+range.value];
    document.getElementById("scLevel").textContent = L.name;
    document.getElementById("scRange").textContent = L.range;
    document.getElementById("scBase").textContent = L.base;
    document.getElementById("scEq").textContent = L.eq;
    document.getElementById("scBonus").textContent = L.bonus;
    var bars = document.querySelectorAll("#scBars .bar i");
    bars[0].style.setProperty("--w", L.w[0] + "%");
    bars[1].style.setProperty("--w", L.w[1] + "%");
    bars[2].style.setProperty("--w", L.w[2] + "%");
  }
  if (range) { range.addEventListener("input", paintSalary); paintSalary(); }

  /* ---------- Stack picker ---------- */
  var stackCloud = document.getElementById("stackCloud");
  var stackSummary = document.getElementById("stackSummary");
  function updateStacks() {
    var on = stackCloud.querySelectorAll(".stack.on");
    var total = 0, names = [];
    on.forEach(function (s) { total += +s.dataset.c; names.push(s.textContent.trim()); });
    if (on.length === 0) {
      stackSummary.innerHTML = "Select stacks to preview <strong>0</strong> matching roles.";
    } else {
      stackSummary.innerHTML = names.join(" + ") + " → <strong>" + total + "</strong> matching roles.";
    }
  }
  if (stackCloud) {
    stackCloud.addEventListener("click", function (e) {
      var s = e.target.closest(".stack");
      if (!s) return;
      s.classList.toggle("on");
      updateStacks();
    });
  }
  var clearStacks = document.getElementById("clearStacks");
  if (clearStacks) {
    clearStacks.addEventListener("click", function () {
      stackCloud.querySelectorAll(".stack.on").forEach(function (s) { s.classList.remove("on"); });
      updateStacks();
      toast("Stack filters cleared");
    });
  }

  /* ---------- CTA form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("ctaEmail").value.trim();
      if (!v) return;
      toast("Welcome aboard — check <b>" + v + "</b> to post your role");
      ctaForm.reset();
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        mobileNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    var target = +el.dataset.count;
    var suffix = el.dataset.suffix || "";
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        if (en.target.querySelector && en.target.classList.contains("hero-stats")) {
          en.target.querySelectorAll("strong[data-count]").forEach(countUp);
        }
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
