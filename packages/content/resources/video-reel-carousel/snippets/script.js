(function () {
  "use strict";

  var REELS = [
    { name: "Neon Harbor", cat: "Commercial", dir: "Mara Vinstin", year: 2026, dur: "0:48", res: "4K · DCI", g: "g0", secs: 48 },
    { name: "Paper Cranes", cat: "Short Film", dir: "Idris Fontaine", year: 2025, dur: "6:12", res: "2K · ProRes", g: "g1", secs: 372 },
    { name: "Static Bloom", cat: "Music Video", dir: "Lena Ortuño", year: 2026, dur: "3:31", res: "6K · RAW", g: "g2", secs: 211 },
    { name: "The Long Field", cat: "Documentary", dir: "Corey Alvane", year: 2024, dur: "12:04", res: "4K · LOG", g: "g3", secs: 724 },
    { name: "Copper Hour", cat: "Fashion", dir: "Nadia Brecht", year: 2026, dur: "1:20", res: "4K · DCI", g: "g4", secs: 80 },
    { name: "Undertow", cat: "Title Sequence", dir: "Sami Kolt", year: 2025, dur: "0:55", res: "5K · RAW", g: "g5", secs: 55 },
  ];

  var track = document.getElementById("track");
  var dotsWrap = document.getElementById("dots");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var tcEl = document.getElementById("timecode");
  var catEl = document.getElementById("active-cat");
  var titleEl = document.getElementById("active-title");
  var byEl = document.getElementById("active-by");
  var toastEl = document.getElementById("toast");

  var cards = [];
  var dots = [];
  var active = 0;
  var tick = null;
  var frame = 0;
  var scrollRaf = null;
  var toastTimer = null;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function playIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  function build() {
    REELS.forEach(function (r, i) {
      var li = document.createElement("li");
      li.className = "card " + (i === 0 ? "is-active" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === 0 ? "true" : "false");
      li.setAttribute("aria-label", r.name + ", " + r.cat + ", " + r.dur);
      li.tabIndex = -1;
      li.innerHTML =
        '<div class="card__poster ' + r.g + '"></div>' +
        '<div class="card__top">' +
          '<span class="chip">' + r.dur + '</span>' +
          '<span class="chip chip--res">' + r.res + '</span>' +
        '</div>' +
        '<div class="card__play">' + playIcon() + '</div>' +
        '<div class="card__bottom">' +
          '<div class="card__cat">' + r.cat + '</div>' +
          '<h3 class="card__name">' + r.name + '</h3>' +
          '<p class="card__dir">Dir. ' + r.dir + ' · ' + r.year + '</p>' +
        '</div>' +
        '<div class="card__progress"></div>';

      li.addEventListener("click", function () {
        if (i === active) {
          toast("Added " + r.name + " to shortlist");
        } else {
          goTo(i, true);
        }
      });
      track.appendChild(li);
      cards.push(li);

      var dot = document.createElement("button");
      dot.className = "dot " + (i === 0 ? "is-active" : "");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to " + r.name);
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        goTo(i, true);
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function fmtTC(elapsed) {
    var f = Math.floor((elapsed % 1) * 24);
    var total = Math.floor(elapsed);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return (
      pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f)
    );
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function startTimecode() {
    stopTimecode();
    var reel = REELS[active];
    var start = performance.now();
    var progressEl = cards[active].querySelector(".card__progress");
    tick = setInterval(function () {
      var elapsed = (performance.now() - start) / 1000;
      // loop the preview relative to a compressed 8s window for demo feel
      var window = Math.min(reel.secs, 8);
      var pos = elapsed % window;
      tcEl.textContent = fmtTC(pos * (reel.secs / window));
      if (progressEl) {
        progressEl.style.width = ((pos / window) * 100).toFixed(1) + "%";
      }
    }, 42);
  }

  function stopTimecode() {
    if (tick) {
      clearInterval(tick);
      tick = null;
    }
    cards.forEach(function (c) {
      var p = c.querySelector(".card__progress");
      if (p) p.style.width = "0";
    });
  }

  function render() {
    cards.forEach(function (c, i) {
      var on = i === active;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
    });
    dots.forEach(function (d, i) {
      var on = i === active;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
    var r = REELS[active];
    // fade footer text
    catEl.style.opacity = "0";
    setTimeout(function () {
      catEl.textContent = r.cat;
      titleEl.textContent = r.name;
      byEl.textContent = "Dir. " + r.dir + " · " + r.year;
      catEl.style.opacity = "1";
    }, 130);
    if (!reduced) startTimecode();
    else {
      stopTimecode();
      tcEl.textContent = "00:00:00:00";
    }
  }

  function centerCard(i, smooth) {
    var card = cards[i];
    var target = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  }

  function goTo(i, smooth) {
    active = (i + REELS.length) % REELS.length;
    centerCard(active, smooth);
    render();
  }

  // keep active in sync while user scrolls / swipes
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = null;
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0;
      var bestDist = Infinity;
      cards.forEach(function (c, i) {
        var mid = c.offsetLeft + c.clientWidth / 2;
        var d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best !== active) {
        active = best;
        render();
      }
    });
  }

  // events
  prevBtn.addEventListener("click", function () {
    goTo(active - 1, true);
  });
  nextBtn.addEventListener("click", function () {
    goTo(active + 1, true);
  });

  track.addEventListener("scroll", onScroll, { passive: true });

  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(REELS.length - 1, true);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toast("Added " + REELS[active].name + " to shortlist");
    }
  });

  window.addEventListener("resize", function () {
    centerCard(active, false);
  });

  build();
  // initial position after layout settles
  requestAnimationFrame(function () {
    centerCard(0, false);
    render();
  });
})();
