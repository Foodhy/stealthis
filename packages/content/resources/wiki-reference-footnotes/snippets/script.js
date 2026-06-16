(function () {
  "use strict";

  var doc = document;
  var pop = doc.getElementById("citePop");
  var popAuthor = doc.getElementById("popAuthor");
  var popTitle = doc.getElementById("popTitle");
  var popSource = doc.getElementById("popSource");
  var popYear = doc.getElementById("popYear");
  var popJump = doc.getElementById("popJump");
  var popCopy = doc.getElementById("popCopy");
  var toastEl = doc.getElementById("toast");

  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ---------- Citation formatting ---------- */
  function refData(refEl) {
    return {
      author: refEl.getAttribute("data-author") || "",
      title: refEl.getAttribute("data-titletext") || "",
      source: refEl.getAttribute("data-source") || "",
      year: refEl.getAttribute("data-year") || ""
    };
  }
  function formatCitation(d) {
    return d.author + ". " + d.title + ". " + d.source + ", " + d.year + ".";
  }

  function copyText(text, doneMsg) {
    var ok = function () { toast(doneMsg || "Citation copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () { fallback(text, ok); });
    } else {
      fallback(text, ok);
    }
  }
  function fallback(text, ok) {
    var ta = doc.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand("copy"); ok(); } catch (e) { toast("Copy failed"); }
    doc.body.removeChild(ta);
  }

  /* ---------- Back-reference links: build dynamically ---------- */
  // For each citation superscript, register a back-link on its target reference.
  var cites = Array.prototype.slice.call(doc.querySelectorAll("sup.cite"));
  var backsMap = {}; // refId -> array of citeIds
  cites.forEach(function (sup) {
    var refId = sup.getAttribute("data-ref");
    var citeId = sup.id;
    if (!refId) return;
    if (!backsMap[refId]) backsMap[refId] = [];
    if (backsMap[refId].indexOf(citeId) === -1) backsMap[refId].push(citeId);
  });

  Object.keys(backsMap).forEach(function (refId) {
    var refEl = doc.getElementById(refId);
    if (!refEl) return;
    var holder = refEl.querySelector(".ref-backs");
    if (!holder) return;
    holder.innerHTML = "";
    var ids = backsMap[refId];
    ids.forEach(function (citeId, i) {
      var a = doc.createElement("a");
      a.href = "#" + citeId;
      a.setAttribute("data-cite", citeId);
      a.textContent = "↑";
      a.title = "Back to citation";
      a.setAttribute("aria-label", "Back to citation in text" + (ids.length > 1 ? " (" + String.fromCharCode(97 + i) + ")" : ""));
      holder.appendChild(a);
    });
  });

  /* ---------- Highlight helpers ---------- */
  function clearTargets() {
    var prev = doc.querySelectorAll(".cite-target");
    Array.prototype.forEach.call(prev, function (el) { el.classList.remove("cite-target"); });
  }
  function flashAndHighlight(el) {
    clearTargets();
    el.classList.add("cite-target");
    setTimeout(function () { el.classList.remove("cite-target"); el.classList.add("flash"); }, 1100);
    setTimeout(function () { el.classList.remove("flash"); }, 3000);
  }

  function jumpTo(id) {
    var el = doc.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    flashAndHighlight(el);
  }

  /* ---------- Popover ---------- */
  var activeSup = null;
  var hideTimer = null;

  function positionPop(sup) {
    var rect = sup.getBoundingClientRect();
    var popW = pop.offsetWidth;
    var popH = pop.offsetHeight;
    var margin = 8;
    var scrollX = window.pageXOffset;
    var scrollY = window.pageYOffset;

    var left = rect.left + scrollX + rect.width / 2 - popW / 2;
    left = Math.max(scrollX + margin, Math.min(left, scrollX + window.innerWidth - popW - margin));

    var below = false;
    var top = rect.top + scrollY - popH - 10;
    if (top < scrollY + margin) {
      // not enough room above — place below
      top = rect.bottom + scrollY + 10;
      below = true;
    }
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.classList.toggle("below", below);

    // arrow x relative to popover
    var arrowX = rect.left + scrollX + rect.width / 2 - left - 5;
    arrowX = Math.max(12, Math.min(arrowX, popW - 22));
    pop.style.setProperty("--arrow-x", arrowX + "px");
  }

  function showPop(sup) {
    var refId = sup.getAttribute("data-ref");
    var refEl = doc.getElementById(refId);
    if (!refEl) return;
    var d = refData(refEl);

    popAuthor.textContent = d.author;
    popTitle.textContent = d.title;
    popSource.textContent = d.source;
    popYear.textContent = d.year;
    popJump.href = "#" + refId;
    popJump.setAttribute("data-ref", refId);
    popCopy.setAttribute("data-cite-text", formatCitation(d));

    cites.forEach(function (s) { s.classList.remove("cite-active"); });
    sup.classList.add("cite-active");

    pop.hidden = false;
    positionPop(sup);
    activeSup = sup;
  }

  function hidePop() {
    pop.hidden = true;
    if (activeSup) activeSup.classList.remove("cite-active");
    activeSup = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePop, 220);
  }
  function cancelHide() { clearTimeout(hideTimer); }

  cites.forEach(function (sup) {
    sup.addEventListener("mouseenter", function () { cancelHide(); showPop(sup); });
    sup.addEventListener("mouseleave", scheduleHide);
    var link = sup.querySelector("a");
    if (link) {
      link.addEventListener("focus", function () { cancelHide(); showPop(sup); });
      link.addEventListener("blur", scheduleHide);
      link.addEventListener("click", function (e) {
        e.preventDefault();
        hidePop();
        jumpTo(sup.getAttribute("data-ref"));
        history.replaceState(null, "", "#" + sup.getAttribute("data-ref"));
      });
    }
  });

  pop.addEventListener("mouseenter", cancelHide);
  pop.addEventListener("mouseleave", scheduleHide);

  popJump.addEventListener("click", function (e) {
    e.preventDefault();
    var refId = popJump.getAttribute("data-ref");
    hidePop();
    jumpTo(refId);
    history.replaceState(null, "", "#" + refId);
  });

  popCopy.addEventListener("click", function () {
    var text = popCopy.getAttribute("data-cite-text") || "";
    copyText(text, "Citation copied to clipboard");
  });

  // Reposition / close on scroll & resize
  window.addEventListener("scroll", function () {
    if (activeSup) {
      // hide on scroll to avoid drift; reopening is cheap
      hidePop();
    }
  }, { passive: true });
  window.addEventListener("resize", function () { if (activeSup) hidePop(); });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !pop.hidden) hidePop();
  });

  /* ---------- Back-reference clicks (event delegation) ---------- */
  doc.getElementById("ref-list").addEventListener("click", function (e) {
    var back = e.target.closest(".ref-backs a");
    if (back) {
      e.preventDefault();
      var citeId = back.getAttribute("data-cite");
      jumpTo(citeId);
      history.replaceState(null, "", "#" + citeId);
      return;
    }
    var copyBtn = e.target.closest(".ref-copy");
    if (copyBtn) {
      var item = copyBtn.closest(".ref-item");
      var d = refData(item);
      copyText(formatCitation(d), "Reference copied");
      copyBtn.classList.add("done");
      var orig = copyBtn.textContent;
      copyBtn.textContent = "Copied ✓";
      setTimeout(function () { copyBtn.classList.remove("done"); copyBtn.textContent = orig; }, 1600);
    }
  });

  /* ---------- Mobile sidebar drawer ---------- */
  var navToggle = doc.getElementById("navToggle");
  var sidebar = doc.getElementById("sidebar");
  var backdrop = doc.getElementById("backdrop");

  function openNav() {
    sidebar.classList.add("open");
    backdrop.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    sidebar.classList.remove("open");
    backdrop.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) closeNav(); else openNav();
  });
  backdrop.addEventListener("click", closeNav);
  sidebar.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });

  /* ---------- Sidebar + TOC active state on scroll (scrollspy) ---------- */
  var headings = Array.prototype.slice.call(doc.querySelectorAll(".article h2[id], #article"));
  var tocLinks = Array.prototype.slice.call(doc.querySelectorAll(".toc-list a"));
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".sidebar .nav-list a"));

  function setActive(id) {
    tocLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-72px 0px -70% 0px", threshold: 0 });
    headings.forEach(function (h) { io.observe(h); });
  }

  /* ---------- Search focus shortcut ---------- */
  var search = doc.getElementById("kbSearch");
  doc.addEventListener("keydown", function (e) {
    if (e.key === "/" && doc.activeElement !== search && !/^(INPUT|TEXTAREA)$/.test((doc.activeElement || {}).tagName || "")) {
      e.preventDefault();
      search.focus();
    }
  });
  search.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && search.value.trim()) {
      toast('No live index in this demo — searched "' + search.value.trim() + '"');
    }
  });

  /* ---------- Open reference from initial hash ---------- */
  if (location.hash) {
    var target = doc.getElementById(location.hash.slice(1));
    if (target && (target.classList.contains("ref-item") || target.classList.contains("cite"))) {
      setTimeout(function () { flashAndHighlight(target); }, 300);
    }
  }
})();
