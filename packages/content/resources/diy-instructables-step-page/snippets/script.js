(function () {
  "use strict";

  /* ---------- toast ---------- */
  var host = document.getElementById("toasts");
  function toast(msg, kind) {
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("in"); });
    setTimeout(function () {
      el.classList.remove("in");
      setTimeout(function () { el.remove(); }, 260);
    }, 2600);
  }

  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.dataset.toast); });
  });

  /* ---------- follow ---------- */
  var follow = document.getElementById("followBtn");
  if (follow) {
    follow.addEventListener("click", function () {
      var on = follow.getAttribute("aria-pressed") === "true";
      follow.setAttribute("aria-pressed", String(!on));
      follow.textContent = on ? "Follow" : "Following";
      toast(on ? "Unfollowed Rin Halvorsen." : "Following Rin Halvorsen — new builds land in your feed.", on ? null : "ok");
    });
  }

  /* ---------- favorite ---------- */
  var fav = document.getElementById("favBtn");
  if (fav) {
    fav.addEventListener("click", function () {
      var on = fav.getAttribute("aria-pressed") === "true";
      fav.setAttribute("aria-pressed", String(!on));
      fav.querySelector(".lbl").textContent = on ? "Favorite" : "Favorited";
      toast(on ? "Removed from favorites." : "Added to your favorites.", on ? null : "hi");
    });
  }

  /* ---------- supplies checklist ---------- */
  var list = document.getElementById("supplyList");
  var count = document.getElementById("suppliesCount");
  if (list && count) {
    var boxes = Array.prototype.slice.call(list.querySelectorAll("input[type=checkbox]"));
    var sync = function (announce) {
      var got = boxes.filter(function (b) { return b.checked; }).length;
      count.textContent = got + " / " + boxes.length + " gathered";
      if (announce && got === boxes.length) toast("Full kit gathered — time to cut.", "ok");
    };
    boxes.forEach(function (b) {
      b.addEventListener("change", function () {
        b.closest("li").classList.toggle("is-got", b.checked);
        sync(true);
      });
    });
    sync(false);
  }

  /* ---------- thumbs ---------- */
  document.querySelectorAll(".thumbs").forEach(function (grp) {
    var btns = Array.prototype.slice.call(grp.querySelectorAll("button"));
    btns.forEach(function (btn) {
      var c = btn.querySelector(".c");
      var base = parseInt(c.textContent.replace(/\D/g, ""), 10) || 0;
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") === "true";
        btns.forEach(function (o) {
          if (o !== btn && o.getAttribute("aria-pressed") === "true") {
            o.setAttribute("aria-pressed", "false");
            var oc = o.querySelector(".c");
            oc.textContent = String(parseInt(oc.textContent, 10) - 1);
          }
        });
        btn.setAttribute("aria-pressed", String(!on));
        c.textContent = String(on ? base : base + 1);
        if (!on) toast(btn.dataset.vote === "up" ? "Thanks — marked this step as helpful." : "Noted. The author sees this feedback.");
      });
    });
  });

  /* ---------- chapter navigator ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("#railList a"));
  var chapters = links.map(function (a) { return document.getElementById(a.dataset.target); }).filter(Boolean);
  var current = 0;

  var bar = document.getElementById("railBar");
  var pct = document.getElementById("railPct");
  var now = document.getElementById("sbNow");
  var prev = document.getElementById("prevCh");
  var next = document.getElementById("nextCh");

  function setActive(i) {
    if (i < 0 || i >= chapters.length) return;
    current = i;
    links.forEach(function (a, n) {
      a.classList.toggle("is-active", n === i);
      a.classList.toggle("is-done", n < i);
      if (n === i) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    var p = Math.round(((i + 1) / chapters.length) * 100);
    if (bar) bar.style.width = p + "%";
    if (pct) pct.textContent = p + "% read";
    if (now) now.textContent = links[i].textContent.trim().replace(/\s+/g, " ");
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === chapters.length - 1;

    var active = links[i];
    if (active && active.parentElement && window.innerWidth <= 1000) {
      active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }

  if (chapters.length) {
    if ("IntersectionObserver" in window) {
      var visible = new Map();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0); });
        var bestId = null, best = 0;
        visible.forEach(function (v, k) { if (v > best) { best = v; bestId = k; } });
        if (bestId) {
          var idx = chapters.findIndex(function (c) { return c.id === bestId; });
          if (idx > -1 && idx !== current) setActive(idx);
        }
      }, { rootMargin: "-84px 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.75, 1] });
      chapters.forEach(function (c) { io.observe(c); });
    }
    setActive(0);
  }

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      chapters[i].scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(i);
      history.replaceState(null, "", "#" + chapters[i].id);
    });
  });

  function go(delta) {
    var i = Math.min(chapters.length - 1, Math.max(0, current + delta));
    if (i === current) return;
    chapters[i].scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(i);
  }
  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });

  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.key === "ArrowDown") { e.preventDefault(); go(1); }
    if (e.altKey && e.key === "ArrowUp") { e.preventDefault(); go(-1); }
  });

  /* ---------- post your make ---------- */
  var post = document.getElementById("postMake");
  var makes = document.getElementById("makeCount");
  if (post) {
    post.addEventListener("click", function () {
      if (makes) {
        var n = parseInt(makes.textContent.replace(/\D/g, ""), 10) + 1;
        makes.textContent = n.toLocaleString("en-US");
      }
      toast("Draft started — add photos and a note about what you changed.", "hi");
    });
  }
})();
