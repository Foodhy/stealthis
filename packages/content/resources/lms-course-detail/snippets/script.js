(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- data ---------- */
  var MODULES = [
    {
      title: "Foundations of Calm",
      sub: "Why restraint beats more features",
      lessons: [
        { name: "Welcome & how this course works", dur: "4:12", free: true, done: true },
        { name: "The attention budget", dur: "11:38", done: true },
        { name: "Loud, quiet, and invisible", dur: "9:05", done: true },
        { name: "Reading a noisy interface", dur: "13:20" }
      ]
    },
    {
      title: "Visual Hierarchy",
      sub: "Guiding the eye on purpose",
      lessons: [
        { name: "Contrast as a tool, not a default", dur: "10:44", done: true },
        { name: "Building a type scale", dur: "15:02" },
        { name: "Weight, size, and position", dur: "12:18" },
        { name: "Workshop: redesign a dashboard header", dur: "18:50" }
      ]
    },
    {
      title: "Spacing & Rhythm",
      sub: "Space is a feature",
      lessons: [
        { name: "The 4-point grid in practice", dur: "9:33", done: true },
        { name: "Vertical rhythm & density", dur: "11:27" },
        { name: "Grouping with whitespace", dur: "8:14" }
      ]
    },
    {
      title: "Color & Restraint",
      sub: "Fewer colors, more meaning",
      lessons: [
        { name: "Choosing a calm palette", dur: "12:55", done: true },
        { name: "Semantic color systems", dur: "14:09" },
        { name: "Accessible contrast without harshness", dur: "10:41" },
        { name: "Designing a study (dark) mode", dur: "16:22", free: true }
      ]
    },
    {
      title: "States People Trust",
      sub: "Empty, loading, error, success",
      lessons: [
        { name: "Progress that feels honest", dur: "13:48", done: true },
        { name: "Empty states that teach", dur: "9:51" },
        { name: "Graceful error recovery", dur: "12:07" },
        { name: "Skeletons vs spinners", dur: "7:39" }
      ]
    },
    {
      title: "Components & Systems",
      sub: "From principle to reusable parts",
      lessons: [
        { name: "Tokenizing calm decisions", dur: "15:14" },
        { name: "Documenting intent, not just code", dur: "11:02" },
        { name: "Auditing a component for noise", dur: "13:36" }
      ]
    },
    {
      title: "The Restraint Audit",
      sub: "Removing before adding",
      lessons: [
        { name: "Running a subtraction pass", dur: "12:48" },
        { name: "Defending a deletion", dur: "9:17" },
        { name: "Workshop: cut 30% of a screen", dur: "21:05" }
      ]
    },
    {
      title: "Capstone Case Study",
      sub: "Build your portfolio piece",
      lessons: [
        { name: "Choosing your screen", dur: "6:44" },
        { name: "Critique & iteration", dur: "17:29" },
        { name: "Writing the case study", dur: "14:50" },
        { name: "Final review & certificate", dur: "8:33", free: true }
      ]
    }
  ];

  var REVIEWS = [
    { name: "Marcus Bell", initials: "MB", stars: 5, when: "2 weeks ago", text: "The restraint audit alone paid for the course. I cut a settings screen in half and stakeholders loved it. Elena's critiques are direct and genuinely useful." },
    { name: "Aisha Khan", initials: "AK", stars: 5, when: "1 month ago", text: "Finally a course about decisions, not just tools. The module on honest progress states changed how I think about loading screens." },
    { name: "Tomás Rivera", initials: "TR", stars: 4, when: "1 month ago", text: "Strong material and great pacing. I'd have liked one more Figma walkthrough, but the principles transfer to any tool I use." },
    { name: "Hana Okafor", initials: "HO", stars: 5, when: "2 months ago", text: "My capstone case study landed me two interviews. The structure for writing rationale is something I now use at work every week." }
  ];

  var RATING_DIST = [
    { stars: 5, pct: 74 },
    { stars: 4, pct: 19 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 }
  ];

  var TOTAL_LESSONS = MODULES.reduce(function (n, m) { return n + m.lessons.length; }, 0);

  function starString(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- render syllabus ---------- */
  var syllabus = document.getElementById("syllabus");
  MODULES.forEach(function (mod, i) {
    var moduleMins = mod.lessons.reduce(function (sum, l) {
      var p = l.dur.split(":");
      return sum + parseInt(p[0], 10) + parseInt(p[1], 10) / 60;
    }, 0);

    var sec = document.createElement("section");
    sec.className = "module";
    sec.setAttribute("aria-expanded", i === 0 ? "true" : "false");

    var lessonsHtml = mod.lessons.map(function (l, j) {
      var id = "l" + i + "-" + j;
      return (
        '<li class="lesson">' +
          '<input class="lesson__check" type="checkbox" id="' + id + '"' + (l.done ? " checked" : "") +
            ' aria-label="Mark ' + esc(l.name) + ' complete">' +
          '<span class="lesson__icon" aria-hidden="true">▶</span>' +
          '<label class="lesson__name" for="' + id + '">' + esc(l.name) + "</label>" +
          (l.free ? '<span class="lesson__free">Preview</span>' : "") +
          '<span class="lesson__dur">' + l.dur + "</span>" +
        "</li>"
      );
    }).join("");

    sec.innerHTML =
      '<button class="module__head" type="button" aria-expanded="' + (i === 0 ? "true" : "false") + '">' +
        '<span class="module__chev" aria-hidden="true">▶</span>' +
        '<span class="module__title">Module ' + (i + 1) + " · " + esc(mod.title) +
          "<small>" + esc(mod.sub) + "</small></span>" +
        '<span class="module__meta">' + mod.lessons.length + " lessons · " + Math.round(moduleMins) + " min</span>" +
      "</button>" +
      '<div class="module__body"><div class="module__inner"><ul class="lessons">' + lessonsHtml + "</ul></div></div>";

    syllabus.appendChild(sec);
  });

  /* ---------- accordion ---------- */
  syllabus.addEventListener("click", function (e) {
    var head = e.target.closest(".module__head");
    if (!head) return;
    var mod = head.closest(".module");
    var open = mod.getAttribute("aria-expanded") === "true";
    mod.setAttribute("aria-expanded", String(!open));
    head.setAttribute("aria-expanded", String(!open));
  });

  /* ---------- expand / collapse all ---------- */
  var toggleAll = document.getElementById("toggleAll");
  toggleAll.addEventListener("click", function () {
    var expand = toggleAll.getAttribute("aria-expanded") !== "true";
    syllabus.querySelectorAll(".module").forEach(function (m) {
      m.setAttribute("aria-expanded", String(expand));
      m.querySelector(".module__head").setAttribute("aria-expanded", String(expand));
    });
    toggleAll.setAttribute("aria-expanded", String(expand));
    toggleAll.textContent = expand ? "Collapse all" : "Expand all";
  });

  /* ---------- progress (lesson check-offs) ---------- */
  var progFill = document.getElementById("progFill");
  var progPct = document.getElementById("progPct");
  function refreshProgress() {
    var done = syllabus.querySelectorAll(".lesson__check:checked").length;
    var pct = Math.round((done / TOTAL_LESSONS) * 100);
    progFill.style.width = pct + "%";
    progPct.textContent = pct + "%";
    var bar = progFill.parentElement;
    bar.setAttribute("aria-valuenow", String(pct));
    var label = bar.parentElement.querySelector(".small");
    if (label) label.textContent = done + " of " + TOTAL_LESSONS + " lessons complete";
  }
  syllabus.addEventListener("change", function (e) {
    if (!e.target.classList.contains("lesson__check")) return;
    refreshProgress();
    if (e.target.checked) toast("Lesson marked complete ✓");
  });
  refreshProgress();

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); next.focus(); selectTab(next); }
    });
  });

  /* ---------- render reviews ---------- */
  var reviewList = document.getElementById("reviewList");
  reviewList.innerHTML = REVIEWS.map(function (r) {
    return (
      '<li class="review">' +
        '<div class="review__head">' +
          '<span class="avatar avatar--sm" aria-hidden="true">' + esc(r.initials) + "</span>" +
          '<span class="review__name">' + esc(r.name) + "</span>" +
          '<span class="review__stars" aria-label="' + r.stars + ' out of 5">' + starString(r.stars) + "</span>" +
          '<span class="review__when">' + esc(r.when) + "</span>" +
        "</div>" +
        '<p class="review__text">' + esc(r.text) + "</p>" +
      "</li>"
    );
  }).join("");

  /* ---------- render rating bars ---------- */
  var ratingBars = document.getElementById("ratingBars");
  ratingBars.innerHTML = RATING_DIST.map(function (d) {
    return (
      '<div class="barrow">' +
        "<span>" + d.stars + " ★</span>" +
        '<span class="bar"><span class="bar__fill" style="width:0"></span></span>' +
        "<span>" + d.pct + "%</span>" +
      "</div>"
    );
  }).join("");
  // animate bars into view
  requestAnimationFrame(function () {
    var fills = ratingBars.querySelectorAll(".bar__fill");
    RATING_DIST.forEach(function (d, i) { fills[i].style.width = d.pct + "%"; });
  });

  /* ---------- enroll / wishlist / preview ---------- */
  var enrolled = false;
  function enroll() {
    enrolled = true;
    toast("You're enrolled — first lesson unlocked! 🎉");
    document.getElementById("enrollMain").textContent = "Go to course";
    document.getElementById("enrollSticky").textContent = "Continue";
  }
  document.getElementById("enrollMain").addEventListener("click", enroll);
  document.getElementById("enrollSticky").addEventListener("click", function () {
    if (enrolled) { toast("Resuming where you left off…"); selectTab(tabs[1]); }
    else enroll();
  });

  var wishBtn = document.getElementById("wishlistBtn");
  wishBtn.addEventListener("click", function () {
    var on = wishBtn.getAttribute("aria-pressed") !== "true";
    wishBtn.setAttribute("aria-pressed", String(on));
    wishBtn.innerHTML = on ? "♥ Saved" : "♡ Save for later";
    toast(on ? "Added to your saved courses" : "Removed from saved courses");
  });

  document.getElementById("previewBtn").addEventListener("click", function () {
    toast("Playing course preview · 2:14 ▶");
  });

  /* ---------- sticky enroll bar ---------- */
  var stickybar = document.getElementById("stickybar");
  var buybox = document.getElementById("buybox");
  if ("IntersectionObserver" in window && buybox) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var show = !entry.isIntersecting;
        stickybar.classList.toggle("show", show);
        stickybar.setAttribute("aria-hidden", String(!show));
      });
    }, { rootMargin: "-120px 0px 0px 0px" });
    io.observe(buybox);
  }

  /* ---------- study (dark) mode ---------- */
  var themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("study");
    themeToggle.setAttribute("aria-pressed", String(on));
    toast(on ? "Study mode on — easy on the eyes 🌙" : "Light mode on ☀");
  });

  /* ---------- countdown timer ---------- */
  var deadline = document.getElementById("deadline");
  var remaining = 2 * 3600 + 11 * 60 + 48; // 02:11:48
  function tick() {
    if (remaining <= 0) { deadline.innerHTML = "⏳ Sale ended"; return; }
    remaining--;
    var h = Math.floor(remaining / 3600);
    var m = Math.floor((remaining % 3600) / 60);
    var s = remaining % 60;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    deadline.innerHTML = "⏳ Sale ends in <b>" + pad(h) + ":" + pad(m) + ":" + pad(s) + "</b>";
  }
  setInterval(tick, 1000);
})();
