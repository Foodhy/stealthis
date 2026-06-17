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
    }, 2800);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("primary-nav");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- ZIP check ---------- */
  var zipForm = document.getElementById("hero-zip");
  var zipInput = document.getElementById("zipInput");
  var zipMsg = document.getElementById("zipMsg");
  if (zipForm && zipInput && zipMsg) {
    zipForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = zipInput.value.trim();
      zipMsg.classList.remove("is-ok", "is-err");
      if (!/^\d{5}$/.test(val)) {
        zipMsg.textContent = "Please enter a valid 5-digit ZIP code.";
        zipMsg.classList.add("is-err");
        zipInput.focus();
        return;
      }
      // Fictional coverage: most ZIPs covered, a few are waitlist
      var waitlist = val.charCodeAt(4) % 5 === 0;
      if (waitlist) {
        zipMsg.textContent = "We're not in " + val + " yet — you're on the waitlist! 🌱";
        zipMsg.classList.add("is-ok");
        toast("Added " + val + " to the waitlist");
      } else {
        var mins = 38 + (val.charCodeAt(2) % 22);
        zipMsg.textContent = "Great news! We deliver to " + val + " in ~" + mins + " min. 🥕";
        zipMsg.classList.add("is-ok");
        toast("Delivery available in " + val + " 🎉");
      }
    });
  }

  /* ---------- Category tiles ---------- */
  var cats = [
    { e: "🥬", n: "Produce", c: "1,240 items" },
    { e: "🥛", n: "Dairy & Eggs", c: "380 items" },
    { e: "🍞", n: "Bakery", c: "210 items" },
    { e: "🥩", n: "Meat & Fish", c: "460 items" },
    { e: "🥫", n: "Pantry", c: "1,900 items" },
    { e: "🧊", n: "Frozen", c: "540 items" },
    { e: "🥤", n: "Drinks", c: "720 items" },
    { e: "🍫", n: "Snacks", c: "880 items" },
    { e: "🧴", n: "Household", c: "640 items" },
    { e: "🌸", n: "Flowers", c: "120 items" },
    { e: "🐾", n: "Pet", c: "300 items" },
    { e: "🍼", n: "Baby", c: "260 items" }
  ];
  var tilesEl = document.getElementById("tiles");
  if (tilesEl) {
    cats.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "tile";
      b.type = "button";
      b.innerHTML =
        '<span class="tile__emoji">' + c.e + "</span>" +
        '<span class="tile__name">' + c.n + "</span>" +
        '<span class="tile__count">' + c.c + "</span>";
      b.addEventListener("click", function () {
        toast("Browsing " + c.n + " — " + c.c);
      });
      tilesEl.appendChild(b);
    });
  }

  /* ---------- Pricing ---------- */
  var plans = [
    {
      name: "Pay as you go", tag: "No commitment",
      monthly: 0, yearly: 0, free: true,
      perks: ["$3.99 delivery per order", "Standard 1-hour windows", "Real-time order tracking", "Email support"],
      cta: "Start free", featured: false
    },
    {
      name: "FreshCart+", tag: "Best for weekly shoppers",
      monthly: 9, yearly: 81,
      perks: ["Free delivery over $35", "Priority 30-min windows", "Members-only weekly deals", "Free swaps & instant refunds", "Live shopper chat"],
      cta: "Go FreshCart+", featured: true
    },
    {
      name: "Family", tag: "Up to 5 members",
      monthly: 15, yearly: 135,
      perks: ["Everything in FreshCart+", "Shared family baskets", "5% back as FreshCash", "Recurring weekly orders", "Dedicated support line"],
      cta: "Choose Family", featured: false
    }
  ];
  var plansEl = document.getElementById("plans");
  var billYear = false;

  function money(v) { return v === 0 ? "$0" : "$" + v; }

  function renderPlans() {
    if (!plansEl) return;
    plansEl.innerHTML = "";
    plans.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "plan" + (p.featured ? " plan--featured" : "");
      var price, per, sub;
      if (p.free) {
        price = "$0"; per = "/forever"; sub = "Always free to browse";
      } else if (billYear) {
        price = money(p.yearly); per = "/year";
        var permo = (p.yearly / 12).toFixed(2);
        sub = "≈ $" + permo + "/mo · save 25%";
      } else {
        price = money(p.monthly); per = "/month"; sub = "Billed monthly";
      }
      var lis = p.perks.map(function (x) { return "<li>" + x + "</li>"; }).join("");
      card.innerHTML =
        '<div class="plan__name">' + p.name + "</div>" +
        '<div class="plan__tag">' + p.tag + "</div>" +
        '<div class="plan__price"><span class="amt">' + price + '</span><span class="per">' + per + "</span></div>" +
        '<div class="plan__sub">' + sub + "</div>" +
        "<ul>" + lis + "</ul>" +
        '<button class="btn ' + (p.featured ? "btn--solid" : "btn--ghost") + '" type="button">' + p.cta + "</button>";
      card.querySelector("button").addEventListener("click", function () {
        toast(p.free ? "Welcome to FreshCart!" : "Selected " + p.name + " — " + price + " " + per);
      });
      plansEl.appendChild(card);
    });
  }
  renderPlans();

  var billMonthly = document.getElementById("billMonthly");
  var billYearly = document.getElementById("billYearly");
  function setBilling(yearly) {
    billYear = yearly;
    if (billMonthly) { billMonthly.classList.toggle("is-active", !yearly); billMonthly.setAttribute("aria-pressed", String(!yearly)); }
    if (billYearly) { billYearly.classList.toggle("is-active", yearly); billYearly.setAttribute("aria-pressed", String(yearly)); }
    renderPlans();
  }
  if (billMonthly) billMonthly.addEventListener("click", function () { setBilling(false); });
  if (billYearly) billYearly.addEventListener("click", function () { setBilling(true); });

  /* ---------- App store buttons ---------- */
  document.querySelectorAll(".store-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Opening the FreshCart " + b.dataset.store + " app…");
    });
  });

  /* ---------- Newsletter ---------- */
  var subForm = document.getElementById("subForm");
  var subEmail = document.getElementById("subEmail");
  if (subForm && subEmail) {
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = subEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        toast("Please enter a valid email address");
        subEmail.focus();
        return;
      }
      subEmail.value = "";
      toast("You're in! Weekly deals headed to your inbox 🥬");
    });
  }

  /* ---------- Phone ETA countdown ---------- */
  var phoneEta = document.getElementById("phoneEta");
  if (phoneEta) {
    var total = 11 * 60 + 42;
    setInterval(function () {
      total = total > 0 ? total - 1 : 11 * 60 + 42;
      var m = Math.floor(total / 60);
      var s = total % 60;
      phoneEta.textContent = m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
