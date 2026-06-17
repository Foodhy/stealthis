(function () {
  "use strict";

  // ---- Icons ----
  const ICONS = {
    video:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    quiz:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12" y2="17"></line></svg>',
    reading:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    lock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
  };

  // ---- Fictional course data ----
  const MODULES = [
    {
      title: "Foundations of Calm Design",
      lessons: [
        { name: "Why interfaces feel noisy", type: "video", dur: "9:12", done: true, preview: true },
        { name: "The attention budget", type: "reading", dur: "6 min", done: true },
        { name: "Reading: signal vs. ornament", type: "reading", dur: "8 min", done: true },
        { name: "Module 1 checkpoint", type: "quiz", dur: "5 min", done: true },
      ],
    },
    {
      title: "Spacing, Rhythm & Hierarchy",
      lessons: [
        { name: "An 8-point grid that breathes", type: "video", dur: "12:40", done: true, preview: true },
        { name: "Building a type scale", type: "video", dur: "10:05", done: true },
        { name: "Whitespace as a feature", type: "reading", dur: "7 min", done: false },
        { name: "Layout teardown: Linnea Mail", type: "video", dur: "14:18", done: false },
        { name: "Hierarchy quiz", type: "quiz", dur: "6 min", done: false },
      ],
    },
    {
      title: "Color, Contrast & Mood",
      lessons: [
        { name: "Choosing a restrained palette", type: "video", dur: "11:22", done: false, preview: true },
        { name: "Contrast for accessibility (AA)", type: "reading", dur: "9 min", done: false },
        { name: "Dark mode without losing calm", type: "video", dur: "13:47", done: false },
        { name: "Color checkpoint", type: "quiz", dur: "5 min", done: false },
      ],
    },
    {
      title: "Motion & Micro-interactions",
      locked: true,
      lessons: [
        { name: "Easing curves that feel right", type: "video", dur: "10:30", done: false },
        { name: "When NOT to animate", type: "reading", dur: "6 min", done: false },
        { name: "Building a gentle toast", type: "video", dur: "12:09", done: false },
        { name: "Motion checkpoint", type: "quiz", dur: "5 min", done: false },
      ],
    },
    {
      title: "Capstone: Redesign Northwind",
      locked: true,
      lessons: [
        { name: "Briefing the capstone", type: "video", dur: "8:55", done: false },
        { name: "Critique & ship", type: "reading", dur: "10 min", done: false },
        { name: "Final review", type: "quiz", dur: "12 min", done: false },
      ],
    },
  ];

  const TYPE_LABEL = { video: "Video", quiz: "Quiz", reading: "Reading" };

  const root = document.getElementById("curriculum");
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // ---- Render ----
  function moduleStats(mod) {
    const total = mod.lessons.length;
    const done = mod.lessons.filter((l) => l.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function buildModule(mod, mi) {
    const stats = moduleStats(mod);
    const allDone = stats.done === stats.total && !mod.locked;

    const wrap = document.createElement("section");
    wrap.className = "module";
    if (mod.locked) wrap.classList.add("is-locked");
    if (allDone) wrap.classList.add("is-done");

    const bodyId = "mod-body-" + mi;

    const head = document.createElement("button");
    head.type = "button";
    head.className = "module__head";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-controls", bodyId);
    if (mod.locked) head.setAttribute("aria-disabled", "true");

    head.innerHTML =
      '<span class="module__index">' + (mod.locked ? ICONS.lock : mi + 1) + "</span>" +
      '<span class="module__title-wrap">' +
        '<h2 class="module__title">' + mod.title + "</h2>" +
        '<p class="module__meta">' +
          "<span>" + stats.total + " lessons</span>" +
          (mod.locked
            ? '<span class="lock-badge">Locked</span>'
            : '<span class="js-mod-count">' + stats.done + " / " + stats.total + " done</span>") +
        "</p>" +
      "</span>" +
      (mod.locked
        ? '<span class="lock-badge">' + ICONS.lock + "</span>"
        : '<span class="module__bar"><i class="js-mod-fill"></i></span>' +
          '<span class="module__pct js-mod-pct">' + stats.pct + "%</span>") +
      '<span class="chev">' + ICONS.chevron + "</span>";

    const body = document.createElement("div");
    body.className = "module__body";
    body.id = bodyId;
    const inner = document.createElement("div");
    const list = document.createElement("ul");
    list.className = "lessons";

    mod.lessons.forEach((lesson, li) => {
      list.appendChild(buildLesson(lesson, mod, mi, li));
    });

    inner.appendChild(list);
    body.appendChild(inner);
    wrap.appendChild(head);
    wrap.appendChild(body);

    head.addEventListener("click", () => {
      if (mod.locked) {
        toast("🔒 Finish “" + MODULES[mi - 1].title + "” to unlock this module.");
        return;
      }
      const open = wrap.classList.toggle("is-open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });

    return wrap;
  }

  function buildLesson(lesson, mod, mi, li) {
    const li_el = document.createElement("li");
    li_el.className = "lesson lesson--" + lesson.type;
    if (lesson.done) li_el.classList.add("is-done");

    if (mod.locked) {
      li_el.classList.add("lesson--locked");
      li_el.innerHTML =
        '<span class="lesson__lock">' + ICONS.lock + "</span>" +
        '<span class="lesson__icon">' + ICONS[lesson.type] + "</span>" +
        '<span class="lesson__main">' +
          '<div class="lesson__name">' + lesson.name + "</div>" +
          '<div class="lesson__sub"><span class="tag">' + TYPE_LABEL[lesson.type] + "</span></div>" +
        "</span>" +
        '<span class="lesson__dur">' + lesson.dur + "</span>";
      return li_el;
    }

    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "lesson__check";
    checkBtn.setAttribute("aria-pressed", lesson.done ? "true" : "false");
    checkBtn.setAttribute(
      "aria-label",
      (lesson.done ? "Mark incomplete: " : "Mark complete: ") + lesson.name
    );
    checkBtn.innerHTML = ICONS.check;

    const main = document.createElement("span");
    main.className = "lesson__main";
    main.innerHTML =
      '<div class="lesson__name">' + lesson.name + "</div>" +
      '<div class="lesson__sub"><span class="tag">' + TYPE_LABEL[lesson.type] + "</span></div>";

    const icon = document.createElement("span");
    icon.className = "lesson__icon";
    icon.innerHTML = ICONS[lesson.type];

    const dur = document.createElement("span");
    dur.className = "lesson__dur";
    dur.textContent = lesson.dur;

    li_el.appendChild(checkBtn);
    li_el.appendChild(icon);
    li_el.appendChild(main);

    if (lesson.preview) {
      const pv = document.createElement("button");
      pv.type = "button";
      pv.className = "preview-link";
      pv.textContent = "Preview";
      pv.addEventListener("click", (e) => {
        e.stopPropagation();
        toast("▶ Free preview: " + lesson.name);
      });
      li_el.appendChild(pv);
    }

    li_el.appendChild(dur);

    checkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      lesson.done = !lesson.done;
      li_el.classList.toggle("is-done", lesson.done);
      checkBtn.setAttribute("aria-pressed", lesson.done ? "true" : "false");
      checkBtn.setAttribute(
        "aria-label",
        (lesson.done ? "Mark incomplete: " : "Mark complete: ") + lesson.name
      );
      refresh(mi);
      toast(lesson.done ? "✓ Marked complete — " + lesson.name : "Marked incomplete");
    });

    return li_el;
  }

  // ---- Progress refresh ----
  const moduleEls = [];

  function refresh(changedIndex) {
    // update affected module + unlock cascade
    MODULES.forEach((mod, mi) => {
      const el = moduleEls[mi];
      const stats = moduleStats(mod);

      if (!mod.locked) {
        const fill = el.querySelector(".js-mod-fill");
        const pct = el.querySelector(".js-mod-pct");
        const count = el.querySelector(".js-mod-count");
        if (fill) fill.style.width = stats.pct + "%";
        if (pct) pct.textContent = stats.pct + "%";
        if (count) count.textContent = stats.done + " / " + stats.total + " done";
        el.classList.toggle("is-done", stats.done === stats.total);
      }

      // unlock if previous module fully done
      if (mod.locked && mi > 0) {
        const prev = moduleStats(MODULES[mi - 1]);
        if (!MODULES[mi - 1].locked && prev.done === prev.total) {
          mod.locked = false;
          rebuildModule(mi);
          toast("🔓 Unlocked: " + mod.title);
        }
      }
    });

    updateOverall();
  }

  function rebuildModule(mi) {
    const oldEl = moduleEls[mi];
    const wasOpen = oldEl.classList.contains("is-open");
    const fresh = buildModule(MODULES[mi], mi);
    if (wasOpen) {
      fresh.classList.add("is-open");
      fresh.querySelector(".module__head").setAttribute("aria-expanded", "true");
    }
    oldEl.replaceWith(fresh);
    moduleEls[mi] = fresh;
    refresh(mi);
  }

  function updateOverall() {
    let total = 0,
      done = 0;
    MODULES.forEach((m) => {
      total += m.lessons.length;
      done += m.lessons.filter((l) => l.done).length;
    });
    const pct = total ? Math.round((done / total) * 100) : 0;
    const circ = 188.5;
    document.getElementById("overallRingFill").style.strokeDashoffset =
      circ - (circ * pct) / 100;
    document.getElementById("overallRingLabel").textContent = pct + "%";
    document.getElementById("overallRing").setAttribute(
      "aria-label",
      "Course " + pct + " percent complete"
    );
    document.getElementById("overallCount").textContent = done + " of " + total;
  }

  // ---- Init ----
  MODULES.forEach((mod, mi) => {
    const el = buildModule(mod, mi);
    moduleEls.push(el);
    root.appendChild(el);
  });

  // open first incomplete module
  const firstActive = MODULES.findIndex(
    (m) => !m.locked && m.lessons.some((l) => !l.done)
  );
  const openIdx = firstActive === -1 ? 0 : firstActive;
  moduleEls[openIdx].classList.add("is-open");
  moduleEls[openIdx].querySelector(".module__head").setAttribute("aria-expanded", "true");

  updateOverall();
  MODULES.forEach((m, i) => {
    if (!m.locked) {
      const fill = moduleEls[i].querySelector(".js-mod-fill");
      if (fill) fill.style.width = moduleStats(m).pct + "%";
    }
  });

  // ---- Toolbar ----
  document.getElementById("expandAll").addEventListener("click", () => {
    moduleEls.forEach((el, i) => {
      if (!MODULES[i].locked) {
        el.classList.add("is-open");
        el.querySelector(".module__head").setAttribute("aria-expanded", "true");
      }
    });
  });
  document.getElementById("collapseAll").addEventListener("click", () => {
    moduleEls.forEach((el) => {
      el.classList.remove("is-open");
      el.querySelector(".module__head").setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("resumeBtn").addEventListener("click", () => {
    const idx = MODULES.findIndex(
      (m) => !m.locked && m.lessons.some((l) => !l.done)
    );
    const target = idx === -1 ? 0 : idx;
    moduleEls.forEach((el) => el.classList.remove("is-open"));
    const el = moduleEls[target];
    el.classList.add("is-open");
    el.querySelector(".module__head").setAttribute("aria-expanded", "true");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const next = MODULES[target].lessons.find((l) => !l.done);
    toast(next ? "Next up: " + next.name : "You're all caught up!");
  });
})();
