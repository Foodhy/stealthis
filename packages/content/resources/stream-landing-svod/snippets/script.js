(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2800);
  }

  /* ---------- Scrolled nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  /* ---------- Email start forms ---------- */
  function wireStart(formId, inputId, errId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var input = document.getElementById(inputId);
    var err = document.getElementById(errId);
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) {
        input.classList.add("is-invalid");
        err.textContent = "Email is required to start.";
        input.focus();
        return;
      }
      if (!re.test(v)) {
        input.classList.add("is-invalid");
        err.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      input.classList.remove("is-invalid");
      err.textContent = "";
      input.value = "";
      toast("Welcome! Choose a plan to finish setting up " + v.split("@")[0] + "'s account.");
      var plans = document.getElementById("plans");
      if (plans) plans.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
      err.textContent = "";
    });
  }
  wireStart("startForm", "email", "startError");
  wireStart("startForm2", "email2", "startError2");

  /* ---------- Content showcase rows ---------- */
  var GRADS = [
    "linear-gradient(160deg,#3a1c71,#d76d77)", "linear-gradient(160deg,#0f2027,#2c5364)",
    "linear-gradient(160deg,#870000,#190a05)", "linear-gradient(160deg,#232526,#414345)",
    "linear-gradient(160deg,#42275a,#734b6d)", "linear-gradient(160deg,#1a2980,#26d0ce)",
    "linear-gradient(160deg,#ec008c,#fc6767)", "linear-gradient(160deg,#0b8793,#360033)",
    "linear-gradient(160deg,#485563,#29323c)", "linear-gradient(160deg,#f12711,#f5af19)",
    "linear-gradient(160deg,#136a8a,#267871)", "linear-gradient(160deg,#cb2d3e,#ef473a)"
  ];

  var ROWS = [
    {
      title: "Trending Now",
      ranked: true,
      items: ["Aurora Run", "The Quiet Coast", "Vega Nine", "Last Light", "Crown of Ash", "Saltwater Kings", "Neon Harbor", "Wildflower", "Iron Meridian", "Echo Valley"]
    },
    {
      title: "Nebula+ Originals",
      items: ["Glasshouse", "Northwind", "The Cartographer", "Ember & Ash", "Tidewater", "Silver Lining", "Hollow Crown", "Paper Cities", "The Long Field", "Static"]
    },
    {
      title: "Award-Winning Films",
      items: ["A Slower River", "Migration", "The Bell Keeper", "Dust to Gold", "Quiet Country", "Lanterns", "Foxglove", "The Inland Sea", "Threadbare", "Open Water"]
    },
    {
      title: "Continue Watching",
      progress: true,
      items: ["Vega Nine", "Saltwater Kings", "Neon Harbor", "Northwind", "Iron Meridian", "Echo Valley", "Static", "Tidewater"]
    }
  ];

  var QUALITY = ["4K", "HD", "HDR"];
  var rowsHost = document.getElementById("rows");

  ROWS.forEach(function (row, ri) {
    var wrap = document.createElement("section");
    wrap.className = "row reveal";

    var h = document.createElement("h3");
    h.className = "row__title";
    h.textContent = row.title;
    wrap.appendChild(h);

    var scrollWrap = document.createElement("div");
    scrollWrap.className = "row__scroll-wrap";

    var track = document.createElement("div");
    track.className = "row__track";
    track.setAttribute("role", "list");

    row.items.forEach(function (name, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.setAttribute("role", "listitem");
      card.style.background = GRADS[(ri * 3 + i) % GRADS.length];
      card.setAttribute("aria-label", "Play " + name);

      var match = 80 + ((i * 7 + ri * 11) % 19);
      var quality = QUALITY[(i + ri) % QUALITY.length];
      var isNew = i % 4 === 1;
      var rankHtml = row.ranked ? '<span class="badge badge--rank">#' + (i + 1) + "</span>" : "";
      var newHtml = isNew ? '<span class="badge badge--new">NEW</span>' : "";

      card.innerHTML =
        '<span class="card__scrim"></span>' +
        '<span class="card__meta">' +
          '<span class="card__name">' + name + "</span>" +
          '<span class="card__tags">' +
            rankHtml +
            '<span class="badge badge--q">' + quality + "</span>" +
            newHtml +
            '<span class="card__match">' + match + "% match</span>" +
          "</span>" +
        "</span>" +
        (row.progress
          ? '<span style="position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,0.25);z-index:3">' +
              '<span style="display:block;height:100%;width:' + (25 + ((i * 13) % 60)) + '%;background:var(--brand)"></span>' +
            "</span>"
          : "");

      card.addEventListener("click", function () {
        toast(row.progress ? "Resuming “" + name + "”" : "Playing “" + name + "”");
      });
      track.appendChild(card);
    });

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "card__nav-btn card__nav-btn--prev";
    prev.setAttribute("aria-label", "Scroll " + row.title + " left");
    prev.innerHTML = "‹";

    var next = document.createElement("button");
    next.type = "button";
    next.className = "card__nav-btn card__nav-btn--next";
    next.setAttribute("aria-label", "Scroll " + row.title + " right");
    next.innerHTML = "‹";

    function scrollBy(dir) {
      track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.8), behavior: "smooth" });
    }
    prev.addEventListener("click", function () { scrollBy(-1); });
    next.addEventListener("click", function () { scrollBy(1); });

    scrollWrap.appendChild(prev);
    scrollWrap.appendChild(track);
    scrollWrap.appendChild(next);
    wrap.appendChild(scrollWrap);
    rowsHost.appendChild(wrap);
  });

  /* ---------- Plans ---------- */
  var PLANS = [
    {
      name: "Mobile", price: "$4.99", tag: "Watch on phone & tablet",
      feats: ["1 device at a time", "Good (480p) quality", "Phone & tablet only", "Includes ads"]
    },
    {
      name: "Standard", price: "$11.99", tag: "Great for couples", featured: true,
      feats: ["2 devices at once", "Full HD (1080p)", "All devices", "Ad-free", "Offline downloads"]
    },
    {
      name: "Premium", price: "$17.99", tag: "Best for families",
      feats: ["4 devices at once", "Ultra HD 4K + HDR", "Spatial audio", "Ad-free", "Offline on 6 devices"]
    }
  ];
  var plansGrid = document.getElementById("plansGrid");
  PLANS.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "plan reveal" + (p.featured ? " is-featured" : "");
    var feats = p.feats.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    card.innerHTML =
      (p.featured ? '<span class="plan__flag">MOST POPULAR</span>' : "") +
      '<h3 class="plan__name">' + p.name + "</h3>" +
      '<p class="plan__price">' + p.price + "<span> /month</span></p>" +
      '<p class="plan__tag">' + p.tag + "</p>" +
      "<ul class=\"plan__feats\">" + feats + "</ul>" +
      '<button class="btn ' + (p.featured ? "btn--cta" : "btn--brand") + '" type="button">Choose ' + p.name + "</button>";
    card.querySelector("button").addEventListener("click", function () {
      toast("You selected the " + p.name + " plan (" + p.price + "/mo). Enter your email to continue.");
      document.getElementById("email").focus();
    });
    plansGrid.appendChild(card);
  });

  /* ---------- FAQ accordion ---------- */
  var FAQ = [
    { q: "What is Nebula+?", a: "Nebula+ is a streaming demo with thousands of fictional movies, series and live events. Watch as much as you want, whenever you want — all for one low monthly price. There's always something new to discover." },
    { q: "How much does it cost?", a: "Watch Nebula+ from $4.99 to $17.99 a month with no extra costs and no contracts. Choose the plan that's right for you and change or cancel it anytime." },
    { q: "Where can I watch?", a: "Watch anywhere, anytime. Sign in to stream instantly on the web, or on smart TVs, phones, tablets, streaming players and game consoles. Your spot is saved across every device." },
    { q: "How do I cancel?", a: "Nebula+ is flexible. There are no annoying contracts and no commitments. You can easily cancel your account online in two clicks, with no cancellation fees. Start and stop whenever you like." },
    { q: "Is Nebula+ good for kids?", a: "The Kids experience is included with every membership, giving parents control while children enjoy family-friendly originals and films in their own dedicated space." }
  ];
  var faqList = document.getElementById("faqList");
  FAQ.forEach(function (item, i) {
    var acc = document.createElement("div");
    acc.className = "acc";
    acc.setAttribute("aria-expanded", "false");
    var pid = "faq-panel-" + i;
    var bid = "faq-btn-" + i;
    acc.innerHTML =
      '<button class="acc__btn" id="' + bid + '" aria-expanded="false" aria-controls="' + pid + '">' +
        "<span>" + item.q + "</span><span class=\"acc__sign\" aria-hidden=\"true\">+</span>" +
      "</button>" +
      '<div class="acc__panel" id="' + pid + '" role="region" aria-labelledby="' + bid + '">' +
        '<div class="acc__panel-inner">' + item.a + "</div>" +
      "</div>";
    var btn = acc.querySelector(".acc__btn");
    var panel = acc.querySelector(".acc__panel");
    btn.addEventListener("click", function () {
      var open = acc.getAttribute("aria-expanded") === "true";
      faqList.querySelectorAll(".acc").forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        other.querySelector(".acc__btn").setAttribute("aria-expanded", "false");
        other.querySelector(".acc__panel").style.maxHeight = "0px";
      });
      if (!open) {
        acc.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
    faqList.appendChild(acc);
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
