(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- Toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------------- Concert data ---------------- */
  var concerts = [
    {
      day: "11",
      mon: "Oct",
      month: "Oct",
      series: "Masterworks",
      title: "An Evening of Beethoven",
      conductor: "Élise Maron",
      soloist: "Anwar Beck, piano",
      time: "Sat · 7:30pm",
      price: 38,
      seats: 220,
      programme: [
        { work: "Coriolan Overture", sub: "Beethoven", dur: "8:00" },
        { work: "Piano Concerto No. 4", sub: "Beethoven · Anwar Beck", dur: "34:00" },
        { work: "Symphony No. 7", sub: "Beethoven", dur: "39:00" }
      ]
    },
    {
      day: "25",
      mon: "Oct",
      month: "Oct",
      series: "New Voices",
      title: "Reservoir — A Premiere",
      conductor: "Élise Maron",
      soloist: "Composer in residence: Talia Wren",
      time: "Sat · 7:30pm",
      price: 32,
      seats: 18,
      programme: [
        { work: "Midnight Reservoir", sub: "Talia Wren · world premiere", dur: "22:00" },
        { work: "The Lark Ascending", sub: "Vaughan Williams", dur: "15:00" },
        { work: "Symphony No. 5", sub: "Sibelius", dur: "31:00" }
      ]
    },
    {
      day: "09",
      mon: "Nov",
      month: "Nov",
      series: "Recital",
      title: "Cello by Candlelight",
      conductor: "—",
      soloist: "Mira Solveig, cello",
      time: "Sun · 6:00pm",
      price: 26,
      seats: 64,
      programme: [
        { work: "Cello Suite No. 1", sub: "J.S. Bach", dur: "18:00" },
        { work: "Sonata in G minor", sub: "Rachmaninoff", dur: "33:00" },
        { work: "Paper Lanterns", sub: "Talia Wren · encore", dur: "5:00" }
      ]
    },
    {
      day: "22",
      mon: "Nov",
      month: "Nov",
      series: "Masterworks",
      title: "The Romantic Imagination",
      conductor: "Henri Vael",
      soloist: "Anwar Beck, piano",
      time: "Sat · 7:30pm",
      price: 42,
      seats: 140,
      programme: [
        { work: "Hebrides Overture", sub: "Mendelssohn", dur: "10:00" },
        { work: "Piano Concerto No. 2", sub: "Brahms · Anwar Beck", dur: "48:00" },
        { work: "Symphonic Dances", sub: "Rachmaninoff", dur: "35:00" }
      ]
    },
    {
      day: "17",
      mon: "Jan",
      month: "Jan",
      series: "Masterworks",
      title: "New Year, New World",
      conductor: "Élise Maron",
      soloist: "Aurelian Chorus",
      time: "Sat · 7:30pm",
      price: 46,
      seats: 9,
      programme: [
        { work: "Symphony No. 9 ‘From the New World’", sub: "Dvořák", dur: "42:00" },
        { work: "Te Deum", sub: "Bruckner · with chorus", dur: "24:00" }
      ]
    },
    {
      day: "31",
      mon: "Jan",
      month: "Jan",
      series: "New Voices",
      title: "Strings After Dark",
      conductor: "Henri Vael",
      soloist: "Quartet in residence",
      time: "Sat · 9:00pm",
      price: 24,
      seats: 110,
      programme: [
        { work: "Velvet Static", sub: "Talia Wren", dur: "16:00" },
        { work: "Metamorphosen", sub: "R. Strauss", dur: "26:00" },
        { work: "Adagio for Strings", sub: "Barber", dur: "9:00" }
      ]
    },
    {
      day: "14",
      mon: "Mar",
      month: "Mar",
      series: "Recital",
      title: "A Soprano in Spring",
      conductor: "—",
      soloist: "Liora Fenn, soprano",
      time: "Sat · 7:30pm",
      price: 30,
      seats: 70,
      programme: [
        { work: "Four Last Songs", sub: "R. Strauss · Liora Fenn", dur: "22:00" },
        { work: "Knoxville: Summer of 1915", sub: "Barber", dur: "16:00" },
        { work: "Neon Tides", sub: "Talia Wren · song cycle", dur: "19:00" }
      ]
    },
    {
      day: "28",
      mon: "Mar",
      month: "Mar",
      series: "Masterworks",
      title: "Mahler's Resurrection",
      conductor: "Élise Maron",
      soloist: "Aurelian Chorus & soloists",
      time: "Sat · 7:00pm",
      price: 52,
      seats: 4,
      programme: [
        { work: "Symphony No. 2 ‘Resurrection’", sub: "Mahler · with chorus", dur: "85:00" }
      ]
    },
    {
      day: "16",
      mon: "May",
      month: "May",
      series: "Masterworks",
      title: "Season Finale: Firebird",
      conductor: "Élise Maron",
      soloist: "Mira Solveig, cello",
      time: "Sat · 7:30pm",
      price: 48,
      seats: 32,
      programme: [
        { work: "Cello Concerto", sub: "Elgar · Mira Solveig", dur: "30:00" },
        { work: "The Firebird Suite", sub: "Stravinsky", dur: "23:00" },
        { work: "Enigma Variations ‘Nimrod’", sub: "Elgar · finale", dur: "4:00" }
      ]
    }
  ];

  /* ---------------- Render concerts ---------------- */
  var listEl = document.getElementById("concerts");
  var emptyEl = document.getElementById("concertsEmpty");
  var chevSvg =
    '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function programmeRows(items) {
    return items
      .map(function (p) {
        return (
          '<li><span class="work">' +
          p.work +
          "<small>" +
          p.sub +
          "</small></span><span class=\"dur\">" +
          p.dur +
          "</span></li>"
        );
      })
      .join("");
  }

  function buildConcert(c, i) {
    var li = document.createElement("li");
    li.className = "concert";
    li.dataset.month = c.month;
    li.dataset.series = c.series;

    var low = c.seats <= 20;
    var panelId = "panel-" + i;
    var headId = "head-" + i;

    li.innerHTML =
      '<button class="concert__head" id="' +
      headId +
      '" type="button" aria-expanded="false" aria-controls="' +
      panelId +
      '">' +
      '<span class="concert__date"><span class="concert__day">' +
      c.day +
      '</span><span class="concert__mon">' +
      c.mon +
      "</span></span>" +
      '<span class="concert__main">' +
      '<span class="concert__series">' +
      c.series +
      "</span>" +
      '<span class="concert__title">' +
      c.title +
      "</span>" +
      '<span class="concert__people">' +
      (c.conductor !== "—" ? "Cond. <b>" + c.conductor + "</b> · " : "") +
      c.soloist +
      "</span>" +
      "</span>" +
      '<span class="concert__aside">' +
      '<span class="concert__time">' +
      c.time +
      "</span>" +
      '<span class="concert__chev">' +
      chevSvg +
      "</span>" +
      "</span>" +
      "</button>" +
      '<div class="concert__panel" id="' +
      panelId +
      '" role="region" aria-labelledby="' +
      headId +
      '">' +
      '<div class="concert__panel-inner">' +
      '<div class="programme"><h4>Programme</h4><ul>' +
      programmeRows(c.programme) +
      "</ul></div>" +
      '<div class="concert__buy">' +
      '<span class="concert__price">£' +
      c.price +
      "<small> from</small></span>" +
      '<span class="concert__seats' +
      (low ? " low" : "") +
      '">' +
      (low ? "Only " + c.seats + " seats left" : c.seats + " seats available") +
      "</span>" +
      '<button class="btn btn--gold concert__ticket" type="button">Tickets</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    return li;
  }

  if (listEl) {
    concerts.forEach(function (c, i) {
      listEl.appendChild(buildConcert(c, i));
    });
  }

  /* ---------------- Expand / collapse ---------------- */
  function closePanel(panel, head, concert) {
    panel.style.maxHeight = "0px";
    head.setAttribute("aria-expanded", "false");
    concert.classList.remove("is-open");
  }
  function openPanel(panel, head, concert) {
    panel.style.maxHeight = panel.scrollHeight + 40 + "px";
    head.setAttribute("aria-expanded", "true");
    concert.classList.add("is-open");
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var ticket = e.target.closest(".concert__ticket");
      if (ticket) {
        var concertTitle = ticket
          .closest(".concert")
          .querySelector(".concert__title").textContent;
        toast("Tickets reserved — " + concertTitle);
        return;
      }
      var head = e.target.closest(".concert__head");
      if (!head) return;
      var concert = head.closest(".concert");
      var panel = concert.querySelector(".concert__panel");
      var isOpen = head.getAttribute("aria-expanded") === "true";

      // close any other open ones for a tidy single-open feel
      var others = listEl.querySelectorAll(".concert.is-open");
      others.forEach(function (o) {
        if (o !== concert) {
          closePanel(
            o.querySelector(".concert__panel"),
            o.querySelector(".concert__head"),
            o
          );
        }
      });

      if (isOpen) closePanel(panel, head, concert);
      else openPanel(panel, head, concert);
    });
  }

  /* ---------------- Filters ---------------- */
  var activeMonth = "all";
  var activeSeries = "all";

  function applyFilters() {
    if (!listEl) return;
    var visible = 0;
    listEl.querySelectorAll(".concert").forEach(function (c) {
      var mOk = activeMonth === "all" || c.dataset.month === activeMonth;
      var sOk = activeSeries === "all" || c.dataset.series === activeSeries;
      var show = mOk && sOk;
      c.style.display = show ? "" : "none";
      if (show) visible++;
      else {
        // collapse hidden open panels
        var head = c.querySelector(".concert__head");
        if (head.getAttribute("aria-expanded") === "true") {
          closePanel(c.querySelector(".concert__panel"), head, c);
        }
      }
    });
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  function wireFilterSet(containerId, attr, setter) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      container.querySelectorAll(".chip").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      setter(chip.dataset[attr]);
      applyFilters();
    });
  }

  wireFilterSet("monthFilters", "month", function (v) {
    activeMonth = v;
  });
  wireFilterSet("seriesFilters", "series", function (v) {
    activeSeries = v;
  });

  /* ---------------- Package CTAs ---------------- */
  document.querySelectorAll(".pkg__cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.dataset.pkg + " subscription added — see you at the hall");
    });
  });

  /* ---------------- Hero waveform sampler ---------------- */
  var waveEl = document.getElementById("heroWave");
  var samplerEl = waveEl ? waveEl.closest(".sampler") : null;
  var listenBtn = document.getElementById("heroListen");
  var timeEl = document.getElementById("heroTime");

  var BAR_COUNT = 56;
  var heights = [];
  var bars = [];
  var TOTAL = 134; // 2:14 in seconds

  if (waveEl) {
    for (var b = 0; b < BAR_COUNT; b++) {
      var i = document.createElement("i");
      // a smooth-ish pseudo waveform envelope
      var env = Math.sin((b / BAR_COUNT) * Math.PI);
      var h = 14 + env * 70 + (Math.sin(b * 1.7) + 1) * 12;
      heights.push(Math.max(10, Math.min(100, h)));
      i.style.height = heights[b] + "%";
      waveEl.appendChild(i);
      bars.push(i);
    }
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  var playing = false;
  var rafTimer = null;
  var elapsed = 0;
  var lastTick = 0;

  function setProgressUI() {
    var ratio = elapsed / TOTAL;
    var litCount = Math.floor(ratio * BAR_COUNT);
    for (var k = 0; k < BAR_COUNT; k++) {
      bars[k].classList.toggle("lit", k < litCount);
      bars[k].classList.toggle("active", k === litCount && playing);
    }
    if (timeEl) timeEl.textContent = fmt(elapsed) + " / 2:14";
  }

  function tick(now) {
    if (!playing) return;
    if (!lastTick) lastTick = now;
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    elapsed += dt;

    // gently animate bar heights for a "living" waveform while playing
    if (!prefersReduced) {
      var idx = Math.floor((elapsed / TOTAL) * BAR_COUNT);
      for (var k = Math.max(0, idx - 2); k <= Math.min(BAR_COUNT - 1, idx + 2); k++) {
        var pulse = heights[k] + Math.sin(elapsed * 6 + k) * 10;
        bars[k].style.height = Math.max(10, Math.min(100, pulse)) + "%";
      }
    }

    if (elapsed >= TOTAL) {
      stopPlayback(true);
      return;
    }
    setProgressUI();
    rafTimer = requestAnimationFrame(tick);
  }

  function startPlayback() {
    playing = true;
    lastTick = 0;
    if (samplerEl) samplerEl.classList.add("playing");
    if (listenBtn) {
      listenBtn.classList.add("is-playing");
      listenBtn.setAttribute("aria-pressed", "true");
      listenBtn.querySelector(".listen__label").textContent = "Pause sample";
    }
    toast("Now sampling — Mahler, Symphony No. 2");
    rafTimer = requestAnimationFrame(tick);
  }

  function stopPlayback(ended) {
    playing = false;
    cancelAnimationFrame(rafTimer);
    if (samplerEl) samplerEl.classList.remove("playing");
    if (listenBtn) {
      listenBtn.classList.remove("is-playing");
      listenBtn.setAttribute("aria-pressed", "false");
      listenBtn.querySelector(".listen__label").textContent = "Listen to a sample";
    }
    if (ended) {
      elapsed = 0;
      // restore original heights
      for (var k = 0; k < BAR_COUNT; k++) bars[k].style.height = heights[k] + "%";
      setProgressUI();
    }
  }

  if (listenBtn) {
    listenBtn.addEventListener("click", function () {
      if (playing) stopPlayback(false);
      else startPlayback();
    });
  }
  setProgressUI();

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el, idx) {
      el.style.transitionDelay = Math.min(idx % 5, 4) * 60 + "ms";
      io.observe(el);
    });
  }
})();
