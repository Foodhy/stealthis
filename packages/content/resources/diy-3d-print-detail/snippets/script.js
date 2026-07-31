/* MakerForge — 3D print model page interactions (vanilla JS, illustrative data) */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* Generic data-toast buttons */
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.getAttribute("data-toast"));
    });
  });

  /* ---------- Gallery: thumbnail → main view ---------- */
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-thumb]"));
  var views = document.querySelectorAll(".gallery-view");
  var viewLabel = document.getElementById("viewLabel");

  function activateView(id) {
    var idx = 0;
    thumbs.forEach(function (t, i) {
      var on = t.getAttribute("data-thumb") === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      if (on) idx = i;
    });
    views.forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-view") === id);
    });
    var label = thumbs[idx].getAttribute("data-label");
    viewLabel.textContent = "VIEW " + (idx + 1) + "/" + thumbs.length + " — " + label;
  }

  thumbs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      activateView(t.getAttribute("data-thumb"));
    });
    t.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = thumbs[(i + 1) % thumbs.length];
      if (e.key === "ArrowLeft") next = thumbs[(i - 1 + thumbs.length) % thumbs.length];
      if (next) {
        e.preventDefault();
        next.focus();
        activateView(next.getAttribute("data-thumb"));
      }
    });
  });

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab[data-tab]"));
  var panels = document.querySelectorAll(".tabpanel");

  function activateTab(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    panels.forEach(function (p) {
      var on = p.id === "panel-" + id;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      activateTab(t.getAttribute("data-tab"));
    });
    t.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        next.focus();
        activateTab(next.getAttribute("data-tab"));
      }
    });
  });

  /* ---------- Download all: fake progress + toast ---------- */
  var dlBtn = document.getElementById("downloadBtn");
  var dlProgress = document.getElementById("dlProgress");
  var dlBar = document.getElementById("dlBar");
  var dlPct = document.getElementById("dlPct");
  var dlStat = document.querySelector('[data-stat="downloads"]');
  var downloading = false;

  dlBtn.addEventListener("click", function () {
    if (downloading) return;
    downloading = true;
    dlBtn.disabled = true;
    dlBtn.style.opacity = "0.7";
    dlProgress.hidden = false;
    var pct = 0;
    toast("Preparing MDL-4471 bundle… (illustrative)");

    var timer = setInterval(function () {
      pct += 4 + Math.random() * 9;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        dlBar.style.width = "100%";
        dlPct.textContent = "100%";
        toast("cable_organizer_clip_v2.3.zip — 6.3 MB downloaded");
        bumpStat(dlStat);
        setTimeout(function () {
          dlProgress.hidden = true;
          dlBar.style.width = "0%";
          dlPct.textContent = "0%";
          dlBtn.disabled = false;
          dlBtn.style.opacity = "";
          downloading = false;
        }, 1400);
        return;
      }
      dlBar.style.width = pct + "%";
      dlPct.textContent = Math.round(pct) + "%";
    }, 120);
  });

  function bumpStat(el, delta) {
    if (!el) return;
    var n = parseInt(el.textContent.replace(/[^\d]/g, ""), 10) + (delta === undefined ? 1 : delta);
    el.textContent = n.toLocaleString("en-US");
  }

  /* ---------- Per-file download buttons ---------- */
  document.querySelectorAll(".file-dl").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-file");
      btn.classList.add("is-done");
      btn.textContent = "✓";
      toast(name + " downloaded (illustrative)");
      setTimeout(function () {
        btn.classList.remove("is-done");
        btn.textContent = "↓";
      }, 2000);
    });
  });

  /* ---------- Like toggle ---------- */
  var likeBtn = document.querySelector("[data-like]");
  var likeCount = document.querySelector("[data-like-count]");
  var likeStat = document.querySelector('[data-stat="likes"]');

  likeBtn.addEventListener("click", function () {
    var on = likeBtn.getAttribute("aria-pressed") === "true";
    likeBtn.setAttribute("aria-pressed", String(!on));
    var delta = on ? -1 : 1;
    bumpStat(likeCount, delta);
    bumpStat(likeStat, delta);
    toast(on ? "Removed from your likes" : "Added to your likes ♥");
  });

  /* ---------- Collect toggle ---------- */
  var collectBtn = document.querySelector("[data-collect]");
  var collectLabel = document.querySelector("[data-collect-label]");

  collectBtn.addEventListener("click", function () {
    var on = collectBtn.getAttribute("aria-pressed") === "true";
    collectBtn.setAttribute("aria-pressed", String(!on));
    collectLabel.textContent = on ? "Collect" : "Collected";
    toast(on ? "Removed from “Desk Setup” collection" : "Saved to “Desk Setup” collection");
  });

  /* ---------- Follow toggle ---------- */
  var followBtn = document.querySelector("[data-follow]");
  followBtn.addEventListener("click", function () {
    var on = followBtn.getAttribute("aria-pressed") === "true";
    followBtn.setAttribute("aria-pressed", String(!on));
    followBtn.classList.toggle("is-on", !on);
    followBtn.textContent = on ? "+ Follow" : "Following";
    toast(on ? "Unfollowed @hexlab" : "Now following @hexlab");
  });

  /* ---------- Related cards ---------- */
  document.querySelectorAll(".rel-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var title = card.querySelector(".rel-title").textContent;
      toast("Opening “" + title + "”… (illustrative)");
    });
  });
})();
