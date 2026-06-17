(function () {
  "use strict";

  /* ---------- seed data (fictional) ---------- */
  var TYPE_ICON = { video: "🎬", reading: "📖", quiz: "✅", assignment: "📝" };
  var uid = (function () { var n = 100; return function () { return "id" + (++n); }; })();

  var course = {
    name: "Intro to Generative Design",
    price: 79,
    pricing: "paid",
    level: "Intermediate",
    category: "Design & Creative",
    tags: ["generative", "design", "p5.js", "creative-coding"],
    modules: [
      { id: uid(), name: "Getting Started", collapsed: false, lessons: [
        { id: uid(), title: "Welcome & what you'll build", type: "video", min: 6, done: true, free: true, content: "A quick tour of the course, the tools we'll use, and the final gallery you'll ship." },
        { id: uid(), title: "Setting up your sketch", type: "reading", min: 9, done: true, free: false, content: "Install the toolkit and create your first blank canvas." }
      ]},
      { id: uid(), name: "Vectors & Fields", collapsed: false, lessons: [
        { id: uid(), title: "Working with vector fields", type: "video", min: 14, done: false, free: false, content: "Map a grid of points and steer them with a noise field for organic motion." },
        { id: uid(), title: "Flow lines & trails", type: "video", min: 11, done: false, free: false, content: "Trace particle paths to draw flowing line art." },
        { id: uid(), title: "Knowledge check", type: "quiz", min: 5, done: false, free: false, content: "Five questions on fields, vectors, and noise." }
      ]},
      { id: uid(), name: "Color & Export", collapsed: false, lessons: [
        { id: uid(), title: "Palette systems", type: "reading", min: 8, done: false, free: false, content: "Build harmonious palettes from a single seed color." },
        { id: uid(), title: "Final piece: ship a poster", type: "assignment", min: 30, done: false, free: false, content: "Combine fields, trails, and color into one high-res export." }
      ]}
    ]
  };

  var activeLessonId = course.modules[1].lessons[0].id;
  var saveTimer = null;

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function toast(msg, kind) {
    var wrap = $("#toast-wrap");
    var t = el("div", "toast" + (kind ? " toast--" + kind : ""));
    t.appendChild(el("span", "toast__dot"));
    t.appendChild(el("span", null, msg));
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  function findLesson(id) {
    for (var m = 0; m < course.modules.length; m++) {
      var ls = course.modules[m].lessons;
      for (var i = 0; i < ls.length; i++) if (ls[i].id === id) return { mod: course.modules[m], modIndex: m, lesson: ls[i], index: i };
    }
    return null;
  }

  function markSaving() {
    var as = $("#autosave");
    as.textContent = "Saving…"; as.classList.add("is-saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { as.textContent = "All changes saved"; as.classList.remove("is-saving"); }, 700);
    if ($("#status-pill").dataset.state === "published") setDraft();
  }

  function setDraft() {
    var p = $("#status-pill"); p.dataset.state = "draft"; p.textContent = "Draft";
  }

  /* ---------- stats ---------- */
  function recompute() {
    var lessons = 0, mins = 0, done = 0;
    course.modules.forEach(function (m) {
      lessons += m.lessons.length;
      m.lessons.forEach(function (l) { mins += (+l.min || 0); if (l.done) done++; });
    });
    $("#stat-modules").textContent = course.modules.length;
    $("#stat-lessons").textContent = lessons;
    $("#stat-mins").textContent = mins;
    $("#tree-counter").textContent = lessons + (lessons === 1 ? " lesson" : " lessons");
    var pct = lessons ? Math.round((done / lessons) * 100) : 0;
    $("#completion-pct").textContent = pct + "%";
    $("#completion-fill").style.width = pct + "%";
  }

  /* ---------- render tree ---------- */
  function renderTree() {
    var list = $("#module-list");
    list.innerHTML = "";

    course.modules.forEach(function (mod, mi) {
      var modEl = el("div", "module" + (mod.collapsed ? " collapsed" : ""));
      modEl.dataset.id = mod.id;
      modEl.draggable = true;

      var head = el("div", "module__head");
      head.innerHTML =
        '<span class="grip" title="Drag to reorder" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></span>' +
        '<button class="module__toggle" aria-label="Toggle module"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
      var nameInput = el("input", "module__name");
      nameInput.value = mod.name; nameInput.setAttribute("aria-label", "Module " + (mi + 1) + " name");
      head.appendChild(nameInput);
      head.appendChild(el("span", "module__count", mod.lessons.length + ""));
      var del = el("button", "icon-btn", '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>');
      del.setAttribute("aria-label", "Delete module");
      head.appendChild(del);
      modEl.appendChild(head);

      var lessonsWrap = el("div", "lessons");
      mod.lessons.forEach(function (les) {
        var l = el("div", "lesson" + (les.done ? " done" : "") + (les.id === activeLessonId ? " is-active" : ""));
        l.dataset.id = les.id; l.draggable = true; l.tabIndex = 0;
        l.innerHTML =
          '<span class="lesson__check" data-act="check" role="checkbox" aria-checked="' + (les.done ? "true" : "false") + '" tabindex="0">' + (les.done ? "✓" : "") + '</span>' +
          '<span class="lesson__type">' + (TYPE_ICON[les.type] || "📄") + '</span>' +
          '<span class="lesson__title">' + escapeHtml(les.title || "Untitled lesson") + '</span>' +
          '<span class="lesson__min">' + (les.min || 0) + 'm</span>';
        lessonsWrap.appendChild(l);
      });
      var addLes = el("button", "add-lesson", '+ Add lesson');
      lessonsWrap.appendChild(addLes);
      modEl.appendChild(lessonsWrap);

      /* module-level events */
      $(".module__toggle", head).addEventListener("click", function () { mod.collapsed = !mod.collapsed; modEl.classList.toggle("collapsed"); });
      nameInput.addEventListener("input", function () { mod.name = nameInput.value; markSaving(); });
      del.addEventListener("click", function () {
        if (course.modules.length === 1) { toast("A course needs at least one module", "warn"); return; }
        course.modules.splice(mi, 1);
        if (!findLesson(activeLessonId)) activeLessonId = firstLessonId();
        renderAll(); markSaving(); toast("Module removed");
      });
      addLes.addEventListener("click", function () {
        var nl = { id: uid(), title: "New lesson", type: "video", min: 10, done: false, free: false, content: "" };
        mod.lessons.push(nl); mod.collapsed = false; activeLessonId = nl.id;
        renderAll(); markSaving(); toast("Lesson added");
      });

      lessonsWrap.querySelectorAll(".lesson").forEach(function (lEl) {
        var lid = lEl.dataset.id;
        lEl.addEventListener("click", function (e) {
          if (e.target.closest('[data-act="check"]')) return;
          activeLessonId = lid; renderTree(); loadEditor();
        });
        lEl.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activeLessonId = lid; renderTree(); loadEditor(); }
        });
        var chk = $('[data-act="check"]', lEl);
        chk.addEventListener("click", function (e) { e.stopPropagation(); toggleDone(lid); });
        chk.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggleDone(lid); } });
      });

      attachLessonDnd(lessonsWrap, mod);
      list.appendChild(modEl);
    });

    attachModuleDnd(list);
    recompute();
  }

  function toggleDone(lid) {
    var f = findLesson(lid); if (!f) return;
    f.lesson.done = !f.lesson.done; renderTree(); markSaving();
  }

  function firstLessonId() {
    for (var i = 0; i < course.modules.length; i++) if (course.modules[i].lessons.length) return course.modules[i].lessons[0].id;
    return null;
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- drag & drop: modules ---------- */
  function attachModuleDnd(list) {
    var dragId = null;
    list.querySelectorAll(".module").forEach(function (m) {
      m.addEventListener("dragstart", function (e) {
        if (e.target.closest(".lesson")) return;
        dragId = m.dataset.id; m.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      m.addEventListener("dragend", function () { m.classList.remove("is-dragging"); list.querySelectorAll(".drag-over").forEach(function (x) { x.classList.remove("drag-over"); }); });
      m.addEventListener("dragover", function (e) { if (!dragId || dragId === m.dataset.id) return; e.preventDefault(); m.classList.add("drag-over"); });
      m.addEventListener("dragleave", function () { m.classList.remove("drag-over"); });
      m.addEventListener("drop", function (e) {
        e.preventDefault(); m.classList.remove("drag-over");
        if (!dragId || dragId === m.dataset.id) return;
        var from = course.modules.findIndex(function (x) { return x.id === dragId; });
        var to = course.modules.findIndex(function (x) { return x.id === m.dataset.id; });
        if (from < 0 || to < 0) return;
        course.modules.splice(to, 0, course.modules.splice(from, 1)[0]);
        renderTree(); markSaving();
      });
    });
  }

  /* ---------- drag & drop: lessons within a module ---------- */
  function attachLessonDnd(wrap, mod) {
    var dragId = null;
    wrap.querySelectorAll(".lesson").forEach(function (l) {
      l.addEventListener("dragstart", function (e) { e.stopPropagation(); dragId = l.dataset.id; l.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; });
      l.addEventListener("dragend", function () { l.classList.remove("is-dragging"); wrap.querySelectorAll(".drag-over").forEach(function (x) { x.classList.remove("drag-over"); }); });
      l.addEventListener("dragover", function (e) { if (!dragId || dragId === l.dataset.id) return; e.preventDefault(); e.stopPropagation(); l.classList.add("drag-over"); });
      l.addEventListener("dragleave", function () { l.classList.remove("drag-over"); });
      l.addEventListener("drop", function (e) {
        e.preventDefault(); e.stopPropagation(); l.classList.remove("drag-over");
        if (!dragId || dragId === l.dataset.id) return;
        var from = mod.lessons.findIndex(function (x) { return x.id === dragId; });
        var to = mod.lessons.findIndex(function (x) { return x.id === l.dataset.id; });
        if (from < 0 || to < 0) return;
        mod.lessons.splice(to, 0, mod.lessons.splice(from, 1)[0]);
        renderTree(); markSaving();
      });
    });
  }

  /* ---------- editor ---------- */
  function loadEditor() {
    var f = findLesson(activeLessonId);
    if (!f) { activeLessonId = firstLessonId(); f = findLesson(activeLessonId); }
    if (!f) return;
    $("#editor-crumb").textContent = "Module " + (f.modIndex + 1) + " · Lesson " + (f.index + 1);
    $("#lesson-title").value = f.lesson.title;
    $("#lesson-type").value = f.lesson.type;
    $("#lesson-duration").value = f.lesson.min;
    $("#lesson-content").value = f.lesson.content;
    $("#lesson-free").checked = !!f.lesson.free;
    $("#video-field").style.display = f.lesson.type === "video" ? "" : "none";
  }

  function bindEditor() {
    $("#lesson-title").addEventListener("input", function () {
      var f = findLesson(activeLessonId); if (!f) return;
      f.lesson.title = this.value; var t = document.querySelector('.lesson[data-id="' + activeLessonId + '"] .lesson__title');
      if (t) t.textContent = this.value || "Untitled lesson"; markSaving();
    });
    $("#lesson-type").addEventListener("change", function () {
      var f = findLesson(activeLessonId); if (!f) return;
      f.lesson.type = this.value; renderTree(); loadEditor(); markSaving();
    });
    $("#lesson-duration").addEventListener("input", function () {
      var f = findLesson(activeLessonId); if (!f) return;
      f.lesson.min = Math.max(0, +this.value || 0); renderTree(); markSaving();
    });
    $("#lesson-content").addEventListener("input", function () {
      var f = findLesson(activeLessonId); if (!f) return; f.lesson.content = this.value; markSaving();
    });
    $("#lesson-free").addEventListener("change", function () {
      var f = findLesson(activeLessonId); if (!f) return; f.lesson.free = this.checked; markSaving();
      toast(this.checked ? "Lesson set as free preview" : "Free preview removed", "info");
    });

    $("#btn-duplicate").addEventListener("click", function () {
      var f = findLesson(activeLessonId); if (!f) return;
      var copy = JSON.parse(JSON.stringify(f.lesson)); copy.id = uid(); copy.title += " (copy)"; copy.done = false;
      f.mod.lessons.splice(f.index + 1, 0, copy); activeLessonId = copy.id;
      renderAll(); markSaving(); toast("Lesson duplicated");
    });
    $("#btn-delete-lesson").addEventListener("click", function () {
      var f = findLesson(activeLessonId); if (!f) return;
      var total = course.modules.reduce(function (s, m) { return s + m.lessons.length; }, 0);
      if (total === 1) { toast("Add another lesson before deleting this one", "warn"); return; }
      f.mod.lessons.splice(f.index, 1); activeLessonId = firstLessonId();
      renderAll(); markSaving(); toast("Lesson deleted");
    });

    /* toolbar wraps selection */
    document.querySelectorAll(".editor__toolbar button").forEach(function (b) {
      b.addEventListener("click", function () {
        var ta = $("#lesson-content"), s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || "text";
        var map = { b: "**" + sel + "**", i: "_" + sel + "_", h: "## " + sel, ul: "- " + sel, link: "[" + sel + "](https://)" };
        var ins = map[b.dataset.fmt] || sel;
        ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
        ta.focus(); var f = findLesson(activeLessonId); if (f) f.lesson.content = ta.value; markSaving();
      });
    });
  }

  /* ---------- video uploader (mock) ---------- */
  function bindUploader() {
    var up = $("#uploader"), empty = $("#uploader-empty"), fileBox = $("#uploader-file"), bar = $("#uploader-bar");
    function fakeUpload(name, size) {
      empty.hidden = true; fileBox.hidden = false;
      $("#uploader-name").textContent = name || "lesson-clip.mp4";
      $("#uploader-size").textContent = (size || "126 MB") + " · 10:18";
      bar.style.width = "0%"; var p = 0;
      var iv = setInterval(function () {
        p += Math.random() * 22; if (p >= 100) { p = 100; clearInterval(iv); toast("Video uploaded", "info"); }
        bar.style.width = p + "%";
      }, 200);
      markSaving();
    }
    up.addEventListener("click", function () { if (fileBox.hidden) fakeUpload(); });
    up.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && fileBox.hidden) { e.preventDefault(); fakeUpload(); } });
    up.addEventListener("dragover", function (e) { e.preventDefault(); up.classList.add("is-dragover"); });
    up.addEventListener("dragleave", function () { up.classList.remove("is-dragover"); });
    up.addEventListener("drop", function (e) {
      e.preventDefault(); up.classList.remove("is-dragover");
      var fl = e.dataTransfer.files && e.dataTransfer.files[0];
      fakeUpload(fl ? fl.name : "dropped-clip.mp4", fl ? (Math.round(fl.size / 1048576) + " MB") : null);
    });
    $("#uploader-remove").addEventListener("click", function (e) {
      e.stopPropagation(); fileBox.hidden = true; empty.hidden = false; markSaving(); toast("Video removed");
    });
  }

  /* ---------- settings ---------- */
  function bindSettings() {
    /* pricing segment */
    $("#pricing-seg").querySelectorAll(".seg__btn").forEach(function (b) {
      b.addEventListener("click", function () {
        $("#pricing-seg").querySelectorAll(".seg__btn").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); course.pricing = b.dataset.price;
        $("#price-field").style.display = course.pricing === "free" ? "none" : "";
        markSaving();
      });
    });
    $("#course-price").addEventListener("input", function () { course.price = +this.value || 0; markSaving(); });

    /* difficulty */
    $("#levels").querySelectorAll(".level").forEach(function (b) {
      b.addEventListener("click", function () {
        $("#levels").querySelectorAll(".level").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); course.level = b.dataset.level; markSaving();
      });
    });

    $("#course-category").addEventListener("change", function () { course.category = this.value; markSaving(); });

    /* tags */
    renderTags();
    $("#tag-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); var v = this.value.trim().replace(/^#/, "");
        if (!v) return;
        if (course.tags.indexOf(v) > -1) { toast("Tag already added", "warn"); this.value = ""; return; }
        course.tags.push(v); this.value = ""; renderTags(); markSaving();
      } else if (e.key === "Backspace" && !this.value && course.tags.length) {
        course.tags.pop(); renderTags(); markSaving();
      }
    });
  }

  function renderTags() {
    var box = $("#tags"); box.innerHTML = "";
    course.tags.forEach(function (t, i) {
      var tag = el("span", "tag");
      tag.appendChild(document.createTextNode(t));
      var x = el("button", null, "✕"); x.setAttribute("aria-label", "Remove tag " + t);
      x.addEventListener("click", function () { course.tags.splice(i, 1); renderTags(); markSaving(); });
      tag.appendChild(x); box.appendChild(tag);
    });
  }

  /* ---------- publish bar ---------- */
  function editCourseName() {
    var h = $("#course-name-display");
    if (!h || h.tagName !== "H1") return;
    var input = el("input", "field__input");
    input.value = course.name; input.style.maxWidth = "320px"; input.id = "course-name-display";
    input.setAttribute("aria-label", "Course title");
    h.replaceWith(input); input.focus(); input.select();
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") input.blur(); });
    function commit() {
      course.name = input.value.trim() || "Untitled course";
      var nh = el("h1"); nh.id = "course-name-display"; nh.textContent = course.name; nh.title = "Click to rename";
      input.replaceWith(nh); nh.addEventListener("click", editCourseName); markSaving();
    }
  }

  function bindTopbar() {
    var nameH = $("#course-name-display"); nameH.title = "Click to rename";
    nameH.addEventListener("click", editCourseName);

    $("#btn-save").addEventListener("click", function () {
      var as = $("#autosave"); as.textContent = "Saving…"; as.classList.add("is-saving");
      setTimeout(function () { as.textContent = "All changes saved"; as.classList.remove("is-saving"); toast("Draft saved"); }, 500);
    });

    $("#btn-preview").addEventListener("click", function () { toast("Opening learner preview…", "info"); });

    $("#btn-publish").addEventListener("click", function () {
      var total = course.modules.reduce(function (s, m) { return s + m.lessons.length; }, 0);
      if (total < 1) { toast("Add at least one lesson to publish", "warn"); return; }
      var p = $("#status-pill");
      if (p.dataset.state === "published") {
        setDraft(); toast("Moved back to draft", "warn");
      } else {
        p.dataset.state = "published"; p.textContent = "Published"; p.classList.add("pop");
        setTimeout(function () { p.classList.remove("pop"); }, 360);
        toast("🚀 Course published — " + total + " lessons live");
      }
    });
  }

  /* ---------- init ---------- */
  function renderAll() { renderTree(); loadEditor(); }

  function init() {
    renderTree();
    bindEditor();
    loadEditor();
    bindUploader();
    bindSettings();
    bindTopbar();
    $("#status-pill").addEventListener("click", function () {}); // noop, keep focusable styling neutral
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
