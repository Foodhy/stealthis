(function () {
  "use strict";

  /* ---------- Data ---------- */
  var GUESTS = [
    {
      id: "amara",
      name: "Dr. Amara Osei",
      role: "Neuroscientist · Author of “Signal & Noise”",
      photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80",
      bio: "Amara runs the Cognition Lab at Meridian University, where she studies how attention rewires under constant notification pressure — and what a focused mind actually costs.",
      epNumber: "Episode 128",
      epTag: "Season 4 · Featured",
      epTitle: "The Cost of a Focused Mind",
      epArt: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=160&q=80",
      duration: "42:18"
    },
    {
      id: "renzo",
      name: "Renzo Vidal",
      role: "Founder of Cadence · Ex-Spotify",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80",
      bio: "Renzo built three audio startups before he turned thirty. He argues that the next platform war won’t be about content — it’ll be about who owns the quiet moments between tracks.",
      epNumber: "Episode 126",
      epTag: "Season 4 · Builders",
      epTitle: "Designing for the In-Between",
      epArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=160&q=80",
      duration: "51:04"
    },
    {
      id: "mei",
      name: "Mei-Lin Zhao",
      role: "Climate journalist · Peabody winner",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
      bio: "Mei-Lin has reported from thirty-one countries on the human edge of the climate story. She joins us to unpack how a single field recording changed an entire policy debate.",
      epNumber: "Episode 124",
      epTag: "Season 4 · Field Notes",
      epTitle: "The Sound of a Melting Coast",
      epArt: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=160&q=80",
      duration: "38:47"
    },
    {
      id: "isa",
      name: "Isa Marchetti",
      role: "Composer · Grammy-nominated",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80",
      bio: "Isa scores films by starting with silence and subtracting. On this episode she walks through the four-note motif that took her eleven months and one broken piano to find.",
      epNumber: "Episode 121",
      epTag: "Season 4 · Craft",
      epTitle: "Writing With the Volume Off",
      epArt: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=160&q=80",
      duration: "46:33"
    }
  ];

  /* ---------- Elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var photo = $("guestPhoto");
  var nameEl = $("guestName");
  var roleEl = $("guestRole");
  var bioEl = $("guestBio");
  var epCount = $("epCount");
  var epTag = $("epTag");
  var epTitle = $("epTitle");
  var epArt = $("epArt");
  var epTime = $("epTime");
  var playBtn = $("playBtn");
  var wave = $("wave");
  var followBtn = $("followBtn");
  var followLabel = $("followLabel");
  var rail = $("rail");
  var toastEl = $("toast");
  var card = document.querySelector(".spotlight");

  var current = 0;
  var playing = false;
  var elapsed = 0;
  var timer = null;

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- Time helpers ---------- */
  function durationToSeconds(str) {
    var p = str.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function renderTime() {
    var g = GUESTS[current];
    epTime.textContent = fmt(elapsed) + " / " + g.duration;
    epTime.setAttribute("datetime", "PT" + elapsed + "S");
  }

  /* ---------- Playback ---------- */
  function stop() {
    playing = false;
    clearInterval(timer);
    timer = null;
    playBtn.classList.remove("is-playing");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play episode");
    wave.classList.remove("is-playing");
  }

  function play() {
    playing = true;
    playBtn.classList.add("is-playing");
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause episode");
    wave.classList.add("is-playing");
    var total = durationToSeconds(GUESTS[current].duration);
    timer = setInterval(function () {
      elapsed += 1;
      if (elapsed >= total) {
        elapsed = total;
        renderTime();
        stop();
        toast("Episode finished — thanks for listening");
        return;
      }
      renderTime();
    }, 1000);
    toast("Now playing · " + GUESTS[current].epTitle);
  }

  playBtn.addEventListener("click", function () {
    if (playing) { stop(); } else { play(); }
  });

  /* ---------- Follow ---------- */
  followBtn.addEventListener("click", function () {
    var on = followBtn.getAttribute("aria-pressed") === "true";
    on = !on;
    followBtn.setAttribute("aria-pressed", String(on));
    followLabel.textContent = on ? "Following" : "Follow";
    toast(on ? "Following " + GUESTS[current].name : "Unfollowed " + GUESTS[current].name);
  });

  /* ---------- Socials ---------- */
  document.querySelectorAll(".social").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var net = btn.getAttribute("data-net");
      toast("Opening " + GUESTS[current].name.split(" ")[0] + "’s " + net);
    });
  });

  /* ---------- Render guest ---------- */
  function renderGuest(swap) {
    var g = GUESTS[current];
    var apply = function () {
      photo.src = g.photo;
      photo.alt = "Portrait of " + g.name;
      nameEl.childNodes[0].nodeValue = g.name + " ";
      roleEl.innerHTML = g.role;
      bioEl.textContent = g.bio;
      epCount.textContent = g.epNumber;
      epTag.textContent = g.epTag;
      epTitle.textContent = g.epTitle;
      epArt.src = g.epArt;
      renderTime();
      if (swap) {
        requestAnimationFrame(function () { card.classList.remove("is-swapping"); });
      }
    };
    if (swap) {
      card.classList.add("is-swapping");
      setTimeout(apply, 300);
    } else {
      apply();
    }
  }

  function selectGuest(idx) {
    if (idx === current) return;
    current = idx;
    stop();
    elapsed = 0;
    // reset follow state per guest
    followBtn.setAttribute("aria-pressed", "false");
    followLabel.textContent = "Follow";
    renderGuest(true);
    updateChips();
  }

  /* ---------- Related rail ---------- */
  var chips = [];
  function buildRail() {
    GUESTS.forEach(function (g, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.setAttribute("role", "option");
      chip.setAttribute("aria-selected", i === current ? "true" : "false");
      chip.innerHTML =
        '<img src="' + g.photo + '" alt="" />' +
        "<span>" + g.name + "</span>";
      chip.addEventListener("click", function () { selectGuest(i); });
      rail.appendChild(chip);
      chips.push(chip);
    });
  }
  function updateChips() {
    chips.forEach(function (chip, i) {
      var active = i === current;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  /* ---------- Init ---------- */
  buildRail();
  renderGuest(false);
  updateChips();
})();
