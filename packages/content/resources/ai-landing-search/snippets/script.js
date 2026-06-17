(function () {
  "use strict";

  /* ---------------- toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------- sticky nav shadow ---------------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile menu ---------------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- scroll reveal ---------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- CTA buttons -> toast ---------------- */
  document.querySelectorAll("[data-cta]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Demo only — " + btn.getAttribute("data-cta") + " is illustrative.");
    });
  });

  /* ---------------- pricing toggle ---------------- */
  var billing = document.getElementById("billingToggle");
  var lblM = document.getElementById("lblMonthly");
  var lblA = document.getElementById("lblAnnual");
  if (billing) {
    billing.addEventListener("click", function () {
      var annual = billing.getAttribute("aria-checked") !== "true";
      billing.setAttribute("aria-checked", String(annual));
      lblM.classList.toggle("is-active", !annual);
      lblA.classList.toggle("is-active", annual);
      document.querySelectorAll(".amount[data-monthly]").forEach(function (el) {
        el.textContent = annual ? el.getAttribute("data-annual") : el.getAttribute("data-monthly");
      });
    });
  }

  /* ---------------- waitlist form ---------------- */
  var wl = document.getElementById("waitlistForm");
  if (wl) {
    wl.addEventListener("submit", function (e) {
      e.preventDefault();
      toast("Thanks! You're on the list (demo).");
      wl.reset();
    });
  }

  /* ---------------- hero search -> animated cited answer ---------------- */
  var ANSWERS = {
    default: {
      body: "Rooftop solar generates electricity during daylight, while a home battery stores surplus for use after sunset or during outages.|0| Pairing the two lets a typical household self-supply 70–90% of its annual demand,|1| though the battery adds the larger share of the upfront cost.|2|",
      sources: [
        { host: "nrel.gov", title: "Residential PV + storage performance study" },
        { host: "energysage.com", title: "Solar-plus-storage self-consumption rates" },
        { host: "iea.org", title: "Cost breakdown: home solar vs. batteries" }
      ]
    },
    fasting: {
      body: "Intermittent fasting can modestly improve insulin sensitivity and shift the body toward fat oxidation during the fasted window.|0| Most measured weight loss, however, tracks with the overall calorie reduction it tends to cause rather than meal timing itself.|1| Effects on resting metabolic rate appear small over the long term.|2|",
      sources: [
        { host: "nih.gov", title: "Time-restricted eating and insulin response" },
        { host: "nejm.org", title: "Trial: fasting vs. calorie restriction" },
        { host: "cell.com", title: "Metabolic adaptation review" }
      ]
    },
    fourday: {
      body: "Large pilots in the UK and Iceland found that four-day weeks held output roughly steady while cutting burnout and turnover.|0| Productivity gains came mainly from fewer meetings and tighter focus, not longer hours.|1| Results vary by role, and knowledge work benefits more than shift-based work.|2|",
      sources: [
        { host: "autonomy.work", title: "4-Day Week Global pilot results" },
        { host: "hbr.org", title: "Why shorter weeks can raise output" },
        { host: "nature.com", title: "Meta-analysis of work-time reduction" }
      ]
    }
  };

  function pickAnswer(q) {
    var t = (q || "").toLowerCase();
    if (t.indexOf("fast") > -1 || t.indexOf("metabol") > -1) return ANSWERS.fasting;
    if (t.indexOf("four") > -1 || t.indexOf("4-day") > -1 || t.indexOf("work week") > -1) return ANSWERS.fourday;
    return ANSWERS.default;
  }

  // turn "text|0|" markup into HTML with citation chips
  function renderBodyHTML(raw) {
    return raw.replace(/\|(\d+)\|/g, function (_, n) {
      return '<sup class="cite">' + (parseInt(n, 10) + 1) + "</sup>";
    });
  }

  function renderSources(container, sources) {
    container.innerHTML = "";
    sources.forEach(function (s, i) {
      var row = document.createElement("a");
      row.className = "source";
      row.href = "#";
      row.setAttribute("aria-label", "Source " + (i + 1) + ": " + s.host);
      row.innerHTML =
        '<span class="source__n">' + (i + 1) + "</span>" +
        '<span class="source__host">' + s.host + "</span>" +
        '<span class="source__title">— ' + s.title + "</span>";
      row.addEventListener("click", function (e) {
        e.preventDefault();
        toast("Opening source: " + s.host + " (demo)");
      });
      container.appendChild(row);
    });
  }

  var form = document.getElementById("searchForm");
  var input = document.getElementById("searchInput");
  var card = document.getElementById("answerCard");
  var qEl = document.getElementById("answerQ");
  var bodyEl = document.getElementById("answerBody");
  var srcEl = document.getElementById("answerSources");
  var typeTimer;

  function runSearch(q) {
    if (!q) { toast("Type a question to ask Sourcely."); return; }
    var data = pickAnswer(q);
    card.hidden = false;
    qEl.textContent = '"' + q + '"';
    srcEl.innerHTML = "";
    bodyEl.innerHTML = '<span class="answer-card__skeleton">Reading the web…</span>';

    // simulate retrieval delay, then typewriter-reveal the answer
    clearTimeout(typeTimer);
    typeTimer = setTimeout(function () {
      var html = renderBodyHTML(data.body);
      typeReveal(bodyEl, html, function () {
        renderSources(srcEl, data.sources);
      });
    }, 650);

    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // reveal HTML progressively without breaking tags
  function typeReveal(el, html, done) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var full = tmp.childNodes;
    el.innerHTML = "";
    // flatten into tokens: text chars + whole element nodes
    var tokens = [];
    full.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(function (ch) { tokens.push({ t: "ch", v: ch }); });
      } else {
        tokens.push({ t: "el", v: node.cloneNode(true) });
      }
    });
    var i = 0, buf = "";
    (function step() {
      if (i >= tokens.length) { if (done) done(); return; }
      var tk = tokens[i++];
      if (tk.t === "ch") {
        buf += tk.v;
        el.textContent = buf; // safe: plain text so far
        setTimeout(step, 9);
      } else {
        // commit buffered text then append element node
        el.textContent = buf;
        el.appendChild(tk.v);
        buf = ""; // continue with fresh text node appended after
        // re-anchor: subsequent chars append to a new text node
        var anchorBuf = "";
        (function inner() {
          if (i >= tokens.length) { if (done) done(); return; }
          var n = tokens[i];
          if (n.t === "el") { step(); return; }
          i++;
          anchorBuf += n.v;
          // append text after last element
          var lastText = el.lastChild && el.lastChild.nodeType === 3 ? el.lastChild : el.appendChild(document.createTextNode(""));
          if (el.lastChild.nodeType !== 3) { lastText = el.appendChild(document.createTextNode("")); }
          el.lastChild.textContent = anchorBuf;
          setTimeout(inner, 9);
        })();
      }
    })();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      runSearch(input.value.trim());
    });
  }
  document.querySelectorAll("#suggestChips .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      input.value = chip.getAttribute("data-q");
      runSearch(input.value);
    });
  });
  card && card.querySelectorAll(".follow").forEach(function (b) {
    b.addEventListener("click", function () {
      input.value = b.getAttribute("data-q");
      runSearch(input.value);
    });
  });

  /* ---------------- interactive "try a question" tabs ---------------- */
  var TRY = {
    climate: {
      q: "Are EVs actually greener than gas cars?",
      body: "Over their full lifetime, EVs emit roughly 50–70% less CO₂ than comparable petrol cars in most regions, even after accounting for battery manufacturing.|0| The gap widens as grids add renewables, since charging gets cleaner over the car's life.|1| In coal-heavy grids the advantage shrinks but generally remains positive.|2|",
      sources: [
        { host: "icct.org", title: "Lifecycle GHG of passenger cars" },
        { host: "iea.org", title: "Global EV outlook: grid effects" },
        { host: "mit.edu", title: "Carbon Counter methodology" }
      ]
    },
    sleep: {
      q: "How much sleep do adults really need?",
      body: "Most adults need 7–9 hours per night, with consistent benefits to memory, mood and immune function in that range.|0| Routinely sleeping under 6 hours is linked to higher cardiovascular and metabolic risk.|1| Individual needs vary, but very short or very long sleep both correlate with worse outcomes.|2|",
      sources: [
        { host: "sleepfoundation.org", title: "Recommended sleep by age" },
        { host: "nih.gov", title: "Short sleep and cardiometabolic risk" },
        { host: "thelancet.com", title: "Sleep duration cohort study" }
      ]
    },
    rates: {
      q: "Why do interest rates affect house prices?",
      body: "Higher interest rates raise mortgage payments, which lowers how much buyers can borrow for the same monthly budget.|0| That reduced borrowing power softens demand, and prices typically cool with a lag of several months.|1| The effect is strongest in markets where most buyers rely on financing.|2|",
      sources: [
        { host: "federalreserve.gov", title: "Monetary policy and housing" },
        { host: "bis.org", title: "Rates and house-price transmission" },
        { host: "economist.com", title: "How rate hikes reach home prices" }
      ]
    }
  };

  var tryBody = document.getElementById("tryBody");
  var tryQ = document.getElementById("tryQ");
  var trySources = document.getElementById("trySources");

  function showTry(key) {
    var d = TRY[key];
    if (!d) return;
    tryQ.textContent = '"' + d.q + '"';
    tryBody.innerHTML = renderBodyHTML(d.body);
    renderSources(trySources, d.sources);
  }

  var tryPrompts = document.querySelectorAll(".try__prompt");
  tryPrompts.forEach(function (p) {
    p.addEventListener("click", function () {
      tryPrompts.forEach(function (o) {
        o.classList.remove("is-active");
        o.setAttribute("aria-selected", "false");
      });
      p.classList.add("is-active");
      p.setAttribute("aria-selected", "true");
      showTry(p.getAttribute("data-key"));
    });
  });
  showTry("climate");
})();
