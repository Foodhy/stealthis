(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- toast helper ---------- */
  var toastWrap = $("[data-toast-wrap]");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------- doc config ---------- */
  var DOCS = {
    passport: { label: "passport", sides: [{ key: "main", title: "Photo page", hint: "the page with your photo" }] },
    license: { label: "driver's licence", sides: [
      { key: "front", title: "Front side", hint: "the side with your photo" },
      { key: "back", title: "Back side", hint: "the side with the barcode" }
    ] },
    idcard: { label: "national ID", sides: [
      { key: "front", title: "Front side", hint: "the side with your photo" },
      { key: "back", title: "Back side", hint: "the reverse with the MRZ" }
    ] }
  };

  var state = { doc: "passport", uploads: {}, scanRunning: false };

  /* ---------- stepper ---------- */
  var stepEls = $$(".step");
  var panels = $$(".panel");
  var current = 0;

  function goto(idx) {
    current = idx;
    panels.forEach(function (p) {
      var on = Number(p.getAttribute("data-panel")) === idx;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    stepEls.forEach(function (s, i) {
      s.classList.toggle("is-active", i === idx);
      s.classList.toggle("is-done", i < idx);
    });
    var card = $(".card");
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------- panel 0: doc selection ---------- */
  $$(".doc").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".doc").forEach(function (b) { b.setAttribute("aria-checked", "false"); });
      btn.setAttribute("aria-checked", "true");
      state.doc = btn.getAttribute("data-doc");
    });
  });

  /* ---------- panel 1: build drop zones ---------- */
  var dropsHost = $("[data-drops]");
  var uploadNextBtn = $("[data-upload-next]");
  var docLabel = $("[data-doc-label]");

  function svgUpload() {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg>';
  }
  function svgTrash() {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';
  }

  function buildUploads() {
    var cfg = DOCS[state.doc];
    docLabel.textContent = cfg.label;
    dropsHost.innerHTML = "";
    state.uploads = {};
    cfg.sides.forEach(function (side) {
      var drop = document.createElement("button");
      drop.type = "button";
      drop.className = "drop";
      drop.setAttribute("data-side", side.key);
      drop.setAttribute("aria-label", "Upload " + side.title);
      drop.innerHTML =
        '<span class="drop__ico" aria-hidden="true">' + svgUpload() + "</span>" +
        '<span class="drop__title">' + side.title + "</span>" +
        '<span class="drop__hint"><b>Click to upload</b> or drag a file here</span>';
      dropsHost.appendChild(drop);
      wireDrop(drop, side);
    });
    refreshUploadNext();
  }

  function refreshUploadNext() {
    var cfg = DOCS[state.doc];
    var done = cfg.sides.every(function (s) { return state.uploads[s.key] === "done"; });
    uploadNextBtn.disabled = !done;
  }

  function wireDrop(drop, side) {
    function start() {
      if (drop.classList.contains("is-uploading") || drop.classList.contains("is-filled")) return;
      simulateUpload(drop, side);
    }
    drop.addEventListener("click", function (e) {
      if (e.target.closest("[data-del]")) return;
      start();
    });
    drop.addEventListener("dragover", function (e) { e.preventDefault(); drop.classList.add("is-over"); });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      drop.classList.remove("is-over");
      start();
    });
  }

  var SAMPLE_NAMES = { main: "passport-photo.jpg", front: "id-front.jpg", back: "id-back.jpg" };

  function simulateUpload(drop, side) {
    state.uploads[side.key] = "uploading";
    drop.classList.add("is-filled", "is-uploading");
    var fname = SAMPLE_NAMES[side.key] || "document.jpg";
    var kb = (820 + Math.floor(Math.random() * 600));
    drop.innerHTML =
      '<div class="preview">' +
        '<span class="preview__thumb" aria-hidden="true"></span>' +
        '<span class="preview__name">' + fname + "</span>" +
        '<span class="preview__meta"><span data-pct>Uploading… 0%</span> · ' + kb + " KB</span>" +
        '<button class="preview__del" type="button" data-del aria-label="Remove file">' + svgTrash() + "</button>" +
        '<span class="preview__bar"><i data-fill></i></span>' +
      "</div>";

    var fill = $("[data-fill]", drop);
    var pct = $("[data-pct]", drop);
    var del = $("[data-del]", drop);
    del.addEventListener("click", function (e) {
      e.stopPropagation();
      resetDrop(drop, side);
    });

    var p = 0;
    var iv = setInterval(function () {
      p += 8 + Math.floor(Math.random() * 14);
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        fill.style.width = "100%";
        pct.textContent = "Uploaded";
        drop.classList.remove("is-uploading");
        finishUpload(drop, side, fname, kb);
        return;
      }
      fill.style.width = p + "%";
      pct.textContent = "Uploading… " + p + "%";
    }, 120);
  }

  function finishUpload(drop, side, fname, kb) {
    state.uploads[side.key] = "done";
    var meta = $(".preview__meta", drop);
    meta.innerHTML = '<span class="pill pill--ok">Sharp &amp; readable</span> · ' + kb + " KB";
    refreshUploadNext();
    toast(side.title + " uploaded", "ok");
  }

  function resetDrop(drop, side) {
    delete state.uploads[side.key];
    drop.classList.remove("is-filled", "is-uploading");
    drop.innerHTML =
      '<span class="drop__ico" aria-hidden="true">' + svgUpload() + "</span>" +
      '<span class="drop__title">' + side.title + "</span>" +
      '<span class="drop__hint"><b>Click to upload</b> or drag a file here</span>';
    refreshUploadNext();
    toast(side.title + " removed", "warn");
  }

  /* ---------- panel 2: liveness ---------- */
  var selfieStage = $("[data-selfie]");
  var selfieHint = $("[data-selfie-hint]");
  var selfieStartBtn = $("[data-selfie-start]");
  var livenessItems = $$("[data-liveness] li");

  function resetLiveness() {
    selfieStage.classList.remove("is-active", "is-ok");
    selfieHint.textContent = "Center your face, then hold still";
    livenessItems.forEach(function (li) { li.classList.remove("is-done"); });
    selfieStartBtn.disabled = false;
    selfieStartBtn.textContent = "Start liveness check";
  }

  selfieStartBtn.addEventListener("click", function () {
    if (selfieStage.classList.contains("is-ok")) { goto(3); runScan(); return; }
    selfieStartBtn.disabled = true;
    selfieStage.classList.add("is-active");
    selfieHint.textContent = "Scanning…";
    var steps = [
      { i: 0, hint: "Hold still…" },
      { i: 1, hint: "Now blink" },
      { i: 2, hint: "Turn your head slightly" }
    ];
    var n = 0;
    function step() {
      if (n >= steps.length) {
        selfieStage.classList.remove("is-active");
        selfieStage.classList.add("is-ok");
        selfieHint.textContent = "Liveness confirmed";
        selfieStartBtn.disabled = false;
        selfieStartBtn.textContent = "Continue";
        toast("Liveness confirmed", "ok");
        return;
      }
      var s = steps[n];
      selfieHint.textContent = s.hint;
      setTimeout(function () {
        livenessItems[s.i].classList.add("is-done");
        n++;
        step();
      }, 850);
    }
    step();
  });

  /* ---------- panel 3: scan + result ---------- */
  var scanEl = $("[data-scan]");
  var scanStatus = $("[data-scan-status]");
  var scanBar = $("[data-scan-bar]");
  var scanTasks = $$("[data-scan-list] li");
  var resultEl = $("[data-result]");
  var resultBadge = $("[data-result-badge]");
  var resultTitle = $("[data-result-title]");
  var resultSub = $("[data-result-sub]");
  var factScore = $("[data-fact-score]");
  var factRef = $("[data-fact-ref]");
  var factDoc = $("[data-fact-doc]");

  var DOC_NAMES = { passport: "Passport", license: "Driver's licence", idcard: "National ID" };

  function runScan() {
    if (state.scanRunning) return;
    state.scanRunning = true;
    scanEl.hidden = false;
    resultEl.hidden = true;
    scanEl.classList.remove("is-done");
    scanBar.style.width = "0%";
    scanStatus.textContent = "Matching document to selfie…";
    scanTasks.forEach(function (t) { t.classList.remove("is-busy", "is-done"); });

    var phases = [
      { p: 34, status: "Reading document data…", task: 0 },
      { p: 68, status: "Comparing facial biometrics…", task: 1 },
      { p: 100, status: "Running sanctions & PEP screening…", task: 2 }
    ];
    var idx = 0;
    scanTasks[0].classList.add("is-busy");

    function next() {
      if (idx >= phases.length) { setTimeout(finishScan, 500); return; }
      var ph = phases[idx];
      scanStatus.textContent = ph.status;
      scanBar.style.width = ph.p + "%";
      setTimeout(function () {
        scanTasks[ph.task].classList.remove("is-busy");
        scanTasks[ph.task].classList.add("is-done");
        if (idx + 1 < phases.length) scanTasks[phases[idx + 1].task].classList.add("is-busy");
        idx++;
        next();
      }, 1050);
    }
    next();
  }

  function finishScan() {
    scanEl.classList.add("is-done");
    state.scanRunning = false;
    // Demo: ~85% verified, otherwise needs review.
    var pass = Math.random() > 0.15;
    factDoc.textContent = DOC_NAMES[state.doc] || "Document";
    factRef.textContent = "NB-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    if (pass) {
      var score = 94 + Math.floor(Math.random() * 6);
      resultBadge.classList.remove("is-fail");
      resultBadge.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
      resultTitle.textContent = "You're verified";
      resultSub.textContent = "Welcome, Mara Velasquez. Your identity matches the documents provided.";
      factScore.className = "pill pill--ok";
      factScore.textContent = score + "% match";
      toast("Identity verified", "ok");
    } else {
      resultBadge.classList.add("is-fail");
      resultBadge.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      resultTitle.textContent = "We need another look";
      resultSub.textContent = "The selfie didn't clearly match your document. Retake your photos in better light and try again.";
      factScore.className = "pill pill--pending";
      factScore.textContent = "62% match";
      toast("Verification needs review", "err");
    }
    resultEl.hidden = false;
  }

  /* ---------- nav buttons ---------- */
  $$("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (current === 0) { buildUploads(); goto(1); }
      else if (current === 1) { resetLiveness(); goto(2); }
    });
  });
  $$("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () { if (current > 0) goto(current - 1); });
  });

  $("[data-restart]").addEventListener("click", function () {
    state.uploads = {};
    resetLiveness();
    goto(0);
    toast("Starting over", "warn");
  });
  $("[data-done]").addEventListener("click", function () {
    toast("Redirecting to your dashboard…", "ok");
  });

  goto(0);
})();
