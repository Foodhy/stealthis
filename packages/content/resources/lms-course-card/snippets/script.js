(function () {
  "use strict";

  /* ---------- fictional data ---------- */
  var COURSES = [
    {
      id: "react-foundations",
      cat: "Web Development",
      title: "React Foundations: From Zero to Components",
      instructor: "Dev Patel",
      glyph: "⚛️",
      grad: ["#6366f1", "#8b5cf6"],
      level: "Beginner",
      rating: 4.8,
      reviews: 2143,
      hours: 9.5,
      lessons: 58,
      kind: "paid",
      price: 49,
      was: 89
    },
    {
      id: "css-grid-master",
      cat: "Design Engineering",
      title: "Modern CSS Layout — Grid & Flexbox in Depth",
      instructor: "Lena Hoffmann",
      glyph: "🎨",
      grad: ["#13b981", "#34d399"],
      level: "Intermediate",
      rating: 4.6,
      reviews: 884,
      hours: 6,
      lessons: 41,
      kind: "free"
    },
    {
      id: "ts-systems",
      cat: "Programming",
      title: "TypeScript for Large Teams & Type-Safe APIs",
      instructor: "Marco Silva",
      glyph: "🧩",
      grad: ["#0ea5e9", "#2563eb"],
      level: "Advanced",
      rating: 4.9,
      reviews: 3402,
      hours: 12.5,
      lessons: 73,
      kind: "paid",
      price: 64,
      was: 119,
      badge: "bestseller"
    },
    {
      id: "ux-research",
      cat: "Product",
      title: "Practical UX Research & Usability Testing",
      instructor: "Aisha Khan",
      glyph: "🔍",
      grad: ["#f59e0b", "#f97316"],
      level: "Intermediate",
      rating: 4.5,
      reviews: 612,
      hours: 5.5,
      lessons: 34,
      kind: "progress",
      progress: 62,
      price: 39
    },
    {
      id: "py-data",
      cat: "Data Science",
      title: "Data Analysis with Python & Pandas",
      instructor: "Noah Becker",
      glyph: "🐍",
      grad: ["#10b981", "#059669"],
      level: "Beginner",
      rating: 4.7,
      reviews: 1789,
      hours: 8,
      lessons: 49,
      kind: "progress",
      progress: 24,
      price: 0
    },
    {
      id: "design-systems",
      cat: "Design Engineering",
      title: "Building Scalable Design Systems",
      instructor: "Priya Nair",
      glyph: "🧱",
      grad: ["#5b5bd6", "#4444c2"],
      level: "Advanced",
      rating: 5.0,
      reviews: 941,
      hours: 11,
      lessons: 66,
      kind: "complete",
      progress: 100,
      price: 79
    }
  ];

  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("empty");
  var enrolled = Object.create(null);

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function avatarColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return "linear-gradient(135deg, hsl(" + h + " 62% 52%), hsl(" + ((h + 40) % 360) + " 60% 44%))";
  }

  function starsMarkup(rating) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      var cls = "star";
      if (rating >= i) cls += " is-on";
      else if (rating >= i - 0.5) cls += " is-half";
      out += '<svg class="' + cls + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
    }
    return out;
  }

  var ICONS = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>'
  };

  /* ---------- card ---------- */
  function buildCard(c) {
    var card = el("article", "card");
    card.dataset.id = c.id;
    card.dataset.kind = c.kind;
    if (c.kind === "complete") card.classList.add("is-complete");

    var levelMod = "level--" + c.level.toLowerCase();
    var ribbon = "";
    if (c.kind === "free" || c.price === 0) ribbon = '<span class="ribbon ribbon--free">Free</span>';
    else if (c.kind === "complete") ribbon = '<span class="ribbon ribbon--done">✓ Done</span>';
    else if (c.badge === "bestseller") ribbon = '<span class="ribbon ribbon--bestseller">Bestseller</span>';

    var thumb = el("div", "card__thumb");
    thumb.style.background = "linear-gradient(135deg, " + c.grad[0] + ", " + c.grad[1] + ")";
    thumb.innerHTML =
      '<span class="level ' + levelMod + '">' + c.level + "</span>" +
      ribbon +
      '<span class="card__glyph" aria-hidden="true">' + c.glyph + "</span>";

    var body = el("div", "card__body");

    // header
    body.appendChild(el("span", "card__cat", c.cat));
    var h3 = el("h3", "card__title", c.title);
    body.appendChild(h3);

    // instructor
    var instr = el("div", "instr");
    var av = el("span", "avatar", initials(c.instructor));
    av.style.background = avatarColor(c.instructor);
    instr.appendChild(av);
    instr.appendChild(el("span", "instr__name", c.instructor));
    body.appendChild(instr);

    // rating + meta
    var meta = el("div", "meta");
    meta.innerHTML =
      '<span class="rating"><span class="stars" aria-hidden="true">' + starsMarkup(c.rating) + "</span>" +
      "<span>" + c.rating.toFixed(1) + "</span>" +
      '<span class="rating__count">(' + c.reviews.toLocaleString() + ")</span></span>";
    meta.setAttribute("aria-label", c.rating.toFixed(1) + " stars from " + c.reviews + " reviews");
    var hours = el("span", "meta__item", ICONS.clock + "<span>" + c.hours + "h</span>");
    var lessons = el("span", "meta__item", ICONS.play + "<span>" + c.lessons + " lessons</span>");
    meta.appendChild(hours);
    meta.appendChild(lessons);
    body.appendChild(meta);

    // progress (for in-progress / complete)
    if (c.kind === "progress" || c.kind === "complete") {
      var prog = el("div", "progress");
      var label = c.kind === "complete" ? "Completed" : "In progress";
      prog.innerHTML =
        '<div class="progress__top"><span>' + label + '</span><span class="pct">' + c.progress + "%</span></div>" +
        '<div class="bar"><div class="bar__fill" data-w="' + c.progress + '"></div></div>';
      body.appendChild(prog);
    }

    // footer
    var foot = el("div", "card__foot");
    var priceWrap = el("div", "price");
    if (c.kind === "progress" || c.kind === "complete") {
      // show lessons-left summary instead of price for owned courses
      if (c.kind === "complete") {
        priceWrap.innerHTML = '<span class="price__now is-free">Certificate ✓</span>';
      } else {
        var left = Math.round(c.lessons * (1 - c.progress / 100));
        priceWrap.innerHTML = '<span class="price__now" style="font-size:.92rem">' + left + " lessons left</span>";
      }
    } else if (c.kind === "free" || c.price === 0) {
      priceWrap.innerHTML = '<span class="price__now is-free">Free</span>';
    } else {
      priceWrap.innerHTML =
        '<span class="price__now">$' + c.price + "</span>" +
        (c.was ? '<span class="price__was">$' + c.was + "</span>" : "");
    }
    foot.appendChild(priceWrap);

    var btn = el("button", "btn");
    btn.type = "button";
    if (c.kind === "progress") {
      btn.className += " btn--resume";
      btn.textContent = "Resume";
    } else if (c.kind === "complete") {
      btn.className += " btn--ghost";
      btn.textContent = "Review";
    } else {
      btn.className += " btn--enroll";
      btn.textContent = "Enroll";
    }
    btn.setAttribute("aria-label", btn.textContent + " — " + c.title);
    btn.addEventListener("click", function () { onAction(c, btn); });
    foot.appendChild(btn);
    body.appendChild(foot);

    card.appendChild(thumb);
    card.appendChild(body);
    return card;
  }

  function onAction(c, btn) {
    if (c.kind === "complete") {
      toast("Reviewing “" + shortTitle(c.title) + "”");
      return;
    }
    if (c.kind === "progress") {
      toast("Resuming at lesson " + (Math.round(c.lessons * c.progress / 100) + 1));
      return;
    }
    if (enrolled[c.id]) return;
    enrolled[c.id] = true;
    btn.classList.add("is-enrolled");
    btn.textContent = "✓ Enrolled";
    btn.setAttribute("aria-disabled", "true");
    toast(
      (c.kind === "free" || c.price === 0)
        ? "Enrolled in “" + shortTitle(c.title) + "” — free!"
        : "Added “" + shortTitle(c.title) + "” to your courses"
    );
  }

  function shortTitle(t) {
    return t.length > 34 ? t.slice(0, 32).trim() + "…" : t;
  }

  /* ---------- render + filter ---------- */
  function matches(c, f) {
    if (f === "all") return true;
    if (f === "free") return c.kind === "free" || c.price === 0;
    if (f === "paid") return c.kind === "paid" || (c.price > 0 && c.kind !== "progress" && c.kind !== "complete");
    if (f === "active") return c.kind === "progress" || c.kind === "complete";
    return true;
  }

  function render(filter) {
    grid.innerHTML = "";
    var shown = 0;
    COURSES.forEach(function (c, i) {
      if (!matches(c, filter)) return;
      var card = buildCard(c);
      card.style.animationDelay = (i * 55) + "ms";
      grid.appendChild(card);
      shown++;
    });
    emptyEl.hidden = shown > 0;
    // animate progress bars after layout
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var fills = grid.querySelectorAll(".bar__fill");
        for (var i = 0; i < fills.length; i++) {
          fills[i].style.width = fills[i].dataset.w + "%";
        }
      });
    });
  }

  /* ---------- filters ---------- */
  var segBtns = document.querySelectorAll(".seg__btn");
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      segBtns.forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      render(b.dataset.filter);
    });
  });

  /* ---------- study mode ---------- */
  var toggle = document.getElementById("themeToggle");
  toggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("study");
    toggle.setAttribute("aria-pressed", String(on));
    toast(on ? "Study mode on" : "Study mode off");
  });

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  render("all");
})();
