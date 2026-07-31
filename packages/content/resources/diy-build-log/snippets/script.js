/* DIY — Build Log interactions
   - Follow button with live follower count
   - Filter chips (All / Milestones / Fails / Updates)
   - Sticky mini-map synced via IntersectionObserver + click-to-scroll
   - toast() helper for feedback
*/
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------- follow button ---------- */
  var followBtn = document.getElementById("followBtn");
  var followLabel = document.getElementById("followLabel");
  var followerCountEl = document.getElementById("followerCount");
  var followers = 1284;
  var following = false;

  function renderFollowers() {
    followerCountEl.textContent = followers.toLocaleString("en-US");
  }

  followBtn.addEventListener("click", function () {
    following = !following;
    followers += following ? 1 : -1;
    followBtn.setAttribute("aria-pressed", String(following));
    followLabel.textContent = following ? "Following" : "Follow build";
    renderFollowers();
    toast(
      following
        ? "SUBSCRIBED // you will hear about every faceplant"
        : "UNFOLLOWED // the robot is quietly disappointed"
    );
  });

  /* ---------- filter chips ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
  var minimapItems = Array.prototype.slice.call(
    document.querySelectorAll(".minimap-item")
  );
  var emptyState = document.getElementById("emptyState");
  var entryCountEl = document.getElementById("entryCount");

  var FILTER_LABELS = {
    all: "ALL ENTRIES",
    milestone: "MILESTONES ONLY",
    fail: "FAILS ONLY // learn from my pain",
    update: "UPDATES ONLY"
  };

  function applyFilter(kind) {
    var visible = 0;

    entries.forEach(function (entry) {
      var match = kind === "all" || entry.dataset.kind === kind;
      entry.classList.toggle("is-filtered", !match);
      if (match) visible++;
    });

    minimapItems.forEach(function (item) {
      var target = document.getElementById(item.dataset.target);
      var hidden = !target || target.classList.contains("is-filtered");
      item.classList.toggle("is-hidden", hidden);
    });

    emptyState.hidden = visible !== 0;
    entryCountEl.textContent = String(visible);

    chips.forEach(function (chip) {
      var active = chip.dataset.filter === kind;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });

    toast("FILTER // " + (FILTER_LABELS[kind] || kind.toUpperCase()));
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(chip.dataset.filter);
    });
  });

  /* ---------- mini-map: click to scroll ---------- */
  minimapItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var target = document.getElementById(item.dataset.target);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      var title = target.querySelector(".entry-title");
      if (title) {
        toast("JUMP // " + title.textContent.trim());
      }
    });
  });

  /* ---------- mini-map: highlight entry in view ---------- */
  var activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    minimapItems.forEach(function (item) {
      item.classList.toggle("is-active", item.dataset.target === id);
    });
    entries.forEach(function (entry) {
      entry.classList.toggle("is-in-view", entry.id === id);
    });
  }

  if ("IntersectionObserver" in window) {
    var ratios = {};
    var observer = new IntersectionObserver(
      function (observed) {
        observed.forEach(function (obs) {
          ratios[obs.target.id] = obs.isIntersecting ? obs.intersectionRatio : 0;
        });

        var bestId = null;
        var bestRatio = 0;
        entries.forEach(function (entry) {
          if (entry.classList.contains("is-filtered")) return;
          var r = ratios[entry.id] || 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = entry.id;
          }
        });
        if (bestId) setActive(bestId);
      },
      {
        rootMargin: "-15% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    entries.forEach(function (entry) {
      observer.observe(entry);
    });
  } else if (entries.length) {
    setActive(entries[0].id);
  }

  /* ---------- init ---------- */
  renderFollowers();
  entryCountEl.textContent = String(entries.length);
})();
