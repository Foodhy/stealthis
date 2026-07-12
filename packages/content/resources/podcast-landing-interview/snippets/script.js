(function () {
  "use strict";

  /* ---------- data ---------- */
  var guests = [
    { init: "YT", name: "Yuki Tanaka", role: "Robotics founder", tag: "Ep. 148", g1: "#f472b6", g2: "#8b5cf6" },
    { init: "RA", name: "Rosa Alvarez", role: "Climate economist", tag: "Ep. 145", g1: "#22d3ee", g2: "#8b5cf6" },
    { init: "DK", name: "Dele Okafor", role: "Neuroscientist", tag: "Ep. 141", g1: "#8b5cf6", g2: "#22d3ee" },
    { init: "ML", name: "Mira Lindqvist", role: "Composer", tag: "Ep. 138", g1: "#f472b6", g2: "#22d3ee" },
    { init: "SC", name: "Samuel Cho", role: "Chess grandmaster", tag: "Ep. 133", g1: "#8b5cf6", g2: "#f472b6" },
    { init: "PN", name: "Priya Nair", role: "Marine biologist", tag: "Ep. 129", g1: "#22d3ee", g2: "#f472b6" },
    { init: "TB", name: "Tomas Berg", role: "Documentary director", tag: "Ep. 124", g1: "#8b5cf6", g2: "#22d3ee" },
    { init: "AW", name: "Amara Wells", role: "Type designer", tag: "Ep. 120", g1: "#f472b6", g2: "#8b5cf6" }
  ];

  var episodes = [
    { n: 148, s: "S8", title: "Machines that learn to doubt", guest: "Yuki Tanaka", role: "Robotics founder", dur: "1:32:04", sec: 5524 },
    { n: 147, s: "S8", title: "The economics of a warming coast", guest: "Rosa Alvarez", role: "Climate economist", dur: "1:18:41", sec: 4721 },
    { n: 146, s: "S8", title: "What memory forgets on purpose", guest: "Dele Okafor", role: "Neuroscientist", dur: "1:44:12", sec: 6252 },
    { n: 144, s: "S7", title: "Writing music for silence", guest: "Mira Lindqvist", role: "Composer", dur: "1:07:55", sec: 4075 },
    { n: 142, s: "S7", title: "Thinking twelve moves ahead", guest: "Samuel Cho", role: "Chess grandmaster", dur: "1:21:30", sec: 4890 },
    { n: 131, s: "S6", title: "Down where the light stops", guest: "Priya Nair", role: "Marine biologist", dur: "1:29:18", sec: 5358 },
    { n: 126, s: "S6", title: "Cutting a story from 400 hours", guest: "Tomas Berg", role: "Documentary director", dur: "1:12:47", sec: 4367 }
  ];

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- subscribe buttons ---------- */
  $$("[data-sub]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Opening " + b.getAttribute("data-sub") + " — thanks for following!");
    });
  });

  /* ---------- render guests ---------- */
  var grid = $("#guestGrid");
  guests.forEach(function (g) {
    var li = document.createElement("li");
    li.className = "guest-card";
    li.innerHTML =
      '<span class="ava" style="--g1:' + g.g1 + ';--g2:' + g.g2 + '">' + g.init + "</span>" +
      '<div class="g-name">' + g.name + "</div>" +
      '<div class="g-role">' + g.role + "</div>" +
      '<span class="g-tag">' + g.tag + "</span>";
    grid.appendChild(li);
  });

  /* ---------- render episodes ---------- */
  var epList = $("#epList");
  function renderEpisodes(filter) {
    epList.innerHTML = "";
    episodes
      .filter(function (e) { return filter === "all" || e.s === filter; })
      .forEach(function (e) {
        var li = document.createElement("li");
        li.className = "ep";
        li.dataset.n = e.n;
        li.dataset.season = e.s;
        var seasonNum = e.s.replace("S", "");
        li.innerHTML =
          '<button class="ep-play" aria-label="Play episode ' + e.n + ': ' + e.title + '"></button>' +
          '<div class="ep-meta">' +
          '<div class="ep-top">' +
          '<span class="ep-num">EP ' + e.n + "</span>" +
          '<span class="ep-season">Season ' + seasonNum + "</span>" +
          "</div>" +
          '<div class="ep-title">' + e.title + "</div>" +
          '<div class="ep-guest">with <b>' + e.guest + "</b> · " + e.role + "</div>" +
          "</div>" +
          '<span class="ep-dur">' + e.dur + "</span>";
        li.querySelector(".ep-play").addEventListener("click", function () { playEpisode(e); });
        epList.appendChild(li);
      });
    highlightPlaying();
  }

  /* ---------- filters ---------- */
  $$(".chip[data-filter]").forEach(function (c) {
    c.addEventListener("click", function () {
      $$(".chip[data-filter]").forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      c.classList.add("is-active");
      c.setAttribute("aria-selected", "true");
      renderEpisodes(c.getAttribute("data-filter"));
    });
  });

  /* ---------- mini player ---------- */
  var player = $("#player");
  var ppBtn = $("#ppBtn");
  var ppIco = $(".pp-ico", ppBtn);
  var eq = $("#eq");
  var nowTitle = $("#nowTitle");
  var nowGuest = $("#nowGuest");
  var fill = $("#fill");
  var bar = $("#bar");
  var tCur = $("#tCur");
  var tDur = $("#tDur");

  var current = null;
  var elapsed = 0;
  var playing = false;
  var tick;

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function highlightPlaying() {
    $$(".ep").forEach(function (li) {
      li.classList.toggle("is-playing", current && +li.dataset.n === current.n && playing);
    });
  }

  function setProgress() {
    var pct = current ? (elapsed / current.sec) * 100 : 0;
    fill.style.width = Math.min(100, pct) + "%";
    tCur.textContent = fmt(elapsed);
    bar.setAttribute("aria-valuenow", Math.round(Math.min(100, pct)));
  }

  function loop() {
    tick = setInterval(function () {
      if (!playing || !current) return;
      elapsed += 1;
      if (elapsed >= current.sec) { elapsed = current.sec; setPlaying(false); }
      setProgress();
    }, 1000);
  }

  function setPlaying(state) {
    playing = state;
    ppIco.setAttribute("data-state", state ? "pause" : "play");
    ppBtn.setAttribute("aria-label", state ? "Pause" : "Play");
    eq.classList.toggle("on", state);
    highlightPlaying();
  }

  function playEpisode(e) {
    var same = current && current.n === e.n;
    current = e;
    if (!same) { elapsed = 0; }
    player.hidden = false;
    nowTitle.textContent = "EP " + e.n + " · " + e.title;
    nowGuest.textContent = "with " + e.guest;
    tDur.textContent = fmt(e.sec);
    setProgress();
    setPlaying(true);
    if (!tick) loop();
    toast("Now playing · " + e.title);
  }

  ppBtn.addEventListener("click", function () {
    if (!current) return;
    setPlaying(!playing);
  });

  $("#pClose").addEventListener("click", function () {
    setPlaying(false);
    player.hidden = true;
    current = null;
    highlightPlaying();
  });

  /* seek */
  function seekFromEvent(clientX) {
    if (!current) return;
    var r = bar.getBoundingClientRect();
    var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    elapsed = Math.round(pct * current.sec);
    setProgress();
  }
  bar.addEventListener("click", function (ev) { seekFromEvent(ev.clientX); });
  bar.addEventListener("keydown", function (ev) {
    if (!current) return;
    if (ev.key === "ArrowRight") { elapsed = Math.min(current.sec, elapsed + 15); setProgress(); ev.preventDefault(); }
    else if (ev.key === "ArrowLeft") { elapsed = Math.max(0, elapsed - 15); setProgress(); ev.preventDefault(); }
    else if (ev.key === " " || ev.key === "Enter") { setPlaying(!playing); ev.preventDefault(); }
  });

  /* hero play → first episode */
  $("#heroPlay").addEventListener("click", function () { playEpisode(episodes[0]); });

  /* ---------- hero waveform ---------- */
  var wave = $("#heroWave");
  var bars = 40;
  for (var i = 0; i < bars; i++) wave.appendChild(document.createElement("i"));
  var waveBars = $$("i", wave);
  setInterval(function () {
    waveBars.forEach(function (b, idx) {
      var base = playing ? 30 : 12;
      var amp = playing ? 60 : 34;
      var h = base + Math.abs(Math.sin(Date.now() / 320 + idx * 0.5)) * amp;
      b.style.height = h.toFixed(0) + "%";
    });
  }, 140);

  /* ---------- featured guest rotation ---------- */
  var feat = 0;
  var featName = $("#featName");
  var featRole = $("#featRole");
  var featAva = $(".ava", $("#featGuest"));
  var rotateBtn = $("#rotatePause");
  var rotatePaused = false;
  var rotateTimer;

  function rotate() {
    feat = (feat + 1) % guests.length;
    var g = guests[feat];
    featName.childNodes[0].nodeValue = g.name;
    featRole.textContent = g.role;
    featAva.textContent = g.init;
    featAva.style.setProperty("--g1", g.g1);
    featAva.style.setProperty("--g2", g.g2);
    featAva.style.animation = "none";
    void featAva.offsetWidth;
    featAva.style.animation = "";
  }
  function startRotate() { rotateTimer = setInterval(function () { if (!rotatePaused) rotate(); }, 3600); }
  startRotate();

  rotateBtn.addEventListener("click", function () {
    rotatePaused = !rotatePaused;
    rotateBtn.setAttribute("aria-pressed", String(rotatePaused));
    rotateBtn.textContent = rotatePaused ? "Resume rotation" : "Pause rotation";
    toast(rotatePaused ? "Guest rotation paused" : "Guest rotation resumed");
  });

  /* ---------- newsletter ---------- */
  var form = $("#newsForm");
  var email = $("#email");
  var emailErr = $("#emailErr");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!ok) {
      email.classList.add("invalid");
      emailErr.hidden = false;
      email.focus();
      return;
    }
    email.classList.remove("invalid");
    emailErr.hidden = true;
    toast("Subscribed! Show notes are on the way.");
    email.value = "";
  });
  email.addEventListener("input", function () {
    if (!email.classList.contains("invalid")) return;
    email.classList.remove("invalid");
    emailErr.hidden = true;
  });

  /* ---------- init ---------- */
  renderEpisodes("all");
})();
