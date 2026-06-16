(function () {
  "use strict";

  /* ---------- data ---------- */
  var ROLES = [
    {
      id: "founder",
      label: "Founder",
      badge: "Popular",
      desc: "Set up the company workspace and invite your first teammates.",
      next: "We'll spin up a company workspace and a 30-day plan board.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 7v6c0 5 3.8 8.3 9 9 5.2-.7 9-4 9-9V7z"/><path d="m9 12 2 2 4-4"/></svg>'
    },
    {
      id: "developer",
      label: "Developer",
      desc: "Connect your repos and wire up CI status into your boards.",
      next: "We'll surface the API keys and a GitHub/GitLab integration first.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13 5-2 14"/></svg>'
    },
    {
      id: "designer",
      label: "Designer",
      desc: "Pull in Figma files and keep specs next to the work.",
      next: "We'll open the Figma sync and a handoff-ready component view.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 4 5 5L8 21l-5 1 1-5z"/><path d="m13 6 5 5"/></svg>'
    },
    {
      id: "marketer",
      label: "Marketer",
      desc: "Plan campaigns and track launches on a shared calendar.",
      next: "We'll start you on a campaign calendar with launch templates.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6l-5 4H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6"/><path d="M19 6a7 7 0 0 1 0 12"/></svg>'
    },
    {
      id: "operations",
      label: "Operations",
      desc: "Standardize workflows and automate recurring busywork.",
      next: "We'll preload automation recipes and a process library.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15H4.4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.6V4.4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4z"/></svg>'
    },
    {
      id: "other",
      label: "Just exploring",
      desc: "Take a tour with sample data before committing to a setup.",
      next: "We'll drop you into a sandbox project with example data.",
      icon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'
    }
  ];

  /* ---------- state ---------- */
  var state = { mode: "single", layout: "grid", selected: [] };

  var rolesEl = document.getElementById("roles");
  var continueBtn = document.getElementById("continue");
  var skipBtn = document.getElementById("skip");
  var hintEl = document.getElementById("hint");
  var toasts = document.getElementById("toasts");

  /* ---------- toast helper ---------- */
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>';

  function toast(title, sub) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="toast__icon" aria-hidden="true">' +
      CHECK_SVG +
      "</span><span><strong>" +
      title +
      "</strong>" +
      (sub ? "<small>" + sub + "</small>" : "") +
      "</span>";
    toasts.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("is-in");
    });
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () {
        el.remove();
      }, 240);
    }, 3600);
  }

  /* ---------- render ---------- */
  function render() {
    rolesEl.className = "roles " + (state.layout === "grid" ? "is-grid" : "is-list");
    rolesEl.setAttribute(
      "role",
      state.mode === "single" ? "radiogroup" : "group"
    );
    rolesEl.innerHTML = "";

    ROLES.forEach(function (role, i) {
      var isSel = state.selected.indexOf(role.id) !== -1;
      var multi = state.mode === "multi";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "role" + (isSel ? " is-selected" : "");
      btn.dataset.id = role.id;
      btn.dataset.shape = multi ? "check" : "radio";
      btn.setAttribute("role", multi ? "checkbox" : "radio");
      btn.setAttribute("aria-checked", isSel ? "true" : "false");
      // roving tabindex for the radio pattern
      if (!multi) {
        var anySel = state.selected.length > 0;
        var focusable = anySel ? isSel : i === 0;
        btn.tabIndex = focusable ? 0 : -1;
      } else {
        btn.tabIndex = 0;
      }

      btn.innerHTML =
        '<span class="role__icon" aria-hidden="true">' +
        role.icon +
        "</span>" +
        '<span class="role__body">' +
        '<span class="role__label">' +
        role.label +
        (role.badge
          ? '<span class="role__badge">' + role.badge + "</span>"
          : "") +
        "</span>" +
        '<p class="role__desc">' +
        role.desc +
        "</p>" +
        "</span>" +
        '<span class="role__check" aria-hidden="true">' +
        CHECK_SVG +
        "</span>";

      rolesEl.appendChild(btn);
    });

    updateFooter();
  }

  function updateFooter() {
    var n = state.selected.length;
    if (n === 0) {
      continueBtn.disabled = true;
      hintEl.textContent =
        state.mode === "multi"
          ? "Select one or more options to continue."
          : "Select an option to continue.";
      return;
    }
    continueBtn.disabled = false;
    if (state.mode === "multi") {
      var labels = state.selected.map(labelFor).join(", ");
      hintEl.innerHTML =
        n +
        " selected &mdash; <strong>" +
        labels +
        "</strong>";
    } else {
      var role = byId(state.selected[0]);
      hintEl.innerHTML = "<strong>" + role.label + "</strong> &mdash; " + role.next;
    }
  }

  function byId(id) {
    return ROLES.filter(function (r) {
      return r.id === id;
    })[0];
  }
  function labelFor(id) {
    return byId(id).label;
  }

  /* ---------- selection ---------- */
  function toggle(id) {
    var idx = state.selected.indexOf(id);
    if (state.mode === "single") {
      state.selected = idx === -1 ? [id] : [];
    } else {
      if (idx === -1) state.selected.push(id);
      else state.selected.splice(idx, 1);
    }
    syncSelectedClasses();
    updateFooter();
  }

  function syncSelectedClasses() {
    var nodes = rolesEl.querySelectorAll(".role");
    nodes.forEach(function (node) {
      var sel = state.selected.indexOf(node.dataset.id) !== -1;
      node.classList.toggle("is-selected", sel);
      node.setAttribute("aria-checked", sel ? "true" : "false");
      if (state.mode === "single") {
        var anySel = state.selected.length > 0;
        node.tabIndex = anySel ? (sel ? 0 : -1) : node.tabIndex;
      }
    });
  }

  /* ---------- events ---------- */
  rolesEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".role");
    if (!btn) return;
    toggle(btn.dataset.id);
  });

  // keyboard: arrow nav for radio mode, space/enter toggle
  rolesEl.addEventListener("keydown", function (e) {
    var btn = e.target.closest(".role");
    if (!btn) return;
    var nodes = Array.prototype.slice.call(rolesEl.querySelectorAll(".role"));
    var i = nodes.indexOf(btn);

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(btn.dataset.id);
      return;
    }

    var dir = 0;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") dir = 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") dir = -1;
    if (!dir) return;
    e.preventDefault();
    var next = nodes[(i + dir + nodes.length) % nodes.length];
    next.focus();
    if (state.mode === "single") {
      nodes.forEach(function (n) {
        n.tabIndex = -1;
      });
      next.tabIndex = 0;
      toggle(next.dataset.id);
    }
  });

  // variant switcher
  document.querySelectorAll(".seg").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".seg__btn");
      if (!btn) return;
      var siblings = group.querySelectorAll(".seg__btn");
      siblings.forEach(function (s) {
        s.classList.remove("is-active");
        s.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");

      if (btn.dataset.mode) {
        state.mode = btn.dataset.mode;
        // collapse to first selection when switching to single
        if (state.mode === "single" && state.selected.length > 1) {
          state.selected = [state.selected[0]];
        }
        render();
      } else if (btn.dataset.layout) {
        state.layout = btn.dataset.layout;
        render();
      }
    });
  });

  // continue
  continueBtn.addEventListener("click", function () {
    if (state.selected.length === 0) return;
    if (state.mode === "single") {
      var role = byId(state.selected[0]);
      toast("Great choice, " + role.label.toLowerCase() + "!", role.next);
    } else {
      toast(
        "You're all set",
        "Tailoring for: " + state.selected.map(labelFor).join(", ") + "."
      );
    }
    continueBtn.classList.add("is-pulsed");
  });

  // skip
  skipBtn.addEventListener("click", function () {
    state.selected = [];
    syncSelectedClasses();
    updateFooter();
    toast("Skipped for now", "You can set your role later in Settings.");
  });

  /* ---------- init ---------- */
  render();
})();
