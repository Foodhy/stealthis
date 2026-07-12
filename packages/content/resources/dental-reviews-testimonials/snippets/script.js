(function () {
  "use strict";

  /* ---------- Data ---------- */
  var GRAD = [
    "linear-gradient(135deg,#2563eb,#34d399)",
    "linear-gradient(135deg,#1d4ed8,#60a5fa)",
    "linear-gradient(135deg,#34d399,#22b07d)",
    "linear-gradient(135deg,#6366f1,#2563eb)",
    "linear-gradient(135deg,#0ea5e9,#34d399)",
    "linear-gradient(135deg,#f6b73c,#e05252)"
  ];

  var featured = [
    {
      name: "Marisol Alvarez", role: "Invisalign patient · 8 months in",
      grad: GRAD[0], rating: 5,
      quote: "I was terrified of the dentist for years. Dr. Nguyen and the team walked me through every single step of my Invisalign plan. My smile has completely transformed and I finally look forward to my check-ups."
    },
    {
      name: "Daniel Okonkwo", role: "Dental implant patient",
      grad: GRAD[3], rating: 5,
      quote: "Lost a tooth in a cycling accident and thought I'd never smile the same. The implant is flawless — you honestly cannot tell which one is real. Painless, professional, and the follow-up care was outstanding."
    },
    {
      name: "Priya Raman", role: "Family of four · 3 years",
      grad: GRAD[2], rating: 5,
      quote: "Brightsmile is the only clinic my whole family trusts. The kids actually ask to go. Clean, calm, on-time appointments, and they never push treatments we don't need. Genuinely the best care we've had."
    }
  ];

  var reviews = [
    { name: "Grace Halloran", initials: "GH", grad: GRAD[0], source: "google", rating: 5, date: "2 days ago", treatment: "Whitening", verified: true,
      text: "Three shades brighter after one visit and zero sensitivity. The hygienist explained aftercare so clearly. Booking online took thirty seconds." },
    { name: "Tomas Berg", initials: "TB", grad: GRAD[1], source: "yelp", rating: 5, date: "5 days ago", treatment: "Cleaning", verified: true,
      text: "Most thorough cleaning I've had in a decade, and the reminder texts mean I never miss an appointment anymore. Front desk is lovely." },
    { name: "Aisha Rahman", initials: "AR", grad: GRAD[2], source: "google", rating: 5, date: "1 week ago", treatment: "Invisalign", verified: true,
      text: "Halfway through my Invisalign and already thrilled. Dr. Nguyen answered every anxious question I had. The 3D scan preview sold me." },
    { name: "Leo Mancini", initials: "LM", grad: GRAD[3], source: "yelp", rating: 4, date: "1 week ago", treatment: "Implants", verified: true,
      text: "Implant procedure was smoother than expected. One follow-up ran a little late, but the result is excellent and the team was apologetic." },
    { name: "Hannah Weiss", initials: "HW", grad: GRAD[4], source: "google", rating: 5, date: "2 weeks ago", treatment: "Cleaning", verified: true,
      text: "Brought my nervous 7-year-old and they were so patient with him. He left with a sticker and a big smile. We're patients for life." },
    { name: "Marcus Bell", initials: "MB", grad: GRAD[5], source: "google", rating: 5, date: "3 weeks ago", treatment: "Whitening", verified: true,
      text: "Professional whitening was worth every penny. Results lasted through the holidays and the office is spotless and modern." },
    { name: "Sofia Duarte", initials: "SD", grad: GRAD[0], source: "yelp", rating: 5, date: "3 weeks ago", treatment: "Implants", verified: true,
      text: "Two implants done over the summer. Clear cost breakdown up front — no surprise bills. Confident enough to smile in photos again." },
    { name: "Kenji Watanabe", initials: "KW", grad: GRAD[2], source: "google", rating: 5, date: "1 month ago", treatment: "Invisalign", verified: true,
      text: "The digital treatment plan let me see the end result before starting. Aligners are comfortable and the check-ins are quick and easy." }
  ];

  /* ---------- Helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function starsHtml(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<span class="star ' + (i <= n ? "on" : "") + '"></span>';
    return out;
  }

  /* ---------- Render review cards ---------- */
  var grid = $("#grid");
  var emptyMsg = $("#empty");

  function cardHtml(r) {
    return (
      '<article class="card" data-source="' + r.source + '" data-treatment="' + r.treatment + '">' +
        '<div class="card-top">' +
          '<span class="avatar" style="background:' + r.grad + '" aria-hidden="true">' + r.initials + "</span>" +
          '<span class="who">' +
            '<span class="name">' + r.name + (r.verified ? '<span class="verified" title="Verified patient" aria-label="Verified patient">&#10003;</span>' : "") + "</span>" +
            '<span class="date">' + r.date + "</span>" +
          "</span>" +
          '<span class="card-src"><span class="src-badge ' + r.source + '" title="' + (r.source === "google" ? "Google review" : "Yelp review") + '">' + (r.source === "google" ? "G" : "Y") + "</span></span>" +
        "</div>" +
        '<div class="card-stars" role="img" aria-label="Rated ' + r.rating + ' out of 5">' + starsHtml(r.rating) + "</div>" +
        '<p class="text">' + r.text + "</p>" +
        '<div class="card-foot">' +
          '<span class="tag">' + r.treatment + "</span>" +
          '<button class="copy-btn" type="button" data-name="' + r.name + '">&#128279; Copy link</button>' +
        "</div>" +
      "</article>"
    );
  }

  function renderGrid(filter) {
    var visible = reviews.filter(function (r) {
      if (filter === "all") return true;
      if (filter === "google" || filter === "yelp") return r.source === filter;
      return r.treatment === filter;
    });
    grid.innerHTML = visible.map(cardHtml).join("");
    emptyMsg.hidden = visible.length !== 0;
  }

  renderGrid("all");

  /* ---------- Filter chips ---------- */
  $("#chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    renderGrid(chip.dataset.filter);
  });

  /* ---------- Copy link (event delegation) ---------- */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var link = "https://brightsmile.example/reviews#" +
      btn.dataset.name.toLowerCase().replace(/\s+/g, "-");
    var done = function () { toast("Review link copied to clipboard"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done, done);
    } else {
      done();
    }
  });

  /* ---------- Carousel ---------- */
  var rail = $("#rail");
  var dotsWrap = $("#dots");
  var viewport = $("#viewport");
  var index = 0;
  var count = featured.length;

  rail.innerHTML = featured.map(function (f, i) {
    return (
      '<li class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + count + '">' +
        '<div class="slide-card">' +
          '<span class="slide-avatar" style="background:' + f.grad + '" aria-hidden="true">' +
            f.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2) +
          "</span>" +
          "<div>" +
            '<p class="slide-quote">' + f.quote + "</p>" +
            '<div class="slide-meta">' +
              '<span class="mini-stars" role="img" aria-label="Rated ' + f.rating + ' out of 5">' + starsHtml(f.rating) + "</span>" +
              '<span class="slide-name">' + f.name + "</span>" +
              '<span class="slide-role">' + f.role + "</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</li>"
    );
  }).join("");

  dotsWrap.innerHTML = featured.map(function (f, i) {
    return '<button class="dot' + (i === 0 ? " is-active" : "") +
      '" role="tab" aria-label="Go to testimonial ' + (i + 1) +
      '" aria-selected="' + (i === 0) + '"></button>';
  }).join("");
  var dots = $$(".dot", dotsWrap);

  function go(i) {
    index = (i + count) % count;
    rail.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach(function (d, di) {
      var active = di === index;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-selected", String(active));
    });
  }

  $("#next").addEventListener("click", function () { go(index + 1); restart(); });
  $("#prev").addEventListener("click", function () { go(index - 1); restart(); });
  dots.forEach(function (d, i) {
    d.addEventListener("click", function () { go(i); restart(); });
  });

  /* Keyboard arrows on the carousel */
  $(".featured").addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(index + 1); restart(); }
    else if (e.key === "ArrowLeft") { go(index - 1); restart(); }
  });

  /* Autoplay with pause on hover / focus */
  var timer;
  function play() { timer = setInterval(function () { go(index + 1); }, 5500); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); play(); }

  viewport.addEventListener("mouseenter", stop);
  viewport.addEventListener("mouseleave", play);
  $(".featured").addEventListener("focusin", stop);
  $(".featured").addEventListener("focusout", play);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else play();
  });

  play();
})();
