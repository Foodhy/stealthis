(function () {
  "use strict";

  /* ---------------- toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------------- clipboard helper ---------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---------------- mobile nav ---------------- */
  var menuBtn = document.getElementById("menuBtn");
  var mobileNav = document.getElementById("mobileNav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
      mobileNav.dataset.open = String(!open);
      menuBtn.textContent = open ? "MENU" : "CLOSE";
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName !== "A") return;
      menuBtn.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
      mobileNav.dataset.open = "false";
      menuBtn.textContent = "MENU";
    });
  }

  /* ---------------- reading progress ---------------- */
  var fill = document.getElementById("progressFill");
  var bar = document.getElementById("progressBar");
  var article = document.getElementById("article");
  var ticking = false;

  function updateProgress() {
    ticking = false;
    if (!fill || !article) return;
    var rect = article.getBoundingClientRect();
    var start = rect.top + window.scrollY;
    var total = Math.max(1, article.offsetHeight - window.innerHeight);
    var pct = ((window.scrollY - start) / total) * 100;
    pct = Math.min(100, Math.max(0, pct));
    fill.style.width = pct.toFixed(2) + "%";
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(pct)));
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* ---------------- share row ---------------- */
  var copyLink = document.getElementById("copyLink");
  if (copyLink) {
    copyLink.addEventListener("click", function () {
      copyText(window.location.href || "https://solder-and-smoke.example/log/0417").then(
        function () {
          toast("LINK COPIED TO CLIPBOARD");
        },
        function () {
          toast("COPY BLOCKED BY BROWSER");
        }
      );
    });
  }

  var citeBtn = document.querySelector('[data-share="cite"]');
  if (citeBtn) {
    citeBtn.addEventListener("click", function () {
      var cite =
        'Kovacs, M. "Reverse engineering a $6 thermal printer." Solder & Smoke, Log #0417, 30 Jul 2026.';
      copyText(cite).then(
        function () {
          toast("CITATION COPIED");
        },
        function () {
          toast("COPY BLOCKED BY BROWSER");
        }
      );
    });
  }

  var saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var on = saveBtn.getAttribute("aria-pressed") === "true";
      saveBtn.setAttribute("aria-pressed", String(!on));
      saveBtn.textContent = on ? "SAVE" : "SAVED";
      toast(on ? "REMOVED FROM READING LIST" : "SAVED TO READING LIST");
    });
  }

  /* ---------------- code copy buttons ---------------- */
  document.querySelectorAll(".btn-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-copy"));
      if (!target) return;
      // strip the line-number gutters before copying
      var clone = target.cloneNode(true);
      clone.querySelectorAll(".ln").forEach(function (n) {
        n.remove();
      });
      copyText(clone.textContent.replace(/^\n/, "")).then(
        function () {
          btn.textContent = "COPIED";
          btn.classList.add("done");
          setTimeout(function () {
            btn.textContent = "COPY";
            btn.classList.remove("done");
          }, 1600);
          toast("SNIPPET COPIED");
        },
        function () {
          toast("COPY BLOCKED BY BROWSER");
        }
      );
    });
  });

  /* ---------------- comment votes ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".v-btn") : null;
    if (!btn) return;
    var group = btn.closest(".vote");
    var countEl = group.querySelector(".v-count");
    var base = parseInt(group.dataset.base || countEl.textContent, 10) || 0;
    group.dataset.base = String(base);
    var dir = btn.getAttribute("data-vote");
    var current = group.dataset.state || "none";
    var next = current === dir ? "none" : dir;
    group.dataset.state = next;
    group.querySelectorAll(".v-btn").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-vote") === next);
    });
    var delta = next === "up" ? 1 : next === "down" ? -1 : 0;
    countEl.textContent = String(base + delta);
  });

  /* ---------------- reply buttons ---------------- */
  var textarea = document.getElementById("cText");
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".c-reply") : null;
    if (!btn || !textarea) return;
    var item = btn.closest(".c-item");
    var name = item.querySelector(".c-name");
    var handle = name ? "@" + name.textContent.trim() + " " : "";
    if (textarea.value.indexOf(handle) !== 0) {
      textarea.value = handle + textarea.value;
    }
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    updateCounter();
    toast("REPLYING TO " + (name ? name.textContent.trim().toUpperCase() : "THREAD"));
  });

  /* ---------------- thread collapse ---------------- */
  function setThread(item, collapsed) {
    var toggle = item.querySelector(":scope > .c-body .c-toggle");
    var kids = item.querySelectorAll(":scope > .c-children > .c-item").length;
    item.classList.toggle("collapsed", collapsed);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.textContent =
        (collapsed ? "SHOW " : "HIDE ") + kids + (kids === 1 ? " REPLY" : " REPLIES");
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".c-toggle") : null;
    if (!btn) return;
    var item = btn.closest(".c-item");
    setThread(item, !item.classList.contains("collapsed"));
  });

  var collapseAll = document.getElementById("collapseAll");
  if (collapseAll) {
    collapseAll.addEventListener("click", function () {
      var expanded = collapseAll.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".c-list > .c-item").forEach(function (item) {
        if (item.querySelector(":scope > .c-children")) setThread(item, expanded);
      });
      collapseAll.setAttribute("aria-expanded", String(!expanded));
      collapseAll.textContent = expanded ? "EXPAND REPLIES" : "COLLAPSE REPLIES";
      toast(expanded ? "ALL THREADS COLLAPSED" : "ALL THREADS EXPANDED");
    });
  }

  /* ---------------- composer ---------------- */
  var counter = document.getElementById("counter");
  var form = document.getElementById("composer");
  var list = document.getElementById("cList");
  var countBadge = document.getElementById("cCount");
  var MAX = 480;
  var posted = 0;

  function updateCounter() {
    if (!textarea || !counter) return;
    var n = textarea.value.length;
    counter.textContent = n + " / " + MAX;
    counter.classList.toggle("warn", n > MAX * 0.8 && n < MAX);
    counter.classList.toggle("max", n >= MAX);
  }
  if (textarea) {
    textarea.addEventListener("input", updateCounter);
    updateCounter();
  }

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = (textarea.value || "").trim();
      if (text.length < 3) {
        toast("WRITE SOMETHING FIRST");
        textarea.focus();
        return;
      }
      posted += 1;
      var li = document.createElement("li");
      li.className = "c-item is-new";
      li.innerHTML =
        '<div class="c-body">' +
        '<div class="c-meta"><span class="c-av" aria-hidden="true">YO</span>' +
        '<b class="c-name">you</b><span class="badge badge-staff mono">NEW</span>' +
        '<span class="c-time mono">just now</span></div>' +
        '<p class="c-text">' +
        esc(text) +
        "</p>" +
        '<div class="c-actions">' +
        '<div class="vote" data-vote-group><button class="v-btn" type="button" data-vote="up" aria-label="Upvote">&#9650;</button>' +
        '<span class="v-count mono">1</span>' +
        '<button class="v-btn" type="button" data-vote="down" aria-label="Downvote">&#9660;</button></div>' +
        '<button class="c-reply" type="button">REPLY</button>' +
        "</div></div>";
      list.insertBefore(li, list.firstElementChild);
      textarea.value = "";
      updateCounter();
      if (countBadge) countBadge.textContent = String(6 + posted);
      toast("COMMENT POSTED");
      setTimeout(function () {
        li.classList.remove("is-new");
      }, 2400);
    });
  }

  /* ---------------- TOC via IntersectionObserver ---------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  var targets = links
    .map(function (a) {
      return document.getElementById(a.dataset.toc);
    })
    .filter(Boolean);

  function activate(id) {
    links.forEach(function (a) {
      a.classList.toggle("active", a.dataset.toc === id);
    });
  }

  if (targets.length && "IntersectionObserver" in window) {
    var visible = new Map();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) visible.set(en.target.id, en.boundingClientRect.top);
          else visible.delete(en.target.id);
        });
        if (visible.size) {
          var best = null;
          visible.forEach(function (top, id) {
            if (best === null || top < best.top) best = { id: id, top: top };
          });
          activate(best.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    targets.forEach(function (t) {
      io.observe(t);
    });
    activate(targets[0].id);
  }

  links.forEach(function (a) {
    a.addEventListener("click", function () {
      activate(a.dataset.toc);
    });
  });
})();
