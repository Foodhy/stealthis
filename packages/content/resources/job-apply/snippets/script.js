(function () {
  "use strict";

  var form = document.getElementById("applyForm");
  var panels = Array.prototype.slice.call(form.querySelectorAll(".panel"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var current = 0;

  /* ---------- Toast ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  /* ---------- Panel navigation ---------- */
  function showPanel(i) {
    panels.forEach(function (p) {
      var idx = p.getAttribute("data-panel");
      p.hidden = String(i) !== idx;
    });
    steps.forEach(function (s, si) {
      s.classList.toggle("is-active", si === i);
      s.classList.toggle("is-done", si < i);
      var dot = s.querySelector(".step-dot");
      dot.textContent = si < i ? "✓" : String(si + 1);
    });
    current = i;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Validation ---------- */
  function setError(field, msg) {
    if (!field) return;
    field.classList.toggle("invalid", !!msg);
    var err = field.querySelector("[data-err]");
    if (err) err.textContent = msg || "";
  }

  function fieldOf(input) { return input.closest(".field"); }

  function validatePanel(i) {
    var panel = panels[i];
    var ok = true;
    var firstBad = null;

    // required text/email/tel/select
    panel.querySelectorAll("input[required], select[required], textarea[required]").forEach(function (input) {
      if (input.type === "radio" || input.type === "checkbox") return;
      var val = (input.value || "").trim();
      var msg = "";
      if (!val) msg = "This field is required.";
      else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = "Enter a valid email address.";
      setError(fieldOf(input), msg);
      if (msg) { ok = false; firstBad = firstBad || input; }
    });

    // required radio groups
    var seen = {};
    panel.querySelectorAll('input[type="radio"][required]').forEach(function (r) {
      if (seen[r.name]) return;
      seen[r.name] = true;
      var checked = panel.querySelector('input[name="' + r.name + '"]:checked');
      var fs = r.closest(".field");
      var err = fs ? fs.querySelector("[data-err]") : null;
      if (!checked) {
        ok = false; firstBad = firstBad || r;
        if (err) err.textContent = "Please choose an option.";
      } else if (err) err.textContent = "";
    });

    if (!ok && firstBad) {
      toast("Please fix the highlighted fields.", "warn");
      firstBad.focus();
    }
    return ok;
  }

  /* ---------- Buttons ---------- */
  form.addEventListener("click", function (e) {
    var nextBtn = e.target.closest("[data-next]");
    var prevBtn = e.target.closest("[data-prev]");
    if (nextBtn) {
      if (validatePanel(current)) {
        var to = current + 1;
        if (to === 3) buildReview();
        showPanel(to);
      }
    } else if (prevBtn) {
      showPanel(current - 1);
    }
  });

  /* ---------- Resume selection / upload ---------- */
  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var preview = document.getElementById("uploadPreview");
  var uploaded = null;

  function chosenResume() {
    if (uploaded) return uploaded.name;
    var picked = form.querySelector('input[name="resumePick"]:checked');
    return picked ? picked.value : "—";
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function acceptFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast("File is larger than 5 MB.", "warn"); return; }
    if (!/\.(pdf|docx?|DOC)$/i.test(file.name)) { toast("Use a PDF, DOC or DOCX file.", "warn"); return; }
    uploaded = file;
    preview.hidden = false;
    preview.innerHTML =
      '<span class="resume-ic" aria-hidden="true">NEW</span>' +
      '<span class="up-info"><strong>' + escapeHtml(file.name) + "</strong>" +
      '<span class="muted">' + fmtSize(file.size) + " · just now</span></span>" +
      '<button type="button" class="up-remove" id="upRemove">Remove</button>';
    // deselect saved resumes
    form.querySelectorAll('input[name="resumePick"]').forEach(function (r) { r.checked = false; });
    toast("Resume attached.", "ok");
    document.getElementById("upRemove").addEventListener("click", function () {
      uploaded = null; preview.hidden = true; preview.innerHTML = "";
      var first = form.querySelector('input[name="resumePick"]');
      if (first) first.checked = true;
    });
  }

  dropzone.addEventListener("click", function () { fileInput.click(); });
  dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", function () { acceptFile(fileInput.files[0]); });
  ["dragover", "dragenter"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("drag"); });
  });
  dropzone.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) acceptFile(e.dataTransfer.files[0]);
  });

  /* ---------- Cover letter counter ---------- */
  var cover = document.getElementById("cover");
  var coverCount = document.getElementById("coverCount");
  cover.addEventListener("input", function () { coverCount.textContent = cover.value.length; });

  /* clear field errors on input */
  form.addEventListener("input", function (e) {
    var f = e.target.closest(".field");
    if (f && f.classList.contains("invalid")) setError(f, "");
  });

  /* ---------- Review builder ---------- */
  function val(id) { var el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }
  function radioVal(name) {
    var r = form.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : "—";
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"; }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function row(k, v) {
    return '<div class="review-row"><span>' + k + "</span><span>" + escapeHtml(v || "—") + "</span></div>";
  }

  function buildReview() {
    var rl = document.getElementById("reviewList");
    var coverTxt = val("cover");
    rl.innerHTML =
      group("Resume", 0,
        row("Resume", chosenResume()) +
        row("Portfolio", val("portfolio") || "Not provided")) +
      group("Contact", 1,
        row("Name", val("firstName") + " " + val("lastName")) +
        row("Email", val("email")) +
        row("Phone", val("phone")) +
        row("Location", val("location"))) +
      group("Screening", 2,
        row("Work authorized", cap(radioVal("workAuth"))) +
        row("Needs sponsorship", cap(radioVal("sponsor"))) +
        row("Experience", val("experience")) +
        row("Start date", val("start")) +
        row("Cover letter", coverTxt ? coverTxt.length + " characters" : "Not provided"));

    rl.querySelectorAll(".review-edit").forEach(function (b) {
      b.addEventListener("click", function () { showPanel(parseInt(b.getAttribute("data-go"), 10)); });
    });
  }

  function group(title, goTo, rows) {
    return '<div class="review-group"><div class="review-h"><h4>' + title +
      '</h4><button type="button" class="review-edit" data-go="' + goTo + '">Edit</button></div>' +
      '<div class="review-rows">' + rows + "</div></div>";
  }

  /* ---------- Submit ---------- */
  var consentErr = document.getElementById("consentErr");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var consent = document.getElementById("consent");
    if (!consent.checked) {
      consentErr.textContent = "You must confirm before submitting.";
      consent.focus();
      toast("Please confirm the statement.", "warn");
      return;
    }
    consentErr.textContent = "";
    var btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Submitting…";
    setTimeout(function () {
      var ref = "NB-" + Math.floor(100000 + Math.random() * 899999);
      document.getElementById("refId").textContent = ref;
      steps.forEach(function (s) {
        s.classList.add("is-done");
        s.classList.remove("is-active");
        s.querySelector(".step-dot").textContent = "✓";
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== "done"; });
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Application submitted!", "ok");
    }, 1100);
  });

  document.getElementById("restartBtn").addEventListener("click", function () {
    form.reset();
    uploaded = null; preview.hidden = true; preview.innerHTML = "";
    coverCount.textContent = "0";
    var btn = document.getElementById("submitBtn");
    btn.disabled = false; btn.textContent = "Submit application";
    var first = form.querySelector('input[name="resumePick"]'); if (first) first.checked = true;
    showPanel(0);
  });

  /* ---------- Misc ---------- */
  document.getElementById("saveDraft").addEventListener("click", function () {
    toast("Draft saved to your profile.", "ok");
  });
  var bm = document.getElementById("bookmark");
  bm.addEventListener("click", function () {
    var on = bm.getAttribute("aria-pressed") === "true";
    bm.setAttribute("aria-pressed", String(!on));
    bm.querySelector("span").textContent = on ? "Save job" : "Saved";
    toast(on ? "Removed from saved jobs." : "Job saved.", on ? "" : "ok");
  });

  showPanel(0);
})();
