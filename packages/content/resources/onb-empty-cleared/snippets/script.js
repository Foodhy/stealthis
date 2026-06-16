(function () {
  "use strict";

  var SEED = [
    { id: "t1", title: "Reply to Priya about the Q3 rollout", meta: "Inbox · due 11:00", tag: "urgent", tagLabel: "Urgent" },
    { id: "t2", title: "Review the Driftboard onboarding copy", meta: "Design · 20 min", tag: "review", tagLabel: "Review" },
    { id: "t3", title: "Draft the sprint demo outline", meta: "Today · 45 min", tag: "focus", tagLabel: "Focus" },
    { id: "t4", title: "Pick up dry cleaning before 6pm", meta: "Personal", tag: "errand", tagLabel: "Errand" }
  ];

  var COPY = {
    celebratory: {
      title: "You’re all caught up",
      sub: "Inbox zero. Nothing left on your plate for today.",
      link: "Plan tomorrow’s focus"
    },
    calm: {
      title: "All clear",
      sub: "Nothing else to do right now. Take the win.",
      link: "Review tomorrow"
    }
  };

  var CONFETTI_COLORS = ["#5b5bf0", "#00b4a6", "#d98a2b", "#d4503e", "#3a3ab8"];

  var listEl = document.getElementById("task-list");
  var clearedEl = document.getElementById("cleared");
  var cardEl = document.querySelector(".card");
  var countPill = document.getElementById("count-pill");
  var confettiEl = document.getElementById("confetti");
  var toastEl = document.getElementById("toast");
  var clearedTitle = document.getElementById("cleared-title");
  var clearedSub = document.getElementById("cleared-sub");
  var nextLink = document.getElementById("next-link");

  var tasks = [];
  var variant = "celebratory";
  var toastTimer = null;
  var leaveTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function remaining() {
    return tasks.filter(function (t) {
      return !t.done;
    }).length;
  }

  function render() {
    listEl.innerHTML = "";
    tasks.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");
      li.dataset.id = t.id;

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "check";
      cb.checked = t.done;
      cb.id = "cb-" + t.id;
      cb.setAttribute("aria-label", "Mark complete: " + t.title);
      cb.addEventListener("change", function () {
        toggle(t.id, cb.checked);
      });

      var main = document.createElement("div");
      main.className = "task-main";

      var title = document.createElement("label");
      title.className = "task-title";
      title.setAttribute("for", "cb-" + t.id);
      title.textContent = t.title;

      var meta = document.createElement("span");
      meta.className = "task-meta";
      meta.textContent = t.meta;

      main.appendChild(title);
      main.appendChild(meta);

      var tag = document.createElement("span");
      tag.className = "tag " + t.tag;
      tag.textContent = t.tagLabel;

      li.appendChild(cb);
      li.appendChild(main);
      li.appendChild(tag);
      listEl.appendChild(li);
    });
    updateCount();
  }

  function updateCount() {
    var left = remaining();
    if (left === 0) {
      countPill.textContent = "All done";
      countPill.classList.add("is-clear");
    } else {
      countPill.textContent = left + (left === 1 ? " left" : " left");
      countPill.classList.remove("is-clear");
    }
  }

  function toggle(id, done) {
    var task = tasks.find(function (t) {
      return t.id === id;
    });
    if (!task) return;
    task.done = done;

    var li = listEl.querySelector('[data-id="' + id + '"]');
    if (li) li.classList.toggle("done", done);

    updateCount();

    if (remaining() === 0) {
      showCleared();
    }
  }

  function applyCopy() {
    var c = COPY[variant];
    clearedTitle.textContent = c.title;
    clearedSub.textContent = c.sub;
    nextLink.firstChild.nodeValue = c.link + " ";
  }

  function showCleared() {
    if (leaveTimer) clearTimeout(leaveTimer);
    var items = Array.prototype.slice.call(listEl.children);
    items.forEach(function (li, i) {
      setTimeout(function () {
        li.classList.add("leaving");
      }, i * 60);
    });

    leaveTimer = setTimeout(function () {
      listEl.hidden = true;
      applyCopy();
      clearedEl.hidden = false;
      if (variant === "celebratory") burst();
    }, 240 + items.length * 60);
  }

  function hideCleared() {
    clearedEl.hidden = true;
    listEl.hidden = false;
    confettiEl.innerHTML = "";
  }

  function burst() {
    confettiEl.innerHTML = "";
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var n = 46;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDuration = 1 + Math.random() * 0.9 + "s";
      p.style.animationDelay = Math.random() * 0.25 + "s";
      var w = 6 + Math.random() * 5;
      p.style.width = w + "px";
      p.style.height = w + Math.random() * 6 + "px";
      confettiEl.appendChild(p);
    }
    setTimeout(function () {
      confettiEl.innerHTML = "";
    }, 2600);
  }

  function undo() {
    hideCleared();
    // restore the most-recently completed item; if all done, restore the last one
    var restored = null;
    for (var i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].done) {
        tasks[i].done = false;
        restored = tasks[i];
        break;
      }
    }
    render();
    if (restored) {
      toast("Restored “" + restored.title.slice(0, 32) + (restored.title.length > 32 ? "…" : "") + "”");
    }
  }

  function reset() {
    hideCleared();
    tasks = SEED.map(function (t) {
      return Object.assign({}, t, { done: false });
    });
    render();
    toast("Demo reset — 4 tasks restored");
  }

  function setVariant(v) {
    variant = v;
    cardEl.classList.toggle("calm", v === "calm");
    document.querySelectorAll(".seg").forEach(function (b) {
      var on = b.dataset.variant === v;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    if (!clearedEl.hidden) {
      applyCopy();
      if (v === "celebratory") burst();
      else confettiEl.innerHTML = "";
    }
  }

  // ---- Wire up controls ----
  document.querySelectorAll(".seg").forEach(function (b) {
    b.addEventListener("click", function () {
      setVariant(b.dataset.variant);
    });
  });

  // arrow-key navigation on segmented control
  var segWrap = document.querySelector(".variant-switch");
  segWrap.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    var segs = Array.prototype.slice.call(segWrap.querySelectorAll(".seg"));
    var idx = segs.findIndex(function (s) {
      return s.classList.contains("is-on");
    });
    var next = e.key === "ArrowRight" ? (idx + 1) % segs.length : (idx - 1 + segs.length) % segs.length;
    segs[next].focus();
    setVariant(segs[next].dataset.variant);
  });

  document.getElementById("undo-btn").addEventListener("click", undo);
  document.getElementById("reset-btn").addEventListener("click", reset);
  nextLink.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Opening tomorrow’s plan…");
  });

  // Esc on the cleared state restores items (overlay-style affordance)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !clearedEl.hidden) {
      undo();
    }
  });

  reset();
  // initial reset toasts; clear it so the first paint is quiet
  toastEl.classList.remove("show");
  toastEl.textContent = "";
})();
