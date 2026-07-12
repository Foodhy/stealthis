(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Smooth scroll from hero ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Running timecode ---------- */
  var tcEl = document.getElementById("timecode");
  var frame = 0;
  function pad(n) { return String(n).padStart(2, "0"); }
  setInterval(function () {
    frame = (frame + 1) % 24;
    var totalSec = Math.floor(Date.now() / 1000) % 86400;
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    tcEl.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(frame);
  }, 1000 / 24);

  /* ---------- Services filter ---------- */
  var filterChips = document.querySelectorAll(".filters .chip");
  var svcItems = document.querySelectorAll("#svcList .svc");
  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      filterChips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.dataset.filter;
      svcItems.forEach(function (item) {
        var show = f === "all" || item.dataset.cat === f;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Gear rail (scroll to group) ---------- */
  var railChips = document.querySelectorAll(".rail .chip");
  railChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      railChips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var group = chip.dataset.rail;
      var card = document.querySelector('.gcard[data-group="' + group + '"]');
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("flash");
        setTimeout(function () { card.classList.remove("flash"); }, 900);
      }
    });
  });

  /* ---------- Gear pointer tilt ---------- */
  document.querySelectorAll(".gcard").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        "perspective(700px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" +
        (px * 6).toFixed(2) + "deg) translateY(-3px)";
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  });

  /* ---------- Quote state ---------- */
  var quote = []; // { name, price, btn }
  var quoteList = document.getElementById("quoteList");
  var quoteTotal = document.getElementById("quoteTotal");
  var fabCount = document.getElementById("fabCount");
  var drawer = document.getElementById("drawer");
  var fab = document.getElementById("fab");

  function money(n) { return "$" + n.toLocaleString("en-US"); }

  function render() {
    fabCount.textContent = quote.length;
    fab.setAttribute("aria-expanded", drawer.classList.contains("open"));
    if (quote.length === 0) {
      quoteList.innerHTML = '<li class="quote-empty">No services yet — add one to build your day rate.</li>';
      quoteTotal.textContent = "$0";
      return;
    }
    quoteList.innerHTML = "";
    var total = 0;
    quote.forEach(function (q, i) {
      total += q.price;
      var li = document.createElement("li");
      li.className = "quote-item";
      li.innerHTML =
        '<span class="qname">' + q.name + '</span>' +
        '<span class="qprice">' + money(q.price) + "</span>";
      var rm = document.createElement("button");
      rm.className = "qrm";
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + q.name);
      rm.textContent = "✕";
      rm.addEventListener("click", function () { removeAt(i); });
      li.appendChild(rm);
      quoteList.appendChild(li);
    });
    quoteTotal.textContent = money(total);
  }

  function removeAt(i) {
    var q = quote[i];
    if (q && q.btn) {
      q.btn.classList.remove("is-added");
      q.btn.setAttribute("aria-pressed", "false");
      q.btn.textContent = "Add";
    }
    quote.splice(i, 1);
    render();
  }

  document.querySelectorAll(".add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.dataset.name;
      var price = parseInt(btn.dataset.price, 10);
      var idx = quote.findIndex(function (q) { return q.btn === btn; });
      if (idx >= 0) {
        removeAt(idx);
        toast(name + " removed from quote");
        return;
      }
      quote.push({ name: name, price: price, btn: btn });
      btn.classList.add("is-added");
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Added ✓";
      render();
      toast(name + " added — " + money(price) + "/day");
    });
  });

  /* ---------- Drawer open/close ---------- */
  function openDrawer() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");
  }
  fab.addEventListener("click", function () {
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  document.getElementById("requestBtn").addEventListener("click", function () {
    if (quote.length === 0) {
      toast("Add a service to request a booking");
      return;
    }
    toast("Booking request sent for " + quote.length + " service" + (quote.length > 1 ? "s" : ""));
    closeDrawer();
  });

  render();
})();
