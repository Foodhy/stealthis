(function () {
  "use strict";

  var STORE_KEY = "northwind.onboarding.v1";
  var TOTAL = 4; // four real steps
  var AVATAR_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  /* ---------- state ---------- */
  var defaults = {
    step: 0,
    theme: "light",
    workspace: { name: "", slug: "", use: "" },
    invites: [],
    sources: [],
    accent: "#6366f1",
    density: "Comfortable",
    digest: true,
    finished: false
  };

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return clone(defaults);
      var parsed = JSON.parse(raw);
      return Object.assign(clone(defaults), parsed, {
        workspace: Object.assign(clone(defaults.workspace), parsed.workspace || {})
      });
    } catch (e) {
      return clone(defaults);
    }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- toast ---------- */
  var toastHost = document.getElementById("toastHost");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  /* ---------- element refs ---------- */
  var stagesEls = {};
  document.querySelectorAll(".stage").forEach(function (s) {
    stagesEls[s.getAttribute("data-stage")] = s;
  });
  var stepEls = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var ringFill = document.querySelector(".ring-fill");
  var ringPct = document.getElementById("ringPct");
  var eyebrow = document.getElementById("eyebrow");
  var foot = document.getElementById("panelFoot");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var skipBtn = document.getElementById("skipBtn");
  var RING_CIRC = 2 * Math.PI * 52; // ~326.7

  /* ---------- progress ---------- */
  function stepDone(i) {
    if (i === 0) return !!(state.workspace.name && state.workspace.slug && state.workspace.use);
    if (i === 1) return state.invites.length > 0;
    if (i === 2) return state.sources.length > 0;
    if (i === 3) return !!(state.accent && state.density);
    return false;
  }
  function completedCount() {
    var n = 0;
    for (var i = 0; i < TOTAL; i++) if (stepDone(i)) n++;
    return n;
  }

  function renderProgress() {
    var pct = Math.round((completedCount() / TOTAL) * 100);
    ringPct.textContent = pct + "%";
    ringFill.style.strokeDashoffset = RING_CIRC * (1 - pct / 100);

    stepEls.forEach(function (el, i) {
      el.classList.toggle("complete", stepDone(i));
      el.classList.toggle("active", state.step === i && !state.finished);
      if (state.step === i && !state.finished) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
  }

  /* ---------- navigation ---------- */
  function showStage(key) {
    Object.keys(stagesEls).forEach(function (k) {
      stagesEls[k].hidden = k !== String(key);
    });
    // re-trigger entry animation
    var active = stagesEls[String(key)];
    if (active) { active.style.animation = "none"; void active.offsetWidth; active.style.animation = ""; }
  }

  function goTo(i) {
    state.step = i;
    state.finished = false;
    showStage(i);
    eyebrow.textContent = "Step " + (i + 1) + " of " + TOTAL;
    foot.hidden = false;
    backBtn.disabled = i === 0;
    nextBtn.textContent = i === TOTAL - 1 ? "Finish setup" : "Continue";
    skipBtn.hidden = false;
    save();
    renderProgress();
    var input = stagesEls[i].querySelector("input");
    if (input) try { input.focus({ preventScroll: true }); } catch (e) {}
  }

  function finish() {
    state.finished = true;
    state.step = TOTAL;
    showStage("done");
    eyebrow.textContent = "All done";
    foot.hidden = true;
    save();
    renderProgress();
    buildSummary();
    launchConfetti();
    toast("Setup complete — welcome aboard! 🎉");
  }

  /* ---------- validation ---------- */
  function setError(stageEl, name, msg) {
    var slot = stageEl.querySelector('[data-err="' + name + '"]');
    var input = stageEl.querySelector("#" + name) || stageEl.querySelector('[name="' + name + '"]');
    if (slot) slot.textContent = msg || "";
    if (input) {
      if (msg) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function validateStep(i) {
    if (i === 0) {
      var ok = true;
      var s0 = stagesEls[0];
      if (!state.workspace.name.trim()) { setError(s0, "wsName", "Give your workspace a name."); ok = false; }
      else setError(s0, "wsName", "");
      if (!state.workspace.slug.trim()) { setError(s0, "wsSlug", "Pick a URL for your workspace."); ok = false; }
      else setError(s0, "wsSlug", "");
      if (!state.workspace.use) { ok = false; toast("Tell us what you'll use Northwind for."); }
      return ok;
    }
    if (i === 1) return state.invites.length > 0;
    if (i === 2) return state.sources.length > 0;
    if (i === 3) return true;
    return true;
  }

  /* ---------- STEP 0: workspace ---------- */
  var wsName = document.getElementById("wsName");
  var wsSlug = document.getElementById("wsSlug");
  var slugEdited = !!state.workspace.slug;

  function slugify(v) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  }

  wsName.value = state.workspace.name;
  wsSlug.value = state.workspace.slug;

  wsName.addEventListener("input", function () {
    state.workspace.name = wsName.value;
    if (!slugEdited) { wsSlug.value = slugify(wsName.value); state.workspace.slug = wsSlug.value; }
    if (wsName.value.trim()) setError(stagesEls[0], "wsName", "");
    save(); renderProgress();
  });
  wsSlug.addEventListener("input", function () {
    slugEdited = true;
    wsSlug.value = slugify(wsSlug.value);
    state.workspace.slug = wsSlug.value;
    if (wsSlug.value.trim()) setError(stagesEls[0], "wsSlug", "");
    save(); renderProgress();
  });

  document.querySelectorAll("[data-use]").forEach(function (btn) {
    if (btn.getAttribute("data-use") === state.workspace.use) {
      btn.setAttribute("aria-checked", "true");
    }
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-use]").forEach(function (b) { b.setAttribute("aria-checked", "false"); });
      btn.setAttribute("aria-checked", "true");
      state.workspace.use = btn.getAttribute("data-use");
      save(); renderProgress();
    });
  });

  /* ---------- STEP 1: invites ---------- */
  var inviteForm = document.getElementById("form1");
  var inviteEmail = document.getElementById("inviteEmail");
  var inviteList = document.getElementById("inviteList");
  var inviteEmpty = document.getElementById("inviteEmpty");

  function emailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function initials(email) {
    var name = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    var parts = name.split(" ").filter(Boolean);
    var s = (parts[0] ? parts[0][0] : email[0]) + (parts[1] ? parts[1][0] : "");
    return s.toUpperCase();
  }
  function colorFor(email) {
    var h = 0;
    for (var i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }

  function renderInvites() {
    inviteList.innerHTML = "";
    state.invites.forEach(function (email, idx) {
      var li = document.createElement("li");
      li.className = "invite-item";
      var av = document.createElement("span");
      av.className = "av";
      av.style.background = colorFor(email);
      av.textContent = initials(email);
      var meta = document.createElement("span");
      meta.className = "em";
      meta.textContent = email;
      var role = document.createElement("span");
      role.className = "role";
      role.textContent = idx === 0 ? "Admin" : "Member";
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.setAttribute("aria-label", "Remove " + email);
      rm.textContent = "×";
      rm.addEventListener("click", function () {
        state.invites.splice(idx, 1);
        save(); renderInvites(); renderProgress();
        toast("Removed " + email);
      });
      li.appendChild(av);
      li.appendChild(meta);
      li.appendChild(role);
      li.appendChild(rm);
      inviteList.appendChild(li);
    });
    inviteEmpty.hidden = state.invites.length > 0;
  }

  inviteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = inviteEmail.value.trim().toLowerCase();
    if (!emailValid(v)) { setError(stagesEls[1], "inviteEmail", "Enter a valid email address."); return; }
    if (state.invites.indexOf(v) !== -1) { setError(stagesEls[1], "inviteEmail", "That teammate is already invited."); return; }
    setError(stagesEls[1], "inviteEmail", "");
    state.invites.push(v);
    inviteEmail.value = "";
    save(); renderInvites(); renderProgress();
    toast("Invite queued for " + v);
    inviteEmail.focus();
  });
  inviteEmail.addEventListener("input", function () {
    if (emailValid(inviteEmail.value.trim())) setError(stagesEls[1], "inviteEmail", "");
  });

  /* ---------- STEP 2: sources ---------- */
  document.querySelectorAll(".source").forEach(function (btn) {
    var name = btn.getAttribute("data-source");
    function sync() {
      var on = state.sources.indexOf(name) !== -1;
      btn.classList.toggle("connected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.querySelector(".src-state").textContent = on ? "Connected" : "Connect";
    }
    btn.setAttribute("aria-pressed", "false");
    sync();
    btn.addEventListener("click", function () {
      var i = state.sources.indexOf(name);
      if (i === -1) { state.sources.push(name); toast(name + " connected"); }
      else { state.sources.splice(i, 1); toast(name + " disconnected"); }
      save(); sync(); renderProgress();
    });
  });

  /* ---------- STEP 3: customize ---------- */
  function applyAccent(hex) {
    document.documentElement.style.setProperty("--brand", hex);
    document.documentElement.style.setProperty("--brand-d", shade(hex, -16));
  }
  function shade(hex, pct) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = (pct + 100) / 100;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  document.querySelectorAll("[data-accent]").forEach(function (sw) {
    if (sw.getAttribute("data-accent") === state.accent) sw.setAttribute("aria-checked", "true");
    sw.addEventListener("click", function () {
      document.querySelectorAll("[data-accent]").forEach(function (s) { s.setAttribute("aria-checked", "false"); });
      sw.setAttribute("aria-checked", "true");
      state.accent = sw.getAttribute("data-accent");
      applyAccent(state.accent);
      save(); renderProgress();
    });
  });

  document.querySelectorAll("[data-density]").forEach(function (btn) {
    if (btn.getAttribute("data-density") === state.density) btn.setAttribute("aria-checked", "true");
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-density]").forEach(function (b) { b.setAttribute("aria-checked", "false"); });
      btn.setAttribute("aria-checked", "true");
      state.density = btn.getAttribute("data-density");
      save(); renderProgress();
    });
  });

  var digest = document.getElementById("weeklyDigest");
  digest.checked = state.digest;
  digest.addEventListener("change", function () {
    state.digest = digest.checked;
    save();
    toast(digest.checked ? "Weekly digest on" : "Weekly digest off");
  });

  /* ---------- keyboard nav for radio-style groups ---------- */
  document.querySelectorAll('[role="radiogroup"]').forEach(function (group) {
    group.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var items = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
      var idx = items.indexOf(document.activeElement);
      if (idx === -1) idx = 0;
      var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      var next = (idx + dir + items.length) % items.length;
      e.preventDefault();
      items[next].focus();
      items[next].click();
    });
  });

  /* ---------- footer buttons ---------- */
  backBtn.addEventListener("click", function () { if (state.step > 0) goTo(state.step - 1); });

  nextBtn.addEventListener("click", function () {
    if (!validateStep(state.step)) return;
    if (state.step < TOTAL - 1) goTo(state.step + 1);
    else finish();
  });

  skipBtn.addEventListener("click", function () {
    if (state.step < TOTAL - 1) { toast("Skipped — you can finish this later"); goTo(state.step + 1); }
    else finish();
  });

  /* ---------- step rail clicks ---------- */
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-go"), 10)); });
  });

  /* ---------- enter key advances on text steps ---------- */
  document.getElementById("form0").addEventListener("submit", function (e) { e.preventDefault(); nextBtn.click(); });
  document.getElementById("form3").addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---------- theme ---------- */
  var themeToggle = document.getElementById("themeToggle");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeToggle.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
  }
  themeToggle.addEventListener("click", function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(state.theme);
    save();
  });

  /* ---------- reset ---------- */
  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!window.confirm("Reset all onboarding progress?")) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    state = clone(defaults);
    location.reload();
  });

  /* ---------- done: summary + confetti ---------- */
  function buildSummary() {
    var bits = [];
    bits.push("“" + (state.workspace.name || "Your workspace") + "” is live");
    bits.push(state.invites.length + " teammate" + (state.invites.length === 1 ? "" : "s") + " invited");
    bits.push(state.sources.length + " data source" + (state.sources.length === 1 ? "" : "s") + " connected");
    document.getElementById("doneSummary").textContent = bits.join(" · ") + ".";
  }

  function launchConfetti() {
    var host = document.getElementById("confetti");
    if (!host) return;
    host.innerHTML = "";
    var colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    for (var i = 0; i < 60; i++) {
      var c = document.createElement("i");
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
      c.style.animationDelay = (Math.random() * 0.4) + "s";
      c.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      host.appendChild(c);
    }
    setTimeout(function () { host.innerHTML = ""; }, 4000);
  }

  document.getElementById("enterBtn").addEventListener("click", function () {
    toast("Opening your dashboard…");
  });

  /* ---------- boot ---------- */
  applyTheme(state.theme);
  applyAccent(state.accent);
  renderInvites();
  if (state.finished) {
    showStage("done");
    eyebrow.textContent = "All done";
    foot.hidden = true;
    buildSummary();
  } else {
    goTo(Math.min(state.step, TOTAL - 1));
  }
  renderProgress();
})();
