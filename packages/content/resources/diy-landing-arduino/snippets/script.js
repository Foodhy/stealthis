(function () {
  "use strict";

  /* ---------- toast ---------- */
  var toasts = document.getElementById("toasts");
  function toast(msg) {
    if (!toasts) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  /* ---------- mega menu (hover + keyboard) ---------- */
  var megaItems = document.querySelectorAll(".nav-item.has-mega");
  megaItems.forEach(function (item) {
    var btn = item.querySelector(".nav-link");
    var panel = document.getElementById(btn.getAttribute("data-mega"));
    var closeTimer;

    function open() {
      clearTimeout(closeTimer);
      panel.hidden = false;
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
    function close(delay) {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        panel.hidden = true;
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }, delay || 0);
    }

    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", function () { close(140); });
    panel.addEventListener("mouseenter", open);
    panel.addEventListener("mouseleave", function () { close(140); });
    btn.addEventListener("click", function () {
      panel.hidden ? open() : close(0);
    });
    item.addEventListener("focusin", open);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { close(0); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target) && !panel.contains(e.target)) close(0);
    });
  });

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.getElementById("mobile-nav");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- carousel ---------- */
  var carousel = document.getElementById("carousel");
  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = Number(btn.getAttribute("data-scroll"));
      var card = carousel.querySelector(".card");
      var step = card ? card.getBoundingClientRect().width + 18 : 300;
      carousel.scrollBy({ left: dir * step * 2, behavior: "smooth" });
    });
  });
  if (carousel) {
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { carousel.scrollBy({ left: 300, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { carousel.scrollBy({ left: -300, behavior: "smooth" }); e.preventDefault(); }
    });
  }

  /* ---------- compare ---------- */
  var MAX = 3;
  var bar = document.getElementById("compareBar");
  var itemsWrap = document.getElementById("compareItems");
  var selected = [];

  function findCard(name) {
    return Array.prototype.find.call(
      document.querySelectorAll(".card"),
      function (c) { return c.getAttribute("data-board") === name; }
    );
  }

  function render() {
    itemsWrap.innerHTML = "";
    selected.forEach(function (item) {
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.innerHTML =
        '<span>' + item.name + '</span><span class="px">$' + item.price + '</span>';
      var x = document.createElement("button");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + item.name + " from compare");
      x.textContent = "×";
      x.addEventListener("click", function () { remove(item.name); });
      pill.appendChild(x);
      itemsWrap.appendChild(pill);
    });

    if (selected.length) {
      bar.hidden = false;
      requestAnimationFrame(function () { bar.classList.add("show"); });
    } else {
      bar.classList.remove("show");
      setTimeout(function () { if (!selected.length) bar.hidden = true; }, 300);
    }
  }

  function remove(name) {
    selected = selected.filter(function (s) { return s.name !== name; });
    var card = findCard(name);
    if (card) {
      card.classList.remove("selected");
      card.querySelector(".cmp-box").checked = false;
    }
    render();
  }

  document.querySelectorAll(".card").forEach(function (card) {
    var box = card.querySelector(".cmp-box");
    var name = card.getAttribute("data-board");
    var price = card.getAttribute("data-price");
    box.addEventListener("change", function () {
      if (box.checked) {
        if (selected.length >= MAX) {
          box.checked = false;
          toast("Compare up to " + MAX + " boards at a time.");
          return;
        }
        selected.push({ name: name, price: price });
        card.classList.add("selected");
      } else {
        selected = selected.filter(function (s) { return s.name !== name; });
        card.classList.remove("selected");
      }
      render();
    });
  });

  var clearBtn = document.getElementById("clearCompare");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    selected.slice().forEach(function (s) { remove(s.name); });
    toast("Compare list cleared.");
  });

  var doBtn = document.getElementById("doCompare");
  if (doBtn) doBtn.addEventListener("click", function () {
    if (selected.length < 2) { toast("Pick at least two boards to compare."); return; }
    toast("Comparing " + selected.map(function (s) { return s.name; }).join(" vs ") + ".");
  });

  /* ---------- animated counters ---------- */
  function format(n, suffix) {
    if (n >= 1000000) return (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M" + suffix;
    if (n >= 10000) return Math.round(n / 1000) + "k" + suffix;
    return n.toLocaleString("en-US") + suffix;
  }
  function countUp(el) {
    var target = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500, start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased), suffix);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- reveal + counters via IntersectionObserver ---------- */
  var revealTargets = document.querySelectorAll(
    ".tile, .card, .tut, .sec-head, .quote, .edu-grid > div, .stat"
  );
  revealTargets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 6) * 60 + "ms";
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        var num = e.target.querySelector && e.target.querySelector("[data-count]");
        if (num && !num.dataset.done) { num.dataset.done = "1"; countUp(num); }
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll("[data-count]").forEach(countUp);
  }

  /* ---------- CTA feedback ---------- */
  document.querySelectorAll(".btn-amber, .btn-teal").forEach(function (b) {
    if (b.id === "doCompare") return;
    b.addEventListener("click", function (e) {
      if (b.getAttribute("href") && b.getAttribute("href").charAt(0) === "#") return;
      e.preventDefault();
      toast("Demo interface — nothing was submitted.");
    });
  });
})();
