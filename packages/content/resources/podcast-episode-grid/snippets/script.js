(function () {
  "use strict";

  var GRADIENTS = [
    "linear-gradient(135deg, #8b5cf6, #22d3ee)",
    "linear-gradient(135deg, #f472b6, #7c3aed)",
    "linear-gradient(135deg, #22d3ee, #7c3aed)",
    "linear-gradient(135deg, #7c3aed, #f472b6)",
    "linear-gradient(135deg, #06b6d4, #8b5cf6)",
    "linear-gradient(135deg, #a855f7, #22d3ee)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
    "linear-gradient(135deg, #14b8a6, #7c3aed)"
  ];

  // Fictional but realistic dataset. days = days since publish (for "newest").
  var EPISODES = [
    { n: 47, title: "The Sound of Empty Rooms", desc: "Field recordist Ravi Ortega on capturing silence and why it never really exists.", dur: "58 min", days: 2, plays: 12400, season: "S4" },
    { n: 46, title: "Designing for the Ear", desc: "How sonic branding shapes the way we trust products before we ever see them.", dur: "44 min", days: 6, plays: 31200, season: "S4" },
    { n: 45, title: "Static & Signal", desc: "A deep dive into noise reduction with audio engineer Mira Kwon.", dur: "1 hr 12 min", days: 11, plays: 9800, season: "S4" },
    { n: 44, title: "The Loudness War", desc: "Why modern records keep getting louder and what it costs the music.", dur: "39 min", days: 18, plays: 54800, season: "S4" },
    { n: 43, title: "Voices in the Machine", desc: "Synthetic speech, uncanny valleys, and the ethics of cloned voices.", dur: "51 min", days: 24, plays: 42100, season: "S3" },
    { n: 42, title: "Rooms That Sing", desc: "Architectural acoustics from cathedrals to open-plan offices.", dur: "47 min", days: 31, plays: 18700, season: "S3" },
    { n: 41, title: "Analog Hearts", desc: "The stubborn romance of tape, vinyl, and hiss in a digital world.", dur: "1 hr 3 min", days: 39, plays: 67300, season: "S3" },
    { n: 40, title: "Frequency & Feeling", desc: "The neuroscience of why certain sounds give us chills.", dur: "36 min", days: 48, plays: 88900, season: "S3" },
    { n: 39, title: "The Quiet Hour", desc: "Composer Nadia Belfort on writing scores for the spaces between words.", dur: "55 min", days: 57, plays: 23400, season: "S3" },
    { n: 38, title: "Broadcast Ghosts", desc: "Chasing pirate radio stations across a fading shortwave dial.", dur: "42 min", days: 66, plays: 15600, season: "S2" },
    { n: 37, title: "Mastering the Mix", desc: "What a mastering engineer actually does in those final hours.", dur: "1 hr 8 min", days: 74, plays: 39800, season: "S2" },
    { n: 36, title: "Echoes of the City", desc: "A soundwalk through midnight streets with urban ecologist Lena Fry.", dur: "49 min", days: 83, plays: 71200, season: "S2" }
  ];

  var ICON_CLOCK =
    '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm1-13h-2v6l5 3 1-1.7-4-2.4V7Z"/></svg>';
  var ICON_CAL =
    '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7ZM5 9h14v10H5V9Z"/></svg>';
  var ICON_HEAD =
    '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h1v-8H5v-0a7 7 0 0 1 14 0v0h-2v8h1a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9Z"/></svg>';
  var ICON_PLAY =
    '<svg class="icon-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>';
  var ICON_PAUSE =
    '<svg class="icon-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>';

  var grid = document.getElementById("grid");
  var countEl = document.getElementById("count");
  var sortEl = document.getElementById("sort");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  var currentSort = "newest";

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function fmtPlays(p) {
    if (p >= 1000) return (p / 1000).toFixed(p % 1000 === 0 ? 0 : 1) + "k";
    return String(p);
  }

  function fmtDate(days) {
    var d = new Date();
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function waveBars() {
    var html = "";
    for (var i = 0; i < 26; i++) html += "<i></i>";
    return html;
  }

  function makeCard(ep, idx) {
    var el = document.createElement("article");
    el.className = "card";
    el.style.animationDelay = idx * 0.035 + "s";

    var isNew = ep.days <= 7;
    var grad = GRADIENTS[ep.n % GRADIENTS.length];

    el.innerHTML =
      '<div class="art" style="background:' + grad + '">' +
        '<div class="art__badges">' +
          '<span class="badge badge--num">Ep ' + ep.n + "</span>" +
          '<span class="badge">' + ep.season + "</span>" +
          (isNew ? '<span class="badge badge--new">New</span>' : "") +
        "</div>" +
        '<div class="wave" aria-hidden="true">' + waveBars() + "</div>" +
        '<button class="play" type="button" aria-label="Play ' + ep.title.replace(/"/g, "") + '">' +
          ICON_PLAY + ICON_PAUSE +
        "</button>" +
      "</div>" +
      '<div class="body">' +
        '<h3 class="card__title">' + ep.title + "</h3>" +
        '<p class="card__desc">' + ep.desc + "</p>" +
        '<div class="meta">' +
          "<span>" + ICON_CLOCK + ep.dur + "</span>" +
          "<span>" + ICON_CAL + fmtDate(ep.days) + "</span>" +
          "<span>" + ICON_HEAD + fmtPlays(ep.plays) + "</span>" +
          '<span class="now">Now playing</span>' +
        "</div>" +
        '<div class="card__actions">' +
          '<button class="mini" type="button" data-act="queue">Add to queue</button>' +
          '<button class="mini" type="button" data-act="share">Share</button>' +
        "</div>" +
      "</div>";

    var playBtn = el.querySelector(".play");
    playBtn.addEventListener("click", function () {
      var wasPlaying = el.classList.contains("playing");
      // stop everyone
      var all = grid.querySelectorAll(".card.playing");
      all.forEach(function (c) {
        c.classList.remove("playing");
        var b = c.querySelector(".play");
        b.setAttribute("aria-label", "Play episode");
      });
      if (!wasPlaying) {
        el.classList.add("playing");
        playBtn.setAttribute("aria-label", "Pause " + ep.title.replace(/"/g, ""));
        toast("Playing — Ep " + ep.n + ": " + ep.title);
      } else {
        toast("Paused");
      }
    });

    el.querySelectorAll(".mini").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.act === "queue") toast("Queued Ep " + ep.n);
        else toast("Link copied to clipboard");
      });
    });

    return el;
  }

  function render() {
    var list = EPISODES.slice();
    if (currentSort === "newest") {
      list.sort(function (a, b) { return a.days - b.days; });
    } else {
      list.sort(function (a, b) { return b.plays - a.plays; });
    }

    // preserve any currently playing episode number
    var playingEl = grid.querySelector(".card.playing");
    var playingNum = null;
    if (playingEl) {
      var m = playingEl.querySelector(".badge--num");
      if (m) playingNum = m.textContent.replace("Ep ", "").trim();
    }

    grid.innerHTML = "";
    list.forEach(function (ep, i) {
      var card = makeCard(ep, i);
      if (playingNum !== null && String(ep.n) === playingNum) {
        card.classList.add("playing");
      }
      grid.appendChild(card);
    });

    countEl.textContent = list.length + " episodes";
  }

  sortEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".seg");
    if (!btn) return;
    var val = btn.dataset.sort;
    if (val === currentSort) return;
    currentSort = val;
    sortEl.querySelectorAll(".seg").forEach(function (s) {
      var on = s === btn;
      s.classList.toggle("seg--on", on);
      s.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
    toast(val === "newest" ? "Sorted by newest" : "Sorted by most played");
  });

  document.getElementById("subBtn").addEventListener("click", function () {
    toast("Subscribed to Signal & Noise");
  });

  render();
})();
