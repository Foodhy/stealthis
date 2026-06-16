(function () {
  "use strict";

  /* ---------- fictional catalog ---------- */
  var CATALOG = [
    // artists
    { id: "a1", type: "artist", name: "Neon Tides", meta: "Artist", theme: "#1db954", plays: "2.4M monthly", round: true },
    { id: "a2", type: "artist", name: "Velvet Static", meta: "Artist", theme: "#8b5cf6", plays: "1.1M monthly", round: true },
    { id: "a3", type: "artist", name: "Paper Lanterns", meta: "Artist", theme: "#ff3d71", plays: "880K monthly", round: true },
    { id: "a4", type: "artist", name: "Glass Harbor", meta: "Artist", theme: "#38bdf8", plays: "640K monthly", round: true },
    { id: "a5", type: "artist", name: "Saffron Drift", meta: "Artist", theme: "#f59e0b", plays: "1.9M monthly", round: true },

    // albums
    { id: "al1", type: "album", name: "Midnight Reservoir", meta: "Album · Neon Tides · 2025", theme: "#1db954", plays: "12.7M" },
    { id: "al2", type: "album", name: "Velvet Static", meta: "Album · Velvet Static · 2024", theme: "#8b5cf6", plays: "8.3M" },
    { id: "al3", type: "album", name: "Low Tide Letters", meta: "Album · Glass Harbor · 2023", theme: "#38bdf8", plays: "5.0M" },
    { id: "al4", type: "album", name: "Saffron & Smoke", meta: "Album · Saffron Drift · 2025", theme: "#f59e0b", plays: "6.6M" },
    { id: "al5", type: "album", name: "Folded Light", meta: "Album · Paper Lanterns · 2024", theme: "#ff3d71", plays: "3.4M" },

    // songs
    { id: "s1", type: "song", name: "Paper Lanterns", meta: "Neon Tides", album: "Midnight Reservoir", theme: "#1db954", plays: "48,210,773", dur: "3:42" },
    { id: "s2", type: "song", name: "Reservoir Lights", meta: "Neon Tides", album: "Midnight Reservoir", theme: "#1db954", plays: "31,004,118", dur: "4:05" },
    { id: "s3", type: "song", name: "Static Bloom", meta: "Velvet Static", album: "Velvet Static", theme: "#8b5cf6", plays: "22,887,640", dur: "2:58" },
    { id: "s4", type: "song", name: "Velvet Hours", meta: "Velvet Static", album: "Velvet Static", theme: "#8b5cf6", plays: "19,440,902", dur: "3:21" },
    { id: "s5", type: "song", name: "Harbor Glass", meta: "Glass Harbor", album: "Low Tide Letters", theme: "#38bdf8", plays: "14,002,556", dur: "3:55" },
    { id: "s6", type: "song", name: "Low Tide", meta: "Glass Harbor", album: "Low Tide Letters", theme: "#38bdf8", plays: "11,765,210", dur: "4:12" },
    { id: "s7", type: "song", name: "Saffron Drift", meta: "Saffron Drift", album: "Saffron & Smoke", theme: "#f59e0b", plays: "27,330,180", dur: "3:09" },
    { id: "s8", type: "song", name: "Smoke Signals", meta: "Saffron Drift", album: "Saffron & Smoke", theme: "#f59e0b", plays: "9,118,047", dur: "3:48" },
    { id: "s9", type: "song", name: "Folded Light", meta: "Paper Lanterns", album: "Folded Light", theme: "#ff3d71", plays: "16,520,331", dur: "2:47" },
    { id: "s10", type: "song", name: "Lantern Glow", meta: "Paper Lanterns", album: "Folded Light", theme: "#ff3d71", plays: "7,884,001", dur: "3:33" },
    { id: "s11", type: "song", name: "Tides at Dawn", meta: "Neon Tides", album: "Midnight Reservoir", theme: "#1db954", plays: "5,220,664", dur: "4:30" },

    // playlists
    { id: "p1", type: "playlist", name: "Late Night Static", meta: "Playlist · 64 songs", theme: "#8b5cf6", plays: "320K saves" },
    { id: "p2", type: "playlist", name: "Tide Pools", meta: "Playlist · 41 songs", theme: "#38bdf8", plays: "118K saves" },
    { id: "p3", type: "playlist", name: "Saffron Sundown", meta: "Playlist · 80 songs", theme: "#f59e0b", plays: "204K saves" }
  ];

  var GROUPS = [
    { key: "song", title: "Songs", round: false },
    { key: "artist", title: "Artists", round: true },
    { key: "album", title: "Albums", round: false },
    { key: "playlist", title: "Playlists", round: false }
  ];

  var RECENT_KEY = "stealthwave.recent.v1";
  var RECENT_MAX = 6;

  /* ---------- elements ---------- */
  var input = document.getElementById("q");
  var clearBtn = document.getElementById("clear");
  var chipsBox = document.getElementById("chips");
  var results = document.getElementById("results");
  var toastEl = document.getElementById("toast");

  var state = { query: "", cat: "all", flat: [], active: -1, playingId: null };
  var debounceTimer = null;
  var toastTimer = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return safe;
    // re-find on escaped string by mapping the original slice
    var before = esc(text.slice(0, i));
    var match = esc(text.slice(i, i + q.length));
    var after = esc(text.slice(i + q.length));
    return before + "<mark>" + match + "</mark>" + after;
  }

  function matches(item, q) {
    var hay = (item.name + " " + (item.meta || "") + " " + (item.album || "")).toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 1900);
  }

  /* ---------- recent searches ---------- */
  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function setRecent(list) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
    } catch (e) {}
  }
  function pushRecent(term) {
    term = term.trim();
    if (!term) return;
    var list = getRecent().filter(function (t) {
      return t.toLowerCase() !== term.toLowerCase();
    });
    list.unshift(term);
    setRecent(list);
  }

  /* ---------- art ---------- */
  function artMarkup(item, cls) {
    var round = item.round ? " is-round" : "";
    return (
      '<div class="' + cls + round + ' art" style="--theme:' + item.theme + '">' +
      '<div class="art__play"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></div>' +
      '<div class="art__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      "</div>"
    );
  }

  function rowMarkup(item, q) {
    var right = "";
    if (item.type === "song") {
      right =
        '<span class="row__plays">' + item.plays + " plays</span>" +
        '<span class="row__dur">' + item.dur + "</span>";
    } else {
      right = '<span class="row__plays">' + item.plays + "</span>";
    }
    var meta = item.meta;
    if (item.type === "song") meta = highlight(item.meta, q) + " · " + highlight(item.album, q);
    else meta = highlight(item.meta, q);

    return (
      '<div class="row" role="option" tabindex="-1" data-id="' + item.id + '" style="--theme:' + item.theme + '">' +
      artMarkup(item, "row__art") +
      '<div class="row__body">' +
      '<div class="row__name">' + highlight(item.name, q) + "</div>" +
      '<div class="row__meta">' + meta + "</div>" +
      "</div>" +
      '<div class="row__right">' + right + "</div>" +
      "</div>"
    );
  }

  /* ---------- render: empty (recent) ---------- */
  function renderRecent() {
    state.flat = [];
    state.active = -1;
    var recent = getRecent();
    if (!recent.length) {
      results.innerHTML =
        '<div class="empty">' +
        '<div class="empty__icon"><svg viewBox="0 0 24 24" width="28" height="28"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>' +
        "<h3>Search Stealthwave</h3>" +
        "<p>Find your favorite artists, albums, songs and playlists.</p>" +
        "</div>";
      return;
    }
    var pills = recent
      .map(function (term) {
        return (
          '<button class="recent__pill" type="button" data-term="' + esc(term) + '">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          "<span>" + esc(term) + "</span>" +
          '<span class="recent__remove" data-remove="' + esc(term) + '" role="button" aria-label="Remove recent search">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    results.innerHTML =
      '<div class="group recent">' +
      '<div class="recent__head">' +
      '<h2 class="group__title">Recent searches</h2>' +
      '<button class="recent__clear" type="button" id="recent-clear">Clear all</button>' +
      "</div>" +
      '<div class="group__list">' + pills + "</div>" +
      "</div>";
  }

  /* ---------- render: results ---------- */
  function renderResults() {
    var q = state.query.trim().toLowerCase();
    if (!q) {
      input.setAttribute("aria-expanded", "false");
      renderRecent();
      return;
    }
    input.setAttribute("aria-expanded", "true");

    var pool = CATALOG.filter(function (item) {
      return matches(item, q);
    });
    if (state.cat !== "all") {
      pool = pool.filter(function (item) {
        return item.type === state.cat;
      });
    }

    if (!pool.length) {
      state.flat = [];
      state.active = -1;
      results.innerHTML =
        '<div class="empty">' +
        '<div class="empty__icon"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>' +
        "<h3>No results for &ldquo;<b>" + esc(state.query.trim()) + "</b>&rdquo;</h3>" +
        "<p>Try a different artist, album, or song name.</p>" +
        "</div>";
      return;
    }

    var html = "";
    var flat = [];

    // top result (only when "All") — best match by name startsWith, prefer artist/album
    if (state.cat === "all") {
      var top = pickTop(pool, q);
      if (top) {
        html +=
          '<div class="group">' +
          '<div class="top" style="--theme:' + top.theme + '" data-id="' + top.id + '" role="button" tabindex="-1">' +
          artMarkupTop(top) +
          '<div class="top__body">' +
          '<span class="top__kind">' + kindLabel(top.type) + "</span>" +
          '<h2 class="top__name">' + highlight(top.name, q) + "</h2>" +
          '<span class="top__meta">' + highlight(top.meta, q) + "</span>" +
          '<button class="top__play" type="button" data-id="' + top.id + '">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>Play</button>' +
          "</div></div></div>";
        flat.push(top.id);
      }
    }

    GROUPS.forEach(function (g) {
      if (state.cat !== "all" && state.cat !== g.key) return;
      var items = pool.filter(function (it) {
        return it.type === g.key;
      });
      if (state.cat === "all") items = items.slice(0, g.key === "song" ? 4 : 4);
      if (!items.length) return;
      var rows = items
        .map(function (it) {
          flat.push(it.id);
          return rowMarkup(it, q);
        })
        .join("");
      html +=
        '<div class="group">' +
        '<h2 class="group__title">' + g.title + "</h2>" +
        '<div class="group__list">' + rows + "</div>" +
        "</div>";
    });

    results.innerHTML = html;
    state.flat = flat;
    state.active = -1;
    restorePlaying();
  }

  function artMarkupTop(item) {
    var round = item.type === "artist" ? " is-round" : "";
    return (
      '<div class="top__art art' + round + '" style="--theme:' + item.theme + '">' +
      '<div class="art__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      "</div>"
    );
  }

  function kindLabel(t) {
    return { song: "Song", artist: "Artist", album: "Album", playlist: "Playlist" }[t] || t;
  }

  function pickTop(pool, q) {
    var scored = pool
      .map(function (it) {
        var n = it.name.toLowerCase();
        var score = 0;
        if (n === q) score = 100;
        else if (n.indexOf(q) === 0) score = 70;
        else if (n.indexOf(q) > 0) score = 40;
        if (it.type === "artist") score += 8;
        if (it.type === "album") score += 4;
        return { it: it, score: score };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    return scored.length ? scored[0].it : null;
  }

  /* ---------- playback (simulated) ---------- */
  function restorePlaying() {
    if (!state.playingId) return;
    var el = results.querySelector('[data-id="' + state.playingId + '"]');
    if (el && el.classList.contains("row")) el.classList.add("is-playing");
  }

  function findItem(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  function play(id) {
    var item = findItem(id);
    if (!item) return;
    // clear previous
    var prev = results.querySelector(".row.is-playing");
    if (prev) prev.classList.remove("is-playing");
    state.playingId = id;
    var el = results.querySelector('.row[data-id="' + id + '"]');
    if (el) el.classList.add("is-playing");
    var verb = item.type === "song" ? "Playing" : item.type === "artist" ? "Playing top tracks by" : "Playing";
    toast(verb + " " + item.name);
  }

  /* ---------- keyboard navigation ---------- */
  function setActive(idx) {
    var nodes = results.querySelectorAll(".row, .top");
    nodes.forEach(function (n) {
      n.classList.remove("is-active");
    });
    if (idx < 0 || idx >= state.flat.length) {
      state.active = -1;
      return;
    }
    state.active = idx;
    var id = state.flat[idx];
    var el = results.querySelector('[data-id="' + id + '"]');
    if (el) {
      el.classList.add("is-active");
      el.scrollIntoView({ block: "nearest" });
    }
  }

  /* ---------- events ---------- */
  function onInput() {
    var val = input.value;
    state.query = val;
    clearBtn.hidden = val.length === 0;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      renderResults();
    }, 140);
  }

  input.addEventListener("input", onInput);

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      if (!state.flat.length) return;
      e.preventDefault();
      setActive(Math.min(state.active + 1, state.flat.length - 1));
    } else if (e.key === "ArrowUp") {
      if (!state.flat.length) return;
      e.preventDefault();
      setActive(state.active <= 0 ? -1 : state.active - 1);
    } else if (e.key === "Enter") {
      if (state.active >= 0 && state.flat[state.active]) {
        e.preventDefault();
        play(state.flat[state.active]);
        pushRecent(state.query);
      } else if (state.query.trim()) {
        pushRecent(state.query);
      }
    } else if (e.key === "Escape") {
      if (input.value) {
        input.value = "";
        onInput();
      }
    }
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    state.query = "";
    clearBtn.hidden = true;
    input.focus();
    renderResults();
  });

  chipsBox.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var cat = chip.getAttribute("data-cat");
    state.cat = cat;
    chipsBox.querySelectorAll(".chip").forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderResults();
  });

  results.addEventListener("click", function (e) {
    // remove single recent
    var rm = e.target.closest("[data-remove]");
    if (rm) {
      e.stopPropagation();
      var term = rm.getAttribute("data-remove");
      setRecent(
        getRecent().filter(function (t) {
          return t !== term;
        })
      );
      renderRecent();
      return;
    }
    // clear all recent
    if (e.target.id === "recent-clear") {
      setRecent([]);
      renderRecent();
      toast("Recent searches cleared");
      return;
    }
    // recent pill -> run search
    var pill = e.target.closest(".recent__pill");
    if (pill) {
      var t = pill.getAttribute("data-term");
      input.value = t;
      onInput();
      input.focus();
      return;
    }
    // play from row / top
    var row = e.target.closest(".row, .top, .top__play");
    if (row) {
      var id = row.getAttribute("data-id");
      if (id) {
        play(id);
        pushRecent(state.query);
      }
    }
  });

  /* ---------- init ---------- */
  renderRecent();
})();
