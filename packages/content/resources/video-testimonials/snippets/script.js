(function () {
  "use strict";

  // ---------- Data ----------
  var GRADS = {
    a: "linear-gradient(135deg,#ffb020,#e6971a)",
    b: "linear-gradient(135deg,#ff4d4d,#b81d1d)",
    c: "linear-gradient(135deg,#5eead4,#0d9488)",
    d: "linear-gradient(135deg,#a78bfa,#6d28d9)",
    e: "linear-gradient(135deg,#60a5fa,#1d4ed8)",
    f: "linear-gradient(135deg,#f472b6,#be185d)"
  };

  var DATA = [
    { name: "Mara Volkov", role: "CMO, Nord Athletic", brand: "NA", grad: "a", type: "commercial", stars: 5, tc: "00:14:22:08",
      quote: "Aperture turned a two-day shoot into a hero spot that lifted our launch conversions by 34%. The color grade alone made the product look like it cost triple." },
    { name: "Desmond Kerr", role: "Director, Wildlands Doc", brand: "WD", grad: "c", type: "documentary", stars: 5, tc: "00:41:09:12",
      quote: "They embedded with us for three weeks in the field and never dropped a frame. The final cut made grown festival programmers cry — twice." },
    { name: "Lena Ortiz", role: "Artist, Neon Halo", brand: "NH", grad: "d", type: "music", stars: 5, tc: "00:03:47:21",
      quote: "My music video hit a million views in nine days. Every strobe, every match cut, exactly the vision in my head — but sharper." },
    { name: "Priya Raman", role: "Head of Events, Loop Summit", brand: "LS", grad: "e", type: "event", stars: 4, tc: "01:02:33:00",
      quote: "A four-camera live event delivered as a polished recap by the next morning. Our sponsors asked who shot it before the coffee was cold." },
    { name: "Théo Marchand", role: "Founder, Atlas Coffee", brand: "AC", grad: "b", type: "commercial", stars: 5, tc: "00:09:58:14",
      quote: "The brand film they cut is still our top-performing ad eighteen months later. Nobody else understood the light in our roastery like they did." },
    { name: "Ingrid Sø", role: "Producer, Cold Water", brand: "CW", grad: "c", type: "documentary", stars: 5, tc: "00:57:12:03",
      quote: "Ethical, patient, and technically flawless. The underwater sequences alone got us distribution we could never have afforded on our budget." },
    { name: "Jasper Cole", role: "A&R, Static Records", brand: "SR", grad: "d", type: "music", stars: 4, tc: "00:04:11:19",
      quote: "We booked them for one video and signed a slate deal for the whole roster. Turnaround is fast and the treatments always beat the brief." },
    { name: "Noor Haddad", role: "VP Brand, Vela Motors", brand: "VM", grad: "e", type: "commercial", stars: 5, tc: "00:22:40:06",
      quote: "Cinematic without being precious. They shot our EV like a feature film and kept every deliverable on spec across nine markets." },
    { name: "Elias Brandt", role: "Curator, Frame Fest", brand: "FF", grad: "a", type: "event", stars: 5, tc: "00:48:27:15",
      quote: "Our festival aftermovie set the tone for the entire following year of submissions. Directors literally cite it in their applications now." },
    { name: "Cora Nakamura", role: "Owner, Studio Fold", brand: "SF", grad: "f", type: "documentary", stars: 5, tc: "00:33:05:22",
      quote: "A quiet, human portrait of our workshop that we never could have made ourselves. It reads like poetry and still sells the craft." },
    { name: "Milo Vance", role: "Manager, Dust & Echo", brand: "DE", grad: "d", type: "music", stars: 5, tc: "00:02:59:11",
      quote: "Performance video, narrative video, and a vertical cut for socials — all from one shoot day, all genuinely excellent. Rare crew." },
    { name: "Sana Qureshi", role: "Director of Comms, Beacon", brand: "BC", grad: "b", type: "commercial", stars: 4, tc: "00:16:44:09",
      quote: "Clear communication from the first call to final delivery. They flagged risks early and still came in under the timeline we feared." }
  ];

  // ---------- Helpers ----------
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function starsHTML(n) {
    var s = '<span class="stars" role="img" aria-label="' + n + ' out of 5 stars">';
    for (var i = 1; i <= 5; i++) {
      s += '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="' + (i <= n ? "on" : "off") +
        '" d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
    }
    return s + "</span>";
  }

  function logoHTML(brand, grad, cls) {
    return '<div class="logo-mono ' + (cls || "") + '" style="background:' + GRADS[grad] + '">' + brand + "</div>";
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---------- Carousel ----------
  var featured = DATA.slice(0, 5);
  var track = document.getElementById("track");
  var dotsWrap = document.getElementById("dots");
  var index = 0;

  featured.forEach(function (t, i) {
    var slide = el("div", "slide");
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (i + 1) + " of " + featured.length);
    slide.innerHTML =
      '<div class="qmark" aria-hidden="true">&ldquo;</div>' +
      "<blockquote>" + t.quote + "</blockquote>" +
      '<div class="slide-foot">' +
        logoHTML(t.brand, t.grad) +
        '<div class="who"><b>' + t.name + "</b><span>" + t.role + "</span></div>" +
        '<div class="slide-meta">' +
          starsHTML(t.stars) +
          '<span class="slide-tc">' + t.tc + "</span>" +
          '<span class="slide-type">' + t.type + "</span>" +
        "</div>" +
      "</div>";
    track.appendChild(slide);

    var dot = el("button", "dot" + (i === 0 ? " is-active" : ""));
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Testimonial " + (i + 1));
    dot.addEventListener("click", function () { go(i, true); });
    dotsWrap.appendChild(dot);
  });

  function go(i, user) {
    index = (i + featured.length) % featured.length;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
      d.classList.toggle("is-active", di === index);
      d.setAttribute("aria-selected", di === index ? "true" : "false");
    });
    if (user) restart();
  }

  document.getElementById("next").addEventListener("click", function () { go(index + 1, true); });
  document.getElementById("prev").addEventListener("click", function () { go(index - 1, true); });

  var carousel = document.getElementById("carousel");
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(index + 1, true); e.preventDefault(); }
    if (e.key === "ArrowLeft") { go(index - 1, true); e.preventDefault(); }
  });

  // touch swipe
  var startX = null;
  carousel.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", function (e) {
    if (startX == null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    startX = null;
  });

  // autoplay
  var timer;
  function play() { timer = setInterval(function () { go(index + 1); }, 5000); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); play(); }
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", play);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", play);
  play();

  // ---------- Grid + filters ----------
  var grid = document.getElementById("grid");
  var countEl = document.getElementById("count");

  DATA.forEach(function (t) {
    var card = el("article", "card");
    card.setAttribute("tabindex", "0");
    card.dataset.type = t.type;
    card.innerHTML =
      '<div class="card-top">' +
        logoHTML(t.brand, t.grad) +
        '<div class="who"><b>' + t.name + "</b><span>" + t.role + "</span></div>" +
        '<span class="badge">' + t.type + "</span>" +
      "</div>" +
      "<p>&ldquo;" + t.quote + "&rdquo;</p>" +
      '<div class="card-foot">' +
        starsHTML(t.stars) +
        '<span class="ftc">' + t.tc + "</span>" +
      "</div>";
    grid.appendChild(card);
  });

  var chips = document.querySelectorAll(".chip");
  function applyFilter(f) {
    var shown = 0;
    Array.prototype.forEach.call(grid.children, function (c) {
      var match = f === "all" || c.dataset.type === f;
      c.classList.toggle("hide", !match);
      if (match) { shown++; c.style.animation = "none"; void c.offsetWidth; c.style.animation = ""; }
    });
    countEl.textContent = shown;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.dataset.filter;
      applyFilter(f);
      toast(f === "all" ? "Showing every review" : "Filtered: " + chip.textContent);
    });
  });
  countEl.textContent = DATA.length;

  // ---------- Logo filmstrip (duplicated for seamless marquee) ----------
  var strip = document.getElementById("strip");
  function buildStrip() {
    DATA.forEach(function (t) {
      var item = el("div", "strip-item");
      item.innerHTML = logoHTML(t.brand, t.grad) + "<span>" + t.role.split(", ").pop() + "</span>";
      strip.appendChild(item);
    });
  }
  buildStrip(); buildStrip();

  // ---------- Hero timecode ticker ----------
  var heroTc = document.getElementById("heroTc");
  var frames = 0;
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  setInterval(function () {
    frames = (frames + 1) % (24 * 60 * 60 * 24);
    var f = frames % 24;
    var totalSec = Math.floor(frames / 24);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600) % 24;
    heroTc.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }, 42);

})();
