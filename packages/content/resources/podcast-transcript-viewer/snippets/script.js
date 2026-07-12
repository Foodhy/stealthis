(function () {
  "use strict";

  /* ---------- Transcript data (fictional) ---------- */
  var TRANSCRIPT = [
    { t: 0, spk: "Mara Ellison", role: "host", text: "Welcome back to Signal Lines. Today we're pulling apart real-time systems — where latency stops being a number and starts being a feeling." },
    { t: 9, spk: "Dev Okafor", role: "guest", text: "Happy to be here. That framing is exactly right — users don't read your P99, they feel the stutter." },
    { t: 18, spk: "Mara Ellison", role: "host", text: "So let's ground it. When you say a system is real-time, what threshold are you actually holding yourself to?" },
    { t: 27, spk: "Dev Okafor", role: "guest", text: "For interactive audio, anything past roughly a hundred milliseconds of round-trip and the conversation starts to feel unnatural." },
    { t: 38, spk: "Dev Okafor", role: "guest", text: "People begin talking over each other, then over-correcting. Trust in the channel quietly erodes." },
    { t: 49, spk: "Mara Ellison", role: "host", text: "Trust is such an interesting word to attach to latency. Say more about that." },
    { t: 57, spk: "Dev Okafor", role: "guest", text: "If a tap doesn't respond instantly, the user assumes it failed and taps again. Now you've got duplicate writes and a support ticket." },
    { t: 69, spk: "Mara Ellison", role: "host", text: "The classic double-submit. So the fix isn't only faster networks, it's honest feedback." },
    { t: 78, spk: "Dev Okafor", role: "guest", text: "Exactly. Optimistic UI buys you enormous headroom. Show the intended state immediately, reconcile in the background." },
    { t: 90, spk: "Dev Okafor", role: "guest", text: "The edge is where this gets fun. Push compute close to the user and a hundred milliseconds becomes fifteen." },
    { t: 101, spk: "Mara Ellison", role: "host", text: "But the edge fragments your state. How do you keep everyone agreeing on the truth?" },
    { t: 110, spk: "Dev Okafor", role: "guest", text: "You stop pretending there's one truth at one instant. You lean on CRDTs and let regions converge." },
    { t: 122, spk: "Mara Ellison", role: "host", text: "Convergence over consensus. That's a whole mindset shift for teams raised on a single database." },
    { t: 132, spk: "Dev Okafor", role: "guest", text: "It is. And the hardest part isn't the algorithm, it's convincing people that eventual can still feel instant." },
    { t: 144, spk: "Mara Ellison", role: "host", text: "Let's talk failure. When the edge node dies mid-session, what does a graceful degrade look like?" },
    { t: 154, spk: "Dev Okafor", role: "guest", text: "You fail over to a warm region and you tell the user nothing dramatic. A tiny reconnecting chip, then silence." },
    { t: 166, spk: "Dev Okafor", role: "guest", text: "Loud error banners train users to distrust the whole product. Quiet recovery earns the opposite." },
    { t: 177, spk: "Mara Ellison", role: "host", text: "I love that — the best reliability work is often invisible on purpose." },
    { t: 186, spk: "Dev Okafor", role: "guest", text: "Right. Nobody praises the bridge that simply held. They just keep crossing it." },
    { t: 196, spk: "Mara Ellison", role: "host", text: "Before we wrap, one tool or habit you'd hand a team starting their first real-time feature." },
    { t: 206, spk: "Dev Okafor", role: "guest", text: "Instrument latency from day one, per user, not per average. Averages hide the people you're losing." },
    { t: 218, spk: "Mara Ellison", role: "host", text: "Measure the tail, protect the trust. That's a clean note to end on." },
    { t: 227, spk: "Dev Okafor", role: "guest", text: "Thanks for having me — this was the good kind of nerdy." },
    { t: 235, spk: "Mara Ellison", role: "host", text: "That's it for episode 142. Transcript's synced below, links in the show notes. See you next week." },
  ];

  var DURATION = 248; // seconds

  /* ---------- Elements ---------- */
  var linesEl = document.getElementById("lines");
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var clearEl = document.getElementById("clear");
  var playBtn = document.getElementById("playBtn");
  var seekEl = document.getElementById("seek");
  var waveEl = document.getElementById("wave");
  var curEl = document.getElementById("cur");
  var durEl = document.getElementById("dur");
  var toastEl = document.getElementById("toast");

  var state = { time: 0, playing: false, activeIdx: -1, query: "" };
  var rowEls = [];
  var timer = null;
  var toastTimer = null;

  /* ---------- Helpers ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function esc(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ---------- Waveform (decorative bars) ---------- */
  function buildWave() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 56; i++) {
      var bar = document.createElement("span");
      var h = 22 + Math.abs(Math.sin(i * 0.9) * 60) + (i % 4) * 6;
      bar.style.height = Math.min(94, h) + "%";
      frag.appendChild(bar);
    }
    waveEl.appendChild(frag);
  }

  /* ---------- Render transcript ---------- */
  function render() {
    var q = state.query.trim().toLowerCase();
    linesEl.innerHTML = "";
    rowEls = [];
    var shown = 0;

    TRANSCRIPT.forEach(function (item, idx) {
      if (q && item.text.toLowerCase().indexOf(q) === -1) return;
      shown++;

      var li = document.createElement("li");
      li.className = "line";
      li.tabIndex = 0;
      li.dataset.idx = idx;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", "Seek to " + fmt(item.t) + ", " + item.spk);

      var roleCls = item.role === "host" ? "host" : "guest";
      li.innerHTML =
        '<span class="stamp">' + fmt(item.t) + "</span>" +
        '<span class="body ' + roleCls + '">' +
        '<span class="spk">' + esc(item.spk) + "</span>" +
        '<span class="text">' + highlight(item.text, state.query.trim()) + "</span>" +
        "</span>";

      rowEls[idx] = li;
      linesEl.appendChild(li);
    });

    emptyEl.hidden = shown !== 0;
    if (q) {
      countEl.textContent = shown + (shown === 1 ? " match" : " matches");
    } else {
      countEl.textContent = TRANSCRIPT.length + " lines";
    }
    paintActive();
  }

  /* ---------- Active line sync ---------- */
  function currentIndex() {
    var idx = 0;
    for (var i = 0; i < TRANSCRIPT.length; i++) {
      if (state.time >= TRANSCRIPT[i].t) idx = i;
      else break;
    }
    return idx;
  }

  function paintActive() {
    var idx = currentIndex();
    rowEls.forEach(function (el) {
      if (el) el.classList.remove("active");
    });
    if (rowEls[idx]) rowEls[idx].classList.add("active");
  }

  function scrollTo(idx) {
    var el = rowEls[idx];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------- Playback clock ---------- */
  function updateTransport() {
    var pct = (state.time / DURATION) * 100;
    seekEl.value = pct;
    waveEl.style.setProperty("--played", pct + "%");
    curEl.textContent = fmt(state.time);
  }

  function tick() {
    state.time += 0.5;
    if (state.time >= DURATION) {
      state.time = DURATION;
      pause();
      toast("End of episode");
    }
    updateTransport();
    var idx = currentIndex();
    if (idx !== state.activeIdx) {
      state.activeIdx = idx;
      paintActive();
      if (state.playing) scrollTo(idx);
    }
  }

  function play() {
    if (state.playing) return;
    if (state.time >= DURATION) state.time = 0;
    state.playing = true;
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pause episode");
    timer = setInterval(tick, 500);
  }

  function pause() {
    state.playing = false;
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Play episode");
    clearInterval(timer);
    timer = null;
  }

  function seekToTime(sec, opts) {
    opts = opts || {};
    state.time = Math.max(0, Math.min(DURATION, sec));
    updateTransport();
    var idx = currentIndex();
    state.activeIdx = idx;
    paintActive();
    if (opts.scroll) scrollTo(idx);
  }

  /* ---------- Events ---------- */
  playBtn.addEventListener("click", function () {
    if (state.playing) {
      pause();
    } else {
      play();
      toast("Playing");
    }
  });

  seekEl.addEventListener("input", function () {
    seekToTime((seekEl.value / 100) * DURATION);
  });

  linesEl.addEventListener("click", function (e) {
    var li = e.target.closest(".line");
    if (!li) return;
    activateLine(li);
  });

  linesEl.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var li = e.target.closest(".line");
    if (!li) return;
    e.preventDefault();
    activateLine(li);
  });

  function activateLine(li) {
    var idx = Number(li.dataset.idx);
    seekToTime(TRANSCRIPT[idx].t, { scroll: true });
    toast("Seeked to " + fmt(TRANSCRIPT[idx].t));
  }

  function runSearch() {
    state.query = searchEl.value;
    clearEl.hidden = state.query.length === 0;
    render();
  }

  searchEl.addEventListener("input", runSearch);

  clearEl.addEventListener("click", function () {
    searchEl.value = "";
    state.query = "";
    clearEl.hidden = true;
    render();
    searchEl.focus();
  });

  /* ---------- Init ---------- */
  buildWave();
  durEl.textContent = fmt(DURATION);
  updateTransport();
  render();
})();
