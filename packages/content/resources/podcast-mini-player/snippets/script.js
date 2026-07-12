(function () {
  "use strict";

  // ---------- data ----------
  const EPISODES = [
    {
      id: "e1",
      title: "The Quiet Economy of Attention",
      show: "Signal & Static",
      badge: "New",
      badgeType: "new",
      duration: 2714, // seconds
      art: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&q=80&auto=format&fit=crop",
      notes: "Host Mara Ndiaye unpacks how attention became the scarcest resource of the decade, and what indie creators are doing to reclaim it from the feed.",
    },
    {
      id: "e2",
      title: "Building in the Open, Failing in Public",
      show: "Ship It Weekly",
      badge: "Episode 84",
      badgeType: "",
      duration: 3182,
      art: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80&auto=format&fit=crop",
      notes: "Two founders trade war stories about launching half-finished products and letting the audience watch every mistake in real time.",
    },
    {
      id: "e3",
      title: "Field Recordings from the Deep North",
      show: "Wander Frequencies",
      badge: "New",
      badgeType: "new",
      duration: 1965,
      art: "https://images.unsplash.com/photo-1483000805330-4eaf0a0d82da?w=200&q=80&auto=format&fit=crop",
      notes: "A sound diary stitched together from a month spent chasing silence above the Arctic Circle. Headphones strongly recommended.",
    },
    {
      id: "e4",
      title: "Why Your Sleep Schedule Lies to You",
      show: "The Body Clock",
      badge: "Episode 12",
      badgeType: "",
      duration: 2438,
      art: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80&auto=format&fit=crop",
      notes: "Dr. Priya Venkat explains circadian drift, social jetlag, and the small habit that quietly resets your internal clock overnight.",
    },
    {
      id: "e5",
      title: "The Last Great Radio Drama",
      show: "Analog Hours",
      badge: "Episode 47",
      badgeType: "",
      duration: 3560,
      art: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=200&q=80&auto=format&fit=crop",
      notes: "A love letter to the golden age of audio storytelling, and a scrappy collective trying to revive it one serialized episode at a time.",
    },
    {
      id: "e6",
      title: "Money, Meaning, and the Side Hustle Trap",
      show: "Off the Ledger",
      badge: "New",
      badgeType: "new",
      duration: 2251,
      art: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80&auto=format&fit=crop",
      notes: "When does a passion project stop being a joy and start being a second job? A candid look at burnout in the creator economy.",
    },
  ];

  // ---------- els ----------
  const $ = (s, r = document) => r.querySelector(s);
  const list = $("#episodeList");
  const player = $("#player");
  const miniArt = $("#miniArt");
  const bigArt = $("#bigArt");
  const miniTitle = $("#miniTitle");
  const miniShow = $("#miniShow");
  const bigTitle = $("#bigTitle");
  const bigShow = $("#bigShow");
  const bigNotes = $("#bigNotes");
  const bigBadge = $("#bigBadge");
  const scrub = $("#scrub");
  const scrubFill = $("#scrubFill");
  const scrubThumb = $("#scrubThumb");
  const scrubTopFill = $("#scrubTopFill");
  const curTime = $("#curTime");
  const durTime = $("#durTime");
  const toastEl = $("#toast");

  $("#feedCount").textContent = EPISODES.length + " shows";

  // ---------- state ----------
  let currentIndex = -1;
  let playing = false;
  let position = 0; // seconds
  let ticker = null;

  // ---------- helpers ----------
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  // ---------- render list ----------
  const iconPlay = '<svg class="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const iconPause = '<svg class="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>';

  EPISODES.forEach((ep, i) => {
    const li = document.createElement("li");
    li.className = "ep";
    li.dataset.index = String(i);
    li.innerHTML =
      '<div class="ep-art"><img src="' + ep.art + '" alt="Cover art for ' + ep.title + '" loading="lazy" /></div>' +
      '<div class="ep-body">' +
        '<p class="ep-title">' + ep.title + '</p>' +
        '<p class="ep-sub">' +
          '<span class="ep-badge ' + (ep.badgeType || "") + '">' + ep.badge + '</span>' +
          '<span>' + ep.show + '</span>' +
          '<span class="ep-dur">· ' + fmt(ep.duration) + '</span>' +
        '</p>' +
      '</div>' +
      '<button class="ep-play" type="button" aria-label="Play ' + ep.title + '">' + iconPlay + iconPause + '</button>';

    li.querySelector(".ep-play").addEventListener("click", () => onRowPlay(i));
    list.appendChild(li);
  });

  const rows = Array.from(list.querySelectorAll(".ep"));

  // ---------- playback engine ----------
  function loadEpisode(i) {
    const ep = EPISODES[i];
    currentIndex = i;
    position = 0;

    miniArt.src = ep.art;
    bigArt.src = ep.art;
    miniArt.alt = bigArt.alt = "Cover art for " + ep.title;
    miniTitle.textContent = bigTitle.textContent = ep.title;
    miniShow.textContent = bigShow.textContent = ep.show;
    bigNotes.textContent = ep.notes;
    bigBadge.textContent = ep.badge;
    durTime.textContent = fmt(ep.duration);
    scrub.setAttribute("aria-valuetext", "0:00 of " + fmt(ep.duration));

    if (player.hidden) {
      player.hidden = false;
      // retrigger slide-up animation
      player.style.animation = "none";
      void player.offsetWidth;
      player.style.animation = "";
    }
    updateProgress();
    highlightRow();
  }

  function highlightRow() {
    rows.forEach((r, idx) => {
      r.classList.toggle("is-active", idx === currentIndex);
      r.classList.toggle("is-playing", idx === currentIndex && playing);
      const btn = r.querySelector(".ep-play");
      btn.setAttribute("aria-label", (idx === currentIndex && playing ? "Pause " : "Play ") + EPISODES[idx].title);
    });
  }

  function setPlaying(state) {
    playing = state;
    player.classList.toggle("is-playing", playing);
    ["#playToggle", "#playToggle2"].forEach((sel) => {
      const b = $(sel);
      b.setAttribute("aria-pressed", String(playing));
      b.setAttribute("aria-label", playing ? "Pause" : "Play");
    });
    highlightRow();
    if (playing) startTicker();
    else stopTicker();
  }

  function startTicker() {
    stopTicker();
    ticker = setInterval(() => {
      const ep = EPISODES[currentIndex];
      position += 1;
      if (position >= ep.duration) {
        position = ep.duration;
        updateProgress();
        setPlaying(false);
        toast("Episode finished");
        return;
      }
      updateProgress();
    }, 1000);
  }

  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function updateProgress() {
    const ep = EPISODES[currentIndex];
    if (!ep) return;
    const pct = (position / ep.duration) * 100;
    scrubFill.style.width = pct + "%";
    scrubThumb.style.left = pct + "%";
    scrubTopFill.style.width = pct + "%";
    curTime.textContent = fmt(position);
    scrub.setAttribute("aria-valuenow", String(Math.round(pct)));
    scrub.setAttribute("aria-valuetext", fmt(position) + " of " + fmt(ep.duration));
  }

  // ---------- actions ----------
  function onRowPlay(i) {
    if (i === currentIndex) {
      togglePlay();
      return;
    }
    loadEpisode(i);
    setPlaying(true);
    toast("Now playing · " + EPISODES[i].show);
  }

  function togglePlay() {
    if (currentIndex < 0) { onRowPlay(0); return; }
    setPlaying(!playing);
  }

  function seekBy(delta) {
    if (currentIndex < 0) return;
    const ep = EPISODES[currentIndex];
    position = Math.min(ep.duration, Math.max(0, position + delta));
    updateProgress();
  }

  function step(dir) {
    if (currentIndex < 0) return;
    let next = (currentIndex + dir + EPISODES.length) % EPISODES.length;
    loadEpisode(next);
    setPlaying(true);
    toast((dir > 0 ? "Next · " : "Previous · ") + EPISODES[next].show);
  }

  function toggleExpand() {
    const open = player.dataset.expanded === "true";
    player.dataset.expanded = String(!open);
    $("#expandToggle").setAttribute("aria-expanded", String(!open));
    $("#expanded").setAttribute("aria-hidden", String(open));
  }

  // ---------- scrubbing ----------
  function seekFromEvent(e) {
    if (currentIndex < 0) return;
    const rect = scrub.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    position = ratio * EPISODES[currentIndex].duration;
    updateProgress();
  }

  let dragging = false;
  scrub.addEventListener("pointerdown", (e) => {
    if (currentIndex < 0) return;
    dragging = true;
    player.classList.add("is-scrubbing");
    scrub.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });
  scrub.addEventListener("pointermove", (e) => { if (dragging) seekFromEvent(e); });
  scrub.addEventListener("pointerup", (e) => {
    if (dragging) { dragging = false; player.classList.remove("is-scrubbing"); toast("Jumped to " + fmt(position)); }
  });
  scrub.addEventListener("pointercancel", () => { dragging = false; player.classList.remove("is-scrubbing"); });

  // top thin progress bar also seekable
  $("#scrubTop").addEventListener("click", (e) => {
    if (currentIndex < 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    position = ratio * EPISODES[currentIndex].duration;
    updateProgress();
  });

  // keyboard on slider
  scrub.addEventListener("keydown", (e) => {
    if (currentIndex < 0) return;
    const ep = EPISODES[currentIndex];
    let handled = true;
    switch (e.key) {
      case "ArrowRight": position = Math.min(ep.duration, position + 15); break;
      case "ArrowLeft": position = Math.max(0, position - 15); break;
      case "Home": position = 0; break;
      case "End": position = ep.duration; break;
      case " ":
      case "Enter": togglePlay(); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); updateProgress(); }
  });

  // ---------- wiring ----------
  $("#playToggle").addEventListener("click", togglePlay);
  $("#playToggle2").addEventListener("click", togglePlay);
  $("#expandToggle").addEventListener("click", toggleExpand);
  $("#skipBack").addEventListener("click", () => { seekBy(-15); toast("Back 15s"); });
  $("#skipBack2").addEventListener("click", () => { seekBy(-15); toast("Back 15s"); });
  $("#skipFwd").addEventListener("click", () => { seekBy(15); toast("Forward 15s"); });
  $("#prevEp").addEventListener("click", () => step(-1));
  $("#nextEp").addEventListener("click", () => step(1));

  // global keyboard: space toggles when not typing in a control
  document.addEventListener("keydown", (e) => {
    if (e.key === " " && !player.hidden && e.target === document.body) {
      e.preventDefault();
      togglePlay();
    }
  });
})();
