(function () {
  "use strict";

  var TOTAL = 4; // form steps (0..3); index 3 is review
  var current = 0;

  // Persisted wizard state
  var state = {
    fullName: "",
    email: "",
    password: "",
    workspace: "",
    slug: "",
    teamSize: "",
    invites: [], // [{email}]
  };

  var wizard = document.querySelector(".wizard");
  var form = document.getElementById("wizardForm");
  var stepsEls = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel[data-panel]"));
  var donePanel = document.querySelector('.panel[data-panel="done"]');
  var actions = document.getElementById("actions");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var skipBtn = document.getElementById("skipBtn");
  var progressFill = document.getElementById("progressFill");
  var progressLabel = document.getElementById("progressLabel");
  var progressTrack = document.querySelector(".progress-track");

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>';
    var span = document.createElement("span");
    span.textContent = msg;
    el.appendChild(span);
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 250);
    }, 2400);
  }

  /* ---------- Variant switchers ---------- */
  function wireSegments(attr) {
    document.querySelectorAll("[data-" + attr + "]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".seg");
        group.querySelectorAll(".seg-btn").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        wizard.setAttribute("data-" + attr, btn.getAttribute("data-" + attr));
        updateProgress();
      });
    });
  }
  wireSegments("layout");
  wireSegments("progress");

  /* ---------- Validation ---------- */
  function setError(name, msg) {
    var errEl = document.querySelector('[data-error="' + name + '"]');
    if (errEl) errEl.textContent = msg || "";
    if (errEl) {
      var field = errEl.closest(".field");
      if (field) field.classList.toggle("has-error", !!msg);
    }
  }

  function validateStep(step) {
    var ok = true;
    if (step === 0) {
      if (!state.fullName.trim()) { setError("fullName", "Please enter your name."); ok = false; }
      else setError("fullName", "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) { setError("email", "Enter a valid email address."); ok = false; }
      else setError("email", "");
      if (state.password.length < 8) { setError("password", "Password must be at least 8 characters."); ok = false; }
      else setError("password", "");
    } else if (step === 1) {
      if (!state.workspace.trim()) { setError("workspace", "Give your workspace a name."); ok = false; }
      else setError("workspace", "");
      if (!/^[a-z0-9-]{2,}$/.test(state.slug)) { setError("slug", "Use lowercase letters, numbers and dashes (2+)."); ok = false; }
      else setError("slug", "");
      if (!state.teamSize) { setError("teamSize", "Pick a team size."); ok = false; }
      else setError("teamSize", "");
    }
    // step 2 (invites) is optional; step 3 is review
    return ok;
  }

  /* ---------- Input bindings (persist values) ---------- */
  function bindInput(id, key, transform) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      var v = transform ? transform(el.value) : el.value;
      if (transform && v !== el.value) el.value = v;
      state[key] = v;
      // live-clear error once it becomes valid
      if (el.closest(".field") && el.closest(".field").classList.contains("has-error")) {
        validateStep(current);
      }
    });
  }
  bindInput("fullName", "fullName");
  bindInput("email", "email");
  bindInput("password", "password");
  bindInput("workspace", "workspace", function (v) {
    // auto-suggest slug if untouched
    var auto = v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    var slugEl = document.getElementById("slug");
    if (slugEl && !slugEl.dataset.touched) { slugEl.value = auto; state.slug = auto; }
    return v;
  });
  var slugEl = document.getElementById("slug");
  slugEl.addEventListener("input", function () {
    slugEl.dataset.touched = "1";
    var v = slugEl.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    slugEl.value = v;
    state.slug = v;
    if (slugEl.closest(".field").classList.contains("has-error")) validateStep(1);
  });

  /* ---------- Team size chips (radiogroup) ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip, i) {
    chip.addEventListener("click", function () { selectChip(chip); });
    chip.addEventListener("keydown", function (e) {
      var idx = chips.indexOf(chip);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        chips[(idx + 1) % chips.length].focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        chips[(idx - 1 + chips.length) % chips.length].focus();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectChip(chip);
      }
    });
  });
  function selectChip(chip) {
    chips.forEach(function (c) {
      c.setAttribute("aria-checked", "false");
      c.tabIndex = -1;
    });
    chip.setAttribute("aria-checked", "true");
    chip.tabIndex = 0;
    state.teamSize = chip.getAttribute("data-value");
    setError("teamSize", "");
  }
  if (chips[0]) chips[0].tabIndex = 0;

  /* ---------- Invites ---------- */
  var inviteEmail = document.getElementById("inviteEmail");
  var inviteList = document.getElementById("inviteList");
  var addInvite = document.getElementById("addInvite");
  var AVATAR_COLORS = ["#5b5bf0", "#00b4a6", "#d98a2b", "#d4503e", "#3a3ab8", "#2f9e6f"];

  function renderInvites() {
    inviteList.innerHTML = "";
    if (!state.invites.length) {
      var empty = document.createElement("li");
      empty.className = "invite-empty";
      empty.textContent = "No invites yet — add a teammate or skip this step.";
      inviteList.appendChild(empty);
      return;
    }
    state.invites.forEach(function (inv, i) {
      var li = document.createElement("li");
      li.className = "invite-item";
      var initials = inv.email.slice(0, 2).toUpperCase();
      var color = AVATAR_COLORS[i % AVATAR_COLORS.length];
      var av = document.createElement("span");
      av.className = "invite-avatar";
      av.style.background = color;
      av.textContent = initials;
      var em = document.createElement("span");
      em.className = "invite-email";
      em.textContent = inv.email;
      var role = document.createElement("span");
      role.className = "invite-role";
      role.textContent = "Member";
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "invite-remove";
      rm.setAttribute("aria-label", "Remove " + inv.email);
      rm.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      rm.addEventListener("click", function () {
        state.invites.splice(i, 1);
        renderInvites();
        toast("Invite removed");
      });
      li.appendChild(av);
      li.appendChild(em);
      li.appendChild(role);
      li.appendChild(rm);
      inviteList.appendChild(li);
    });
  }

  function tryAddInvite() {
    var v = inviteEmail.value.trim().toLowerCase();
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast("That doesn't look like a valid email"); return; }
    if (state.invites.some(function (x) { return x.email === v; })) { toast("Already on the list"); return; }
    state.invites.push({ email: v });
    inviteEmail.value = "";
    renderInvites();
    toast("Added " + v);
  }
  addInvite.addEventListener("click", tryAddInvite);
  inviteEmail.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); tryAddInvite(); }
  });
  renderInvites();

  /* ---------- Review ---------- */
  function buildReview() {
    var review = document.getElementById("review");
    review.innerHTML = "";
    var rows = [
      { label: "Name", value: state.fullName, step: 0 },
      { label: "Email", value: state.email, step: 0 },
      { label: "Password", value: "•".repeat(Math.max(8, state.password.length)), step: 0 },
      { label: "Workspace", value: state.workspace, step: 1 },
      { label: "URL", value: "orbital.app/" + state.slug, step: 1 },
      { label: "Team size", value: state.teamSize, step: 1 },
      { label: "Invites", value: state.invites, step: 2, tags: true },
    ];
    rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "review-row";
      var dt = document.createElement("dt");
      dt.textContent = r.label;
      var dd = document.createElement("dd");
      if (r.tags) {
        dd.className = "tags";
        if (!r.value.length) {
          dd.textContent = "None added";
          dd.className = "";
        } else {
          r.value.forEach(function (inv) {
            var t = document.createElement("span");
            t.className = "review-tag";
            t.textContent = inv.email;
            dd.appendChild(t);
          });
        }
      } else {
        dd.textContent = r.value;
      }
      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "review-edit";
      edit.textContent = "Edit";
      edit.addEventListener("click", function () { goTo(r.step); });
      var wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.alignItems = "center";
      wrap.style.gap = "12px";
      wrap.appendChild(dd);
      wrap.appendChild(edit);
      row.appendChild(dt);
      row.appendChild(wrap);
      review.appendChild(row);
    });
  }

  /* ---------- Progress + stepper UI ---------- */
  function updateProgress() {
    var mode = wizard.getAttribute("data-progress");
    var pct = Math.round((current / TOTAL) * 100);
    progressFill.style.width = pct + "%";
    progressTrack.setAttribute("aria-valuenow", String(pct));
    if (mode === "percent") {
      progressLabel.textContent = pct + "% complete";
    } else {
      progressLabel.textContent = "Step " + (current + 1) + " of " + TOTAL;
    }
  }

  function updateSteps() {
    stepsEls.forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
      el.classList.toggle("is-done", i < current);
    });
  }

  /* ---------- Navigation ---------- */
  function showPanel(idx) {
    panels.forEach(function (p) {
      p.hidden = parseInt(p.getAttribute("data-panel"), 10) !== idx;
      if (parseInt(p.getAttribute("data-panel"), 10) === idx) {
        p.classList.add("is-active");
      } else {
        p.classList.remove("is-active");
      }
    });
  }

  function goTo(idx) {
    current = idx;
    showPanel(idx);
    updateSteps();
    updateProgress();
    backBtn.disabled = idx === 0;
    skipBtn.hidden = idx !== 2; // only on invites step
    if (idx === TOTAL - 1) {
      buildReview();
      nextBtn.innerHTML =
        'Launch workspace <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>';
    } else {
      nextBtn.innerHTML =
        'Continue <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
    }
    // focus first input for keyboard users
    var first = panels[idx] && panels[idx].querySelector("input, .chip[tabindex='0'], button");
    if (first && idx !== TOTAL - 1) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
  }

  nextBtn.addEventListener("click", function () {
    if (current < TOTAL - 1) {
      if (!validateStep(current)) {
        toast("Please fix the highlighted fields");
        var firstErr = panels[current].querySelector(".has-error input");
        if (firstErr) firstErr.focus();
        return;
      }
      goTo(current + 1);
    } else {
      finish();
    }
  });

  backBtn.addEventListener("click", function () {
    if (current > 0) goTo(current - 1);
  });

  skipBtn.addEventListener("click", function () {
    state.invites = [];
    renderInvites();
    goTo(current + 1);
    toast("Skipped invites — you can add people later");
  });

  // Enter advances (except inside invite/textarea handled separately)
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id !== "inviteEmail" && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      nextBtn.click();
    }
  });

  /* ---------- Finish + confetti ---------- */
  function finish() {
    panels.forEach(function (p) { p.hidden = true; p.classList.remove("is-active"); });
    actions.hidden = true;
    donePanel.hidden = false;
    donePanel.classList.add("is-active");
    stepsEls.forEach(function (el) { el.classList.add("is-done"); el.classList.remove("is-active"); });
    progressFill.style.width = "100%";
    progressTrack.setAttribute("aria-valuenow", "100");
    progressLabel.textContent =
      wizard.getAttribute("data-progress") === "percent" ? "100% complete" : "Setup complete";
    var lead = document.getElementById("doneLead");
    var count = state.invites.length;
    lead.textContent =
      "“" + (state.workspace || "Your workspace") + "” is ready" +
      (count ? " and " + count + " invite" + (count > 1 ? "s are" : " is") + " on the way." : ". You can invite teammates anytime.");
    runConfetti();
    toast("Workspace created successfully");
  }

  document.getElementById("goDashboard").addEventListener("click", function () {
    toast("Opening dashboard…");
  });
  document.getElementById("restart").addEventListener("click", function () {
    // reset state
    state = { fullName: "", email: "", password: "", workspace: "", slug: "", teamSize: "", invites: [] };
    form.reset();
    delete slugEl.dataset.touched;
    chips.forEach(function (c) { c.setAttribute("aria-checked", "false"); });
    renderInvites();
    Array.prototype.slice.call(document.querySelectorAll(".has-error")).forEach(function (f) { f.classList.remove("has-error"); });
    donePanel.hidden = true;
    donePanel.classList.remove("is-active");
    actions.hidden = false;
    goTo(0);
    toast("Wizard reset");
  });

  /* ---------- Confetti (vanilla canvas) ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas.getContext("2d");
  var pieces = [];
  var rafId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function runConfetti() {
    var colors = ["#5b5bf0", "#00b4a6", "#d98a2b", "#2f9e6f", "#4646d6", "#d4503e"];
    pieces = [];
    for (var i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.4,
        w: 6 + Math.random() * 7,
        h: 8 + Math.random() * 8,
        color: colors[(Math.random() * colors.length) | 0],
        vy: 2 + Math.random() * 3.5,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        vr: -0.12 + Math.random() * 0.24,
        life: 1,
      });
    }
    if (rafId) cancelAnimationFrame(rafId);
    var start = performance.now();
    (function tick(now) {
      var elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        if (elapsed > 2600) p.life -= 0.02;
        if (p.y < canvas.height + 40 && p.life > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) rafId = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(start);
  }

  /* ---------- Global Esc (clear focus from overlays / inputs) ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  });

  /* ---------- Init ---------- */
  goTo(0);
})();
