(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
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

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Data ---------- */
  var volumes = [
    { n: "01", name: "First Blade", sub: "Ch. 1–11" },
    { n: "02", name: "City of Erased Names", sub: "Ch. 12–22" },
    { n: "03", name: "The Memory Broker", sub: "Ch. 23–34" },
    { n: "04", name: "Ghost-Steel", sub: "Ch. 35–46" },
    { n: "05", name: "Seven Syndicates", sub: "Ch. 47–58" },
    { n: "06", name: "Neon Funeral", sub: "Ch. 59–70" },
    { n: "07", name: "The Quiet District", sub: "Ch. 71–84" },
    { n: "08", name: "Auction Night", sub: "Ch. 85–98" }
  ];

  var chapters = [
    { no: "132", title: "The Memory Auction", meta: "2 hours ago · 19 pages", isNew: true },
    { no: "131", title: "Bidding in Blood", meta: "1 week ago · 18 pages", isNew: false },
    { no: "130", title: "The Broker's Garden", meta: "2 weeks ago · 20 pages", isNew: false },
    { no: "129", title: "A Name Worth Cutting", meta: "3 weeks ago · 17 pages", isNew: false },
    { no: "128", title: "Rooftops of Neo-Kuroshima", meta: "1 month ago · 21 pages", isNew: false },
    { no: "127", title: "Eight Cuts, One Vow", meta: "1 month ago · 18 pages", isNew: false }
  ];

  /* ---------- Render volumes ---------- */
  var volGrid = document.getElementById("volGrid");
  if (volGrid) {
    volGrid.innerHTML = "";
    volumes.forEach(function (v) {
      var card = document.createElement("article");
      card.className = "vol";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Volume " + v.n + ": " + v.name);
      card.innerHTML =
        '<div class="vol__cover">' +
          '<span class="vol__num">' + v.n + "</span>" +
          '<h3 class="vol__name">' + v.name + "</h3>" +
          '<p class="vol__sub">' + v.sub + "</p>" +
        "</div>";
      function open() { toast("Opening Vol. " + v.n + " — " + v.name); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      volGrid.appendChild(card);
    });
  }

  /* ---------- Render chapters ---------- */
  var chList = document.getElementById("chList");
  if (chList) {
    chapters.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "ch-item";
      li.innerHTML =
        '<span class="ch-item__no">' + c.no + "</span>" +
        '<div class="ch-item__main">' +
          '<div class="ch-item__title">' + c.title +
            (c.isNew ? ' <span class="ch-item__new">NEW</span>' : "") +
          "</div>" +
          '<div class="ch-item__meta">' + c.meta + "</div>" +
        "</div>" +
        '<button class="ch-item__go" type="button">Read</button>';
      li.querySelector(".ch-item__go").addEventListener("click", function () {
        toast("Loading Chapter " + c.no + " — " + c.title);
      });
      chList.appendChild(li);
    });
  }

  /* ---------- Reveal on scroll (chapters + data-reveal) ---------- */
  var revealItems = [].slice.call(document.querySelectorAll(".ch-item, [data-reveal]"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          // small stagger for chapter rows
          var delay = en.target.classList.contains("ch-item") ? i * 70 : 0;
          setTimeout(function () { en.target.classList.add("in"); }, delay);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero entrance + speed lines ---------- */
  var speedLines = document.getElementById("speedLines");
  requestAnimationFrame(function () {
    if (speedLines) speedLines.classList.add("on");
  });

  /* ---------- Hero parallax ---------- */
  var heroArt = document.getElementById("heroArt");
  var heroCopy = document.querySelector(".hero__copy");
  var hero = document.querySelector(".hero");
  if (hero && !prefersReduced) {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          if (heroArt) heroArt.style.transform = "translateY(" + y * 0.12 + "px)";
          if (heroCopy) heroCopy.style.transform = "translateY(" + y * -0.05 + "px)";
          if (speedLines) speedLines.style.transform = "scale(" + (1 + y * 0.0004) + ")";
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // pointer parallax on the ronin art (desktop)
    if (window.matchMedia("(pointer:fine)").matches && heroArt) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        heroArt.querySelector(".ronin").style.transform =
          "rotateY(" + dx * 8 + "deg) rotateX(" + dy * -8 + "deg)";
      });
      hero.addEventListener("mouseleave", function () {
        heroArt.querySelector(".ronin").style.transform = "";
      });
    }
  }

  /* ---------- CTA buttons ---------- */
  var ctaRead = document.getElementById("ctaRead");
  if (ctaRead) ctaRead.addEventListener("click", function () { toast("Opening Chapter 1 — enjoy the read!"); });

  var ctaFollow = document.getElementById("ctaFollow");
  if (ctaFollow) {
    var following = false;
    ctaFollow.addEventListener("click", function () {
      following = !following;
      ctaFollow.textContent = following ? "✓ Following" : "＋ Follow series";
      ctaFollow.setAttribute("aria-pressed", String(following));
      toast(following ? "Following Neon Ronin — we'll ping you Fridays." : "Unfollowed.");
    });
  }
})();
