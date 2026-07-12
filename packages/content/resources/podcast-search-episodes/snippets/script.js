(function () {
  "use strict";

  // ---- Fictional but realistic episode catalog ----
  var DAY = 86400000;
  var now = Date.now();

  var EPISODES = [
    { id: 1,  title: "The Quiet Economics of Attention", show: "Signal & Noise", guest: "Dr. Maya Okonkwo", minutes: 47, days: 3 },
    { id: 2,  title: "Mapping the Deep Ocean Floor", show: "Deep Field", guest: "Ravi Chandra", minutes: 62, days: 9 },
    { id: 3,  title: "Why We Sleep Badly in Cities", show: "Night Frequencies", guest: "Lena Vasquez", minutes: 21, days: 14 },
    { id: 4,  title: "A Director's Cut, Twenty Years Later", show: "The Long Cut", guest: "Theo Marsh", minutes: 74, days: 20 },
    { id: 5,  title: "Signals from the Edge of Data", show: "Signal & Noise", guest: "Priya Nair", minutes: 38, days: 27 },
    { id: 6,  title: "Fieldwork in the Atacama Desert", show: "Deep Field", guest: "Sofia Bianchi", minutes: 55, days: 41 },
    { id: 7,  title: "Insomnia and the Midnight Hour", show: "Night Frequencies", guest: "Jonah Reed", minutes: 18, days: 58 },
    { id: 8,  title: "Editing the Unfilmable Novel", show: "The Long Cut", guest: "Amara Diallo", minutes: 68, days: 74 },
    { id: 9,  title: "The Noise Floor of Modern Markets", show: "Signal & Noise", guest: "Dr. Maya Okonkwo", minutes: 44, days: 96 },
    { id: 10, title: "Glaciers, Memory and Slow Change", show: "Deep Field", guest: "Ingrid Halvorsen", minutes: 51, days: 120 },
    { id: 11, title: "Dreams We Can Almost Remember", show: "Night Frequencies", guest: "Lena Vasquez", minutes: 24, days: 155 },
    { id: 12, title: "The Three-Hour Interview, Uncut", show: "The Long Cut", guest: "Theo Marsh", minutes: 92, days: 210 },
    { id: 13, title: "Reading the Silence Between Words", show: "Signal & Noise", guest: "Kwame Boateng", minutes: 33, days: 260 },
    { id: 14, title: "Beneath the Antarctic Ice Shelf", show: "Deep Field", guest: "Ravi Chandra", minutes: 59, days: 330 },
    { id: 15, title: "Late-Night Radio, A History", show: "Night Frequencies", guest: "Amara Diallo", minutes: 46, days: 400 }
  ];

  // ---- Elements ----
  var $ = function (s) { return document.querySelector(s); };
  var searchEl = $("#search");
  var clearBtn = $("#clearSearch");
  var showEl = $("#filterShow");
  var durEl = $("#filterDuration");
  var dateEl = $("#filterDate");
  var sortEl = $("#sortBy");
  var resultsEl = $("#results");
  var countEl = $("#resultCount");
  var emptyEl = $("#empty");
  var toastEl = $("#toast");

  var playingId = null;
  var toastTimer;

  // ---- Helpers ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function fmtDuration(m) {
    if (m < 60) return m + " min";
    var h = Math.floor(m / 60);
    var rem = m % 60;
    return h + "h" + (rem ? " " + rem + "m" : "");
  }

  function durationBucket(m) {
    if (m < 25) return "short";
    if (m <= 50) return "medium";
    return "long";
  }

  function relDate(days) {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    if (days < 30) return Math.round(days / 7) + " weeks ago";
    if (days < 365) return Math.round(days / 30) + " months ago";
    return Math.round(days / 365) + " year" + (days >= 730 ? "s" : "") + " ago";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function highlight(text, term) {
    var safe = escapeHtml(text);
    if (!term) return safe;
    var idx = text.toLowerCase().indexOf(term);
    if (idx === -1) return safe;
    var esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + esc + ")", "ig"), "<mark>$1</mark>");
  }

  // ---- Core filter ----
  function currentFilters() {
    return {
      q: searchEl.value.trim().toLowerCase(),
      show: showEl.value,
      dur: durEl.value,
      date: dateEl.value,
      sort: sortEl.value
    };
  }

  function matches(ep, f) {
    if (f.q) {
      var hay = (ep.title + " " + ep.show + " " + ep.guest).toLowerCase();
      if (hay.indexOf(f.q) === -1) return false;
    }
    if (f.show && ep.show !== f.show) return false;
    if (f.dur && durationBucket(ep.minutes) !== f.dur) return false;
    if (f.date && ep.days > parseInt(f.date, 10)) return false;
    return true;
  }

  function sortList(list, mode) {
    var copy = list.slice();
    copy.sort(function (a, b) {
      switch (mode) {
        case "oldest": return b.days - a.days;
        case "longest": return b.minutes - a.minutes;
        case "shortest": return a.minutes - b.minutes;
        default: return a.days - b.days; // newest
      }
    });
    return copy;
  }

  function cardHtml(ep, term) {
    var active = ep.id === playingId;
    return (
      '<li class="card' + (active ? " active" : "") + '" data-id="' + ep.id + '">' +
        '<button class="play' + (active ? " playing" : "") + '" type="button" ' +
          'aria-pressed="' + active + '" aria-label="' + (active ? "Pause" : "Play") + " " + escapeHtml(ep.title) + '">' +
          (active
            ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
            : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>') +
        "</button>" +
        '<div class="card-body">' +
          '<h3 class="card-title">' + highlight(ep.title, term) + "</h3>" +
          '<div class="card-meta">' +
            '<span class="badge show">' + escapeHtml(ep.show) + "</span>" +
            '<span class="badge dur">' + fmtDuration(ep.minutes) + "</span>" +
            '<span class="dot">·</span>' +
            "<time>" + relDate(ep.days) + "</time>" +
            '<span class="dot">·</span>' +
            '<span class="card-meta-guest" style="font-size:.76rem;color:var(--muted)">' + highlight(ep.guest, term) + "</span>" +
          "</div>" +
        "</div>" +
        '<span class="wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>' +
      "</li>"
    );
  }

  function render() {
    var f = currentFilters();
    clearBtn.hidden = !searchEl.value;

    var list = EPISODES.filter(function (ep) { return matches(ep, f); });
    list = sortList(list, f.sort);

    if (list.length === 0) {
      resultsEl.innerHTML = "";
      resultsEl.hidden = true;
      emptyEl.hidden = false;
      countEl.innerHTML = "No matching episodes";
      return;
    }

    emptyEl.hidden = true;
    resultsEl.hidden = false;
    countEl.innerHTML = "<strong>" + list.length + "</strong> of " + EPISODES.length + " episode" + (list.length === 1 ? "" : "s");

    resultsEl.innerHTML = list.map(function (ep) { return cardHtml(ep, f.q); }).join("");
  }

  // ---- Events ----
  var debounce;
  searchEl.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 90);
  });

  clearBtn.addEventListener("click", function () {
    searchEl.value = "";
    searchEl.focus();
    render();
  });

  [showEl, durEl, dateEl, sortEl].forEach(function (el) {
    el.addEventListener("change", render);
  });

  function resetAll() {
    searchEl.value = "";
    showEl.value = "";
    durEl.value = "";
    dateEl.value = "";
    sortEl.value = "newest";
    playingId = null;
    render();
    toast("Filters reset");
  }
  $("#resetTop").addEventListener("click", resetAll);
  $("#resetEmpty").addEventListener("click", resetAll);

  // Play / pause via event delegation
  resultsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".play");
    if (!btn) return;
    var li = btn.closest(".card");
    var id = parseInt(li.getAttribute("data-id"), 10);
    var ep = EPISODES.filter(function (x) { return x.id === id; })[0];

    if (playingId === id) {
      playingId = null;
      toast("Paused");
    } else {
      playingId = id;
      toast("Now playing · " + ep.title);
    }
    render();
  });

  // Initial paint
  render();
})();
