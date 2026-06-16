// Thornbury Heritage Museum — landing interactions (vanilla JS)
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 320);
    }, 2800);
  }

  // Any element with data-toast triggers a toast
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  /* ---------- Opening-hours flag (Tue–Sun, 10–17) ---------- */
  (function () {
    var flag = document.getElementById("openFlag");
    if (!flag) return;
    var now = new Date();
    var day = now.getDay(); // 0 Sun .. 6 Sat
    var hour = now.getHours();
    var openDay = day !== 1; // closed Mondays
    var openHour = hour >= 10 && hour < 17;
    if (openDay && openHour) {
      flag.textContent = "Open now · until 17:00";
      flag.className = "open-flag is-open";
    } else {
      flag.textContent = openDay ? "Closed · opens 10:00" : "Closed Mondays";
      flag.className = "open-flag is-closed";
    }
  })();

  /* ---------- Mobile nav ---------- */
  (function () {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileNav");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      }
    });
  })();

  /* ---------- Gallery filtering ---------- */
  (function () {
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".gcard"));
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        var f = chip.getAttribute("data-filter");
        var shown = 0;
        cards.forEach(function (card) {
          var match = f === "all" ||
            card.getAttribute("data-floor") === f ||
            card.getAttribute("data-theme") === f;
          card.classList.toggle("is-hidden", !match);
          if (match) shown++;
        });
        toast(shown + (shown === 1 ? " gallery" : " galleries") + " shown");
      });
    });
  })();

  /* ---------- Timeline tabs ---------- */
  (function () {
    var eras = [
      {
        ref: "Gallery VII", year: "c.1600", tag: "The valley before the mills",
        title: "The Drovers' Road",
        body: "Long before chimneys, the valley was a thoroughfare for cattle drovers crossing to the lowland fairs. A worn waystone, two toll tokens and a drover's horn survive — the earliest objects in the collection, gathered from a hedge bank in 1903."
      },
      {
        ref: "Gallery I", year: "1740–1860", tag: "Industry arrives",
        title: "The Mill Years",
        body: "Water power turned Thornbury into a worsted town. The Thornbury Worsted Company employed three hundred hands at its height. Our ledgers record wages to the half-penny, and the carding combs still smell faintly of lanolin."
      },
      {
        ref: "Gallery VI", year: "1843", tag: "Catastrophe & memory",
        title: "The Great Flood",
        body: "In the spring of 1843 the river rose nine feet in a night. Eleven were lost; the church bell was carried half a mile downstream and recovered from a meadow. High-water marks on the gallery wall are taken from the surviving cottages."
      },
      {
        ref: "Gallery III", year: "1861", tag: "Connection",
        title: "Railway & Reform",
        body: "The branch line opened in 1861, and with it came newspapers, a reading society, and the first elected parish board. The stationmaster's lamp and the original timetable board anchor the gallery."
      },
      {
        ref: "Gallery V", year: "1900–1945", tag: "In their own words",
        title: "Voices of the Valley",
        body: "Two world wars are remembered here not through generals but through letters home, ration books, and the recorded voices of those who stayed. The listening room plays 340 interviews gathered between 1971 and 1989."
      },
      {
        ref: "Gallery IX", year: "1946–1979", tag: "After the mills",
        title: "Rebuilding",
        body: "The last mill closed in 1962. This gallery follows the valley's reinvention — the cooperative dairy, the comprehensive school, and the founding of this very museum by public subscription in 1881, refurbished after the war."
      }
    ];

    var rail = document.getElementById("timelineRail");
    var panel = document.getElementById("timelinePanel");
    if (!rail || !panel) return;
    var buttons = Array.prototype.slice.call(rail.querySelectorAll(".era"));

    function render(i) {
      var e = eras[i];
      panel.innerHTML =
        '<span class="badge">' + e.ref + '</span>' +
        '<span class="tl-year">' + e.year + '</span>' +
        '<h3>' + e.title + '</h3>' +
        '<p>' + e.body + '</p>' +
        '<p class="tl-tag">' + e.tag + '</p>';
    }

    function select(i, focus) {
      buttons.forEach(function (b, j) {
        var on = j === i;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      render(i);
      if (focus) buttons[i].focus();
    }

    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (ev) {
        var n;
        if (ev.key === "ArrowDown" || ev.key === "ArrowRight") n = (i + 1) % buttons.length;
        else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") n = (i - 1 + buttons.length) % buttons.length;
        else if (ev.key === "Home") n = 0;
        else if (ev.key === "End") n = buttons.length - 1;
        if (n != null) { ev.preventDefault(); select(n, true); }
      });
    });

    select(0);
  })();

  /* ---------- Gallery card keyboard activation ---------- */
  (function () {
    document.querySelectorAll(".gcard").forEach(function (card) {
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
      card.addEventListener("click", function () {
        var name = card.querySelector("h3");
        if (name) toast("Opening “" + name.textContent + "” — in the real museum this would load the gallery guide.");
      });
    });
  })();

  /* ---------- Archive search ---------- */
  (function () {
    var form = document.getElementById("archiveForm");
    var input = document.getElementById("archiveInput");
    var results = document.getElementById("archiveResults");
    if (!form || !input || !results) return;

    var records = [
      { ref: "THM/OH/118", title: "Edith Marsden, weaver — oral history", terms: ["edith", "marsden", "weaver", "mill", "oral", "voice"] },
      { ref: "THM/LED/04", title: "Thornbury Worsted Co. wage ledger, 1849", terms: ["ledger", "mill", "wage", "1849", "worsted", "company"] },
      { ref: "THM/HART/22", title: "Hartley family letters, 1861–1894", terms: ["hartley", "letter", "1861", "1894", "family"] },
      { ref: "THM/FLD/07", title: "Account of the Great Flood, 1843", terms: ["flood", "1843", "river", "bell"] },
      { ref: "THM/PHO/210", title: "Photograph: the branch line opening, 1861", terms: ["railway", "1861", "photograph", "station", "branch"] },
      { ref: "THM/PAR/01", title: "Parish register of baptisms, 1600–1740", terms: ["parish", "register", "1600", "baptism", "drover"] }
    ];

    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      return records.filter(function (r) {
        if (r.title.toLowerCase().indexOf(q) !== -1) return true;
        return r.terms.some(function (t) { return t.indexOf(q) !== -1; });
      });
    }

    function show(q) {
      var hits = search(q);
      results.innerHTML = "";
      if (!q.trim()) { return; }
      if (!hits.length) {
        var empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No records for “" + q.trim() + "”. Try a name, a year, or a place.";
        results.appendChild(empty);
        return;
      }
      hits.forEach(function (h) {
        var row = document.createElement("div");
        row.className = "hit";
        row.innerHTML = '<span class="ref">' + h.ref + '</span><span><strong>' + h.title + '</strong></span>';
        results.appendChild(row);
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hits = search(input.value);
      show(input.value);
      if (input.value.trim()) {
        toast(hits.length ? hits.length + " record" + (hits.length === 1 ? "" : "s") + " found in the archive" : "Nothing found — try another term");
      }
    });
    var debounce;
    input.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { show(input.value); }, 220);
    });
  })();

  /* ---------- Membership form ---------- */
  (function () {
    var form = document.getElementById("joinForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.querySelector("input");
      if (email && email.value) {
        toast("Welcome to the Friends — a welcome letter is on its way.");
        form.reset();
      }
    });
  })();
})();
