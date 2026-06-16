/* Neon Ronin — Chapter / Episode Index
   Vanilla JS: live filter, sort toggle, click-to-mark-read. */
(function () {
  "use strict";

  // Fictional chapter data. `read` reflects the reader's progress.
  var CHAPTERS = [
    { n: 1, title: "Rain Over Neo-Kanda", date: "2025-09-14", pages: 38, free: true, read: true, hue: 348 },
    { n: 2, title: "The Severed Oath", date: "2025-09-21", pages: 41, free: true, read: true, hue: 214 },
    { n: 3, title: "Ghost in the Vending Machine", date: "2025-09-28", pages: 36, free: true, read: true, hue: 47 },
    { n: 4, title: "Blade & Bandwidth", date: "2025-10-05", pages: 44, free: true, read: false, hue: 280 },
    { n: 5, title: "Mask of the Iron Vanguard", date: "2025-10-12", pages: 39, free: true, read: false, hue: 162 },
    { n: 6, title: "Static Bloom", date: "2025-10-19", pages: 47, free: false, read: false, hue: 16 },
    { n: 7, title: "The Vault Beneath District 9", date: "2025-10-26", pages: 52, free: false, read: false, hue: 200 },
    { n: 8, title: "Two Hundred Volts of Mercy", date: "2025-11-02", pages: 40, free: false, read: false, hue: 320 },
    { n: 9, title: "Where the Drones Sleep", date: "2025-11-09", pages: 45, free: false, read: false, hue: 95 },
    { n: 10, title: "Crimson Handshake", date: "2025-11-16", pages: 49, free: false, read: false, hue: 0 }
  ];

  var listEl = document.getElementById("chapterList");
  var inputEl = document.getElementById("filterInput");
  var sortEl = document.getElementById("sortToggle");
  var emptyEl = document.getElementById("empty");
  var emptyTermEl = document.getElementById("emptyTerm");
  var toastEl = document.getElementById("toast");
  var chapterCountEl = document.getElementById("chapterCount");
  var freeCountEl = document.getElementById("freeCount");

  var sortNewest = true; // true => newest first (descending chapter #)
  var filterTerm = "";
  var toastTimer = null;

  // ---- helpers ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function thumbBg(hue) {
    return (
      "linear-gradient(135deg, hsl(" +
      hue +
      ",70%,58%), hsl(" +
      ((hue + 40) % 360) +
      ",75%,46%))"
    );
  }

  // ---- rendering ----
  function visibleChapters() {
    var term = filterTerm.trim().toLowerCase();
    var rows = CHAPTERS.filter(function (c) {
      if (!term) return true;
      return (
        c.title.toLowerCase().indexOf(term) !== -1 ||
        String(c.n).indexOf(term) !== -1
      );
    });
    rows.sort(function (a, b) {
      return sortNewest ? b.n - a.n : a.n - b.n;
    });
    return rows;
  }

  function render() {
    var rows = visibleChapters();
    listEl.innerHTML = "";

    rows.forEach(function (c) {
      var li = document.createElement("li");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chapter";
      btn.dataset.n = c.n;
      if (c.read) btn.classList.add("is-read");
      if (!c.free) btn.classList.add("is-locked");

      var stateText = c.read ? "read" : "unread";
      var lockText = c.free ? "free" : "locked";
      btn.setAttribute(
        "aria-label",
        "Chapter " + c.n + ": " + c.title + ", " + lockText + ", " + stateText
      );

      btn.innerHTML =
        '<span class="chapter__num">#' + c.n + "</span>" +
        '<span class="chapter__thumb" style="background:' + thumbBg(c.hue) + '"></span>' +
        '<span class="chapter__body">' +
          '<span class="chapter__title">' + c.title + "</span>" +
          '<span class="chapter__info">' +
            "<time datetime=\"" + c.date + "\">" + fmtDate(c.date) + "</time>" +
            "<span>&middot; " + c.pages + " pages</span>" +
          "</span>" +
        "</span>" +
        '<span class="chapter__aside">' +
          (c.free
            ? (c.read
                ? '<span class="tag tag--read">Read</span>'
                : '<span class="tag tag--free">Free</span>')
            : '<span class="tag tag--locked">&#128274; Locked</span>') +
          '<span class="dot" aria-hidden="true"></span>' +
        "</span>";

      btn.addEventListener("click", function () {
        onSelect(c, btn);
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });

    if (rows.length === 0) {
      emptyTermEl.textContent = "“" + filterTerm.trim() + "”";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
    }
  }

  function onSelect(c, btn) {
    if (!c.free) {
      toast("Chapter " + c.n + " is locked — unlock to read.");
      return;
    }
    if (!c.read) {
      c.read = true;
      updateCounts();
      // re-render to update sort-independent state, then re-flag the row
      render();
      var fresh = listEl.querySelector('.chapter[data-n="' + c.n + '"]');
      if (fresh) {
        fresh.classList.add("just-read");
        fresh.addEventListener(
          "animationend",
          function () {
            fresh.classList.remove("just-read");
          },
          { once: true }
        );
      }
      toast("Marked chapter " + c.n + " as read.");
    } else {
      toast("Opening chapter " + c.n + "…");
    }
  }

  function updateCounts() {
    chapterCountEl.textContent = CHAPTERS.length;
    freeCountEl.textContent = CHAPTERS.filter(function (c) {
      return c.free;
    }).length;
  }

  // ---- events ----
  inputEl.addEventListener("input", function () {
    filterTerm = inputEl.value;
    render();
  });

  sortEl.addEventListener("click", function () {
    sortNewest = !sortNewest;
    sortEl.setAttribute("aria-pressed", String(!sortNewest));
    sortEl.querySelector(".sort__label").textContent = sortNewest ? "Newest" : "Oldest";
    render();
    toast(sortNewest ? "Sorted newest first." : "Sorted oldest first.");
  });

  // ---- init ----
  updateCounts();
  render();
})();
