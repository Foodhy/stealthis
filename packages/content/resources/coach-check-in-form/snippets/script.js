(function () {
  "use strict";

  var form = document.getElementById("checkin");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- SLIDERS ---------- */
  function verdictFor(v) {
    if (v <= 3) return { cls: "low", label: "Low" };
    if (v <= 6) return { cls: "mid", label: "OK" };
    return { cls: "high", label: "Strong" };
  }

  function paintSlider(input) {
    var min = +input.min, max = +input.max, val = +input.value;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
    var key = input.id;
    var out = document.querySelector('[data-out="' + key + '"]');
    var vEl = document.querySelector('[data-verdict="' + key + '"]');
    if (out) out.textContent = val;
    if (vEl) {
      var vd = verdictFor(val);
      vEl.textContent = vd.label;
      vEl.className = "verdict " + vd.cls;
    }
  }

  var sliders = Array.prototype.slice.call(document.querySelectorAll('input[type="range"]'));
  sliders.forEach(function (s) {
    paintSlider(s);
    s.addEventListener("input", function () { paintSlider(s); });
  });

  /* ---------- HUNGER CHIPS ---------- */
  var hunger = "Manageable";
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("is-on");
      chip.setAttribute("aria-pressed", "true");
      hunger = chip.getAttribute("data-hunger");
    });
  });

  /* ---------- PHOTOS ---------- */
  var drop = document.getElementById("drop");
  var fileInput = document.getElementById("files");
  var thumbs = document.getElementById("thumbs");
  var countEl = document.getElementById("photo-count");
  var photos = [];
  var TAGS = ["Front", "Side", "Back", "Extra"];

  function renderPhotos() {
    thumbs.innerHTML = "";
    photos.forEach(function (p, i) {
      var t = document.createElement("div");
      t.className = "thumb";
      var img = document.createElement("img");
      img.src = p.url;
      img.alt = "Progress photo " + (i + 1);
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = TAGS[i] || "Extra";
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.innerHTML = "&times;";
      rm.setAttribute("aria-label", "Remove photo " + (i + 1));
      rm.addEventListener("click", function () {
        URL.revokeObjectURL(p.url);
        photos.splice(i, 1);
        renderPhotos();
      });
      t.appendChild(img);
      t.appendChild(tag);
      t.appendChild(rm);
      thumbs.appendChild(t);
    });
    countEl.textContent = photos.length + " added";
  }

  function addFiles(list) {
    var added = 0;
    Array.prototype.forEach.call(list, function (f) {
      if (!f.type || f.type.indexOf("image/") !== 0) return;
      if (photos.length >= 6) return;
      photos.push({ url: URL.createObjectURL(f), name: f.name });
      added++;
    });
    if (added) { renderPhotos(); toast(added + " photo" + (added > 1 ? "s" : "") + " added"); }
  }

  drop.addEventListener("click", function () { fileInput.click(); });
  drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", function () { addFiles(fileInput.files); fileInput.value = ""; });

  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); });
  });
  drop.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  /* ---------- NOTES CHAR COUNT ---------- */
  var notes = document.getElementById("notes");
  var charcount = document.getElementById("charcount");
  notes.addEventListener("input", function () { charcount.textContent = notes.value.length; });

  /* ---------- VALIDATION / GATING ---------- */
  var weight = document.getElementById("weight");
  var waist = document.getElementById("waist");
  var hips = document.getElementById("hips");
  var arm = document.getElementById("arm");
  var thigh = document.getElementById("thigh");
  var submitBtn = document.getElementById("submit");
  var hint = document.getElementById("hint");

  function hasMeasure() {
    return [waist, hips, arm, thigh].some(function (el) { return el.value.trim() !== "" && +el.value > 0; });
  }
  function weightOk() { return weight.value.trim() !== "" && +weight.value > 0; }

  function refreshGate() {
    var ok = weightOk() && hasMeasure();
    submitBtn.disabled = !ok;
    if (ok) {
      hint.textContent = "Ready — your coach is standing by.";
      hint.classList.add("ok");
    } else {
      hint.textContent = "Add weight + at least one measurement to unlock.";
      hint.classList.remove("ok");
    }
  }

  [weight, waist, hips, arm, thigh].forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("invalid");
      var errEl = document.querySelector('[data-err="' + el.id + '"]');
      if (errEl) errEl.textContent = "";
      refreshGate();
    });
  });
  refreshGate();

  /* ---------- SUBMIT ---------- */
  function verdictBadge(label, v) {
    var vd = verdictFor(v);
    return '<span class="verdict ' + vd.cls + '">' + label + " " + v + "/10 · " + vd.label + "</span>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = false;

    if (!weightOk()) {
      weight.classList.add("invalid");
      document.querySelector('[data-err="weight"]').textContent = "Enter this week's bodyweight.";
      bad = true;
    }
    if (!hasMeasure()) {
      waist.classList.add("invalid");
      document.querySelector('[data-err="waist"]').textContent = "Log at least one measurement.";
      bad = true;
    }
    if (bad) {
      toast("Fill the required fields first");
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }

    var e2 = +document.getElementById("energy").value;
    var s2 = +document.getElementById("sleep").value;
    var a2 = +document.getElementById("adherence").value;
    var avg = ((e2 + s2 + a2) / 3);

    function stat(k, v, unit) {
      return '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v +
        (unit ? ' <small>' + unit + "</small>" : "") + "</div></div>";
    }

    var statsHtml =
      stat("Weight", weight.value, "kg") +
      (waist.value ? stat("Waist", waist.value, "cm") : "") +
      (hips.value ? stat("Hips", hips.value, "cm") : "") +
      (arm.value ? stat("Arm", arm.value, "cm") : "") +
      (thigh.value ? stat("Thigh", thigh.value, "cm") : "") +
      stat("Hunger", hunger, "");

    var streakMsg;
    if (avg >= 8) streakMsg = "Elite week. Locked in — keep this exact momentum rolling.";
    else if (avg >= 5.5) streakMsg = "Solid week. Small tweaks and you'll break through the plateau.";
    else streakMsg = "Tough week — that's the job. Coach Nadia will adjust your plan.";

    var summary = document.getElementById("summary");
    summary.innerHTML =
      '<div class="sum-head">' +
        '<div class="sum-check" aria-hidden="true">✓</div>' +
        "<div><h2>Check-In Logged</h2><p>Week 07 · Cut Phase · sent to Nadia Reyes</p></div>" +
      "</div>" +
      '<div class="sum-stats">' + statsHtml + "</div>" +
      '<div class="sum-verdicts">' +
        verdictBadge("Energy", e2) + verdictBadge("Sleep", s2) + verdictBadge("Adherence", a2) +
      "</div>" +
      '<div class="streak"><span class="fire" aria-hidden="true">🔥</span><span>' +
        photos.length + " progress photo" + (photos.length === 1 ? "" : "s") + " attached — " + streakMsg +
      "</span></div>" +
      (notes.value.trim() ? '<p class="sum-notes">“' + escapeHtml(notes.value.trim()) + "”</p>" : "");

    summary.hidden = false;
    toast("Check-in submitted 💪");
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
