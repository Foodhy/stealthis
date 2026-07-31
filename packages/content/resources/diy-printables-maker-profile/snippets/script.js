(function () {
  "use strict";

  /* ---------------- toast helper ---------------- */
  var toastHost = document.getElementById("toasts");
  function toast(msg, variant) {
    var el = document.createElement("div");
    el.className = "toast" + (variant ? " " + variant : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 240);
    }, 2800);
  }

  var nf = new Intl.NumberFormat("en-US");

  /* ---------------- follow toggle ---------------- */
  var BASE_FOLLOWERS = 12408;
  var followBtn = document.getElementById("followBtn");
  var followLabel = document.getElementById("followLabel");
  var followerCount = document.getElementById("followerCount");
  var following = false;

  function renderFollowers() {
    followerCount.textContent = nf.format(BASE_FOLLOWERS + (following ? 1 : 0)) + " followers";
  }

  followBtn.addEventListener("click", function () {
    following = !following;
    followBtn.setAttribute("aria-pressed", String(following));
    followLabel.textContent = following ? "Following" : "Follow";
    followBtn.querySelector(".btn-ico").textContent = following ? "✓" : "+";
    renderFollowers();
    toast(following ? "Following nozzlecraft — new models will appear in your feed." : "Unfollowed nozzlecraft.", following ? "" : "cy");
  });
  renderFollowers();

  /* ---------------- share ---------------- */
  document.getElementById("shareBtn").addEventListener("click", function () {
    var link = "spoolyard.example/@nozzlecraft";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () { toast("Profile link copied: " + link, "cy"); },
        function () { toast("Profile link: " + link, "cy"); }
      );
    } else {
      toast("Profile link: " + link, "cy");
    }
  });

  /* ---------------- tips ---------------- */
  var tipAmount = 5;
  var tipButtons = Array.prototype.slice.call(document.querySelectorAll(".tip"));
  tipButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tipButtons.forEach(function (b) { b.classList.remove("is-sel"); b.removeAttribute("aria-pressed"); });
      btn.classList.add("is-sel");
      btn.setAttribute("aria-pressed", "true");
      tipAmount = Number(btn.dataset.amt);
    });
  });
  function sendTip() {
    toast("Thanks! A €" + tipAmount + " tip is on its way to nozzlecraft.");
  }
  document.getElementById("tipSend").addEventListener("click", sendTip);
  document.getElementById("tipBtn").addEventListener("click", function () {
    document.querySelector(".support").scrollIntoView({ behavior: "smooth", block: "center" });
    sendTip();
  });

  /* ---------------- tabs ---------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var sortWrap = document.getElementById("sortWrap");

  function activate(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var pane = document.getElementById(t.getAttribute("aria-controls"));
      pane.classList.toggle("is-active", on);
      pane.hidden = !on;
    });
    sortWrap.style.visibility = tab.id === "tab-models" ? "visible" : "hidden";
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(tab); });
    tab.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) {
        e.preventDefault();
        activate(tabs[(i + d + tabs.length) % tabs.length], true);
      } else if (e.key === "Home") {
        e.preventDefault(); activate(tabs[0], true);
      } else if (e.key === "End") {
        e.preventDefault(); activate(tabs[tabs.length - 1], true);
      }
    });
  });

  /* ---------------- sorting ---------------- */
  var grid = document.getElementById("modelGrid");
  var sortSel = document.getElementById("sortSel");
  sortSel.addEventListener("change", function () {
    var mode = sortSel.value;
    var tiles = Array.prototype.slice.call(grid.children);
    tiles.sort(function (a, b) {
      if (mode === "recent") return Number(b.dataset.date) - Number(a.dataset.date);
      if (mode === "downloads") return Number(b.dataset.dl) - Number(a.dataset.dl);
      if (mode === "fastest") return Number(a.dataset.time) - Number(b.dataset.time);
      return Number(b.dataset.pop) - Number(a.dataset.pop);
    });
    tiles.forEach(function (t) { grid.appendChild(t); });
    toast("Sorted by " + sortSel.options[sortSel.selectedIndex].text.toLowerCase() + ".", "cy");
  });

  /* ---------------- likes ---------------- */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".like");
    if (!btn) return;
    var span = btn.querySelector("span");
    var n = Number(span.textContent.replace(/,/g, ""));
    var on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!on));
    span.textContent = nf.format(on ? n - 1 : n + 1);
    if (!on) {
      btn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.24)" }, { transform: "scale(1)" }],
        { duration: 280, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
    }
  });

  /* ---------------- load more ---------------- */
  var loadMore = document.getElementById("loadMore");
  var loaded = false;
  loadMore.addEventListener("click", function () {
    if (loaded) { toast("You have reached the end of this maker's catalogue."); return; }
    loaded = true;
    loadMore.textContent = "Loading…";
    setTimeout(function () {
      var extras = [
        ["Tolerance Test Comb", "3,204", "21,880", "22m", 55, 20260410, 21880, 22],
        ["Magnetic Tool Wall Tiles", "5,610", "74,300", "3h 05m", 78, 20260318, 74300, 185],
        ["TPU Foot Damper Set", "1,987", "29,455", "55m", 61, 20260226, 29455, 55]
      ];
      extras.forEach(function (x) {
        var art = document.createElement("article");
        art.className = "tile";
        art.dataset.pop = x[4]; art.dataset.date = x[5]; art.dataset.dl = x[6]; art.dataset.time = x[7];
        art.innerHTML =
          '<div class="render"><svg viewBox="0 0 200 140" aria-hidden="true"><g transform="translate(100 76)">' +
          '<path d="M0-32 46-6 0 20-46-6z" fill="#22c8d8" opacity=".18"/>' +
          '<path d="M-46-6 0 20v20L-46 14z" fill="#ff7a1a" opacity=".5"/>' +
          '<path d="M46-6 0 20v20L46 14z" fill="#ff7a1a" opacity=".8"/>' +
          '<path d="M0-32 46-6 0 20-46-6z" fill="none" stroke="#22c8d8" stroke-width="1.4"/>' +
          '</g></svg><span class="badge-time mono">' + x[3] + "</span></div>" +
          '<div class="tile-body"><h3>' + x[0] + '</h3><p class="tile-sub mono">STL · 3MF</p>' +
          '<div class="tile-stats mono"><button class="like" aria-pressed="false" aria-label="Like ' + x[0] + '">♥ <span>' + x[1] + "</span></button>" +
          "<span>↓ " + x[2] + "</span></div></div>";
        grid.appendChild(art);
      });
      loadMore.textContent = "That's everything for now";
      toast("Loaded 3 more models (" + grid.children.length + " shown).", "cy");
    }, 520);
  });

  /* ---------------- badge tooltips ---------------- */
  var tip = document.getElementById("tooltip");
  function showTip(el) {
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    var t = tip.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
    var top = r.top - t.height - 10;
    if (top < 8) top = r.bottom + 10;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hideTip() { tip.hidden = true; }

  document.querySelectorAll(".badge").forEach(function (b) {
    b.addEventListener("mouseenter", function () { showTip(b); });
    b.addEventListener("mouseleave", hideTip);
    b.addEventListener("focus", function () { showTip(b); });
    b.addEventListener("blur", hideTip);
    b.addEventListener("click", function () { toast(b.dataset.tip, b.classList.contains("locked") ? "cy" : ""); });
  });
  window.addEventListener("scroll", hideTip, { passive: true });

  /* ---------------- reveal on scroll ---------------- */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
          { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)", fill: "both" }
        );
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".tile, .make, .folder, .card").forEach(function (el) { io.observe(el); });
  }
})();
