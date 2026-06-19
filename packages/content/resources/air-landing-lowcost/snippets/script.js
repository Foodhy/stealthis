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
    }, 2400);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Ticker: duplicate items for seamless loop ---------- */
  var ticker = document.getElementById("ticker");
  if (ticker) {
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ---------- Nav shrink on scroll ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    function () {
      if (!nav) return;
      nav.classList.toggle("is-shrunk", window.scrollY > 40);
    },
    { passive: true }
  );

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mnav = document.getElementById("mobileNav");
  function closeMnav() {
    if (!mnav) return;
    mnav.classList.remove("is-open");
    mnav.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = mnav.classList.toggle("is-open");
      mnav.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMnav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMnav();
    });
  }

  /* ---------- Hero search ---------- */
  var form = document.getElementById("searchForm");
  var when = document.getElementById("when");
  if (when) {
    var d = new Date();
    d.setDate(d.getDate() + 14);
    when.value = d.toISOString().slice(0, 10);
    when.min = new Date().toISOString().slice(0, 10);
  }
  var swap = document.getElementById("swap");
  if (swap) {
    swap.addEventListener("click", function () {
      var from = document.getElementById("from");
      var to = document.getElementById("to");
      var tmp = from.value;
      from.value = to.value;
      to.value = tmp;
      toast("Swapped — " + from.value.split(" ")[0] + " ↔ " + to.value.split(" ")[0]);
    });
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var from = document.getElementById("from").value.trim() || "anywhere";
      var to = document.getElementById("to").value.trim() || "anywhere";
      toast("Searching " + from.split(" ")[0] + " → " + to.split(" ")[0] + " · from €9.99");
    });
  }
  var navBook = document.getElementById("navBook");
  if (navBook) {
    navBook.addEventListener("click", function () {
      document.getElementById("top").scrollIntoView({ behavior: "smooth" });
      var f = document.getElementById("from");
      if (f) setTimeout(function () { f.focus(); }, 350);
    });
  }

  /* ---------- Hero price ticker (live wobble) ---------- */
  var heroAmt = document.getElementById("heroAmt");
  var heroDec = document.getElementById("heroDec");
  var heroPrices = [14.99, 12.99, 15.99, 13.49, 16.99, 11.99];
  var hi = 0;
  if (heroAmt && heroDec) {
    setInterval(function () {
      hi = (hi + 1) % heroPrices.length;
      var v = heroPrices[hi];
      var parts = v.toFixed(2).split(".");
      heroAmt.textContent = parts[0];
      heroDec.textContent = "." + parts[1];
      var bar = document.getElementById("priceBar");
      if (bar) bar.style.width = Math.round((v - 11) / 7 * 80 + 12) + "%";
    }, 2600);
  }
  /* seats-left countdown */
  var seatsEl = document.getElementById("seatsLeft");
  var seats = 7;
  if (seatsEl) {
    setInterval(function () {
      if (seats > 2 && Math.random() > 0.5) {
        seats--;
        seatsEl.textContent = seats + " seats left";
      }
    }, 5200);
  }

  /* ---------- Deals grid ---------- */
  var DEALS = [
    { f: "BCN", t: "ROM", city: "Rome", price: 14.99, was: 39, tag: "Hot" },
    { f: "LON", t: "BER", city: "Berlin", price: 19.99, was: 49, tag: "Weekend" },
    { f: "MAD", t: "PAR", city: "Paris", price: 21.99, was: 55, tag: "City break" },
    { f: "LIS", t: "MIL", city: "Milan", price: 16.99, was: 44, tag: "Hot" },
    { f: "DUB", t: "AMS", city: "Amsterdam", price: 24.99, was: 59, tag: "Flash" },
    { f: "VIE", t: "ATH", city: "Athens", price: 29.99, was: 69, tag: "Sun" },
    { f: "PRG", t: "BCN", city: "Barcelona", price: 18.49, was: 47, tag: "Weekend" },
    { f: "CPH", t: "FCO", city: "Rome", price: 27.99, was: 64, tag: "City break" }
  ];
  var grid = document.getElementById("dealsGrid");
  if (grid) {
    DEALS.forEach(function (d) {
      var off = Math.round((1 - d.price / d.was) * 100);
      var card = document.createElement("article");
      card.className = "deal";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.innerHTML =
        '<span class="deal__tag">' + d.tag + " · −" + off + "%</span>" +
        '<div class="deal__route">' + d.f + ' <i>✈</i> ' + d.t + "</div>" +
        '<div class="deal__sub">One way to ' + d.city + " · all taxes in</div>" +
        '<div class="deal__bottom">' +
        '<div class="deal__price">€<span class="down tnum">' + d.price.toFixed(2) + "</span>" +
        "<br><small>was €" + d.was + "</small></div>" +
        '<span class="deal__cta">Book →</span></div>';
      function go() { toast("Selected " + d.f + " → " + d.t + " · €" + d.price.toFixed(2)); }
      card.addEventListener("click", go);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      grid.appendChild(card);
    });
  }

  /* ---------- SMS app form ---------- */
  var smsForm = document.getElementById("smsForm");
  if (smsForm) {
    smsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = document.getElementById("phone").value.trim();
      if (phone.length < 6) { toast("Enter a valid number to get the link"); return; }
      toast("Link sent! Check your texts 📲 (fictional)");
      smsForm.reset();
    });
  }

  /* ---------- Routes map ---------- */
  var ROUTES = {
    BCN: { hub: [110, 200], city: "Barcelona", dests: [
      { code: "FCO", city: "Rome", price: 14.99, xy: [330, 180] },
      { code: "BER", city: "Berlin", price: 26.99, xy: [340, 70] },
      { code: "ATH", city: "Athens", price: 32.99, xy: [440, 220] },
      { code: "AMS", city: "Amsterdam", price: 23.49, xy: [270, 60] }
    ] },
    LON: { hub: [180, 70], city: "London", dests: [
      { code: "BCN", city: "Barcelona", price: 18.99, xy: [110, 210] },
      { code: "FCO", city: "Rome", price: 22.99, xy: [330, 180] },
      { code: "BER", city: "Berlin", price: 19.99, xy: [340, 90] },
      { code: "LIS", city: "Lisbon", price: 24.99, xy: [60, 230] }
    ] },
    BER: { hub: [340, 80], city: "Berlin", dests: [
      { code: "BCN", city: "Barcelona", price: 26.99, xy: [110, 210] },
      { code: "ATH", city: "Athens", price: 29.99, xy: [440, 230] },
      { code: "FCO", city: "Rome", price: 21.49, xy: [330, 190] },
      { code: "AMS", city: "Amsterdam", price: 16.99, xy: [270, 70] }
    ] },
    MAD: { hub: [80, 210], city: "Madrid", dests: [
      { code: "PAR", city: "Paris", price: 21.99, xy: [250, 100] },
      { code: "FCO", city: "Rome", price: 25.99, xy: [330, 180] },
      { code: "LON", city: "London", price: 23.99, xy: [180, 60] },
      { code: "ATH", city: "Athens", price: 34.99, xy: [440, 220] }
    ] }
  };
  var hubBtns = document.querySelectorAll(".hub");
  var mapLines = document.getElementById("mapLines");
  var mapDots = document.getElementById("mapDots");
  var routeList = document.getElementById("routeList");

  function renderHub(code) {
    var data = ROUTES[code];
    if (!data || !mapLines) return;
    mapLines.innerHTML = "";
    mapDots.innerHTML = "";
    routeList.innerHTML = "";
    var hx = data.hub[0], hy = data.hub[1];

    data.dests.forEach(function (dst, i) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", hx); line.setAttribute("y1", hy);
      line.setAttribute("x2", hx); line.setAttribute("y2", hy);
      mapLines.appendChild(line);
      requestAnimationFrame(function () {
        line.style.transition = "all 0.5s ease " + (i * 0.06) + "s";
        line.setAttribute("x2", dst.xy[0]);
        line.setAttribute("y2", dst.xy[1]);
      });
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", dst.xy[0]); dot.setAttribute("cy", dst.xy[1]);
      dot.setAttribute("r", 5); dot.setAttribute("fill", "#e6007e");
      dot.setAttribute("stroke", "#000"); dot.setAttribute("stroke-width", "1.5");
      mapDots.appendChild(dot);

      var li = document.createElement("li");
      li.innerHTML = '<span class="ro-city">' + code + ' <i>✈</i> ' + dst.code +
        ' · ' + dst.city + "</span>" +
        '<span class="ro-price tnum">€' + dst.price.toFixed(2) + "</span>";
      li.addEventListener("click", function () {
        toast(code + " → " + dst.code + " · €" + dst.price.toFixed(2));
      });
      routeList.appendChild(li);
    });

    var hub = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hub.setAttribute("cx", hx); hub.setAttribute("cy", hy);
    hub.setAttribute("r", 8); hub.setAttribute("fill", "#ffd400");
    hub.setAttribute("stroke", "#000"); hub.setAttribute("stroke-width", "2.5");
    mapDots.appendChild(hub);
  }

  hubBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hubBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderHub(btn.getAttribute("data-hub"));
    });
  });
  renderHub("BCN");

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }
})();
