(function () {
  "use strict";

  /* ---------- tiny toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- today's date in masthead ---------- */
  var dateEl = document.getElementById("todayDate");
  if (dateEl) {
    try {
      dateEl.textContent = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch (e) {
      /* leave fallback text */
    }
  }

  /* ---------- breaking-headline ticker ---------- */
  var tickerLine = document.getElementById("tickerLine");
  var tickerToggle = document.getElementById("tickerToggle");
  var headlines = [
    "<b>BREAKING:</b> Pop icon &lsquo;walks out&rsquo; mid-gig &mdash; 60,000 left in the dark",
    "<b>JUST IN:</b> TV chef admits soup was &lsquo;straight from a tin&rsquo; in court drama",
    "<b>WEATHER:</b> 99&deg; HEATWAVE to roast Britain this Bank Holiday weekend",
    "<b>TRANSFER:</b> City eye shock &pound;90m move for the &lsquo;Wizard&rsquo;",
    "<b>BIZARRE:</b> &lsquo;UFO&rsquo; spotted hovering over seaside bingo hall",
    "<b>WIN:</b> Grab today&rsquo;s golden token &mdash; &pound;50,000 up for grabs!",
  ];
  var tIndex = 0;
  var tPaused = false;
  var tTimer = null;

  function showHeadline(i) {
    if (!tickerLine) return;
    tickerLine.style.opacity = "0";
    window.setTimeout(function () {
      tickerLine.innerHTML = headlines[i];
      tickerLine.style.opacity = "1";
    }, 250);
  }

  function advanceTicker() {
    tIndex = (tIndex + 1) % headlines.length;
    showHeadline(tIndex);
  }

  function startTicker() {
    window.clearInterval(tTimer);
    tTimer = window.setInterval(function () {
      if (!tPaused) advanceTicker();
    }, 3800);
  }

  if (tickerLine) {
    showHeadline(0);
    startTicker();
  }

  if (tickerToggle) {
    tickerToggle.addEventListener("click", function () {
      tPaused = !tPaused;
      tickerToggle.setAttribute("aria-pressed", String(tPaused));
      tickerToggle.setAttribute("aria-label", tPaused ? "Play ticker" : "Pause ticker");
      var ico = tickerToggle.querySelector(".ticker__btn-ico");
      if (ico) ico.textContent = tPaused ? "▶" : "II";
      toast(tPaused ? "Ticker paused" : "Ticker running");
    });
  }

  /* ---------- teaser carousel ---------- */
  var teaserData = [
    { kick: "ROYALS", txt: "Palace &lsquo;in meltdown&rsquo; over the missing corgi", pg: "PAGE 2" },
    { kick: "DIET", txt: "Lose a stone eating CHIPS &mdash; the doc says yes!", pg: "PAGE 10" },
    { kick: "TELLY", txt: "Soap legend QUITS after 30 years on the cobbles", pg: "PAGE 14" },
    { kick: "MONEY", txt: "The 5 bills you&rsquo;re overpaying RIGHT NOW", pg: "PAGE 19" },
    { kick: "SHOCK", txt: "Lottery winner buys an island&hellip; then loses the key", pg: "PAGE 21" },
    { kick: "HEALTH", txt: "Doctors&rsquo; one tip to sleep like a baby tonight", pg: "PAGE 25" },
    { kick: "GADGET", txt: "Robot vac &lsquo;adopts&rsquo; family cat as its own", pg: "PAGE 27" },
    { kick: "FOOTIE", txt: "Keeper saves penalty&hellip; with his BACKSIDE", pg: "BACK PAGE" },
  ];
  var track = document.getElementById("teaserTrack");
  var prevBtn = document.getElementById("teaserPrev");
  var nextBtn = document.getElementById("teaserNext");
  var page = 0;

  function perPage() {
    return window.matchMedia("(max-width: 720px)").matches ? 2 : 4;
  }

  function renderTeasers() {
    if (!track) return;
    var n = perPage();
    var pages = Math.ceil(teaserData.length / n);
    if (page >= pages) page = 0;
    if (page < 0) page = pages - 1;
    var start = page * n;
    var slice = teaserData.slice(start, start + n);
    track.innerHTML = "";
    slice.forEach(function (t) {
      var a = document.createElement("a");
      a.className = "teaser";
      a.href = "#top";
      a.setAttribute("role", "listitem");
      a.innerHTML =
        '<span class="teaser__kick">' + t.kick + "</span>" +
        '<span class="teaser__txt">' + t.txt + "</span>" +
        '<span class="teaser__pg">&rarr; ' + t.pg + "</span>";
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        toast("Story " + t.pg + " — demo only");
      });
      track.appendChild(a);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      page++;
      renderTeasers();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      page--;
      renderTeasers();
    });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderTeasers, 150);
  });
  renderTeasers();

  /* auto-advance teasers slowly, pause on hover/focus */
  var teaserAuto = window.setInterval(function () {
    if (track && (track.matches(":hover") || track.contains(document.activeElement))) return;
    page++;
    renderTeasers();
  }, 6500);
  window.addEventListener("beforeunload", function () {
    window.clearInterval(teaserAuto);
  });

  /* ---------- read full story button ---------- */
  var readBtn = document.getElementById("readFull");
  if (readBtn) {
    readBtn.addEventListener("click", function () {
      toast("Continued on pages 4–9 — fictional demo");
    });
  }

  /* ---------- WIN form ---------- */
  var winForm = document.getElementById("winForm");
  var winEmail = document.getElementById("winEmail");
  if (winForm && winEmail) {
    winForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var val = winEmail.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        winEmail.setAttribute("aria-invalid", "true");
        winEmail.focus();
        toast("Pop in a valid email to enter!");
        return;
      }
      winEmail.removeAttribute("aria-invalid");
      winEmail.value = "";
      toast("You're in the draw — good luck! (demo)");
    });
    winEmail.addEventListener("input", function () {
      if (winEmail.getAttribute("aria-invalid") === "true") {
        winEmail.removeAttribute("aria-invalid");
      }
    });
  }
})();
