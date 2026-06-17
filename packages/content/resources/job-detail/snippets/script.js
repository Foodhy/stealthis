(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- Save toggle (header + sticky bar stay in sync) ---------- */
  var saved = false;
  var saveBtn = document.getElementById("saveBtn");
  var saveBtnBar = document.getElementById("saveBtnBar");

  function renderSave() {
    [saveBtn, saveBtnBar].forEach(function (b) {
      if (!b) return;
      b.classList.toggle("is-saved", saved);
      b.setAttribute("aria-pressed", String(saved));
      var label = b.querySelector(".btn__label");
      if (label) label.textContent = saved ? "Saved" : "Save";
    });
  }

  function toggleSave() {
    saved = !saved;
    renderSave();
    toast(saved ? "Saved to your jobs" : "Removed from saved jobs");
  }

  if (saveBtn) saveBtn.addEventListener("click", toggleSave);
  if (saveBtnBar) saveBtnBar.addEventListener("click", toggleSave);

  /* ---------- Apply ---------- */
  var applicants = 42;
  var applied = false;
  function apply() {
    if (applied) {
      toast("You've already applied to this role");
      return;
    }
    applied = true;
    applicants += 1;
    document.querySelectorAll("#applyBtn, #applyBtnBar").forEach(function (b) {
      b.textContent = "Applied ✓";
      b.disabled = true;
      b.style.opacity = "0.85";
      b.style.cursor = "default";
    });
    var ap = document.querySelector(".applicants");
    if (ap) ap.lastChild.textContent = " " + applicants + " applicants";
    toast("Application sent to Northwind Labs");
  }
  ["applyBtn", "applyBtnBar"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", apply);
  });

  /* ---------- Share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: "Senior Product Designer — Northwind Labs",
        text: "Check out this role at Northwind Labs",
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(
          function () { toast("Job link copied to clipboard"); },
          function () { toast("Could not copy link"); }
        );
      } else {
        toast("Sharing not supported here");
      }
    });
  }

  /* ---------- Expand company ---------- */
  var companyToggle = document.getElementById("companyToggle");
  var companyMore = document.getElementById("companyMore");
  if (companyToggle && companyMore) {
    companyToggle.addEventListener("click", function () {
      var open = companyMore.hasAttribute("hidden");
      if (open) {
        companyMore.removeAttribute("hidden");
        companyToggle.textContent = "Show less";
      } else {
        companyMore.setAttribute("hidden", "");
        companyToggle.textContent = "Expand company";
      }
      companyToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Save toggles on similar jobs ---------- */
  document.querySelectorAll("[data-save-row]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      var name = (btn.getAttribute("aria-label") || "Job").replace(/^Save\s+/, "");
      toast(on ? "Removed " + name : "Saved " + name);
    });
  });

  /* ---------- Sticky apply bar shows after header scrolls away ---------- */
  var applybar = document.getElementById("applybar");
  var jobhead = document.getElementById("applyBtn");
  if (applybar && jobhead && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var show = !e.isIntersecting && e.boundingClientRect.top < 0;
          applybar.classList.toggle("is-visible", show);
          applybar.setAttribute("aria-hidden", String(!show));
        });
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    io.observe(jobhead);
  } else if (applybar) {
    // Fallback: simple scroll threshold
    window.addEventListener("scroll", function () {
      var show = window.scrollY > 320;
      applybar.classList.toggle("is-visible", show);
      applybar.setAttribute("aria-hidden", String(!show));
    });
  }
})();
