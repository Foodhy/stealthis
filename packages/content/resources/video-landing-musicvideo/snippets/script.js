(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("show");
    });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 400);
    }, 3400);
  }

  /* ---------- Reel data ---------- */
  var reel = [
    { title: "Voltage", artist: "Sable Voss", genre: "pop", g: "Pop", rt: "3:42", streams: "48.2M streams", grad: "linear-gradient(150deg,#ff3d9a,#9b6cff)" },
    { title: "Concrete Kings", artist: "MAVYN", genre: "hiphop", g: "Hip-hop", rt: "4:08", streams: "31.7M streams", grad: "linear-gradient(150deg,#ffb020,#ff4d4d)" },
    { title: "Afterglow", artist: "DJ Kestrel", genre: "electronic", g: "Electronic", rt: "5:16", streams: "62.0M streams", grad: "linear-gradient(150deg,#24e0d0,#1a8cff)" },
    { title: "Paper Skies", artist: "HALO", genre: "indie", g: "Indie", rt: "3:11", streams: "12.4M streams", grad: "linear-gradient(150deg,#9b6cff,#24e0d0)" },
    { title: "Riptide City", artist: "Nova Reyes", genre: "pop", g: "Pop", rt: "3:28", streams: "27.9M streams", grad: "linear-gradient(150deg,#ff4d4d,#ffb020)" },
    { title: "808 Cathedral", artist: "Bishop Lane", genre: "hiphop", g: "Hip-hop", rt: "3:55", streams: "40.1M streams", grad: "linear-gradient(150deg,#1a1a2e,#ff3d9a)" },
    { title: "Strobe Heaven", artist: "AXL Grid", genre: "electronic", g: "Electronic", rt: "6:02", streams: "55.6M streams", grad: "linear-gradient(150deg,#24e0d0,#9b6cff)" },
    { title: "Slow Comedown", artist: "The Fever Maps", genre: "indie", g: "Indie", rt: "4:20", streams: "9.8M streams", grad: "linear-gradient(150deg,#ffb020,#9b6cff)" },
    { title: "Neon Baptism", artist: "Sable Voss", genre: "pop", g: "Pop", rt: "3:37", streams: "18.5M streams", grad: "linear-gradient(150deg,#9b6cff,#ff3d9a)" }
  ];

  var grid = document.getElementById("reelGrid");

  function render(cards) {
    grid.innerHTML = "";
    cards.forEach(function (c, i) {
      var card = document.createElement("article");
      card.className = "reel-card";
      card.dataset.genre = c.genre;
      card.style.animationDelay = i * 0.05 + "s";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Play " + c.title + " by " + c.artist);
      card.innerHTML =
        '<div class="cover" style="background:' + c.grad + '"></div>' +
        '<div class="grain"></div><div class="shade"></div>' +
        '<div class="reel-top">' +
          '<span class="genre-badge">' + c.g + "</span>" +
          '<span class="runtime">' + c.rt + "</span>" +
        "</div>" +
        '<div class="play-hint" aria-hidden="true">▶</div>' +
        '<div class="reel-info">' +
          "<h3>" + c.title + "</h3>" +
          '<span class="artist">' + c.artist + "</span>" +
          '<span class="stream">' + c.streams + "</span>" +
        "</div>";
      function open() {
        toast("▶ Loading “" + c.title + "” — " + c.artist);
      }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
      grid.appendChild(card);
    });
  }
  render(reel);

  /* ---------- Filters ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.dataset.filter;
      var filtered = f === "all" ? reel : reel.filter(function (r) { return r.genre === f; });
      render(filtered);
    });
  });

  /* ---------- Hero timecode + play ---------- */
  var heroTc = document.getElementById("heroTc");
  var scrubFill = document.getElementById("scrubFill");
  var framePlay = document.getElementById("framePlay");
  var playReel = document.getElementById("playReel");
  var playing = false;
  var frames = 0;
  var timer = null;
  var TOTAL = 25 * 90; // ~90s reel at 25fps

  function fmt(f) {
    var totalSec = Math.floor(f / 25);
    var hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    var ss = String(totalSec % 60).padStart(2, "0");
    var ff = String(f % 25).padStart(2, "0");
    return hh + ":" + mm + ":" + ss + ":" + ff;
  }

  function tick() {
    frames = (frames + 1) % TOTAL;
    heroTc.textContent = fmt(frames);
    scrubFill.style.width = (frames / TOTAL) * 100 + "%";
  }

  function setPlaying(state) {
    playing = state;
    framePlay.classList.toggle("is-playing", playing);
    framePlay.innerHTML = playing ? '<span aria-hidden="true">❚❚</span>' : '<span aria-hidden="true">▶</span>';
    framePlay.setAttribute("aria-label", playing ? "Pause showreel preview" : "Play showreel preview");
    if (playing) {
      timer = setInterval(tick, 40);
      toast("● Showreel playing — SHOWREEL_2026.mov");
    } else {
      clearInterval(timer);
    }
  }

  framePlay.addEventListener("click", function () { setPlaying(!playing); });
  playReel.addEventListener("click", function () {
    if (!playing) setPlaying(true);
    document.getElementById("hero").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- Stat counters ---------- */
  var stats = document.querySelectorAll(".stat");
  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    stats.forEach(function (stat) {
      var target = parseInt(stat.dataset.count, 10);
      var suffix = stat.dataset.suffix || "";
      var num = stat.querySelector(".stat-num");
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window) {
    var statSection = document.getElementById("stats");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCounts();
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(statSection);
  } else {
    runCounts();
  }

  /* ---------- Booking brief ---------- */
  var form = document.getElementById("bookForm");
  var fArtist = document.getElementById("fArtist");
  var fLength = document.getElementById("fLength");
  var fDate = document.getElementById("fDate");
  var fRush = document.getElementById("fRush");
  var lenOut = document.getElementById("lenOut");
  var bArtist = document.getElementById("bArtist");
  var bPkg = document.getElementById("bPkg");
  var bLen = document.getElementById("bLen");
  var bDate = document.getElementById("bDate");
  var bTotal = document.getElementById("bTotal");
  var briefStatus = document.getElementById("briefStatus");

  function mmss(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function currentPkg() {
    return document.querySelector('input[name="pkg"]:checked');
  }

  function update() {
    var lenSec = parseInt(fLength.value, 10);
    lenOut.textContent = mmss(lenSec);
    bLen.textContent = mmss(lenSec);

    bArtist.textContent = fArtist.value.trim() || "—";

    var pkg = currentPkg();
    bPkg.textContent = pkg.value;

    bDate.textContent = fDate.value ? fDate.value : "—";

    var base = parseInt(pkg.dataset.base, 10);
    // add for length beyond baseline 3:30 (210s): $60 per extra 15s
    var extraLen = Math.max(0, lenSec - 210);
    var lenCost = (extraLen / 15) * 600;
    var total = base + lenCost;
    if (fRush.checked) total = Math.round(total * 1.2);
    bTotal.textContent = money(total);

    var ready = fArtist.value.trim() && fDate.value;
    briefStatus.textContent = ready ? "Ready" : "Draft";
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  // set date min to today
  var today = new Date();
  fDate.min = today.toISOString().split("T")[0];

  update();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!fArtist.value.trim()) {
      toast("Add your artist / project name first.");
      fArtist.focus();
      return;
    }
    if (!/\S+@\S+\.\S+/.test(document.getElementById("fEmail").value)) {
      toast("Enter a valid email so we can reply.");
      document.getElementById("fEmail").focus();
      return;
    }
    if (!fDate.value) {
      toast("Pick a preferred shoot date.");
      fDate.focus();
      return;
    }
    briefStatus.textContent = "Sent";
    toast("✓ Brief sent for " + fArtist.value.trim() + " — we'll reply within a day!");
    form.reset();
    setTimeout(update, 50);
  });
})();
