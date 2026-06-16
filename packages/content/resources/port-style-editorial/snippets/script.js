(function () {
  "use strict";

  var EMAIL = "hello@mayaokafor.studio";

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
    }, 2600);
  }

  /* ---------- Copy email to clipboard ---------- */
  function copyEmail(btn, restoreLabelEl) {
    var done = function () {
      btn.classList.add("is-copied");
      toast("Copied " + EMAIL + " to your clipboard.");
      var original = restoreLabelEl ? restoreLabelEl.textContent : null;
      if (restoreLabelEl) restoreLabelEl.textContent = "Copied ✓";
      setTimeout(function () {
        btn.classList.remove("is-copied");
        if (restoreLabelEl && original) restoreLabelEl.textContent = original;
      }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
    } else {
      fallback();
    }

    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = EMAIL;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (e) {
        toast("Write to " + EMAIL);
      }
    }
  }

  var copyBtn1 = document.getElementById("copy-email");
  if (copyBtn1) {
    copyBtn1.addEventListener("click", function () {
      copyEmail(copyBtn1, null);
    });
  }
  var copyBtn2 = document.getElementById("copy-email-2");
  var copyLabel = document.getElementById("copy-email-label");
  if (copyBtn2) {
    copyBtn2.addEventListener("click", function () {
      copyEmail(copyBtn2, copyLabel);
    });
  }

  /* ---------- Work filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var articles = Array.prototype.slice.call(document.querySelectorAll(".article[data-cat]"));
  var emptyEl = document.getElementById("work-empty");
  var resetBtn = document.getElementById("reset-filter");

  function applyFilter(filter) {
    var visible = 0;
    articles.forEach(function (a) {
      var match = filter === "all" || a.getAttribute("data-cat") === filter;
      a.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filter") === filter;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (emptyEl) emptyEl.hidden = visible !== 0;

    var label = filter === "all" ? "all works" : filter + " works";
    toast(
      visible === 0
        ? "No works filed under " + filter + "."
        : "Showing " + visible + " " + label + "."
    );
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      applyFilter(c.getAttribute("data-filter"));
    });
  });
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      applyFilter("all");
    });
  }

  /* Make article rows keyboard-activatable (Enter/Space -> toast title) */
  articles.forEach(function (a) {
    a.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var t = a.querySelector(".article__title");
        if (t) toast("Read more: " + t.textContent.trim());
      }
    });
  });

  /* ---------- Scroll-spy nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".masthead__nav a[href^='#']"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-current");
            });
            var target = entry.target.getAttribute("id");
            var match = sections.filter(function (s) {
              return s.el.getAttribute("id") === target;
            })[0];
            if (match) match.link.classList.add("is-current");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s.el);
    });
  }

  /* ---------- Issue date + year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var issueEl = document.getElementById("issue-date");
  if (issueEl) {
    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var now = new Date();
    issueEl.textContent = months[now.getMonth()] + " " + now.getFullYear();
  }
})();
