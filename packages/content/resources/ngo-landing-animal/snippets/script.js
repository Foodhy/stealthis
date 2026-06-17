(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Adoptable animals ---------- */
  var ANIMALS = [
    { name: "Marble", type: "dog", age: "2 yr", tag: "Good with kids", grad: "#cfe7d3,#f3c896", emoji: "🐕",
      meta: ["Labrador mix", "Medium", "Vaccinated"], desc: "Goofy, gentle and obsessed with tennis balls." },
    { name: "Clementine", type: "cat", age: "5 yr", tag: "Senior sweetheart", grad: "#ffe0c2,#f0b884", emoji: "🐈",
      meta: ["Tabby", "Lap cat", "Spayed"], desc: "A calm cuddler who loves sunny windowsills." },
    { name: "Biscuit", type: "dog", age: "4 yr", tag: "Special needs", grad: "#d7ecd6,#ec9a52", emoji: "🦮",
      meta: ["Terrier", "3 legs", "House-trained"], desc: "Doesn't let three legs slow down his zoomies." },
    { name: "Pip", type: "cat", age: "4 mo", tag: "Kitten", grad: "#e7f0d8,#f4c089", emoji: "😺",
      meta: ["Domestic", "Playful", "Microchipped"], desc: "Tiny tornado of purrs and pounces." },
    { name: "Sprout", type: "small", age: "1 yr", tag: "Bonded pair", grad: "#d9ead7,#e9c79a", emoji: "🐰",
      meta: ["Lop rabbit", "Litter-trained", "Neutered"], desc: "Comes with bestie Clover — adopt together!" },
    { name: "Maple", type: "dog", age: "7 yr", tag: "Calm companion", grad: "#cfe7d3,#e8b079", emoji: "🐶",
      meta: ["Beagle", "Low energy", "Vaccinated"], desc: "An easygoing senior who adores slow walks." },
    { name: "Olive", type: "cat", age: "2 yr", tag: "Shy but sweet", grad: "#e3eed6,#f3c08a", emoji: "🐱",
      meta: ["Tuxedo", "Indoor", "Spayed"], desc: "Warms up fast once she trusts you." },
    { name: "Pepper", type: "small", age: "8 mo", tag: "First-time friendly", grad: "#d7ecd6,#efc488", emoji: "🐹",
      meta: ["Guinea pig", "Social", "Healthy"], desc: "Squeaks with joy at veggie time." }
  ];

  var grid = document.getElementById("adoptGrid");
  var favs = {};

  function render(filter) {
    if (!grid) return;
    grid.innerHTML = "";
    var list = ANIMALS.filter(function (a) {
      return filter === "all" || a.type === filter;
    });
    list.forEach(function (a, i) {
      var card = document.createElement("article");
      card.className = "adopt-card";
      card.style.animationDelay = i * 50 + "ms";
      var faved = favs[a.name] ? " is-fav" : "";
      card.innerHTML =
        '<div class="adopt-photo" style="background:linear-gradient(150deg,' + a.grad + ')">' +
          '<span class="adopt-tag">' + a.tag + "</span>" +
          '<button class="adopt-fav' + faved + '" type="button" aria-pressed="' + !!favs[a.name] +
            '" aria-label="Favourite ' + a.name + '">' + (favs[a.name] ? "❤️" : "🤍") + "</button>" +
        "</div>" +
        '<div class="adopt-body">' +
          '<div class="adopt-name"><h3>' + a.emoji + " " + a.name + '</h3><span class="age">' + a.age + "</span></div>" +
          '<div class="adopt-meta">' + a.meta.map(function (m) { return "<span>" + m + "</span>"; }).join("") + "</div>" +
          '<p class="adopt-desc">' + a.desc + "</p>" +
          '<button class="btn btn-brand" type="button" data-meet="' + a.name + '">Meet ' + a.name + " →</button>" +
        "</div>";

      var favBtn = card.querySelector(".adopt-fav");
      favBtn.addEventListener("click", function () {
        favs[a.name] = !favs[a.name];
        favBtn.classList.toggle("is-fav", favs[a.name]);
        favBtn.textContent = favs[a.name] ? "❤️" : "🤍";
        favBtn.setAttribute("aria-pressed", String(!!favs[a.name]));
        toast(favs[a.name] ? "Saved " + a.name + " to your favourites 💚" : "Removed " + a.name);
      });
      card.querySelector("[data-meet]").addEventListener("click", function () {
        toast("Application started for " + a.name + " — our team will call you! 🐾");
      });
      grid.appendChild(card);
    });
  }
  render("all");

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
      render(chip.dataset.filter);
    });
  });

  /* ---------- Animated impact counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var dur = 1500, start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(eased * target);
      el.textContent = val >= 1000 ? val.toLocaleString("en-US") : String(val);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal + counters + thermometer via IntersectionObserver ---------- */
  var thermoFill = document.getElementById("thermoFill");
  var GOAL = 50000, RAISED = 38400;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var t = entry.target;
      t.classList.add("in");
      t.querySelectorAll("[data-count]").forEach(animateCount);
      if (t.querySelector("#thermoFill") || t.id === "donate") {
        if (thermoFill) thermoFill.style.width = Math.min((RAISED / GOAL) * 100, 100) + "%";
      }
      io.unobserve(t);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal, .impact-grid, .thermo").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- Donate amount selection ---------- */
  var selectedAmt = 50;
  var donateBtn = document.getElementById("donateBtn");
  var customAmt = document.getElementById("customAmt");
  var amtBtns = document.querySelectorAll(".amt");

  function syncDonateBtn() {
    if (donateBtn) donateBtn.textContent = "Donate $" + selectedAmt + " →";
  }
  amtBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      amtBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      selectedAmt = parseInt(b.dataset.amt, 10);
      if (customAmt) customAmt.value = "";
      syncDonateBtn();
    });
  });
  if (customAmt) {
    customAmt.addEventListener("input", function () {
      var v = parseInt(customAmt.value, 10);
      if (!isNaN(v) && v > 0) {
        amtBtns.forEach(function (x) { x.classList.remove("is-active"); });
        selectedAmt = v;
        syncDonateBtn();
      }
    });
  }

  var donateForm = document.getElementById("donateForm");
  if (donateForm) {
    donateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selectedAmt || selectedAmt < 1) { toast("Please choose an amount 🐾"); return; }
      // simulate the gift bumping the thermometer
      RAISED = Math.min(RAISED + selectedAmt, GOAL);
      if (thermoFill) thermoFill.style.width = Math.min((RAISED / GOAL) * 100, 100) + "%";
      var raisedEl = document.getElementById("raised");
      if (raisedEl) raisedEl.textContent = "$" + RAISED.toLocaleString("en-US");
      toast("Thank you! Your $" + selectedAmt + " gift feeds rescues today 🧡");
    });
  }

  /* ---------- Donate nav buttons scroll + nudge ---------- */
  document.querySelectorAll("[data-donate]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var donate = document.getElementById("donate");
      if (donate) {
        e.preventDefault();
        donate.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  /* ---------- Sponsor slider ---------- */
  var range = document.getElementById("sponsorRange");
  var sponsorAmt = document.getElementById("sponsorAmt");
  var sponsorHint = document.getElementById("sponsorHint");
  var sponsorBtn = document.getElementById("sponsorBtn");

  function sponsorTier(v) {
    if (v <= 15) return "Feeds Biscuit for a whole month 🍖";
    if (v <= 35) return "Covers food + a vet check-up 🩺";
    if (v <= 65) return "Funds rehab + grooming + meals ✨";
    return "Sponsors a full recovery journey 🌟";
  }
  if (range) {
    range.addEventListener("input", function () {
      var v = range.value;
      if (sponsorAmt) sponsorAmt.textContent = "$" + v + "/mo";
      if (sponsorHint) sponsorHint.textContent = sponsorTier(parseInt(v, 10));
    });
  }
  if (sponsorBtn) {
    sponsorBtn.addEventListener("click", function () {
      toast("You're now sponsoring Biscuit at " + (range ? "$" + range.value : "$15") + "/mo 🦴");
    });
  }

  /* ---------- Volunteer + newsletter forms ---------- */
  var volForm = document.getElementById("volForm");
  if (volForm) {
    volForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("volName");
      var email = document.getElementById("volEmail");
      if (!name.value.trim()) { toast("Tell us your name 🙂"); name.focus(); return; }
      if (!email.value.trim() || email.value.indexOf("@") === -1) { toast("Add a valid email 📧"); email.focus(); return; }
      toast("Welcome aboard, " + name.value.trim().split(" ")[0] + "! We'll be in touch 🙌");
      volForm.reset();
    });
  }

  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      if (!email.value.trim() || email.value.indexOf("@") === -1) { toast("Add a valid email 📧"); email.focus(); return; }
      toast("Subscribed! Watch for happy tails in your inbox 🐾");
      newsForm.reset();
    });
  }

  /* ---------- Live "adopted this week" ticker ---------- */
  var liveAdopt = document.getElementById("liveAdopt");
  if (liveAdopt) {
    setInterval(function () {
      if (Math.random() > 0.55) {
        var n = parseInt(liveAdopt.textContent, 10) + 1;
        liveAdopt.textContent = n;
      }
    }, 7000);
  }

  syncDonateBtn();
})();
