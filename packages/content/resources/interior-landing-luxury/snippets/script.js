(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- rotating hero statements ---------- */
  var statements = [
    "We design residences that hold light gently and age with grace.",
    "A small atelier, working slowly, on a handful of commissions a year.",
    "Materials chosen for how they will feel in twenty years, not two.",
    "Every room begins with a study of the way the sun crosses it.",
  ];
  var stEl = document.getElementById("statement");
  var stIndex = 0;
  if (stEl) {
    setInterval(function () {
      stIndex = (stIndex + 1) % statements.length;
      stEl.style.opacity = "0";
      setTimeout(function () {
        stEl.textContent = statements[stIndex];
        stEl.style.opacity = "1";
      }, 400);
    }, 4600);
  }

  /* ---------- portfolio filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var countEl = document.getElementById("count");
  var emptyEl = document.getElementById("empty");

  function applyFilter(cat) {
    var visible = 0;
    cards.forEach(function (card, i) {
      var match = cat === "all" || card.getAttribute("data-cat") === cat;
      if (match) {
        card.classList.remove("is-hidden");
        card.classList.add("is-dim");
        visible++;
        // stagger the fade-in
        setTimeout(function () {
          card.classList.remove("is-dim");
        }, 40 + i * 45);
      } else {
        card.classList.add("is-hidden");
      }
    });
    if (countEl) countEl.textContent = String(visible);
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* open a project (demo behaviour) */
  cards.forEach(function (card) {
    function open() {
      var title = card.querySelector(".card__title");
      toast("Opening " + (title ? title.textContent : "project") + " — case study coming soon.");
    }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  /* ---------- testimonials ---------- */
  var quotes = [
    {
      text: "“They read the house before they touched it. What they returned to us feels less designed than remembered.”",
      by: "— Eleanor Vance, Halden House",
    },
    {
      text: "“Restraint is rare in this trade. Maren & Ashford knew exactly what to leave alone.”",
      by: "— Tomas Revell, The Ottoline",
    },
    {
      text: "“Four cabins, one language of walnut and linen. Guests ask who made it, every single time.”",
      by: "— Captain I. Serra, Sirocco 44m",
    },
  ];
  var qText = document.getElementById("quote");
  var qBy = document.getElementById("quote-by");
  var qdots = Array.prototype.slice.call(document.querySelectorAll(".qdot"));
  var qIndex = 0;
  var qTimer;

  function showQuote(i) {
    qIndex = (i + quotes.length) % quotes.length;
    if (qText) qText.style.opacity = "0";
    if (qBy) qBy.style.opacity = "0";
    setTimeout(function () {
      if (qText) { qText.textContent = quotes[qIndex].text; qText.style.opacity = "1"; }
      if (qBy) { qBy.textContent = quotes[qIndex].by; qBy.style.opacity = "1"; }
    }, 380);
    qdots.forEach(function (d, di) {
      d.classList.toggle("is-active", di === qIndex);
      d.setAttribute("aria-selected", di === qIndex ? "true" : "false");
    });
  }
  function startQuotes() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { showQuote(qIndex + 1); }, 5200);
  }
  qdots.forEach(function (d, i) {
    d.addEventListener("click", function () { showQuote(i); startQuotes(); });
  });
  if (qdots.length) startQuotes();

  /* ---------- form validation ---------- */
  var form = document.getElementById("form");
  function setError(name, msg) {
    var field = form.querySelector("#" + name);
    var wrap = field ? field.closest(".field") : null;
    var err = form.querySelector('.err[data-for="' + name + '"]');
    if (wrap) wrap.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var ptype = form.ptype.value;

      if (!name) { setError("name", "Please tell us your name."); ok = false; }
      else setError("name", "");

      var reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) { setError("email", "An email is required."); ok = false; }
      else if (!reEmail.test(email)) { setError("email", "That email doesn't look right."); ok = false; }
      else setError("email", "");

      if (!ptype) { setError("ptype", "Choose a project type."); ok = false; }
      else setError("ptype", "");

      if (!ok) {
        var firstErr = form.querySelector(".has-error input, .has-error select");
        if (firstErr) firstErr.focus();
        return;
      }
      form.reset();
      toast("Thank you, " + name.split(" ")[0] + ". We'll be in touch within two working days.");
    });

    ["name", "email", "ptype"].forEach(function (n) {
      var el = form.querySelector("#" + n);
      if (el) el.addEventListener("input", function () { setError(n, ""); });
      if (el && el.tagName === "SELECT") el.addEventListener("change", function () { setError(n, ""); });
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }
})();
